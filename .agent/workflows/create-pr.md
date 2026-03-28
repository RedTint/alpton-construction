---
description: Create a GitHub pull request for the current branch with an auto-generated, user-confirmed title and fully customizable description sections
---

1. Read Git Context
   Run: git branch --show-current → store as current_branch
   If output is empty (detached HEAD state), display error and stop:
   "You are in a detached HEAD state. Cannot create a PR without a named branch."
   Determine base branch:
   - Run: git symbolic-ref refs/remotes/origin/HEAD --short 2>/dev/null | sed 's|origin/||'
   - Fallback to "main" if detection fails
   - Override with --base argument if provided
   Check commits ahead: git log origin/{base_branch}..HEAD --oneline 2>/dev/null || git log {base_branch}..HEAD --oneline
   If no commits ahead: display "No commits found ahead of '{base_branch}'. Nothing to PR." and stop
   Check for existing open PR: gh pr list --head {current_branch} --state open --json number,url 2>/dev/null
   If PR exists, ask user: "View existing PR / Create another anyway / Cancel"
   Get changed files: git diff origin/{base_branch}...HEAD --name-status → categorize into added, modified, deleted, renamed lists
   Check gh CLI authentication: gh auth status 2>&1 — if not authenticated, display error and stop

2. Generate PR Title and Confirm with User
   Auto-generate title from branch name:
   - Remove prefix (feature/, fix/, bugfix/, hotfix/, chore/, docs/, refactor/, strategy/, test/)
   - Replace hyphens and underscores with spaces
   - Title-case each word
   - Prepend type label: feature/feat → "feat: " | fix/bugfix/hotfix → "fix: " | chore → "chore: " | docs → "docs: " | refactor → "refactor: " | strategy → "strategy: " | test → "test: " | no prefix → no label
   Read most recent commit message as alternative title candidate
   Use AskUserQuestion to confirm title:
   - Option 1: {auto-generated title from branch name}
   - Option 2: {most recent commit message — trimmed to 72 chars}
   - Option 3: "No prefix — {title-cased branch name only}"
   - Other: user types custom title
   Store confirmed title as pr_title

3. Select PR Description Sections
   Use AskUserQuestion with multiSelect: true — all sections pre-selected:
   - "Summary — 2-3 bullet points describing what changed and why"
   - "Test plan — checklist of items to verify the changes work"
   - "Screenshots — placeholder section for UI changes"
   - "Related issues — links to relevant GitHub issues or tickets"
   - "Breaking changes — list of any breaking changes introduced"
   Store selected sections as included_sections[]

4. Generate PR Description Content
   For each section in included_sections[], generate content:

   Summary section:
   - Analyze commit messages and changed files
   - Generate 2-3 bullet points describing: what changed (added_files, modified_files), why it changed (from commit messages), any notable architectural decisions

   Test plan section:
   - Infer test items from changed files:
     - If spec/test files changed → "Run unit tests: npm test or equivalent"
     - If e2e files changed → "Run E2E tests: npm run test:e2e"
     - If UI components changed → "Verify component renders correctly in browser"
     - If API endpoints changed → "Test endpoint responses with curl or Postman"
   - Add generic checklist items based on change type

   Screenshots section:
   - Add placeholder: "<!-- Add screenshots here if applicable -->"
   - Note: "Attach screenshots for any UI changes to aid review"

   Related issues section:
   - Scan commit messages for issue references (#123, fixes #456, closes #789)
   - List any found references; if none found, add placeholder

   Breaking changes section:
   - Scan commit messages for "BREAKING CHANGE" markers
   - If found, list them; if none, note "No breaking changes in this PR"

   Append standard footer: "Generated with Claude Code (https://claude.ai/claude-code)"

5. Confirm Before Creating PR
   Display a preview of the full PR:
   - Title: {pr_title}
   - Base branch: {base_branch}
   - Changed files: {count} files (N added, N modified, N deleted)
   - Sections included: {list}
   Use AskUserQuestion:
   - "Create PR now"
   - "Edit title before creating" → re-prompt for title
   - "Cancel — I'll create the PR manually"

6. Create GitHub Pull Request
   Run gh pr create with confirmed title and generated body:
   // turbo
   gh pr create \
     --title "{pr_title}" \
     --base "{base_branch}" \
     --body "$(cat <<'EOF'
   {generated_body_with_selected_sections}

   Generated with [Claude Code](https://claude.ai/claude-code)
   EOF
   )"
   Capture output to extract PR URL

7. Post-Creation Validation
   Run: gh pr view {current_branch} --json number,url,title,state
   Verify state is "OPEN"
   Display PR details: number, URL, title, base branch

8. Generate Summary Report
   Display PR creation summary:
   - PR title
   - PR URL (as clickable link)
   - Base branch
   - Sections included in description
   - Changed files count
   Suggest next steps:
   - Share the PR URL with reviewers
   - Add any screenshots if UI was changed
   - Monitor CI/CD checks in the PR
   - Use "gh pr checks {number}" to monitor test status
