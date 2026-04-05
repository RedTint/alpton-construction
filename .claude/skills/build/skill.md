# Build Orchestrator Command

Intelligently orchestrate implementation based on atomic stories by detecting available build commands and executing them in parallel or sequentially based on user preference.

## Execution Steps

### Phase 1: Analyze Documentation

1. **Detect Draft Documents**
   - Use Glob to find all draft documents: `docs/**/*-draft.md`
   - If draft documents exist:
     - Display prominent warning:
       ```
       ⚠️  DRAFT DOCUMENTS DETECTED ⚠️

       The following draft documents exist and will be EXCLUDED from build:
       - docs/002-prd-v1.3.0-draft.md
       - docs/350-api-contract-v1.1.0-draft.md

       Draft documents are not processed by build skills.
       To include them in builds, finalize with:
       /define --finalize @{document-name-draft.md}
       ```
   - Continue with build (excluding drafts)

2. **Detect Epic Story Files** (primary source when available)
   - Glob `docs/epics/*/pending/*.md` — exclude `epic.md` and `bugs/`
   - Glob `docs/epics/*/in-progress/*.md` — already started stories
   - For each found story file, read YAML frontmatter: `story_id`, `epic_id`, `story_name`, `story_status`, `uac_by_type`
   - Build story map: `{ storyFilePath, storyId, epicId, pendingUacByType }`
   - If story files exist: use them as primary UAC source (prefer over atomic stories)
   - Calculate pending UAC counts by type across all pending/in-progress stories:
     - FE: sum of `uac_by_type.fe` where story has unchecked FE UACs
     - BE: sum of `uac_by_type.be` + `uac_by_type.db`
     - DevOps: sum of `uac_by_type.devops`

3. **Find and Read Atomic Stories** (fallback when no epic story files exist)
   - If epic story files were found in step 2: skip this step
   - Otherwise: Use Glob to find latest atomic stories: `docs/200-atomic-stories-v*.md`
   - **EXCLUDE** files with `-draft` suffix
   - Read the latest production version (without `-draft` suffix)
   - Parse all MVP stories (v1.0.0)
   - Extract all User Acceptance Criteria (UACs)
   - Categorize UACs by role tag:
     - **FE:** Frontend UACs
     - **BE:** Backend UACs
     - **DB:** Database UACs
     - **DevOps:** Infrastructure/deployment UACs
     - **CLI:** CLI-specific UACs (skip for build)

4. **Find and Read Progress Tracking**
   - Use Glob to find progress document: `docs/progress/000-progress-v*.md`
   - **EXCLUDE** files with `-draft` suffix
   - Read matching version (same as atomic stories version)
   - Identify which stories are:
     - ✅ Completed (skip)
     - 🚧 In Progress (show)
     - ⏳ Pending (show)
     - ⏸️ Blocked (warn user)
   - Extract pending UACs for each incomplete story
   - Calculate how many UACs remain by category

4. **Check for Relevant Learnings** (Optional but Recommended)
   - Check if `docs/learnings/000-README.md` exists
   - If exists, scan for keywords related to pending stories:
     - Search by domain (FE, BE, DevOps, DB)
     - Search by technologies mentioned in atomic stories
   - Display relevant learnings to inform implementation:
     ```
     💡 Relevant Learnings Found:
     - LEARN-042: Fixed WebSocket memory leak (Frontend)
     - LEARN-018: PostgreSQL composite index optimization (Backend)
     - LEARN-025: Docker networking configuration (DevOps)

     These learnings may help avoid past mistakes during implementation.
     ```
   - If no learnings found or no README exists, skip this step silently

6. **Pre-build Validation + Dependency Graph**
   - Run: `node .ai-dev/ai-dev-scripts/validate-stories.js --docs-path=./docs --output=table`
   - If errors found: display and warn but do not abort
   - Run: `node .ai-dev/ai-dev-scripts/dependency-graph.js --docs-path=./docs --output=json`
   - Parse JSON result:
     - `buildOrder`: topological sort — shows which stories to build first
     - `parallelizable`: stories with all dependencies in `done/` — can be built in parallel
     - `cycles`: circular dependencies (display warning if any)
   - Display:
     ```
     📋 Dependency Analysis:
     - Stories: {N} total, {M} parallelizable
     - Cycles: {0 or list}
     - Suggested build order: {first 5}
     ```
   - Use this order when presenting story options to user

7. **Analyze UAC Distribution**
   - Count total UACs by type:
     - Total FE: UACs
     - Total BE: UACs
     - Total DB: UACs
     - Total DevOps: UACs
   - Count pending UACs by type (not yet ✅)
   - Determine which build commands are needed:
     - If pending FE: UACs exist → Need /build-fe
     - If pending BE: or DB: UACs exist → Need /build-be
     - If pending DevOps: UACs exist → Need /build-devops

### Phase 2: Detect Available Build Skills

1. **Check for Build Skills**
   - Look for skill files in `.claude/skills/` directory:
     - `build-fe/skill.md`
     - `build-be/skill.md`
     - `build-devops/skill.md`
   - For each found skill, note it as available
   - Track which skills are missing but needed

2. **Match Skills to Pending Work**
   - Cross-reference available skills with pending UACs:
     - If FE: UACs pending AND build-fe available → Recommend
     - If BE:/DB: UACs pending AND build-be available → Recommend
     - If DevOps: UACs pending AND build-devops available → Recommend
   - If skills are missing but needed:
     - Inform user which skills are not yet implemented
     - Note that these are planned for v1.1.0
     - Suggest manual implementation or wait for skill availability

### Phase 3: Present Options to User

1. **Build Execution Plan**
   - Display summary of pending work:
     ```
     📊 Pending Implementation:
     - FE: 15 UACs across 3 stories
     - BE: 12 UACs across 3 stories
     - DB: 5 UACs across 2 stories
     - DevOps: 8 UACs across 2 stories
     ```

2. **Available Build Commands**
   - List available skills:
     ```
     ✅ Available Build Commands:
     - /build-fe (Frontend Specialist)
     - /build-be (Backend Specialist + Database)
     - /build-devops (Infrastructure Specialist)
     ```

   - If any skills are missing:
     ```
     ⚠️ Unavailable Build Commands:
     - /build-fe (Planned for v1.1.0)
     - /build-be (Planned for v1.1.0)
     ```

3. **Ask User What to Build**
   - Use AskUserQuestion tool to present options:
     - **Questions:**
       1. "Which build commands should be executed?"
          - Options: build-fe, build-be, build-devops, all available, cancel
          - Multi-select: true (allow multiple selections)
       2. "How should builds be executed?"
          - Options:
            - "In parallel (faster, all at once)" (Recommended)
            - "Sequentially (one at a time)"
          - Multi-select: false

   - If user selects "all available":
     - Execute all available build commands
   - If user selects specific commands:
     - Execute only those commands
   - If user cancels:
     - Exit without building

### Phase 4: Execute Build Commands

1. **Sequential Execution**
   - If user chose sequential:
     - Execute each selected build command one at a time, passing `--story-file {path}` if epic story files were detected
     - Display progress after each completes
     - If one fails, ask user whether to continue or stop

2. **Parallel Execution** (Recommended)
   - If user chose parallel:
     - Use Task tool to launch multiple agents in parallel
     - If epic story files were detected in Phase 1 step 2, group stories by UAC type and pass `--story-file`:
       ```
       // Execute in parallel, passing story file paths from docs/epics/
       Task(subagent_type: "general-purpose", prompt: "Execute /build-fe skill --story-file {feStoryFilePath}")
       Task(subagent_type: "general-purpose", prompt: "Execute /build-be skill --story-file {beStoryFilePath}")
       Task(subagent_type: "general-purpose", prompt: "Execute /build-devops skill --story-file {devopsStoryFilePath}")
       ```
     - If multiple pending stories exist for a domain, launch one agent per story with its `--story-file`
     - If no epic story files: execute without `--story-file` (fallback to atomic stories mode)
     - Each agent executes its build skill independently
     - Monitor all agents concurrently
     - Collect results from all agents when complete

3. **Monitor Execution**
   - Track progress of each build command:
     - Components/endpoints being generated
     - UACs being implemented
     - Tests being created
   - Display real-time status updates:
     ```
     🚧 Build Status:
     - /build-fe: Generating components... (5/15 UACs)
     - /build-be: Creating API endpoints... (3/12 UACs)
     - /build-devops: Provisioning infrastructure... (2/8 UACs)
     ```

### Phase 5: Aggregate Results

1. **Collect Build Outputs**
   - From each build command, gather:
     - Files created/modified
     - UACs implemented (checked off)
     - Tests generated
     - Any errors or warnings
     - Time taken

2. **Update Progress Tracking**
   - Run `/update-progress` command to refresh progress document
   - This will:
     - Check off completed UACs in atomic stories
     - Update story completion percentages
     - Recalculate overall progress
     - Update change log

3. **Validate Results**
   - Check that generated code compiles/runs:
     - Frontend: Run linting, type checking
     - Backend: Verify server starts, no syntax errors
     - DevOps: Validate IaC syntax, pipeline configs
   - Note any validation failures for user to fix

### Phase 6: Generate Unified Report

1. **Summarize All Builds**
   - Display consolidated report:
     ```
     ✅ Build completed successfully!

     📊 Implementation Summary:
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

     Frontend (/build-fe):
     - 15 UACs implemented ✅
     - 8 components generated
     - 5 pages created
     - API client updated
     - 15 component tests generated
     - Time: 2m 30s

     Backend (/build-be):
     - 17 UACs implemented (12 BE + 5 DB) ✅
     - 6 API endpoints created
     - Database schema migrated
     - 12 business logic functions
     - 17 API tests generated
     - Time: 3m 15s

     DevOps (/build-devops):
     - 8 UACs implemented ✅
     - Terraform IaC generated
     - GitHub Actions workflow created
     - Deployment scripts added
     - Monitoring configured
     - Time: 2m 45s

     📈 Overall Progress:
     - Previous: 40% complete
     - Current: 85% complete
     - Change: +45% ⬆️

     🎯 Next Steps:
     1. Review generated code for quality
     2. Run tests: npm test / pytest
     3. Manual adjustments if needed
     4. Commit changes to git
     5. Deploy to staging environment
     ```

2. **Highlight Issues**
   - If any builds failed:
     ```
     ⚠️ Build Warnings/Errors:
     - /build-fe: 2 components need manual review (complex state logic)
     - /build-be: Database migration needs manual verification
     ```

3. **Provide Next Actions**
   - Suggest immediate next steps:
     - Run tests
     - Review generated code
     - Fix any compilation errors
     - Commit to version control
     - Create pull request
   - Recommend follow-up commands:
     - `/update-progress` (already done)
     - `/review` (review generated code quality)
     - `/create-adr` (document implementation decisions)

## Input Format

**Command:**
```
/build
```

No arguments required - automatically analyzes atomic stories and progress.

**Optional Arguments (Future):**
```
/build --fe-only                    # Execute only frontend build
/build --be-only                    # Execute only backend build
/build --devops-only                # Execute only DevOps build
/build --parallel                   # Force parallel execution
/build --sequential                 # Force sequential execution
/build --story 003                  # Build specific story only
/build --dry-run                    # Show plan without executing
```

## Output Format

```
✅ Build orchestration complete!

📊 Analyzed Documentation:
- Atomic Stories: docs/200-atomic-stories-v1.0.0.md (5 stories)
- Progress: docs/progress/000-progress-v1.0.0.md (60% complete)

📋 Pending Work Detected:
- FE: 15 UACs across 3 stories
- BE: 12 UACs across 3 stories
- DB: 5 UACs across 2 stories
- DevOps: 8 UACs across 2 stories

✅ Available Build Commands:
- /build-fe ✅
- /build-be ✅
- /build-devops ✅

🚀 Execution Mode: Parallel (3 agents running concurrently)

⏱️ Total Time: 3m 45s

📈 Results:
- Total UACs implemented: 40
- Files created: 45
- Tests generated: 32
- Progress: 60% → 85% (+25%)

✨ All builds completed successfully! ✨

🎯 Next Steps:
1. Run: npm test (or pytest)
2. Review generated code in: src/
3. Fix any linting errors
4. Commit changes: git add . && git commit -m "feat: implement stories 001-003"
5. Push and create PR
```

## Parallel Execution Implementation

**Key Requirement:** When executing multiple builds in parallel, send **a single message** with **multiple Task tool calls**:

```typescript
// Correct: Single message, multiple tool calls
await sendMessage([
  Task({ subagent_type: "general-purpose", prompt: "Execute /build-fe for pending FE UACs" }),
  Task({ subagent_type: "general-purpose", prompt: "Execute /build-be for pending BE/DB UACs" }),
  Task({ subagent_type: "general-purpose", prompt: "Execute /build-devops for pending DevOps UACs" })
])

// Incorrect: Multiple sequential messages
await sendMessage(Task({ ... }))  // Don't do this
await sendMessage(Task({ ... }))  // Don't do this
await sendMessage(Task({ ... }))  // Don't do this
```

## UAC Type Detection Logic

```typescript
function analyzeUACs(atomicStories: Document): UACAnalysis {
  const stories = parseStories(atomicStories)
  const analysis = {
    fe: { total: 0, pending: 0, stories: [] },
    be: { total: 0, pending: 0, stories: [] },
    db: { total: 0, pending: 0, stories: [] },
    devops: { total: 0, pending: 0, stories: [] }
  }

  for (const story of stories) {
    for (const uac of story.uacs) {
      if (uac.startsWith('FE:')) {
        analysis.fe.total++
        if (uac.status !== '✅') {
          analysis.fe.pending++
          analysis.fe.stories.push(story.id)
        }
      }
      // Similar for BE:, DB:, DevOps:
    }
  }

  return analysis
}
```

## Skill Availability Detection

```typescript
function detectAvailableSkills(): AvailableSkills {
  const skills = {
    buildFe: false,
    buildBe: false,
    buildDevops: false
  }

  // Check if skill files exist
  skills.buildFe = fileExists('.claude/skills/build-fe/skill.md')
  skills.buildBe = fileExists('.claude/skills/build-be/skill.md')
  skills.buildDevops = fileExists('.claude/skills/build-devops/skill.md')

  return skills
}
```

## Progress Update Integration

After all builds complete, automatically run `/update-progress`:

```typescript
async function finalizeBuilds(buildResults: BuildResult[]) {
  // 1. Collect all results
  const summary = aggregateResults(buildResults)

  // 2. Update progress tracking
  await executeCommand('/update-progress')

  // 3. Generate unified report
  displayReport(summary)
}
```

## Error Handling

**Build Command Not Found:**
- Display: "Build skill not found: /build-fe"
- Suggest: "This skill is planned for v1.1.0"
- Option: "Would you like to implement manually or wait?"

**Build Command Fails:**
- Display error from failed build
- Show which UACs were completed before failure
- Offer options:
  - Continue with other builds
  - Fix and retry this build
  - Cancel all remaining builds

**No Pending Work:**
- Display: "All UACs already implemented! 🎉"
- Show: Current completion percentage
- Suggest: "Run /update-progress to verify"

**Parallel Execution Error:**
- If one agent fails in parallel execution:
  - Continue running other agents
  - Report failure at the end
  - Provide option to retry failed builds

## Important Notes

- **Automatic Detection:** No manual specification of what to build - reads from atomic stories
- **Progress Aware:** Only builds pending UACs, skips completed ones
- **Parallel by Default:** Recommends parallel execution for speed
- **Unified Reporting:** Aggregates results from all builds into single report
- **Self-Updating:** Automatically updates progress tracking after builds
- **Graceful Degradation:** Works even if some build skills are unavailable
- **Future-Proof:** Designed to work with specialist subagents (v1.3.0)

## Success Criteria

The `/build` command is successful when:
1. ✅ Correctly identifies all pending UACs by type
2. ✅ Detects available build skills accurately
3. ✅ Executes selected builds (parallel or sequential)
4. ✅ Aggregates results from all builds
5. ✅ Updates progress tracking automatically
6. ✅ Provides clear, actionable unified report
7. ✅ Handles errors gracefully

## Future Enhancements

### v1.1.0
- Integration with actual /build-fe, /build-be, /build-devops skills
- Real-time progress streaming during parallel builds
- Automatic conflict resolution between parallel builds
- Build result caching for faster iterations

### v1.2.0
- ~~Dependency analysis~~ ✅ Implemented via `dependency-graph.js` (Phase 1 step 5)
- Incremental builds (only build changed UACs)
- Build profiles (quick build vs full build)
- CI/CD integration for automated builds

### v1.3.0
- Specialist subagent coordination
- Multi-project builds
- Build scheduling and queuing
- Advanced optimization and resource management
