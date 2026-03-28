# Fix Bug Command

Locate bug documentation with Root Cause Analysis, review the RCA, confirm the approach, implement the fix, update/create tests, verify the fix, and update all tracking documentation.

## Execution Steps

### Phase 1: Parse Input and Locate Bug

1. **Extract Bug Identifier**
   - Parse command arguments to get bug identifier
   - Support multiple formats:
     - `BUG-042` (preferred format)
     - `042` (bug number only)
     - `bug-042` (lowercase variant)
     - `#042` (with hash prefix)
   - Normalize to standard format: `BUG-{number}`
   - Store as `bug_id` (e.g., "BUG-042")

2. **Locate Bug RCA Document via Epic Structure**
   - Search `docs/epics/*/bugs/` for a file matching the bug number:
     - Glob pattern: `docs/epics/*/bugs/*-bug-{number}-*.md`
     - Normalize number to zero-padded 3 digits (e.g., 42 → 042)
   - If found: store `bug_rca_path` and extract `selectedEpicDir` from the path
   - If not found: check `docs/epics/bugs-index.md` for a link to the bug file
   - If still not found:
     - Display error: "Bug {bug_id} RCA file not found in docs/epics/*/bugs/"
     - Suggest: "Use /log-bug to create the bug first"
     - Exit
   - Store `bug_rca_path` and `selectedEpicId` (e.g., "007")

3. **Read Bug Metadata from RCA Frontmatter**
   - Read YAML frontmatter of the bug file at `bug_rca_path`
   - Extract:
     - `bug_severity` (P0/P1/P2/P3)
     - `bug_category` (Frontend/Backend/Database/DevOps/etc.)
     - `bug_status` (should be "open")
     - `related_story` (story ID if linked, null otherwise)
   - Also check `docs/progress/000-progress-v*.md` for progress entry matching `bug_id` (optional, for additional context)
   - If `related_story` is set: locate the story file at `docs/epics/{selectedEpicDir}/**/{related_story}-*.md`

### Phase 2: Read and Analyze RCA

1. **Read Bug RCA Document**
   - Use Read tool to load full bug RCA from `bug_rca_path`
   - Extract all key sections:
     - Bug metadata (ID, severity, category, status)
     - Expected Behavior
     - Current Behavior
     - Root Cause Analysis (all 5 Whys)
     - Data Flow / System Analysis (DFD/schema)
     - Affected Components (files, functions, line numbers)
     - Impact Assessment
     - Related Issues
   - Verify RCA is comprehensive enough to fix

2. **Validate RCA Completeness**
   - Check if RCA has all necessary information:
     - ✅ Root cause identified?
     - ✅ Affected components listed?
     - ✅ Data flow or schema documented?
     - ✅ Expected behavior clear?
   - If RCA incomplete:
     - Display warning: "RCA is incomplete - may need more investigation"
     - Use AskUserQuestion:
       - "RCA is missing {section}. Proceed anyway?"
       - "Update RCA first with /log-bug?"
       - "Cancel - I'll investigate manually"
     - Handle based on user choice

3. **Display RCA Summary to User**
   ```
   📋 Bug RCA Summary:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Bug ID:          {bug_id}
   Severity:        {severity} (P{0-3})
   Category:        {category}
   Current Status:  {status}

   📄 Root Cause:
   {Root cause from RCA - 2-3 sentences}

   🔍 Affected Components:
   {List of files and functions from RCA}

   📊 Expected Fix:
   Based on RCA, the fix will involve:
   - {Fix point 1}
   - {Fix point 2}
   - {Fix point 3}

   Proceeding to implement fix...
   ```

### Phase 3: Confirm Fix Approach with User

1. **Generate Fix Strategy from RCA**
   - Based on root cause and affected components, propose fix:
     - What code changes are needed?
     - What validations need to be added?
     - What edge cases need handling?
     - What configuration changes are needed?
   - Examples:
     - "Add email validation to user creation endpoint before database insert"
     - "Add CSS media query for navbar collapse on mobile screens < 768px"
     - "Add NOT NULL constraint to users.email column in database schema"

2. **Present Fix Strategy to User**
   - Use AskUserQuestion to confirm fix approach:
     ```
     Proposed Fix Strategy:

     Based on RCA, I will:
     1. {Fix step 1}
     2. {Fix step 2}
     3. {Fix step 3}

     Affected Files:
     - {file1} - {change description}
     - {file2} - {change description}

     Tests to Update:
     - {test file 1} - {new test description}
     - {test file 2} - {updated test description}

     Options:
     - "Proceed with this fix" (Recommended)
     - "Let me review the files first"
     - "Suggest alternative approach"
     - "Cancel - I'll fix manually"
     ```

3. **Handle User Response**
   - **If "Proceed with this fix":**
     - Continue to Phase 4
   - **If "Let me review the files first":**
     - Use Read tool to show affected files
     - Re-prompt for confirmation
   - **If "Suggest alternative approach":**
     - Ask user to describe alternative
     - Revise fix strategy
     - Re-confirm
   - **If "Cancel":**
     - Exit gracefully
     - Note: "You can run /fix-bug {bug_id} again when ready"

### Phase 4: Read Affected Files

1. **Load All Affected Components**
   - From RCA "Affected Components" section, get file list
   - For each file mentioned:
     - Use Read tool to load file contents
     - Store file path and contents
     - If file not found:
       - Display warning: "File not found: {file}"
       - Ask if should continue without it
   - Examples:
     - `src/api/users/createUser.ts`
     - `src/components/Navbar/Navbar.tsx`
     - `database/migrations/001_create_users.sql`

2. **Identify Exact Code Locations**
   - Based on RCA and file contents:
     - Find functions/methods mentioned in RCA
     - Identify exact line numbers needing changes
     - Locate where validations are missing
     - Find where error handling is needed
   - Use Grep if needed to find specific patterns

3. **Analyze Current Code**
   - Understand current implementation
   - Identify why bug exists (validate RCA findings)
   - Determine minimal changes needed
   - Avoid over-engineering - fix only what's broken

### Phase 5: Implement the Fix

1. **Generate Code Fixes**
   - For each affected file, generate fixes based on RCA:
     - **For missing validation:**
       ```typescript
       // BEFORE (from RCA):
       async createUser(userData: UserData) {
         return await db.users.insert(userData); // BUG: no validation
       }

       // AFTER (fix):
       async createUser(userData: UserData) {
         // Validate email is provided
         if (!userData.email || userData.email.trim() === '') {
           throw new ValidationError('Email is required');
         }

         // Validate email format
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(userData.email)) {
           throw new ValidationError('Invalid email format');
         }

         return await db.users.insert(userData);
       }
       ```

     - **For missing error handling:**
       ```typescript
       // BEFORE:
       const data = await fetch('/api/users');
       setUsers(data); // BUG: no error handling

       // AFTER:
       try {
         const data = await fetch('/api/users');
         setUsers(data);
       } catch (error) {
         console.error('Failed to fetch users:', error);
         setError('Unable to load users. Please try again.');
       }
       ```

     - **For CSS/styling bugs:**
       ```css
       /* BEFORE: */
       .navbar {
         display: flex;
       }

       /* AFTER (fix mobile issue): */
       .navbar {
         display: flex;
       }

       @media (max-width: 768px) {
         .navbar {
           flex-direction: column;
         }
       }
       ```

2. **Apply Code Fixes**
   - For each file that needs changes:
     - Use Edit tool to apply fix
     - Preserve existing code style and formatting
     - Add comments explaining fix (reference bug ID)
     - Examples:
       ```typescript
       // Fix BUG-042: Add email validation before insert
       if (!userData.email?.trim()) {
         throw new ValidationError('Email is required');
       }
       ```

3. **Verify Edit Success**
   - After each Edit:
     - Confirm edit was applied successfully
     - If edit fails:
       - Try alternative approach (Write entire file)
       - Or suggest manual edit with provided code

### Phase 6: Update or Create Tests

1. **Locate Existing Test Files**
   - Based on affected components, find corresponding test files:
     - **Backend:** `*.test.ts`, `*.spec.ts` in `tests/` or `__tests__/`
     - **Frontend:** `*.test.tsx`, `*.test.ts` in component directories
     - **E2E:** `*.e2e.ts` in `e2e/` or `tests/e2e/`
   - Use Glob to find test files matching patterns:
     - `**/{filename}.test.{ts,tsx,js,jsx}`
     - `**/__tests__/{filename}.{ts,tsx,js,jsx}`
     - `**/tests/**/{filename}.{ts,tsx,js,jsx}`

2. **Read Existing Tests**
   - For each test file found:
     - Use Read to load test contents
     - Identify relevant test cases
     - Check if bug scenario is already tested (should be failing)

3. **Generate New Test Cases**
   - Create test cases that verify the bug is fixed:
     - **Test the bug scenario** (should now pass)
     - **Test edge cases** mentioned in RCA
     - **Test error handling** if fix adds validation

   - **Example for Backend (email validation bug):**
     ```typescript
     describe('createUser', () => {
       it('should throw ValidationError when email is empty', async () => {
         // BUG-042: Ensure email validation prevents empty emails
         const userData = { name: 'Test User', email: '' };

         await expect(createUser(userData)).rejects.toThrow(ValidationError);
         await expect(createUser(userData)).rejects.toThrow('Email is required');
       });

       it('should throw ValidationError when email is invalid format', async () => {
         // BUG-042: Validate email format
         const userData = { name: 'Test User', email: 'invalid-email' };

         await expect(createUser(userData)).rejects.toThrow(ValidationError);
         await expect(createUser(userData)).rejects.toThrow('Invalid email format');
       });

       it('should create user successfully with valid email', async () => {
         // BUG-042: Valid email should still work
         const userData = { name: 'Test User', email: 'test@example.com' };

         const user = await createUser(userData);
         expect(user.email).toBe('test@example.com');
       });
     });
     ```

   - **Example for Frontend (mobile navbar bug):**
     ```typescript
     describe('Navbar', () => {
       it('should collapse on mobile screens', () => {
         // BUG-042: Navbar should be vertical on mobile
         render(<Navbar />);

         // Set viewport to mobile size
         global.innerWidth = 375;
         global.dispatchEvent(new Event('resize'));

         const navbar = screen.getByRole('navigation');
         const styles = window.getComputedStyle(navbar);

         expect(styles.flexDirection).toBe('column');
       });
     });
     ```

4. **Update or Create Test Files**
   - If test file exists:
     - Use Edit to add new test cases
     - Add tests in appropriate describe block
   - If test file doesn't exist:
     - Use Write to create new test file
     - Include proper imports and setup
     - Add all necessary test cases

### Phase 7: Run Tests and Verify Fix

1. **Determine Test Command**
   - Check `package.json` for test scripts:
     - `npm test` (default)
     - `npm run test:unit`
     - `npm run test:e2e`
     - `npm run test:all`
   - Based on bug category:
     - **FE bugs:** Run frontend unit tests
     - **BE bugs:** Run backend unit tests + integration tests
     - **Full-stack bugs:** Run all tests

2. **Run Unit Tests**
   - Use Bash to execute unit tests:
     ```bash
     npm run test:unit
     ```
   - Or category-specific:
     ```bash
     npm run test:backend  # for BE bugs
     npm run test:frontend # for FE bugs
     ```
   - Capture test output
   - Parse test results

3. **Analyze Test Results**
   - Check if all tests pass:
     - ✅ All tests passing → Fix verified!
     - ❌ Tests failing → Need to debug
   - For failures:
     - Display which tests failed
     - Show failure messages
     - Identify if failure is:
       - New test for this bug (expected to fail before fix, should pass now)
       - Existing test broken by fix (regression - need to revise fix)
       - Unrelated test (may be pre-existing issue)

4. **Run E2E Tests (if applicable)**
   - For high-severity bugs (P0, P1), also run E2E tests:
     ```bash
     npm run test:e2e
     ```
   - Verify end-to-end flows work correctly
   - Check for integration issues

5. **Handle Test Failures**
   - If new bug tests fail:
     - Display error: "Bug fix tests are failing"
     - Show test output
     - Use AskUserQuestion:
       - "Debug the fix?"
       - "Revise the fix approach?"
       - "Skip tests for now (not recommended)?"
   - If existing tests fail (regression):
     - Display warning: "Fix broke existing tests - possible regression"
     - List broken tests
     - Use AskUserQuestion:
       - "Revert fix and try different approach?"
       - "Fix the broken tests too?"
       - "Review manually?"

6. **Verify Test Coverage**
   - Run coverage report if available:
     ```bash
     npm run test:coverage
     ```
   - Check if affected files have adequate coverage (target: 80%+)
   - If coverage low:
     - Suggest additional test cases
     - Note in bug resolution that more tests may be needed

### Phase 8: Update Bug Documentation

1. **Update Bug RCA Document**
   - Read the bug RCA file again
   - Update the "Resolution Notes" section with:
     ```markdown
     ## Resolution Notes

     **Status:** ✅ Resolved
     **Fixed By:** Claude Sonnet 4.5 (via /fix-bug)
     **Fixed Date:** {YYYY-MM-DD HH:mm}
     **Fix Method:** {Brief description of how it was fixed}

     ### Fix Implementation

     **Changes Made:**
     - `{file1}` - {description of changes}
     - `{file2}` - {description of changes}

     **Code Changes:**
     ```{language}
     {Key code snippet showing the fix}
     ```

     **Tests Added:**
     - `{test_file1}` - {description of new tests}
     - `{test_file2}` - {description of updated tests}

     **Test Results:**
     - Unit Tests: ✅ {passed}/{total} passed
     - E2E Tests: ✅ {passed}/{total} passed
     - Coverage: {percentage}% on affected files

     ### Verification

     **How Fix Was Verified:**
     1. {Verification step 1}
     2. {Verification step 2}
     3. {Verification step 3}

     **Steps to Reproduce (Now Fixed):**
     1. {Step 1} → ✅ Works correctly
     2. {Step 2} → ✅ Works correctly
     3. {Step 3} → ✅ Expected behavior observed

     ### Future Prevention

     **To prevent similar bugs:**
     - {Recommendation 1}
     - {Recommendation 2}

     **Related Updates:**
     - Updated progress tracking (docs/progress/000-progress-v{version}.md)
     - Updated cross-epic bug index (docs/epics/bugs-index.md)
     - Updated epic stats (docs/epics/{selectedEpicDir}/epic.md)

     ---

     **Resolved:** {YYYY-MM-DD HH:mm} via `/fix-bug BUG-{number}`
     ```

2. **Apply Updates to Bug RCA**
   - Use Edit tool to update Resolution Notes section
   - Change status from "⏳ Pending" to "✅ Resolved"
   - Add all fix details, test results, and verification

### Phase 9: Update Progress Tracking

1. **Find Bug Entry in Progress Doc**
   - Read latest progress doc again
   - Locate the bug entry for this `bug_id`

2. **Update Bug Status in Progress**
   - Change status from "⏳ Pending" to "✅ Resolved"
   - Add resolution date
   - Add link to fixed bug RCA
   - Format:
     ```markdown
     #### BUG-{number}: {Brief Summary}

     **Severity:** {P0/P1/P2/P3} ({Critical/High/Medium/Low})
     **Category:** {FE/BE/DB/DevOps/Documentation/Testing}
     **Status:** ✅ Resolved
     **Reported:** {YYYY-MM-DD}
     **Resolved:** {YYYY-MM-DD}
     **File:** [docs/epics/{epicDir}/bugs/{bug_filename}](../epics/{epicDir}/bugs/{bug_filename})

     **Abstract:**
     {1-2 sentence description of the bug}

     **Resolution:**
     Fixed via `/fix-bug` - {1 sentence describing fix}

     **Tests:**
     - Unit tests: ✅ Passing
     - E2E tests: ✅ Passing
     - Coverage: {percentage}%
     ```

3. **Update Bug Statistics in Progress**
   - Decrement "Pending" count
   - Increment "Resolved" count
   - Update total resolved percentage
   - Update category-specific resolved counts

4. **Apply Progress Doc Updates**
   - Use Edit tool to update progress document
   - Maintain formatting consistency
   - Update "Last Updated" timestamp

### Phase 10: Update Cross-Epic Bug Index and Epic Stats

1. **Update `docs/epics/bugs-index.md`**
   - Read `docs/epics/bugs-index.md`
   - Find the row for this bug (matching `BUG-{number}`)
   - Change status cell from `⏳ Open` to `✅ Resolved`
   - Add resolution date to the row
   - Update summary statistics at top of file:
     - Decrement "Open" count
     - Increment "Resolved" count
   - Use Edit tool to apply changes

2. **Update Bug RCA Frontmatter**
   - Edit YAML frontmatter of `bug_rca_path`:
     - Set `bug_status: "resolved"`
     - Set `completed_at: "{ISO timestamp}"`
     - Set `updated_at: "{ISO timestamp}"`

3. **Update Related Story File** (if `related_story` was set)
   - Read story file frontmatter
   - Locate `related_bugs` array entry for this `bug_id`
   - Update status marker or add a resolved note
   - Set `updated_at: "{ISO timestamp}"`
   - Use Edit tool — preserve markdown body

4. **Refresh Epic Stats**
   - Run: `node .ai-dev/ai-dev-scripts/aggregate-epics.js --update --docs-path=./docs --epic={selectedEpicId}`
   - This decrements `bugs_open` and increments `bugs_resolved` in `epic.md`
   - If script fails, display warning but continue

### Phase 11: Validate Fix Completion

1. **Verify All Updates**
   - ✅ Code fix applied to affected files
   - ✅ Tests added or updated
   - ✅ All tests passing
   - ✅ Bug RCA updated with resolution notes
   - ✅ Progress doc updated (bug marked resolved)
   - ✅ Bug index (README.md) updated
   - Use Read to spot-check files

2. **Generate Validation Checklist**
   ```
   ✅ Fix Validation Checklist:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✅ Code Changes Applied:
      - {file1}: {changes}
      - {file2}: {changes}

   ✅ Tests Updated:
      - {test_file1}: {new tests}
      - {test_file2}: {updated tests}

   ✅ Test Results:
      - Unit Tests: {passed}/{total} ✅
      - E2E Tests: {passed}/{total} ✅
      - Coverage: {percentage}% ✅

   ✅ Documentation Updated:
      - Bug RCA: ✅ Resolution notes added + frontmatter bug_status: resolved
      - Progress: ✅ Status changed to Resolved
      - Bug Index: ✅ docs/epics/bugs-index.md updated (Open→Resolved)
      - Epic Stats: ✅ bugs_open decremented, bugs_resolved incremented in epic.md
      - Related Story: ✅ related_bugs updated (if story was linked)

   ✅ All validations passed!
   ```

3. **Check for Regressions**
   - Review test output for unexpected failures
   - If any regressions detected:
     - Display warning
     - List affected tests
     - Suggest review before committing

### Phase 12: Optional Git Commit

1. **Prompt for Git Commit**
   - Use AskUserQuestion:
     - "Would you like to commit this bug fix to git?"
     - Options: "Yes - commit now", "No - I'll commit manually"

2. **Create Git Commit** (if user confirms)
   - Stage all modified files:
     - Code files (fixes)
     - Test files (new/updated tests)
     - Bug RCA document
     - Progress document
     - Bug index (README.md)
   - Generate descriptive commit message:
     ```
     fix(BUG-{number}): {brief summary of bug}

     Root Cause: {1 sentence}
     Fix: {1 sentence describing fix}

     Changes:
     - {file1}: {change description}
     - {file2}: {change description}

     Tests:
     - {test1}: {new test description}
     - {test2}: {updated test description}

     Test Results:
     - Unit: {passed}/{total} passing
     - E2E: {passed}/{total} passing
     - Coverage: {percentage}%

     Documentation:
     - Updated bug RCA (docs/epics/{epicDir}/bugs/{filename}.md)
     - Updated progress tracking (v{version})
     - Updated cross-epic bug index (docs/epics/bugs-index.md)
     - Updated epic {epicId} stats (bugs_open/bugs_resolved)

     Resolves BUG-{number}

     Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
     ```

3. **Execute Git Commit**
   - Use Bash to create commit
   - Display commit hash
   - Confirm commit success

4. **Handle Git Errors**
   - If commit fails:
     - Display error message
     - Provide exact commit message for manual commit
     - Note that fix is complete even if commit failed
   - If not in git repo:
     - Skip commit
     - Note files updated successfully

### Phase 13: Generate Comprehensive Summary

1. **Collect Fix Details**
   - Bug ID and summary
   - Severity and category
   - Files changed
   - Tests added/updated
   - Test results
   - Documentation updated
   - Git commit status

2. **Display Comprehensive Summary**
   ```
   ✅ Bug fixed successfully!

   🐛 Bug Details:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Bug ID:       BUG-{number}
   Summary:      {Brief description}
   Severity:     {Critical/High/Medium/Low} (P{0-3})
   Category:     {FE/BE/DB/DevOps/etc.}
   Status:       ✅ Resolved

   🔧 Fix Implementation:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Root Cause: {1 sentence from RCA}
   Fix Applied: {1 sentence describing fix}

   📝 Files Changed:
   - {file1} - {change description}
   - {file2} - {change description}

   ✅ Tests Added/Updated:
   - {test_file1} - {test description}
   - {test_file2} - {test description}

   📊 Test Results:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Unit Tests:   ✅ {passed}/{total} passing
   E2E Tests:    ✅ {passed}/{total} passing
   Coverage:     {percentage}% on affected files
   Regressions:  None detected ✅

   📚 Documentation Updated:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - ✅ Bug RCA: docs/bugs/{bug_filename}.md
     - Resolution notes added
     - Status changed to Resolved
   - ✅ Progress: docs/progress/000-progress-v{version}.md
     - Bug marked as resolved
     - Statistics updated
   - ✅ Bug Index: docs/bugs/000-README.md
     - Status updated
     - Resolution date added

   🎯 Verification:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Fix verified by:
   1. {Verification step 1} ✅
   2. {Verification step 2} ✅
   3. {Verification step 3} ✅

   Original bug scenario now works correctly!

   📦 Git Status:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✅ Committed to git (commit: {hash})
   Files: {count} changed, {insertions}+ insertions, {deletions}- deletions

   🎉 Next Steps:
   1. Review the fix if needed
   2. Consider creating PR for code review
   3. Deploy to staging for final verification
   4. Close related GitHub issues if any

   ✨ BUG-{number} is now resolved! ✨
   ```

3. **Provide Recommendations**
   - If Critical (P0):
     - Suggest immediate deployment
     - Recommend hotfix release
   - If High (P1):
     - Suggest including in next release
     - Recommend QA verification
   - For all fixes:
     - Suggest code review if working on team
     - Recommend deployment verification
     - Note any follow-up tasks

## Input Format

**Command:**
```
/fix-bug {bug-id}
```

**Examples:**
```
/fix-bug BUG-042

/fix-bug 042

/fix-bug bug-042

/fix-bug #042
```

## Output Format

```
✅ Bug fixed successfully!

🐛 Bug Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bug ID:       BUG-042
Summary:      API returns 500 error when creating user with empty email
Severity:     High (P1)
Category:     Backend
Status:       ✅ Resolved

🔧 Fix Implementation:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Root Cause: Missing email validation in user creation endpoint allows NULL to reach database
Fix Applied: Added email validation (required + format) before database insert

📝 Files Changed:
- src/api/users/createUser.ts - Added email validation logic
- src/api/users/validators.ts - Created email validation helper

✅ Tests Added/Updated:
- tests/api/users/createUser.test.ts - Added 3 validation test cases
- tests/e2e/user-creation.e2e.ts - Updated E2E test with validation scenarios

📊 Test Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Unit Tests:   ✅ 47/47 passing
E2E Tests:    ✅ 12/12 passing
Coverage:     92% on affected files (createUser.ts, validators.ts)
Regressions:  None detected ✅

📚 Documentation Updated:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- ✅ Bug RCA: docs/bugs/042-202602261445-api-empty-email-500-error.md
  - Resolution notes added with code examples
  - Status changed to Resolved
- ✅ Progress: docs/progress/000-progress-v1.4.0.md
  - Bug marked as resolved
  - Statistics: Pending 37 → 36, Resolved 5 → 6
- ✅ Bug Index: docs/bugs/000-README.md
  - Status updated to ✅ Resolved
  - Resolution date: 2026-02-26

🎯 Verification:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fix verified by:
1. POST with empty email → Returns 400 ValidationError ✅
2. POST with invalid email → Returns 400 ValidationError ✅
3. POST with valid email → Creates user successfully ✅

Original bug scenario (500 error) now returns proper 400 validation error!

📦 Git Status:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Committed to git (commit: abc123f)
Files: 5 changed, 87+ insertions, 12- deletions

🎉 Next Steps:
1. Review the fix in src/api/users/createUser.ts
2. Consider creating PR for team code review
3. Deploy to staging for final QA verification
4. Monitor production logs after deployment

✨ BUG-042 is now resolved! ✨
```

## Important Notes

- **RCA Dependency:** This skill depends on comprehensive RCA from `/log-bug`
- **Test Coverage:** All fixes MUST include tests to verify the bug is resolved
- **No Regressions:** Existing tests must continue to pass after fix
- **Documentation:** Bug resolution is tracked in 3 places: RCA file, progress doc, bug index
- **Verification:** Tests are run to verify fix works correctly
- **Git Integration:** Commits include fix details and test results
- **User Confirmation:** User confirms fix approach before implementation
- **Test-Driven:** Tests are updated/created to verify fix
- **Coverage Target:** Aim for 80%+ coverage on affected files
- **Minimal Changes:** Fix only what's broken, avoid refactoring
- **Code Comments:** Add comments referencing bug ID in fixed code
- **Future Prevention:** Resolution notes include prevention recommendations

## Error Handling

**Bug ID Not Provided:**
- Display error: "Please provide a bug ID"
- Show usage: "/fix-bug {bug-id}"
- Example: "/fix-bug BUG-042"
- List recent bugs from progress doc

**Bug Not Found in Progress:**
- Display error: "Bug {bug_id} not found in progress tracking"
- Use Grep to search for bug in progress doc
- Suggest: "Use /log-bug to create the bug first"
- List available bugs from progress doc

**Bug RCA File Not Found:**
- Display error: "Bug RCA file not found: {expected_path}"
- Check if file was moved or deleted
- Suggest recreating with /log-bug
- Or suggest manual file path correction

**Bug Already Resolved:**
- Display warning: "Bug {bug_id} is already marked as resolved"
- Show resolution date and details
- Use AskUserQuestion:
  - "Re-open and fix again?"
  - "View resolution notes?"
  - "Cancel"
- Handle based on user choice

**RCA Incomplete:**
- Display warning: "RCA is missing critical information"
- List missing sections (root cause, affected components, etc.)
- Use AskUserQuestion:
  - "Proceed with incomplete RCA (not recommended)?"
  - "Update RCA first with /log-bug?"
  - "Cancel - I'll investigate manually"

**Affected Files Not Found:**
- Display warning: "Some files from RCA not found: {file_list}"
- Ask if files were moved/renamed
- Use AskUserQuestion:
  - "Continue fixing available files?"
  - "Update file paths manually?"
  - "Cancel - I'll check file locations"

**Code Edit Failed:**
- Display error: "Could not apply fix to {file}: {error}"
- Show the code that was supposed to be applied
- Suggest manual edit with provided code
- Or try alternative approach (Write entire file)

**Test Files Not Found:**
- Display warning: "No test files found for {component}"
- Suggest test file paths to create
- Use AskUserQuestion:
  - "Create new test file?"
  - "Skip tests (not recommended)?"
  - "I'll add tests manually later"

**Tests Failing After Fix:**
- Display error: "Tests are failing after applying fix"
- Show test failure output
- Use AskUserQuestion:
  - "Debug and revise fix?"
  - "Revert changes?"
  - "View test output in detail?"
  - "Skip failing tests (not recommended)?"

**Tests Not Available:**
- Display warning: "Cannot run tests - test command not found"
- Check package.json for test scripts
- Suggest:
  - "Verify fix manually?"
  - "Set up tests first?"
  - "Skip test verification (not recommended)?"

**Regression Detected:**
- Display critical warning: "Fix broke existing tests - regression detected"
- List broken tests
- Show failure details
- Use AskUserQuestion:
  - "Revert fix and try different approach?"
  - "Fix the broken tests too?"
  - "Review manually and decide?"

**Git Commit Failed:**
- Complete bug fix successfully
- Display warning: "Bug fixed but git commit failed: {error}"
- Provide commit message for manual commit
- Note all files that were updated

**Progress Update Failed:**
- Complete bug fix and code changes successfully
- Display warning: "Bug fixed but progress doc update failed"
- Provide exact content to add manually
- Note that bug is fixed but not tracked

## Success Criteria

The `/fix-bug` command is successful when:
1. ✅ Bug ID parsed and normalized
2. ✅ Bug found in progress documentation
3. ✅ Bug RCA file located and read
4. ✅ RCA analyzed and validated
5. ✅ Fix strategy generated from RCA
6. ✅ User confirmed fix approach
7. ✅ Affected files read and analyzed
8. ✅ Code fixes implemented with Edit tool
9. ✅ Tests added or updated for bug scenario
10. ✅ All unit tests passing
11. ✅ E2E tests passing (if applicable)
12. ✅ Test coverage adequate (80%+ target)
13. ✅ No regressions detected
14. ✅ Bug RCA updated with resolution notes
15. ✅ Progress doc updated (bug marked resolved)
16. ✅ Bug index (README.md) updated
17. ✅ Statistics recalculated
18. ✅ Git commit created (if user confirmed)
19. ✅ User receives comprehensive summary
20. ✅ Bug is fully resolved and documented

## Future Enhancements

### v1.1.0
- Automatic PR creation after fix
- Integration with CI/CD for automated testing
- Fix effectiveness tracking (re-open rate)
- Suggested reviewers based on affected files

### v1.2.0
- AI-powered fix suggestions from RCA
- Multiple fix strategies with trade-off analysis
- Automatic rollback on test failure
- Integration with deployment pipelines

### v1.3.0
- Machine learning from past fixes
- Pattern recognition for similar bugs
- Automated fix verification in production
- Performance impact analysis of fixes
