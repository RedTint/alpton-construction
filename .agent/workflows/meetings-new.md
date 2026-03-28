---
description: Create structured meeting notes with automatic template generation, sequential numbering, and index updates
---

1. Parse Input and Validate Type Code
   Extract type code parameter (e.g., spr, cls, ard, 1on, stk, all)

   // Note: Manual user input required
   If type code not provided, ask user: "What type of meeting is this?"
   Options: Sprint Planning (spr), Client Sync (cls), Architecture Review (ard), One-on-One (1on), Stakeholder Review (stk), All Hands (all), or custom

   Validate type code format:
   - Must be 3 characters
   - Lowercase alphanumeric only
   - No special characters

2. Determine Sequential Number and Filename
   Check if directory exists:
   Run: ls -d ./meetings/{type_code} 2>/dev/null || echo "Will create"

   Find existing meeting notes:
   Find files matching pattern: ./meetings/{type_code}/*.md
   Exclude: 000-README.md and 000-SUMMARY.md

   Calculate next sequential number:
   - If no files: use 001
   - If files exist: extract first 3 digits, find max, increment, pad to 3 digits

   Generate datetime stamp:
   Run: date +"%Y%m%d-%H%M"
   Format: YYYYMMDD-HHii (e.g., 20260312-0930)

   // Note: Manual user input required
   Ask user: "Enter a short description for this meeting (2-5 words, kebab-case)"
   Examples: sprint-12-planning, q2-roadmap-review, architecture-deep-dive
   Convert to kebab-case (lowercase, hyphens only, max 50 chars)

   Construct filename: {###}-{YYYYMMDD-HHii}-{short-desc}.md
   Example: 001-20260312-0930-sprint-12-planning.md

3. Gather Meeting Metadata
   // Note: Manual user input required for all metadata

   Ask: "Enter meeting date and time (YYYY-MM-DD HH:MM)"
   Default: current datetime from step 2

   Ask: "Enter meeting attendees (comma-separated names)"
   Example: Alex Chen, Jordan Smith, Casey Williams

   Ask: "Enter meeting duration in minutes"
   Default: 60

   Ask: "Enter names of expected attendees who were absent (optional)"
   Can be left empty

   Map type code to readable label:
   - spr → Sprint Planning
   - cls → Client Sync
   - ard → Architecture Review
   - 1on → One-on-One
   - stk → Stakeholder Review
   - all → All Hands
   - Custom → use original description

4. Generate Meeting Note Template
   Create meeting title from short description (capitalize words)
   Example: "sprint-12-planning" → "Sprint 12 Planning"

   Generate template content:
   ```
   # {Meeting Title}

   **Date:** {YYYY-MM-DD HH:MM}
   **Type:** {Meeting Type Label} ({type_code})
   **Attendees:** {Comma-separated list}
   **Duration:** {N} minutes
   **Absent:** {Absent attendees or "None"}

   ---

   ## ACTION ITEMS

   1. **{Action description}** — Assignee: {name}, Due: {YYYY-MM-DD}, Status: Open

   ---

   ## DECISIONS

   1. **{Decision title}**
      - Rationale: {Why this decision was made}
      - Impact: {What this affects}
      - Alternatives Considered: {What else was considered}

   ---

   ## DISCUSSION POINTS

   ### {Topic 1}

   {Discussion summary}

   ---

   ## NEXT STEPS

   - {Next step 1}
   - {Next step 2}

   ---

   **Notes:**
   - {Additional context or follow-up items}
   ```

5. Create Directory and Write Meeting Note
   Create directory structure:
   Run: mkdir -p ./meetings/{type_code}

   Write meeting note file to: ./meetings/{type_code}/{filename}
   Content: Generated template from step 4

   Verify file creation:
   Run: ls -lh ./meetings/{type_code}/{filename}

6. Update or Create README Index
   Check if README exists:
   Read file: ./meetings/{type_code}/000-README.md (if exists)

   Generate meeting abstract:
   ```
   ### {###} - {Meeting Title}
   **Date:** {YYYY-MM-DD HH:MM}
   **Attendees:** {Names or "N attendees" if many}
   **File:** [{filename}](./{filename})
   ```

   If README doesn't exist, create with:
   ```
   # Meeting Notes Index - {Meeting Type Label}

   **Type Code:** {type_code}
   **Total Meetings:** {N}
   **Last Updated:** {YYYY-MM-DD HH:MM}

   ---

   ## Meetings (Reverse Chronological Order)

   {Meeting abstracts listed newest first}

   ---

   **Index automatically updated by /meetings-new command**
   ```

   If README exists:
   - Parse current "Total Meetings" count and increment
   - Update "Last Updated" timestamp
   - Insert new meeting abstract at top
   - Preserve all existing entries

   Write or update README file at: ./meetings/{type_code}/000-README.md

7. Generate Summary Report
   Display comprehensive summary:
   ```
   ✅ Meeting note created successfully!

   📝 Meeting Details:
   Title:       {Meeting Title}
   Type:        {Meeting Type Label} ({type_code})
   Date:        {YYYY-MM-DD HH:MM}
   Duration:    {N} minutes
   Attendees:   {Count} attendees
   File:        ./meetings/{type_code}/{filename}

   📂 Files Created/Updated:
   - Meeting note: {filename}
   - Index updated: 000-README.md (Total: {N} meetings)

   🎯 Next Steps:
   1. Open the meeting note and fill in details
   2. After meeting: /meetings-edit @{###} "Add action items"
   3. Sync to summary: /meetings-update-progress @{###}
   4. Search related: /meetings-search "{topic}" --type {type_code}
   ```
