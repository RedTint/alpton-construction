# Meetings New Command

Create structured meeting notes with automatic template generation, type code management, and index updates.

## Execution Steps

### Phase 1: Parse Input and Validate Type Code

1. **Extract Type Code Parameter**
   - Parse command arguments to get optional `{type_code}` parameter
   - Type code examples: `spr`, `cls`, `ard`, `1on`, `stk`, `all`
   - If not provided, will prompt user later
   - Validate format: 3 characters, lowercase, alphanumeric only

2. **Handle Auto-Generation from Description**
   - If type code not provided, use AskUserQuestion to gather meeting type
   - Prompt: "What type of meeting is this?"
   - Options (select or type custom):
     - "Sprint Planning / Retrospective / Review" → spr
     - "Client Sync / Status Update" → cls
     - "Architecture Review / Design Discussion" → ard
     - "One-on-One Meeting" → 1on
     - "Stakeholder Review / Demo" → stk
     - "All Hands / Company Meeting" → all
     - "Other (specify)" → custom input
   - Auto-generate 3-char code from custom input:
     - Take first letter of each word (up to 3 words)
     - Fallback: first 3 characters if single word
     - Convert to lowercase
     - Examples:
       - "sprint-retro" → "spr"
       - "client-sync" → "cls"
       - "technical-deep-dive" → "tdd"
       - "quarterly-review" → "qua"

3. **Validate Type Code**
   - Must be 3 characters long
   - Only lowercase letters and numbers
   - No special characters or spaces
   - If invalid:
     - Display error: "Invalid type code: {code}. Must be 3 lowercase alphanumeric characters."
     - Prompt user to enter valid code

### Phase 2: Determine Sequential Number and Filename

1. **Check Directory Structure**
   - Use Bash to check if `./meetings/{type_code}/` exists
   - If not, note that directory will be created
   - Example: `./meetings/spr/`

2. **Find Existing Meeting Notes**
   - Use Glob to find files: `./meetings/{type_code}/*.md`
   - Exclude `000-README.md` and `000-SUMMARY.md` from results
   - Parse existing filenames to extract sequential numbers
   - Pattern: `{###}-{YYYYMMDD-HHii}-{short-desc}.md`

3. **Calculate Next Sequential Number**
   - If no existing files, start with `001`
   - If existing files found:
     - Extract numbers from filenames (first 3 digits)
     - Find maximum number
     - Increment by 1
     - Pad to 3 digits with leading zeros
   - Examples:
     - No files → `001`
     - Files: 001, 002, 003 → `004`
     - Files: 001, 002, 005 → `006` (continues sequence)

4. **Generate Datetime Stamp**
   - Use Bash: `date +"%Y%m%d-%H%M"`
   - Format: `YYYYMMDD-HHii`
   - Example: `20260312-0930` (March 12, 2026 at 9:30 AM)
   - This format ensures:
     - Sortable chronologically
     - Human-readable
     - No ambiguity
     - Consistent with research document pattern

5. **Prompt for Short Description**
   - Use AskUserQuestion: "Enter a short description for this meeting (2-5 words, kebab-case)"
   - Examples:
     - "sprint-12-planning"
     - "q2-roadmap-review"
     - "architecture-deep-dive"
     - "client-kickoff"
   - Validate:
     - Max 50 characters
     - Convert to kebab-case (lowercase, hyphens only)
     - Remove special characters

6. **Construct Full Filename**
   - Format: `{###}-{YYYYMMDD-HHii}-{short-desc}.md`
   - Example: `001-20260312-0930-sprint-12-planning.md`
   - Full path: `./meetings/{type_code}/{filename}`

### Phase 3: Gather Meeting Metadata

1. **Prompt for Meeting Date and Time**
   - Use AskUserQuestion: "Enter meeting date and time (YYYY-MM-DD HH:MM)"
   - Default: Current datetime from Phase 2 step 4
   - Allow user to override if meeting was in the past
   - Validate format

2. **Prompt for Attendees**
   - Use AskUserQuestion: "Enter meeting attendees (comma-separated names)"
   - Example: "Alex Chen, Jordan Smith, Casey Williams"
   - Parse into list
   - Trim whitespace from each name

3. **Prompt for Duration**
   - Use AskUserQuestion: "Enter meeting duration in minutes"
   - Default: "60"
   - Validate: positive integer
   - Will display as "{N} minutes" in template

4. **Prompt for Absent Attendees (Optional)**
   - Use AskUserQuestion: "Enter names of expected attendees who were absent (optional, comma-separated)"
   - Can be left empty
   - Example: "Morgan Lee (notified)"

5. **Determine Meeting Type Label**
   - Map type code to readable label:
     - `spr` → "Sprint Planning" (or "Sprint Retrospective" or "Sprint Review")
     - `cls` → "Client Sync"
     - `ard` → "Architecture Review"
     - `1on` → "One-on-One"
     - `stk` → "Stakeholder Review"
     - `all` → "All Hands"
     - Custom codes → Use original description

### Phase 4: Generate Meeting Note Template

1. **Create Meeting Title**
   - Use short description, capitalize first letter of each word
   - Example: "sprint-12-planning" → "Sprint 12 Planning"

2. **Generate Meeting Note Content**
   ```markdown
   # {Meeting Title}

   - **Date:** {YYYYMMDD-HHii}
   - **Type:** {Meeting Type Label} ({type_code})
   - **Attendees:** {Comma-separated list}
   - **Duration:** {N} minutes
   - **Absent:** {Absent attendees or "None"}

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

3. **Preserve Template Structure**
   - All sections must be present
   - Placeholder text helps guide user
   - Clear formatting with horizontal rules
   - Numbered lists for ACTION ITEMS and DECISIONS
   - Bulleted lists for NEXT STEPS

### Phase 5: Create Directory and Write Meeting Note

1. **Create Directory Structure**
   - Use Bash: `mkdir -p ./meetings/{type_code}`
   - Creates directory if it doesn't exist
   - `-p` flag creates parent directories as needed

2. **Write Meeting Note File**
   - Use Write tool to create file at: `./meetings/{type_code}/{filename}`
   - Content: Generated template from Phase 4
   - Validate file was created successfully

3. **Verify File Creation**
   - Use Bash: `ls -lh ./meetings/{type_code}/{filename}`
   - Confirm file exists and has content
   - Note file size for summary

### Phase 6: Update or Create README Index

1. **Check if README Exists**
   - Use Bash to check: `./meetings/{type_code}/000-README.md`
   - If exists: read current content
   - If not exists: will create new README

2. **Generate Meeting Abstract**
   - Extract key information:
     - Meeting number (sequential number)
     - Date and time
     - Meeting title
     - Attendees (first 3 names if more than 3)
     - Key outcomes (placeholder for now, updated after meeting)
   - Format:
     ```markdown
     ### {###} - {Meeting Title}
     **Date:** {YYYY-MM-DD HH:MM}
     **Attendees:** {Names or "3 attendees" if many}
     **File:** [{filename}](./{filename})
     ```

3. **Update or Create README**
   - If README doesn't exist, create with:
     ```markdown
     # Meeting Notes Index - {Meeting Type Label}

     **Type Code:** {type_code}
     **Total Meetings:** {N}
     **Last Updated:** {YYYY-MM-DD HH:MM}

     ---

     ## Meetings (Reverse Chronological Order)

     {Meeting abstracts listed newest first}

     ---

     **Index automatically updated by `/meetings-new` command**
     ```
   - If README exists:
     - Read current content
     - Parse "Total Meetings" count and increment
     - Update "Last Updated" timestamp
     - Insert new meeting abstract at top of meetings list
     - Use Edit tool to update

4. **Write or Update README**
   - Use Write (if new) or Edit (if updating)
   - Preserve all existing meeting entries
   - Add new entry at top (reverse chronological)
   - Update metadata (total count, last updated)

### Phase 7: Generate Summary Report

1. **Collect Creation Details**
   - Meeting note filename
   - Full file path
   - Sequential number
   - Meeting type
   - Date and time
   - Attendees count
   - README update status

2. **Display Comprehensive Summary**
   ```
   ✅ Meeting note created successfully!

   📝 Meeting Details:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Title:       {Meeting Title}
   Type:        {Meeting Type Label} ({type_code})
   Date:        {YYYY-MM-DD HH:MM}
   Duration:    {N} minutes
   Attendees:   {Count} attendees
   File:        ./meetings/{type_code}/{filename}

   📂 Files Created/Updated:
   - ✅ Meeting note: {filename} ({file size})
   - ✅ Index updated: 000-README.md (Total: {N} meetings)

   📋 Meeting Note Structure:
   - ✅ Metadata section (Date, Type, Attendees, Duration, Absent)
   - ✅ ACTION ITEMS section (ready for action items)
   - ✅ DECISIONS section (ready for decisions)
   - ✅ DISCUSSION POINTS section (ready for topics)
   - ✅ NEXT STEPS section (ready for follow-ups)
   - ✅ Notes section (for additional context)

   🎯 Next Steps:

   1. Open the meeting note and fill in details:
      - Add action items with assignees and due dates
      - Document decisions with rationale
      - Capture discussion points by topic
      - List next steps for follow-up

   2. After meeting, update action items:
      /meetings-edit @{###} "Add action items from meeting"

   3. Sync action items to summary:
      /meetings-update-progress @{###}

   4. Search for related meetings:
      /meetings-search "{topic}" --type {type_code}

   ✨ Meeting note ready! Open and start documenting. ✨
   ```

3. **Provide Quick Access Commands**
   - Show @doc reference for easy editing: `@{###}` or `@{###}-{date}-{desc}`
   - Suggest next commands based on workflow
   - Include type code for future searches

## Input Format

**Command:**
```
/meetings-new {type_code}
/meetings-new {type_code} "{meeting description}"
/meetings-new
```

**Examples:**
```bash
# Create sprint planning meeting with known type code
/meetings-new spr

# Create client sync meeting
/meetings-new cls

# Create meeting without specifying type (will prompt)
/meetings-new

# Create architecture review meeting
/meetings-new ard

# Create custom type meeting
/meetings-new tdd  # technical-deep-dive
```

## Output Format

```
✅ Meeting note created successfully!

📝 Meeting Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title:       Sprint 12 Planning
Type:        Sprint Planning (spr)
Date:        2026-03-12 09:30
Duration:    90 minutes
Attendees:   3 attendees
File:        ./meetings/spr/001-20260312-0930-sprint-12-planning.md

📂 Files Created/Updated:
- ✅ Meeting note: 001-20260312-0930-sprint-12-planning.md (1.2 KB)
- ✅ Index updated: 000-README.md (Total: 1 meetings)

📋 Meeting Note Structure:
- ✅ Metadata section (Date, Type, Attendees, Duration, Absent)
- ✅ ACTION ITEMS section (ready for action items)
- ✅ DECISIONS section (ready for decisions)
- ✅ DISCUSSION POINTS section (ready for topics)
- ✅ NEXT STEPS section (for follow-ups)
- ✅ Notes section (for additional context)

🎯 Next Steps:

1. Open the meeting note and fill in details:
   - Add action items with assignees and due dates
   - Document decisions with rationale
   - Capture discussion points by topic
   - List next steps for follow-up

2. After meeting, update action items:
   /meetings-edit @001 "Add action items from meeting"

3. Sync action items to summary:
   /meetings-update-progress @001

4. Search for related meetings:
   /meetings-search "sprint planning" --type spr

✨ Meeting note ready! Open and start documenting. ✨
```

## Important Notes

- **Type Code Convention:** 3-character codes keep folder names concise and consistent
- **Sequential Numbering:** Provides chronological ordering within each meeting type
- **Datetime Format:** `YYYYMMDD-HHii` ensures sortable and human-readable filenames
- **Template Sections:** All sections must be present for `/meetings-update-progress` to work correctly
- **README Index:** Automatically maintained for easy navigation of all meetings
- **Reverse Chronological:** README lists newest meetings first for quick access
- **Standard Types:** Use standard codes (spr, cls, ard, 1on, stk, all) when possible for consistency
- **Custom Types:** Supported for flexibility, auto-generates 3-char code from description
- **File Reference:** Use `@{###}` for quick reference in other commands (e.g., `/meetings-edit @001`)
- **Local Storage:** All files stored locally in `./meetings/` directory for version control

## Error Handling

**Invalid Type Code Format:**
- Display error: "Invalid type code: {code}. Must be 3 lowercase alphanumeric characters."
- Example valid codes: spr, cls, ard, 1on, stk, all
- Prompt user to enter valid code

**Directory Creation Failed:**
- Display error: "Could not create directory: ./meetings/{type_code}/"
- Check permissions and disk space
- Suggest manual directory creation: `mkdir -p ./meetings/{type_code}`
- Abort operation

**File Write Failed:**
- Display error: "Could not create meeting note file: {filename}"
- Check disk space and permissions
- Provide template content for manual creation
- Note that README was not updated

**README Update Failed:**
- Meeting note created successfully
- Display warning: "Could not update README index"
- Suggest manual README update
- Provide abstract text for manual addition

**Invalid Short Description:**
- Display error: "Invalid description. Must be 2-5 words, max 50 characters, kebab-case."
- Examples: "sprint-planning", "q2-review", "architecture-discussion"
- Prompt user to re-enter description

**Invalid Datetime Format:**
- Display error: "Invalid datetime format. Use: YYYY-MM-DD HH:MM"
- Example: "2026-03-12 09:30"
- Use current datetime as default if user chooses

**Invalid Duration:**
- Display error: "Duration must be a positive number (minutes)"
- Example: "60", "90", "120"
- Default to 60 minutes if invalid

**Empty Attendees List:**
- Display warning: "No attendees specified"
- Confirm: "Create meeting note without attendees?"
- Allow creation but note in summary

## Success Criteria

The `/meetings-new` command is successful when:
1. ✅ Type code validated or auto-generated from description
2. ✅ Sequential number calculated correctly (auto-increments)
3. ✅ Datetime stamp generated in `YYYYMMDD-HHii` format
4. ✅ Short description provided and converted to kebab-case
5. ✅ Filename constructed correctly: `{###}-{YYYYMMDD-HHii}-{short-desc}.md`
6. ✅ Meeting metadata gathered (date, attendees, duration, absent)
7. ✅ Directory created if doesn't exist: `./meetings/{type_code}/`
8. ✅ Meeting note created with complete template structure
9. ✅ Template includes all required sections:
   - Metadata (Date, Type, Attendees, Duration, Absent)
   - ACTION ITEMS section
   - DECISIONS section
   - DISCUSSION POINTS section
   - NEXT STEPS section
   - Notes section
10. ✅ README index created or updated with meeting abstract
11. ✅ README shows correct total meeting count
12. ✅ Meeting abstract added at top (reverse chronological order)
13. ✅ User receives comprehensive summary with file locations
14. ✅ Next steps provided for editing, syncing, and searching
15. ✅ Meeting note is immediately ready for documentation

## Future Enhancements

### v1.1.0
- Recurring meeting support (auto-fill from previous meeting)
- Calendar integration (import from Google Calendar, Outlook)
- Attendee auto-complete from previous meetings
- Meeting template customization per type

### v1.2.0
- AI-powered meeting agenda generation
- Integration with `/strategy` for strategic planning meetings
- Meeting series tracking (link related meetings)
- Automatic reminder creation for action items

### v1.3.0
- Real-time collaborative editing during meeting
- Audio/video transcription integration
- AI-generated meeting summaries from transcripts
- Export to presentation slides (Marp, reveal.js)
