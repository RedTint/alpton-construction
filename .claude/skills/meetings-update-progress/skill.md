# Meetings Update Progress Command

Sync action items and decisions from meeting notes to SUMMARY.md with automatic carry-forward tracking, status grouping, and 30-day archival, similar to the progress tracking system.

## Execution Steps

### Phase 1: Parse Input and Locate Meeting Note

1. **Extract Document Reference**
   - Parse `{@doc}` parameter from command arguments
   - Format can be:
     - Short ID: `@001`, `@002`
     - Full filename: `@001-20260312-0930-sprint-planning`
     - Partial match: `@sprint-planning`
   - Extract reference without @ symbol for searching

2. **Search for Matching Meeting Note**
   - Use same logic as `/meetings-edit`
   - Search in: `./meetings/*/` (all type code directories)
   - Command: `find ./meetings -name "*{reference}*.md" -type f`
   - Exclude `000-README.md` and `000-SUMMARY.md`

3. **Handle Multiple or No Matches**
   - **No matches:** Display error and abort
   - **Single match:** Proceed with that file
   - **Multiple matches:** Use AskUserQuestion to let user select

4. **Read Meeting Note Content**
   - Use Read tool to load file content
   - Note file path, filename, and type code
   - Parse meeting title, date, and metadata

### Phase 2: Extract Action Items from Meeting Note

1. **Parse ACTION ITEMS Section**
   - Locate `## ACTION ITEMS` header
   - Extract all action items until next section (## DECISIONS)
   - Each action item format:
     ```
     {N}. **{Description}** — Assignee: {name}, Due: {YYYY-MM-DD}, Status: {Open|In Progress|Completed|Blocked}
     ```

2. **Extract Action Item Details**
   - For each action item, parse:
     - **Item number** (N)
     - **Description** (text between ** **)
     - **Assignee** (after "Assignee:")
     - **Due date** (after "Due:")
     - **Status** (after "Status:")
     - **Line number** (from Read tool output)

3. **Construct Action Item Reference**
   - Format: `[{doc-id}:L{line-number}] {description}`
   - Example: `[001:L12] Complete API documentation`
   - Extract doc-id from filename (first 3 digits)
   - Line number from where action item appears in file

4. **Calculate Created Date**
   - Use meeting date from metadata
   - Format: YYYY-MM-DD
   - This becomes "Created" timestamp for new items

5. **Handle Empty ACTION ITEMS Section**
   - If no action items found:
     - Note: "No action items in this meeting"
     - Still process DECISIONS
     - SUMMARY will show "0 action items from this meeting"

### Phase 3: Extract Decisions from Meeting Note

1. **Parse DECISIONS Section**
   - Locate `## DECISIONS` header
   - Extract all decisions until next section (## DISCUSSION POINTS)
   - Each decision format:
     ```
     {N}. **{Title}**
        - Rationale: {why}
        - Impact: {what}
        - Alternatives Considered: {alternatives}
     ```

2. **Extract Decision Details**
   - For each decision, parse:
     - **Decision number** (N)
     - **Title** (text between ** **)
     - **Rationale** (after "Rationale:")
     - **Impact** (optional, after "Impact:")
     - **Line number** (from Read tool output)

3. **Construct Decision Reference**
   - Format: `[{doc-id}:L{line-number}] {title}`
   - Example: `[001:L25] Adopt TypeScript strict mode`

4. **Calculate Decision Date**
   - Use meeting date from metadata
   - Format: YYYY-MM-DD

5. **Handle Empty DECISIONS Section**
   - If no decisions found:
     - Note: "No decisions documented in this meeting"
     - Still update SUMMARY (may have action items)

### Phase 4: Read and Parse Existing SUMMARY

1. **Determine Type Code**
   - Extract type code from meeting note file path
   - Example: `./meetings/spr/001-...` → type_code = "spr"

2. **Check if SUMMARY Exists**
   - Look for: `./meetings/{type_code}/000-SUMMARY.md`
   - If exists: Read and parse current content
   - If not exists: Will create new SUMMARY

3. **Parse Existing Action Items (if SUMMARY exists)**
   - Extract items from each status group:
     - Open (N items)
     - In Progress (N items)
     - Completed (Last 30 Days)
     - Archived Items
   - For each item, track:
     - Reference `[{doc-id}:L{line}]`
     - Description
     - Assignee
     - Due date
     - Created date
     - Started date (for In Progress)
     - Completed date (for Completed)

4. **Parse Existing Decisions (if SUMMARY exists)**
   - Extract from Decisions Log section
   - Group by date (YYYY-MM-DD)
   - Track reference and rationale

5. **Calculate Current Metrics**
   - Total meetings referenced
   - Open action items count
   - In Progress items count
   - Completed items count (last 30 days)
   - Archived items count

### Phase 5: Merge New Items with Existing

1. **Merge Action Items**
   - For each new action item from meeting note:
     - Check if already exists in SUMMARY (by reference `[{doc-id}:L{line}]`)
     - **If exists (update scenario):**
       - Compare status in meeting note vs SUMMARY
       - If status changed:
         - Update status in SUMMARY
         - Add "Started" date if Open → In Progress
         - Add "Completed" date if → Completed
         - Move to appropriate status group
     - **If new (add scenario):**
       - Add to appropriate status group based on status field
       - Include Created date from meeting date
       - Maintain all fields (assignee, due date, status)

2. **Handle Status Transitions**
   - **Open → In Progress:**
     - Move from Open section to In Progress section
     - Add "Started: {today's date}"
   - **In Progress → Completed:**
     - Move from In Progress to Completed section
     - Add "Completed: {today's date}"
   - **Open → Completed:**
     - Move from Open to Completed section
     - Add "Completed: {today's date}"
   - **Any → Blocked:**
     - Move to Blocked section
     - Note: Currently not tracking Blocked items in SUMMARY
     - Could add in future enhancement

3. **Merge Decisions**
   - For each new decision from meeting note:
     - Check if already exists (by reference)
     - If new: Add to Decisions Log under meeting date
     - If exists: Update rationale if changed (rare)

4. **Maintain Carry-Forward Logic**
   - **Open items:** Persist in Open section until status changes
   - **In Progress items:** Persist until completed
   - **Completed items:** Show in "Completed (Last 30 Days)" section
   - **Archived items:** Move completed items older than 30 days to Archive

### Phase 6: Apply 30-Day Archival

1. **Calculate Cutoff Date**
   - Today's date minus 30 days
   - Format: YYYY-MM-DD
   - Example: If today is 2026-03-12, cutoff is 2026-02-10

2. **Identify Items to Archive**
   - From "Completed (Last 30 Days)" section
   - Find items where "Completed: {date}" is before cutoff
   - Example: Completed on 2026-02-05 → archive (older than 30 days)

3. **Move to Archived Section**
   - Remove from Completed section
   - Add to "Archived Items" section at bottom
   - Preserve all metadata (description, assignee, completed date, reference)
   - Group archived items by month for organization

4. **Update Counts**
   - Decrement completed count
   - Increment archived count
   - Update "Last Updated" timestamp

### Phase 7: Generate Updated SUMMARY Content

1. **Create SUMMARY Header**
   ```markdown
   # Meeting Summary - {Meeting Type Label}

   **Type Code:** {type_code}
   **Last Updated:** {YYYY-MM-DD HH:MM}
   **Total Meetings:** {N}
   **Open Action Items:** {N}
   **In Progress Action Items:** {N}
   **Completed Action Items (Last 30 Days):** {N}
   **Archived Action Items:** {N}

   ---
   ```

2. **Generate Active Action Items Section**
   ```markdown
   ## Active Action Items

   ### Open ({N} items)

   - **[{doc-id}:L{line}] {description}** — Assignee: {name}, Due: {YYYY-MM-DD}
     - From: [{filename}](./{filename}#L{line})
     - Created: {YYYY-MM-DD}

   ### In Progress ({N} items)

   - **[{doc-id}:L{line}] {description}** — Assignee: {name}, Due: {YYYY-MM-DD}
     - From: [{filename}](./{filename}#L{line})
     - Created: {YYYY-MM-DD}
     - Started: {YYYY-MM-DD}

   ---
   ```

3. **Generate Decisions Log Section**
   ```markdown
   ## Decisions Log

   ### {YYYY-MM-DD}

   - **[{doc-id}:L{line}] {decision title}**
     - From: [{filename}](./{filename}#L{line})
     - Rationale: {why this decision was made}

   ---
   ```

4. **Generate Completed Items Section**
   ```markdown
   ## Completed Action Items (Last 30 Days)

   - **[{doc-id}:L{line}] {description}** — Completed: {YYYY-MM-DD}
     - Assignee: {name}
     - From: [{filename}](./{filename}#L{line})

   ---
   ```

5. **Generate Archived Items Section**
   ```markdown
   ## Archived Items

   ### {Month YYYY} ({N} items)

   - **[{doc-id}:L{line}] {description}** — Completed: {YYYY-MM-DD}
     - Assignee: {name}
     - From: [{filename}](./{filename}#L{line})

   ---
   ```

6. **Sort Items Appropriately**
   - Open items: Sort by due date (earliest first)
   - In Progress: Sort by started date (oldest first)
   - Completed: Sort by completed date (most recent first)
   - Decisions: Sort by date (most recent first)
   - Archived: Sort by completed date within each month

### Phase 8: Write Updated SUMMARY

1. **Create or Update SUMMARY File**
   - Path: `./meetings/{type_code}/000-SUMMARY.md`
   - If new: Use Write tool
   - If exists: Use Edit tool (replace entire content)

2. **Verify Write Success**
   - Confirm file created/updated
   - Check file size is reasonable

3. **Handle Write Failure**
   - Display error: "Could not update SUMMARY file"
   - Provide generated content for manual creation
   - Note which action items and decisions were extracted

### Phase 9: Update README Statistics

1. **Read Current README**
   - Path: `./meetings/{type_code}/000-README.md`
   - Should exist (created by `/meetings-new`)
   - If not exists: Create basic README

2. **Update Statistics**
   - Total meetings count
   - Last updated timestamp
   - Optionally add summary stats:
     - Total action items tracked
     - Total decisions documented

3. **Write Updated README**
   - Use Edit tool for targeted update
   - Preserve all meeting abstracts
   - Only update header statistics

### Phase 10: Generate Summary Report

1. **Collect Sync Details**
   - Meeting note processed
   - Action items extracted (new vs updated)
   - Decisions extracted
   - Items archived (if any)
   - Current status counts

2. **Display Comprehensive Summary**
   ```
   ✅ Meeting progress updated successfully!

   📝 Meeting Processed:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   File:        ./meetings/{type_code}/{filename}
   Title:       {Meeting Title}
   Date:        {YYYY-MM-DD}
   Type:        {Meeting Type} ({type_code})

   📊 Action Items Extracted:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - New items added: {N}
   - Existing items updated: {M}
   - Status changes: {K}

   Details:
   - [001:L12] Complete API documentation — Added (Open)
   - [001:L13] Update database migration scripts — Updated (In Progress → Completed)

   📋 Decisions Extracted:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - New decisions added: {N}

   Details:
   - [001:L22] Adopt TypeScript strict mode
   - [001:L27] Use GitHub Actions for CI/CD

   🗄️ Archive Summary:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - Items archived (>30 days): {N}

   📂 Files Updated:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - ✅ SUMMARY: ./meetings/{type_code}/000-SUMMARY.md
   - ✅ README: ./meetings/{type_code}/000-README.md

   📈 Current Tracking Status:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - Total meetings: {N}
   - Open action items: {N}
   - In Progress: {N}
   - Completed (last 30 days): {N}
   - Archived: {N}
   - Total decisions logged: {N}

   🎯 Next Steps:

   1. Review updated summary:
      cat ./meetings/{type_code}/000-SUMMARY.md

   2. Search for your open action items:
      /meetings-search --assignee "{your-name}" --status Open

   3. Review all open items for this meeting type:
      cat ./meetings/{type_code}/000-SUMMARY.md | grep "### Open"

   4. Update another meeting:
      /meetings-update-progress @{next-meeting-id}

   ✨ Action items and decisions tracked! Nothing falls through the cracks. ✨
   ```

3. **Highlight Key Transitions**
   - Show items that changed status
   - Note newly completed items
   - Flag items archived this update

## Input Format

**Command:**
```
/meetings-update-progress {@doc}
```

**Examples:**
```bash
# Update progress for specific meeting by ID
/meetings-update-progress @001

# Update using full filename
/meetings-update-progress @001-20260312-0930-sprint-planning

# Update using partial match
/meetings-update-progress @sprint-planning

# Update after editing meeting notes
/meetings-edit @001 "Mark action item 2 as completed"
/meetings-update-progress @001
```

## Output Format

```
✅ Meeting progress updated successfully!

📝 Meeting Processed:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
File:        ./meetings/spr/001-20260312-0930-sprint-12-planning.md
Title:       Sprint 12 Planning
Date:        2026-03-12
Type:        Sprint Planning (spr)

📊 Action Items Extracted:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- New items added: 2
- Existing items updated: 1
- Status changes: 1

Details:
+ [001:L12] Complete API documentation — Added (Open)
+ [001:L13] Update database migration scripts — Added (Open)
~ [012:L18] Refactor user authentication service — Updated (In Progress → Completed)

📋 Decisions Extracted:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- New decisions added: 2

Details:
+ [001:L22] Adopt TypeScript strict mode
+ [001:L27] Use GitHub Actions for CI/CD pipeline

🗄️ Archive Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Items archived (>30 days): 3

📂 Files Updated:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- ✅ SUMMARY: ./meetings/spr/000-SUMMARY.md
- ✅ README: ./meetings/spr/000-README.md (statistics updated)

📈 Current Tracking Status:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Total meetings: 12
- Open action items: 5
- In Progress: 2
- Completed (last 30 days): 4
- Archived: 34
- Total decisions logged: 18

🎯 Next Steps:

1. Review updated summary:
   cat ./meetings/spr/000-SUMMARY.md

2. Search for your open action items:
   /meetings-search --assignee "Alex Chen" --status Open

3. Review all open items for sprint meetings:
   cat ./meetings/spr/000-SUMMARY.md | grep "### Open"

4. Check decision history:
   /meetings-search --section decisions --type spr

✨ Action items and decisions tracked! Nothing falls through the cracks. ✨
```

## Important Notes

- **Carry-Forward Logic:** Similar to `/update-progress` - items persist until status changes
- **Line References:** Track back to exact source location with `[{doc-id}:L{line}]` format
- **Status Grouping:** Organizes items by Open / In Progress / Completed for clarity
- **30-Day Archival:** Automatically moves old completed items to archive (prevents clutter)
- **Clickable Links:** Markdown links enable quick navigation to source meetings
- **Merge Intelligence:** Detects existing items and updates rather than duplicating
- **Date Tracking:** Records Created, Started, and Completed dates for timeline
- **Decision Preservation:** All decisions logged with links back to source meeting
- **Type-Specific:** Each meeting type (spr, cls, ard) has its own SUMMARY
- **Statistics:** Maintains counts for reporting and progress tracking
- **Idempotent:** Running multiple times on same meeting is safe (updates, doesn't duplicate)

## Error Handling

**No Document Reference Provided:**
- Display error: "Please provide a meeting note reference using @doc syntax"
- Examples: `@001`, `@sprint-planning`
- Abort operation

**Meeting Note Not Found:**
- Display error: "No meeting note found matching: {@doc}"
- Suggest using `/meetings-search` to find meetings
- List recent meetings as suggestions
- Abort operation

**Multiple Matches Found:**
- Use AskUserQuestion to let user select
- Format: `{type_code}/{filename} - {title}`
- If user cancels, abort operation

**No Action Items or Decisions:**
- Note: "No action items or decisions found in this meeting"
- Still update SUMMARY (may remove stale items)
- Still update README statistics
- Consider successful operation

**SUMMARY Write Failed:**
- Display error: "Could not write SUMMARY file"
- Provide generated content for manual creation
- Show extracted action items and decisions
- Suggest manual SUMMARY creation

**README Update Failed:**
- SUMMARY updated successfully
- Display warning: "Could not update README statistics"
- This is non-critical
- Main tracking still works

**Invalid Action Item Format:**
- Display warning: "Action item at line {N} has invalid format"
- Expected format: `{N}. **{desc}** — Assignee: {name}, Due: {date}, Status: {status}`
- Skip invalid items
- Continue processing valid items
- List skipped items in summary

**Invalid Decision Format:**
- Display warning: "Decision at line {N} has invalid format"
- Expected format: `{N}. **{title}**` with Rationale sub-bullet
- Skip invalid decisions
- Continue processing valid decisions

**Missing Metadata:**
- If meeting date cannot be determined:
  - Use file creation date as fallback
  - Display warning: "Using file creation date for meeting date"

## Success Criteria

The `/meetings-update-progress` command is successful when:
1. ✅ Document reference parsed and meeting note located
2. ✅ Meeting note content read successfully
3. ✅ ACTION ITEMS section parsed and all items extracted
4. ✅ Action item details captured: description, assignee, due date, status, line number
5. ✅ DECISIONS section parsed and all decisions extracted
6. ✅ Decision details captured: title, rationale, line number
7. ✅ Type code determined from file path
8. ✅ Existing SUMMARY read and parsed (if exists)
9. ✅ New action items merged with existing (no duplicates)
10. ✅ Status transitions tracked correctly (Open → In Progress → Completed)
11. ✅ Timestamps added: Created, Started, Completed
12. ✅ 30-day archival applied to old completed items
13. ✅ SUMMARY content generated with all sections:
    - Header with statistics
    - Active Action Items (Open, In Progress)
    - Decisions Log (grouped by date)
    - Completed Items (last 30 days)
    - Archived Items (grouped by month)
14. ✅ SUMMARY file written/updated successfully
15. ✅ README statistics updated
16. ✅ User receives comprehensive summary showing:
    - Items extracted (new vs updated)
    - Status changes
    - Decisions logged
    - Items archived
    - Current tracking status
17. ✅ Next steps provided for reviewing and searching

## Future Enhancements

### v1.1.0
- Batch update (process multiple meetings at once)
- Automatic update after `/meetings-edit` completes
- Reminder notifications for overdue action items
- Integration with calendar for due date tracking

### v1.2.0
- Dashboard visualization of action items by assignee
- Burndown chart for action item completion
- Automated weekly summary email/digest
- Action item dependency tracking

### v1.3.0
- AI-powered action item prioritization
- Risk detection for blocked or overdue items
- Integration with project management tools (Jira, Linear)
- Real-time sync across team members
