#!/usr/bin/env node
'use strict';

/**
 * check-uac.js
 *
 * Programmatically marks a specific User Acceptance Criteria (UAC) as complete
 * in a target story file and appends a timestamped log to the Changelog.
 *
 * Usage:
 *   node .ai-dev/ai-dev-scripts/check-uac.js \
 *     --story=007-321 \
 *     --uac="FE: Toggle UI shows feature status"
 *
 * Options:
 *   --docs-path=<path>  Path to docs directory (default: ./docs)
 *   --story=<id>        Target story ID (e.g. 007-321) — required
 *   --uac=<string>      Partial or full match of the UAC text — required
 *   --dry-run           Show changes without writing
 *
 * Exit codes:
 *   0  success (UAC checked)
 *   1  missing args or errors
 *   2  UAC already checked or not found
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (prefix) => {
    const found = args.find(a => a.startsWith(prefix));
    return found ? found.slice(prefix.length) : null;
  };

  // Allow passing the UAC value with quotes even if parsing strips some
  let uacVal = get('--uac=');
  if (uacVal && uacVal.startsWith('"') && uacVal.endsWith('"')) {
    uacVal = uacVal.slice(1, -1);
  } else if (uacVal && uacVal.startsWith("'") && uacVal.endsWith("'")) {
    uacVal = uacVal.slice(1, -1);
  }

  return {
    docsPath: get('--docs-path=') || './docs',
    storyId: get('--story='),
    uacMatch: uacVal,
    dryRun: args.includes('--dry-run')
  };
}

function findStoryFile(epicsPath, storyId) {
  if (!fs.existsSync(epicsPath)) return null;

  const epicDirs = fs.readdirSync(epicsPath).filter(d => fs.statSync(path.join(epicsPath, d)).isDirectory());
  for (const epicDir of epicDirs) {
    const epicDirPath = path.join(epicsPath, epicDir);
    const statusDirs = ['pending', 'in-progress', 'qa', 'done', 'blocked', 'bugs'];
    for (const sd of statusDirs) {
      const sdPath = path.join(epicDirPath, sd);
      if (!fs.existsSync(sdPath)) continue;

      const files = fs.readdirSync(sdPath).filter(f => f.endsWith('.md'));
      for (const file of files) {
        if (file.startsWith(`${storyId}-`) || file === `${storyId}.md`) {
          return path.join(sdPath, file);
        }
      }
    }
  }
  return null;
}

function normalize(str) {
  return str.toLowerCase().replace(/\s+/g, ' ').trim();
}

function main() {
  const opts = parseArgs();

  // Validate args
  if (!opts.storyId) {
    process.stderr.write('Error: --story=<id> is required\n');
    process.exit(1);
  }
  if (!opts.uacMatch) {
    process.stderr.write('Error: --uac=<string> is required\n');
    process.exit(1);
  }

  const epicsPath = path.resolve(opts.docsPath, 'epics');
  const filePath = findStoryFile(epicsPath, opts.storyId);

  if (!filePath) {
    process.stderr.write(`Error: Could not find story ${opts.storyId} in ${epicsPath}\n`);
    process.exit(1);
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Find the exact UAC line to replace
  const lines = content.split('\n');
  const normalizedMatch = normalize(opts.uacMatch);
  
  let matchIndex = -1;
  let alreadyChecked = false;
  let exactMatchLine = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Must be a list item inside UAC section
    if (line.trim().startsWith('- [ ] ') || line.trim().startsWith('- [x] ') || line.trim().startsWith('- [X] ')) {
      const lineText = line.trim().slice(6); // Remove "- [.] "
      if (normalize(lineText).includes(normalizedMatch)) {
        if (line.trim().startsWith('- [x] ') || line.trim().startsWith('- [X] ')) {
          alreadyChecked = true;
          exactMatchLine = lineText;
        } else {
          matchIndex = i;
          exactMatchLine = lineText;
        }
        break; // Stop at first match
      }
    }
  }

  if (alreadyChecked) {
    process.stderr.write(`Notice: UAC is already checked for "${opts.uacMatch}" in ${opts.storyId}.\n`);
    process.exit(2);
  }

  if (matchIndex === -1) {
    process.stderr.write(`Error: Could not find unchecked UAC containing "${opts.uacMatch}" in ${opts.storyId}.\n`);
    process.exit(2);
  }

  // Toggle the checkbox
  lines[matchIndex] = lines[matchIndex].replace('- [ ]', '- [x]');

  // Add a changelog entry
  const now = new Date().toISOString();
  const logEntry = `- **${now}** — UAC completed: ${exactMatchLine}`;

  let changelogIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '## Changelog') {
      changelogIndex = i;
      break;
    }
  }

  if (changelogIndex !== -1) {
    // Insert after "## Changelog"
    lines.splice(changelogIndex + 1, 0, logEntry);
  } else {
    // If no changelog section, append it
    lines.push('');
    lines.push('## Changelog');
    lines.push(logEntry);
  }

  const finalContent = lines.join('\n');

  if (opts.dryRun) {
    process.stderr.write(`Dry run for ${filePath}:\n\n`);
    // Print a diff of what would change
    process.stderr.write(`- ${lines[matchIndex].replace('- [x]', '- [ ]')}\n`);
    process.stderr.write(`+ ${lines[matchIndex]}\n\n`);
    process.stderr.write(`+ ${logEntry}\n`);
  } else {
    fs.writeFileSync(filePath, finalContent, 'utf-8');
    process.stderr.write(`✅ UAC marked complete in ${path.relative(process.cwd(), filePath)}\n`);
    process.stdout.write(`UAC_UPDATED=true\nSTORY_ID=${opts.storyId}\n`);
  }
}

main();
