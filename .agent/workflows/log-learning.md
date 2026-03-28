---
description: Capture and document learnings with searchable knowledge base, domain tagging, and README.md index for easy discovery
---

// Note: This workflow requires manual domain selection (FE, BE, DevOps, DB, Testing, Design, Architecture)
// Original skill uses AskUserQuestion multiSelect - select domains manually before proceeding

1. Parse Learning Description and Extract Information
   Parse command arguments to get learning description
   Extract: summary, context, problem, solution
   Examples:
   - "Fixed WebSocket memory leak by closing event listeners"
   - "PostgreSQL composite index optimization"

2. Select Domain Tags (Manual)
   // Antigravity: Manually select one or more domains
   Choose from: Frontend, Backend, DevOps, Database, Testing, Design, Architecture
   At least one domain required
   Multiple selections allowed for cross-cutting learnings

3. Generate Filename and Learning ID
   Get current date: YYYYMMDD format
   Create short slug from description (max 40 chars, kebab-case)
   Format: {YYYYMMDD}-{domain}-{short-desc}.md
   Example: 20260226-fe-websocket-memory-leak-fix.md

   Count existing learnings in docs/learnings/
   Assign next sequential ID: LEARN-001, LEARN-002, etc.

4. Create Learning Document
   Create docs/learnings/ directory if doesn't exist:
   ```bash
   mkdir -p docs/learnings
   ```

   Write learning document with structure:
   - ID: LEARN-{number}
   - Date, Domain, Tags
   - Context section
   - Problem section
   - Solution section (with code example)
   - Lessons Learned
   - Related Documents (ADRs, stories, architecture docs)
   - References
   - Follow-up Actions
   - Keywords for search

5. Create or Update README.md Index
   Check if docs/learnings/000-README.md exists

   If new, create README with:
   - Total learnings count
   - Learning Index (newest first)
   - By Domain sections (FE, BE, DevOps, DB, Testing, Design, Architecture)
   - Statistics (count by domain, recent activity)

   Add new learning entry:
   - Title with ID and date
   - 1-2 sentence abstract
   - Keywords for searchability
   - Link to learning file

   Update domain-specific lists
   Update statistics

6. Update Progress Tracking (Optional)
   Find latest progress doc: docs/progress/000-progress-v*.md

   Locate or create "Learnings Documentation" section
   Add learning to "Recent Learnings" list (keep last 10)
   Update total learnings count

7. Validate Learning Creation
   Verify files created:
   - ✅ Learning document exists
   - ✅ README.md exists and updated
   - ✅ All required sections present
   - ✅ Keywords present for search

8. Display Summary
   Show:
   - Learning ID (LEARN-XXX)
   - Domain tags
   - Filename
   - Keywords extracted
   - README.md update status
   - Progress tracking status
   - Total learnings count
   - Statistics by domain

   Next Steps:
   1. Review and refine learning document
   2. Add code snippets for clarity
   3. Link related ADRs or architecture docs
   4. Search README.md by keywords (CMD+F)
   5. Reference during code reviews

   Search Tips:
   - Open docs/learnings/000-README.md
   - CMD+F to search by keyword, domain, or date
   - Browse "By Domain" sections

9. Optional Git Commit
   Stage files:
   - docs/learnings/{filename}.md
   - docs/learnings/000-README.md
   - docs/progress/000-progress-v*.md

   Commit message:
   ```
   docs: log LEARN-{number} - {brief summary}

   Domain: {domains}
   Learning: {filename}

   - Created learning document
   - Updated learning index
   - Updated progress tracking

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
   ```

// IMPORTANT NOTES:
// - Domain selection is manual (no AskUserQuestion in Antigravity)
// - README.md is the search index - use CMD+F for keywords
// - Keywords are critical for discoverability
// - Link ADRs and related docs for full context
// - Learning vs Bug: Use /log-bug for bugs, /log-learning for knowledge

// EXAMPLE USAGE:
// /log-learning Fixed memory leak in WebSocket connections by properly closing event listeners in React useEffect cleanup function

// EXPECTED OUTPUT:
// - File: docs/learnings/20260226-fe-websocket-memory-leak-fix.md
// - ID: LEARN-042
// - README.md updated with entry and keywords
// - Searchable by: WebSocket, memory leak, React, useEffect, cleanup
