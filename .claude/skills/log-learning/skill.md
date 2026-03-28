# Log Learning Command

Capture and document learnings from development, debugging, and implementations to prevent repeating mistakes and preserve organizational knowledge.

## Execution Steps

### Phase 1: Parse Learning Description

1. **Extract Learning Information**
   - Parse the command arguments to get learning description
   - Learning description should include:
     - Brief summary of what was learned (1-2 sentences)
     - Context: What was the situation?
     - Problem encountered (if applicable)
     - Solution or approach discovered
   - Examples:
     - "Fixed memory leak in WebSocket connections by properly closing event listeners"
     - "React Context optimization - learned to use useMemo for expensive calculations"
     - "Resolved Docker networking issue by configuring bridge network mode"

2. **Determine Domain Tags**
   - Use AskUserQuestion to ask user to select one or more domain tags:
     - **Options (multiSelect):**
       - Frontend (FE) - UI components, React, styling
       - Backend (BE) - APIs, services, business logic
       - DevOps - Infrastructure, CI/CD, deployment
       - Database (DB) - Schema, queries, migrations
       - Testing - Unit tests, E2E tests, test strategies
       - Design - UI/UX, design systems, accessibility
       - Architecture - System design, patterns, decisions
   - Allow multiple selections for cross-cutting learnings
   - At least one domain must be selected

3. **Generate Short Description for Filename**
   - Extract key concepts from learning description
   - Create brief slug (max 40 characters):
     - Convert to lowercase
     - Replace spaces with hyphens
     - Remove special characters
     - Trim to 40 characters
   - Examples:
     - "Fixed memory leak in WebSocket connections" → "websocket-memory-leak-fix"
     - "React Context optimization with useMemo" → "react-context-usememo-optimization"

### Phase 2: Generate Learning Document Structure

1. **Create Filename**
   - Get current date in YYYYMMDD format
   - Format: `{YYYYMMDD}-{domain}-{short-desc}.md`
   - If multiple domains, use primary domain (first selected)
   - Examples:
     - `20260226-fe-websocket-memory-leak-fix.md`
     - `20260226-be-api-error-handling-pattern.md`

2. **Assign Learning Number**
   - Use Glob to find all learning files in `docs/learnings/`
   - Count existing learning documents
   - Assign next sequential number: LEARN-001, LEARN-002, etc.
   - Use zero-padded 3 digits (LEARN-001 to LEARN-999)

3. **Generate Learning Document Content**
   - Create comprehensive learning document with all sections:
     ```markdown
     # Learning: {Title/Summary}

     **ID:** LEARN-{number}
     **Date:** {YYYY-MM-DD}
     **Domain:** {Primary Domain}, {Secondary Domains}
     **Tags:** {keyword1}, {keyword2}, {keyword3}

     ## Context

     {What was the situation? What were you working on?}

     ## Problem

     {What challenge did you face? What wasn't working?}

     ## Solution

     {How did you solve it? What approach did you take?}

     **Code Example:**
     ```{language}
     {Code snippet demonstrating the solution}
     ```

     ## Lessons Learned

     **Key Takeaways:**
     - {Lesson 1: What you learned}
     - {Lesson 2: What to do differently next time}
     - {Lesson 3: Best practices discovered}

     **Common Pitfalls to Avoid:**
     - {Pitfall 1}
     - {Pitfall 2}

     ## Related Documents

     - [ADR: {related ADR title}](../adr/{adr-filename}.md)
     - [Architecture Doc: {related doc}](../{doc-filename}.md)
     - [Story: {related story}](../200-atomic-stories-v{version}.md#story-{number})

     ## References

     - [Documentation/Article Title](https://example.com)
     - [Stack Overflow Discussion](https://stackoverflow.com/...)

     ## Follow-Up Actions

     - [ ] {Action item 1}
     - [ ] {Action item 2}

     ---

     **Keywords:** {comma-separated keywords for search}
     ```

4. **Extract Keywords for Search**
   - Analyze learning description to extract 5-10 keywords
   - Include:
     - Technology names (React, Docker, PostgreSQL)
     - Problem types (memory leak, performance, error handling)
     - Solution approaches (caching, optimization, refactoring)
   - Keywords will be used in README.md index for searchability
   - Examples:
     - "WebSocket, memory leak, React, useEffect, cleanup, event listeners"
     - "Docker, networking, bridge mode, container communication"

### Phase 3: Create Learning Document

1. **Create /learnings Directory**
   - Check if `docs/learnings/` directory exists
   - If not, create it using Bash: `mkdir -p docs/learnings`

2. **Write Learning Document**
   - Use Write tool to create learning file at:
     `docs/learnings/{YYYYMMDD}-{domain}-{short-desc}.md`
   - Ensure proper markdown formatting
   - Include all sections with content filled in from user input
   - Add placeholder text for sections not provided by user

3. **Prompt for Additional Details** (If needed)
   - If user provided minimal description:
     - Use AskUserQuestion to gather:
       - Problem details
       - Solution approach
       - Code snippets (optional)
       - Related documents (optional)
   - If user provided comprehensive description:
     - Proceed with auto-filled content

### Phase 4: Create or Update README.md Index

1. **Check if README.md Exists**
   - Check if `docs/learnings/000-README.md` exists
   - If not, create new README with structure

2. **Create README.md Structure** (if new)
   ```markdown
   # Learning Documentation Index

   Comprehensive knowledge base of learnings from development, debugging, and implementations.

   **Total Learnings:** {count}
   **Last Updated:** {YYYY-MM-DD}

   ---

   ## How to Use This Index

   - **Browse by Domain:** See learnings organized by area (Frontend, Backend, DevOps, etc.)
   - **Search by Keywords:** Use CMD+F to search for specific technologies or problems
   - **Browse by Date:** Most recent learnings appear first

   ---

   ## Learning Index

   ### {LEARN-XXX} - {Title}
   **Date:** {YYYY-MM-DD} | **Domain:** {Domains} | **File:** [{filename}](./{filename})

   **Abstract:**
   {1-2 sentence summary of what was learned}

   **Keywords:** {keyword1}, {keyword2}, {keyword3}, {keyword4}

   ---

   ## By Domain

   ### Frontend (FE)
   - [LEARN-XXX - {Title}](./{filename}) - {1-line summary}

   ### Backend (BE)
   - [LEARN-XXX - {Title}](./{filename}) - {1-line summary}

   ### DevOps
   - [LEARN-XXX - {Title}](./{filename}) - {1-line summary}

   ### Database (DB)
   - [LEARN-XXX - {Title}](./{filename}) - {1-line summary}

   ### Testing
   - [LEARN-XXX - {Title}](./{filename}) - {1-line summary}

   ### Design
   - [LEARN-XXX - {Title}](./{filename}) - {1-line summary}

   ### Architecture
   - [LEARN-XXX - {Title}](./{filename}) - {1-line summary}

   ---

   ## Statistics

   **By Domain:**
   - Frontend: {count}
   - Backend: {count}
   - DevOps: {count}
   - Database: {count}
   - Testing: {count}
   - Design: {count}
   - Architecture: {count}

   **Recent Activity:**
   - Last 7 days: {count} learnings
   - Last 30 days: {count} learnings

   ---

   **Generated:** {YYYY-MM-DD} via `/log-learning`
   ```

3. **Add New Learning to Index**
   - If README exists, read current content
   - Insert new learning entry at the top of "Learning Index" section
   - Format:
     ```markdown
     ### LEARN-XXX - {Title}
     **Date:** {YYYY-MM-DD} | **Domain:** {Domains} | **File:** [{filename}](./{filename})

     **Abstract:**
     {1-2 sentence summary}

     **Keywords:** {keyword1}, {keyword2}, {keyword3}

     ---
     ```

4. **Update Domain-Specific Lists**
   - Add learning to each relevant domain section
   - Format: `- [LEARN-XXX - {Title}](./{filename}) - {1-line summary}`
   - If learning has multiple domains, add to all relevant sections

5. **Update Statistics**
   - Increment total learning count
   - Update domain-specific counts
   - Update "Last Updated" date
   - Recalculate "Recent Activity" counts

6. **Write or Update README.md**
   - If new README: Use Write tool
   - If updating existing: Use Edit tool to update specific sections
   - Maintain alphabetical order within domain sections (optional)
   - Keep most recent learnings at the top of main index

### Phase 5: Integrate with Progress Tracking

1. **Find Latest Progress Document**
   - Use Glob to find latest progress doc: `docs/progress/000-progress-v*.md`
   - Read the current progress tracking document

2. **Check if Learnings Section Exists**
   - Search for "## Learnings Documentation" or "## Knowledge Base" section
   - If not found, create new section:
     ```markdown
     ## Learnings Documentation

     Track all documented learnings from development, debugging, and implementations.

     **Total Learnings:** {count}
     **Learning Index:** [docs/learnings/000-README.md](../learnings/000-README.md)

     ### Recent Learnings (Last 10)

     1. **LEARN-XXX** ({Date}) - {Title} - [{File}](../learnings/{filename})
     2. **LEARN-XXX** ({Date}) - {Title} - [{File}](../learnings/{filename})
     ```

3. **Add Learning Entry to Progress**
   - Add new learning to "Recent Learnings" list
   - Keep only last 10 learnings visible (remove oldest if >10)
   - Update total learnings count
   - Format:
     ```markdown
     1. **LEARN-{number}** ({YYYY-MM-DD}) - {Title} - [[File](../learnings/{filename})]
        - Domain: {Domains}
        - Keywords: {keyword1}, {keyword2}, {keyword3}
     ```

4. **Update Progress Document**
   - Use Edit tool to update learnings section
   - Maintain formatting consistency
   - Update "Last Updated" timestamp in progress doc

### Phase 6: Validate Learning Creation

1. **Verify Files Created**
   - ✅ Learning document exists: `docs/learnings/{filename}.md`
   - ✅ README.md exists: `docs/learnings/000-README.md`
   - ✅ Progress document updated

2. **Validate Learning Document Structure**
   - Read created learning document
   - Check all required sections present:
     - ✅ Title and ID
     - ✅ Date and Domain
     - ✅ Context section
     - ✅ Problem section
     - ✅ Solution section
     - ✅ Lessons Learned section
     - ✅ Keywords present

3. **Validate README.md**
   - Check learning is indexed
   - Verify keywords are searchable
   - Confirm domain lists updated
   - Verify statistics updated

4. **Generate Validation Report**
   - List all validations performed
   - Note any warnings or missing sections
   - Confirm learning is discoverable

### Phase 7: Optional Git Commit

1. **Prompt for Git Commit**
   - Use AskUserQuestion to ask:
     - "Would you like to commit this learning to git?"
     - Options: "Yes - commit now", "No - I'll commit manually"

2. **Create Git Commit** (if user confirms)
   - Stage all modified files:
     - Learning document
     - README.md
     - Progress document
   - Generate commit message:
     ```
     docs: log LEARN-{number} - {brief summary}

     Domain: {domains}
     Learning: {filename}

     - Created learning document in docs/learnings/
     - Updated learning index (README.md)
     - Updated progress tracking

     Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
     ```
   - Execute git commit using Bash
   - Display commit hash

3. **Handle Git Errors**
   - If commit fails:
     - Display error message
     - Suggest manual commit
     - Provide exact commit message
   - If not in git repo:
     - Skip commit
     - Note files were created successfully

### Phase 8: Generate Summary Report

1. **Collect Creation Details**
   - Learning ID (LEARN-XXX)
   - Domain tags
   - Filename
   - Keywords extracted
   - README.md update status
   - Progress tracking update status
   - Git commit status

2. **Display Comprehensive Summary**
   ```
   ✅ Learning documented successfully!

   📚 Learning Details:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ID:       LEARN-{number}
   Title:    {Learning title}
   Date:     {YYYY-MM-DD}
   Domain:   {Primary Domain}, {Secondary Domains}
   File:     docs/learnings/{filename}.md

   🔍 Searchable Keywords:
   {keyword1}, {keyword2}, {keyword3}, {keyword4}, {keyword5}

   📍 Documentation Updated:
   - ✅ Learning document created
   - ✅ Learning index (README.md) updated
   - ✅ Progress tracking updated
   - ✅ Domain-specific lists updated

   📊 Learning Statistics:
   - Total Learnings: {total}
   - Frontend: {fe_count}
   - Backend: {be_count}
   - DevOps: {devops_count}
   - Database: {db_count}
   - Testing: {test_count}
   - Design: {design_count}
   - Architecture: {arch_count}

   🎯 Next Steps:
   1. Review and refine the learning document if needed
   2. Add code snippets or examples for clarity
   3. Link related ADRs or architecture docs
   4. Reference this learning when onboarding new team members
   5. Search README.md by keywords to find related learnings

   💡 Search Tips:
   - Open docs/learnings/000-README.md
   - Use CMD+F to search by keyword, domain, or date
   - Browse "By Domain" sections for related learnings

   ✨ LEARN-{number} is now part of your knowledge base! ✨
   ```

3. **Provide Usage Suggestions**
   - How to search for learnings by keyword
   - How to reference this learning in other docs
   - How to use learnings during code reviews
   - How to share learnings with team

## Input Format

**Command:**
```
/log-learning {learning-description}
```

**Detailed Format:**
```
/log-learning {brief-summary}
Context: {what-was-the-situation}
Problem: {what-challenge-faced}
Solution: {how-solved-it}
```

**Examples:**
```
/log-learning Fixed memory leak in WebSocket connections by properly closing event listeners in React useEffect cleanup function

/log-learning React Context optimization - learned to use useMemo for expensive calculations to prevent unnecessary re-renders

/log-learning Resolved Docker networking issue by configuring bridge network mode instead of default host mode

/log-learning PostgreSQL query performance - adding composite index on (user_id, created_at) reduced query time from 2s to 50ms

/log-learning TypeScript generics pattern for API response typing - creates type-safe API client with minimal boilerplate
```

## Output Format

```
✅ Learning documented successfully!

📚 Learning Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID:       LEARN-042
Title:    Fixed WebSocket Memory Leak
Date:     2026-02-26
Domain:   Frontend, DevOps
File:     docs/learnings/20260226-fe-websocket-memory-leak-fix.md

🔍 Searchable Keywords:
WebSocket, memory leak, React, useEffect, cleanup, event listeners, production bug

📍 Documentation Updated:
- ✅ Learning document created (docs/learnings/20260226-fe-websocket-memory-leak-fix.md)
- ✅ Learning index updated (docs/learnings/000-README.md)
  - Added to main index at top
  - Added to Frontend section
  - Added to DevOps section
- ✅ Progress tracking updated (docs/progress/000-progress-v1.4.0.md)
  - Added to Recent Learnings list

📊 Learning Statistics:
- Total Learnings: 42
- Frontend: 15
- Backend: 12
- DevOps: 8
- Database: 5
- Testing: 4
- Design: 2
- Architecture: 3

🎯 Next Steps:
1. Review docs/learnings/20260226-fe-websocket-memory-leak-fix.md
2. Add code example showing before/after useEffect cleanup
3. Link related ADR if architectural decision was made
4. Reference during code reviews when reviewing WebSocket implementations
5. Search README.md for "memory leak" to find related learnings

💡 Search Tips:
- Open docs/learnings/000-README.md
- CMD+F: "memory leak" → Find related performance issues
- CMD+F: "WebSocket" → Find WebSocket-related learnings
- Browse Frontend section for all FE learnings

✅ Committed to git: 3 files updated (commit: abc123f)

✨ LEARN-042 is now part of your knowledge base! ✨
```

## Important Notes

- **Learning vs Bug:** This command is for documenting knowledge gained, not tracking bugs. Use `/log-bug` for bugs.
- **Multiple Domains:** Learnings can span multiple domains (e.g., FE + DevOps for deployment issues)
- **Keywords are Critical:** Good keywords make learnings discoverable months later
- **README.md is the Index:** Always check README.md first to search for existing learnings
- **Version Alignment:** Learnings are stored in `docs/learnings/` (not versioned like other docs)
- **Searchability:** The README.md index is optimized for CMD+F keyword search
- **Code Examples:** Including code snippets dramatically increases learning value
- **Related Documents:** Link ADRs, architecture docs, and stories for full context
- **Abstract Quality:** Write good 1-2 sentence abstracts for quick scanning
- **Progressive Enhancement:** Start with minimal learning, add details later
- **Team Knowledge:** Learnings prevent repeating mistakes across team members
- **Onboarding Value:** New team members learn from documented experiences

## Error Handling

**No Learning Description Provided:**
- Display error: "Please provide a learning description"
- Show usage: "/log-learning {what you learned}"
- Example: "/log-learning Fixed memory leak in WebSocket by using cleanup function"

**/learnings Directory Creation Failed:**
- Display error: "Could not create learnings directory: {error}"
- Check permissions
- Suggest manual directory creation: `mkdir -p docs/learnings`
- Abort learning creation

**Learning Document Write Failed:**
- Display error: "Could not write learning document: {error}"
- Check disk space and permissions
- Provide learning content for manual copy-paste
- Suggest manual file creation

**README.md Update Failed:**
- Complete learning document creation successfully
- Display warning: "Learning created but README.md update failed"
- Provide exact README.md entry to add manually:
  ```
  Add this entry to docs/learnings/000-README.md:

  ### LEARN-XXX - {Title}
  **Date:** {YYYY-MM-DD} | **Domain:** {Domains} | **File:** [{filename}](./{filename})

  **Abstract:** {summary}

  **Keywords:** {keywords}
  ```
- Note that learning is saved but not indexed

**Progress Document Not Found:**
- Display warning: "Progress document not found - skipping progress update"
- Complete learning creation successfully
- Suggest adding learning to progress manually
- Or run `/update-progress` after learning is created

**Domain Selection Error:**
- If user doesn't select any domain:
  - Display error: "At least one domain must be selected"
  - Re-prompt with AskUserQuestion
- If AskUserQuestion fails:
  - Default to "General" domain
  - Display warning: "Using default domain: General"

**Git Commit Failed:**
- Complete learning creation successfully
- Display warning: "Learning created but git commit failed: {error}"
- Provide commit message for manual commit:
  ```
  git add docs/learnings/
  git commit -m "docs: log LEARN-XXX - {title}

  Domain: {domains}

  Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
  ```

**Keyword Extraction Failed:**
- Use fallback keywords from learning title
- Display warning: "Using basic keywords from title"
- Suggest adding more keywords manually to learning document

**Duplicate Learning Detected:**
- Search README.md for similar keywords
- If potential duplicate found:
  - Display warning: "Similar learning may exist: LEARN-{number} - {title}"
  - Use AskUserQuestion:
    - "Log as new learning anyway?"
    - "Update existing learning?"
    - "Cancel - I'll check manually"
  - Handle based on user choice

## Success Criteria

The `/log-learning` command is successful when:
1. ✅ Learning description parsed and validated
2. ✅ Domain tags selected (at least one)
3. ✅ Keywords extracted for searchability
4. ✅ Learning ID assigned (LEARN-XXX)
5. ✅ Filename generated with date, domain, and description
6. ✅ Learning document created with all sections
7. ✅ README.md exists (created if new)
8. ✅ README.md updated with new learning entry
9. ✅ Domain-specific lists updated in README.md
10. ✅ Statistics updated in README.md
11. ✅ Progress document updated with recent learning
12. ✅ All files validated for structure
13. ✅ User receives comprehensive summary
14. ✅ Git commit created (if user confirmed)
15. ✅ Learning is discoverable via keyword search

## Future Enhancements

### v1.1.0
- Learning templates by domain (FE template, BE template, etc.)
- Automatic code snippet extraction from git diff
- Related learning suggestions (find similar learnings)
- Learning importance/impact rating

### v1.2.0
- Learning aging alerts (mark old learnings for review)
- Cross-reference learnings with bugs resolved
- Learning effectiveness tracking (how often referenced)
- Export learnings to different formats (Notion, Confluence)

### v1.3.0
- Team learning analytics (who documents most, what domains)
- Learning recommendation engine (suggest relevant learnings)
- Integration with code review comments
- Learning quiz generation for onboarding
