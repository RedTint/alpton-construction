#!/usr/bin/env node
'use strict';

/**
 * create-story-file.js
 *
 * Creates a properly formatted story file with YAML frontmatter, related doc
 * links, changelog, and markdown body. Follows the v2 story file standard.
 *
 * Usage:
 *   node .ai-dev/ai-dev-scripts/create-story-file.js \
 *     --epic=007 \
 *     --title="Feature Flag Support" \
 *     --priority=high \
 *     --points=8 \
 *     --uacs='[{"type":"FE","text":"Toggle UI shows feature status"}]' \
 *     --description="As a developer, I want feature flags ..."
 *
 * Options:
 *   --docs-path=<path>      Path to docs directory (default: ./docs)
 *   --epic=<id>             Target epic ID (e.g. 007) — required
 *   --title=<string>        Story title — required
 *   --priority=<level>      high|medium|low (default: medium)
 *   --points=<number>       Story points (default: 5)
 *   --uacs=<json>           JSON array of {type, text} UAC objects
 *   --uacs-file=<path>      Path to JSON file with UAC array
 *   --description=<string>  Free-form description (user story format)
 *   --tags=<csv>            Comma-separated tags
 *   --dependencies=<csv>    Comma-separated dependency story IDs
 *   --version=<string>      Version tag (e.g. v1.7.0)
 *   --status=<string>       pending|in-progress|qa|done|blocked (default: pending)
 *   --completed-at=<iso>    ISO timestamp for done stories (defaults to now if --status=done)
 *   --uac-completed=<n>     Number of UACs already completed (default: 0, auto-set to total if --status=done)
 *   --dry-run               Print file content without writing
 *
 * Output:
 *   Prints STORY_FILE=<path> and STORY_ID=<id> to stdout for workflow parsing.
 *
 * Exit codes:
 *   0  success
 *   1  missing required args or epic not found
 */

const fs   = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { execSync } = require('child_process');

// ─── Constants ────────────────────────────────────────────────────────────────

const DOC_PATTERNS = {
  prd:            /^002-prd-v[\d.]+\.md$/,
  userflows:      /^100-userflows-v[\d.]+\.md$/,
  design_system:  /^125-design-system-v[\d.]+\.md$/,
  frontend:       /^300-frontend-v[\d.]+\.md$/,
  backend:        /^325-backend-v[\d.]+\.md$/,
  api_contract:   /^350-api-contract-v[\d.]+\.md$/,
  database:       /^375-database-schema-v[\d.]+\.md$/,
  testing:        /^400-testing-strategy-v[\d.]+\.md$/,
  devops:         /^425-devops-v[\d.]+\.md$/,
};

// ─── CLI ──────────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const get  = (prefix) => {
    const found = args.find(a => a.startsWith(prefix));
    return found ? found.slice(prefix.length) : null;
  };
  return {
    docsPath:     get('--docs-path=') || './docs',
    epicId:       get('--epic='),
    title:        get('--title='),
    priority:     get('--priority=') || 'medium',
    points:       parseInt(get('--points=') || '5', 10),
    uacs:         get('--uacs='),
    uacsFile:     get('--uacs-file='),
    description:  get('--description='),
    tags:         get('--tags='),
    dependencies: get('--dependencies='),
    version:      get('--version='),
    status:       get('--status=') || 'pending',
    completedAt:  get('--completed-at='),
    uacCompleted: get('--uac-completed='),
    dryRun:       args.includes('--dry-run'),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findLatestDoc(docsPath, pattern) {
  try {
    const files = fs.readdirSync(docsPath).filter(f => pattern.test(f));
    if (files.length === 0) return null;
    files.sort();
    return files[files.length - 1];
  } catch { return null; }
}

function discoverRelatedDocs(docsPath) {
  const result = {};
  for (const [key, pattern] of Object.entries(DOC_PATTERNS)) {
    const found = findLatestDoc(docsPath, pattern);
    if (found) result[key] = `docs/${found}`;
  }
  return result;
}

function slugify(str, maxLen = 60) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLen);
}

/**
 * Find the next story number for a given epic.
 */
function findNextStoryNumber(epicDirPath) {
  const statusDirs = ['pending', 'in-progress', 'qa', 'done', 'blocked'];
  let maxNum = 0;

  for (const sd of statusDirs) {
    const sdPath = path.join(epicDirPath, sd);
    if (!fs.existsSync(sdPath)) continue;

    const files = fs.readdirSync(sdPath).filter(f => f.endsWith('.md'));
    for (const file of files) {
      // Pattern: {epicId}-{storyNum}-{slug}.md
      const match = file.match(/^\d{3}-(\d+)-/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
  }

  // Also check bugs/
  const bugsPath = path.join(epicDirPath, 'bugs');
  if (fs.existsSync(bugsPath)) {
    const bugFiles = fs.readdirSync(bugsPath).filter(f => f.endsWith('.md'));
    for (const file of bugFiles) {
      const match = file.match(/^\d{3}-(\d+)-/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
  }

  return maxNum + 1;
}

/**
 * Parse UACs from JSON string or file.
 */
function parseUACs(uacsStr, uacsFile) {
  if (uacsFile) {
    try {
      return JSON.parse(fs.readFileSync(uacsFile, 'utf-8'));
    } catch (err) {
      process.stderr.write(`Error reading UACs file: ${err.message}\n`);
      process.exit(1);
    }
  }
  if (uacsStr) {
    try {
      return JSON.parse(uacsStr);
    } catch (err) {
      process.stderr.write(`Error parsing UACs JSON: ${err.message}\n`);
      process.exit(1);
    }
  }
  return [];
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const opts = parseArgs();

  // Validate required args
  if (!opts.epicId) {
    process.stderr.write('Error: --epic=<id> is required\n');
    process.exit(1);
  }
  if (!opts.title) {
    process.stderr.write('Error: --title=<string> is required\n');
    process.exit(1);
  }

  const epicsPath = path.resolve(opts.docsPath, 'epics');
  if (!fs.existsSync(epicsPath)) {
    process.stderr.write(`Error: docs/epics/ not found at ${epicsPath}\n`);
    process.exit(1);
  }

  // Find epic directory
  const epicDirs = fs.readdirSync(epicsPath)
    .filter(d => d.startsWith(opts.epicId) && fs.statSync(path.join(epicsPath, d)).isDirectory())
    .sort();

  if (epicDirs.length === 0) {
    process.stderr.write(`Error: No epic directory found for epic ${opts.epicId}\n`);
    process.exit(1);
  }

  const epicDir = epicDirs[0];
  const epicDirPath = path.join(epicsPath, epicDir);

  // Read epic metadata
  const epicMdPath = path.join(epicDirPath, 'epic.md');
  let epicName = epicDir;
  let epicVersion = opts.version || 'v1.0.0';
  if (fs.existsSync(epicMdPath)) {
    const { data } = matter(fs.readFileSync(epicMdPath, 'utf-8'));
    epicName = data.epic_name || epicDir;
    epicVersion = opts.version || data.epic_version || 'v1.0.0';
  }

  // Parse UACs
  const uacs = parseUACs(opts.uacs, opts.uacsFile);
  const uacByType = { fe: 0, be: 0, db: 0, devops: 0, cli: 0, test: 0 };
  for (const uac of uacs) {
    const key = (uac.type || '').toLowerCase();
    if (key in uacByType) uacByType[key]++;
  }
  const uacTotal = uacs.length;

  // Validate status
  const validStatuses = ['pending', 'in-progress', 'qa', 'done', 'blocked'];
  const status = validStatuses.includes(opts.status) ? opts.status : 'pending';

  // Resolve completed-at: explicit value, or now() if done, else null
  const now = new Date().toISOString();
  const completedAt = opts.completedAt
    ? opts.completedAt
    : (status === 'done' ? now : null);

  // Calculate story number
  const storyNum = findNextStoryNumber(epicDirPath);
  const storyNumPadded = String(storyNum).padStart(3, '0');
  const storyId = `${opts.epicId}-${storyNumPadded}`;
  const slug = slugify(opts.title);
  const fileName = `${opts.epicId}-${storyNumPadded}-${slug}.md`;

  // Ensure target status directory exists
  const targetDir = path.join(epicDirPath, status);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  const filePath = path.join(targetDir, fileName);

  // Parse tags and dependencies
  const tags = opts.tags ? opts.tags.split(',').map(t => t.trim()) : [epicVersion];
  const dependencies = opts.dependencies ? opts.dependencies.split(',').map(d => d.trim()) : [];

  // Discover related docs
  const relatedDocs = discoverRelatedDocs(opts.docsPath);

  // Resolve uac_completed: explicit value, or uacTotal if done, else 0
  const uacCompletedCount = opts.uacCompleted !== null && opts.uacCompleted !== undefined
    ? parseInt(opts.uacCompleted, 10)
    : (status === 'done' ? uacTotal : 0);
  const uacPending = Math.max(0, uacTotal - uacCompletedCount);
  const uacPct = uacTotal > 0 ? Math.round((uacCompletedCount / uacTotal) * 100) : 0;

  // Build YAML frontmatter
  const frontmatter = {
    story_id: storyId,
    epic_id: opts.epicId,
    story_name: opts.title,
    story_status: status,
    priority: opts.priority,
    story_points: opts.points,
    assignees: [],
    tags,
    dependencies,
    created_at: now,
    updated_at: now,
    completed_at: completedAt,
    uac_total: uacTotal,
    uac_completed: uacCompletedCount,
    uac_pending: uacPending,
    uac_completion_pct: uacPct,
    uac_by_type: uacByType,
    design_links: [],
    architecture_refs: [],
    related_docs: relatedDocs,
    changelog: [
      {
        timestamp: now,
        action: 'created',
        details: `Story created via create-story-file.js`,
      },
    ],
    test_coverage: null,
    test_unit_status: 'pending',
    test_e2e_status: 'pending',
    test_integration_status: 'pending',
  };

  // Build markdown body
  let body = '\n';

  // Description section
  body += '## Description\n\n';
  if (opts.description) {
    // Parse user story format or use as-is
    body += opts.description + '\n';
  } else {
    body += '**As a** [persona]\n**I want** [capability]\n**So that** [benefit]\n';
  }

  // UAC section — use [x] for done stories (all completed), [ ] otherwise
  const uacCheck = status === 'done' ? '[x]' : '[ ]';
  body += '\n## User Acceptance Criteria\n\n';
  if (uacs.length > 0) {
    for (const uac of uacs) {
      body += `- ${uacCheck} ${(uac.type || 'FE').toUpperCase()}: ${uac.text}\n`;
    }
  } else {
    body += `- ${uacCheck} FE: [Description needed]\n- ${uacCheck} BE: [Description needed]\n- ${uacCheck} TEST: [Description needed]\n`;
  }

  // Test Requirements
  body += '\n## Test Requirements\n- **Unit Tests:** [Description needed]\n- **E2E Tests:** [Description needed]\n';

  // Dependencies
  body += '\n## Dependencies\n';
  if (dependencies.length > 0) {
    for (const dep of dependencies) {
      body += `- Story ${dep}\n`;
    }
  } else {
    body += '- None\n';
  }

  // Notes
  body += '\n## Notes\n\n';

  // Changelog
  const statusNote = status === 'done' ? ` (created as done — resolved on ${completedAt})` : '';
  body += `## Changelog\n- **${now}** — Story created via \`create-story-file.js\`${statusNote}\n`;

  // Related Documentation
  body += '\n## Related Documentation\n';
  for (const [key, docPath] of Object.entries(relatedDocs)) {
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const version = docPath.match(/v([\d.]+)/)?.[0] || '';
    body += `- ${label}: [${version}](../../${path.basename(docPath)})\n`;
  }

  // Generate file content
  const fileContent = matter.stringify(body, frontmatter);

  if (opts.dryRun) {
    process.stderr.write('Dry run — file not written.\n\n');
    process.stdout.write(fileContent);
    return;
  }

  // Write file
  fs.writeFileSync(filePath, fileContent, 'utf-8');
  process.stderr.write(`✅ Created: ${path.relative(process.cwd(), filePath)}\n`);

  // Output for workflow parsing
  process.stdout.write(`STORY_FILE=${path.relative(process.cwd(), filePath)}\n`);
  process.stdout.write(`STORY_ID=${storyId}\n`);

  // Refresh epic stats
  try {
    const aggregatePath = path.resolve(__dirname, 'aggregate-epics.js');
    execSync(`node "${aggregatePath}" --docs-path="${opts.docsPath}" --update --epic=${opts.epicId}`, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    process.stderr.write(`   Epic ${opts.epicId} stats refreshed.\n`);
  } catch (err) {
    process.stderr.write(`   Warning: Could not refresh epic stats: ${err.message}\n`);
  }
}

main();
