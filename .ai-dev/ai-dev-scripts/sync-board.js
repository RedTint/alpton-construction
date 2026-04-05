#!/usr/bin/env node
'use strict';

/**
 * sync-board.js
 *
 * Deterministic script that replaces the token-expensive agentic /sync-board
 * workflow (Steps 3-7). Parses atomic stories, creates/moves story files in
 * docs/epics/, and refreshes epic stats.
 *
 * Usage:
 *   node .ai-dev/ai-dev-scripts/sync-board.js
 *   node .ai-dev/ai-dev-scripts/sync-board.js --dry-run
 *   node .ai-dev/ai-dev-scripts/sync-board.js --epic=007
 *   node .ai-dev/ai-dev-scripts/sync-board.js --validate
 *   node .ai-dev/ai-dev-scripts/sync-board.js --generate-index
 *
 * Options:
 *   --docs-path=<path>     Path to docs directory (default: ./docs)
 *   --dry-run              Show changes without writing
 *   --epic=<id>            Only sync a specific epic
 *   --validate             Run validation only (no sync)
 *   --generate-index       Reverse flow: read epic files → regenerate atomic-stories index
 *
 * Exit codes:
 *   0  success
 *   1  docs/ or atomic stories not found
 */

const fs   = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { execSync } = require('child_process');

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_DIRS = ['pending', 'in-progress', 'qa', 'done', 'blocked', 'bugs'];

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
  const get  = (prefix) => (args.find(a => a.startsWith(prefix)) || '').slice(prefix.length) || null;
  return {
    docsPath:      get('--docs-path=') || './docs',
    dryRun:        args.includes('--dry-run'),
    epicFilter:    get('--epic='),
    validateOnly:  args.includes('--validate'),
    generateIndex: args.includes('--generate-index'),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findLatestFile(dir, pattern) {
  try {
    const files = fs.readdirSync(dir).filter(f => pattern.test(f));
    if (files.length === 0) return null;
    files.sort();
    return files[files.length - 1];
  } catch { return null; }
}

function discoverRelatedDocs(docsPath) {
  const result = {};
  for (const [key, pattern] of Object.entries(DOC_PATTERNS)) {
    const found = findLatestFile(docsPath, pattern);
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
 * Parse the atomic stories markdown doc into structured story objects.
 * Supports separators: en-dash (–), em-dash (—), hyphen (-), or colon (:)
 */
function parseAtomicStories(content) {
  const stories = [];
  let currentEpicId = null;
  let currentEpicName = null;

  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Detect epic section: ## Epic 007 – Name  OR  ## Epic 007: Name
    const epicMatch = line.match(/^##\s+Epic\s+(\d{3})\s*[-–—:]\s*(.+)/i);
    if (epicMatch) {
      currentEpicId = epicMatch[1];
      currentEpicName = epicMatch[2].trim();
      i++;
      continue;
    }

    // Detect story heading: ### Story 321 – Title  OR  ### Story 321: Title
    const storyMatch = line.match(/^###\s+Story\s+(\d+)\s*[-–—:]\s*(.+)/i);
    if (storyMatch && currentEpicId) {
      const storyNum = storyMatch[1];
      const title = storyMatch[2].trim();
      i++;

      // Parse story body until next ### or ##
      let description = '';
      let priority = 'medium';
      let effort = 5;
      let version = 'v1.0.0';
      const dependencies = [];
      const uacs = [];

      while (i < lines.length && !lines[i].match(/^#{2,3}\s+/)) {
        const bodyLine = lines[i];

        // Parse description (As a / I want / So that)
        if (bodyLine.match(/^\*\*As a\*\*/i) || bodyLine.match(/^\*\*I want\*\*/i) || bodyLine.match(/^\*\*So that\*\*/i)) {
          description += bodyLine + '\n';
        }

        // Parse priority
        const prioMatch = bodyLine.match(/\*\*Priority:\*\*\s*(Critical|High|Medium|Low)/i);
        if (prioMatch) priority = prioMatch[1].toLowerCase();

        // Parse effort
        const effortMatch = bodyLine.match(/\*\*Effort:\*\*\s*(\d+)/);
        if (effortMatch) effort = parseInt(effortMatch[1], 10);

        // Parse version
        const versionMatch = bodyLine.match(/(v\d+\.\d+\.\d+)/);
        if (versionMatch && !version) version = versionMatch[1];

        // Parse dependencies
        const depMatch = bodyLine.match(/\*\*Dependencies:\*\*\s*(.+)/i);
        if (depMatch) {
          const depStr = depMatch[1].trim();
          if (depStr.toLowerCase() !== 'none') {
            const depIds = depStr.match(/\d{3}-\d+|\d+/g);
            if (depIds) {
              for (const dep of depIds) {
                // If just a number, prefix with epic
                dependencies.push(dep.includes('-') ? dep : `${currentEpicId}-${dep}`);
              }
            }
          }
        }

        // Parse UACs: - [ ] TYPE: text or - [x] TYPE: text
        const uacMatch = bodyLine.match(/^-\s+\[([x\s])\]\s+(\w+):\s*(.+)/i);
        if (uacMatch) {
          const checked = uacMatch[1].toLowerCase() === 'x';
          uacs.push({
            type: uacMatch[2].toUpperCase(),
            text: uacMatch[3].trim(),
            checked,
          });
        }

        i++;
      }

      stories.push({
        storyNum,
        title,
        epicId: currentEpicId,
        epicName: currentEpicName,
        description: description.trim(),
        priority,
        effort,
        version,
        dependencies,
        uacs,
      });
      continue;
    }

    i++;
  }

  // Warn if 0 stories parsed — likely a format issue
  if (stories.length === 0) {
    process.stderr.write(`\n⚠️  WARNING: Parsed 0 stories from atomic stories file.\n`);
    process.stderr.write(`   This usually means the file uses an unsupported format.\n\n`);
    process.stderr.write(`   Expected format:\n`);
    process.stderr.write(`     ## Epic 001 – Epic Name\n`);
    process.stderr.write(`     ### Story 001 – Story Title\n`);
    process.stderr.write(`     - [ ] FE: Acceptance criterion\n\n`);
    process.stderr.write(`   Accepted separators: – (en-dash), — (em-dash), - (hyphen), : (colon)\n`);
    process.stderr.write(`   NOT supported: table rows, bullet lists without checkboxes, non-heading formats\n\n`);
    process.stderr.write(`   Fix: Re-run /define @200-atomic-stories to regenerate with the correct format.\n\n`);
  }

  return stories;
}

/**
 * Derive story statuses from the progress doc.
 */
function parseProgressStatuses(content) {
  const statusMap = new Map();

  for (const line of content.split('\n')) {
    // Look for story references with status indicators
    const doneMatch = line.match(/✅.*Story\s+(\d{3}-\d+|\d+)/i);
    if (doneMatch) { statusMap.set(doneMatch[1], 'done'); continue; }

    const wipMatch = line.match(/🚧.*Story\s+(\d{3}-\d+|\d+)/i);
    if (wipMatch) { statusMap.set(wipMatch[1], 'in-progress'); continue; }

    const blockedMatch = line.match(/⏸️.*Story\s+(\d{3}-\d+|\d+)/i);
    if (blockedMatch) { statusMap.set(blockedMatch[1], 'blocked'); continue; }

    const cancelledMatch = line.match(/❌.*Story\s+(\d{3}-\d+|\d+)/i);
    if (cancelledMatch) { statusMap.set(cancelledMatch[1], 'cancelled'); continue; }
  }

  return statusMap;
}

// ─── Sync Logic ───────────────────────────────────────────────────────────────

function syncStories(stories, statusMap, epicsPath, docsPath, opts) {
  const results = { created: 0, skipped: 0, moved: 0, errors: [], epics: new Set() };
  const relatedDocs = discoverRelatedDocs(docsPath);
  const now = new Date().toISOString();

  for (const story of stories) {
    if (opts.epicFilter && story.epicId !== opts.epicFilter) continue;

    const epicSlug = slugify(story.epicName);
    const epicDir  = `${story.epicId}-${epicSlug}`;
    const epicDirPath = path.join(epicsPath, epicDir);

    results.epics.add(epicDir);

    // Ensure epic directory structure
    if (!opts.dryRun) {
      for (const sd of STATUS_DIRS) {
        const sdPath = path.join(epicDirPath, sd);
        if (!fs.existsSync(sdPath)) fs.mkdirSync(sdPath, { recursive: true });
      }
    }

    // Create epic.md if missing
    const epicMdPath = path.join(epicDirPath, 'epic.md');
    if (!fs.existsSync(epicMdPath) && !opts.dryRun) {
      const epicFm = {
        epic_id: story.epicId,
        epic_name: story.epicName,
        epic_status: 'pending',
        epic_version: story.version,
        priority: 'high',
        total_stories: 0,
        completed_stories: 0,
        total_points: 0,
        completed_points: 0,
        completion_pct: 0,
        stories_by_status: { pending: 0, 'in-progress': 0, qa: 0, done: 0, blocked: 0 },
        bugs_open: 0,
        bugs_resolved: 0,
        created_at: now,
        updated_at: now,
      };
      const epicBody = `\n# Epic ${story.epicId}: ${story.epicName}\n\n`;
      fs.writeFileSync(epicMdPath, matter.stringify(epicBody, epicFm), 'utf-8');
    }

    // Determine status
    const storyId = `${story.epicId}-${story.storyNum}`;
    const status = statusMap.get(storyId) || statusMap.get(story.storyNum) || 'pending';

    // Check if story file already exists in any status dir
    const storySlug = slugify(story.title);
    const filePattern = new RegExp(`^${story.epicId}-${story.storyNum}-`);
    let existingFile = null;
    let existingDir  = null;

    for (const sd of STATUS_DIRS) {
      if (sd === 'bugs') continue;
      const sdPath = path.join(epicDirPath, sd);
      if (!fs.existsSync(sdPath)) continue;
      const found = fs.readdirSync(sdPath).find(f => filePattern.test(f));
      if (found) {
        existingFile = found;
        existingDir  = sd;
        break;
      }
    }

    if (existingFile && existingDir === status) {
      // File exists in correct dir → skip
      results.skipped++;
      if (opts.dryRun) {
        process.stderr.write(`  Skip:  ${existingDir}/${existingFile}\n`);
      }
      continue;
    }

    if (existingFile && existingDir !== status) {
      // File exists in wrong dir → move
      if (opts.dryRun) {
        process.stderr.write(`  Move:  ${existingDir}/${existingFile} → ${status}/\n`);
      } else {
        const srcPath = path.join(epicDirPath, existingDir, existingFile);
        const dstDir  = path.join(epicDirPath, status);
        if (!fs.existsSync(dstDir)) fs.mkdirSync(dstDir, { recursive: true });
        const dstPath = path.join(dstDir, existingFile);

        // Update frontmatter status
        const { data, content } = matter(fs.readFileSync(srcPath, 'utf-8'));
        data.story_status = status;
        data.updated_at = now;
        if (status === 'done' && !data.completed_at) data.completed_at = now;

        // Add changelog entry
        if (Array.isArray(data.changelog)) {
          data.changelog.push({
            timestamp: now,
            action: 'moved',
            details: `Moved from ${existingDir}/ to ${status}/ via sync-board.js`,
          });
        }

        fs.writeFileSync(dstPath, matter.stringify(content, data), 'utf-8');
        fs.unlinkSync(srcPath);
      }
      results.moved++;
      continue;
    }

    // File doesn't exist → create
    const fileName = `${story.epicId}-${story.storyNum}-${storySlug}.md`;
    const filePath = path.join(epicDirPath, status, fileName);

    // Count UACs
    const uacByType = { fe: 0, be: 0, db: 0, devops: 0, cli: 0, test: 0 };
    let uacCompleted = 0;
    for (const uac of story.uacs) {
      const key = uac.type.toLowerCase();
      if (key in uacByType) uacByType[key]++;
      if (uac.checked) uacCompleted++;
    }
    const uacTotal = story.uacs.length;
    const uacPending = uacTotal - uacCompleted;
    const uacPct = uacTotal === 0 ? 0 : Math.round((uacCompleted / uacTotal) * 100);

    const frontmatter = {
      story_id:           storyId,
      epic_id:            story.epicId,
      story_name:         story.title,
      story_status:       status,
      priority:           story.priority,
      story_points:       story.effort,
      assignees:          [],
      tags:               [story.version],
      dependencies:       story.dependencies,
      created_at:         now,
      updated_at:         now,
      completed_at:       status === 'done' ? now : null,
      uac_total:          uacTotal,
      uac_completed:      uacCompleted,
      uac_pending:        uacPending,
      uac_completion_pct: uacPct,
      uac_by_type:        uacByType,
      design_links:       [],
      architecture_refs:  [],
      related_docs:       relatedDocs,
      changelog: [{
        timestamp: now,
        action: 'created',
        details: 'Story file created via sync-board.js',
      }],
      test_coverage:          null,
      test_unit_status:       'pending',
      test_e2e_status:        'pending',
      test_integration_status: 'pending',
    };

    // Build body
    let body = '\n## Description\n\n';
    if (story.description) {
      body += story.description + '\n';
    } else {
      body += `**As a** user\n**I want** ${story.title.toLowerCase()}\n**So that** [benefit to be defined]\n`;
    }

    body += '\n## User Acceptance Criteria\n\n';
    for (const uac of story.uacs) {
      const mark = uac.checked ? 'x' : ' ';
      body += `- [${mark}] ${uac.type.toUpperCase()}: ${uac.text}\n`;
    }
    if (story.uacs.length === 0) {
      body += '- [ ] FE: [Description needed]\n- [ ] BE: [Description needed]\n- [ ] TEST: [Description needed]\n';
    }

    body += '\n## Test Requirements\n- **Unit Tests:** [Description needed]\n- **E2E Tests:** [Description needed]\n';
    body += '\n## Dependencies\n';
    if (story.dependencies.length > 0) {
      for (const dep of story.dependencies) body += `- Story ${dep}\n`;
    } else {
      body += '- None\n';
    }
    body += '\n## Notes\n\n';
    body += `## Changelog\n- **${now}** — Story file created via \`sync-board.js\`\n`;
    body += '\n## Related Documentation\n';
    for (const [key, docPath] of Object.entries(relatedDocs)) {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const version = docPath.match(/v([\d.]+)/)?.[0] || '';
      body += `- ${label}: [${version}](../../${path.basename(docPath)})\n`;
    }

    if (opts.dryRun) {
      process.stderr.write(`  Create: ${status}/${fileName}\n`);
    } else {
      fs.writeFileSync(filePath, matter.stringify(body, frontmatter), 'utf-8');
    }
    results.created++;
  }

  return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

// ─── Generate Index (Reverse Flow) ────────────────────────────────────────────

/**
 * Read all story files from docs/epics/ and regenerate the atomic-stories doc
 * as a read-only index. This is the reverse of the normal sync flow.
 */
function generateIndex(docsPath, epicsPath, opts) {
  if (!fs.existsSync(epicsPath)) {
    process.stderr.write(`Error: docs/epics/ not found at ${epicsPath}\n`);
    process.exit(1);
  }

  // Discover all epics
  const epicDirs = fs.readdirSync(epicsPath)
    .filter(d => {
      const fullPath = path.join(epicsPath, d);
      return fs.statSync(fullPath).isDirectory() && /^\d{3}-/.test(d);
    })
    .sort();

  if (opts.epicFilter) {
    const filtered = epicDirs.filter(d => d.startsWith(opts.epicFilter));
    if (filtered.length === 0) {
      process.stderr.write(`Error: No epic directory found for epic ${opts.epicFilter}\n`);
      process.exit(1);
    }
  }

  const statusEmoji = {
    pending: '⏳', 'in-progress': '🚧', qa: '🔍', done: '✅', blocked: '⏸️',
  };

  // Find latest atomic stories file to get version
  const existingFile = findLatestFile(docsPath, /^200-atomic-stories-v[\d.]+\.md$/);
  const version = existingFile
    ? (existingFile.match(/v([\d.]+)/)?.[1] || '1.0.0')
    : '1.0.0';
  const targetFile = existingFile || `200-atomic-stories-v${version}.md`;

  // Try to extract project name from existing file or README
  let projectName = 'Project';
  if (existingFile) {
    try {
      const content = fs.readFileSync(path.join(docsPath, existingFile), 'utf-8');
      const projMatch = content.match(/\*\*Project:\*\*\s*(.+)/i);
      if (projMatch) projectName = projMatch[1].trim();
    } catch { /* ignore */ }
  }

  // Build index content
  let output = `# Atomic Stories v${version}\n\n`;
  output += `**Project:** ${projectName}\n`;
  output += `**Version:** v${version}\n`;
  output += `**Last Updated:** ${new Date().toISOString().split('T')[0]}\n`;
  output += `**Generated by:** \`sync-board.js --generate-index\`\n\n`;
  output += `> This file is a **read-only index** auto-generated from story files in \`docs/epics/\`.\n`;
  output += `> Do not edit directly. Use \`/new-feature\` to add stories, \`/update-progress\` to sync status.\n\n`;
  output += `---\n\n`;

  let totalStories = 0;
  let totalPoints = 0;

  for (const epicDir of epicDirs) {
    if (opts.epicFilter && !epicDir.startsWith(opts.epicFilter)) continue;

    const epicDirPath = path.join(epicsPath, epicDir);
    const epicMdPath = path.join(epicDirPath, 'epic.md');

    // Read epic metadata
    let epicId = epicDir.match(/^(\d{3})/)?.[1] || '000';
    let epicName = epicDir.replace(/^\d{3}-/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    let epicVersion = `v${version}`;
    if (fs.existsSync(epicMdPath)) {
      try {
        const { data } = matter(fs.readFileSync(epicMdPath, 'utf-8'));
        if (data.epic_name) epicName = data.epic_name;
        if (data.epic_version) epicVersion = data.epic_version;
      } catch { /* use defaults */ }
    }

    // Collect all stories from status dirs
    const stories = [];
    for (const sd of ['done', 'in-progress', 'qa', 'pending', 'blocked']) {
      const sdPath = path.join(epicDirPath, sd);
      if (!fs.existsSync(sdPath)) continue;
      const files = fs.readdirSync(sdPath).filter(f => f.endsWith('.md'));
      for (const file of files) {
        try {
          const { data } = matter(fs.readFileSync(path.join(sdPath, file), 'utf-8'));
          stories.push({
            storyId: data.story_id || file.replace('.md', ''),
            storyName: data.story_name || file.replace('.md', ''),
            status: sd,
            points: data.story_points || 0,
            priority: data.priority || 'medium',
            uacTotal: data.uac_total || 0,
            uacCompleted: data.uac_completed || 0,
            filePath: `epics/${epicDir}/${sd}/${file}`,
          });
        } catch { /* skip unparseable files */ }
      }
    }

    if (stories.length === 0) continue;

    totalStories += stories.length;
    totalPoints += stories.reduce((sum, s) => sum + s.points, 0);

    // Sort by story ID
    stories.sort((a, b) => a.storyId.localeCompare(b.storyId));

    output += `## Epic ${epicId} – ${epicName} (${epicVersion})\n\n`;
    output += `| Story | Title | Status | Points | UAC |\n`;
    output += `|-------|-------|--------|--------|-----|\n`;
    for (const s of stories) {
      const emoji = statusEmoji[s.status] || '⏳';
      const uacStr = `${s.uacCompleted}/${s.uacTotal}`;
      output += `| [${s.storyId}](${s.filePath}) | ${s.storyName} | ${emoji} ${s.status} | ${s.points} | ${uacStr} |\n`;
    }
    output += `\n---\n\n`;
  }

  output += `**Total:** ${totalStories} stories, ${totalPoints} points\n\n`;
  output += `*Auto-generated from \`docs/epics/\` by \`sync-board.js --generate-index\`.*\n`;
  output += `*Run \`/new-feature\` to add stories. Run \`/update-progress\` to sync status.*\n`;

  const targetPath = path.join(docsPath, targetFile);
  if (opts.dryRun) {
    process.stderr.write(`Dry run — would write: ${targetFile}\n\n`);
    process.stdout.write(output);
  } else {
    fs.writeFileSync(targetPath, output, 'utf-8');
    process.stderr.write(`✅ Index regenerated: ${targetFile}\n`);
    process.stderr.write(`   ${totalStories} stories, ${totalPoints} points across ${epicDirs.length} epics\n`);
  }

  // JSON summary for workflow parsing
  const summary = {
    generatedAt: new Date().toISOString(),
    file: targetFile,
    totalStories,
    totalPoints,
    epics: epicDirs.length,
  };
  if (!opts.dryRun) {
    process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const opts = parseArgs();
  const docsPath  = path.resolve(opts.docsPath);
  const epicsPath = path.join(docsPath, 'epics');

  // Handle --generate-index (reverse flow)
  if (opts.generateIndex) {
    generateIndex(docsPath, epicsPath, opts);
    return;
  }

  // Find atomic stories doc
  const atomicFile = findLatestFile(docsPath, /^200-atomic-stories-v[\d.]+\.md$/);
  if (!atomicFile) {
    process.stderr.write(`Error: No atomic stories file found in ${docsPath}\n`);
    process.exit(1);
  }

  // Find progress doc
  const progressDir = path.join(docsPath, 'progress');
  const progressFile = findLatestFile(progressDir, /^000-progress-v[\d.]+\.md$/);

  // Parse sources
  const atomicContent = fs.readFileSync(path.join(docsPath, atomicFile), 'utf-8');
  const stories = parseAtomicStories(atomicContent);

  let statusMap = new Map();
  if (progressFile) {
    const progressContent = fs.readFileSync(path.join(progressDir, progressFile), 'utf-8');
    statusMap = parseProgressStatuses(progressContent);
  }

  process.stderr.write(`📋 Source: ${atomicFile}\n`);
  process.stderr.write(`   Progress: ${progressFile || 'none'}\n`);
  process.stderr.write(`   Parsed: ${stories.length} stories\n\n`);

  if (opts.validateOnly) {
    // Run validate-stories.js instead
    try {
      const validatePath = path.resolve(__dirname, 'validate-stories.js');
      const args = [`--docs-path=${opts.docsPath}`, '--output=table'];
      if (opts.epicFilter) args.push(`--epic=${opts.epicFilter}`);
      execSync(`node "${validatePath}" ${args.join(' ')}`, { stdio: 'inherit' });
    } catch (err) {
      process.exit(err.status || 2);
    }
    return;
  }

  // Ensure epics directory
  if (!opts.dryRun && !fs.existsSync(epicsPath)) {
    fs.mkdirSync(epicsPath, { recursive: true });
  }

  // Sync
  const results = syncStories(stories, statusMap, epicsPath, docsPath, opts);

  // Refresh epic stats
  if (!opts.dryRun && results.created + results.moved > 0) {
    try {
      const aggregatePath = path.resolve(__dirname, 'aggregate-epics.js');
      const epicArg = opts.epicFilter ? ` --epic=${opts.epicFilter}` : '';
      execSync(`node "${aggregatePath}" --docs-path="${opts.docsPath}" --update${epicArg}`, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      process.stderr.write(`   Epic stats refreshed.\n`);
    } catch (err) {
      process.stderr.write(`   Warning: Could not refresh epic stats: ${err.message}\n`);
    }
  }

  // Summary
  const output = {
    generatedAt: new Date().toISOString(),
    source: atomicFile,
    progress: progressFile || null,
    created: results.created,
    skipped: results.skipped,
    moved: results.moved,
    errors: results.errors,
    epics: [...results.epics],
  };

  process.stdout.write(JSON.stringify(output, null, 2) + '\n');

  process.stderr.write(`\n✅ Sync complete!\n`);
  process.stderr.write(`   Created: ${results.created} story files\n`);
  process.stderr.write(`   Skipped: ${results.skipped} (existing)\n`);
  process.stderr.write(`   Moved:   ${results.moved} (status change)\n`);
  process.stderr.write(`   Errors:  ${results.errors.length}\n`);
  if (opts.dryRun) {
    process.stderr.write(`\n   Dry run — no files were written. Run without --dry-run to apply.\n`);
  }
}

main();
