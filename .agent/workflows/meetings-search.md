---
description: Search across all meeting notes for action items, decisions, and discussion points with powerful filtering and contextual snippets
---

1. Parse Search Query and Filters
   Extract main search query from arguments
   Required: {query} - keyword or phrase to search for

   Parse optional filter flags:
   - --type {code}: Filter by meeting type (spr, cls, ard, etc.)
   - --date-from {YYYY-MM-DD}: Meetings on or after this date
   - --date-to {YYYY-MM-DD}: Meetings on or before this date
   - --assignee {name}: Filter action items by assignee
   - --status {Open|In Progress|Completed|Blocked}: Filter action items by status
   - --section {action-items|decisions|discussion|all}: Search specific sections only
   - --export {filename}: Export results to markdown file

   Validate filter values

2. Build Search Scope
   Determine which directories to search:
   - If --type provided: ./meetings/{type_code}/
   - If no --type: ./meetings/*/ (all type codes)

   Determine which files to search:
   - Always exclude: 000-README.md, 000-SUMMARY.md
   - Include: all {###}-{YYYYMMDD-HHii}-*.md files

   Determine date range:
   - If --date-from or --date-to provided: parse from filename timestamps
   - Filter files by date range before searching content

3. Execute Search Across Meeting Notes
   Search for query in all files within scope:
   Run: grep -rn -i "{query}" ./meetings/{type_code}/ --include="*.md" --exclude="000-*.md"

   Options:
   - -r: Recursive search
   - -n: Show line numbers
   - -i: Case-insensitive
   - -A 2: Include 2 lines after match (context)
   - -B 2: Include 2 lines before match (context)

   If --section filter provided:
   - For action-items: grep within ## ACTION ITEMS sections only
   - For decisions: grep within ## DECISIONS sections only
   - For discussion: grep within ## DISCUSSION POINTS sections only
   - For all: search entire file (default)

4. Parse and Filter Search Results
   For each match found:
   - Extract file path: ./meetings/{type_code}/{filename}
   - Extract line number where match occurred
   - Extract matching line text
   - Extract 2 lines before and 2 lines after (context)
   - Parse meeting metadata from file:
     - Meeting title (first line)
     - Date (from metadata section)
     - Type (from metadata section)
     - Attendees (from metadata section)

   Apply additional filters:

   If --assignee filter:
   - Check if match is in ACTION ITEMS section
   - Parse "Assignee: {name}" field
   - Include only if assignee matches filter

   If --status filter:
   - Check if match is in ACTION ITEMS section
   - Parse "Status: {status}" field
   - Include only if status matches filter

   Build result entry:
   - File reference: {type_code}/{filename}
   - Line reference: [{doc-id}:L{line}]
   - Match type: Action Item / Decision / Discussion / General
   - Context: 2 lines before + match + 2 lines after
   - Metadata: title, date, type, attendees

5. Group and Rank Results
   Group results by meeting:
   - Meeting 1: {title} ({date})
     - Match 1: [{doc-id}:L{line}] {context}
     - Match 2: [{doc-id}:L{line}] {context}
   - Meeting 2: {title} ({date})
     - Match 1: [{doc-id}:L{line}] {context}

   Rank meetings by:
   - Primary: Number of matches (most matches first)
   - Secondary: Date (most recent first)

   Highlight matching text in context snippets

6. Calculate Search Statistics
   Count total:
   - Meetings searched
   - Meetings with matches
   - Total matches found
   - Matches by type: Action Items, Decisions, Discussions, General
   - Matches by status (if filtering action items)

7. Present Results Interactively
   // Note: Manual user interaction required
   Display results summary first:
   ```
   🔍 Search Results for "{query}"

   📊 Statistics:
   - Meetings searched: {N}
   - Meetings with matches: {M}
   - Total matches: {K}

   Matches by type:
   - Action Items: {N}
   - Decisions: {M}
   - Discussion Points: {K}
   - General: {L}
   ```

   Use interactive selection to show grouped results:
   Ask user: "Select a meeting to view details"
   Options:
   - Meeting 1: {title} ({date}) - {N} matches
   - Meeting 2: {title} ({date}) - {M} matches
   - ...
   - [View All Matches]
   - [Export to File]
   - [Cancel]

   When user selects a meeting:
   - Display all matches from that meeting with full context
   - Show clickable references: [{doc-id}:L{line}]

   Provide option to open meeting file:
   Show command: cat ./meetings/{type_code}/{filename}

8. Export Results (Optional)
   If --export flag provided or user selects "Export to File":

   Generate export filename:
   - If --export {filename}: use provided name
   - Otherwise: search-results-{query}-{timestamp}.md

   Create markdown export file:
   ```
   # Meeting Search Results

   **Query:** "{query}"
   **Date:** {YYYY-MM-DD HH:MM}
   **Filters Applied:**
   - Type: {type_code or "All"}
   - Date Range: {from} to {to}
   - Assignee: {name or "All"}
   - Status: {status or "All"}
   - Section: {section or "All"}

   **Statistics:**
   - Meetings searched: {N}
   - Meetings with matches: {M}
   - Total matches: {K}

   ---

   ## Results by Meeting

   ### [{type_code}/{filename}](./{type_code}/{filename}) - {title}

   **Date:** {YYYY-MM-DD}
   **Type:** {Meeting Type}
   **Matches:** {N}

   #### Match 1: [{doc-id}:L{line}]

   **Context:**
   ```
   {2 lines before}
   {matching line with highlighted text}
   {2 lines after}
   ```

   **Type:** Action Item / Decision / Discussion
   **Assignee:** {name} (if action item)
   **Status:** {status} (if action item)

   ---
   ```

   Write export file to: ./meetings/search-results-{query}-{timestamp}.md

   Display: "Results exported to: {filename}"

9. Generate Summary Report
   Display comprehensive summary:
   ```
   🔍 Search complete!

   📋 Search Summary:
   Query:           "{query}"
   Type Filter:     {type_code or "All"}
   Date Range:      {from} to {to}
   Assignee Filter: {name or "All"}
   Status Filter:   {status or "All"}
   Section Filter:  {section or "All"}

   📊 Results:
   Meetings searched: {N}
   Meetings matched:  {M}
   Total matches:     {K}

   Breakdown:
   - Action Items: {N} matches
   - Decisions: {M} matches
   - Discussion Points: {K} matches
   - General: {L} matches

   🔗 Top Results:
   1. [{type_code}/{filename}] {title} - {N} matches
   2. [{type_code}/{filename}] {title} - {M} matches
   3. [{type_code}/{filename}] {title} - {K} matches

   📂 Export:
   Results saved to: {export-filename} (if exported)

   🎯 Next Steps:
   1. Open a meeting: cat ./meetings/{type_code}/{filename}
   2. Jump to line: cat ./meetings/{type_code}/{filename} | sed -n '{line}p'
   3. Refine search with more filters
   4. Update action items: /meetings-edit @{doc-id}
   ```

   Provide suggestion for refining search if too many results (>50 matches)
   Provide suggestion for broadening search if no results
