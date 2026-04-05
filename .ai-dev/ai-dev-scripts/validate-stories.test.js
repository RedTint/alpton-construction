#!/usr/bin/env node
'use strict';

/**
 * validate-stories.test.js
 *
 * Tests for validate-stories.js.
 * Uses Node 18+ built-in test runner (node:test + node:assert).
 *
 * Run:
 *   node --test --test-reporter=spec .ai-dev/ai-dev-scripts/validate-stories.test.js
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs     = require('node:fs');
const path   = require('node:path');
const os     = require('node:os');
const { execSync } = require('node:child_process');
const matter  = require('gray-matter');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SCRIPT = path.resolve(__dirname, 'validate-stories.js');

function buildStoryMd(overrides = {}) {
  const defaults = {
    story_id: '001-001',
    epic_id: '001',
    story_name: 'Test Story',
    story_status: 'pending',
    priority: 'high',
    story_points: 5,
    assignees: [],
    tags: ['v1.0.0'],
    dependencies: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    completed_at: null,
    uac_total: 2,
    uac_completed: 0,
    uac_pending: 2,
    uac_completion_pct: 0,
    uac_by_type: { fe: 1, be: 1, db: 0, devops: 0, cli: 0, test: 0 },
    test_coverage: null,
    test_unit_status: 'pending',
    test_e2e_status: 'pending',
    test_integration_status: 'pending',
  };
  const data = { ...defaults, ...overrides };
  const body = `
## Description

Test story.

## User Acceptance Criteria

- [ ] FE: Frontend task
- [ ] BE: Backend task

## Notes

`;
  return matter.stringify(body, data);
}

function buildEpicMd(overrides = {}) {
  const defaults = {
    epic_id: '001',
    epic_name: 'Test Epic',
    epic_status: 'pending',
    priority: 'high',
    total_stories: 0,
    completed_stories: 0,
    total_points: 0,
    completed_points: 0,
    completion_pct: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };
  return matter.stringify('\n# Epic 001: Test Epic\n\n', { ...defaults, ...overrides });
}

function buildFixture(epics) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-test-'));
  const docsDir = path.join(tmpDir, 'docs');
  const epicsDir = path.join(docsDir, 'epics');
  fs.mkdirSync(epicsDir, { recursive: true });

  for (const epic of epics) {
    const epicDir = path.join(epicsDir, epic.dir);
    fs.mkdirSync(epicDir);
    fs.writeFileSync(path.join(epicDir, 'epic.md'), epic.epicContent || buildEpicMd({ epic_id: epic.id }), 'utf-8');

    for (const sd of ['pending', 'in-progress', 'qa', 'done', 'blocked', 'bugs']) {
      fs.mkdirSync(path.join(epicDir, sd));
    }

    for (const story of epic.stories || []) {
      const storyPath = path.join(epicDir, story.dir || 'pending', story.file);
      fs.writeFileSync(storyPath, story.content, 'utf-8');
    }
  }

  return tmpDir;
}

function runValidate(tmpDir, args = '') {
  const docsPath = path.join(tmpDir, 'docs');
  const stdout = execSync(
    `node "${SCRIPT}" --docs-path="${docsPath}" ${args}`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
  );
  return JSON.parse(stdout);
}

function runValidateFail(tmpDir, args = '') {
  const docsPath = path.join(tmpDir, 'docs');
  try {
    execSync(`node "${SCRIPT}" --docs-path="${docsPath}" ${args}`, { encoding: 'utf-8' });
    return { status: 0 };
  } catch (err) {
    return { status: err.status, stdout: err.stdout, stderr: err.stderr };
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('validate-stories.js', () => {

  describe('valid story passes all checks', () => {
    let result, tmpDir;

    before(() => {
      tmpDir = buildFixture([{
        dir: '001-test', id: '001',
        stories: [{ file: '001-001-test.md', dir: 'pending', content: buildStoryMd() }],
      }]);
      result = runValidate(tmpDir);
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('reports 0 errors', () => assert.equal(result.errors.length, 0));
    it('reports valid count > 0', () => assert.ok(result.valid > 0));
  });

  describe('missing required field reports error', () => {
    let tmpDir;

    after(() => tmpDir && fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('reports error for missing test_coverage', () => {
      const content = buildStoryMd();
      // Remove test_coverage from frontmatter
      const { data, content: body } = matter(content);
      delete data.test_coverage;
      const modified = matter.stringify(body, data);

      tmpDir = buildFixture([{
        dir: '001-test', id: '001',
        stories: [{ file: '001-001-test.md', dir: 'pending', content: modified }],
      }]);

      const { status, stdout } = runValidateFail(tmpDir);
      assert.equal(status, 2);
      const result = JSON.parse(stdout);
      assert.ok(result.errors.some(e => e.field === 'test_coverage'));
    });
  });

  describe('UAC count mismatch', () => {
    let tmpDir;

    after(() => tmpDir && fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('reports error when uac_total does not match body', () => {
      tmpDir = buildFixture([{
        dir: '001-test', id: '001',
        stories: [{
          file: '001-001-test.md', dir: 'pending',
          content: buildStoryMd({ uac_total: 99 }),  // wrong count
        }],
      }]);

      const { status, stdout } = runValidateFail(tmpDir);
      assert.equal(status, 2);
      const result = JSON.parse(stdout);
      assert.ok(result.errors.some(e => e.field === 'uac_total'));
    });

    it('--fix corrects uac_total', () => {
      tmpDir = buildFixture([{
        dir: '001-fix', id: '001',
        stories: [{
          file: '001-001-test.md', dir: 'pending',
          content: buildStoryMd({ uac_total: 99 }),
        }],
      }]);

      const result = runValidate(tmpDir, '--fix');
      assert.ok(result.fixed > 0);

      // Verify file was updated
      const filePath = path.join(tmpDir, 'docs/epics/001-fix/pending/001-001-test.md');
      const { data } = matter(fs.readFileSync(filePath, 'utf-8'));
      assert.equal(data.uac_total, 2);
    });
  });

  describe('status/directory mismatch', () => {
    let tmpDir;

    after(() => tmpDir && fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('reports error when story_status != directory', () => {
      tmpDir = buildFixture([{
        dir: '001-test', id: '001',
        stories: [{
          file: '001-001-test.md',
          dir: 'done',  // file is in done/
          content: buildStoryMd({ story_status: 'pending' }),  // but says pending
        }],
      }]);

      const { status, stdout } = runValidateFail(tmpDir);
      assert.equal(status, 2);
      const result = JSON.parse(stdout);
      assert.ok(result.errors.some(e => e.field === 'story_status'));
    });

    it('--fix corrects story_status to match directory', () => {
      tmpDir = buildFixture([{
        dir: '001-fix', id: '001',
        stories: [{
          file: '001-001-test.md', dir: 'done',
          content: buildStoryMd({ story_status: 'pending' }),
        }],
      }]);

      const result = runValidate(tmpDir, '--fix');
      assert.ok(result.fixed > 0);

      const filePath = path.join(tmpDir, 'docs/epics/001-fix/done/001-001-test.md');
      const { data } = matter(fs.readFileSync(filePath, 'utf-8'));
      assert.equal(data.story_status, 'done');
    });
  });

  describe('missing changelog warns', () => {
    let result, tmpDir;

    before(() => {
      tmpDir = buildFixture([{
        dir: '001-test', id: '001',
        stories: [{ file: '001-001-test.md', dir: 'pending', content: buildStoryMd() }],
      }]);
      result = runValidate(tmpDir);
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('reports warning for missing Changelog section', () => {
      assert.ok(result.warnings.some(w => w.message.includes('Changelog')));
    });
  });

  describe('--migrate adds v2 fields', () => {
    let tmpDir;

    after(() => tmpDir && fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('adds design_links, changelog, related_docs to old story', () => {
      tmpDir = buildFixture([{
        dir: '001-test', id: '001',
        stories: [{ file: '001-001-test.md', dir: 'pending', content: buildStoryMd() }],
      }]);

      const result = runValidate(tmpDir, '--migrate');
      assert.ok(result.migrated > 0);

      const filePath = path.join(tmpDir, 'docs/epics/001-test/pending/001-001-test.md');
      const raw = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(raw);

      assert.ok(Array.isArray(data.design_links));
      assert.ok(Array.isArray(data.architecture_refs));
      assert.ok(Array.isArray(data.changelog));
      assert.ok(data.changelog.length > 0);
      assert.ok(raw.includes('## Changelog'));
      assert.ok(raw.includes('## Related Documentation'));
    });
  });

  describe('broken dependency warns', () => {
    let result, tmpDir;

    before(() => {
      tmpDir = buildFixture([{
        dir: '001-test', id: '001',
        stories: [{
          file: '001-001-test.md', dir: 'pending',
          content: buildStoryMd({ dependencies: ['999-999'] }),
        }],
      }]);
      result = runValidate(tmpDir);
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('reports warning for missing dependency', () => {
      assert.ok(result.warnings.some(w => w.field === 'dependencies'));
    });
  });

  describe('--epic filter', () => {
    let tmpDir;

    after(() => tmpDir && fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('only validates stories in filtered epic', () => {
      tmpDir = buildFixture([
        { dir: '001-alpha', id: '001', stories: [{ file: '001-001-a.md', dir: 'pending', content: buildStoryMd({ story_id: '001-001', epic_id: '001' }) }] },
        { dir: '002-beta', id: '002', stories: [{ file: '002-001-b.md', dir: 'pending', content: buildStoryMd({ story_id: '002-001', epic_id: '002', uac_total: 99 }) }] },
      ]);

      // Only validate epic 001 — should pass (no errors)
      const result = runValidate(tmpDir, '--epic=001');
      assert.equal(result.errors.length, 0);
    });
  });
});
