# Code Review Command

Trigger comprehensive code review of the codebase using subagents or AI dev personas, generating structured reports that can be integrated into atomic stories as bugs or tech debt.

## Execution Steps

### Phase 1: Parse Input and Detect Review Configuration

1. **Extract Command Options**
   - Check for `--agents` flag with persona names
   - Parse agent list if provided:
     - Format: `--agents persona1,persona2,persona3`
     - Examples:
       - `--agents pixel-perfectionist`
       - `--agents pixel-perfectionist,the-regressor,the-bloodhound`
   - Store as `requested_personas[]`

2. **Check for Scope Options** (optional)
   - Check for `--scope` flag to limit review:
     - `--scope frontend` - Review only frontend code
     - `--scope backend` - Review only backend code
     - `--scope tests` - Review only test files
     - `--scope all` - Review entire codebase (default)
   - If not specified, default to `all`

3. **Check for Focus Options** (optional)
   - Check for `--focus` flag to emphasize specific aspects:
     - `--focus security` - Security vulnerabilities
     - `--focus performance` - Performance issues
     - `--focus quality` - Code quality and maintainability
     - `--focus architecture` - Architectural patterns
     - `--focus all` - All aspects (default)
   - If not specified, default to `all`

4. **Validate Persona Names** (if --agents provided)
   - Use Glob to find available personas: `ai-dev-persona/*/metadata.json`
   - For each requested persona:
     - Check if it exists in available personas
     - If persona not found:
       - Display warning: "Persona '{name}' not found"
       - List available personas
       - Ask if user wants to continue without that persona
   - Remove invalid personas from `requested_personas[]`

### Phase 2: Determine Review Execution Mode

1. **Check Agent Team Availability**
   - Read Claude Code settings from `.claude/settings.json`
   - Check if `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` is enabled
   - Store as `agent_teams_enabled` (boolean)

2. **Determine Execution Strategy**
   - Based on configuration and availability, choose mode:

   **Mode A: Agent Team Collaboration** (if agent teams enabled AND --agents specified)
   - Multiple personas collaborate in real-time
   - Personas can message each other directly
   - Shared task list for coordination
   - Best for: Complex, multi-faceted reviews
   - Status: Set `execution_mode = "agent_team"`

   **Mode B: Parallel Subagent Tasks** (if agent teams NOT enabled BUT --agents specified)
   - Launch multiple subagents in parallel
   - Each persona reviews independently
   - Results aggregated by main agent
   - Best for: Faster reviews with multiple perspectives
   - Status: Set `execution_mode = "parallel_tasks"`

   **Mode C: Sequential Persona Reviews** (if agent teams not available and fallback needed)
   - Run reviews with each persona sequentially
   - One at a time, load persona context
   - Aggregate results after all complete
   - Best for: Resource-constrained environments
   - Status: Set `execution_mode = "sequential"`

   **Mode D: Single General Review** (if no --agents specified)
   - Use general-purpose subagent for review
   - No persona specialization
   - Standard comprehensive code review
   - Best for: Quick, general reviews
   - Status: Set `execution_mode = "general"`

3. **Display Execution Plan**
   ```
   🔍 Code Review Configuration:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Scope:           {all / frontend / backend / tests}
   Focus:           {all / security / performance / quality / architecture}
   Execution Mode:  {agent_team / parallel_tasks / sequential / general}
   Personas:        {persona1, persona2, persona3} or "General Review"

   Starting code review...
   ```

### Phase 3: Prepare Review Context

1. **Create Code Reviews Directory**
   - Use Bash to check if `docs/code-reviews/` exists
   - If not exists, create directory: `mkdir -p docs/code-reviews/`
   - Verify creation successful

2. **Generate Review Filename**
   - Get current timestamp in format: `YYmmddHHMM`
   - Example: `260225-1445` for 2026-02-25 at 14:45
   - Create filename: `{timestamp}-code-review.md`
   - Full path: `docs/code-reviews/{timestamp}-code-review.md`
   - Store as `review_file_path`

3. **Prepare Review Instructions**
   - Create detailed review instructions for subagents/personas:
     ```
     TASK: Comprehensive Code Review

     SCOPE: {all / frontend / backend / tests}
     FOCUS: {all / security / performance / quality / architecture}

     INSTRUCTIONS:
     1. Analyze the codebase thoroughly
     2. Identify issues in these categories:
        - Bugs: Actual code defects
        - Security: Vulnerabilities and security issues
        - Performance: Performance bottlenecks
        - Quality: Code quality issues (readability, maintainability)
        - Architecture: Architectural concerns and tech debt
        - Testing: Missing or inadequate tests

     3. For EACH issue found:
        - Severity: Critical / High / Medium / Low
        - Category: Bug / Security / Performance / Quality / Architecture / Testing
        - Location: File path and line numbers
        - Description: Clear explanation of the issue
        - Impact: How this affects users or developers
        - Suggested Solution: Concrete steps to fix (not just "improve this")
        - Example Fix: Code snippet showing how to fix (if applicable)

     4. Prioritize issues by severity
     5. Group related issues together
     6. Provide actionable recommendations

     OUTPUT FORMAT:
     Generate a structured markdown report with:
     - Executive Summary
     - Statistics (total issues, breakdown by severity/category)
     - Detailed findings (grouped by category)
     - Prioritized action items
     - Long-term recommendations
     ```

4. **Load Persona Contexts** (if personas specified)
   - For each persona in `requested_personas[]`:
     - Read `ai-dev-persona/{name}/{name}.md`
     - Extract persona's full system prompt
     - Store as `persona_contexts[name]`
   - These will be injected into subagent/task prompts

### Phase 4: Execute Code Review (Based on Mode)

#### Mode A: Agent Team Collaboration

1. **Launch Agent Team**
   - Use Task tool with agent team support
   - Create team with all specified personas
   - Example prompt:
     ```
     Create an agent team to perform comprehensive code review.

     Spawn {N} teammates:
     - {persona1 display name}: {persona1 focus areas}
     - {persona2 display name}: {persona2 focus areas}
     - {persona3 display name}: {persona3 focus areas}

     Each teammate should:
     1. Review codebase from their expertise perspective
     2. Share findings with team
     3. Discuss and prioritize issues together
     4. Collaborate on creating unified review report

     {Review instructions from Phase 3}

     Coordinate through shared task list.
     Generate report at: {review_file_path}
     ```

2. **Inject Persona Contexts**
   - For each teammate, provide their persona context
   - This makes them embody the persona during review

3. **Monitor Team Progress**
   - Display: "Agent team reviewing codebase..."
   - Show progress updates if available
   - Wait for team to complete review

4. **Retrieve Team Results**
   - Once complete, read generated report from `review_file_path`
   - Store as `review_report`

#### Mode B: Parallel Subagent Tasks

1. **Launch Multiple Subagents in Parallel**
   - For each persona in `requested_personas[]`:
     - Create Task tool call for that persona
     - Inject persona context into prompt
     - Example prompt for each:
       ```
       You are {persona display name}.

       {Persona full system prompt}

       TASK: Review the codebase from your perspective ({focus areas}).

       {Review instructions from Phase 3}

       Focus on areas where your expertise is most valuable.
       Generate your findings as structured markdown.
       ```

2. **Launch All Tasks in Single Message**
   - Send one message with multiple Task tool calls
   - Example: 3 personas = 3 parallel Task calls in one message
   - Each task runs simultaneously

3. **Collect Results from All Subagents**
   - Wait for all tasks to complete
   - Read results from each subagent
   - Store as `persona_reviews[persona_name] = review_content`

4. **Aggregate Findings**
   - Combine all persona reviews into unified report
   - Group issues by category
   - Deduplicate similar issues
   - Preserve unique insights from each persona
   - Generate statistics across all reviews

#### Mode C: Sequential Persona Reviews

1. **Review with Each Persona Sequentially**
   - For each persona in `requested_personas[]`:
     - Load persona context
     - Display: "Reviewing as {persona display name}..."
     - Use Task tool to launch subagent with persona context
     - Example prompt:
       ```
       You are {persona display name}.

       {Persona full system prompt}

       TASK: Review the codebase from your perspective.

       {Review instructions from Phase 3}
       ```
     - Wait for subagent to complete
     - Read results
     - Store as `persona_reviews[persona_name]`

2. **Aggregate Results After All Complete**
   - Same aggregation logic as Mode B
   - Combine all sequential reviews into unified report

#### Mode D: Single General Review

1. **Launch General-Purpose Code Review Subagent**
   - Use Task tool with `subagent_type = "general-purpose"`
   - Prompt:
     ```
     TASK: Comprehensive code review of the entire codebase.

     {Review instructions from Phase 3}

     Generate detailed report at: {review_file_path}
     ```

2. **Wait for Completion**
   - Display: "Performing general code review..."
   - Wait for subagent to finish

3. **Retrieve Results**
   - Read generated report from `review_file_path`
   - Store as `review_report`

### Phase 5: Generate or Enhance Review Report

1. **Check if Report Already Generated**
   - If Mode A or D: Report should already exist at `review_file_path`
   - If Mode B or C: Need to aggregate and generate report

2. **Aggregate Multi-Persona Reviews** (for Mode B and C)
   - Combine all `persona_reviews[]` into unified structure:
     ```markdown
     # Code Review Report
     Generated: {timestamp}
     Reviewers: {persona1, persona2, persona3}
     Scope: {scope}
     Focus: {focus}

     ## Executive Summary

     This code review was conducted by {N} specialized reviewers:
     - {persona1}: {their key findings summary}
     - {persona2}: {their key findings summary}
     - {persona3}: {their key findings summary}

     Total issues found: {X}
     - Critical: {count}
     - High: {count}
     - Medium: {count}
     - Low: {count}

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

     ### Issue #001: {Title}
     **Severity:** Critical
     **Category:** {Bug/Security/etc.}
     **Location:** `{file/path.ext:line}`
     **Identified by:** {persona name}

     **Description:**
     {Clear explanation of the issue}

     **Impact:**
     {How this affects the system or users}

     **Suggested Solution:**
     {Concrete steps to fix}

     **Example Fix:**
     ```{language}
     // Before
     {problematic code}

     // After
     {fixed code}
     ```

     ---

     ## High Priority Issues

     {Same format as Critical}

     ## Medium Priority Issues

     {Same format}

     ## Low Priority Issues

     {Same format}

     ## Code Quality Recommendations

     ### Refactoring Opportunities
     - {location}: {recommendation}

     ### Tech Debt to Address
     - {description}: {impact and suggested timeline}

     ### Architecture Improvements
     - {improvement}: {rationale and benefits}

     ## Testing Gaps

     - {missing test coverage area}: {suggested tests}

     ## Long-Term Recommendations

     1. {Strategic recommendation with rationale}
     2. {Strategic recommendation with rationale}

     ## Persona-Specific Insights

     ### {Persona 1 Name}
     {Their unique perspective and specialized findings}

     ### {Persona 2 Name}
     {Their unique perspective and specialized findings}

     ## Action Items (Prioritized)

     ### Immediate (This Sprint)
     - [ ] Fix Issue #001 - {title}
     - [ ] Fix Issue #002 - {title}

     ### Short-Term (Next 2 Sprints)
     - [ ] Address Issue #005 - {title}
     - [ ] Implement {recommendation}

     ### Long-Term (Backlog)
     - [ ] Refactor {area}
     - [ ] Improve {aspect}

     ## Integration Instructions

     To integrate these findings into project tracking:

     1. **For Bugs**: Use `/log-bug {description}` for each bug found
     2. **For Tech Debt**: Add to atomic stories as technical debt UACs
     3. **For Architecture**: Create ADRs with `/create-adr {decision}`
     4. **For Progress**: Update progress.md with blockers and tech debt status

     Example commands:
     ```
     /log-bug {Issue #001 description}
     /create-adr address-security-vulnerability-in-auth
     ```

     ---

     **Report generated by:** {execution_mode} | {persona names or "General Review"}
     **Total review time:** {duration if available}
     **Next review recommended:** {date 2-4 weeks from now}
     ```

3. **Write Aggregated Report to File**
   - Use Write tool to create `docs/code-reviews/{timestamp}-code-review.md`
   - Include all aggregated content
   - Format with proper markdown
   - Ensure readability and structure

4. **Enhance Report with Metadata**
   - Add frontmatter for easy parsing:
     ```yaml
     ---
     review_date: {YYYY-MM-DD}
     reviewers: [{persona1}, {persona2}]
     scope: {scope}
     focus: {focus}
     execution_mode: {mode}
     total_issues: {count}
     critical_issues: {count}
     high_issues: {count}
     medium_issues: {count}
     low_issues: {count}
     ---
     ```

### Phase 6: Extract Bugs and Tech Debt for Integration

1. **Parse Critical and High Issues**
   - Extract all Critical and High severity issues from report
   - For each issue, determine if it's:
     - **Bug**: Functional defect → candidate for `/log-bug`
     - **Tech Debt**: Architectural/quality issue → candidate for atomic stories
     - **Security**: Vulnerability → candidate for immediate action + ADR

2. **Generate Integration Commands**
   - Create list of recommended commands to run:
     ```
     Suggested integration commands:

     # Bugs (High/Critical severity)
     /log-bug Issue #001: {title} - {brief description}
     /log-bug Issue #003: {title} - {brief description}

     # Architecture Decisions
     /create-adr {decision based on finding}

     # Tech Debt (add to atomic stories manually or via future /log-tech-debt)
     - Add UAC to Story XXX: {tech debt item}
     ```

3. **Create Quick Reference Summary File**
   - Generate `docs/code-reviews/{timestamp}-integration-guide.md`:
     ```markdown
     # Code Review Integration Guide
     Generated from: {timestamp}-code-review.md

     ## Quick Stats
     - Total Issues: {X}
     - Bugs to Log: {Y}
     - Tech Debt Items: {Z}
     - ADRs to Create: {W}

     ## Bugs to Log with /log-bug

     1. **Issue #001**: {title}
        - Severity: {severity}
        - Location: {file:line}
        - Command: `/log-bug {description}`

     ## Tech Debt for Atomic Stories

     1. **{Tech debt item}**
        - Related Story: Story {XXX}
        - Add UAC: "Address {tech debt description}"
        - Priority: {High/Medium/Low}

     ## Recommended ADRs

     1. **{Decision title}**
        - Command: `/create-adr {purpose}`
        - Rationale: {why this decision is needed}

     ## Progress.md Updates

     Add to "Tech Debt" or "Blockers" section:
     - {Item from review that's blocking progress}
     ```

### Phase 7: Display Summary and Next Steps

1. **Collect Review Metadata**
   - Execution mode used
   - Personas involved (if any)
   - Total issues found
   - Breakdown by severity
   - Report file location
   - Integration guide location

2. **Display Comprehensive Summary**
   ```
   ✅ Code review completed successfully!

   📋 Review Details:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Execution Mode:  {Agent Team / Parallel Tasks / Sequential / General}
   Reviewers:       {persona1, persona2, persona3} or "General Review"
   Scope:           {all / frontend / backend / tests}
   Focus:           {all / security / performance / quality / architecture}
   Report:          docs/code-reviews/{timestamp}-code-review.md

   📊 Findings Summary:
   Total Issues:    {X}
   - 🔴 Critical:   {count} (Fix immediately)
   - 🟠 High:       {count} (Fix this sprint)
   - 🟡 Medium:     {count} (Fix soon)
   - 🟢 Low:        {count} (Backlog)

   📁 Files Created:
   - docs/code-reviews/{timestamp}-code-review.md (Full report)
   - docs/code-reviews/{timestamp}-integration-guide.md (Quick reference)

   🎯 Top 3 Critical Issues:
   1. Issue #001: {title} ({file:line})
   2. Issue #002: {title} ({file:line})
   3. Issue #003: {title} ({file:line})

   🔧 Recommended Actions:
   1. Review full report: docs/code-reviews/{timestamp}-code-review.md
   2. Log critical bugs:
      /log-bug {Issue #001 description}
   3. Create architectural decisions:
      /create-adr {decision purpose}
   4. Update atomic stories with tech debt UACs
   5. Update progress.md with blockers

   💡 Integration Tips:
   - Use integration guide for quick reference
   - Prioritize Critical and High issues for current sprint
   - Add Medium/Low issues to backlog
   - Schedule follow-up review in 2-4 weeks

   📚 Documentation:
   - Full report: docs/code-reviews/{timestamp}-code-review.md
   - Integration guide: docs/code-reviews/{timestamp}-integration-guide.md

   ✨ Code review complete! Time to improve the codebase! ✨
   ```

3. **Provide Mode-Specific Insights**
   - **Agent Team**: "Personas collaborated in real-time for comprehensive review"
   - **Parallel Tasks**: "{N} personas reviewed simultaneously, results aggregated"
   - **Sequential**: "Each persona provided focused review from their expertise"
   - **General**: "Comprehensive general review completed"

### Phase 8: Optional Git Commit

1. **Ask User About Committing Review**
   - Use AskUserQuestion:
     ```
     Question: "Would you like to commit the code review report to git?"
     Options:
       - "Yes - Commit review report"
       - "No - I'll commit manually"
     ```

2. **Commit Review Files** (if confirmed)
   - Stage review files:
     - `docs/code-reviews/{timestamp}-code-review.md`
     - `docs/code-reviews/{timestamp}-integration-guide.md`
   - Create commit:
     ```
     docs: add code review {timestamp}

     - {X} total issues found
     - {Y} critical/high priority
     - Reviewed by: {persona names or "general review"}
     - Scope: {scope}
     - Focus: {focus}

     Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
     ```
   - Execute git commit using Bash
   - Confirm success

3. **Handle Git Errors**
   - If commit fails:
     - Display error
     - Suggest manual commit
     - Provide commit message to use

## Input Format

**Command:**
```
/code-review
```

**With Personas:**
```
/code-review --agents {persona1},{persona2},{persona3}
```

**With Scope and Focus:**
```
/code-review --scope {all|frontend|backend|tests} --focus {all|security|performance|quality|architecture}
```

**Full Example:**
```
/code-review --agents pixel-perfectionist,the-regressor,the-bloodhound --scope all --focus security
```

**Examples:**
```
/code-review
(General code review of entire codebase)

/code-review --agents pixel-perfectionist
(Frontend-focused review with Pixel Perfectionist persona)

/code-review --agents the-regressor,the-bloodhound
(Architecture + security review with multiple personas)

/code-review --scope frontend --focus quality
(Frontend code quality review)

/code-review --agents pixel-perfectionist,the-regressor --scope all --focus all
(Comprehensive multi-persona review)
```

## Output Format

```
✅ Code review completed successfully!

📋 Review Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Execution Mode:  Agent Team Collaboration
Reviewers:       Pixel Perfectionist, The Regressor, The Bloodhound
Scope:           All (frontend, backend, tests, infrastructure)
Focus:           All aspects
Report:          docs/code-reviews/260225-1445-code-review.md

📊 Findings Summary:
Total Issues:    47
- 🔴 Critical:   3 (Fix immediately)
- 🟠 High:       12 (Fix this sprint)
- 🟡 Medium:     21 (Fix soon)
- 🟢 Low:        11 (Backlog)

📁 Files Created:
- docs/code-reviews/260225-1445-code-review.md (Full report, 847 lines)
- docs/code-reviews/260225-1445-integration-guide.md (Quick reference, 142 lines)

🎯 Top 3 Critical Issues:
1. Issue #001: SQL Injection vulnerability in user search (backend/src/auth/search.ts:45)
2. Issue #002: Memory leak in WebSocket handler (backend/src/ws/handler.ts:89)
3. Issue #003: Unauthenticated API endpoint exposing user data (backend/src/api/users.ts:23)

🔧 Recommended Actions:
1. Review full report: docs/code-reviews/260225-1445-code-review.md
2. Log critical bugs:
   /log-bug SQL injection vulnerability in user search endpoint
   /log-bug Memory leak in WebSocket connection handler
   /log-bug Unauthenticated endpoint exposing user data
3. Create architectural decisions:
   /create-adr implement-input-sanitization-standard
   /create-adr websocket-connection-lifecycle-management
4. Update atomic stories:
   - Add security UACs to authentication stories
   - Add performance UACs to real-time feature stories
5. Update progress.md:
   - Add "Security Vulnerabilities" blocker section
   - Mark affected features as "Needs Security Review"

💡 Integration Tips:
- Use integration guide for quick reference
- Prioritize 3 Critical issues for immediate hotfix
- Schedule 12 High issues for current sprint
- Add Medium/Low issues to backlog
- Follow up with security-focused review in 1 week

🤝 Reviewer Contributions:
- **Pixel Perfectionist**: Found 15 UI/UX issues, accessibility gaps
- **The Regressor**: Identified 18 architectural risks, tech debt patterns
- **The Bloodhound**: Discovered 3 critical security vulnerabilities, 9 performance issues

📚 Documentation:
- Full report: docs/code-reviews/260225-1445-code-review.md
- Integration guide: docs/code-reviews/260225-1445-integration-guide.md
- Next review: Recommended in 2-4 weeks (2026-03-11 to 2026-03-25)

✅ Committed to git: docs/code-reviews/260225-1445-*.md

✨ Code review complete! Time to improve the codebase! ✨
```

## Important Notes

- **Execution Modes**: The skill intelligently adapts based on available features (agent teams) and user preferences (personas)
- **Agent Team Priority**: If agent teams are enabled and personas specified, uses collaborative mode for best results
- **Graceful Degradation**: Falls back to parallel tasks, then sequential, ensuring review always completes
- **Persona Integration**: Leverages existing AI dev personas for specialized reviews
- **Actionable Output**: Every issue includes concrete solution, not just problem identification
- **Integration Ready**: Reports formatted for easy integration into `/log-bug` and atomic stories
- **Timestamp Format**: `YYmmddHHMM` ensures chronological sorting and uniqueness
- **Comprehensive Coverage**: Reviews code quality, security, performance, architecture, and testing
- **Severity-Based Prioritization**: Critical and High issues flagged for immediate action
- **Multi-Perspective**: Multiple personas provide diverse viewpoints (frontend, backend, security, architecture)
- **Version Control**: Optional git commit to track review history
- **Deduplication**: When multiple personas find same issue, aggregates into single entry with multiple confirmations

## Error Handling

**No Codebase Found:**
- Display error: "No code files found to review"
- Suggest: "Ensure you're in the correct project directory"
- Check: Is this a documentation-only repo?

**Code Reviews Directory Creation Failed:**
- Display error: "Could not create docs/code-reviews/ directory"
- Check permissions
- Suggest manual directory creation: `mkdir -p docs/code-reviews/`
- Abort review

**Persona Not Found:**
- If `--agents` specifies invalid persona:
  - Display warning: "Persona '{name}' not found"
  - List available personas from `ai-dev-persona/`
  - Ask: "Continue without this persona? Or cancel?"
  - Remove invalid persona and continue if confirmed

**Agent Teams Not Enabled:**
- If `--agents` specified but agent teams not available:
  - Display info: "Agent teams not enabled, using parallel tasks mode"
  - Fall back to Mode B (parallel tasks)
  - Continue with degraded but functional mode

**Task Tool Not Available:**
- If Task tool fails:
  - Fall back to sequential persona reviews (Mode C)
  - Display info: "Using sequential review mode"
  - Continue with each persona one at a time

**Subagent Review Failed:**
- If a subagent/persona review fails:
  - Display warning: "Review by {persona} failed: {error}"
  - Continue with other personas
  - Note failure in final report
  - Ensure review completes with available results

**Report Write Failed:**
- Display error: "Could not write review report: {error}"
- Check disk space and permissions
- Provide report content as text output
- Suggest manual file creation

**Git Commit Failed:**
- Complete review successfully
- Display warning: "Review complete but git commit failed: {error}"
- Suggest manual commit with provided message
- Confirm report files created

**No Issues Found:**
- This is success, not error!
- Display: "🎉 No issues found! Codebase is in excellent shape."
- Still generate report documenting the clean review
- Recommend periodic reviews to maintain quality

## Success Criteria

The `/code-review` command is successful when:
1. ✅ Command options parsed correctly
2. ✅ Execution mode determined (agent team / parallel / sequential / general)
3. ✅ Personas loaded (if specified) or general review configured
4. ✅ Code reviews directory created
5. ✅ Review timestamp generated
6. ✅ Code review executed via subagents/personas
7. ✅ Issues identified with severity, category, location
8. ✅ Solutions provided for each issue (not just problems)
9. ✅ Report aggregated from all reviewers (if multiple)
10. ✅ Report written to `docs/code-reviews/{timestamp}-code-review.md`
11. ✅ Integration guide created
12. ✅ Statistics calculated (total, by severity, by category)
13. ✅ Actionable recommendations provided
14. ✅ User receives comprehensive summary
15. ✅ Files committed to git (if confirmed)
16. ✅ Report is readable and integration-ready

## Future Enhancements

### v1.1.0
- **Incremental Reviews**: Review only changed files since last review
- **Diff-Based Reviews**: Compare against specific git commit or branch
- **Custom Review Templates**: User-defined review focus areas
- **Auto-Fix Suggestions**: AI-generated patches for simple issues

### v1.2.0
- **Automated Bug Logging**: Automatically run `/log-bug` for critical issues
- **PR Review Mode**: Review specific pull request
- **Continuous Monitoring**: Schedule periodic automated reviews
- **Trend Analysis**: Compare review metrics over time

### v1.3.0
- **IDE Integration**: Generate IDE-compatible issue markers (ESLint, etc.)
- **Security Scanning**: Integration with SAST tools (Snyk, SonarQube)
- **Performance Profiling**: Include runtime profiling data
- **Compliance Checking**: Verify against coding standards and regulations
