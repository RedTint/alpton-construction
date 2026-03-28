---
description: Build workstream features with automatic workstream detection when only one exists
---

1. Identify Target Workstream
   Check for --workstream {ID} flag in arguments
   If not provided, auto-detect workstream:

   Run: ls -d docs/scrums/*/ 2>/dev/null | wc -l

   If 0 workstreams: Error - no workstreams exist
   If 1 workstream: Auto-select (extract ID from directory name)
   If 2+ workstreams: Error - require --workstream {ID} flag

2. Validate Workstream Exists
   Verify directory exists: docs/scrums/{ID}-{description}/
   If not found:
   - List available workstreams
   - Suggest: /scrum-of-scrums {description} to create

3. Extract Workstream Details
   Read workstream README: docs/scrums/{ID}-{description}/000-README.md
   Extract workstream name and purpose
   Note parent-mapped vs workstream-specific documents

4. Detect Draft Documents
   Find draft documents in workstream:
   Run: find docs/scrums/{ID}-* -name "*-draft.md" 2>/dev/null

   If drafts found, display warning (they will be excluded from build)

5. Read Workstream Atomic Stories
   Find latest workstream atomic stories:
   Run: ls docs/scrums/{ID}-*/200-atomic-stories-v*.md | grep -v draft | sort -V | tail -1

   Read the file
   Parse workstream stories and UACs
   Categorize UACs by type: FE, BE, DB, DevOps, CLI

6. Read Workstream Progress
   Find matching workstream progress version:
   Run: ls docs/scrums/{ID}-*/progress/000-progress-v*.md | grep -v draft | sort -V | tail -1

   Read the file
   Identify completed vs pending stories
   Extract pending UACs by category

7. Read Parent Documentation (for context)
   Check workstream README for parent-mapped documents
   Read .ref.md files to identify parent dependencies
   Read parent documents for implementation context

8. Analyze Pending Workstream Work
   Count pending UACs by type:
   - FE: Frontend UACs
   - BE: Backend UACs
   - DB: Database UACs
   - DevOps: Infrastructure UACs

   Determine which build commands are needed

9. User Input: Select Build Commands
   // Note: Manual user input required
   // Original: AskUserQuestion for command selection

   Ask user which build commands to execute for workstream:
   - build-fe (if FE UACs pending)
   - build-be (if BE UACs pending)
   - build-devops (if DevOps UACs pending)
   - all available
   - cancel

   Ask execution mode:
   - In parallel (faster, all at once) [Recommended]
   - Sequentially (one at a time)

10. Execute Build Commands
    // Note: Original uses parallel Task execution
    // Antigravity: Run these sequentially

    For each selected build command:
    - Pass workstream context (ID, paths, parent mappings)
    - Execute build skill with workstream atomic stories
    - Output to workstream-specific directories
    - Monitor progress

    Example for sequential execution:
    Execute /build-fe for workstream (using workstream atomic stories)
    Execute /build-be for workstream (using workstream atomic stories)
    Execute /build-devops for workstream (using parent config)

11. Update Workstream Progress
    Run /workstream-update-progress --workstream {ID}
    This will:
    - Check off completed UACs
    - Update story completion percentages
    - Recalculate workstream progress
    - Update workstream change log

12. Validate Build Results
    Check generated workstream code compiles:
    Run: cd workstreams/{ID}-{description} && npm run build
    Run: npm test

    If validation fails, display errors

13. Display Build Summary
    Show comprehensive workstream build summary:
    - Workstream ID and name
    - UACs implemented by category
    - Files generated (count by type)
    - Build commands executed
    - Workstream progress update
    - Test coverage
    - Parent dependencies used
    - Next steps (review, test, PR)
