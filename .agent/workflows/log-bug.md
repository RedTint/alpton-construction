---
description: Log bugs with full RCA into docs/epics/{epic}/bugs/ as YAML-frontmatter story files. All bugs are epic-linked — no standalone bugs.
---

1. Parse Bug Description
   Extract from command arguments:
   - Brief summary (1 sentence)
   - Where the bug occurs (feature/component/file)
   - Expected vs actual behavior
   - Steps to reproduce (if provided)

   Categorize bug type by keywords:
   - Frontend (FE): UI/component/styling issues
   - Backend (BE): API/endpoint/service errors
   - Database (DB): Schema/migration problems
   - DevOps: Build/deploy/CI issues
   - Documentation: Incorrect/outdated docs
   - Testing: Test failures, missing coverage

   Determine severity:
   - Critical (P0): System down, data loss, security
   - High (P1): Major feature broken, affects most users
   - Medium (P2): Partial breakage, workaround exists
   - Low (P3): Minor/cosmetic issue

2. Assign Global Bug Number and Generate Filename
   Find all existing bug files:
   Find files matching: docs/epics/*/bugs/*-bug-*.md

   Count existing bugs to assign next sequential number (001, 002...) — global across all epics.
   Store as bug_number (e.g., "042")

   Generate bug filename:
   - Extract short slug from summary (kebab-case, 40 chars max)
   - Format: {epicId}-bug-{bug_number}-{short-desc}.md
   - Example: 007-bug-042-api-returns-500-error.md

3. Select Target Epic (Required)
   // Note: Manual user input required
   // Original: AskUserQuestion tool

   Find all epic files: docs/epics/*/epic.md
   Read epic_id and epic_name from each file's YAML frontmatter.

   If no epics found, display error and stop:
   "No epics found in docs/epics/. Run /new-feature or /sync-board first."

   Display epic list and ask user which epic this bug belongs to.
   Store selectedEpicId and selectedEpicDir.

4. Identify Affected Story (Optional)
   // Note: Manual user input required
   // Original: AskUserQuestion tool

   Find story files in the selected epic:
   Find files matching: docs/epics/{selectedEpicDir}/**/*.md (exclude epic.md and bugs/)

   Display story IDs and names from frontmatter story_name.
   Ask user which story is affected (or 'none' if not story-specific).
   Store affectedStoryId and affectedStoryFile path (null if none).

5. Ensure Epic bugs/ Directory
   // turbo
   mkdir -p docs/epics/{selectedEpicDir}/bugs

6. Perform Root Cause Analysis
   Read relevant documentation for context:
   - docs/200-atomic-stories-v*.md (latest)
   - docs/300-frontend-v*.md (if FE bug)
   - docs/325-backend-v*.md (if BE bug)
   - docs/375-database-schema-v*.md (if DB bug)
   - docs/350-api-contract-v*.md (if API bug)
   - docs/425-devops-v*.md (if DevOps bug)
   - docs/epics/{selectedEpicDir}/epic.md (epic context)
   - affectedStoryFile if story was selected

   Search for related code/components mentioned in bug report.

   Analyze Expected vs Current Behavior — document the gap.

   Identify Root Cause using 5 Whys technique until root cause found.

   Create Data Flow Diagram or Schema Analysis:
   - Backend/API: Request → Service → Database flow
   - Frontend: Component hierarchy and state flow
   - Database: Schema relationships and constraints
   - DevOps: Pipeline stages and infrastructure

   Identify Affected Components (files, functions, line numbers).

   Assess Impact: user impact, system impact, business impact.

7. Write Bug File
   Write to: docs/epics/{selectedEpicDir}/bugs/{bug_filename}

   File must start with YAML frontmatter:
   ---
   story_id: "{epicId}-bug-{bug_number}"
   epic_id: "{epicId}"
   story_name: "BUG-{bug_number}: {brief summary}"
   story_status: bug
   priority: {high if P0/P1 | medium if P2 | low if P3}
   story_points: 0
   assignees: []
   tags: [bug, {lowercase category}, {severity label}]
   dependencies: [{affectedStoryId or empty list}]
   created_at: "{ISO timestamp}"
   updated_at: "{ISO timestamp}"
   completed_at: null
   uac_total: 0
   uac_completed: 0
   uac_pending: 0
   uac_completion_pct: 0
   uac_by_type:
     fe: 0
     be: 0
     db: 0
     devops: 0
     cli: 0
     test: 0
   bug_severity: "{P0|P1|P2|P3}"
   bug_category: "{Frontend|Backend|Database|DevOps|Documentation|Testing}"
   bug_status: "open"
   related_story: "{affectedStoryId or null}"
   test_coverage: null
   test_unit_status: "pending"
   test_e2e_status: "pending"
   test_integration_status: "pending"
   ---

   Markdown body sections:
   - # Bug #{bug_number}: {Brief Summary}
   - Expected Behavior (with spec references)
   - Current Behavior (error messages, steps to reproduce)
   - Root Cause Analysis (5 Whys, immediate/underlying/root causes)
   - Data Flow / System Analysis (DFD or diagram)
   - Affected Components (files, functions, line numbers)
   - Impact Assessment (user, system, business)
   - Related Issues (similar bugs, related stories, ADRs)
   - Resolution Notes (empty — filled by /fix-bug)
   - Keywords

8. Update Affected Story File
   If a story was selected in step 4:
   Read affectedStoryFile YAML frontmatter.
   Add bug reference to related_bugs array (create field if absent).
   Update updated_at to now.
   Edit only the YAML frontmatter block — preserve markdown body.

9. Refresh Epic Stats
   Run:
   node .ai-dev/ai-dev-scripts/aggregate-epics.js --update --docs-path=./docs --epic={selectedEpicId}

   This increments bugs_open in epic.md frontmatter.
   If script fails, display warning but continue.

10. Update Progress Tracking
    Find latest progress doc: docs/progress/000-progress-v*.md

    Locate or create "Known Bugs" section.

    Add bug abstract (PROBLEM only — no solution details):
    #### BUG-{number}: {Brief Summary}
    Severity: {P0/P1/P2/P3} | Category: {type} | Status: ⏳ Pending
    File: docs/epics/{epicDir}/bugs/{bug_filename}
    Abstract: {1-2 sentences describing the bug, no fix spoilers}
    Use /fix-bug BUG-{number} to fix

    Update bug statistics (total, by severity, by status).

11. Update Cross-Epic Bugs Index
    Check if docs/epics/bugs-index.md exists; create if not.

    Add new bug row to appropriate severity table:
    | [BUG-{N}](epics/{epicDir}/bugs/{filename}) | {summary} | {epicName} | ⏳ Open |

    Update statistics counts (total bugs, open/resolved, by severity).

12. Validate
    Verify: docs/epics/{epicDir}/bugs/{bug_filename} exists
    Verify: docs/epics/bugs-index.md exists and contains new entry
    Verify: progress doc has bug abstract
    Verify: YAML frontmatter has all required fields
    Verify: affected story has related_bugs if story was selected

13. Display Summary Report
    🐛 Bug logged successfully!

    Bug ID:    BUG-{number}
    Summary:   {description}
    Severity:  {Critical/High/Medium/Low} (P{0-3})
    Category:  {type}
    Epic:      {epicId} — {epicName}
    Story:     {affectedStoryId or "Not story-specific"}

    📍 Files Created/Updated:
    - Bug RCA:   docs/epics/{epicDir}/bugs/{bug_filename}
    - Epic:      docs/epics/{epicDir}/epic.md (bugs_open updated)
    - Bug Index: docs/epics/bugs-index.md
    - Progress:  docs/progress/000-progress-v{version}.md

    Root Cause: {1 sentence}
    Next Step:  /fix-bug BUG-{number}

14. Optional Git Commit
    // Note: Manual user confirmation required
    // Original: AskUserQuestion tool

    If user confirms, stage and commit:
    git add docs/epics/{selectedEpicDir}/bugs/{bug_filename}
    git add docs/epics/{selectedEpicDir}/epic.md
    git add docs/epics/bugs-index.md
    git add docs/progress/000-progress-v*.md
    git commit -m "docs: log BUG-{number} - {brief summary}

    - Category: {category} | Severity: P{n} ({label})
    - Created bug RCA in docs/epics/{epicDir}/bugs/
    - Updated cross-epic bugs index (bugs-index.md)
    - Updated epic {epicId} stats (bugs_open incremented)
    - Updated progress tracking v{version}

    Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
