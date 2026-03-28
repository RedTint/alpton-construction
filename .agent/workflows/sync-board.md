---
description: Sync atomic stories to docs/epics/ folder structure. Each story becomes an individual .md file with YAML frontmatter. File location = story status.
---

1. Detect Format and Confirm
   // Note: Manual user confirmation required
   // Original: AskUserQuestion tool

   Check if docs/epics/ directory exists and contains epic subdirectories:
   - If docs/epics/ populated → project is on new epic format (sync mode)
   - If only docs/200-atomic-stories-v*.md → project is on old format (migration mode)
   - If neither → display error and stop: "docs/ directory not found. Run /setup first."

   Supported arguments:
   - (no args) — full sync
   - --dry-run — show changes without writing
   - --epic {id} — sync only one epic
   - --validate — validate existing structure without syncing

   If --validate, skip to step 7.
   If --dry-run, skip user confirmation and set dry_run = true.
   Otherwise ask user: "Sync all stories to docs/epics/?" — yes / dry-run / validate / cancel.

2. Find Source Documents
   Find docs/200-atomic-stories-v*.md — exclude *-draft.md — select highest version.
   Find docs/progress/000-progress-v*.md — select highest version.

   If atomic stories not found:
   "Error: No atomic stories document found. Run /setup first."

   Display:
   - Atomic Stories: {filename}
   - Progress:       {filename}

3. Parse Atomic Stories
   Read full content of the atomic stories file.
   Extract **Version:** header value → atomic_stories_version.

   Scan for epic sections (## headings) and story headings (### Story {ID} - {Title}).

   For each story extract:
   - id: story number string (e.g., "320")
   - title: story title
   - description: "As a ... I want ... So that ..." block
   - priority: from **Priority:** line → lowercase
   - effort: from **Effort:** {N} points → integer
   - version: version tag in priority line (e.g., "v1.6.0")
   - dependencies: from **Dependencies:** → array of ID strings (empty if "None")
   - uacs: all UAC lines under acceptance criteria with tag (FE/BE/DB/DevOps/CLI/TEST) and text
   - epic_id: derived from which ## section this story belongs to

   For summarized/completed stories (in Completed Stories Summary blocks):
   - Extract ID and title only
   - Mark status = "done", uacs = [] — skip file creation, index entry only

4. Derive Story Statuses from Progress Doc
   Read full content of the progress file.

   Build story_status_map keyed by story ID:
   - ✅ Completed → done
   - 🚧 In Progress → in-progress
   - ⏸️ Blocked → blocked
   - ❌ Cancelled → cancelled
   - default → pending

   Stories in Completed Stories Summary blocks → done.
   Apply statuses to all story objects from step 3.

5. Sync Stories to docs/epics/
   For each epic group:

   5a. Ensure Epic Directory Exists
   Target path: docs/epics/{###}-{epic-slug}/
   Create subdirectories:
   // turbo
   mkdir -p docs/epics/{epicDir}/pending
   mkdir -p docs/epics/{epicDir}/in-progress
   mkdir -p docs/epics/{epicDir}/qa
   mkdir -p docs/epics/{epicDir}/done
   mkdir -p docs/epics/{epicDir}/blocked
   mkdir -p docs/epics/{epicDir}/bugs

   Create epic.md if it doesn't exist (skip if already exists):
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

   5b. Determine Story File Target Path
   For each story: status_dir = status from story_status_map (default: pending)
   Target: docs/epics/{epicDir}/{status_dir}/{epicId}-{storyId}-{story-slug}.md

   5c. Skip Existing Files / Move Misplaced Files
   Check if any file matching {epicId}-{storyId}-*.md exists in any status dir.
   If file exists in correct dir → skip (do not overwrite user edits).
   If file exists in wrong dir → move to correct status dir, update updated_at.
   If file doesn't exist → create it.

   5d. Skip Summarized Stories
   Stories from Completed Stories Summary with uacs = [] → skip file creation.

   5e. Generate Story File with YAML Frontmatter
   For each new story file:
   ---
   story_id: "{epicId}-{storyId}"
   epic_id: "{epicId}"
   story_name: "{title}"
   story_status: {status}
   priority: {priority}
   story_points: {effort}
   assignees: []
   tags: [{epic_version}, {epic slug words}]
   dependencies: [{dependency IDs}]
   created_at: "{ISO timestamp}"
   updated_at: "{ISO timestamp}"
   completed_at: {null or ISO timestamp if done}
   uac_total: {count}
   uac_completed: {count of [x] UACs}
   uac_pending: {uac_total - uac_completed}
   uac_completion_pct: {round(uac_completed/uac_total*100) or 0}
   uac_by_type:
     fe: {count}
     be: {count}
     db: {count}
     devops: {count}
     cli: {count}
     test: {count}
   test_coverage: null
   test_unit_status: "pending"
   test_e2e_status: "pending"
   test_integration_status: "pending"
   ---

   Markdown body:
   ## Description
   **As a** {persona}
   **I want** {capability}
   **So that** {benefit}

   ## User Acceptance Criteria
   - [ ] FE: {text}
   - [ ] BE: {text}
   ... (all UAC lines as checkboxes, parseable by --reconcile)

   ## Test Requirements
   ## Dependencies
   ## Notes

6. Update Epic Frontmatter Stats
   After creating/updating all story files for each epic:

   Scan all story files in all status dirs under the epic directory.
   Aggregate:
   - total_stories: count all story files
   - completed_stories: count in done/
   - total_points: sum story_points from all frontmatters
   - completed_points: sum story_points from done/ stories
   - completion_pct: round(completed_points / total_points * 100)
   - stories_by_status: count files in each status dir
   - bugs_open: count files in bugs/ dir

   Determine epic_status:
   - All stories in done/ → completed
   - Any story in in-progress/ or qa/ → in-progress
   - Any story in blocked/ with none in progress → blocked
   - Default → pending

   Update epic.md frontmatter with calculated values + updated_at = now.

   Or run: node .ai-dev/ai-dev-scripts/aggregate-epics.js --update --docs-path=./docs

7. Update Atomic Stories Index
   After syncing all epics, update docs/200-atomic-stories-v*.md:

   Rebuild story list for each epic section as links:
   - [Story 320 - Epic & Story File Organization System](epics/007-sync-board-project-management/pending/007-320-*.md) ⏳ — 13 pts
   - [Story 321 - YAML Frontmatter Integration](epics/007-sync-board-project-management/pending/007-321-*.md) ⏳ — 13 pts

   Status icons: ⏳ pending | 🚧 in-progress | 🔍 qa | ✅ done | ⚠️ blocked

   Update Quick Stats section (total epics, stories, points, completion %).
   Only update if file is already in index format (migrated); skip if still full story content.

8. Validate Structure
   Run validation checks on docs/epics/:
   - Schema: every story file has all required YAML frontmatter fields
   - Stats accuracy: uac_total matches actual UAC line count in body
   - Status consistency: story_status matches the directory the file lives in
   - Epic stats: epic total_stories matches actual file count
   - Broken dependencies: no story references non-existent story ID

   Report format:
   ✅ VALID:   docs/epics/007-sync-board/pending/007-320-*.md
   ❌ ERROR:   docs/epics/007-sync-board/pending/007-999-*.md — Missing: story_points
   ⚠️ WARNING: docs/epics/007-sync-board/done/007-321-*.md — UAC stats mismatch

9. Display Summary
   ✅ /sync-board complete!

   Source:    {atomic_stories_file}
   Target:    docs/epics/

   Sync Results:
   - Epics:    {N} directories ensured
   - Created:  {N} story files
   - Skipped:  {N} (already existed)
   - Moved:    {N} (to correct status dir)
   - Index:    docs/{atomic_stories_file} updated

   Project Overview:
   - Total Stories: {total} ({done} done / {wip} in-progress / {pending} pending)
   - Total Points:  {total_pts} ({done_pts} completed, {remaining} remaining)
   - Overall:       {pct}%

   By Epic:
   - Epic 001 - MVP Features:            100% (6/6) ✅
   - Epic 007 - Sync-Board & Mgmt:         0% (0/13) ⏳

   Validation: {N} errors, {N} warnings

   Dry run: show "Would Create/Move" instead and append:
   "Dry run — no files were written. Run /sync-board to apply."
