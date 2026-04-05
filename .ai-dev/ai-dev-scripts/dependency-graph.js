#!/usr/bin/env node
'use strict';

/**
 * dependency-graph.js
 *
 * Builds a directed acyclic graph (DAG) from story dependency fields and outputs
 * XYFlow-compatible JSON, Mermaid flowchart syntax, or raw graph data.
 *
 * Usage:
 *   node .ai-dev/ai-dev-scripts/dependency-graph.js --output=xyflow
 *   node .ai-dev/ai-dev-scripts/dependency-graph.js --output=mermaid
 *   node .ai-dev/ai-dev-scripts/dependency-graph.js --output=json
 *   node .ai-dev/ai-dev-scripts/dependency-graph.js --output=xyflow --epic=007
 *
 * Options:
 *   --docs-path=<path>          Path to docs directory (default: ./docs)
 *   --epic=<id>                 Only process a specific epic
 *   --output=xyflow|mermaid|json  Output format (default: json)
 *   --direction=LR|TD           Graph direction for Mermaid (default: LR)
 *
 * Exit codes:
 *   0  success
 *   1  docs/epics/ not found
 */

const fs   = require('fs');
const path = require('path');
const matter = require('gray-matter');

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_DIRS = ['pending', 'in-progress', 'qa', 'done', 'blocked'];

const STATUS_COLORS = {
  'pending':     '#6b7280',  // gray
  'in-progress': '#f59e0b',  // amber
  'qa':          '#3b82f6',  // blue
  'done':        '#22c55e',  // green
  'blocked':     '#ef4444',  // red
};

const STATUS_ICONS = {
  'pending':     '⏳',
  'in-progress': '🚧',
  'qa':          '🔍',
  'done':        '✅',
  'blocked':     '⛔',
};

// ─── CLI ──────────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const get  = (prefix) => (args.find(a => a.startsWith(prefix)) || '').slice(prefix.length) || null;
  return {
    docsPath:   get('--docs-path=') || './docs',
    epicFilter: get('--epic='),
    output:     get('--output=') || 'json',
    direction:  get('--direction=') || 'LR',
  };
}

// ─── Read all stories ─────────────────────────────────────────────────────────

function readAllStories(epicsPath, epicFilter) {
  const stories = new Map();  // storyId → data
  const epics   = new Map();  // epicId → { name, dir }

  const epicDirs = fs.readdirSync(epicsPath)
    .filter(d => {
      if (!/^\d{3}-/.test(d)) return false;
      if (epicFilter && !d.startsWith(epicFilter)) return false;
      return fs.statSync(path.join(epicsPath, d)).isDirectory();
    })
    .sort();

  for (const epicDir of epicDirs) {
    const epicDirPath = path.join(epicsPath, epicDir);
    const epicMdPath  = path.join(epicDirPath, 'epic.md');

    // Read epic metadata
    let epicName = epicDir;
    let epicId = epicDir.match(/^(\d{3})/)?.[1] || epicDir;
    if (fs.existsSync(epicMdPath)) {
      try {
        const { data } = matter(fs.readFileSync(epicMdPath, 'utf-8'));
        epicName = data.epic_name || epicDir;
        epicId = String(data.epic_id || epicId);
      } catch { /* use defaults */ }
    }
    epics.set(epicId, { name: epicName, dir: epicDir });

    // Read story files from all status dirs
    for (const statusDir of STATUS_DIRS) {
      const statusPath = path.join(epicDirPath, statusDir);
      if (!fs.existsSync(statusPath)) continue;

      const files = fs.readdirSync(statusPath).filter(f => f.endsWith('.md'));
      for (const file of files) {
        try {
          const raw = fs.readFileSync(path.join(statusPath, file), 'utf-8');
          const { data } = matter(raw);
          if (!data.story_id) continue;

          const sid = String(data.story_id);
          stories.set(sid, {
            storyId:         sid,
            title:           data.story_name || file.replace('.md', ''),
            epicId:          String(data.epic_id || epicId),
            epicName,
            status:          statusDir,
            points:          Number(data.story_points) || 0,
            priority:        data.priority || 'medium',
            uacTotal:        Number(data.uac_total)     || 0,
            uacCompleted:    Number(data.uac_completed)  || 0,
            uacPending:      Number(data.uac_pending)    || 0,
            uacCompletionPct: Number(data.uac_completion_pct) || 0,
            uacByType:       data.uac_by_type || { fe: 0, be: 0, db: 0, devops: 0, cli: 0, test: 0 },
            tags:            data.tags || [],
            dependencies:    (data.dependencies || []).map(String),
          });
        } catch { /* skip unreadable files */ }
      }
    }
  }

  return { stories, epics };
}

// ─── Graph building ───────────────────────────────────────────────────────────

function buildGraph(stories) {
  const nodes = [];
  const edges = [];
  const adjacency = new Map();  // source → [targets]
  const inDegree  = new Map();

  // Initialize
  for (const [id] of stories) {
    adjacency.set(id, []);
    inDegree.set(id, 0);
  }

  // Build edges from dependencies
  for (const [id, story] of stories) {
    for (const depId of story.dependencies) {
      if (!stories.has(depId)) continue;  // skip broken deps
      // Edge: depId → id (dependency must be done before this story)
      adjacency.get(depId).push(id);
      edges.push({
        source: depId,
        target: id,
      });
      inDegree.set(id, (inDegree.get(id) || 0) + 1);
    }
  }

  // Detect cycles using Kahn's algorithm
  const queue = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const buildOrder = [];
  const visited = new Set();

  while (queue.length > 0) {
    const id = queue.shift();
    buildOrder.push(id);
    visited.add(id);

    for (const neighbor of (adjacency.get(id) || [])) {
      const newDeg = inDegree.get(neighbor) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  // Any node not visited is part of a cycle
  const cycles = [];
  for (const [id] of stories) {
    if (!visited.has(id)) cycles.push(id);
  }

  // Parallelizable: stories with 0 in-degree (all deps resolved or no deps)
  // For a more useful result: stories whose deps are ALL in "done" status
  const parallelizable = [];
  for (const [id, story] of stories) {
    if (story.status === 'done') continue;
    const allDepsResolved = story.dependencies.every(depId => {
      const dep = stories.get(depId);
      return !dep || dep.status === 'done';
    });
    if (allDepsResolved) parallelizable.push(id);
  }

  return { edges, cycles, buildOrder, parallelizable };
}

// ─── Layout calculation ───────────────────────────────────────────────────────

/**
 * Assign layer numbers using topological ordering.
 * Layer = max(layer of dependencies) + 1.
 */
function calculateLayers(stories, buildOrder) {
  const layers = new Map();

  for (const id of buildOrder) {
    const story = stories.get(id);
    if (!story) continue;

    let maxDepLayer = -1;
    for (const depId of story.dependencies) {
      if (layers.has(depId)) {
        maxDepLayer = Math.max(maxDepLayer, layers.get(depId));
      }
    }
    layers.set(id, maxDepLayer + 1);
  }

  return layers;
}

/**
 * Calculate XYFlow positions from layers.
 * Groups by epic vertically, spreads layers horizontally.
 */
function calculatePositions(stories, layers) {
  const positions = new Map();
  const LAYER_WIDTH  = 300;
  const NODE_HEIGHT  = 180;
  const EPIC_GAP     = 40;

  // Group by epic, then sort within each epic by layer
  const epicGroups = new Map();
  for (const [id, story] of stories) {
    const epicId = story.epicId;
    if (!epicGroups.has(epicId)) epicGroups.set(epicId, []);
    epicGroups.get(epicId).push({ id, layer: layers.get(id) || 0 });
  }

  let globalY = 0;

  for (const [, storyList] of epicGroups) {
    // Sort by layer, then by ID
    storyList.sort((a, b) => a.layer - b.layer || a.id.localeCompare(b.id));

    // Track column counts per layer for vertical stacking within same layer
    const layerCounts = new Map();

    for (const { id, layer } of storyList) {
      const count = layerCounts.get(layer) || 0;
      layerCounts.set(layer, count + 1);

      positions.set(id, {
        x: layer * LAYER_WIDTH,
        y: globalY + count * NODE_HEIGHT,
      });
    }

    // Move globalY past this epic group
    const maxCount = Math.max(...layerCounts.values(), 1);
    globalY += maxCount * NODE_HEIGHT + EPIC_GAP;
  }

  return positions;
}

// ─── Output formatters ────────────────────────────────────────────────────────

function toXYFlow(stories, graphResult) {
  const layers    = calculateLayers(stories, graphResult.buildOrder);
  const positions = calculatePositions(stories, layers);

  const nodes = [];
  for (const [id, story] of stories) {
    const pos = positions.get(id) || { x: 0, y: 0 };
    nodes.push({
      id,
      type: 'storyNode',
      position: pos,
      data: {
        storyId:         story.storyId,
        title:           story.title,
        epicId:          story.epicId,
        epicName:        story.epicName,
        status:          story.status,
        points:          story.points,
        priority:        story.priority,
        uacTotal:        story.uacTotal,
        uacCompleted:    story.uacCompleted,
        uacPending:      story.uacPending,
        uacCompletionPct: story.uacCompletionPct,
        uacByType:       story.uacByType,
        tags:            story.tags,
        statusColor:     STATUS_COLORS[story.status] || '#6b7280',
        layer:           layers.get(id) || 0,
      },
    });
  }

  const edges = graphResult.edges.map(e => ({
    id:       `e-${e.source}-${e.target}`,
    source:   e.source,
    target:   e.target,
    type:     'smoothstep',
    animated: stories.get(e.source)?.status !== 'done',
    style: {
      stroke: stories.get(e.source)?.status === 'done' ? '#22c55e' : '#6366f1',
    },
    markerEnd: {
      type: 'arrowclosed',
      color: stories.get(e.source)?.status === 'done' ? '#22c55e' : '#6366f1',
    },
  }));

  return {
    nodes,
    edges,
    metadata: {
      generatedAt: new Date().toISOString(),
      totalNodes: nodes.length,
      totalEdges: edges.length,
      cycles: graphResult.cycles,
      parallelizable: graphResult.parallelizable,
      buildOrder: graphResult.buildOrder,
    },
  };
}

function toMermaid(stories, graphResult, direction) {
  const lines = [`graph ${direction}`];
  const rendered = new Set();

  // Render all nodes first
  for (const [id, story] of stories) {
    const shortId = id.split('-').pop() || id;
    const icon = STATUS_ICONS[story.status] || '❓';
    const label = `${shortId}: ${story.title} ${icon}`;
    lines.push(`  ${id}["${label}"]`);
    rendered.add(id);
  }

  // Render edges
  for (const edge of graphResult.edges) {
    if (rendered.has(edge.source) && rendered.has(edge.target)) {
      lines.push(`  ${edge.source} --> ${edge.target}`);
    }
  }

  // Style done nodes
  for (const [id, story] of stories) {
    if (story.status === 'done') {
      lines.push(`  style ${id} fill:#22c55e,stroke:#16a34a,color:#fff`);
    } else if (story.status === 'in-progress') {
      lines.push(`  style ${id} fill:#f59e0b,stroke:#d97706,color:#fff`);
    } else if (story.status === 'blocked') {
      lines.push(`  style ${id} fill:#ef4444,stroke:#dc2626,color:#fff`);
    }
  }

  return lines.join('\n') + '\n';
}

function toJSON(stories, graphResult) {
  const storyData = {};
  for (const [id, story] of stories) {
    storyData[id] = story;
  }
  return {
    generatedAt: new Date().toISOString(),
    stories: storyData,
    edges: graphResult.edges,
    cycles: graphResult.cycles,
    buildOrder: graphResult.buildOrder,
    parallelizable: graphResult.parallelizable,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const opts = parseArgs();
  const epicsPath = path.resolve(opts.docsPath, 'epics');

  if (!fs.existsSync(epicsPath)) {
    process.stderr.write(`Error: docs/epics/ not found at ${epicsPath}\n`);
    process.exit(1);
  }

  const { stories } = readAllStories(epicsPath, opts.epicFilter);
  const graphResult = buildGraph(stories);

  let output;
  switch (opts.output) {
    case 'xyflow':
      output = JSON.stringify(toXYFlow(stories, graphResult), null, 2);
      break;
    case 'mermaid':
      output = toMermaid(stories, graphResult, opts.direction);
      break;
    case 'json':
    default:
      output = JSON.stringify(toJSON(stories, graphResult), null, 2);
      break;
  }

  process.stdout.write(output + '\n');

  // Summary to stderr
  process.stderr.write(`\n📊 Dependency Graph: ${stories.size} stories, ${graphResult.edges.length} edges\n`);
  if (graphResult.cycles.length > 0) {
    process.stderr.write(`⚠️  Circular dependencies detected: ${graphResult.cycles.join(', ')}\n`);
  }
  process.stderr.write(`   Parallelizable (ready to work): ${graphResult.parallelizable.length} stories\n`);
  process.stderr.write(`   Build order: ${graphResult.buildOrder.length} stories\n`);
}

main();
