---
description: Sync action items and decisions from meeting notes to SUMMARY.md with automatic carry-forward tracking and 30-day archival
---

1. Parse Input and Locate Meeting Note
   Extract document reference from arguments
   Format: @001, @001-20260312-0930-sprint-planning, or @sprint-planning
   Remove @ symbol for searching

   Search for matching meeting note:
   Run: find ./meetings -name "*{reference}*.md" -type f
   Exclude: 000-README.md and 000-SUMMARY.md

   Handle matches:
   - No matches: Display error and abort
   - Single match: Proceed
   - Multiple matches: // Note: Manual user input required
     Ask user to select from list

   Read meeting note content from matched file
   Parse meeting title, date, and metadata

2. Extract Action Items from Meeting Note
   Locate ## ACTION ITEMS section
   Extract all action items until next section (## DECISIONS)

   For each action item, parse format:
   {N}. **{Description}** — Assignee: {name}, Due: {YYYY-MM-DD}, Status: {Open|In Progress|Completed|Blocked}

   Extract details:
   - Item number (N)
   - Description (text between **)
   - Assignee (after "Assignee:")
   - Due date (after "Due:")
   - Status (after "Status:")
   - Line number (from file)

   Construct reference: [{doc-id}:L{line-number}] {description}
   Example: [001:L12] Complete API documentation

   Calculate created date from meeting date metadata

   If no action items found: Note "No action items in this meeting"

3. Extract Decisions from Meeting Note
   Locate ## DECISIONS section
   Extract all decisions until next section (## DISCUSSION POINTS)

   For each decision, parse format:
   {N}. **{Title}**
      - Rationale: {why}
      - Impact: {what}
      - Alternatives Considered: {alternatives}

   Extract details:
   - Decision number (N)
   - Title (text between **)
   - Rationale (after "Rationale:")
   - Impact (optional, after "Impact:")
   - Line number (from file)

   Construct reference: [{doc-id}:L{line-number}] {title}
   Example: [001:L25] Adopt TypeScript strict mode

   If no decisions found: Note "No decisions documented"

4. Read and Parse Existing SUMMARY
   Determine type code from file path
   Example: ./meetings/spr/001-... → type_code = "spr"

   Check if SUMMARY exists:
   Read file: ./meetings/{type_code}/000-SUMMARY.md (if exists)

   If exists, parse existing content:
   - Action Items by status group: Open, In Progress, Completed, Archived
   - For each item track: reference, description, assignee, due date, created date, started date, completed date
   - Decisions from Decisions Log
   - Current metrics: total meetings, item counts

   If not exists: Will create new SUMMARY

5. Merge New Items with Existing
   For each new action item from meeting note:
   - Check if already exists in SUMMARY (by reference [{doc-id}:L{line}])

   If exists (update scenario):
   - Compare status in meeting note vs SUMMARY
   - If status changed:
     - Update status in SUMMARY
     - Add "Started: {today}" if Open → In Progress
     - Add "Completed: {today}" if → Completed
     - Move to appropriate status group

   If new (add scenario):
   - Add to appropriate status group based on status field
   - Include Created date from meeting date

   For each new decision:
   - Check if already exists (by reference)
   - If new: Add to Decisions Log under meeting date

   Maintain carry-forward logic:
   - Open items: Persist until status changes
   - In Progress: Persist until completed
   - Completed: Show in "Completed (Last 30 Days)"
   - Archived: Items older than 30 days

6. Apply 30-Day Archival
   Calculate cutoff date: today's date minus 30 days
   Format: YYYY-MM-DD

   Run: date -v-30d +"%Y-%m-%d" (macOS) or date -d "30 days ago" +"%Y-%m-%d" (Linux)

   From "Completed (Last 30 Days)" section:
   - Find items where "Completed: {date}" is before cutoff
   - Move to "Archived Items" section
   - Group archived items by month
   - Preserve all metadata

   Update counts:
   - Decrement completed count
   - Increment archived count

7. Generate Updated SUMMARY Content
   Create header:
   ```
   # Meeting Summary - {Meeting Type Label}

   **Type Code:** {type_code}
   **Last Updated:** {YYYY-MM-DD HH:MM}
   **Total Meetings:** {N}
   **Open Action Items:** {N}
   **In Progress Action Items:** {N}
   **Completed Action Items (Last 30 Days):** {N}
   **Archived Action Items:** {N}
   ```

   Generate Active Action Items section:
   ```
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
   ```

   Generate Decisions Log:
   ```
   ## Decisions Log

   ### {YYYY-MM-DD}

   - **[{doc-id}:L{line}] {decision title}**
     - From: [{filename}](./{filename}#L{line})
     - Rationale: {why}
   ```

   Generate Completed Items section:
   ```
   ## Completed Action Items (Last 30 Days)

   - **[{doc-id}:L{line}] {description}** — Completed: {YYYY-MM-DD}
     - Assignee: {name}
     - From: [{filename}](./{filename}#L{line})
   ```

   Generate Archived Items section:
   ```
   ## Archived Items

   ### {Month YYYY} ({N} items)

   - **[{doc-id}:L{line}] {description}** — Completed: {YYYY-MM-DD}
     - Assignee: {name}
     - From: [{filename}](./{filename}#L{line})
   ```

   Sort items appropriately:
   - Open: by due date (earliest first)
   - In Progress: by started date (oldest first)
   - Completed: by completed date (most recent first)
   - Decisions: by date (most recent first)

8. Write Updated SUMMARY
   Create or update file: ./meetings/{type_code}/000-SUMMARY.md
   Content: Generated summary from step 7

   Verify write success

9. Update README Statistics
   Read file: ./meetings/{type_code}/000-README.md

   Update statistics:
   - Total meetings count
   - Last updated timestamp
   - Optionally add summary stats

   Write updated README (preserve all meeting abstracts)

10. Generate Summary Report
    Display comprehensive summary:
    ```
    ✅ Meeting progress updated successfully!

    📝 Meeting Processed:
    File:        ./meetings/{type_code}/{filename}
    Title:       {Meeting Title}
    Date:        {YYYY-MM-DD}
    Type:        {Meeting Type} ({type_code})

    📊 Action Items Extracted:
    - New items added: {N}
    - Existing items updated: {M}
    - Status changes: {K}

    Details:
    + [001:L12] Complete API documentation — Added (Open)
    ~ [001:L13] Update database migration — Updated (In Progress → Completed)

    📋 Decisions Extracted:
    - New decisions added: {N}

    Details:
    + [001:L22] Adopt TypeScript strict mode

    🗄️ Archive Summary:
    - Items archived (>30 days): {N}

    📂 Files Updated:
    - SUMMARY: ./meetings/{type_code}/000-SUMMARY.md
    - README: ./meetings/{type_code}/000-README.md

    📈 Current Tracking Status:
    - Total meetings: {N}
    - Open action items: {N}
    - In Progress: {N}
    - Completed (last 30 days): {N}
    - Archived: {N}
    - Total decisions logged: {N}

    🎯 Next Steps:
    1. Review summary: cat ./meetings/{type_code}/000-SUMMARY.md
    2. Search your items: /meetings-search --assignee "{name}" --status Open
    3. Update another: /meetings-update-progress @{next-id}
    ```
