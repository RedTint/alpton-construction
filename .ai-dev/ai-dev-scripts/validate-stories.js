#!/usr/bin/env node
'use strict';

/**
 * validate-stories.js
 *
 * Validates all story and epic files in docs/epics/ for schema correctness.
 * Optionally fixes safe issues and migrates old files to the v2 format.
 *
 * Usage:
 *   node .ai-dev/ai-dev-scripts/validate-stories.js
 *   node .ai-dev/ai-dev-scripts/validate-stories.js --fix
 *   node .ai-dev/ai-dev-scripts/validate-stories.js --migrate
 *   node .ai-dev/ai-dev-scripts/validate-stories.js --fix --migrate
 *   node .ai-dev/ai-dev-scripts/validate-stories.js --epic=007
 *   node .ai-dev/ai-dev-scripts/validate-stories.js --output=table
 *
 * Options:
 *   --docs-path=<path>   Path to docs directory (default: ./docs)
 *   --fix                Auto-fix safe issues (uac counts, status mismatches)
 *   --migrate            Upgrade old files to v2 format (additive only)
 *   --epic=<id>          Only process a specific epic
 *   --output=json|table  Output format (default: json)
 *
 * Exit codes:
 *   0  success (may include warnings)
 *   1  docs/epics/ not found
 *   2  validation errors found (no --fix)
 */

const fs   = require('fs');
const path = require('path');
const matter = require('gray-matter');

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_DIRS = ['pending', 'in-progress', 'qa', 'done', 'blocked'];
const UAC_TYPES   = ['fe', 'be', 'db', 'devops', 'cli', 'test'];

/** Required fields for story YAML frontmatter (v1 base). */
const REQUIRED_STORY_FIELDS = [
  'story_id', 'epic_id', 'story_name', 'story_status', 'priority',
  'story_points', 'assignees', 'tags', 'dependencies',
  'created_at', 'updated_at', 'completed_at',
  'uac_total', 'uac_completed', 'uac_pending', 'uac_completion_pct',
  'uac_by_type',
  'test_coverage', 'test_unit_status', 'test_e2e_status', 'test_integration_status',
];

/** Additional v2 fields added by --migrate. */
const V2_FIELDS = [
  'design_links', 'architecture_refs', 'related_docs', 'changelog',
];

/** Required fields for epic YAML frontmatter. */
const REQUIRED_EPIC_FIELDS = [
  'epic_id', 'epic_name', 'epic_status', 'priority',
  'total_stories', 'completed_stories',
  'total_points', 'completed_points', 'completion_pct',
  'created_at', 'updated_at',
];

/** Doc file patterns for auto-discovering related_docs. */
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
    docsPath:   get('--docs-path=') || './docs',
    fix:        args.includes('--fix'),
    migrate:    args.includes('--migrate'),
    epicFilter: get('--epic='),
    output:     get('--output=') || 'json',
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readFileSafe(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    return { data, content, raw, ok: true };
  } catch (err) {
    return { data: {}, content: '', raw: '', ok: false, error: err.message };
  }
}

function writeBackFrontmatter(filePath, data, body) {
  const updated = matter.stringify(body, data);
  fs.writeFileSync(filePath, updated, 'utf-8');
}

/**
 * Find the latest versioned doc file matching a pattern in the docs directory.
 */
function findLatestDoc(docsPath, pattern) {
  try {
    const files = fs.readdirSync(docsPath).filter(f => pattern.test(f));
    if (files.length === 0) return null;
    files.sort();
    return files[files.length - 1];
  } catch { return null; }
}

/**
 * Discover all related docs for populating the related_docs field.
 */
function discoverRelatedDocs(docsPath) {
  const result = {};
  for (const [key, pattern] of Object.entries(DOC_PATTERNS)) {
    const found = findLatestDoc(docsPath, pattern);
    if (found) result[key] = `docs/${found}`;
  }
  return result;
}

/**
 * Build a set of all known story IDs across all epics.
 */
function buildStoryIdSet(epicsPath, epicDirs) {
  const ids = new Set();
  for (const epicDir of epicDirs) {
    const epicDirPath = path.join(epicsPath, epicDir);
    for (const statusDir of STATUS_DIRS) {
      const statusPath = path.join(epicDirPath, statusDir);
      if (!fs.existsSync(statusPath)) continue;
      const files = fs.readdirSync(statusPath).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const { data } = readFileSafe(path.join(statusPath, file));
        if (data.story_id) ids.add(String(data.story_id));
      }
    }
  }
  return ids;
}

/**
 * Parse UAC lines from the markdown body.
 */
function parseBodyUACs(body) {
  const headingMatch = /^##\s+User Acceptance Criteria\s*$/m.exec(body);
  if (!headingMatch) return null;

  const start = headingMatch.index + headingMatch[0].length;
  const nextSection = body.indexOf('\n## ', start);
  const uacSection  = nextSection === -1 ? body.slice(start) : body.slice(start, nextSection);

  let completed = 0, pending = 0;
  const byType = { fe: 0, be: 0, db: 0, devops: 0, cli: 0, test: 0 };

  for (const line of uacSection.split('\n')) {
    const checked   = line.match(/^-\s+\[x\]\s+(\w+):\s*(.+)/i);
    const unchecked = line.match(/^-\s+\[\s*\]\s+(\w+):\s*(.+)/i);
    const m = checked || unchecked;
    if (!m) continue;
    const [, tag, text] = m;
    if (text.trim().toLowerCase() === 'n/a') continue;
    const key = tag.toLowerCase();
    if (key in byType) byType[key]++;
    if (checked) completed++; else pending++;
  }

  const total = completed + pending;
  if (total === 0) return null;
  return { total, completed, pending, byType };
}

// ─── Validator ────────────────────────────────────────────────────────────────

function validateStoryFile(filePath, statusDir, allStoryIds, docsPath, opts) {
  const errors   = [];
  const warnings = [];
  let fixed   = 0;
  let migrated = 0;

  const rel = path.relative(process.cwd(), filePath);
  const { data, content, ok } = readFileSafe(filePath);
  if (!ok) {
    errors.push({ file: rel, field: 'file', message: 'Could not parse file' });
    return { errors, warnings, fixed, migrated };
  }

  let dirty = false;
  let bodyDirty = false;
  let body = content;

  // 1. Required fields check
  for (const field of REQUIRED_STORY_FIELDS) {
    if (!(field in data)) {
      errors.push({ file: rel, field, message: `Missing required field: ${field}` });
    }
  }

  // 2. Type validation
  if (data.story_points !== undefined && typeof data.story_points !== 'number') {
    errors.push({ file: rel, field: 'story_points', message: `Expected number, got ${typeof data.story_points}` });
  }
  if (data.dependencies !== undefined && !Array.isArray(data.dependencies)) {
    errors.push({ file: rel, field: 'dependencies', message: `Expected array, got ${typeof data.dependencies}` });
  }
  if (data.assignees !== undefined && !Array.isArray(data.assignees)) {
    errors.push({ file: rel, field: 'assignees', message: `Expected array, got ${typeof data.assignees}` });
  }
  if (data.tags !== undefined && !Array.isArray(data.tags)) {
    errors.push({ file: rel, field: 'tags', message: `Expected array, got ${typeof data.tags}` });
  }

  // 3. UAC consistency
  const bodyUACs = parseBodyUACs(body);
  if (bodyUACs) {
    if (data.uac_total !== bodyUACs.total) {
      const msg = `uac_total is ${data.uac_total} but body has ${bodyUACs.total} UAC lines`;
      if (opts.fix) {
        data.uac_total = bodyUACs.total;
        data.uac_completed = bodyUACs.completed;
        data.uac_pending = bodyUACs.pending;
        data.uac_completion_pct = bodyUACs.total === 0 ? 0 : Math.round((bodyUACs.completed / bodyUACs.total) * 100);
        data.uac_by_type = bodyUACs.byType;
        dirty = true;
        fixed++;
      } else {
        errors.push({ file: rel, field: 'uac_total', message: msg });
      }
    }
  }

  // 4. Status consistency
  if (data.story_status && data.story_status !== statusDir) {
    const msg = `story_status is "${data.story_status}" but file is in ${statusDir}/`;
    if (opts.fix) {
      data.story_status = statusDir;
      dirty = true;
      fixed++;
    } else {
      errors.push({ file: rel, field: 'story_status', message: msg });
    }
  }

  // 5. Dependency integrity
  if (Array.isArray(data.dependencies)) {
    for (const depId of data.dependencies) {
      const depStr = String(depId);
      if (depStr && !allStoryIds.has(depStr)) {
        warnings.push({ file: rel, field: 'dependencies', message: `Dependency "${depStr}" not found in any epic` });
      }
    }
  }

  // 6. v2 migration
  if (opts.migrate) {
    const relatedDocs = discoverRelatedDocs(docsPath);
    let wasMigrated = false;

    // Add missing v2 frontmatter fields
    if (!('design_links' in data)) {
      data.design_links = [];
      wasMigrated = true;
    }
    if (!('architecture_refs' in data)) {
      data.architecture_refs = [];
      wasMigrated = true;
    }
    if (!('related_docs' in data) || Object.keys(data.related_docs || {}).length === 0) {
      data.related_docs = relatedDocs;
      wasMigrated = true;
    }
    if (!('changelog' in data) || !Array.isArray(data.changelog)) {
      data.changelog = [];
      wasMigrated = true;
    }

    // Add Changelog body section if missing
    if (!body.includes('## Changelog')) {
      const now = new Date().toISOString();
      body += `\n## Changelog\n- **${now}** — Migrated to v2 format via \`validate-stories.js --migrate\`\n`;
      bodyDirty = true;
      wasMigrated = true;
    }

    // Add Related Documentation body section if missing
    if (!body.includes('## Related Documentation')) {
      let relDocsSection = '\n## Related Documentation\n';
      for (const [key, docPath] of Object.entries(relatedDocs)) {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const version = docPath.match(/v([\d.]+)/)?.[0] || '';
        relDocsSection += `- ${label}: [${version}](../../${path.basename(docPath)})\n`;
      }
      body += relDocsSection;
      bodyDirty = true;
      wasMigrated = true;
    }

    if (wasMigrated) {
      // Add changelog entry to frontmatter
      data.changelog.push({
        timestamp: new Date().toISOString(),
        action: 'migrated',
        details: 'Migrated to v2 format via validate-stories.js --migrate',
      });
      dirty = true;
      migrated++;
    }
  }

  // 7. Changelog presence warning (always check)
  if (!body.includes('## Changelog')) {
    warnings.push({ file: rel, field: 'body', message: 'Missing ## Changelog section' });
  }

  // 8. Related docs validation
  if (data.related_docs && typeof data.related_docs === 'object') {
    for (const [key, docPath] of Object.entries(data.related_docs)) {
      if (docPath && !fs.existsSync(path.resolve(process.cwd(), docPath))) {
        warnings.push({ file: rel, field: `related_docs.${key}`, message: `Referenced doc not found: ${docPath}` });
      }
    }
  }

  // Write back if changed
  if (dirty || bodyDirty) {
    data.updated_at = new Date().toISOString();
    writeBackFrontmatter(filePath, data, body);
  }

  return { errors, warnings, fixed, migrated };
}

function validateEpicFile(filePath) {
  const errors   = [];
  const warnings = [];
  const rel = path.relative(process.cwd(), filePath);
  const { data, ok } = readFileSafe(filePath);

  if (!ok) {
    errors.push({ file: rel, field: 'file', message: 'Could not parse file' });
    return { errors, warnings };
  }

  for (const field of REQUIRED_EPIC_FIELDS) {
    if (!(field in data)) {
      errors.push({ file: rel, field, message: `Missing required field: ${field}` });
    }
  }

  return { errors, warnings };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const opts = parseArgs();
  const epicsPath = path.resolve(opts.docsPath, 'epics');

  if (!fs.existsSync(epicsPath)) {
    process.stderr.write(`Error: docs/epics/ not found at ${epicsPath}\nRun /sync-board first.\n`);
    process.exit(1);
  }

  // Discover epic directories
  const epicDirs = fs.readdirSync(epicsPath)
    .filter(d => /^\d{3}-/.test(d) && fs.statSync(path.join(epicsPath, d)).isDirectory())
    .sort();

  const filteredDirs = opts.epicFilter
    ? epicDirs.filter(d => d.startsWith(opts.epicFilter))
    : epicDirs;

  // Build global story ID set for dependency checking
  const allStoryIds = buildStoryIdSet(epicsPath, epicDirs);

  const allErrors   = [];
  const allWarnings = [];
  let totalValid   = 0;
  let totalFixed   = 0;
  let totalMigrated = 0;

  for (const epicDir of filteredDirs) {
    const epicDirPath = path.join(epicsPath, epicDir);

    // Validate epic.md
    const epicMdPath = path.join(epicDirPath, 'epic.md');
    if (fs.existsSync(epicMdPath)) {
      const epicResult = validateEpicFile(epicMdPath);
      allErrors.push(...epicResult.errors);
      allWarnings.push(...epicResult.warnings);
      if (epicResult.errors.length === 0) totalValid++;
    }

    // Validate story files
    for (const statusDir of STATUS_DIRS) {
      const statusPath = path.join(epicDirPath, statusDir);
      if (!fs.existsSync(statusPath)) continue;

      const files = fs.readdirSync(statusPath).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const filePath = path.join(statusPath, file);
        const result = validateStoryFile(filePath, statusDir, allStoryIds, opts.docsPath, opts);
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
        totalFixed += result.fixed;
        totalMigrated += result.migrated;
        if (result.errors.length === 0) totalValid++;
      }
    }

    // Validate bug files
    const bugsPath = path.join(epicDirPath, 'bugs');
    if (fs.existsSync(bugsPath)) {
      const bugFiles = fs.readdirSync(bugsPath).filter(f => f.endsWith('.md'));
      for (const file of bugFiles) {
        const filePath = path.join(bugsPath, file);
        const { data, ok } = readFileSafe(filePath);
        if (ok) totalValid++;
        else allErrors.push({ file: path.relative(process.cwd(), filePath), field: 'file', message: 'Could not parse file' });
      }
    }
  }

  const result = {
    generatedAt: new Date().toISOString(),
    docsPath: path.resolve(opts.docsPath),
    valid: totalValid,
    errors: allErrors,
    warnings: allWarnings,
    fixed: totalFixed,
    migrated: totalMigrated,
    summary: {
      totalFiles: totalValid + allErrors.length,
      errorCount: allErrors.length,
      warningCount: allWarnings.length,
    },
  };

  if (opts.output === 'table') {
    printTable(result);
  } else {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  }

  // Log to stderr for human readability
  if (opts.fix || opts.migrate) {
    process.stderr.write(`\n✅ Validation complete: ${totalValid} valid, ${allErrors.length} errors, ${allWarnings.length} warnings\n`);
    if (totalFixed > 0) process.stderr.write(`   Fixed: ${totalFixed} issue(s)\n`);
    if (totalMigrated > 0) process.stderr.write(`   Migrated: ${totalMigrated} file(s) to v2 format\n`);
  }

  if (allErrors.length > 0 && !opts.fix) process.exit(2);
}

// ─── Table output ─────────────────────────────────────────────────────────────

function printTable(result) {
  process.stdout.write('\n📋 Story Validation Report\n');
  process.stdout.write(`   ${result.valid} valid · ${result.errors.length} errors · ${result.warnings.length} warnings\n`);
  if (result.fixed > 0) process.stdout.write(`   ${result.fixed} fixed · ${result.migrated} migrated\n`);
  process.stdout.write('\n');

  if (result.errors.length > 0) {
    process.stdout.write('❌ Errors:\n');
    for (const err of result.errors) {
      process.stdout.write(`   ${err.file} — ${err.field}: ${err.message}\n`);
    }
    process.stdout.write('\n');
  }

  if (result.warnings.length > 0) {
    process.stdout.write('⚠️  Warnings:\n');
    for (const warn of result.warnings) {
      process.stdout.write(`   ${warn.file} — ${warn.field}: ${warn.message}\n`);
    }
    process.stdout.write('\n');
  }
}

main();
