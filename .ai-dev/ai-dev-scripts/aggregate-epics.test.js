#!/usr/bin/env node
/**
 * aggregate-epics.test.js
 *
 * Unit + integration tests for aggregate-epics.js.
 * Uses Node 18+ built-in test runner (node:test + node:assert).
 *
 * Run:
 *   node --test .ai-dev/ai-dev-scripts/aggregate-epics.test.js
 *   node --test --test-reporter=spec .ai-dev/ai-dev-scripts/aggregate-epics.test.js
 */

'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs   = require('node:fs');
const path = require('node:path');
const os   = require('node:os');
const { execSync } = require('node:child_process');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a minimal docs/epics/ fixture under a temp directory.
 * Returns the tmpDir path.
 */
function buildFixture(epics) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agg-epics-test-'));
  const epicsDir = path.join(tmpDir, 'docs', 'epics');
  fs.mkdirSync(epicsDir, { recursive: true });

  for (const epic of epics) {
    const epicDir = path.join(epicsDir, epic.dir);
    fs.mkdirSync(epicDir);

    // Write epic.md
    fs.writeFileSync(
      path.join(epicDir, 'epic.md'),
      buildEpicMd(epic),
      'utf-8',
    );

    // Create status subdirs and story files
    const statusDirs = ['pending', 'in-progress', 'qa', 'done', 'blocked', 'bugs'];
    for (const sd of statusDirs) {
      fs.mkdirSync(path.join(epicDir, sd));
    }

    for (const story of epic.stories || []) {
      const storyDir = path.join(epicDir, story.status);
      fs.writeFileSync(
        path.join(storyDir, `${story.file}`),
        buildStoryMd(story),
        'utf-8',
      );
    }
  }
  return tmpDir;
}

function buildEpicMd({ id, name, status = 'pending', version = 'v1.0.0',
                        totalStories = 0, completedStories = 0,
                        totalPoints = 0, completedPoints = 0, completionPct = 0 }) {
  return `---
epic_id: "${id}"
epic_name: "${name}"
epic_status: ${status}
epic_version: "${version}"
priority: high
total_stories: ${totalStories}
completed_stories: ${completedStories}
total_points: ${totalPoints}
completed_points: ${completedPoints}
completion_pct: ${completionPct}
stories_by_status:
  pending: 0
  in-progress: 0
  qa: 0
  done: 0
  blocked: 0
created_at: "2026-01-01T00:00:00Z"
updated_at: "2026-01-01T00:00:00Z"
---

# Epic ${id}: ${name}

Test epic description.
`;
}

function buildStoryMd({ id, name, status, points = 5,
                         uacTotal = 4, uacCompleted = 2,
                         fe = 1, be = 1, cli = 1, test = 1,
                         uacBodyLines = null }) {
  const uacPending = uacTotal - uacCompleted;
  const uacPct = uacTotal === 0 ? 0 : Math.round((uacCompleted / uacTotal) * 100);

  // Default UAC body: 1 FE + 1 BE + 1 CLI + 1 TEST lines, partially checked
  const defaultUACBody = `
- [x] FE: Frontend task
- [x] BE: Backend task
- [ ] CLI: CLI task
- [ ] TEST: Test task`;

  const uacBody = uacBodyLines !== null ? '\n' + uacBodyLines.join('\n') : defaultUACBody;

  return `---
story_id: "${id}"
epic_id: "${id.split('-')[0]}"
story_name: "${name}"
story_status: ${status}
priority: high
story_points: ${points}
assignees: []
tags: [v1.0.0]
dependencies: []
created_at: "2026-01-01T00:00:00Z"
updated_at: "2026-01-01T00:00:00Z"
completed_at: ${status === 'done' ? '"2026-01-15T00:00:00Z"' : 'null'}
uac_total: ${uacTotal}
uac_completed: ${uacCompleted}
uac_pending: ${uacPending}
uac_completion_pct: ${uacPct}
uac_by_type:
  fe: ${fe}
  be: ${be}
  db: 0
  devops: 0
  cli: ${cli}
  test: ${test}
test_coverage: null
test_unit_status: "pending"
test_e2e_status: "pending"
test_integration_status: "pending"
---

## Description

Test story.

## User Acceptance Criteria
${uacBody}
`;
}

/** Run the script and return parsed JSON output. stderr goes to process.stderr. */
function runScript(tmpDir, extraArgs = '') {
  const scriptPath = path.resolve(__dirname, 'aggregate-epics.js');
  const docsPath   = path.join(tmpDir, 'docs');
  const stdout = execSync(
    `node "${scriptPath}" --docs-path="${docsPath}" ${extraArgs}`,
    { encoding: 'utf-8' },
  );
  return JSON.parse(stdout);
}

/**
 * Run with --reconcile; stderr is suppressed (reconcile writes progress there).
 * Returns the parsed JSON result after reconciliation.
 */
function runReconcile(tmpDir, extraArgs = '') {
  const scriptPath = path.resolve(__dirname, 'aggregate-epics.js');
  const docsPath   = path.join(tmpDir, 'docs');
  const stdout = execSync(
    `node "${scriptPath}" --docs-path="${docsPath}" --reconcile ${extraArgs}`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] },
  );
  return JSON.parse(stdout);
}

/** Run the script expecting it to fail; returns { status, stderr }. */
function runScriptFail(tmpDir, extraArgs = '') {
  const scriptPath = path.resolve(__dirname, 'aggregate-epics.js');
  const docsPath   = path.join(tmpDir, 'docs');
  try {
    execSync(`node "${scriptPath}" --docs-path="${docsPath}" ${extraArgs}`, { encoding: 'utf-8' });
    return { status: 0, stderr: '' };
  } catch (err) {
    return { status: err.status, stderr: err.stderr };
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('aggregate-epics.js', () => {

  // ── Output shape ───────────────────────────────────────────────────────────

  describe('output shape', () => {
    let result;
    let tmpDir;

    before(() => {
      tmpDir = buildFixture([
        {
          dir: '001-mvp',
          id: '001', name: 'MVP',
          stories: [
            { id: '001-001', name: 'Story A', status: 'done',    file: '001-001-story-a.md', points: 3, uacTotal: 4, uacCompleted: 4, fe: 1, be: 1, cli: 1, test: 1 },
            { id: '001-002', name: 'Story B', status: 'pending', file: '001-002-story-b.md', points: 5, uacTotal: 6, uacCompleted: 0, fe: 2, be: 2, cli: 1, test: 1 },
          ],
        },
      ]);
      result = runScript(tmpDir);
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('has generatedAt, docsPath, overall, epics keys', () => {
      assert.ok(result.generatedAt);
      assert.ok(result.docsPath);
      assert.ok(result.overall);
      assert.ok(Array.isArray(result.epics));
    });

    it('does not expose internal _epic* keys', () => {
      const epic = result.epics[0];
      assert.ok(!('_epicMdPath' in epic));
      assert.ok(!('_epicFm' in epic));
      assert.ok(!('_epicBody' in epic));
    });
  });

  // ── Story aggregation ──────────────────────────────────────────────────────

  describe('story counts and points', () => {
    let result;
    let tmpDir;

    before(() => {
      tmpDir = buildFixture([
        {
          dir: '001-features',
          id: '001', name: 'Features',
          stories: [
            { id: '001-001', name: 'Done story',       status: 'done',        file: '001-001.md', points: 8,  uacTotal: 4, uacCompleted: 4, fe:1, be:1, cli:1, test:1 },
            { id: '001-002', name: 'In progress',      status: 'in-progress', file: '001-002.md', points: 5,  uacTotal: 6, uacCompleted: 3, fe:2, be:2, cli:1, test:1 },
            { id: '001-003', name: 'Pending story',    status: 'pending',     file: '001-003.md', points: 13, uacTotal: 8, uacCompleted: 0, fe:2, be:2, cli:2, test:2 },
          ],
        },
      ]);
      result = runScript(tmpDir);
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('counts total stories correctly (bugs excluded)', () => {
      assert.equal(result.overall.totalStories, 3);
    });

    it('counts completed stories', () => {
      assert.equal(result.overall.completedStories, 1);
    });

    it('counts in-progress stories', () => {
      assert.equal(result.overall.inProgressStories, 1);
    });

    it('counts pending stories', () => {
      assert.equal(result.overall.pendingStories, 1);
    });

    it('sums total points', () => {
      assert.equal(result.overall.totalPoints, 26);
    });

    it('sums completed points', () => {
      assert.equal(result.overall.completedPoints, 8);
    });

    it('calculates overall completionPct', () => {
      assert.equal(result.overall.completionPct, Math.round(8 / 26 * 100));
    });

    it('epic byStatus counts match', () => {
      const epic = result.epics[0];
      assert.equal(epic.byStatus.done, 1);
      assert.equal(epic.byStatus['in-progress'], 1);
      assert.equal(epic.byStatus.pending, 1);
    });
  });

  // ── UAC aggregation ────────────────────────────────────────────────────────

  describe('UAC aggregation', () => {
    let result;
    let tmpDir;

    before(() => {
      tmpDir = buildFixture([
        {
          dir: '001-uac-test',
          id: '001', name: 'UAC Test',
          stories: [
            // uacTotal:4, uacCompleted:4, fe:1, be:1, cli:1, test:1
            { id: '001-001', name: 'Full UAC', status: 'done', file: '001-001.md', points: 5, uacTotal: 4, uacCompleted: 4, fe: 1, be: 1, cli: 1, test: 1 },
            // uacTotal:6, uacCompleted:2, fe:2, be:2, cli:1, test:1
            { id: '001-002', name: 'Partial UAC', status: 'pending', file: '001-002.md', points: 5, uacTotal: 6, uacCompleted: 2, fe: 2, be: 2, cli: 1, test: 1 },
          ],
        },
      ]);
      result = runScript(tmpDir);
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('sums uacTotal across all stories in overall', () => {
      assert.equal(result.overall.uacTotal, 10);
    });

    it('sums uacCompleted across all stories in overall', () => {
      assert.equal(result.overall.uacCompleted, 6);
    });

    it('calculates uacPending', () => {
      assert.equal(result.overall.uacPending, 4);
    });

    it('calculates uacCompletionPct', () => {
      assert.equal(result.overall.uacCompletionPct, 60);
    });

    it('sums uacByType.fe', () => {
      assert.equal(result.overall.uacByType.fe, 3);
    });

    it('sums uacByType.be', () => {
      assert.equal(result.overall.uacByType.be, 3);
    });

    it('sums uacByType.cli', () => {
      assert.equal(result.overall.uacByType.cli, 2);
    });

    it('aggregates uac stats at epic level too', () => {
      const epic = result.epics[0];
      assert.equal(epic.uacTotal, 10);
      assert.equal(epic.uacCompleted, 6);
      assert.equal(epic.uacCompletionPct, 60);
    });
  });

  // ── Epic status derivation ─────────────────────────────────────────────────

  describe('epic status derivation', () => {
    let tmpDir;

    after(() => tmpDir && fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('marks epic as completed when all stories are done', () => {
      tmpDir = buildFixture([{
        dir: '001-done-epic', id: '001', name: 'Done',
        stories: [
          { id: '001-001', name: 'S1', status: 'done', file: '001-001.md', points: 3, uacTotal: 2, uacCompleted: 2, fe:1, be:1, cli:0, test:0 },
          { id: '001-002', name: 'S2', status: 'done', file: '001-002.md', points: 3, uacTotal: 2, uacCompleted: 2, fe:1, be:1, cli:0, test:0 },
        ],
      }]);
      const result = runScript(tmpDir);
      assert.equal(result.epics[0].epicStatus, 'completed');
    });

    it('marks epic as in-progress when at least one story is in-progress', () => {
      tmpDir = buildFixture([{
        dir: '001-active', id: '001', name: 'Active',
        stories: [
          { id: '001-001', name: 'S1', status: 'done',        file: '001-001.md', points: 3, uacTotal: 2, uacCompleted: 2, fe:1, be:1, cli:0, test:0 },
          { id: '001-002', name: 'S2', status: 'in-progress', file: '001-002.md', points: 3, uacTotal: 2, uacCompleted: 1, fe:1, be:1, cli:0, test:0 },
        ],
      }]);
      const result = runScript(tmpDir);
      assert.equal(result.epics[0].epicStatus, 'in-progress');
    });

    it('marks epic as pending when all stories are pending', () => {
      tmpDir = buildFixture([{
        dir: '001-fresh', id: '001', name: 'Fresh',
        stories: [
          { id: '001-001', name: 'S1', status: 'pending', file: '001-001.md', points: 5, uacTotal: 3, uacCompleted: 0, fe:1, be:1, cli:1, test:0 },
        ],
      }]);
      const result = runScript(tmpDir);
      assert.equal(result.epics[0].epicStatus, 'pending');
    });
  });

  // ── Epic filter ────────────────────────────────────────────────────────────

  describe('--epic filter', () => {
    let result;
    let tmpDir;

    before(() => {
      tmpDir = buildFixture([
        { dir: '001-alpha', id: '001', name: 'Alpha', stories: [] },
        { dir: '002-beta',  id: '002', name: 'Beta',  stories: [] },
        { dir: '003-gamma', id: '003', name: 'Gamma', stories: [] },
      ]);
      result = runScript(tmpDir, '--epic=002');
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('returns only the filtered epic', () => {
      assert.equal(result.epics.length, 1);
      assert.equal(result.epics[0].epicId, '002');
    });
  });

  // ── Bugs excluded from story/point counts ─────────────────────────────────

  describe('bugs directory exclusion', () => {
    let result;
    let tmpDir;

    before(() => {
      tmpDir = buildFixture([{
        dir: '001-with-bugs', id: '001', name: 'With Bugs',
        stories: [
          { id: '001-001',     name: 'Normal story', status: 'done', file: '001-001.md',     points: 8, uacTotal: 4, uacCompleted: 4, fe:1, be:1, cli:1, test:1 },
          { id: '001-bug-001', name: 'A bug',        status: 'bugs', file: '001-bug-001.md', points: 3, uacTotal: 2, uacCompleted: 0, fe:0, be:1, cli:0, test:1 },
        ],
      }]);
      result = runScript(tmpDir);
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('excludes bug-status stories from totalStories', () => {
      assert.equal(result.overall.totalStories, 1);
    });

    it('excludes bug-status stories from totalPoints', () => {
      assert.equal(result.overall.totalPoints, 8);
    });

    it('tracks bugs in byStatus.bugs counter', () => {
      assert.equal(result.epics[0].byStatus.bugs, 1);
    });
  });

  // ── --update flag ─────────────────────────────────────────────────────────

  describe('--update flag rewrites stale epic.md stats', () => {
    let tmpDir;
    let epicMdPath;

    before(() => {
      tmpDir = buildFixture([{
        dir: '001-stale',
        id: '001', name: 'Stale Stats',
        // epic.md starts with zeroed stats (stale)
        totalStories: 0, completedStories: 0, totalPoints: 0, completedPoints: 0, completionPct: 0,
        stories: [
          { id: '001-001', name: 'Done A', status: 'done', file: '001-001.md', points: 5, uacTotal: 2, uacCompleted: 2, fe:1, be:1, cli:0, test:0 },
          { id: '001-002', name: 'Done B', status: 'done', file: '001-002.md', points: 8, uacTotal: 4, uacCompleted: 4, fe:1, be:1, cli:1, test:1 },
        ],
      }]);
      epicMdPath = path.join(tmpDir, 'docs', 'epics', '001-stale', 'epic.md');
      // Run with --update
      runScript(tmpDir, '--update');
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('rewrites total_stories in epic.md', () => {
      const matter = require('gray-matter');
      const { data } = matter(fs.readFileSync(epicMdPath, 'utf-8'));
      assert.equal(data.total_stories, 2);
    });

    it('rewrites completed_stories in epic.md', () => {
      const matter = require('gray-matter');
      const { data } = matter(fs.readFileSync(epicMdPath, 'utf-8'));
      assert.equal(data.completed_stories, 2);
    });

    it('rewrites total_points in epic.md', () => {
      const matter = require('gray-matter');
      const { data } = matter(fs.readFileSync(epicMdPath, 'utf-8'));
      assert.equal(data.total_points, 13);
    });

    it('rewrites epic_status to completed in epic.md', () => {
      const matter = require('gray-matter');
      const { data } = matter(fs.readFileSync(epicMdPath, 'utf-8'));
      assert.equal(data.epic_status, 'completed');
    });

    it('updates updated_at timestamp', () => {
      const matter = require('gray-matter');
      const { data } = matter(fs.readFileSync(epicMdPath, 'utf-8'));
      assert.notEqual(data.updated_at, '2026-01-01T00:00:00Z');
    });
  });

  // ── Missing docs/epics/ ───────────────────────────────────────────────────

  describe('error handling', () => {
    it('exits with code 1 when docs/epics/ does not exist', () => {
      const emptyTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agg-epics-empty-'));
      fs.mkdirSync(path.join(emptyTmp, 'docs'));
      try {
        const { status } = runScriptFail(emptyTmp);
        assert.equal(status, 1);
      } finally {
        fs.rmSync(emptyTmp, { recursive: true, force: true });
      }
    });

    it('skips non-directory entries in docs/epics/', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agg-epics-junk-'));
      const epicsDir = path.join(tmpDir, 'docs', 'epics');
      fs.mkdirSync(epicsDir, { recursive: true });
      // Stray file — should be ignored, not crash
      fs.writeFileSync(path.join(epicsDir, 'README.md'), '# Epics\n', 'utf-8');
      // Valid epic alongside it
      const epicDir = path.join(epicsDir, '001-valid');
      fs.mkdirSync(epicDir);
      fs.writeFileSync(path.join(epicDir, 'epic.md'), buildEpicMd({ id: '001', name: 'Valid' }), 'utf-8');
      ['pending','in-progress','qa','done','blocked','bugs'].forEach(sd =>
        fs.mkdirSync(path.join(epicDir, sd)));
      try {
        const result = runScript(tmpDir);
        assert.equal(result.epics.length, 1);
        assert.equal(result.epics[0].epicId, '001');
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  // ── statsChanged detection ─────────────────────────────────────────────────

  describe('statsChanged flag', () => {
    it('sets statsChanged=true when epic.md totals are stale', () => {
      const tmpDir = buildFixture([{
        dir: '001-stale', id: '001', name: 'Stale',
        totalStories: 99,  // intentionally wrong
        stories: [
          { id: '001-001', name: 'S', status: 'pending', file: '001-001.md', points: 5, uacTotal: 2, uacCompleted: 0, fe:1, be:1, cli:0, test:0 },
        ],
      }]);
      try {
        const result = runScript(tmpDir);
        assert.equal(result.epics[0].statsChanged, true);
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it('sets statsChanged=false when epic.md stats already match', () => {
      const tmpDir = buildFixture([{
        dir: '001-fresh', id: '001', name: 'Fresh',
        totalStories: 1, completedStories: 0, totalPoints: 5, completedPoints: 0, completionPct: 0,
        stories: [
          { id: '001-001', name: 'S', status: 'pending', file: '001-001.md', points: 5, uacTotal: 2, uacCompleted: 0, fe:1, be:1, cli:0, test:0 },
        ],
      }]);
      try {
        const result = runScript(tmpDir);
        assert.equal(result.epics[0].statsChanged, false);
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  // ── --reconcile flag ──────────────────────────────────────────────────────

  describe('--reconcile: promotes story when body UACs are 100% checked', () => {
    let tmpDir, result;
    before(() => {
      tmpDir = buildFixture([{
        dir: '001-rec', id: '001', name: 'Rec Test',
        stories: [{
          id: '001-001', name: 'All Done', status: 'pending', file: '001-001.md',
          points: 5, uacTotal: 2, uacCompleted: 0, fe: 1, be: 1, cli: 0, test: 0,
          uacBodyLines: ['- [x] FE: Frontend done', '- [x] BE: Backend done'],
        }],
      }]);
      result = runReconcile(tmpDir);
    });
    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('story appears in done/ in aggregate result', () => {
      assert.equal(result.epics[0].byStatus.done, 1);
    });

    it('story is no longer counted as pending', () => {
      assert.equal(result.epics[0].byStatus.pending, 0);
    });

    it('epic is completed after reconcile', () => {
      assert.equal(result.epics[0].epicStatus, 'completed');
    });
  });

  describe('--reconcile: promotes story to in-progress when partially checked', () => {
    let tmpDir, result;
    before(() => {
      tmpDir = buildFixture([{
        dir: '001-partial', id: '001', name: 'Partial',
        stories: [{
          id: '001-001', name: 'Partial Done', status: 'pending', file: '001-001.md',
          points: 5, uacTotal: 2, uacCompleted: 0, fe: 1, be: 1, cli: 0, test: 0,
          uacBodyLines: ['- [x] FE: Frontend done', '- [ ] BE: Backend pending'],
        }],
      }]);
      result = runReconcile(tmpDir);
    });
    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('story appears in in-progress/ in aggregate result', () => {
      assert.equal(result.epics[0].byStatus['in-progress'], 1);
      assert.equal(result.epics[0].byStatus.pending, 0);
    });
  });

  describe('--reconcile: story in done/ with unchecked body boxes stays done', () => {
    let tmpDir, result, storyContent;
    const matter = require('gray-matter');
    before(() => {
      tmpDir = buildFixture([{
        dir: '001-done', id: '001', name: 'Already Done',
        completedStories: 1, totalStories: 1,
        stories: [{
          id: '001-001', name: 'Manually Done', status: 'done', file: '001-001.md',
          points: 5, uacTotal: 2, uacCompleted: 2, fe: 1, be: 1, cli: 0, test: 0,
          uacBodyLines: ['- [ ] FE: Frontend task', '- [ ] BE: Backend task'],
        }],
      }]);
      result = runReconcile(tmpDir);
      const doneDir = path.join(tmpDir, 'docs', 'epics', '001-done', 'done');
      const storyFile = fs.readdirSync(doneDir)[0];
      storyContent = fs.readFileSync(path.join(doneDir, storyFile), 'utf-8');
    });
    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('story remains in done/ (not moved back)', () => {
      assert.equal(result.epics[0].byStatus.done, 1);
      assert.equal(result.epics[0].byStatus.pending, 0);
    });

    it('body boxes are checked off by reconcile', () => {
      assert.ok(storyContent.includes('- [x] FE: Frontend task'), 'FE box should be checked');
      assert.ok(storyContent.includes('- [x] BE: Backend task'),  'BE box should be checked');
    });

    it('frontmatter uac_completion_pct set to 100', () => {
      const { data } = matter(storyContent);
      assert.equal(data.uac_completion_pct, 100);
    });
  });

  describe('--reconcile: story with no UAC lines is not moved', () => {
    let tmpDir, result;
    before(() => {
      tmpDir = buildFixture([{
        dir: '001-nouac', id: '001', name: 'No UAC',
        stories: [{
          id: '001-001', name: 'No UAC Story', status: 'pending', file: '001-001.md',
          points: 5, uacTotal: 0, uacCompleted: 0, fe: 0, be: 0, cli: 0, test: 0,
          uacBodyLines: [],
        }],
      }]);
      result = runReconcile(tmpDir);
    });
    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('story stays in pending when no UAC lines', () => {
      assert.equal(result.epics[0].byStatus.pending, 1);
      assert.equal(result.epics[0].byStatus.done, 0);
    });
  });

  describe('--reconcile: story in blocked/ is not auto-promoted', () => {
    let tmpDir, result;
    before(() => {
      tmpDir = buildFixture([{
        dir: '001-blocked', id: '001', name: 'Blocked',
        stories: [{
          id: '001-001', name: 'Blocked Story', status: 'blocked', file: '001-001.md',
          points: 5, uacTotal: 2, uacCompleted: 0, fe: 1, be: 1, cli: 0, test: 0,
          uacBodyLines: ['- [x] FE: Frontend done', '- [x] BE: Backend done'],
        }],
      }]);
      result = runReconcile(tmpDir);
    });
    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('blocked story is not moved to done', () => {
      assert.equal(result.epics[0].byStatus.blocked, 1);
      assert.equal(result.epics[0].byStatus.done, 0);
    });
  });

  describe('--reconcile: completed_at set when story promoted to done', () => {
    let tmpDir, storyContent;
    const matter = require('gray-matter');
    before(() => {
      tmpDir = buildFixture([{
        dir: '001-newdone', id: '001', name: 'New Done',
        stories: [{
          id: '001-001', name: 'Goes Done', status: 'pending', file: '001-001.md',
          points: 5, uacTotal: 2, uacCompleted: 0, fe: 1, be: 1, cli: 0, test: 0,
          uacBodyLines: ['- [x] FE: Done', '- [x] BE: Done'],
        }],
      }]);
      runReconcile(tmpDir);
      const doneDir = path.join(tmpDir, 'docs', 'epics', '001-newdone', 'done');
      const storyFile = fs.readdirSync(doneDir)[0];
      storyContent = fs.readFileSync(path.join(doneDir, storyFile), 'utf-8');
    });
    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('completed_at is set in frontmatter after promotion', () => {
      const { data } = matter(storyContent);
      assert.ok(data.completed_at, 'completed_at should be set');
    });
  });

  describe('--reconcile: N/A lines are not counted as UACs', () => {
    let tmpDir, result;
    before(() => {
      tmpDir = buildFixture([{
        dir: '001-na', id: '001', name: 'NA Test',
        stories: [{
          id: '001-001', name: 'With NA', status: 'pending', file: '001-001.md',
          points: 5, uacTotal: 1, uacCompleted: 0, fe: 0, be: 0, cli: 1, test: 0,
          uacBodyLines: ['- [ ] FE: N/A', '- [ ] BE: N/A', '- [x] CLI: CLI task done'],
        }],
      }]);
      result = runReconcile(tmpDir);
    });
    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('story promoted to done (only real UAC was checked)', () => {
      assert.equal(result.epics[0].byStatus.done, 1);
    });
  });

  // ── YAML octal-safe epic_id round-trip ────────────────────────────────────
  //
  // Leading-zero integers in bare YAML (e.g. `epic_id: 010`) are parsed as
  // octal by the YAML 1.1 spec → 010 octal = 8 decimal.  gray-matter follows
  // this, so without an explicit fix, a round-trip through --update would
  // rewrite `epic_id: 010` as `epic_id: 8`.  The fix in aggregate-epics.js
  // forces epic_id to a zero-padded string before writing.

  describe('YAML octal-safe epic_id: leading-zero id survives --update round-trip', () => {
    let tmpDir, epicMdPath;
    const matter = require('gray-matter');

    before(() => {
      // Write an epic.md with a *bare* (unquoted) leading-zero epic_id so
      // that gray-matter parses it as the integer 8.  After --update the fix
      // must ensure the written value is the string "010", not the number 8.
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agg-epics-octal-'));
      const epicsDir = path.join(tmpDir, 'docs', 'epics');
      const epicDir  = path.join(epicsDir, '010-monetisation');
      const statusDirs = ['pending','in-progress','qa','done','blocked','bugs'];
      statusDirs.forEach(sd => fs.mkdirSync(path.join(epicDir, sd), { recursive: true }));

      // Intentionally bare (unquoted) epic_id to trigger the octal parse.
      const epicMdContent = `---
epic_id: 010
epic_name: Monetisation Platform
epic_status: pending
epic_version: v1.8.0
priority: medium
total_stories: 0
completed_stories: 0
total_points: 0
completed_points: 0
completion_pct: 0
stories_by_status:
  pending: 0
  in-progress: 0
  qa: 0
  done: 0
  blocked: 0
created_at: "2026-01-01T00:00:00Z"
updated_at: "2026-01-01T00:00:00Z"
---

# Epic 010: Monetisation Platform

Test epic.
`;
      epicMdPath = path.join(epicDir, 'epic.md');
      fs.writeFileSync(epicMdPath, epicMdContent, 'utf-8');

      // Add one pending story so --update has real stats to write.
      const storyContent = buildStoryMd({
        id: '010-001', name: 'Container Architecture',
        status: 'pending', file: '010-001.md',
        points: 13, uacTotal: 2, uacCompleted: 0, fe: 1, be: 1, cli: 0, test: 0,
      });
      fs.writeFileSync(path.join(epicDir, 'pending', '010-001.md'), storyContent, 'utf-8');

      // Run --update to trigger the round-trip rewrite.
      const scriptPath = path.resolve(__dirname, 'aggregate-epics.js');
      const docsPath   = path.join(tmpDir, 'docs');
      execSync(`node "${scriptPath}" --docs-path="${docsPath}" --update`, { encoding: 'utf-8' });
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('epic_id is the string "010" after rewrite (not the integer 8)', () => {
      const { data } = matter(fs.readFileSync(epicMdPath, 'utf-8'));
      assert.strictEqual(typeof data.epic_id, 'string', 'epic_id must be a string');
      assert.equal(data.epic_id, '010');
    });

    it('epic_id round-trips without octal corruption (≠ 8)', () => {
      const { data } = matter(fs.readFileSync(epicMdPath, 'utf-8'));
      assert.notEqual(data.epic_id, 8, 'epic_id must not be corrupted to the octal value 8');
    });

    it('epic stats are still correct after rewrite', () => {
      const { data } = matter(fs.readFileSync(epicMdPath, 'utf-8'));
      assert.equal(data.total_stories, 1);
      assert.equal(data.total_points, 13);
      assert.equal(data.epic_status, 'pending');
    });
  });

  describe('--reconcile: implies --update, refreshes epic.md stats', () => {
    let tmpDir, epicMdContent;
    const matter = require('gray-matter');
    before(() => {
      tmpDir = buildFixture([{
        dir: '001-stale2', id: '001', name: 'Stale After Reconcile',
        totalStories: 99, completedStories: 0,
        stories: [{
          id: '001-001', name: 'Will Be Done', status: 'pending', file: '001-001.md',
          points: 8, uacTotal: 1, uacCompleted: 0, fe: 0, be: 0, cli: 1, test: 0,
          uacBodyLines: ['- [x] CLI: Done'],
        }],
      }]);
      runReconcile(tmpDir);
      const epicMdPath = path.join(tmpDir, 'docs', 'epics', '001-stale2', 'epic.md');
      epicMdContent = fs.readFileSync(epicMdPath, 'utf-8');
    });
    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('epic.md total_stories corrected to 1', () => {
      const { data } = matter(epicMdContent);
      assert.equal(data.total_stories, 1);
    });

    it('epic.md completed_stories set to 1 after story promoted to done', () => {
      const { data } = matter(epicMdContent);
      assert.equal(data.completed_stories, 1);
    });

    it('epic.md epic_status set to completed', () => {
      const { data } = matter(epicMdContent);
      assert.equal(data.epic_status, 'completed');
    });
  });

});
