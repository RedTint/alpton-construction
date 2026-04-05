# /sync-board Skill

Sync project data from `docs/200-atomic-stories-v*.md` into the epic-based folder structure (`docs/epics/`). Each story becomes an individual markdown file with v2 YAML frontmatter. Epic stats are kept in sync. The file system is the board — no board.json required.

**This skill delegates the mechanical file I/O to deterministic Node.js scripts**, keeping token usage minimal. The agent only handles user interaction, display, and error recovery.

## Input Format

```
/sync-board
/sync-board --dry-run
/sync-board --epic 007
/sync-board --validate
```

**Arguments:**
- *(no args)* — Detect format, run full sync
- `--dry-run` — Show what would be created/updated without writing any files
- `--epic {id}` — Sync only a specific epic (e.g., `--epic 007`)
- `--validate` — Validate existing `docs/epics/` structure without syncing

---

## Execution Steps

### Phase 1: Pre-flight Check

1. **Check prerequisites**
   - Verify `docs/` directory exists
   - Check if `docs/epics/` exists (new format) or only `docs/200-atomic-stories-v*.md` (old format)
   - If neither → display error: "docs/ not found. Run /setup first."

2. **Confirm with user (unless --dry-run or --validate)**
   Display current state and ask:
   ```
   📋 /sync-board will sync your atomic stories to the epic folder structure.

   Current state:
   - Format: {old format / new format — N epics, M stories}
   - Source: docs/{atomic_stories_file}

   Proceed? (sync / dry-run / validate / cancel)
   ```

   If `--dry-run` → skip prompt, set dry_run = true
   If `--validate` → skip prompt, jump to Phase 3 (validate only)
   If "Cancel" → exit

---

### Phase 2: Run sync-board.js Script

This is the core step. The script handles ALL parsing, file creation, status derivation, and epic stat refresh.

1. **Build command**
   ```bash
   node .ai-dev/ai-dev-scripts/sync-board.js --docs-path=./docs
   ```
   Add flags based on user selection:
   - If dry-run: append `--dry-run`
   - If specific epic: append `--epic={id}`

2. **Execute script**
   // turbo
   Run the command and capture both stdout (JSON result) and stderr (human-readable progress).

3. **Parse JSON result from stdout**
   The script outputs:
   ```json
   {
     "generatedAt": "ISO timestamp",
     "source": "200-atomic-stories-v1.6.0.md",
     "progress": "000-progress-v1.6.0.md",
     "created": 5,
     "skipped": 40,
     "moved": 2,
     "errors": [],
     "epics": ["001-mvp-features", "002-code-generation-toolkit", ...]
   }
   ```

4. **If errors in result**, display them prominently:
   ```
   ❌ Sync errors:
   - {error details}
   ```

---

### Phase 3: Run Validation (always, or --validate only)

1. **Run validate-stories.js**
   ```bash
   node .ai-dev/ai-dev-scripts/validate-stories.js --docs-path=./docs --output=table
   ```
   Add `--epic={id}` if scoped to specific epic.

   // turbo
   Run and display the table output directly.

2. **If `--validate` was the only mode**, stop here after displaying validation results.

3. **Offer to fix issues if found**
   If errors > 0:
   ```
   ⚠️ {N} validation errors found. Auto-fix safe issues?
   ```
   If user confirms:
   // turbo
   ```bash
   node .ai-dev/ai-dev-scripts/validate-stories.js --docs-path=./docs --fix --output=table
   ```

4. **Offer migration if old files detected**
   If warnings show "Missing ## Changelog section" across many files:
   ```
   📋 {N} files can be upgraded to v2 format (adds changelog, related docs, design links).
   Run migration? This is additive — no existing content is removed.
   ```
   If user confirms:
   // turbo
   ```bash
   node .ai-dev/ai-dev-scripts/validate-stories.js --docs-path=./docs --fix --migrate --output=table
   ```

---

### Phase 4: Display Summary

After sync and/or validation:

1. **Show aggregate stats**
   // turbo
   ```bash
   node .ai-dev/ai-dev-scripts/aggregate-epics.js --docs-path=./docs --output=table
   ```

2. **Display completion summary**
   ```
   ✅ /sync-board complete!

   📖 Source:    {atomic_stories_file}
   📁 Target:    docs/epics/

   📊 Sync Results:
      Created:  {N} story files
      Skipped:  {N} (already existed)
      Moved:    {N} (status change)

   📈 Project Overview:
      {aggregate stats table from above}

   ⚠️ Validation: {N} errors, {N} warnings

   🎯 Next Steps:
      1. View dependency graph: node .ai-dev/ai-dev-scripts/dependency-graph.js --output=mermaid
      2. Start building: /build
      3. Track progress: /update-progress
   ```

**Dry run:** Replace "Sync Results" with "Would Create/Move" and append:
```
📌 Dry run — no files were written. Run /sync-board to apply changes.
```

---

## Error Handling

**`docs/` directory missing:**
```
❌ Error: docs/ directory not found.
Run /setup to initialize documentation structure.
```

**No atomic stories file:**
```
❌ Error: No atomic stories document found.
Expected: docs/200-atomic-stories-v*.md
Run /setup first.
```

**Script execution failure:**
- Display the stderr output from the script
- Suggest checking `node --version` (requires 18+) and `gray-matter` dependency
- Fallback: "Run `cd .ai-dev/ai-dev-scripts && npm install` to install dependencies"

---

## Important Notes

- **Script-first:** All file I/O is handled by `sync-board.js`, `validate-stories.js`, and `aggregate-epics.js`. The agent only orchestrates, displays, and handles user interaction.
- **Non-destructive:** Existing story files are never overwritten. Only new stories are created; existing ones are skipped.
- **Status moves:** If a story's status differs from its directory, the script moves the file.
- **v2 format:** New story files include `design_links`, `architecture_refs`, `related_docs`, and `changelog` fields.
- **Idempotent:** Running `/sync-board` multiple times is safe.
- **Token savings:** ~98% reduction vs. the previous agentic file-by-file approach.

## Success Criteria

1. ✅ `sync-board.js` executes successfully with 0 errors
2. ✅ All stories from atomic stories have corresponding files in `docs/epics/`
3. ✅ Story files have complete v2 YAML frontmatter
4. ✅ Story files placed in correct status directory
5. ✅ Epic stats refreshed via `aggregate-epics.js`
6. ✅ Validation passes with 0 errors
7. ✅ `--dry-run` previews changes without writing
8. ✅ `--validate` checks structure and reports issues
9. ✅ `--epic {id}` scopes to a single epic
