---
description: Sync atomic stories to docs/epics/ folder structure. Each story becomes an individual .md file with YAML frontmatter. File location = story status.
---

1. Pre-flight Check
   Check if docs/epics/ directory exists with content → new format (sync mode)
   Check if only docs/200-atomic-stories-v*.md exists → old format (migration mode)
   If neither → display error: "docs/ not found. Run /setup first."

   Supported arguments:
   - (no args) — full sync
   - --dry-run — show changes without writing
   - --epic {id} — sync only one epic
   - --validate — validate existing structure without syncing

   If --validate, skip to step 3.
   If --dry-run, skip user confirmation.
   Otherwise ask user: "Sync all stories to docs/epics/?" — yes / dry-run / validate / cancel.

2. Run sync-board.js Script
   Build and execute the sync command:

   // turbo
   node .ai-dev/ai-dev-scripts/sync-board.js --docs-path=./docs

   Add flags based on user selection:
   - If dry-run: append --dry-run
   - If specific epic: append --epic={id}

   Parse JSON result from stdout:
   - created: number of new story files
   - skipped: number of existing files
   - moved: number of files moved to correct status dir
   - errors: any issues

   Display stderr output (human-readable progress).
   If errors in result, display them prominently.

3. Run Validation
   // turbo
   node .ai-dev/ai-dev-scripts/validate-stories.js --docs-path=./docs --output=table

   Add --epic={id} if scoped to specific epic.
   Display table output directly.

   If --validate was the only mode, stop here.

   If errors > 0, offer to auto-fix:
   // turbo
   node .ai-dev/ai-dev-scripts/validate-stories.js --docs-path=./docs --fix --output=table

   If many "Missing Changelog" warnings, offer v2 migration:
   // turbo
   node .ai-dev/ai-dev-scripts/validate-stories.js --docs-path=./docs --fix --migrate --output=table

4. Display Summary
   Show aggregate stats:
   // turbo
   node .ai-dev/ai-dev-scripts/aggregate-epics.js --docs-path=./docs --output=table

   Display:
   ✅ /sync-board complete!

   Source:    {atomic_stories_file}
   Target:    docs/epics/

   Sync Results:
   - Created:  {N} story files
   - Skipped:  {N} (already existed)
   - Moved:    {N} (status change)

   Project Overview:
   {aggregate stats table}

   Validation: {N} errors, {N} warnings

   Next Steps:
   1. View dependency graph: node .ai-dev/ai-dev-scripts/dependency-graph.js --output=mermaid
   2. Start building: /build
   3. Track progress: /update-progress

   Dry run: append "Dry run — no files were written. Run /sync-board to apply."
