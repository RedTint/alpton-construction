#!/usr/bin/env node
'use strict';

/**
 * aggregate-epics.js
 *
 * Reads all epic and story files from docs/epics/ and aggregates project stats.
 * Intended to be called by the /update-progress skill so it doesn't have to
 * read dozens of individual files itself.
 *
 * Usage:
 *   node .ai-dev/ai-dev-scripts/aggregate-epics.js
 *   node .ai-dev/ai-dev-scripts/aggregate-epics.js --update
 *   node .ai-dev/ai-dev-scripts/aggregate-epics.js --reconcile
 *   node .ai-dev/ai-dev-scripts/aggregate-epics.js --output=table
 *   node .ai-dev/ai-dev-scripts/aggregate-epics.js --epic=005
 *
 * Options:
 *   --docs-path=<path>   Path to docs directory (default: ./docs)
 *   --update             Write recalculated stats back to each epic.md
 *   --reconcile          Sync story file frontmatter from body UAC checkboxes,
 *                        move files to correct status dirs, then run --update.
 *                        Forward-only rule: files in done/ are never moved back;
 *                        unchecked boxes in done/ stories are checked off.
 *   --epic=<id>          Only process a specific epic (e.g. --epic=005)
 *   --output=json|table  Output format (default: json)
 *
 * Output (JSON, to stdout):
 *   { generatedAt, docsPath, overall: {...}, epics: [...] }
 *
 * Exit codes:
 *   0  success
 *   1  docs/epics/ directory not found
 */

const fs   = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Status directories scanned per epic (order matters for display)
const STATUS_DIRS = ['pending', 'in-progress', 'qa', 'done', 'blocked', 'bugs'];

// ─── CLI args ─────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const get  = (prefix) => (args.find(a => a.startsWith(prefix)) || '').slice(prefix.length) || null;
  const reconcile = args.includes('--reconcile');
  return {
    docsPath:    get('--docs-path=') || './docs',
    update:      args.includes('--update') || reconcile, // reconcile implies update
    reconcile,
    epicFilter:  get('--epic='),
    output:      get('--output=') || 'json',
  };
}

// ─── File helpers ─────────────────────────────────────────────────────────────

function readFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    return { data, content, ok: true };
  } catch (err) {
    process.stderr.write(`WARN: could not read ${filePath}: ${err.message}\n`);
    return { data: {}, content: '', ok: false };
  }
}

/**
 * Rewrite only the YAML frontmatter of an existing file.
 * Preserves the markdown body exactly — only the --- block changes.
 */
function updateFrontmatter(filePath, newData) {
  const { content: body, ok } = readFile(filePath);
  if (!ok) return false;
  try {
    // gray-matter.stringify prepends the YAML block to the body string
    const updated = matter.stringify(body, newData);
    fs.writeFileSync(filePath, updated, 'utf-8');
    return true;
  } catch (err) {
    process.stderr.write(`WARN: could not write ${filePath}: ${err.message}\n`);
    return false;
  }
}

// ─── Stats helpers ────────────────────────────────────────────────────────────

function pct(completed, total) {
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

function deriveEpicStatus(byStatus) {
  const { pending, 'in-progress': inProg, qa, done, blocked } = byStatus;
  const total = pending + inProg + qa + done + blocked;
  if (total === 0) return 'pending';
  if (done === total) return 'completed';
  if (inProg > 0 || qa > 0) return 'in-progress';
  if (blocked > 0 && inProg === 0) return 'blocked';
  return 'pending';
}

// ─── UAC body parsing & reconciliation ───────────────────────────────────────

/**
 * Parse the "## User Acceptance Criteria" section from a story markdown body.
 * Returns null if no UAC section exists or no UAC lines were found.
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
  return { total, completed, pending, byType, completionPct: pct(completed, total) };
}

/**
 * Return a new body string with all `- [ ] TAG: ...` lines checked off (except N/A).
 * Used to sync body checkboxes when a story is already in done/.
 */
function checkOffAllUACs(body) {
  return body.replace(
    /^(- \[)\s*(\] \w+: (?!N\/A).+)$/gm,
    '$1x$2',
  );
}

/**
 * Reconcile a single story file:
 *  1. Count `[x]` / `[ ]` checkboxes in the UAC body section.
 *  2. Update frontmatter UAC stats from body counts.
 *  3. Derive new story_status (forward-only: never moves a done/ story backward;
 *     unchecked boxes in done/ stories are checked off instead).
 *  4. Move file to the correct status dir if status changed.
 *
 * Returns { changed, moved, from, to }.
 */
function reconcileStory(filePath, currentStatusDir, epicDirPath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data: fm, content: body } = matter(raw);
  const uacCounts = parseBodyUACs(body);
  const now = new Date().toISOString();

  let targetStatus = currentStatusDir;
  let newBody = body;

  if (uacCounts) {
    if (currentStatusDir === 'done') {
      // Already done — check off any unchecked boxes but don't move the file back
      if (uacCounts.completed < uacCounts.total) newBody = checkOffAllUACs(body);
      targetStatus = 'done';
    } else if (currentStatusDir !== 'blocked') {
      // Forward-only promotion
      if (uacCounts.completionPct === 100)    targetStatus = 'done';
      else if (uacCounts.completed > 0)       targetStatus = 'in-progress';
      else                                    targetStatus = 'pending';
    }
  }

  // If in done/ but no UAC section (or zero UAC lines), keep done and fill counts
  const counts = uacCounts
    ? (currentStatusDir === 'done'
      ? { ...uacCounts, completed: uacCounts.total, pending: 0, completionPct: 100, byType: uacCounts.byType }
      : uacCounts)
    : {
        total:         fm.uac_total         || 0,
        completed:     currentStatusDir === 'done' ? (fm.uac_total || 0) : (fm.uac_completed || 0),
        pending:       currentStatusDir === 'done' ? 0 : (fm.uac_pending  || 0),
        byType:        fm.uac_by_type        || { fe: 0, be: 0, db: 0, devops: 0, cli: 0, test: 0 },
        completionPct: currentStatusDir === 'done' ? 100 : (fm.uac_completion_pct || 0),
      };

  const newFm = {
    ...fm,
    story_status:       targetStatus,
    uac_total:          counts.total,
    uac_completed:      counts.completed,
    uac_pending:        counts.pending,
    uac_completion_pct: counts.completionPct,
    uac_by_type:        counts.byType,
    updated_at:         now,
  };
  if (targetStatus === 'done' && !fm.completed_at) newFm.completed_at = now;

  const uacChanged    = fm.uac_completed !== counts.completed ||
                        fm.uac_pending   !== counts.pending   ||
                        fm.uac_total     !== counts.total;
  const statusChanged = targetStatus !== currentStatusDir;
  const bodyChanged   = newBody !== body;

  if (!uacChanged && !statusChanged && !bodyChanged) return { changed: false, moved: false };

  const updated = matter.stringify(newBody, newFm);

  if (statusChanged) {
    const newDir  = path.join(epicDirPath, targetStatus);
    if (!fs.existsSync(newDir)) fs.mkdirSync(newDir, { recursive: true });
    const newPath = path.join(newDir, path.basename(filePath));
    fs.writeFileSync(newPath, updated, 'utf-8');
    fs.unlinkSync(filePath);
    process.stderr.write(`  Moved:   ${path.basename(filePath)}  ${currentStatusDir}/ → ${targetStatus}/\n`);
    return { changed: true, moved: true, from: currentStatusDir, to: targetStatus };
  }

  fs.writeFileSync(filePath, updated, 'utf-8');
  if (uacChanged || bodyChanged) {
    process.stderr.write(`  Updated: ${path.basename(filePath)}\n`);
  }
  return { changed: true, moved: false };
}

/**
 * Run reconcile across all discovered epics.
 * Returns aggregate { movedCount, changedCount }.
 */
function reconcileEpics(epics, epicsPath) {
  let movedCount = 0, changedCount = 0;
  for (const epic of epics) {
    const epicDirPath = path.join(epicsPath, epic.epicDir);
    for (const story of epic.stories) {
      const absPath = path.resolve(process.cwd(), story.filePath);
      const result  = reconcileStory(absPath, story.storyStatus, epicDirPath);
      if (result.changed) changedCount++;
      if (result.moved)   movedCount++;
    }
  }
  process.stderr.write(`\nReconcile: ${changedCount} file(s) updated, ${movedCount} moved.\n`);
  return { movedCount, changedCount };
}

// ─── Read one story file ──────────────────────────────────────────────────────

function readStoryFile(filePath, statusDir) {
  const { data: fm } = readFile(filePath);
  return {
    filePath:             path.relative(process.cwd(), filePath),
    storyId:              fm.story_id              || null,
    storyName:            fm.story_name            || path.basename(filePath, '.md'),
    storyStatus:          statusDir,               // directory is the authoritative status
    priority:             fm.priority              || 'medium',
    storyPoints:          Number(fm.story_points)  || 0,
    uacTotal:             Number(fm.uac_total)     || 0,
    uacCompleted:         Number(fm.uac_completed) || 0,
    uacPending:           Number(fm.uac_pending)   || 0,
    uacCompletionPct:     Number(fm.uac_completion_pct) || 0,
    uacByType:            fm.uac_by_type           || { fe: 0, be: 0, db: 0, devops: 0, cli: 0, test: 0 },
    testUnitStatus:       fm.test_unit_status       || 'pending',
    testE2eStatus:        fm.test_e2e_status        || 'pending',
    testIntegrationStatus: fm.test_integration_status || 'pending',
    completedAt:          fm.completed_at           || null,
    tags:                 fm.tags                   || [],
    dependencies:         fm.dependencies           || [],
  };
}

// ─── Read one epic directory ──────────────────────────────────────────────────

function readEpic(epicDirName, epicDirPath) {
  const epicMdPath = path.join(epicDirPath, 'epic.md');
  const { data: fm, content: body } = readFile(epicMdPath);

  // Aggregate stories from all status dirs
  const stories  = [];
  const byStatus = { pending: 0, 'in-progress': 0, qa: 0, done: 0, blocked: 0, bugs: 0 };

  for (const statusDir of STATUS_DIRS) {
    const statusPath = path.join(epicDirPath, statusDir);
    if (!fs.existsSync(statusPath)) continue;

    const files = fs.readdirSync(statusPath).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const story = readStoryFile(path.join(statusPath, file), statusDir);
      stories.push(story);
      byStatus[statusDir] = (byStatus[statusDir] || 0) + 1;
    }
  }

  // Exclude bugs from point/story counts (they're tracked separately)
  const nonBugStories = stories.filter(s => s.storyStatus !== 'bugs');

  const totalStories     = nonBugStories.length;
  const completedStories = byStatus.done;
  const totalPoints      = nonBugStories.reduce((n, s) => n + s.storyPoints, 0);
  const completedPoints  = nonBugStories.filter(s => s.storyStatus === 'done').reduce((n, s) => n + s.storyPoints, 0);
  const completionPct    = pct(completedPoints, totalPoints);
  const epicStatus       = deriveEpicStatus(byStatus);

  // UAC aggregates across all stories in this epic
  const uacTotal         = nonBugStories.reduce((n, s) => n + s.uacTotal, 0);
  const uacCompleted     = nonBugStories.reduce((n, s) => n + s.uacCompleted, 0);
  const uacPending       = nonBugStories.reduce((n, s) => n + s.uacPending, 0);
  const uacCompletionPct = pct(uacCompleted, uacTotal);
  const uacByType        = nonBugStories.reduce(
    (acc, s) => {
      acc.fe      += (s.uacByType.fe      || 0);
      acc.be      += (s.uacByType.be      || 0);
      acc.db      += (s.uacByType.db      || 0);
      acc.devops  += (s.uacByType.devops  || 0);
      acc.cli     += (s.uacByType.cli     || 0);
      acc.test    += (s.uacByType.test    || 0);
      return acc;
    },
    { fe: 0, be: 0, db: 0, devops: 0, cli: 0, test: 0 },
  );

  // Detect stale epic.md stats so --update knows what to rewrite
  const statsChanged =
    fm.total_stories      !== totalStories      ||
    fm.completed_stories  !== completedStories  ||
    fm.total_points       !== totalPoints       ||
    fm.completed_points   !== completedPoints   ||
    fm.completion_pct     !== completionPct     ||
    fm.epic_status        !== epicStatus;

  return {
    // Prefer the directory-name prefix as the canonical epic ID — it is always
    // the plain string "010", "009", etc.  Falling back to fm.epic_id is
    // dangerous because bare leading-zero integers in YAML (e.g. `010`) are
    // parsed as octal by gray-matter (010 octal = 8 decimal), so fm.epic_id
    // may already be the corrupted integer 8 by the time we read it here.
    epicId:           epicDirName.match(/^(\d{3})/)?.[1] || String(fm.epic_id).padStart(3, '0') || epicDirName,
    epicName:         fm.epic_name    || epicDirName,
    epicDir:          epicDirName,
    epicVersion:      fm.epic_version || null,
    epicStatus,
    priority:         fm.priority     || 'medium',
    totalStories,
    completedStories,
    totalPoints,
    completedPoints,
    completionPct,
    byStatus,
    uacTotal,
    uacCompleted,
    uacPending,
    uacCompletionPct,
    uacByType,
    statsChanged,
    stories,
    // kept private for --update; stripped from JSON output
    _epicMdPath: epicMdPath,
    _epicFm:     fm,
    _epicBody:   body,
  };
}

// ─── Update epic.md ───────────────────────────────────────────────────────────

function writeEpicStats(epic) {
  const now = new Date().toISOString();
  const newFm = {
    ...epic._epicFm,
    // Force epic_id to a quoted string — bare leading-zero numbers (e.g. 010) are
    // parsed as octal by YAML (010 → 8). String() + padStart ensures '010' round-trips.
    epic_id:           epic.epicId,
    epic_status:       epic.epicStatus,
    total_stories:     epic.totalStories,
    completed_stories: epic.completedStories,
    total_points:      epic.totalPoints,
    completed_points:  epic.completedPoints,
    completion_pct:    epic.completionPct,
    stories_by_status: {
      pending:         epic.byStatus.pending,
      'in-progress':   epic.byStatus['in-progress'],
      qa:              epic.byStatus.qa,
      done:            epic.byStatus.done,
      blocked:         epic.byStatus.blocked,
    },
    updated_at: now,
  };
  return updateFrontmatter(epic._epicMdPath, newFm);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const { docsPath, update, reconcile, epicFilter, output } = parseArgs();
  const epicsPath = path.resolve(docsPath, 'epics');

  if (!fs.existsSync(epicsPath)) {
    process.stderr.write(`Error: docs/epics/ not found at ${epicsPath}\nRun /migrate or /sync-board first.\n`);
    process.exit(1);
  }

  // Discover epic directories (must start with 3 digits + dash)
  const epicDirs = fs.readdirSync(epicsPath)
    .filter(d => {
      if (!/^\d{3}-/.test(d)) return false;
      return fs.statSync(path.join(epicsPath, d)).isDirectory();
    })
    .sort();

  // Apply optional --epic filter
  const filteredDirs = epicFilter
    ? epicDirs.filter(d => d.startsWith(epicFilter))
    : epicDirs;

  if (filteredDirs.length === 0 && epicFilter) {
    process.stderr.write(`Warning: no epics found matching filter "${epicFilter}"\n`);
  }

  // Read all epics
  let epics = filteredDirs.map(d => readEpic(d, path.join(epicsPath, d)));

  // --reconcile: sync story frontmatter + body from UAC checkboxes, move files
  if (reconcile) {
    reconcileEpics(epics, epicsPath);
    // Re-read after file moves so downstream stats are accurate
    epics = filteredDirs.map(d => readEpic(d, path.join(epicsPath, d)));
  }

  // --update (or implied by --reconcile): rewrite stale epic.md files
  if (update) {
    let updatedCount = 0;
    for (const epic of epics) {
      if (epic.statsChanged) {
        const ok = writeEpicStats(epic);
        if (ok) {
          updatedCount++;
          process.stderr.write(`  Updated: ${epic.epicDir}/epic.md\n`);
        }
      }
    }
    process.stderr.write(`\nUpdated ${updatedCount} of ${epics.length} epic.md file(s).\n`);
  }

  // Build overall aggregation (bugs excluded)
  const allStories = epics.flatMap(e => e.stories.filter(s => s.storyStatus !== 'bugs'));

  const overall = {
    totalEpics:        epics.length,
    completedEpics:    epics.filter(e => e.epicStatus === 'completed').length,
    activeEpics:       epics.filter(e => e.epicStatus === 'in-progress').length,
    pendingEpics:      epics.filter(e => e.epicStatus === 'pending').length,
    totalStories:      allStories.length,
    completedStories:  allStories.filter(s => s.storyStatus === 'done').length,
    inProgressStories: allStories.filter(s => s.storyStatus === 'in-progress').length,
    qaStories:         allStories.filter(s => s.storyStatus === 'qa').length,
    pendingStories:    allStories.filter(s => s.storyStatus === 'pending').length,
    blockedStories:    allStories.filter(s => s.storyStatus === 'blocked').length,
    totalPoints:       allStories.reduce((n, s) => n + s.storyPoints, 0),
    completedPoints:   allStories.filter(s => s.storyStatus === 'done').reduce((n, s) => n + s.storyPoints, 0),
    inProgressPoints:  allStories.filter(s => s.storyStatus === 'in-progress').reduce((n, s) => n + s.storyPoints, 0),
    pendingPoints:     allStories.filter(s => s.storyStatus === 'pending').reduce((n, s) => n + s.storyPoints, 0),
    completionPct:     0,
    uacTotal:          allStories.reduce((n, s) => n + s.uacTotal, 0),
    uacCompleted:      allStories.reduce((n, s) => n + s.uacCompleted, 0),
    uacPending:        allStories.reduce((n, s) => n + s.uacPending, 0),
    uacCompletionPct:  0,
    uacByType:         allStories.reduce(
      (acc, s) => {
        acc.fe     += (s.uacByType.fe     || 0);
        acc.be     += (s.uacByType.be     || 0);
        acc.db     += (s.uacByType.db     || 0);
        acc.devops += (s.uacByType.devops || 0);
        acc.cli    += (s.uacByType.cli    || 0);
        acc.test   += (s.uacByType.test   || 0);
        return acc;
      },
      { fe: 0, be: 0, db: 0, devops: 0, cli: 0, test: 0 },
    ),
  };
  overall.completionPct    = pct(overall.completedPoints, overall.totalPoints);
  overall.uacCompletionPct = pct(overall.uacCompleted, overall.uacTotal);

  // Strip internal fields from output
  const epicOutput = epics.map(({ _epicMdPath, _epicFm, _epicBody, ...rest }) => rest);

  const result = {
    generatedAt: new Date().toISOString(),
    docsPath:    path.resolve(docsPath),
    overall,
    epics: epicOutput,
  };

  if (output === 'table') {
    printTable(result);
  } else {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  }
}

// ─── Table output ─────────────────────────────────────────────────────────────

function padEnd(str, len) {
  return String(str).slice(0, len).padEnd(len);
}

function printTable({ overall, epics }) {
  const o = overall;
  process.stdout.write('\n📊 Project Overview\n');
  process.stdout.write(`   ${o.completionPct}% complete — ${o.completedStories}/${o.totalStories} stories, ${o.completedPoints}/${o.totalPoints} pts\n`);
  process.stdout.write(`   Epics: ${o.completedEpics} done · ${o.activeEpics} active · ${o.pendingEpics} pending\n\n`);

  const cols = [5, 42, 12, 10, 12, 6];
  const head = ['ID', 'Epic', 'Status', 'Stories', 'Points', 'Done'];
  const divider = cols.map(w => '─'.repeat(w)).join(' ');

  process.stdout.write(cols.map((w, i) => padEnd(head[i], w)).join(' ') + '\n');
  process.stdout.write(divider + '\n');

  for (const e of epics) {
    const statusIcon = { completed: '✅', 'in-progress': '🚧', pending: '⏳', blocked: '⏸️' }[e.epicStatus] || '?';
    const row = [
      e.epicId,
      e.epicName,
      `${statusIcon} ${e.epicStatus}`,
      `${e.completedStories}/${e.totalStories}`,
      `${e.completedPoints}/${e.totalPoints}`,
      `${e.completionPct}%`,
    ];
    process.stdout.write(cols.map((w, i) => padEnd(row[i], w)).join(' ') + '\n');
  }
  process.stdout.write('\n');
}

main();
