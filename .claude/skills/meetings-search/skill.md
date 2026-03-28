# Meetings Search Command

Search across all meeting notes to quickly find action items, decisions, and discussion points with powerful filtering, contextual snippets, and interactive result selection.

## Execution Steps

### Phase 1: Parse Search Query and Filters

1. **Extract Query String**
   - Parse `{query}` parameter from command arguments
   - This is the main search keyword(s)
   - Examples:
     - "API documentation"
     - "database migration"
     - "TypeScript strict mode"
   - Can be empty if using filters only (e.g., search all action items for assignee)

2. **Parse Filter Flags**
   - Extract optional filter flags from arguments:
     - `--type {type_code}` - Search specific meeting type only (spr, cls, ard, etc.)
     - `--date-from {YYYY-MM-DD}` - Meetings on or after this date
     - `--date-to {YYYY-MM-DD}` - Meetings on or before this date
     - `--assignee {name}` - Action items assigned to specific person
     - `--status {Open|In Progress|Completed|Blocked}` - Action items with specific status
     - `--section {actions|decisions|discussion}` - Search specific section only
     - `--export {filename}` - Export results to markdown file

3. **Validate Filters**
   - **Type:** Must be valid 3-character code if provided
   - **Date-from/Date-to:** Must be valid YYYY-MM-DD format
   - **Status:** Must be one of: Open, In Progress, Completed, Blocked (case-insensitive)
   - **Section:** Must be one of: actions, decisions, discussion (case-insensitive)
   - If invalid:
     - Display error with correct format
     - Show examples
     - Abort operation

4. **Build Search Strategy**
   - Determine which directories to search:
     - If `--type` provided: `./meetings/{type_code}/` only
     - If not provided: `./meetings/*/` (all type codes)
   - Determine which sections to search:
     - If `--section actions`: Search ## ACTION ITEMS only
     - If `--section decisions`: Search ## DECISIONS only
     - If `--section discussion`: Search ## DISCUSSION POINTS only
     - If not provided: Search all sections

### Phase 2: Discover Meeting Notes

1. **Find All Meeting Note Files**
   - Use Glob to find files:
     - If type filter: `./meetings/{type_code}/*.md`
     - If no type filter: `./meetings/*/*.md`
   - Exclude: `000-README.md`, `000-SUMMARY.md`
   - Sort by modification time (most recent first)

2. **Apply Date Filters**
   - If `--date-from` or `--date-to` provided:
     - For each meeting note file:
       - Parse datetime from filename: `{###}-{YYYYMMDD-HHii}-{desc}.md`
       - Extract YYYYMMDD component
       - Compare with filter dates
       - Keep only files within date range

3. **Count Total Files to Search**
   - Note how many meeting notes will be searched
   - Display at start: "Searching across {N} meeting notes..."

### Phase 3: Execute Search Across Meeting Notes

1. **For Each Meeting Note**
   - Read file content using Read tool
   - Parse metadata:
     - Meeting title (first line)
     - Date (from metadata section)
     - Type (from metadata section)
     - Attendees (from metadata section)

2. **Apply Section Filter**
   - If `--section` provided:
     - Extract only that section's content for searching
     - Example: If `--section actions`, extract content between `## ACTION ITEMS` and `## DECISIONS`
   - If no section filter:
     - Search entire file content

3. **Perform Keyword Search**
   - If query string provided:
     - Use Grep or manual search to find lines containing query
     - Case-insensitive matching by default
     - Track line numbers where matches occur

   - If query string empty (filter-only search):
     - Skip keyword matching
     - Apply other filters (assignee, status)

4. **Apply Assignee Filter (if provided)**
   - If `--assignee` flag provided:
     - Look for action items containing: `Assignee: {name}`
     - Case-insensitive match on name
     - Only applies to ACTION ITEMS section

5. **Apply Status Filter (if provided)**
   - If `--status` flag provided:
     - Look for action items containing: `Status: {status}`
     - Case-insensitive match
     - Only applies to ACTION ITEMS section

6. **Extract Matching Snippets**
   - For each match:
     - Extract matched line
     - Extract 2 lines before match (context)
     - Extract 2 lines after match (context)
     - Highlight query keywords in matched line
     - Track line number

### Phase 4: Process and Group Results

1. **For Each Match, Capture Details**
   - **Meeting metadata:**
     - Title
     - Date
     - Type code
     - Filename
   - **Match details:**
     - Section (ACTION ITEMS, DECISIONS, DISCUSSION POINTS, other)
     - Line number
     - Matched line (with highlighting)
     - Context (2 lines before/after)

2. **Group Results by Meeting**
   - Structure:
     ```
     {
       filename: string,
       title: string,
       date: string,
       type: string,
       matches: [
         {
           section: string,
           line_number: number,
           matched_line: string,
           context_before: string[],
           context_after: string[]
         }
       ]
     }
     ```

3. **Calculate Match Statistics**
   - Total matches found
   - Meetings with matches
   - Matches by section:
     - ACTION ITEMS: {N}
     - DECISIONS: {M}
     - DISCUSSION POINTS: {K}
     - Other: {L}

4. **Rank Results by Relevance**
   - Primary: Number of matches per meeting (more = higher)
   - Secondary: Date (more recent = higher)
   - Tertiary: Alphabetical by meeting title

### Phase 5: Display Results

1. **Format Search Results**
   ```
   🔍 Search Results:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Query:       "{query}"
   Filters:     {active filters}
   Files Searched: {N} meeting notes
   Matches Found:  {M} matches in {K} meetings

   Results by Meeting:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   📝 Meeting: {Meeting Title}
   📅 Date: {YYYY-MM-DD}
   📂 Type: {Meeting Type} ({type_code})
   🔗 File: ./meetings/{type_code}/{filename}

   Matches ({N}):

   1. [L{line-number}] {Section Name}:
      ...{context before}...
      **{matched line with highlighted keywords}**
      ...{context after}...

   2. [L{line-number}] {Section Name}:
      ...

   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   📝 Meeting: {Next Meeting Title}
   ...
   ```

2. **Highlight Keywords**
   - Use **bold** for matched keywords
   - Example: "Complete **API documentation** by Friday"

3. **Show Line References**
   - Format: `[L{line-number}]`
   - Example: `[L12]`, `[L25]`
   - Enables quick navigation in editor

### Phase 6: Interactive Result Selection

1. **Present Results via AskUserQuestion**
   - If matches found (not too many):
     - Use multiSelect to let user choose meetings to open
     - Options format: `{title} ({date}) - {N} matches`
     - User can select multiple meetings
   - If too many matches (>20 meetings):
     - Display results as text only
     - Skip interactive selection
     - Offer export option

2. **Handle User Selection**
   - For each selected meeting:
     - Open in editor OR
     - Display full content OR
     - Show just the matched sections
   - Use AskUserQuestion to ask preference:
     - "Open in editor"
     - "Display content here"
     - "Show matched sections only"

3. **No Selection Made**
   - If user doesn't select anything:
     - Results still displayed
     - Export still available
     - Exit gracefully

### Phase 7: Export Results (if requested)

1. **Check for Export Flag**
   - If `--export {filename}` provided:
     - Generate markdown export file

2. **Generate Export Content**
   ```markdown
   # Search Results: "{query}"

   **Search Date:** {YYYY-MM-DD HH:MM}
   **Query:** "{query}"
   **Filters Applied:** {list of filters}
   **Total Matches:** {N} matches in {M} meetings
   **Files Searched:** {K} meeting notes

   ---

   ## Results by Meeting

   ### {Meeting Title} ({YYYY-MM-DD})

   **Type:** {Meeting Type} ({type_code})
   **File:** `./meetings/{type_code}/{filename}`
   **Matches:** {N}

   #### Match 1: [L{line}] {Section Name}

   ```
   ...context...
   {matched line}
   ...context...
   ```

   ---

   ## Summary Statistics

   - Total meetings searched: {N}
   - Meetings with matches: {M}
   - Total matches: {K}
   - Matches by section:
     - ACTION ITEMS: {N}
     - DECISIONS: {M}
     - DISCUSSION POINTS: {K}

   ---

   **Generated by `/meetings-search` command**
   **Timestamp:** {YYYY-MM-DD HH:MM}
   ```

3. **Write Export File**
   - Default location: Current directory
   - Use Write tool to create file
   - Verify file created successfully

4. **Display Export Confirmation**
   - Show file path
   - Show file size
   - Provide command to open: `cat {filename}`

### Phase 8: Handle No Results

1. **If No Matches Found**
   - Display friendly message:
     ```
     🔍 No matches found

     Query:       "{query}"
     Filters:     {active filters}
     Files Searched: {N} meeting notes

     💡 Suggestions:
     - Try broader search terms
     - Remove some filters
     - Check spelling
     - Search different section: --section {actions|decisions|discussion}
     - Search different meeting type: --type {type_code}
     - Expand date range
     ```

2. **Suggest Alternative Searches**
   - Based on query and filters, suggest:
     - Removing type filter
     - Removing date filter
     - Searching different section
     - Using related keywords

3. **List Recent Meetings**
   - Show 5 most recent meetings across all types
   - User might recognize what they're looking for

### Phase 9: Generate Summary Report

1. **Collect Search Statistics**
   - Total meetings searched
   - Total matches found
   - Meetings with matches
   - Matches by section
   - Filters applied
   - Export status

2. **Display Comprehensive Summary**
   ```
   ✅ Search complete!

   🔍 Search Details:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Query:           "{query}"
   Type Filter:     {type_code or "All types"}
   Date Range:      {from} to {to or "present"}
   Section Filter:  {section or "All sections"}
   Assignee Filter: {name or "Any"}
   Status Filter:   {status or "Any"}

   📊 Results:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Files Searched:      {N} meeting notes
   Meetings with Matches: {M}
   Total Matches:       {K}

   Matches by Section:
   - ACTION ITEMS:       {N} matches
   - DECISIONS:          {M} matches
   - DISCUSSION POINTS:  {K} matches
   - Other:              {L} matches

   📂 Export:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   {If exported:}
   - ✅ Results exported: {filename} ({file size})
   - 📍 Location: ./{filename}
   - 📖 View: cat {filename}

   {If not exported:}
   - To export results: Add --export {filename} flag

   🎯 Next Steps:

   1. Open a meeting to see full context:
      {Show command for first result}

   2. Edit a meeting to update action items:
      /meetings-edit @{doc-id}

   3. Sync action items to summary:
      /meetings-update-progress @{doc-id}

   4. Refine search with more filters:
      /meetings-search "{query}" --section decisions --type spr

   ✨ Search complete! Found what you needed? ✨
   ```

## Input Format

**Command:**
```
/meetings-search {query}
/meetings-search {query} [--type {code}] [--date-from {YYYY-MM-DD}] [--date-to {YYYY-MM-DD}] [--assignee {name}] [--status {status}] [--section {section}] [--export {filename}]
/meetings-search [filters only]
```

**Examples:**
```bash
# Simple keyword search across all meetings
/meetings-search "API documentation"

# Search sprint meetings only
/meetings-search "database migration" --type spr

# Find all open action items for Alex
/meetings-search --assignee "Alex Chen" --status Open

# Search decisions about authentication since March 1
/meetings-search "authentication" --section decisions --date-from 2026-03-01

# Search client meetings for specific topic
/meetings-search "Q2 roadmap" --type cls

# Search discussion points about performance
/meetings-search "performance" --section discussion

# Search and export results
/meetings-search "TypeScript strict mode" --section decisions --export typescript-decisions.md

# Find completed action items in date range
/meetings-search --status Completed --date-from 2026-03-01 --date-to 2026-03-15

# Search all action items (no query, just filter)
/meetings-search --section actions

# Complex multi-filter search
/meetings-search "authentication" --type ard --date-from 2026-03-01 --section decisions
```

## Output Format

```
🔍 Search Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Query:       "API documentation"
Filters:     Type: spr, Section: actions
Files Searched: 12 meeting notes
Matches Found:  5 matches in 3 meetings

Results by Meeting:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Meeting: Sprint 12 Planning
📅 Date: 2026-03-12
📂 Type: Sprint Planning (spr)
🔗 File: ./meetings/spr/001-20260312-0930-sprint-12-planning.md

Matches (2):

1. [L12] ACTION ITEMS:
   ...
   1. **Complete **API documentation** for authentication endpoints** — Assignee: Alex Chen, Due: 2026-03-15, Status: Open
   ...

2. [L18] DISCUSSION POINTS:
   ...timing for **API documentation** release...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Meeting: Sprint 11 Retrospective
📅 Date: 2026-02-26
📂 Type: Sprint Retrospective (spr)
🔗 File: ./meetings/spr/012-20260226-1600-sprint-11-retro.md

Matches (3):

1. [L15] ACTION ITEMS:
   ...
   3. **Review **API documentation** standards** — Assignee: Jordan Smith, Due: 2026-03-01, Status: Completed
   ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Search complete!

🔍 Search Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Query:           "API documentation"
Type Filter:     spr (Sprint Planning)
Date Range:      All dates
Section Filter:  actions (ACTION ITEMS only)
Assignee Filter: Any
Status Filter:   Any

📊 Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Files Searched:      12 meeting notes
Meetings with Matches: 3
Total Matches:       5

Matches by Section:
- ACTION ITEMS:       4 matches
- DISCUSSION POINTS:  1 match

🎯 Next Steps:

1. Open Sprint 12 Planning to see full context:
   cat ./meetings/spr/001-20260312-0930-sprint-12-planning.md

2. Update action item status:
   /meetings-edit @001 "Mark action item 1 as In Progress"

3. Search for all open action items:
   /meetings-search --status Open --section actions

✨ Search complete! Found 5 matches across 3 meetings. ✨
```

## Important Notes

- **Case-Insensitive:** All searches are case-insensitive by default for better results
- **Contextual Snippets:** Shows 2 lines before/after match for context
- **Line References:** `[L{line}]` enables quick navigation in modern editors
- **Multiple Filters:** Combine filters for precise queries (type + date + section + assignee)
- **Empty Query:** Can search without query using filters only (e.g., all open items for assignee)
- **Section Focus:** `--section` dramatically narrows results to relevant content
- **Date Range:** Useful for finding discussions/decisions from specific time period
- **Export Capability:** Save results to markdown file for sharing or offline review
- **Interactive Selection:** Choose meetings to open directly from results
- **Performance:** Fast even with 100+ meeting notes due to targeted search
- **Similar to `/search-backlog`:** Uses same search patterns for consistency

## Error Handling

**Invalid Type Code:**
- Display error: "Invalid type code: {code}. Must be 3 lowercase alphanumeric characters."
- Examples: spr, cls, ard, 1on, stk, all
- Abort operation

**Invalid Date Format:**
- Display error: "Invalid date format: {date}. Use YYYY-MM-DD."
- Example: "2026-03-12"
- Abort operation

**Invalid Date Range:**
- Display error: "Invalid date range: --date-from must be before --date-to"
- Show provided dates
- Abort operation

**Invalid Status:**
- Display error: "Invalid status: {status}. Must be one of: Open, In Progress, Completed, Blocked."
- Abort operation

**Invalid Section:**
- Display error: "Invalid section: {section}. Must be one of: actions, decisions, discussion."
- Abort operation

**No Meeting Notes Found:**
- Display message: "No meeting notes found in ./meetings/ directory"
- Suggest: "Create a meeting note with: /meetings-new {type_code}"
- Abort operation

**No Matches Found:**
- Display friendly "No matches found" message
- Provide suggestions:
  - Try broader search terms
  - Remove some filters
  - Check spelling
  - Search different section
- List recent meetings as alternatives

**Export File Write Failed:**
- Search results still displayed successfully
- Display error: "Could not export results to file: {filename}"
- Check disk space and permissions
- Provide export content for manual creation

**Too Many Results:**
- If >100 matches:
  - Display warning: "Too many results to display ({N} matches)"
  - Suggest refining search with more filters
  - Offer export option: "Use --export to save all results"
  - Show first 20 matches only

## Success Criteria

The `/meetings-search` command is successful when:
1. ✅ Query string and filter flags parsed correctly
2. ✅ Filters validated (type, dates, status, section)
3. ✅ Search strategy determined based on filters
4. ✅ Meeting notes discovered (all or filtered by type/date)
5. ✅ Each meeting note searched for matches
6. ✅ Section filter applied correctly
7. ✅ Assignee filter applied (if provided)
8. ✅ Status filter applied (if provided)
9. ✅ Matching snippets extracted with context (2 lines before/after)
10. ✅ Results grouped by meeting
11. ✅ Results ranked by relevance (matches count, date)
12. ✅ Match statistics calculated (total matches, by section)
13. ✅ Results displayed with clear formatting:
    - Meeting metadata (title, date, type, file)
    - Match details (line number, section, context)
    - Highlighted keywords
14. ✅ Interactive selection offered (if reasonable number of results)
15. ✅ Export file created (if --export flag provided)
16. ✅ User receives comprehensive summary:
    - Search details (query, filters)
    - Results statistics
    - Export status
    - Next steps
17. ✅ Search completes in < 2 seconds (target performance)

## Future Enhancements

### v1.1.0
- Fuzzy matching for typo tolerance
- Regex pattern support for advanced queries
- Search result ranking by relevance score
- Saved searches (frequent queries)

### v1.2.0
- Search within SUMMARY.md files
- Search across archived items
- Timeline visualization of search results
- Boolean operators (AND, OR, NOT)

### v1.3.0
- AI-powered semantic search (meaning, not just keywords)
- Search result clustering by topic
- Integration with external search tools (Elasticsearch)
- Search analytics (popular queries, common filters)
