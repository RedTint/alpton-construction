---
description: Comprehensive code review generating structured reports that can be integrated into atomic stories as bugs or tech debt
---

// Note: Original skill uses Claude Code's Task tool with agent teams, parallel execution, and AI personas
// Antigravity: This workflow provides a manual review checklist and report template
// For automated multi-persona reviews, use Claude Code's /code-review command

1. Parse Review Configuration
   Check for command options provided by user:
   - --agents [persona1,persona2,persona3]: Specify personas for specialized review
   - --scope [all|frontend|backend|tests]: Limit review scope
   - --focus [all|security|performance|quality|architecture]: Emphasize specific aspects

   Default values if not specified:
   - Scope: all (entire codebase)
   - Focus: all (all aspects)
   - Personas: None (general review)

2. Create Code Reviews Directory
   // turbo
   mkdir -p docs/code-reviews

3. Generate Review Filename
   Get current timestamp in YYmmddHHMM format
   Example: 260225-1445 for 2026-02-25 at 14:45
   Filename: [timestamp]-code-review.md
   Full path: docs/code-reviews/[timestamp]-code-review.md

4. Prepare Review Instructions
   Create review checklist covering these categories:
   - **Bugs**: Actual code defects
   - **Security**: Vulnerabilities and security issues
   - **Performance**: Performance bottlenecks
   - **Quality**: Code quality (readability, maintainability)
   - **Architecture**: Architectural concerns and tech debt
   - **Testing**: Missing or inadequate tests

   For each issue found, document:
   - Severity: Critical / High / Medium / Low
   - Category: Bug / Security / Performance / Quality / Architecture / Testing
   - Location: File path and line numbers
   - Description: Clear explanation
   - Impact: How this affects users/developers
   - Suggested Solution: Concrete steps to fix
   - Example Fix: Code snippet (if applicable)

5. Execute Code Review
   // Original: Uses Task tool with agent teams or parallel subagents
   // Antigravity: Manual review or use external tools

   **Option A: Manual Review**
   Review codebase systematically:
   - Check each module/component
   - Look for common issues (see checklist in step 4)
   - Document findings in structured format

   **Option B: Use Static Analysis Tools**
   Run automated code analysis:
   ```bash
   # Example tools (adjust for your tech stack)
   npm run lint          # ESLint for JavaScript
   pylint **/*.py        # Pylint for Python
   cargo clippy          # Clippy for Rust
   sonarqube-scanner     # SonarQube for comprehensive analysis
   ```

   **Option C: Peer Review**
   Have team members review different areas:
   - Frontend specialist reviews UI code
   - Backend specialist reviews API code
   - Security expert reviews auth/data handling
   - Combine findings into single report

6. Create Review Report
   Write report to docs/code-reviews/[timestamp]-code-review.md

   Use this template structure:
   ```markdown
   ---
   review_date: [YYYY-MM-DD]
   reviewers: [List of reviewers or "Manual Review"]
   scope: [all|frontend|backend|tests]
   focus: [all|security|performance|quality|architecture]
   execution_mode: [manual|automated|peer-review]
   total_issues: [count]
   critical_issues: [count]
   high_issues: [count]
   medium_issues: [count]
   low_issues: [count]
   ---

   # Code Review Report
   Generated: [timestamp]
   Reviewers: [Names or "Manual Review"]
   Scope: [scope]
   Focus: [focus]

   ## Executive Summary

   Total issues found: [X]
   - Critical: [count]
   - High: [count]
   - Medium: [count]
   - Low: [count]

   ## Statistics

   ### By Severity
   | Severity  | Count | Percentage |
   |-----------|-------|------------|
   | Critical  | X     | Y%         |
   | High      | X     | Y%         |
   | Medium    | X     | Y%         |
   | Low       | X     | Y%         |

   ### By Category
   | Category      | Count | Percentage |
   |---------------|-------|------------|
   | Bugs          | X     | Y%         |
   | Security      | X     | Y%         |
   | Performance   | X     | Y%         |
   | Quality       | X     | Y%         |
   | Architecture  | X     | Y%         |
   | Testing       | X     | Y%         |

   ## Critical Issues (Fix Immediately)

   ### Issue #001: [Title]
   **Severity:** Critical
   **Category:** [Bug/Security/etc.]
   **Location:** `[file/path.ext:line]`

   **Description:**
   [Clear explanation of the issue]

   **Impact:**
   [How this affects the system or users]

   **Suggested Solution:**
   [Concrete steps to fix]

   **Example Fix:**
   ```[language]
   // Before
   [problematic code]

   // After
   [fixed code]
   ```

   ---

   ## High Priority Issues

   [Same format as Critical]

   ## Medium Priority Issues

   [Same format]

   ## Low Priority Issues

   [Same format]

   ## Code Quality Recommendations

   ### Refactoring Opportunities
   - [location]: [recommendation]

   ### Tech Debt to Address
   - [description]: [impact and suggested timeline]

   ### Architecture Improvements
   - [improvement]: [rationale and benefits]

   ## Testing Gaps

   - [missing test coverage area]: [suggested tests]

   ## Long-Term Recommendations

   1. [Strategic recommendation with rationale]
   2. [Strategic recommendation with rationale]

   ## Action Items (Prioritized)

   ### Immediate (This Sprint)
   - [ ] Fix Issue #001 - [title]
   - [ ] Fix Issue #002 - [title]

   ### Short-Term (Next 2 Sprints)
   - [ ] Address Issue #005 - [title]
   - [ ] Implement [recommendation]

   ### Long-Term (Backlog)
   - [ ] Refactor [area]
   - [ ] Improve [aspect]

   ## Integration Instructions

   To integrate these findings into project tracking:

   1. **For Bugs**: Use /log-bug command for each bug found
   2. **For Tech Debt**: Add to atomic stories as technical debt UACs
   3. **For Architecture**: Create ADRs with /create-adr command
   4. **For Progress**: Update progress.md with blockers and tech debt status

   Example commands:
   ```
   /log-bug [Issue #001 description]
   /create-adr address-security-vulnerability-in-auth
   ```

   ---

   **Next review recommended:** [date 2-4 weeks from now]
   ```

7. Create Integration Guide
   Generate docs/code-reviews/[timestamp]-integration-guide.md

   Template:
   ```markdown
   # Code Review Integration Guide
   Generated from: [timestamp]-code-review.md

   ## Quick Stats
   - Total Issues: [X]
   - Bugs to Log: [Y]
   - Tech Debt Items: [Z]
   - ADRs to Create: [W]

   ## Bugs to Log with /log-bug

   1. **Issue #001**: [title]
      - Severity: [severity]
      - Location: [file:line]
      - Command: `/log-bug [description]`

   ## Tech Debt for Atomic Stories

   1. **[Tech debt item]**
      - Related Story: Story [XXX]
      - Add UAC: "Address [tech debt description]"
      - Priority: [High/Medium/Low]

   ## Recommended ADRs

   1. **[Decision title]**
      - Command: `/create-adr [purpose]`
      - Rationale: [why this decision is needed]

   ## Progress.md Updates

   Add to "Tech Debt" or "Blockers" section:
   - [Item from review that's blocking progress]
   ```

8. Extract Critical and High Issues
   Parse the review report for Critical (P0) and High (P1) severity issues

   For each issue, determine:
   - Bug (functional defect) → use /log-bug
   - Tech Debt (architectural/quality) → add to atomic stories
   - Security (vulnerability) → immediate action + ADR

9. Generate /log-bug Commands
   For each bug found, create command:
   ```
   /log-bug Issue #[XXX]: [title] - [brief description]
   ```

   List all commands in integration guide

10. Display Review Summary
    Show comprehensive summary:
    - Execution mode (manual/automated/peer-review)
    - Total issues found
    - Breakdown by severity (Critical, High, Medium, Low)
    - Breakdown by category (Bugs, Security, Performance, Quality, Architecture, Testing)
    - Report location
    - Integration guide location
    - Top 3 critical issues

    Recommended actions:
    1. Review full report
    2. Log critical bugs with /log-bug
    3. Create ADRs for architecture decisions
    4. Update atomic stories with tech debt
    5. Update progress.md with blockers

11. Optional: Commit to Git
    // Original: Uses AskUserQuestion tool
    // Antigravity: Decide manually whether to commit

    If committing to git:
    ```bash
    git add docs/code-reviews/[timestamp]-code-review.md docs/code-reviews/[timestamp]-integration-guide.md
    git commit -m "docs: add code review [timestamp]

- [X] total issues found
- [Y] critical/high priority
- Reviewed by: [reviewer names]
- Scope: [scope]
- Focus: [focus]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
    ```

12. Schedule Next Review
    Recommend scheduling follow-up review in 2-4 weeks
    Add to calendar or project management tool
    Track review cadence for continuous quality improvement
