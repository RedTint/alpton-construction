---
description: Fix bugs from docs/epics/ RCA files, implement fix, update tests, mark resolved in epic structure and bugs-index.md
---

1. Parse Input and Locate Bug
   Extract bug identifier from arguments (BUG-042 / 042 / bug-042 / #042)
   Normalize to: BUG-{NNN} (zero-padded 3 digits)

   Search for bug RCA file in epic structure:
   - Glob: docs/epics/*/bugs/*-bug-{number}-*.md
   - If not found: check docs/epics/bugs-index.md for link to bug file
   - If still not found: display error "Bug {bug_id} not found in docs/epics/*/bugs/" and exit

   Store bug_rca_path and extract selectedEpicDir + selectedEpicId from path

   Read YAML frontmatter of bug file:
   - Extract: bug_severity, bug_category, bug_status, related_story

   If related_story is set: locate story file at docs/epics/{selectedEpicDir}/**/{related_story}-*.md

2. Read and Analyze RCA
   Read full bug RCA document from bug_rca_path
   Extract: Expected Behavior, Current Behavior, Root Cause (5 Whys), Affected Components, Impact Assessment
   Validate RCA has all required sections

   Display RCA summary:
   - Bug ID, severity, category, status
   - Root cause (2-3 sentences)
   - Affected components list
   - Proposed fix approach

3. Confirm Fix Approach with User
   Propose fix strategy based on RCA root cause
   // Note: Manual user input required
   // Original: AskUserQuestion tool
   Ask user to confirm fix approach or suggest alternative

4. Read Affected Files
   Load all files listed in RCA "Affected Components" section
   Identify exact code locations needing changes
   Analyze current implementation to validate RCA findings

5. Implement the Fix
   Apply code changes to affected files using Edit tool
   Preserve existing code style and formatting
   Add comments referencing bug ID (e.g., // Fix BUG-042: ...)

6. Update or Create Tests
   Locate existing test files for affected components
   Add new test cases that verify the bug scenario is fixed
   Create test file if none exists
   Test coverage: bug scenario, edge cases, error handling

7. Run Tests and Verify Fix
   Determine test command from package.json
   Run unit tests: npm run test (or category-specific)
   Run E2E tests for P0/P1 severity bugs: npm run test:e2e
   Analyze results — all tests must pass

   If tests fail:
   // Note: Manual user input required
   // Original: AskUserQuestion tool
   Ask: "Debug fix? / Revise approach? / Skip tests?"

8. Update Bug RCA Document
   Update "Resolution Notes" section with:
   - Status: ✅ Resolved
   - Fixed date, fix method
   - Changes made (files and descriptions)
   - Tests added and results
   - Verification steps
   - Future prevention recommendations
   - Related Updates: progress doc, docs/epics/bugs-index.md, epic.md

9. Update Progress Tracking
   Read latest docs/progress/000-progress-v*.md
   Update bug entry: change status to ✅ Resolved
   Add resolution date and link to bug file at docs/epics/{epicDir}/bugs/{filename}
   Update bug statistics (decrement Pending, increment Resolved)

10. Update Cross-Epic Bug Index and Epic Stats
    Update docs/epics/bugs-index.md:
    - Find bug row and change status ⏳ Open → ✅ Resolved
    - Decrement "Open" count, increment "Resolved" count

    Update bug RCA frontmatter: bug_status: "resolved", completed_at: {ISO now}, updated_at: {ISO now}

    If related_story was set: update story file related_bugs entry, set updated_at

    Refresh epic stats:
    Run: node .ai-dev/ai-dev-scripts/aggregate-epics.js --update --docs-path=./docs --epic={selectedEpicId}
    This decrements bugs_open and increments bugs_resolved in epic.md

11. Validate Fix Completion
    Verify: ✅ Code fix applied | ✅ Tests added and passing | ✅ Bug RCA updated
    Verify: ✅ Progress doc updated | ✅ bugs-index.md updated | ✅ epic.md stats refreshed
    Verify: ✅ Related story updated (if applicable)

12. Optional Git Commit
    // Note: Manual user confirmation required
    // Original: AskUserQuestion tool
    If confirmed, stage and commit:
    - Code fix files + test files
    - Bug RCA file: docs/epics/{epicDir}/bugs/{filename}
    - docs/epics/bugs-index.md
    - docs/epics/{epicDir}/epic.md
    - docs/progress/000-progress-v*.md
    Commit message: "fix(BUG-{number}): {brief summary} — resolves BUG-{number}"

13. Generate Comprehensive Summary
    Display: Bug ID, severity, root cause, fix method
    Show files modified, tests added, test results
    Show epic story file transition status
    Suggest: /log-learning to capture learnings from the fix
