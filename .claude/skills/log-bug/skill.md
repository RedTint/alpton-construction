# Log Bug Command

Log bugs with comprehensive Root Cause Analysis (RCA) into dedicated bug files and update progress tracking with abstracts for visibility.

## Execution Steps

### Phase 1: Parse Bug Description

1. **Extract Bug Information**
   - Parse the command arguments to get bug description
   - Bug description should include:
     - Brief summary of the issue (1 sentence)
     - Where the bug occurs (feature/component/file)
     - Expected vs actual behavior
     - Steps to reproduce (if provided)
   - Examples:
     - "Frontend navbar doesn't collapse on mobile - buttons overlap on screens < 768px"
     - "API returns 500 error when creating user with empty email field"
     - "/build command fails when no atomic stories exist - should show helpful error"

2. **Categorize Bug Type**
   - Determine bug category based on description:
     - **Frontend (FE):** UI issues, component bugs, styling problems
     - **Backend (BE):** API errors, business logic bugs, service failures
     - **Database (DB):** Schema issues, migration problems, query errors
     - **DevOps:** Build failures, deployment issues, CI/CD problems
     - **Documentation:** Incorrect or outdated docs, missing information
     - **Testing:** Test failures, missing test coverage
   - Use keyword matching:
     - UI/component/styling → Frontend
     - API/endpoint/service → Backend
     - Database/schema/migration → Database
     - Build/deploy/CI → DevOps
   - If unclear, default to "General" category

3. **Determine Severity**
   - Analyze bug impact to assign severity:
     - **Critical (P0):** System down, data loss, security vulnerability
     - **High (P1):** Major feature broken, affects most users
     - **Medium (P2):** Feature partially broken, workaround exists
     - **Low (P3):** Minor issue, cosmetic, affects few users
   - Use heuristics:
     - Keywords like "crash", "data loss", "security" → Critical
     - Keywords like "broken", "fails", "error" → High
     - Keywords like "doesn't work well", "sometimes" → Medium
     - Keywords like "cosmetic", "typo", "spacing" → Low
   - Default to Medium if unclear

### Phase 2: Assign Global Bug Number and Generate Filename

1. **Assign Bug Number**
   - Use Glob to find all bug files across `docs/epics/*/bugs/`
   - Count existing bug documents matching `*-bug-*` patterns
   - Assign next sequential number with zero-padded 3 digits (global, cross-epic)
   - Examples: 001, 002, 003, ..., 999
   - Store as `bug_number` (e.g., "042")

2. **Generate Bug Filename**
   - Extract short description slug from bug summary:
     - Take first 40 characters
     - Convert to lowercase
     - Replace spaces with hyphens
     - Remove special characters
     - Example: "API returns 500 error" → "api-returns-500-error"
   - Filename format: `{epicId}-bug-{bug_number}-{short-desc}.md`
   - Full example: `007-bug-042-api-returns-500-error.md`
   - Store as `bug_filename`

### Phase 2b: Link Bug to Epic & Story

1. **Check for Epic Structure**
   - Use Glob to find `docs/epics/*/epic.md`
   - If no epics exist:
     ```
     ❌ Error: No epics found in docs/epics/.
     All bugs must be linked to an epic.
     Run /new-feature or /sync-board first to create epics.
     ```
   - Abort and exit

2. **Display Epic List and Ask User**
   - Read YAML frontmatter of each `epic.md` to extract `epic_id` and `epic_name`
   - Display list:
     ```
     🐛 Which epic does this bug affect?
     [001] MVP Features
     [002] Code Generation Toolkit
     ...
     [007] Sync-Board & Project Management System
     ```
   - Use AskUserQuestion: "Which epic does this bug belong to? Enter the epic ID."
   - Store as `selectedEpicId` and `selectedEpicDir`

3. **Ask Which Story Is Affected**
   - Glob story files across all status subdirs: `docs/epics/{selectedEpicDir}/**/*.md` (exclude `epic.md` and `bugs/`)
   - Display story list (ID + name from frontmatter `story_name`)
   - Use AskUserQuestion: "Which story does this bug affect? Enter the story ID or 'none' if not story-specific."
   - Store as `affectedStoryId` and `affectedStoryFile` (full path); if 'none', set to null

4. **Ensure Epic `bugs/` Directory Exists**
   ```bash
   mkdir -p docs/epics/{selectedEpicDir}/bugs
   ```

### Phase 3: Perform Root Cause Analysis (RCA)

1. **Gather Context for RCA**
   - Read relevant documentation to understand system:
     - Latest atomic stories: `docs/200-atomic-stories-v*.md`
     - Latest frontend docs: `docs/300-frontend-v*.md` (if FE bug)
     - Latest backend docs: `docs/325-backend-v*.md` (if BE bug)
     - Latest database schema: `docs/375-database-schema-v*.md` (if DB bug)
     - Latest API contract: `docs/350-api-contract-v*.md` (if API bug)
     - Latest DevOps docs: `docs/425-devops-v*.md` (if DevOps bug)
   - Use Grep to search for related code/components mentioned in bug
   - Use Read to examine specific files mentioned in bug report

2. **Analyze Expected vs Current Behavior**
   - **Expected Behavior:**
     - What SHOULD happen based on requirements?
     - What does the documentation say?
     - What is the user's reasonable expectation?
   - **Current Behavior:**
     - What ACTUALLY happens when bug occurs?
     - What error messages appear?
     - What is the observable failure mode?
   - Document the gap between expected and current

3. **Identify Root Cause**
   - Analyze WHY the bug exists:
     - Is it a logic error in code?
     - Is it a missing validation?
     - Is it an incorrect assumption?
     - Is it a race condition?
     - Is it a configuration issue?
     - Is it a dependency version issue?
   - Use "5 Whys" technique to dig deeper:
     - Why does this happen? → Because X
     - Why does X happen? → Because Y
     - Why does Y happen? → Because Z
     - Continue until root cause found
   - Examples:
     - "API returns 500" → Why? "No validation on empty email" → Why? "Validation logic missing" → Root Cause: "Email validation not implemented in user creation endpoint"

4. **Create Data Flow Diagram (DFD) or Schema Analysis**
   - **For Backend/API bugs:**
     - Create simple DFD showing request → service → database flow
     - Identify where in the flow the bug occurs
     - Example:
       ```
       User Request → API Controller → Validation Layer (BUG HERE: missing email validation) → Service → Database
       ```

   - **For Frontend bugs:**
     - Create component hierarchy showing state flow
     - Identify where rendering/state breaks
     - Example:
       ```
       App → Navbar Component (BUG HERE: missing media query) → Mobile View
       ```

   - **For Database bugs:**
     - Show relevant schema relationships
     - Identify constraint violations or missing indexes
     - Example:
       ```
       users table (id, name, email)
       BUG: email column allows NULL but application expects NOT NULL
       ```

   - **For DevOps bugs:**
     - Show pipeline stages or infrastructure diagram
     - Identify where build/deployment fails
     - Example:
       ```
       Build → Test → Deploy (BUG HERE: missing environment variable in production)
       ```

5. **Identify Affected Components**
   - List all files, functions, or modules affected by this bug
   - For each component:
     - File path (e.g., `src/api/users/createUser.ts`)
     - Function/class name (e.g., `createUser()`)
     - Line numbers if known
   - This helps with later bug fixing

6. **Assess Impact**
   - **User Impact:**
     - How many users affected?
     - What can users not do?
     - Is there a workaround?
   - **System Impact:**
     - Does this affect other features?
     - Does this cause cascading failures?
     - Does this affect data integrity?
   - **Business Impact:**
     - Does this block revenue?
     - Does this affect SLA compliance?
     - Does this damage reputation?

### Phase 4: Create Bug Document with RCA

1. **Generate Comprehensive Bug Document**
   - Create structured bug document with all RCA sections:
     ```markdown
     # Bug #{bug_number}: {Brief Summary}

     **Bug ID:** BUG-{bug_number}
     **Reported:** {YYYY-MM-DD HH:mm}
     **Severity:** {Critical/High/Medium/Low} (P{0-3})
     **Category:** {Frontend/Backend/Database/DevOps/Documentation/Testing}
     **Status:** ⏳ Pending

     ---

     ## Expected Behavior

     {What SHOULD happen according to requirements/specifications}

     **Reference:**
     - [Related Story](../200-atomic-stories-v{version}.md#story-{number})
     - [API Contract](../350-api-contract-v{version}.md) (if applicable)
     - [Design System](../125-design-system-v{version}.md) (if applicable)

     ---

     ## Current Behavior

     {What ACTUALLY happens - the observable bug}

     **Error Messages:**
     ```
     {Any error messages, stack traces, or console output}
     ```

     **Steps to Reproduce:**
     1. {Step 1}
     2. {Step 2}
     3. {Step 3}
     4. Observe: {What happens}

     ---

     ## Root Cause Analysis

     ### Immediate Cause
     {What directly causes the bug?}

     ### Underlying Cause
     {Why does the immediate cause exist?}

     ### Root Cause
     {The fundamental issue that needs to be fixed}

     **5 Whys Analysis:**
     1. Why does {symptom} happen? → {reason 1}
     2. Why does {reason 1} happen? → {reason 2}
     3. Why does {reason 2} happen? → {reason 3}
     4. Why does {reason 3} happen? → {reason 4}
     5. Root Cause: {fundamental issue}

     ---

     ## Data Flow / System Analysis

     {For Backend/API: Data Flow Diagram}
     {For Frontend: Component Hierarchy}
     {For Database: Schema Relationships}
     {For DevOps: Pipeline/Infrastructure Diagram}

     **Example:**
     ```
     {ASCII diagram or structured text showing flow}
     ```

     **Bug Location in Flow:**
     {Where in the diagram does the bug occur?}

     ---

     ## Affected Components

     **Files:**
     - `{file_path_1}` - {description of what's wrong}
     - `{file_path_2}` - {description of what's wrong}

     **Functions/Methods:**
     - `{function_name}()` in `{file}` at line {number}
     - `{function_name}()` in `{file}` at line {number}

     **Database Objects:**
     - Table: `{table_name}` - {issue description}
     - Index: `{index_name}` - {issue description}

     **Infrastructure:**
     - {Service/pipeline/config file} - {issue description}

     ---

     ## Impact Assessment

     ### User Impact
     - **Affected Users:** {percentage or number}
     - **Functionality Lost:** {what users cannot do}
     - **Workaround Available:** {Yes/No - describe if yes}

     ### System Impact
     - **Cascading Effects:** {does this break other features?}
     - **Data Integrity:** {is data at risk?}
     - **Performance Impact:** {does this slow down system?}

     ### Business Impact
     - **Revenue Impact:** {does this block sales/subscriptions?}
     - **SLA Compliance:** {does this violate service level agreements?}
     - **Reputation Risk:** {high/medium/low}

     ---

     ## Related Issues

     **Similar Bugs:**
     - [BUG-{number}](../{filename}.md) - {brief description}

     **Related Stories:**
     - [Story {number}](../200-atomic-stories-v{version}.md#story-{number}) - {story title}

     **Related ADRs:**
     - [ADR: {title}](../adr/{date}-{title}.md)

     ---

     ## Resolution Notes

     _This section will be filled when bug is fixed_

     **Fixed By:** {Developer name}
     **Fixed Date:** {YYYY-MM-DD}
     **Fix Method:** {Brief description of how it was fixed}
     **PR Link:** {GitHub PR URL}
     **Verification:** {How was fix verified?}

     ---

     **Keywords:** {comma-separated keywords for search}
     **Created:** {YYYY-MM-DD HH:mm} via `/log-bug`
     ```

2. **Fill in RCA Content**
   - Use findings from Phase 3 to populate all sections
   - Be specific and detailed - this will be used to fix the bug
   - Include code snippets where relevant
   - Add ASCII diagrams for DFD/schema if helpful
   - Extract 5-10 keywords for searchability

3. **Write Bug File**
   - Path: `docs/epics/{selectedEpicDir}/bugs/{bug_filename}`
   - Prepend full YAML frontmatter before the markdown body:
     ```yaml
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
     ```
   - Use Write tool to create this file
   - Store full path as `epicBugFilePath`
   - Verify file created successfully

### Phase 4b: Update Affected Story File

If an affected story was selected in Phase 2b:

1. **Read current story file frontmatter**
   - Read `{affectedStoryFile}` with gray-matter (or plain read)
   - Extract existing `related_bugs` list (default to `[]` if field absent)

2. **Add bug reference to story frontmatter**
   - Append `"{epicId}-bug-{bug_number}"` to the `related_bugs` array
   - Update `updated_at` to now
   - Use Edit tool to update the YAML frontmatter block only (preserve markdown body exactly)
   - Format:
     ```yaml
     related_bugs:
       - "{epicId}-bug-{bug_number}"
     ```

3. **Display confirmation**
   ```
   ✅ Story {affectedStoryId} updated — related_bugs: ["{epicId}-bug-{bug_number}"]
   ```

### Phase 4c: Refresh Epic Stats

If an epic was selected in Phase 2b:

1. **Run aggregation script**
   ```bash
   node .ai-dev/ai-dev-scripts/aggregate-epics.js --update --docs-path=./docs --epic={selectedEpicId}
   ```
   - The script scans `bugs/` as a status dir (alongside `pending/`, `done/`, etc.) and increments `bugs_open` in `epic.md`
   - If script exits non-zero, display a warning but don't abort

2. **Display confirmation**
   ```
   ✅ Epic {selectedEpicId} stats refreshed — bugs_open incremented
   ```

### Phase 5: Update Progress Tracking

1. **Find Latest Progress Document**
   - Use Glob to find latest progress doc: `docs/progress/000-progress-v*.md`
   - Parse version numbers to identify highest version
   - Read the current progress tracking document

2. **Locate or Create Bugs Section**
   - Search for "## Known Bugs" or "## Bug Tracking" section
   - If section doesn't exist, create it:
     ```markdown
     ## Known Bugs

     Track all reported bugs across the project. Full RCA details are in individual bug files.

     ### Bug Statistics
     - **Total Bugs:** {count}
     - **Critical (P0):** {count}
     - **High (P1):** {count}
     - **Medium (P2):** {count}
     - **Low (P3):** {count}
     - **Resolved:** {count}
     - **Pending:** {count}

     ### Bug List

     _{Bugs listed below with abstracts and links to full RCA documents}_
     ```

3. **Add Bug Abstract to Progress**
   - Create concise bug entry WITHOUT solution details:
     ```markdown
     #### BUG-{number}: {Brief Summary}

     **Severity:** {P0/P1/P2/P3} ({Critical/High/Medium/Low})
     **Category:** {FE/BE/DB/DevOps/Documentation/Testing}
     **Status:** ⏳ Pending
     **Reported:** {YYYY-MM-DD}
     **File:** [docs/epics/{epicDir}/bugs/{bug_filename}](../../epics/{epicDir}/bugs/{bug_filename})

     **Abstract:**
     {1-2 sentence description of the bug WITHOUT revealing the solution}

     **Impact:**
     - Affects: {brief user impact}
     - Workaround: {Yes/No}

     **Next Steps:**
     - Use `/fix-bug BUG-{number}` to analyze and fix this bug
     ```

   - Key: Abstract should describe PROBLEM only, not solution
   - This keeps progress doc lightweight

4. **Update Bug Statistics**
   - Recalculate all bug counts:
     - Total bugs
     - Bugs by severity (P0, P1, P2, P3)
     - Bugs by status (Pending, In Progress, Resolved)
     - Bugs by category (FE, BE, DB, DevOps, etc.)
   - Update statistics section with new counts

5. **Update Progress Document**
   - Use Edit tool to update progress document
   - Insert bug abstract in appropriate section
   - Update statistics
   - Add "Last Updated" timestamp

### Phase 6: Update Cross-Epic Bugs Index

1. **Check if Bugs Index Exists**
   - Check if `docs/epics/bugs-index.md` exists
   - If not, create new index with structure

2. **Create Index Structure** (if new)
   ```markdown
   # Bug Tracking Index

   Cross-epic index of all bugs. Each bug lives as a file under
   `docs/epics/{epic}/bugs/` with full YAML frontmatter and RCA.

   **Total Bugs:** {count}
   **Last Updated:** {YYYY-MM-DD}

   ---

   ## Bug Index (By Severity)

   ### Critical (P0) - {count} bugs

   | Bug ID | Summary | Epic | Status |
   |--------|---------|------|--------|
   | [BUG-{N}](epics/{epicDir}/bugs/{filename}) | {summary} | {epicName} | ⏳ Open |

   ### High (P1) - {count} bugs
   _(same table format)_

   ### Medium (P2) - {count} bugs
   _(same table format)_

   ### Low (P3) - {count} bugs
   _(same table format)_

   ---

   ## Statistics

   **By Status:** Open: {count} | Resolved: {count}
   **By Severity:** P0: {n} | P1: {n} | P2: {n} | P3: {n}
   **By Epic:** {epic_name}: {count} bugs, ...

   ---

   **Generated:** {YYYY-MM-DD} via `/log-bug`
   ```

3. **Add New Bug to Index**
   - Read current content if index exists
   - Insert new bug row in the appropriate severity table
   - Update statistics counts
   - Use Edit tool if updating; Write tool if creating

4. **Write or Update Index**
   - Maintain consistent table formatting
   - Keep rows sorted by bug number (newest last)

### Phase 7: Validate Bug Creation

1. **Verify All Files Created**
   - ✅ Bug document exists: `docs/epics/{epicDir}/bugs/{bug_filename}`
   - ✅ Bug index exists: `docs/epics/bugs-index.md`
   - ✅ Progress document updated
   - Use Read to verify file contents

2. **Validate Bug Document Structure**
   - Check all required sections present:
     - ✅ Bug ID and metadata
     - ✅ Expected Behavior
     - ✅ Current Behavior
     - ✅ Root Cause Analysis
     - ✅ Data Flow / System Analysis
     - ✅ Affected Components
     - ✅ Impact Assessment
     - ✅ Related Issues
   - Verify RCA is comprehensive

3. **Validate Progress Update**
   - Check bug abstract is in progress doc
   - Verify statistics are updated
   - Confirm no solution details leaked into progress doc

4. **Generate Validation Report**
   - List all validations performed
   - Note any warnings or missing information
   - Confirm bug is ready for fixing

### Phase 8: Generate Summary Report

1. **Collect Bug Details**
   - Bug number (BUG-XXX)
   - Category and severity
   - Filename and location
   - Impact summary
   - Statistics

2. **Display Comprehensive Summary**
   ```
   🐛 Bug logged successfully with Root Cause Analysis!

   📋 Bug Details:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Bug ID:       BUG-{number}
   Summary:      {Brief description}
   Severity:     {Critical/High/Medium/Low} (P{0-3})
   Category:     {FE/BE/DB/DevOps/etc.}
   Status:       ⏳ Pending

   📍 Documentation:
   - Bug RCA:        docs/epics/{epicDir}/bugs/{bug_filename}
   - Epic:           docs/epics/{epicDir}/epic.md (bugs_open updated)
   - Bug Index:      docs/epics/bugs-index.md
   - Progress:       docs/progress/000-progress-v{version}.md

   📊 Root Cause Analysis:
   - Expected Behavior: {1 sentence}
   - Current Behavior:  {1 sentence}
   - Root Cause:        {1 sentence}
   - Impact:            {brief summary}

   📈 Bug Statistics:
   - Total Bugs:     {total}
   - Critical (P0):  {p0_count}
   - High (P1):      {p1_count}
   - Medium (P2):    {p2_count}
   - Low (P3):       {p3_count}
   - Pending:        {pending_count}
   - Resolved:       {resolved_count}

   🎯 Next Steps:
   1. Full RCA documented in docs/epics/{epicDir}/bugs/{bug_filename}
   2. Progress tracking updated with bug abstract
   3. Bug indexed in docs/epics/bugs-index.md
   4. Ready for fixing - use: /fix-bug BUG-{number}

   {If Critical P0:}
   ⚠️  CRITICAL BUG - Immediate attention required!

   {If High P1:}
   ⚡ HIGH PRIORITY - Recommend fixing in next sprint

   ✨ BUG-{number} is now tracked with full RCA! ✨
   ```

3. **Provide Actionable Recommendations**
   - If bug is Critical (P0):
     - Suggest immediate attention
     - Recommend creating hotfix branch
     - Warn about potential user impact
   - If bug is High (P1):
     - Suggest including in next sprint
     - Note root cause is documented
   - If bug is Medium/Low:
     - Note it's tracked for future resolution
     - Suggest batching with similar bugs

### Phase 9: Optional Git Commit

1. **Check if Git Commit Needed**
   - Use AskUserQuestion to confirm:
     - "Would you like to commit this bug log to git?"
     - Options: "Yes - commit now", "No - I'll commit manually later"

2. **Create Git Commit** (if user confirms)
   - Stage modified files:
     - Epic bug file (`docs/epics/{epicDir}/bugs/{bug_filename}`)
     - Cross-epic index (`docs/epics/bugs-index.md`)
     - Affected story file (if updated with `related_bugs`)
     - Progress document
   - Create descriptive commit message:
     ```
     docs: log BUG-{number} - {brief summary}

     - Category: {category}
     - Severity: P{severity} ({Critical/High/Medium/Low})
     - Created bug RCA in docs/epics/{epicDir}/bugs/
     - Updated cross-epic bugs index (bugs-index.md)
     - Updated epic {epicId} stats (bugs_open incremented)
     - Updated progress tracking v{version}

     Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
     ```
   - Execute git commit using Bash tool
   - Confirm commit success

3. **Handle Git Errors**
   - If commit fails:
     - Display error message
     - Suggest manual commit
     - Provide exact commit message to use
   - If no git repo:
     - Skip commit step
     - Note that files were updated successfully

## Input Format

**Command:**
```
/log-bug {bug-description}
```

**Detailed Format:**
```
/log-bug {brief-summary}
Expected: {expected-behavior}
Actual: {actual-behavior}
Steps: {steps-to-reproduce}
```

**Examples:**
```
/log-bug Frontend navbar doesn't collapse on mobile - buttons overlap on screens < 768px

/log-bug API returns 500 error when creating user with empty email field
Expected: Should return 400 Bad Request with validation error
Actual: Returns 500 Internal Server Error
Steps: 1. POST to /api/users with {name: "Test", email: ""} 2. Observe 500 error

/log-bug /build command fails when no atomic stories exist - should show helpful error instead of crashing

/log-bug Dashboard loading spinner never disappears when API is slow

/log-bug Database migration fails on production - users.email column allows NULL but app expects NOT NULL
```

## Output Format

```
🐛 Bug logged successfully with Root Cause Analysis!

📋 Bug Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bug ID:       BUG-042
Summary:      API returns 500 error when creating user with empty email
Severity:     High (P1)
Category:     Backend
Status:       ⏳ Pending

📍 Documentation:
- Bug RCA:        docs/epics/005-knowledge-management-business-intelligence/bugs/005-bug-042-api-empty-email-500-error.md
- Epic:           docs/epics/005-knowledge-management-business-intelligence/epic.md (bugs_open: 1)
- Bug Index:      docs/epics/bugs-index.md
- Progress:       docs/progress/000-progress-v1.4.0.md

📊 Root Cause Analysis:
- Expected Behavior: API should return 400 Bad Request with validation error
- Current Behavior:  API returns 500 Internal Server Error and crashes
- Root Cause:        Missing email validation in user creation endpoint allows NULL to reach database insert
- Impact:            Users cannot create accounts; production endpoint crashes

📈 Bug Statistics:
- Total Bugs:     42
- Critical (P0):  2
- High (P1):      12
- Medium (P2):    20
- Low (P3):       8
- Pending:        38
- Resolved:       4

🎯 Next Steps:
1. Full RCA documented in docs/epics/005-knowledge-management-business-intelligence/bugs/005-bug-042-api-empty-email-500-error.md
2. Progress tracking updated with bug abstract (no solution spoilers)
3. Bug indexed in docs/epics/bugs-index.md by severity
4. Ready for fixing - use: /fix-bug BUG-042

⚡ HIGH PRIORITY - Recommend fixing in next sprint

✅ Committed to git: 3 files updated (commit: abc123f)

✨ BUG-042 is now tracked with full RCA! ✨
```

## Important Notes

- **Epic-First:** All bugs live in `docs/epics/{epic}/bugs/` — there is no standalone `docs/bugs/` directory. Every bug must belong to an epic.
- **File = Source of Truth:** Bug files have full YAML frontmatter (`story_status: bug`, `bug_severity`, `bug_status`, `related_story`). The dashboard reads from these files directly.
- **Progress Doc = Abstract Only:** Progress tracking shows bug summary and link, NOT the solution
- **RCA is Comprehensive:** Every bug gets full Root Cause Analysis with DFD/schema
- **Bug vs Feature Request:** This command is for bugs (broken functionality), not feature requests
- **Severity Guidelines:**
  - **Critical (P0):** Production down, data loss, security breach → immediate fix required
  - **High (P1):** Major feature broken, significant user impact → fix in next sprint
  - **Medium (P2):** Partial breakage, workaround exists → fix when convenient
  - **Low (P3):** Cosmetic, minor annoyance → fix in maintenance window
- **Version Alignment:** Log bugs to LATEST version of progress docs
- **Bug Numbering:** Use global bug numbers (BUG-001, BUG-002, etc.)
- **RCA Quality:** Good RCA = easier bug fixing with `/fix-bug`
- **DFD/Schema:** Always include system diagrams to visualize the bug
- **Git Commits:** Optional but recommended to track bug logging history
- **Fix Workflow:** After logging, use `/fix-bug BUG-{number}` to fix the bug

## Error Handling

**No Bug Description Provided:**
- Display error: "Please provide a bug description"
- Show usage: "/log-bug {description of the bug}"
- Example: "/log-bug Dashboard crashes when loading empty data"

**No Epics Found:**
- Display error: "No epics found in docs/epics/. All bugs must be linked to an epic."
- Suggest: "Run /new-feature or /sync-board first to create epic structure."
- Abort bug logging

**Epic `bugs/` Directory Creation Failed:**
- Display error: "Could not create bugs directory: {error}"
- Check permissions
- Suggest manual directory creation: `mkdir -p docs/epics/{selectedEpicDir}/bugs`
- Abort bug logging

**Bug Document Write Failed:**
- Display error: "Could not write bug document: {error}"
- Check disk space and permissions
- Provide bug content for manual copy-paste
- Suggest manual file creation

**Progress Document Not Found:**
- Display warning: "Progress document not found - creating new section"
- Create bugs section in progress doc
- Continue with bug logging
- Suggest running `/update-progress` after

**Cannot Determine Bug Category:**
- Display warning: "Could not categorize bug automatically"
- Use AskUserQuestion to ask user:
  - "Which category does this bug belong to?"
  - Options: Frontend, Backend, Database, DevOps, Documentation, Testing, General
- Continue with user-selected category

**RCA Context Documents Missing:**
- Display warning: "Some documentation files not found for RCA context"
- Continue with available documentation
- Note missing docs in RCA
- RCA may be less detailed but still useful

**bugs-index.md Update Failed:**
- Complete bug logging successfully
- Display warning: "Bug created but bugs-index.md update failed"
- Provide exact table row to add manually to `docs/epics/bugs-index.md`
- Note that bug file is saved but not in cross-epic index

**Git Commit Failed:**
- Complete bug logging successfully
- Display warning: "Bug logged but git commit failed: {error}"
- Suggest manual commit with provided message
- Confirm files were updated even if commit failed

**Invalid Severity Detection:**
- If severity cannot be determined automatically:
  - Use AskUserQuestion to ask user:
    - "What is the severity of this bug?"
    - Options: Critical (P0), High (P1), Medium (P2), Low (P3)
  - Apply user-selected severity

## Success Criteria

The `/log-bug` command is successful when:
1. ✅ Bug description parsed and validated
2. ✅ Bug categorized by type (FE/BE/DB/DevOps/etc.)
3. ✅ Severity determined (P0/P1/P2/P3)
4. ✅ Epic selected (required — no standalone bugs)
5. ✅ Affected story identified (or explicitly skipped)
6. ✅ Global bug number assigned (BUG-XXX, cross-epic)
7. ✅ Epic `bugs/` directory ensured: `docs/epics/{epicDir}/bugs/`
8. ✅ Root Cause Analysis performed:
   - Expected vs Current Behavior analyzed
   - Root cause identified
   - Data Flow Diagram or Schema Analysis created
   - Affected components listed
   - Impact assessed
9. ✅ Bug file created at `docs/epics/{epicDir}/bugs/{epicId}-bug-{NNN}-{slug}.md` with full YAML frontmatter
10. ✅ Affected story file updated with `related_bugs` reference (if story selected)
11. ✅ Epic stats refreshed via `aggregate-epics.js --update` (`bugs_open` incremented)
12. ✅ Cross-epic index created/updated: `docs/epics/bugs-index.md`
13. ✅ Progress document updated with bug ABSTRACT only (no solution)
14. ✅ All validations passed
15. ✅ User receives comprehensive summary
16. ✅ Git commit created (if user confirmed)
17. ✅ Bug is ready for fixing with `/fix-bug`

## Future Enhancements

### v1.1.0
- Automatic screenshot attachment
- Integration with GitHub Issues
- Bug template customization
- Bug reporter attribution

### v1.2.0
- AI-assisted root cause analysis
- Automatic related bugs detection
- Bug aging alerts (bugs open too long)
- Bug resolution time tracking

### v1.3.0
- Bug trend analysis and reporting
- Integration with CI/CD for test failure bugs
- Automatic bug assignment based on code ownership
- Bug fix verification workflow with test results
