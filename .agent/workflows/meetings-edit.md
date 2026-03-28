---
description: Update meeting notes with AI-assisted improvements, grammar fixes, and status updates while preserving structure and creating backups
---

1. Parse Input and Locate Meeting Note
   Extract document reference from arguments
   Format can be: @001, @001-20260312-0930-sprint-planning, or @sprint-planning
   Remove @ symbol for searching

   // Note: Manual user input required if context not provided
   Extract context parameter (optional): "context..."
   Examples:
   - "Add action item: Complete API docs by March 15, assign to Alex"
   - "Mark action item 2 as completed"
   - "Add decision about TypeScript strict mode"
   - "Fix grammar and formatting"

   If context not provided, ask: "What updates would you like to make?"

2. Search for Matching Meeting Note
   Search across all meeting notes:
   Run: find ./meetings -name "*{reference}*.md" -type f
   Exclude: 000-README.md and 000-SUMMARY.md

   Handle matches:
   - No matches: Display error and abort
   - Single match: Proceed with that file
   - Multiple matches: // Note: Manual user input required
     Ask user to select from list

   Read meeting note content from matched file

3. Determine Update Type from Context
   Analyze context parameter to determine:
   - Add action item: Keywords "add action", "new action", "action item"
   - Mark complete: Keywords "mark complete", "completed", "done"
   - Add decision: Keywords "add decision", "decision about"
   - Update discussion: Keywords "add discussion", "note that"
   - Fix grammar: Keywords "fix", "correct", "grammar", "format"
   - General update: Any other context

   Parse specific instructions:
   - For action items: extract assignee, due date, description, status
   - For decisions: extract title, rationale, impact
   - For discussions: extract topic, summary

4. Create Backup
   Generate backup filename:
   Original: {###}-{YYYYMMDD-HHii}-{short-desc}.md
   Backup: {###}-{YYYYMMDD-HHii}-{short-desc}.backup-{timestamp}.md

   Create backup:
   Run: cp "./meetings/{type_code}/{original}" "./meetings/{type_code}/{backup}"

   Verify backup created successfully
   If backup fails: Display error and abort (do NOT edit without backup)

5. Apply Updates to Meeting Note
   Parse current content sections:
   - Metadata (before first ---)
   - ACTION ITEMS (## ACTION ITEMS)
   - DECISIONS (## DECISIONS)
   - DISCUSSION POINTS (## DISCUSSION POINTS)
   - NEXT STEPS (## NEXT STEPS)
   - Notes (bottom section)

   Apply context-guided updates based on type determined in step 3:

   For "Add Action Item":
   - Determine next item number
   - Add to ACTION ITEMS section:
     {N}. **{Description}** — Assignee: {name}, Due: {YYYY-MM-DD}, Status: Open

   For "Mark Action Item Complete/In Progress":
   - Find specified action item by number
   - Update status field: Status: Open → Status: Completed
   - Preserve all other fields

   For "Add Decision":
   - Determine next decision number
   - Add to DECISIONS section:
     {N}. **{Title}**
        - Rationale: {why}
        - Impact: {what this affects}

   For "Add Discussion Point":
   - Add to DISCUSSION POINTS section:
     ### {Topic}
     {Summary}

   For "Fix Grammar and Formatting":
   - Perform grammar corrections throughout
   - Fix markdown formatting
   - Preserve structure

   Validate updated content has all required sections

6. Write Updated Content
   Update meeting note file with new content
   Replace entire file content or use targeted edits for simple changes

   Verify write success by reading file again

7. Generate Diff Summary
   Compare original (from backup) vs updated (current file)

   Identify changes:
   - Lines added
   - Lines modified
   - Sections affected

   Categorize changes:
   - ACTION ITEMS: N added, M updated
   - DECISIONS: N added
   - DISCUSSION POINTS: N topics added
   - Grammar/formatting fixes

   Format diff showing before/after for key changes

8. Update README if Necessary (Optional)
   If meeting title changed:
   - Read ./meetings/{type_code}/000-README.md
   - Find entry for this meeting (by filename)
   - Update meeting title in abstract

   If README update fails:
   - Note in summary
   - Still consider edit successful

9. Generate Summary Report
   Display comprehensive summary:
   ```
   ✅ Meeting note updated successfully!

   📝 Meeting Details:
   File:        ./meetings/{type_code}/{filename}
   Title:       {Meeting Title}
   Type:        {Meeting Type} ({type_code})
   Backup:      {backup-filename}

   ✏️ Changes Applied:
   - ACTION ITEMS: {N} added, {M} updated
   - DECISIONS: {N} added
   - DISCUSSION POINTS: {N} topics added
   - Grammar/formatting: {description}

   📊 Diff Summary:
   + ACTION ITEM 3: Complete API documentation — Assignee: Alex, Due: 2026-03-15, Status: Open
   ~ ACTION ITEM 2: Status changed from "In Progress" to "Completed"

   💾 Backup Created:
   - Original saved: {backup-filename}
   - Location: ./meetings/{type_code}/

   🎯 Next Steps:
   1. Review changes: cat ./meetings/{type_code}/{filename}
   2. Sync action items: /meetings-update-progress @{###}
   3. Search related: /meetings-search --assignee "{name}" --status Open
   4. If incorrect, restore from backup:
      cp ./meetings/{type_code}/{backup} ./meetings/{type_code}/{filename}
   ```
