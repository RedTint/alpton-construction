#!/usr/bin/env node
'use strict';

/**
 * create-story-file.test.js
 *
 * Tests for create-story-file.js.
 * Uses Node 18+ built-in test runner (node:test + node:assert).
 *
 * Run:
 *   node --test .ai-dev/ai-dev-scripts/create-story-file.test.js
 *   node --test --test-reporter=spec .ai-dev/ai-dev-scripts/create-story-file.test.js
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs   = require('node:fs');
const path = require('node:path');
const os   = require('node:os');
const { execSync } = require('node:child_process');
const matter = require('gray-matter');

const SCRIPT = path.resolve(__dirname, 'create-story-file.js');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a minimal docs/ fixture with one epic under a temp directory.
 * Returns { tmpDir, epicDirPath, docsPath }.
 */
function buildFixture({ epicId = '009', epicName = 'Test Epic', epicVersion = 'v1.7.0' } = {}) {
  const tmpDir   = fs.mkdtempSync(path.join(os.tmpdir(), 'csf-test-'));
  const docsPath = path.join(tmpDir, 'docs');
  const epicSlug = `${epicId}-test-epic`;
  const epicDirPath = path.join(docsPath, 'epics', epicSlug);

  fs.mkdirSync(epicDirPath, { recursive: true });
  for (const sd of ['pending', 'in-progress', 'qa', 'done', 'blocked', 'bugs']) {
    fs.mkdirSync(path.join(epicDirPath, sd));
  }

  fs.writeFileSync(path.join(epicDirPath, 'epic.md'), `---
epic_id: "${epicId}"
epic_name: "${epicName}"
epic_status: pending
epic_version: "${epicVersion}"
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

# Epic ${epicId}: ${epicName}
`, 'utf-8');

  return { tmpDir, docsPath, epicDirPath };
}

/**
 * Run create-story-file.js with given extra args.
 * Returns { stdout, stderr, status }.
 */
function runScript({ docsPath, epicId = '009', title = 'Test Story', extraArgs = '', expectFail = false }) {
  const cmd = `node "${SCRIPT}" --docs-path="${docsPath}" --epic=${epicId} --title="${title}" ${extraArgs}`;
  try {
    const stdout = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { stdout, stderr: '', status: 0 };
  } catch (err) {
    if (!expectFail) throw err;
    return { stdout: err.stdout || '', stderr: err.stderr || '', status: err.status };
  }
}

/**
 * Parse STORY_FILE=... from stdout and read the created file.
 */
function readCreatedStory(docsPath, stdout) {
  const match = stdout.match(/^STORY_FILE=(.+)$/m);
  assert.ok(match, `STORY_FILE not found in stdout:\n${stdout}`);
  const absPath = path.resolve(path.dirname(docsPath), match[1]);
  const content = fs.readFileSync(absPath, 'utf-8');
  return { filePath: absPath, relPath: match[1], ...matter(content) };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('create-story-file.js', () => {

  // ── Default behaviour (pending) ────────────────────────────────────────────

  describe('default pending story', () => {
    let tmpDir, docsPath, parsed, relPath;

    before(() => {
      ({ tmpDir, docsPath } = buildFixture());
      const { stdout } = runScript({ docsPath, title: 'My Feature' });
      ({ relPath, ...parsed } = readCreatedStory(docsPath, stdout));
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('writes file into pending/ directory', () => {
      assert.ok(relPath.includes('/pending/'), `Expected pending/ in path: ${relPath}`);
    });

    it('sets story_status to pending', () => {
      assert.equal(parsed.data.story_status, 'pending');
    });

    it('sets completed_at to null', () => {
      assert.equal(parsed.data.completed_at, null);
    });

    it('sets uac_completed to 0', () => {
      assert.equal(parsed.data.uac_completed, 0);
    });

    it('sets uac_completion_pct to 0', () => {
      assert.equal(parsed.data.uac_completion_pct, 0);
    });

    it('uses [ ] checkboxes in body', () => {
      assert.ok(parsed.content.includes('- [ ]'), 'Body should have unchecked UAC boxes');
      assert.ok(!parsed.content.includes('- [x]'), 'Body should not have checked boxes');
    });
  });

  // ── Story ID zero-padding ──────────────────────────────────────────────────

  describe('story ID zero-padding', () => {
    let tmpDir, docsPath;

    before(() => {
      ({ tmpDir, docsPath } = buildFixture({ epicId: '009' }));
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('pads first story number to 3 digits (009-001)', () => {
      const { stdout } = runScript({ docsPath, title: 'First Story' });
      const match = stdout.match(/^STORY_ID=(.+)$/m);
      assert.ok(match, 'STORY_ID not in stdout');
      assert.equal(match[1].trim(), '009-001');
    });

    it('filename contains 009-001', () => {
      const { stdout } = runScript({ docsPath, title: 'Another Story' });
      // Second story — previous test already created 009-001, so this should be 009-002
      const fileMatch = stdout.match(/^STORY_FILE=(.+)$/m);
      assert.ok(fileMatch[1].includes('009-002'), `Expected 009-002 in: ${fileMatch[1]}`);
    });
  });

  // ── Auto-increment ─────────────────────────────────────────────────────────

  describe('auto-increment story number', () => {
    let tmpDir, docsPath;

    before(() => {
      ({ tmpDir, docsPath } = buildFixture());
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('increments story number for each new story', () => {
      const r1 = runScript({ docsPath, title: 'Story One' });
      const r2 = runScript({ docsPath, title: 'Story Two' });
      const r3 = runScript({ docsPath, title: 'Story Three' });

      const id1 = r1.stdout.match(/^STORY_ID=(.+)$/m)[1].trim();
      const id2 = r2.stdout.match(/^STORY_ID=(.+)$/m)[1].trim();
      const id3 = r3.stdout.match(/^STORY_ID=(.+)$/m)[1].trim();

      assert.equal(id1, '009-001');
      assert.equal(id2, '009-002');
      assert.equal(id3, '009-003');
    });
  });

  // ── --status=done ──────────────────────────────────────────────────────────

  describe('--status=done', () => {
    let tmpDir, docsPath, parsed, relPath;

    before(() => {
      ({ tmpDir, docsPath } = buildFixture());
      const uacs = JSON.stringify([
        { type: 'CLI', text: 'Workflow file exists' },
        { type: 'TEST', text: 'Tests pass' },
      ]);
      const { stdout } = runScript({
        docsPath,
        title: 'Done Feature',
        extraArgs: `--status=done --points=3 --uacs='${uacs}'`,
      });
      ({ relPath, ...parsed } = readCreatedStory(docsPath, stdout));
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('writes file into done/ directory', () => {
      assert.ok(relPath.includes('/done/'), `Expected done/ in path: ${relPath}`);
    });

    it('sets story_status to done', () => {
      assert.equal(parsed.data.story_status, 'done');
    });

    it('sets completed_at to a non-null ISO timestamp', () => {
      assert.ok(parsed.data.completed_at, 'completed_at should be set');
      assert.ok(!isNaN(Date.parse(parsed.data.completed_at)), 'completed_at should be valid ISO');
    });

    it('sets uac_completed equal to uac_total', () => {
      assert.equal(parsed.data.uac_completed, parsed.data.uac_total);
      assert.equal(parsed.data.uac_completed, 2);
    });

    it('sets uac_pending to 0', () => {
      assert.equal(parsed.data.uac_pending, 0);
    });

    it('sets uac_completion_pct to 100', () => {
      assert.equal(parsed.data.uac_completion_pct, 100);
    });

    it('uses [x] checkboxes in body', () => {
      assert.ok(parsed.content.includes('- [x]'), 'Body should have checked UAC boxes');
      assert.ok(!parsed.content.includes('- [ ]'), 'Body should not have unchecked boxes');
    });

    it('changelog notes "created as done"', () => {
      assert.ok(parsed.content.includes('created as done'), 'Changelog should note done creation');
    });
  });

  // ── --completed-at ─────────────────────────────────────────────────────────

  describe('--completed-at', () => {
    let tmpDir, docsPath, parsed;
    const FIXED_TS = '2026-04-05T10:00:00Z';

    before(() => {
      ({ tmpDir, docsPath } = buildFixture());
      const { stdout } = runScript({
        docsPath,
        title: 'Resolved Story',
        extraArgs: `--status=done --completed-at=${FIXED_TS}`,
      });
      parsed = readCreatedStory(docsPath, stdout);
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('uses the provided --completed-at timestamp', () => {
      assert.equal(parsed.data.completed_at, FIXED_TS);
    });
  });

  // ── --uac-completed ────────────────────────────────────────────────────────

  describe('--uac-completed', () => {
    let tmpDir, docsPath;

    after(() => tmpDir && fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('sets explicit uac_completed count and recalculates pct', () => {
      ({ tmpDir, docsPath } = buildFixture());
      const uacs = JSON.stringify([
        { type: 'FE', text: 'Done' },
        { type: 'BE', text: 'Done' },
        { type: 'TEST', text: 'Pending' },
        { type: 'TEST', text: 'Pending' },
      ]);
      const { stdout } = runScript({
        docsPath,
        title: 'Partial Done',
        extraArgs: `--status=in-progress --uacs='${uacs}' --uac-completed=2`,
      });
      const parsed = readCreatedStory(docsPath, stdout);
      assert.equal(parsed.data.uac_completed, 2);
      assert.equal(parsed.data.uac_pending, 2);
      assert.equal(parsed.data.uac_completion_pct, 50);
    });

    it('--uac-completed overrides the auto-100 behaviour for done stories', () => {
      ({ tmpDir, docsPath } = buildFixture());
      const uacs = JSON.stringify([
        { type: 'FE', text: 'Done' },
        { type: 'BE', text: 'Done' },
        { type: 'BE', text: 'Skipped' },
      ]);
      const { stdout } = runScript({
        docsPath,
        title: 'Explicit Done Count',
        extraArgs: `--status=done --uacs='${uacs}' --uac-completed=2`,
      });
      const parsed = readCreatedStory(docsPath, stdout);
      assert.equal(parsed.data.uac_completed, 2);
      assert.equal(parsed.data.uac_pending, 1);
      assert.equal(parsed.data.uac_completion_pct, 67);
    });
  });

  // ── --status=in-progress ───────────────────────────────────────────────────

  describe('--status=in-progress', () => {
    let tmpDir, docsPath, relPath;

    before(() => {
      ({ tmpDir, docsPath } = buildFixture());
      const { stdout } = runScript({
        docsPath,
        title: 'WIP Story',
        extraArgs: '--status=in-progress',
      });
      ({ relPath } = readCreatedStory(docsPath, stdout));
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('writes file into in-progress/ directory', () => {
      assert.ok(relPath.includes('/in-progress/'), `Expected in-progress/ in path: ${relPath}`);
    });
  });

  // ── --status=blocked ───────────────────────────────────────────────────────

  describe('--status=blocked', () => {
    let tmpDir, docsPath, relPath, parsed;

    before(() => {
      ({ tmpDir, docsPath } = buildFixture());
      const { stdout } = runScript({
        docsPath,
        title: 'Blocked Story',
        extraArgs: '--status=blocked',
      });
      ({ relPath, ...parsed } = readCreatedStory(docsPath, stdout));
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('writes file into blocked/ directory', () => {
      assert.ok(relPath.includes('/blocked/'), `Expected blocked/ in path: ${relPath}`);
    });

    it('does not set completed_at', () => {
      assert.equal(parsed.data.completed_at, null);
    });
  });

  // ── Related docs discovery ─────────────────────────────────────────────────

  describe('related docs discovery', () => {
    let tmpDir, docsPath, parsed;

    before(() => {
      ({ tmpDir, docsPath } = buildFixture());
      // Drop a fake PRD and backend doc into docs/
      fs.writeFileSync(path.join(docsPath, '002-prd-v1.7.0.md'), '# PRD\n', 'utf-8');
      fs.writeFileSync(path.join(docsPath, '325-backend-v1.3.0.md'), '# Backend\n', 'utf-8');

      const { stdout } = runScript({ docsPath, title: 'Docs Story' });
      parsed = readCreatedStory(docsPath, stdout);
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('includes prd in related_docs frontmatter', () => {
      assert.ok(parsed.data.related_docs?.prd, 'related_docs.prd should be set');
      assert.ok(parsed.data.related_docs.prd.includes('002-prd-v1.7.0.md'));
    });

    it('includes backend in related_docs frontmatter', () => {
      assert.ok(parsed.data.related_docs?.backend, 'related_docs.backend should be set');
      assert.ok(parsed.data.related_docs.backend.includes('325-backend-v1.3.0.md'));
    });
  });

  // ── UAC type breakdown ─────────────────────────────────────────────────────

  describe('UAC type breakdown in frontmatter', () => {
    let tmpDir, docsPath, parsed;

    before(() => {
      ({ tmpDir, docsPath } = buildFixture());
      const uacs = JSON.stringify([
        { type: 'FE',     text: 'UI renders' },
        { type: 'FE',     text: 'Button works' },
        { type: 'BE',     text: 'API returns 200' },
        { type: 'CLI',    text: 'Command exists' },
        { type: 'TEST',   text: 'Unit test passes' },
        { type: 'DEVOPS', text: 'Deployed to staging' },
      ]);
      const { stdout } = runScript({ docsPath, title: 'UAC Types', extraArgs: `--uacs='${uacs}'` });
      parsed = readCreatedStory(docsPath, stdout);
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('counts fe UACs', () => assert.equal(parsed.data.uac_by_type.fe, 2));
    it('counts be UACs', () => assert.equal(parsed.data.uac_by_type.be, 1));
    it('counts cli UACs', () => assert.equal(parsed.data.uac_by_type.cli, 1));
    it('counts test UACs', () => assert.equal(parsed.data.uac_by_type.test, 1));
    it('counts devops UACs', () => assert.equal(parsed.data.uac_by_type.devops, 1));
    it('sets uac_total to 6', () => assert.equal(parsed.data.uac_total, 6));
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  describe('error handling', () => {
    it('exits with code 1 when --epic is missing', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'csf-err-'));
      try {
        const cmd = `node "${SCRIPT}" --docs-path="${path.join(tmpDir, 'docs')}" --title="X"`;
        let status = 0;
        try { execSync(cmd, { encoding: 'utf-8' }); }
        catch (e) { status = e.status; }
        assert.equal(status, 1);
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it('exits with code 1 when --title is missing', () => {
      const { tmpDir, docsPath } = buildFixture();
      try {
        const cmd = `node "${SCRIPT}" --docs-path="${docsPath}" --epic=009`;
        let status = 0;
        try { execSync(cmd, { encoding: 'utf-8' }); }
        catch (e) { status = e.status; }
        assert.equal(status, 1);
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it('exits with code 1 when epic directory does not exist', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'csf-noepic-'));
      const docsPath = path.join(tmpDir, 'docs');
      fs.mkdirSync(path.join(docsPath, 'epics'), { recursive: true });
      try {
        const cmd = `node "${SCRIPT}" --docs-path="${docsPath}" --epic=099 --title="X"`;
        let status = 0;
        try { execSync(cmd, { encoding: 'utf-8' }); }
        catch (e) { status = e.status; }
        assert.equal(status, 1);
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  // ── --dry-run ──────────────────────────────────────────────────────────────

  describe('--dry-run', () => {
    let tmpDir, docsPath;

    before(() => {
      ({ tmpDir, docsPath } = buildFixture());
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('does not write any file to disk', () => {
      const cmd = `node "${SCRIPT}" --docs-path="${docsPath}" --epic=009 --title="Dry Test" --dry-run`;
      execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
      const pendingFiles = fs.readdirSync(path.join(docsPath, 'epics', '009-test-epic', 'pending'));
      assert.equal(pendingFiles.length, 0, 'No files should be written in dry-run mode');
    });

    it('prints file content to stdout', () => {
      const cmd = `node "${SCRIPT}" --docs-path="${docsPath}" --epic=009 --title="Dry Test" --dry-run`;
      const stdout = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
      assert.ok(stdout.includes('story_id:'), 'stdout should contain YAML frontmatter');
      assert.ok(stdout.includes('## Description'), 'stdout should contain markdown body');
    });
  });

});
