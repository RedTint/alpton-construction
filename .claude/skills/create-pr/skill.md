# Create Pull Request Command

Create a GitHub pull request for the current branch with an auto-generated, user-confirmed title and a fully customizable description. Prompts the user to confirm the title and select which sections to include before creating the PR.

## Execution Steps

### Phase 1: Read Git Context

1. **Get Current Branch**
   - Run: `git branch --show-current`
   - Store as `current_branch`
   - If the output is empty (detached HEAD state):
     - Display: "You are in a detached HEAD state. Cannot create a PR without a named branch."
     - Stop execution

2. **Determine Base Branch**
   - Run: `git symbolic-ref refs/remotes/origin/HEAD --short 2>/dev/null | sed 's|origin/||'`
   - Fallback to `main` if detection fails or returns empty
   - Store as `base_branch`
   - Check if `--base` argument was provided in command input and override `base_branch` if so

3. **Check for Commits Ahead of Base**
   - Run: `git log origin/{base_branch}..HEAD --oneline 2>/dev/null || git log {base_branch}..HEAD --oneline`
   - Store result as `commits_ahead[]`
   - If no commits ahead:
     - Display: "No commits found ahead of '{base_branch}'. Nothing to PR."
     - Stop execution

4. **Check if PR Already Exists**
   - Run: `gh pr list --head {current_branch} --state open --json number,url 2>/dev/null`
   - If a PR already exists:
     - Display: "An open PR already exists for this branch: {url}"
     - Use AskUserQuestion:
       ```
       Question: "A PR already exists for this branch. What do you want to do?"
       Options:
         1. "View the existing PR URL and stop"
         2. "Create another PR anyway (not recommended)"
         3. "Cancel"
       ```
     - Handle accordingly

5. **Get Changed Files**
   - Run: `git diff origin/{base_branch}...HEAD --name-status 2>/dev/null || git diff {base_branch}...HEAD --name-status`
   - Parse output into categorized lists:
     - `added_files[]` — lines starting with `A`
     - `modified_files[]` — lines starting with `M`
     - `deleted_files[]` — lines starting with `D`
     - `renamed_files[]` — lines starting with `R`
   - Store total count as `changed_file_count`

6. **Check gh CLI Authentication**
   - Run: `gh auth status 2>&1`
   - If not authenticated:
     - Display: "gh CLI is not authenticated. Run `gh auth login` first."
     - Stop execution

### Phase 2: Generate PR Title and Confirm with User

1. **Auto-Generate Title from Branch Name**
   - Take `current_branch` and apply transformation:
     - Remove common prefixes: `feature/`, `fix/`, `bugfix/`, `hotfix/`, `chore/`, `docs/`, `refactor/`, `strategy/`, `test/`
     - Replace hyphens and underscores with spaces
     - Title-case each word
     - Prepend a type label derived from the removed prefix:
       - `feature/` or `feat/` → `"feat: "`
       - `fix/` or `bugfix/` or `hotfix/` → `"fix: "`
       - `chore/` → `"chore: "`
       - `docs/` → `"docs: "`
       - `refactor/` → `"refactor: "`
       - `strategy/` → `"strategy: "`
       - `test/` → `"test: "`
       - No matching prefix → no label, just title-cased branch name
   - Examples:
     - `strategy/porters-five-forces-analysis` → `"strategy: Porters Five Forces Analysis"`
     - `feature/user-authentication` → `"feat: User Authentication"`
     - `fix/login-redirect-bug` → `"fix: Login Redirect Bug"`
     - `chore/update-dependencies` → `"chore: Update Dependencies"`
   - Also read the most recent commit message as an alternative title candidate

2. **Ask User to Confirm or Edit Title**
   - Use AskUserQuestion:
     ```
     Question: "Review the PR title. Select one or type a custom title."
     Options:
       1. "{auto-generated title from branch name}"
       2. "{most recent commit message — trimmed to 72 chars}"
       3. "No prefix — {title-cased branch name only}"
     ```
   - If user selects "Other" and types a custom title, use that verbatim
   - Store confirmed title as `pr_title`

3. **Ask User to Select PR Description Sections**
   - All sections are pre-selected — the user removes any they don't need
   - Use AskUserQuestion with multiSelect: true:
     ```
     Question: "Select the sections to include in the PR description. All are included by default — uncheck any you don't need."
     multiSelect: true
     Options:
       1. "Summary — 2-3 bullet points describing what changed and why"
       2. "Changes Made — grouped list of added, modified, and deleted files"
       3. "Test Plan — checklist of steps to verify the changes"
       4. "Screenshots / Preview — placeholder section for visual changes"
       5. "Breaking Changes — any changes that affect existing behavior"
       6. "Related Issues / Stories — links to atomic stories, ADRs, or GitHub issues"
       7. "Notes for Reviewers — specific context or guidance for the reviewer"
       8. "PR Checklist — standard pre-merge checklist (tests, lint, docs)"
     ```
   - Store selected sections as `selected_sections[]`
   - If no sections selected: use "Summary" as minimum

### Phase 3: Generate PR Description

Generate each selected section in order:

1. **Summary** *(if selected)*
   - Analyze `commits_ahead[]` and the changed files to derive 2-3 bullet points
   - Focus on *what* changed and *why* (pull from commit messages for "why")
   - Format:
     ```markdown
     ## Summary
     - {Bullet 1 — key change or feature}
     - {Bullet 2 — secondary change or motivation}
     - {Bullet 3 — if applicable}
     ```

2. **Changes Made** *(if selected)*
   - Group `added_files[]`, `modified_files[]`, `deleted_files[]`, `renamed_files[]` into subsections
   - Only show subsections that have files
   - Format:
     ```markdown
     ## Changes Made

     **Added ({count}):**
     - `path/to/file.ts`

     **Modified ({count}):**
     - `path/to/file.ts`

     **Deleted ({count}):**
     - `path/to/file.ts`
     ```

3. **Test Plan** *(if selected)*
   - Generate a contextual checklist based on the changed files and branch type:
     - Skill/docs changes: verify skill runs end-to-end, README updated
     - Frontend changes: verify component renders, responsive, no console errors
     - Backend changes: verify endpoints return expected responses, error cases handled
     - Config/DevOps changes: verify pipeline passes, no regressions
     - Strategy docs: verify document sections are complete, branch is isolated
   - Format:
     ```markdown
     ## Test Plan

     - [ ] {Contextual test step 1}
     - [ ] {Contextual test step 2}
     - [ ] {Contextual test step 3}
     - [ ] Review changed files for unintended modifications
     - [ ] Confirm no sensitive files (`.env`, credentials) are included
     ```

4. **Screenshots / Preview** *(if selected)*
   - Always a placeholder — the user fills this in after creating the PR
   - Format:
     ```markdown
     ## Screenshots / Preview

     > Add screenshots, screen recordings, or before/after comparisons here.

     | Before | After |
     |--------|-------|
     | _(add screenshot)_ | _(add screenshot)_ |
     ```

5. **Breaking Changes** *(if selected)*
   - Scan commit messages and changed files for signals of breaking changes:
     - Deleted files, renamed exports, removed API endpoints, schema changes
   - If signals found: list them explicitly
   - If no signals: mark as none
   - Format:
     ```markdown
     ## Breaking Changes

     > ⚠️ List any changes that alter existing behavior, APIs, or contracts.

     - {Breaking change 1, or "None identified"}
     ```

6. **Related Issues / Stories** *(if selected)*
   - Scan `commits_ahead[]` messages and `current_branch` name for:
     - GitHub issue references (`#123`, `closes #123`, `fixes #456`)
     - Story IDs from atomic stories format (`Story 315`, `story-315`)
     - ADR references (`ADR-`, `adr/`)
   - Format:
     ```markdown
     ## Related Issues / Stories

     - {Detected reference 1, or "- N/A"}
     - {Detected reference 2}
     ```

7. **Notes for Reviewers** *(if selected)*
   - Always a guided placeholder — provides structure for the author to fill in
   - Format:
     ```markdown
     ## Notes for Reviewers

     > Add any context that will help reviewers understand your decisions.

     - **Why this approach:** _(explain key decisions)_
     - **What to focus on:** _(highlight areas needing close review)_
     - **Known limitations:** _(note anything left for follow-up)_
     ```

8. **PR Checklist** *(if selected)*
   - Standard pre-merge checklist, pre-filled where deterministic
   - Format:
     ```markdown
     ## PR Checklist

     - [ ] Code follows project conventions
     - [ ] Tests added or updated for changed behavior
     - [ ] Documentation updated (README, skill.md, docs/) if needed
     - [ ] No `.env` or sensitive files included
     - [ ] Branch is up to date with `{base_branch}`
     - [ ] Linked to relevant stories or issues above
     ```

9. **Assemble Full Body**
   - Concatenate all selected sections in the order listed above
   - Append the standard footer:
     ```markdown

     ---
     🤖 Generated with [Claude Code](https://claude.com/claude-code)
     ```
   - Store as `pr_body`

### Phase 4: Create the Pull Request

1. **Show Preview Summary**
   - Display a brief preview before creating:
     ```
     PR Title:  {pr_title}
     Base:      {base_branch}
     Branch:    {current_branch}
     Commits:   {count} ahead of {base_branch}
     Files:     {changed_file_count} changed
     Sections:  {comma-separated list of selected_sections}
     ```

2. **Final Confirmation**
   - Use AskUserQuestion:
     ```
     Question: "Ready to create this PR?"
     Options:
       1. "Yes — create the PR now"
       2. "No — cancel (I'll edit the branch and retry)"
     ```
   - If "No": stop execution cleanly

3. **Create the PR**
   - Run:
     ```bash
     gh pr create \
       --title "{pr_title}" \
       --body "$(cat <<'EOF'
     {pr_body}
     EOF
     )" \
       --base {base_branch} \
       --head {current_branch}
     ```
   - Capture output to extract the PR URL
   - Store as `pr_url`

4. **Handle Creation Errors**
   - If `gh pr create` fails:
     - Parse the error message
     - Display specific guidance:
       - `Pull request already exists` → show existing PR URL
       - `No commits between` → commits may not be pushed; suggest `git push`
       - Authentication error → `gh auth login`
       - Network error → check connection and retry
     - Stop execution

### Phase 5: Validate and Report

1. **Verify PR Was Created**
   - Run: `gh pr view {pr_url} --json number,title,url,state 2>/dev/null`
   - Confirm state is `OPEN`

2. **Display Summary**

```
✅ Pull request created successfully!

📄 PR Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title:    {pr_title}
URL:      {pr_url}
Branch:   {current_branch} → {base_branch}
Commits:  {count}
Files:    {changed_file_count} changed

📋 Sections Included:
{list each selected section with ✅}

🎯 Next Steps:
1. Open the PR to add screenshots or reviewer notes: {pr_url}
2. Request a review or tag teammates
3. Monitor CI/CD checks
4. Merge when approved and checks pass

✨ Your PR is open and ready for review! ✨
```

## Input Format

**Command:**
```
/create-pr
/create-pr --base {branch}
```

**Examples:**
```
/create-pr
/create-pr --base develop
/create-pr --base staging
```

## Output Format

```
✅ Pull request created successfully!

📄 PR Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title:    strategy: Porters Five Forces Analysis
URL:      https://github.com/owner/repo/pull/42
Branch:   strategy/porters-five-forces-analysis → main
Commits:  3
Files:    4 changed

📋 Sections Included:
- ✅ Summary
- ✅ Changes Made
- ✅ Test Plan
- ✅ Related Issues / Stories
- ✅ PR Checklist

🎯 Next Steps:
1. Open the PR to add screenshots or reviewer notes: https://github.com/owner/repo/pull/42
2. Request a review or tag teammates
3. Monitor CI/CD checks
4. Merge when approved and checks pass

✨ Your PR is open and ready for review! ✨
```

## Title Generation Logic

```
Branch name → Remove prefix → Title-case → Prepend type label

Prefixes and labels:
  feature/ or feat/  → "feat: "
  fix/ or bugfix/    → "fix: "
  hotfix/            → "fix: "
  chore/             → "chore: "
  docs/              → "docs: "
  refactor/          → "refactor: "
  strategy/          → "strategy: "
  test/              → "test: "
  (none matched)     → no label

Examples:
  strategy/porters-five-forces-analysis → "strategy: Porters Five Forces Analysis"
  feature/user-auth-flow                → "feat: User Auth Flow"
  fix/broken-redirect                   → "fix: Broken Redirect"
  my-custom-branch                      → "My Custom Branch"
```

## Section Reference

| Section | Default | Contents |
|---------|---------|----------|
| Summary | ✅ On | 2-3 bullets from commits + changed files |
| Changes Made | ✅ On | Added / Modified / Deleted files grouped |
| Test Plan | ✅ On | Contextual checklist based on branch type |
| Screenshots / Preview | ✅ On | Before/after table placeholder |
| Breaking Changes | ✅ On | Signals from deleted files, removed exports |
| Related Issues / Stories | ✅ On | Parsed from commits and branch name |
| Notes for Reviewers | ✅ On | Guided placeholder for author context |
| PR Checklist | ✅ On | Standard pre-merge checklist |

## Important Notes

- **gh CLI Required**: The skill depends on `gh` (GitHub CLI). Ensure it is installed and authenticated (`gh auth login`) before running.
- **All Sections On By Default**: The AskUserQuestion checklist presents all 8 sections pre-selected. The user only needs to uncheck sections they want to omit.
- **Title Always Confirmed**: The skill never creates the PR without explicit title approval via AskUserQuestion — no silent auto-title.
- **Final Confirmation**: A last AskUserQuestion confirms before `gh pr create` runs — no accidental PR creation.
- **No Auto-Commit or Auto-Push**: The skill does not commit or push. Ensure your branch is already pushed before running `/create-pr`.
- **Base Branch Detection**: Automatically detects the default branch. Override with `--base {branch}` if needed.
- **Paired with /strategy**: After completing a strategy document on a `strategy/` branch, run `/create-pr` to submit it for review.

## Error Handling

**gh CLI Not Installed:**
- Display: "gh CLI not found. Install it from https://cli.github.com and run `gh auth login`."
- Stop execution

**Not Authenticated:**
- Display: "gh CLI is not authenticated. Run `gh auth login` to connect your GitHub account."
- Stop execution

**No Commits Ahead of Base:**
- Display: "No commits found ahead of '{base_branch}'. Push your changes first or check your base branch."
- Suggest: `git push -u origin {current_branch}`

**PR Already Exists:**
- Display existing PR URL
- Use AskUserQuestion: view existing / create anyway / cancel

**Branch Not Pushed to Remote:**
- `gh pr create` will fail with a "no remote" error
- Display: "Branch '{current_branch}' does not exist on the remote. Push it first: `git push -u origin {current_branch}`"

**Network / API Failure:**
- Display: "GitHub API request failed: {error message}"
- Suggest: check network connection, verify repo access, retry

**Detached HEAD:**
- Display: "You are in a detached HEAD state. Checkout a named branch before creating a PR."

## Success Criteria

The `/create-pr` command is successful when:
1. ✅ Current branch name is detected
2. ✅ Base branch is determined (auto or `--base` override)
3. ✅ Commits ahead of base are found (at least 1)
4. ✅ PR title is presented to user and confirmed via AskUserQuestion
5. ✅ Section checklist presented (all pre-selected) and user selection captured
6. ✅ PR body generated for all selected sections
7. ✅ Final creation confirmed via AskUserQuestion
8. ✅ `gh pr create` succeeds and returns a URL
9. ✅ PR verified as open via `gh pr view`
10. ✅ User receives summary with PR URL and next steps
