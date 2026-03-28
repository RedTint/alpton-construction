# Workstream Build Orchestrator Command

Intelligently orchestrate implementation for a specific workstream by detecting available build commands and executing them based on the workstream's atomic stories and progress.

## Execution Steps

### Phase 1: Identify Target Workstream

1. **Parse Workstream ID from Arguments**
   - Check if `--workstream {ID}` flag is present in command arguments
   - Extract workstream ID (e.g., `--workstream 001` → ID: 001)
   - Format: 3-digit zero-padded (001, 002, etc.)

2. **Auto-Detect Workstream (if not specified)**
   - Use Glob to find all workstreams: `docs/scrums/*/`
   - Count workstreams:
     - If **0 workstreams**: Display error (no workstreams exist)
     - If **1 workstream**: Auto-select (no flag needed)
     - If **2+ workstreams**: Require `--workstream {ID}` flag
   - Parse workstream ID from directory name (e.g., `001-cli-dashboard` → ID: 001)

3. **Validate Workstream Exists**
   - Verify directory exists: `docs/scrums/{ID}-{description}/`
   - If not found:
     - Display error: "Workstream not found: {ID}"
     - List available workstreams
     - Suggest: `/scrum-of-scrums {description}` to create new workstream

4. **Extract Workstream Details**
   - Parse workstream directory name to get description
   - Read workstream README: `docs/scrums/{ID}-{description}/000-README.md`
   - Extract workstream name and purpose
   - Note parent-mapped vs workstream-specific documents

### Phase 2: Analyze Workstream Documentation

1. **Detect Draft Documents**
   - Use Glob to find draft documents in workstream: `docs/scrums/{ID}-*/**/*-draft.md`
   - If draft documents exist:
     - Display prominent warning:
       ```
       ⚠️  DRAFT DOCUMENTS DETECTED IN WORKSTREAM {ID} ⚠️

       The following draft documents exist and will be EXCLUDED from build:
       - docs/scrums/{ID}-{desc}/300-frontend-v1.1.0-draft.md
       - docs/scrums/{ID}-{desc}/325-backend-v1.0.0-draft.md

       Draft documents are not processed by build skills.
       To include them in builds, finalize with:
       /define --finalize @scrums/{ID}-{desc}/{document-name-draft.md}
       ```
   - Continue with build (excluding drafts)

2. **Find and Read Workstream Atomic Stories**
   - Use Glob to find workstream atomic stories: `docs/scrums/{ID}-*/200-atomic-stories-v*.md`
   - **EXCLUDE** files with `-draft` suffix
   - Read the latest production version
   - Parse all workstream stories
   - Extract all User Acceptance Criteria (UACs)
   - Categorize UACs by role tag:
     - **FE:** Frontend UACs
     - **BE:** Backend UACs
     - **DB:** Database UACs
     - **DevOps:** Infrastructure/deployment UACs
     - **CLI:** CLI-specific UACs (skip for build)

3. **Find and Read Workstream Progress**
   - Use Glob to find workstream progress: `docs/scrums/{ID}-*/progress/000-progress-v*.md`
   - **EXCLUDE** files with `-draft` suffix
   - Read matching version (same as atomic stories version)
   - Identify which workstream stories are:
     - ✅ Completed (skip)
     - 🚧 In Progress (show)
     - ⏳ Pending (show)
     - ⏸️ Blocked (warn user)
   - Extract pending UACs for each incomplete story
   - Calculate how many UACs remain by category

4. **Read Parent Documentation (for context)**
   - Read parent-mapped documents referenced by workstream
   - Check workstream README for parent mappings
   - Read `.ref.md` files to identify parent dependencies
   - Examples:
     - If workstream uses parent API contract, read parent API doc
     - If workstream uses parent DB schema, read parent DB doc
   - This provides context for workstream-specific implementation

5. **Check for Workstream-Specific Learnings** (Optional)
   - Check if `docs/scrums/{ID}-*/learnings/000-README.md` exists
   - If exists, scan for keywords related to pending workstream stories
   - Display relevant learnings:
     ```
     💡 Relevant Workstream Learnings Found:
     - WLEARN-{ID}-003: CLI rendering performance optimization
     - WLEARN-{ID}-007: Terminal color scheme compatibility

     These learnings may help avoid past mistakes during workstream implementation.
     ```
   - If no workstream learnings, check parent learnings for general guidance

6. **Analyze Workstream UAC Distribution**
   - Count total workstream UACs by type:
     - Total FE: UACs
     - Total BE: UACs
     - Total DB: UACs
     - Total DevOps: UACs
   - Count pending UACs by type (not yet ✅)
   - Determine which build commands are needed:
     - If pending FE: UACs exist → Need /build-fe
     - If pending BE: or DB: UACs exist → Need /build-be
     - If pending DevOps: UACs exist → Need /build-devops

### Phase 3: Detect Available Build Skills

1. **Check for Build Skills**
   - Look for skill files in `.claude/skills/` directory:
     - `build-fe/skill.md`
     - `build-be/skill.md`
     - `build-devops/skill.md`
   - For each found skill, note it as available
   - Track which skills are missing but needed

2. **Match Skills to Pending Workstream Work**
   - Cross-reference available skills with pending workstream UACs:
     - If FE: UACs pending AND build-fe available → Recommend
     - If BE:/DB: UACs pending AND build-be available → Recommend
     - If DevOps: UACs pending AND build-devops available → Recommend
   - If skills are missing but needed:
     - Inform user which skills are not yet implemented
     - Suggest manual implementation or wait for skill availability

### Phase 4: Present Options to User

1. **Build Execution Plan**
   - Display summary of pending workstream work:
     ```
     📊 Pending Workstream {ID} Implementation:
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     Workstream: {Name}
     Path: docs/scrums/{ID}-{description}/

     Pending Work:
     - FE: 8 UACs across 2 stories
     - BE: 5 UACs across 2 stories
     - DB: 2 UACs across 1 story
     - DevOps: 0 UACs (using parent infrastructure)

     Parent Dependencies:
     - API Contract: Using parent (../../350-api-contract-v1.1.0.md)
     - Database Schema: Using parent (../../375-database-schema-v1.0.0.md)
     ```

2. **Available Build Commands**
   - List available skills:
     ```
     ✅ Available Build Commands for Workstream:
     - /build-fe (Frontend Specialist - workstream-specific)
     - /build-be (Backend Specialist - workstream-specific)
     - /build-devops (Infrastructure Specialist - using parent config)
     ```

   - If any skills are missing:
     ```
     ⚠️ Unavailable Build Commands:
     - /build-fe (Planned for future version)
     ```

3. **Ask User What to Build**
   - Use AskUserQuestion tool to present options:
     - **Questions:**
       1. "Which build commands should be executed for workstream {ID}?"
          - Options: build-fe, build-be, build-devops, all available, cancel
          - Multi-select: true (allow multiple selections)
       2. "How should builds be executed?"
          - Options:
            - "In parallel (faster, all at once)" (Recommended)
            - "Sequentially (one at a time)"
          - Multi-select: false

   - If user selects "all available":
     - Execute all available build commands for workstream
   - If user selects specific commands:
     - Execute only those commands for workstream
   - If user cancels:
     - Exit without building

### Phase 5: Execute Build Commands with Workstream Context

1. **Prepare Workstream Context**
   - Create context package for build skills:
     - Workstream ID and description
     - Workstream atomic stories path
     - Workstream progress path
     - Parent-mapped document references
     - Output directory: Workstream-specific (e.g., `workstreams/{ID}-{desc}/`)

2. **Sequential Execution**
   - If user chose sequential:
     - Execute each selected build command one at a time
     - Pass workstream context to each build skill
     - Display progress after each completes
     - If one fails, ask user whether to continue or stop

3. **Parallel Execution** (Recommended)
   - If user chose parallel:
     - Use Task tool to launch multiple agents in parallel
     - Send single message with multiple Task tool calls:
       ```
       // Execute in parallel with workstream context
       Task(subagent_type: "general-purpose",
            prompt: "Execute /build-fe for workstream {ID} using docs/scrums/{ID}-{desc}/200-atomic-stories-v*.md")
       Task(subagent_type: "general-purpose",
            prompt: "Execute /build-be for workstream {ID} using docs/scrums/{ID}-{desc}/200-atomic-stories-v*.md")
       ```
     - Each agent executes its build skill with workstream context
     - Monitor all agents concurrently
     - Collect results from all agents when complete

4. **Monitor Execution**
   - Track progress of each build command for workstream:
     - Components/endpoints being generated
     - Workstream UACs being implemented
     - Tests being created
   - Display real-time status updates:
     ```
     🚧 Workstream {ID} Build Status:
     - /build-fe: Generating CLI components... (3/8 UACs)
     - /build-be: Creating CLI-specific services... (2/5 UACs)
     ```

### Phase 6: Aggregate Results

1. **Collect Build Outputs**
   - From each build command, gather:
     - Files created/modified in workstream directory
     - Workstream UACs implemented (checked off)
     - Tests generated for workstream
     - Any errors or warnings
     - Time taken

2. **Update Workstream Progress Tracking**
   - Run `/workstream-update-progress --workstream {ID}` to refresh workstream progress
   - This will:
     - Check off completed UACs in workstream atomic stories
     - Update workstream story completion percentages
     - Recalculate overall workstream progress
     - Update workstream change log

3. **Validate Results**
   - Check that generated workstream code compiles/runs:
     - Run `npm run build` or equivalent for workstream
     - Run `npm test` for workstream tests
     - Verify no compilation errors
   - If validation fails:
     - Display errors
     - Offer to fix or retry

### Phase 7: Generate Summary Report

1. **Collect Summary Data**
   - Total workstream UACs implemented
   - Story points delivered for workstream
   - Files created/modified in workstream
   - Tests generated for workstream
   - Build commands executed
   - Execution time
   - Any errors or warnings

2. **Display Comprehensive Summary**
   ```
   ✅ Workstream {ID} build completed successfully!

   📊 Workstream Build Summary:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Workstream ID:   {ID}
   Name:            {Workstream Name}
   Path:            docs/scrums/{ID}-{description}/

   🎯 Implementation Results:
   - FE: 8/8 UACs implemented (100%)
   - BE: 5/5 UACs implemented (100%)
   - DB: 2/2 UACs implemented (100%)
   - Total: 15 UACs completed

   📁 Files Generated:
   - Frontend: 12 files (8 components, 4 tests)
   - Backend: 8 files (5 services, 3 tests)
   - Database: 2 migration files
   - Total: 22 files created/modified

   ✅ Build Commands Executed:
   - /build-fe ✅ (completed in 45s)
   - /build-be ✅ (completed in 38s)

   📈 Workstream Progress:
   - Stories Completed: 2/5 (40%)
   - Overall Completion: 15/35 UACs (43%)
   - Story Points Delivered: 8 points

   🧪 Test Coverage:
   - Unit Tests: 7 tests created
   - Integration Tests: 0 tests created
   - E2E Tests: 0 tests created

   🎯 Next Steps:

   1. **Review Generated Code:**
      ls -la workstreams/{ID}-{description}/

   2. **Run Tests:**
      cd workstreams/{ID}-{description}/
      npm test

   3. **Update Workstream Progress:**
      /workstream-update-progress --workstream {ID}

   4. **Continue Development:**
      Review pending workstream stories and implement next features

   5. **Create Workstream PR (when ready):**
      /create-pr --workstream {ID}

   ✨ Workstream {ID} ({Name}) implementation completed! ✨
   ```

3. **Provide Workstream-Specific Recommendations**
   - Suggest next workstream stories to implement
   - Note any parent dependencies that need updating
   - Recommend testing strategies for workstream integration

## Input Format

**Command:**
```
/workstream-build --workstream {ID}
/workstream-build
```

**Examples:**
```
/workstream-build --workstream 001

/workstream-build --workstream 002

/workstream-build
(Auto-detects if only one workstream exists)
```

## Output Format

```
✅ Workstream 001 build completed successfully!

📊 Workstream Build Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Workstream ID:   001
Name:            CLI Dashboard
Path:            docs/scrums/001-cli-dashboard/

🎯 Implementation Results:
- FE: 8/8 UACs implemented (100%)
- BE: 5/5 UACs implemented (100%)
- DB: 0/0 UACs (using parent schema)
- Total: 13 UACs completed

📁 Files Generated:
- Frontend: 15 files (10 CLI components, 5 tests)
- Backend: 6 files (4 services, 2 tests)
- Total: 21 files created/modified

✅ Build Commands Executed:
- /build-fe ✅ (completed in 52s)
- /build-be ✅ (completed in 41s)

📈 Workstream Progress:
- Stories Completed: 2/4 (50%)
- Overall Completion: 13/25 UACs (52%)
- Story Points Delivered: 13 points

🧪 Test Coverage:
- Unit Tests: 7 tests created
- Integration Tests: 0 tests created
- E2E Tests: 0 tests created

🔗 Parent Dependencies:
- Using parent API contract (../../350-api-contract-v1.1.0.md)
- Using parent database schema (../../375-database-schema-v1.0.0.md)
- Using parent DevOps infrastructure (../../425-devops-v1.0.0.md)

🎯 Next Steps:

1. **Review Generated Code:**
   ls -la workstreams/001-cli-dashboard/

2. **Run Tests:**
   cd workstreams/001-cli-dashboard/
   npm test

3. **Update Workstream Progress:**
   /workstream-update-progress --workstream 001

4. **Continue Development:**
   Review pending workstream stories:
   - Story W001-003: Real-time metrics display (8 pts)
   - Story W001-004: Interactive drill-down (5 pts)

5. **Create Workstream PR (when ready):**
   /create-pr --workstream 001

✨ Workstream 001 (CLI Dashboard) implementation completed! ✨
```

## Important Notes

- **Workstream Isolation**: Each workstream has separate atomic stories and progress tracking
- **Parent Dependencies**: Workstreams can reference parent documentation for shared specs
- **Auto-Detection**: If only one workstream exists, `--workstream {ID}` flag is optional
- **Context Awareness**: Build skills receive workstream context (paths, parent mappings)
- **Independent Progress**: Workstream progress is tracked separately from parent project
- **Parallel Builds**: Can execute multiple build commands in parallel for faster completion
- **Draft Exclusion**: Draft documents in workstream are excluded from build process
- **Output Organization**: Generated code goes to workstream-specific directories
- **Test Generation**: Tests are workstream-specific and isolated
- **Integration Points**: Clear visibility into parent dependencies and integration points

## Error Handling

**No Workstream ID Specified (Multiple Workstreams Exist):**
- Display error: "Multiple workstreams found. Please specify which one to build."
- List available workstreams:
  ```
  Available workstreams:
  - 001-cli-dashboard
  - 002-mobile-app
  - 003-admin-portal
  ```
- Suggest: "/workstream-build --workstream {ID}"

**Workstream Not Found:**
- Display error: "Workstream not found: {ID}"
- List available workstreams
- Suggest: "/scrum-of-scrums {description}" to create new workstream

**No Workstreams Exist:**
- Display error: "No workstreams found in docs/scrums/"
- Suggest: "/scrum-of-scrums {description}" to create first workstream
- Or: "Use /build for parent project implementation"

**Workstream Atomic Stories Not Found:**
- Display error: "Workstream atomic stories not found: docs/scrums/{ID}-*/200-atomic-stories-v*.md"
- Suggest: "/define @scrums/{ID}-{desc}/200-atomic-stories-v1.0.0.md"

**Workstream Progress Not Found:**
- Create workstream progress file automatically
- Initialize with workstream stories
- Display note: "Created workstream progress: docs/scrums/{ID}-*/progress/000-progress-v1.0.0.md"

**No Pending UACs in Workstream:**
- Display message: "All workstream UACs are completed! 🎉"
- Show workstream completion summary
- Suggest: "/workstream-update-progress --workstream {ID}" to finalize progress

**Build Command Failed:**
- Display error from failed build command
- Show which UACs were completed before failure
- Offer to retry or skip failed command
- Continue with other build commands if user chooses

**Validation Failed:**
- Display compilation/test errors
- Offer to fix errors
- Suggest manual review and fixes
- Note: Workstream progress still updated for successful UACs

## Success Criteria

The `/workstream-build` command is successful when:
1. ✅ Workstream ID identified (auto-detected or from flag)
2. ✅ Workstream directory validated
3. ✅ Workstream atomic stories read successfully
4. ✅ Workstream progress read successfully
5. ✅ Parent-mapped documents identified and read
6. ✅ Pending workstream UACs analyzed by category
7. ✅ Available build skills detected
8. ✅ User prompted for build commands and execution mode
9. ✅ Build commands executed with workstream context
10. ✅ Workstream code generated in correct directories
11. ✅ Workstream tests created
12. ✅ Workstream progress updated automatically
13. ✅ User receives comprehensive summary with:
    - Workstream details
    - Implementation results
    - Files generated
    - Progress metrics
    - Parent dependencies
    - Next steps
14. ✅ Workstream is ready for testing and review

## Future Enhancements

### v1.1.0
- Workstream-aware code generation (respects parent patterns)
- Automatic integration testing with parent project
- Workstream merge preview (impact analysis)

### v1.2.0
- Multi-workstream builds (build multiple workstreams in parallel)
- Cross-workstream dependency detection
- Workstream conflict resolution

### v1.3.0
- Workstream-to-parent integration automation
- Automatic PR creation for workstream merges
- Workstream build pipelines (CI/CD)
