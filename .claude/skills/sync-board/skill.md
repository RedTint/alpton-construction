# /sync-board Skill

Sync project data from the old `docs/200-atomic-stories-v*.md` format into the new epic-based folder structure (`docs/epics/`). Each story becomes an individual markdown file with YAML frontmatter. Epic stats and the atomic stories index are kept in sync. The file system is the board — no board.json required.

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

### Phase 0: Detect Format & Confirm

1. **Check `docs/epics/` directory exists**
   - If `docs/epics/` exists with content → project is already on **new format**
   - If only `docs/200-atomic-stories-v*.md` exists → project is on **old format**
   - If neither exists → error

2. **Prompt User (unless `--dry-run` or `--validate`)**
   ```
   Question: "/sync-board will sync your atomic stories to the epic folder structure.
   This will read 200-atomic-stories-v*.md and create/update files in docs/epics/.

   Current state:
   - Format: {old format / new format - N epics, M stories}
   - Source: docs/{atomic_stories_file}

   How do you want to proceed?"

   Options:
   - "Sync all stories → docs/epics/" — full sync (default)
   - "Dry run — show changes without writing" — preview only
   - "Validate existing structure only" — check for issues
   - "Cancel" — exit
   ```

3. **If `--dry-run` flag passed**, skip prompt and set `mode = dry-run`
4. **If `--validate` flag passed**, skip prompt and jump to Phase 5
5. **If "Cancel" selected**, exit immediately

---

### Phase 1: Find & Read Source Documents

1. **Locate Atomic Stories Document**
   - Glob `docs/200-atomic-stories-v*.md` (exclude `-draft.md`)
   - Select highest version numerically (compare major.minor.patch)
   - If none found:
     ```
     ❌ Error: No atomic stories document found.
     Expected: docs/200-atomic-stories-v*.md
     Run /setup to initialize documentation.
     ```
   - Store as `atomic_stories_file`

2. **Locate Progress Document**
   - Glob `docs/progress/000-progress-v*.md`
   - Select highest version
   - Store as `progress_file` (used to derive story statuses)

3. **Display Status**
   ```
   📖 Reading...
   - Atomic Stories: {atomic_stories_file}
   - Progress:       {progress_file}
   ```

---

### Phase 2: Parse Atomic Stories

1. **Read full content** of `atomic_stories_file`

2. **Extract version** from `**Version:** {version}` header → `atomic_stories_version`

3. **Extract Epic Definitions**
   - Scan for `## Epic {###}` or `## v{X}.X.X Stories - {Name}` section headings
   - Map each section to an epic:
     - `epic_id`: Derive from section order or explicit ID (001, 002, ..., 007)
     - `epic_name`: From heading (e.g., "Sync-Board & Project Management System")
     - `epic_version`: Version string associated with the section (e.g., `v1.6.0`)
   - Use the existing `docs/epics/` directory names if already present to preserve IDs

4. **Extract Stories**
   - Scan for story headings: `### Story {ID} - {Title}`
   - For each story, extract:
     - `id`: Story number string (e.g., `"320"`)
     - `title`: Story title
     - `description`: `**As a** ... **I want** ... **So that** ...` block
     - `priority`: From `**Priority:** {High/Medium/Low}` → lowercase
     - `effort`: From `**Effort:** {N} points` → integer
     - `version`: Version tag in priority line e.g. `(v1.6.0)` → `"v1.6.0"`
     - `dependencies`: From `**Dependencies:** Stories {ID}, {ID}` → array of strings
     - `uacs`: All lines under `#### User Acceptance Criteria` with format `- {TAG}: {text}`
     - `epic_id`: Derived from the `## ...` section this story belongs to
   - For **summarized/completed stories** (in `## Completed Stories Summary`):
     - Extract ID + title only
     - Mark `status = "completed"`, `uacs = []`, `effort = 0` (already done, skip file creation)

5. **Parse UAC Lines**
   - Format: `- {TAG}: {description}` (TAG = FE, BE, DB, DevOps, CLI, TEST)
   - Checkbox variants: `- [ ] {TAG}: {text}` → pending; `- [x] {TAG}: {text}` → completed
   - Skip lines with `N/A`
   - For stories with full UAC details: parse and count by type
   - For summarized stories: no UAC parsing needed

---

### Phase 3: Derive Story Statuses from Progress Doc

1. **Read `progress_file`** content

2. **Build `story_status_map`** keyed by story ID:
   - Scan for `### Story {ID}` blocks
   - Extract `**Status:**` → map to: `pending`, `in-progress`, `qa`, `done`, `blocked`, `cancelled`
   - Status emoji mapping:
     - `✅ Completed` → `done`
     - `🚧 In Progress` → `in-progress`
     - `⏸️ Blocked` → `blocked`
     - `❌ Cancelled` → `cancelled`
     - default → `pending`
   - Stories in `## Completed Stories Summary` → `done`

3. **Apply statuses** to story objects from Phase 2

---

### Phase 4: Sync Stories to `docs/epics/`

For each epic group extracted in Phase 2:

#### 4a: Ensure Epic Directory Exists

- Target path: `docs/epics/{###}-{epic-slug}/`
  - `###` = zero-padded epic number (001, 002, ..., 007)
  - `epic-slug` = kebab-case epic name (e.g., `sync-board-project-management`)
- Create subdirectories: `pending/`, `in-progress/`, `qa/`, `done/`, `blocked/`, `bugs/`
- Create `epic.md` if it doesn't exist:
  ```yaml
  ---
  epic_id: "{###}"
  epic_name: "{Epic Name}"
  epic_status: pending
  epic_version: "{v1.6.0}"
  priority: high
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
  bugs_open: 0
  bugs_resolved: 0
  created_at: "{ISO timestamp}"
  updated_at: "{ISO timestamp}"
  ---

  # Epic {###}: {Epic Name}

  {Epic description from atomic stories section intro}
  ```
- **Skip** if epic directory already exists (do not overwrite `epic.md`)

#### 4b: Determine Story File Target Path

For each story in the epic:
- `status_dir` = story's status from `story_status_map` (default: `pending`)
- Target: `docs/epics/{epic-dir}/{status_dir}/{epic_id}-{story_id}-{story-slug}.md`
  - `story-slug` = kebab-case story title (e.g., `epic-story-file-organization-system`)
  - Example: `007-320-epic-story-file-organization-system.md`

#### 4c: Skip Already-Existing Files

- Check if any file matching `{epic_id}-{story_id}-*.md` exists in **any** status dir under the epic
- If file exists: **skip creation** (do not overwrite user edits)
- If file exists but in wrong status dir: **move** to correct status dir (update `updated_at` in frontmatter)

#### 4d: Skip Summarized/Completed Stories

- Stories from `## Completed Stories Summary` blocks with `uacs = []`:
  - **Do not** create files for these (already compressed, no detail available)
  - They will appear as index entries only

#### 4e: Generate Story File with YAML Frontmatter

For each new story file to create:

```yaml
---
story_id: "{epic_id}-{story_id}"
epic_id: "{epic_id}"
story_name: "{title}"
story_status: {status}
priority: {priority}
story_points: {effort}
assignees: []
tags: [{epic_version}, {lowercase epic slug words}]
dependencies: [{comma-separated quoted dependency IDs}]
created_at: "{current ISO timestamp}"
updated_at: "{current ISO timestamp}"
completed_at: {null | "ISO timestamp if done"}
uac_total: {count of all UAC lines}
uac_completed: {count of [x] UAC lines}
uac_pending: {uac_total - uac_completed}
uac_completion_pct: {round(uac_completed / uac_total * 100) or 0}
uac_by_type:
  fe: {count of FE: UACs}
  be: {count of BE: UACs}
  db: {count of DB: UACs}
  devops: {count of DevOps: UACs}
  cli: {count of CLI: UACs}
  test: {count of TEST: UACs}
test_coverage: null
test_unit_status: "pending"
test_e2e_status: "pending"
test_integration_status: "pending"
---
```

**Body content** after frontmatter:
```markdown
## Description

**As a** {persona}
**I want** {capability}
**So that** {benefit}

## User Acceptance Criteria

{All UAC lines as markdown checkboxes}
- [ ] FE: {text}
- [ ] BE: {text}
...

## Test Requirements
{Test requirements section from atomic stories}

## Dependencies
{Dependencies section}

## Notes
{Example usage, example output, additional context from original story}
```

---

### Phase 5: Update Epic Frontmatter Stats

After creating/updating all story files for an epic:

1. **Scan all story files** in all status dirs under the epic directory
2. **Aggregate stats:**
   - `total_stories`: count of all story files
   - `completed_stories`: count in `done/`
   - `total_points`: sum of `story_points` from all frontmatters
   - `completed_points`: sum of `story_points` from `done/` stories
   - `completion_pct`: `round(completed_points / total_points * 100)`
   - `stories_by_status`: count files in each status dir
3. **Determine epic_status:**
   - All stories in `done/` → `completed`
   - Any story in `in-progress/` or `qa/` → `in-progress`
   - All stories in `pending/` → `pending`
   - Any story in `blocked/` with none in progress → `blocked`
4. **Update `epic.md` frontmatter** with calculated values + `updated_at = now`

---

### Phase 6: Update Atomic Stories Index

After syncing all epics, update `docs/200-atomic-stories-v*.md` to ensure it reflects the current epic structure:

1. **Rebuild the story list** for each epic section as links:
   ```markdown
   - [Story 320 - Epic & Story File Organization System](epics/007-sync-board-project-management/pending/007-320-epic-story-file-organization-system.md) ⏳ — 13 pts
   - [Story 321 - YAML Frontmatter Integration](epics/007-sync-board-project-management/pending/007-321-yaml-frontmatter-integration-for-all-documents.md) ⏳ — 13 pts
   ```
   - Status icons: `⏳` pending, `🚧` in-progress, `🔍` qa, `✅` done, `⚠️` blocked
2. **Update Quick Stats** section:
   - Total epics, active/completed/pending counts
   - Total stories, completed stories
   - Total story points, completed story points
   - Overall completion %
3. **Preserve** all other content (version history, format description, notes)
4. **Only update** if format is currently the index format (already migrated); skip if full story content still present

---

### Phase 7: Validate Structure

Run validation checks on `docs/epics/`:

1. **Schema checks** — Every story file has all required YAML frontmatter fields
2. **Stats accuracy** — `uac_total` matches actual UAC line count in markdown body
3. **Status consistency** — `story_status` in frontmatter matches the directory the file lives in
4. **Epic stats** — Epic `total_stories` matches actual file count
5. **Broken dependencies** — No story references a non-existent story ID
6. **Orphaned files** — No story files outside of expected status dirs

Report format:
```
✅ VALID:   docs/epics/007-sync-board/pending/007-320-*.md
❌ ERROR:   docs/epics/007-sync-board/pending/007-999-*.md — Missing required field: story_points
⚠️ WARNING: docs/epics/007-sync-board/done/007-321-*.md — UAC stats mismatch (frontmatter: 10, actual: 12)
```

---

### Phase 8: Display Summary

```
✅ /sync-board complete!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📂 Epic Folder Structure Synced
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 Source:    {atomic_stories_file}
📁 Target:    docs/epics/

📊 Sync Results:
   Epics:          {N} directories ensured
   Stories synced: {N} files created / {N} skipped (already existed) / {N} moved
   Index updated:  docs/{atomic_stories_file} ✅

📈 Project Overview:
   Total Stories:    {total} ({completed} done, {in_progress} in-progress, {pending} pending)
   Total Points:     {total_points} ({completed_points} completed, {remaining} remaining)
   Overall:          {completion_pct}%

📋 By Epic:
   Epic 001 - MVP Features:                 100% (6/6 stories) ✅
   Epic 002 - Code Generation:              100% (4/4 stories) ✅
   ...
   Epic 007 - Sync-Board & Mgmt:              0% (0/13 stories) ⏳

⚠️ Validation: {N} errors, {N} warnings
   {list issues if any}

🎯 Next Steps:
   1. Run backend:  cd .ai-dev/ai-dev-dashboard/backend && npm run start:dev
   2. Run frontend: cd .ai-dev/ai-dev-dashboard/frontend && npm run dev
   3. View board:   http://localhost:3001
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

**Epic directory conflict (ID collision):**
```
⚠️ Warning: Epic ID 007 already exists at a different path.
Existing: docs/epics/007-old-epic-name/
New:      docs/epics/007-sync-board-project-management/
Skipping epic creation. Syncing stories into existing directory.
```

**Story parse failure:**
```
⚠️ Warning: Could not parse Story {ID} from atomic stories.
Reason: {specific parse error}
Skipping story. Review source document manually.
```

---

## Important Notes

- **Non-destructive by default:** Existing story files are never overwritten. Only new stories are created; existing ones are skipped.
- **Status moves:** If a story's status in the progress doc differs from its current directory, the file is moved to the correct status dir (not overwritten).
- **Completed summaries:** Stories in `## Completed Stories Summary` blocks (compressed, no UAC detail) are tracked in the index only — no individual files are created.
- **Idempotent:** Running `/sync-board` multiple times is safe. Duplicate runs only move mismatched files and update stats.
- **Index update:** The atomic stories file is updated to use links pointing to individual story files after migration.
- **Epic IDs:** Epic IDs are derived from the order of `##` sections in atomic stories. If `docs/epics/` already exists, existing directory names/IDs are respected.
- **New format detection:** Once `docs/epics/` exists and is populated, `/sync-board` runs in "sync mode" — updating stats and moving files instead of full migration.

## Success Criteria

1. ✅ All stories from atomic stories file have corresponding files in `docs/epics/`
2. ✅ All story files have complete YAML frontmatter with accurate UAC stats
3. ✅ Story files placed in correct status directory matching progress doc
4. ✅ Epic directories created with `epic.md` frontmatter
5. ✅ Epic stats calculated from story files (total/completed/points/by-status)
6. ✅ Atomic stories index updated with links to individual story files
7. ✅ Validation passes with 0 errors
8. ✅ `--dry-run` previews all changes without writing
9. ✅ `--validate` checks existing structure and reports issues
10. ✅ `--epic {id}` scopes sync to a single epic
