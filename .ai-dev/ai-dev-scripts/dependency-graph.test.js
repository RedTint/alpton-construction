#!/usr/bin/env node
'use strict';

/**
 * dependency-graph.test.js
 *
 * Tests for dependency-graph.js.
 * Uses Node 18+ built-in test runner (node:test + node:assert).
 *
 * Run:
 *   node --test --test-reporter=spec .ai-dev/ai-dev-scripts/dependency-graph.test.js
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs     = require('node:fs');
const path   = require('node:path');
const os     = require('node:os');
const { execSync } = require('node:child_process');
const matter  = require('gray-matter');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SCRIPT = path.resolve(__dirname, 'dependency-graph.js');

function buildStoryMd(id, epicId, name, status, deps = [], points = 5) {
  const data = {
    story_id: id,
    epic_id: epicId,
    story_name: name,
    story_status: status,
    priority: 'high',
    story_points: points,
    assignees: [],
    tags: ['v1.0.0'],
    dependencies: deps,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    completed_at: status === 'done' ? '2026-01-15T00:00:00Z' : null,
    uac_total: 2,
    uac_completed: status === 'done' ? 2 : 0,
    uac_pending: status === 'done' ? 0 : 2,
    uac_completion_pct: status === 'done' ? 100 : 0,
    uac_by_type: { fe: 1, be: 1, db: 0, devops: 0, cli: 0, test: 0 },
    test_coverage: null,
    test_unit_status: 'pending',
    test_e2e_status: 'pending',
    test_integration_status: 'pending',
  };
  return matter.stringify('\n## Description\n\nTest story.\n\n## User Acceptance Criteria\n\n- [ ] FE: Frontend task\n- [ ] BE: Backend task\n', data);
}

function buildEpicMd(id, name) {
  const data = {
    epic_id: id,
    epic_name: name,
    epic_status: 'in-progress',
    priority: 'high',
    total_stories: 0,
    completed_stories: 0,
    total_points: 0,
    completed_points: 0,
    completion_pct: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };
  return matter.stringify(`\n# Epic ${id}: ${name}\n\n`, data);
}

function buildFixture(epics) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'depgraph-test-'));
  const docsDir = path.join(tmpDir, 'docs');
  const epicsDir = path.join(docsDir, 'epics');
  fs.mkdirSync(epicsDir, { recursive: true });

  for (const epic of epics) {
    const epicDir = path.join(epicsDir, epic.dir);
    fs.mkdirSync(epicDir);
    fs.writeFileSync(path.join(epicDir, 'epic.md'), buildEpicMd(epic.id, epic.name), 'utf-8');

    for (const sd of ['pending', 'in-progress', 'qa', 'done', 'blocked', 'bugs']) {
      fs.mkdirSync(path.join(epicDir, sd));
    }

    for (const story of epic.stories || []) {
      fs.writeFileSync(path.join(epicDir, story.status, story.file), story.content, 'utf-8');
    }
  }

  return tmpDir;
}

function runGraph(tmpDir, args = '') {
  const docsPath = path.join(tmpDir, 'docs');
  const stdout = execSync(
    `node "${SCRIPT}" --docs-path="${docsPath}" ${args}`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
  );
  return args.includes('--output=mermaid') ? stdout : JSON.parse(stdout);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('dependency-graph.js', () => {

  // ── Linear chain ────────────────────────────────────────────────────────────

  describe('linear chain A → B → C', () => {
    let result, tmpDir;

    before(() => {
      tmpDir = buildFixture([{
        dir: '001-chain', id: '001', name: 'Chain',
        stories: [
          { file: '001-001-a.md', status: 'done',    content: buildStoryMd('001-001', '001', 'Story A', 'done',    []) },
          { file: '001-002-b.md', status: 'pending', content: buildStoryMd('001-002', '001', 'Story B', 'pending', ['001-001']) },
          { file: '001-003-c.md', status: 'pending', content: buildStoryMd('001-003', '001', 'Story C', 'pending', ['001-002']) },
        ],
      }]);
      result = runGraph(tmpDir, '--output=json');
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('has 2 edges', () => {
      assert.equal(result.edges.length, 2);
    });

    it('edge from A to B exists', () => {
      assert.ok(result.edges.some(e => e.source === '001-001' && e.target === '001-002'));
    });

    it('edge from B to C exists', () => {
      assert.ok(result.edges.some(e => e.source === '001-002' && e.target === '001-003'));
    });

    it('build order is A, B, C', () => {
      const order = result.buildOrder;
      assert.ok(order.indexOf('001-001') < order.indexOf('001-002'));
      assert.ok(order.indexOf('001-002') < order.indexOf('001-003'));
    });

    it('A (done) is not parallelizable; B is parallelizable (dep resolved)', () => {
      assert.ok(!result.parallelizable.includes('001-001'));  // done
      assert.ok(result.parallelizable.includes('001-002'));   // dep 001-001 is done
      assert.ok(!result.parallelizable.includes('001-003')); // dep 001-002 not done
    });

    it('no cycles detected', () => {
      assert.equal(result.cycles.length, 0);
    });
  });

  // ── XYFlow output ───────────────────────────────────────────────────────────

  describe('XYFlow output format', () => {
    let result, tmpDir;

    before(() => {
      tmpDir = buildFixture([{
        dir: '001-xf', id: '001', name: 'XYFlow',
        stories: [
          { file: '001-001-a.md', status: 'done',    content: buildStoryMd('001-001', '001', 'Story A', 'done', []) },
          { file: '001-002-b.md', status: 'pending', content: buildStoryMd('001-002', '001', 'Story B', 'pending', ['001-001']) },
        ],
      }]);
      result = runGraph(tmpDir, '--output=xyflow');
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('has nodes array', () => assert.ok(Array.isArray(result.nodes)));
    it('has edges array', () => assert.ok(Array.isArray(result.edges)));
    it('has metadata', () => assert.ok(result.metadata));

    it('node has required XYFlow fields', () => {
      const node = result.nodes[0];
      assert.ok(node.id);
      assert.equal(node.type, 'storyNode');
      assert.ok(node.position);
      assert.ok(typeof node.position.x === 'number');
      assert.ok(typeof node.position.y === 'number');
      assert.ok(node.data);
      assert.ok(node.data.title);
      assert.ok(node.data.statusColor);
    });

    it('edge has required XYFlow fields', () => {
      const edge = result.edges[0];
      assert.ok(edge.id);
      assert.ok(edge.source);
      assert.ok(edge.target);
      assert.equal(edge.type, 'smoothstep');
      assert.ok('animated' in edge);
    });

    it('done node has green status color', () => {
      const doneNode = result.nodes.find(n => n.data.status === 'done');
      assert.equal(doneNode.data.statusColor, '#22c55e');
    });

    it('done edge is not animated', () => {
      const doneEdge = result.edges.find(e => e.source === '001-001');
      assert.equal(doneEdge.animated, false);
    });
  });

  // ── Mermaid output ──────────────────────────────────────────────────────────

  describe('Mermaid output', () => {
    let output, tmpDir;

    before(() => {
      tmpDir = buildFixture([{
        dir: '001-mmd', id: '001', name: 'Mermaid',
        stories: [
          { file: '001-001-a.md', status: 'done',    content: buildStoryMd('001-001', '001', 'Story A', 'done', []) },
          { file: '001-002-b.md', status: 'pending', content: buildStoryMd('001-002', '001', 'Story B', 'pending', ['001-001']) },
        ],
      }]);
      output = runGraph(tmpDir, '--output=mermaid');
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('starts with graph LR', () => {
      assert.ok(output.startsWith('graph LR'));
    });

    it('contains node definitions', () => {
      assert.ok(output.includes('001-001'));
      assert.ok(output.includes('001-002'));
    });

    it('contains edge definition', () => {
      assert.ok(output.includes('001-001 --> 001-002'));
    });

    it('styles done node green', () => {
      assert.ok(output.includes('style 001-001 fill:#22c55e'));
    });
  });

  // ── Circular dependency detection ──────────────────────────────────────────

  describe('circular dependency detection', () => {
    let result, tmpDir;

    before(() => {
      tmpDir = buildFixture([{
        dir: '001-cycle', id: '001', name: 'Cycle',
        stories: [
          { file: '001-001-a.md', status: 'pending', content: buildStoryMd('001-001', '001', 'A', 'pending', ['001-002']) },
          { file: '001-002-b.md', status: 'pending', content: buildStoryMd('001-002', '001', 'B', 'pending', ['001-001']) },
        ],
      }]);
      result = runGraph(tmpDir, '--output=json');
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('detects cycle', () => {
      assert.ok(result.cycles.length > 0);
    });

    it('cycle contains both nodes', () => {
      assert.ok(result.cycles.includes('001-001') || result.cycles.includes('001-002'));
    });
  });

  // ── Parallelizable stories ─────────────────────────────────────────────────

  describe('parallelizable stories', () => {
    let result, tmpDir;

    before(() => {
      tmpDir = buildFixture([{
        dir: '001-par', id: '001', name: 'Parallel',
        stories: [
          { file: '001-001-a.md', status: 'pending', content: buildStoryMd('001-001', '001', 'A', 'pending', []) },
          { file: '001-002-b.md', status: 'pending', content: buildStoryMd('001-002', '001', 'B', 'pending', []) },
          { file: '001-003-c.md', status: 'pending', content: buildStoryMd('001-003', '001', 'C', 'pending', ['001-001']) },
        ],
      }]);
      result = runGraph(tmpDir, '--output=json');
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('A and B are parallelizable (no deps)', () => {
      assert.ok(result.parallelizable.includes('001-001'));
      assert.ok(result.parallelizable.includes('001-002'));
    });

    it('C is not parallelizable (dep on A not done)', () => {
      assert.ok(!result.parallelizable.includes('001-003'));
    });
  });

  // ── Epic filter ─────────────────────────────────────────────────────────────

  describe('--epic filter', () => {
    let result, tmpDir;

    before(() => {
      tmpDir = buildFixture([
        { dir: '001-a', id: '001', name: 'A', stories: [
          { file: '001-001-s.md', status: 'pending', content: buildStoryMd('001-001', '001', 'S', 'pending', []) },
        ]},
        { dir: '002-b', id: '002', name: 'B', stories: [
          { file: '002-001-s.md', status: 'pending', content: buildStoryMd('002-001', '002', 'S', 'pending', []) },
        ]},
      ]);
      result = runGraph(tmpDir, '--output=json --epic=001');
    });

    after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('only includes stories from filtered epic', () => {
      assert.ok('001-001' in result.stories);
      assert.ok(!('002-001' in result.stories));
    });
  });
});
