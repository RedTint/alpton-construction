# Meetings Edit Command

Update existing meeting notes with AI-assisted improvements, grammar fixes, content additions, and status updates while preserving structure and creating automatic backups.

## Execution Steps

### Phase 1: Parse Input and Locate Meeting Note

1. **Extract Document Reference**
   - Parse `{@doc}` parameter from command arguments
   - Format can be:
     - Short ID: `@001`, `@002`
     - Full filename: `@001-20260312-0930-sprint-planning`
     - Partial match: `@sprint-planning`
   - Extract reference without @ symbol for searching

2. **Extract Context Parameter**
   - Parse optional `"context..."` parameter
   - This guides what updates to make
   - Examples:
     - "Add action item: Complete API documentation by Friday, assign to Alex"
     - "Mark action item 2 as completed"
     - "Add decision about TypeScript strict mode"
     - "Fix grammar and formatting"
   - If not provided, will prompt user later

3. **Search for Matching Meeting Note**
   - Use Grep to search across all meeting notes
   - Search pattern depends on reference type:
     - If short ID (`001`): search for filenames starting with `001-`
     - If full/partial: search for filenames containing the reference
   - Search in: `./meetings/*/` (all type code directories)
   - Command: `find ./meetings -name "*{reference}*.md" -type f`
   - Exclude `000-README.md` and `000-SUMMARY.md` from results

4. **Handle Multiple or No Matches**
   - **No matches found:**
     - Display error: "No meeting note found matching: {@doc}"
     - Suggest using `/meetings-search` to find the meeting
     - List recent meetings from all type codes
     - Abort operation
   - **Single match:**
     - Proceed with that file
   - **Multiple matches:**
     - Display all matches with AskUserQuestion
     - Format: `{type_code}/{filename} - {meeting title from file}`
     - Let user select which meeting to edit
     - Use selected file path

5. **Read Current Meeting Note**
   - Use Read tool to load file content
   - Parse meeting title from first line (heading)
   - Note file path and type code for later

### Phase 2: Gather Update Context

1. **Determine Update Type**
   - If context parameter provided, analyze it to determine:
     - **Add action item:** Keywords "add action", "new action", "action item"
     - **Mark complete:** Keywords "mark complete", "completed", "done"
     - **Add decision:** Keywords "add decision", "decision about"
     - **Update discussion:** Keywords "add discussion", "note that"
     - **Fix grammar:** Keywords "fix", "correct", "grammar", "format"
     - **General update:** Any other context

2. **Prompt for Context if Not Provided**
   - Use AskUserQuestion: "What updates would you like to make to this meeting note?"
   - Options (multiSelect):
     - "Add new action items"
     - "Update action item status (mark complete/in progress)"
     - "Add or update decisions"
     - "Add discussion points"
     - "Fix grammar and formatting"
     - "Reorganize sections"
     - "Other (specify in text)"
   - Follow-up text input: "Describe the changes you want to make:"

3. **Parse Specific Update Instructions**
   - Extract details from context:
     - For action items: assignee, due date, description, status
     - For decisions: title, rationale, impact
     - For discussions: topic, summary
   - Examples:
     - "Add action item: Complete API docs by March 15, Alex" →
       - Description: "Complete API documentation"
       - Assignee: "Alex"
       - Due: "2026-03-15"
       - Status: "Open"
     - "Mark action item 2 as completed" →
       - Item number: 2
       - New status: "Completed"

### Phase 3: Create Backup

1. **Generate Backup Filename**
   - Original: `{###}-{YYYYMMDD-HHii}-{short-desc}.md`
   - Backup: `{###}-{YYYYMMDD-HHii}-{short-desc}.backup-{timestamp}.md`
   - Timestamp format: `YYYYMMDDHHmmss`
   - Example: `001-20260312-0930-sprint-planning.backup-20260312153045.md`

2. **Create Backup File**
   - Use Bash to copy file:
     ```bash
     cp "./meetings/{type_code}/{original}" "./meetings/{type_code}/{backup}"
     ```
   - Verify backup created successfully
   - Note backup path for summary

3. **Handle Backup Failure**
   - If backup creation fails:
     - Display error: "Could not create backup. Aborting edit for safety."
     - Do NOT proceed with edits
     - Suggest manual backup creation
     - Abort operation

### Phase 4: Apply Updates to Meeting Note

1. **Parse Current Content Sections**
   - Identify section boundaries using markdown headers:
     - Metadata (top section before first `---`)
     - ACTION ITEMS (## ACTION ITEMS)
     - DECISIONS (## DECISIONS)
     - DISCUSSION POINTS (## DISCUSSION POINTS)
     - NEXT STEPS (## NEXT STEPS)
     - Notes (bottom section)

2. **Apply Context-Guided Updates**

   **For "Add Action Item":**
   - Parse: description, assignee, due date, status
   - Find ACTION ITEMS section
   - Determine next item number (count existing items + 1)
   - Add new action item:
     ```markdown
     {N}. **{Description}** — Assignee: {name}, Due: {YYYY-MM-DD}, Status: {Open|In Progress|Completed|Blocked}
     ```
   - Insert at end of ACTION ITEMS list

   **For "Mark Action Item Complete/In Progress":**
   - Find specified action item by number
   - Update status field: `Status: Open` → `Status: Completed` (or In Progress, Blocked)
   - Preserve all other fields

   **For "Add Decision":**
   - Parse: title, rationale, impact, alternatives
   - Find DECISIONS section
   - Determine next decision number
   - Add new decision:
     ```markdown
     {N}. **{Title}**
        - Rationale: {why}
        - Impact: {what this affects}
        - Alternatives Considered: {alternatives if provided}
     ```

   **For "Add Discussion Point":**
   - Parse: topic, summary
   - Find DISCUSSION POINTS section
   - Add new subsection:
     ```markdown
     ### {Topic}

     {Summary}
     ```

   **For "Fix Grammar and Formatting":**
   - Perform grammar corrections throughout content
   - Fix markdown formatting issues
   - Ensure consistent spacing
   - Preserve structure and sections

   **For "Reorganize Sections":**
   - Follow specific instructions from context
   - Maintain all required sections
   - Ensure all content is preserved

3. **Validate Updated Content**
   - Check that all required sections are still present:
     - Metadata
     - ACTION ITEMS
     - DECISIONS
     - DISCUSSION POINTS
     - NEXT STEPS
     - Notes
   - Verify markdown formatting is valid
   - Ensure no content was accidentally removed

4. **Update Metadata if Changed**
   - If meeting title changed, update first line
   - Metadata fields (Date, Type, Attendees, etc.) generally preserved
   - Only update if explicitly requested in context

### Phase 5: Write Updated Content

1. **Write Updated Meeting Note**
   - Use Edit tool to update file with new content
   - Replace entire content (easiest for complex updates)
   - Alternative: Use targeted Edit for simple changes (status updates)

2. **Verify Write Success**
   - Confirm file was updated
   - Read file again to verify changes applied correctly

### Phase 6: Generate Diff Summary

1. **Compare Original vs Updated**
   - Read backup file (original content)
   - Read current file (updated content)
   - Identify changes:
     - Lines added
     - Lines modified
     - Lines removed (should be minimal)
     - Sections affected

2. **Categorize Changes**
   - ACTION ITEMS: {N} added, {M} updated
   - DECISIONS: {N} added
   - DISCUSSION POINTS: {N} topics added
   - NEXT STEPS: {N} items added
   - Grammar/formatting fixes: {N} changes
   - Other: {description}

3. **Format Diff Summary**
   - Show clear before/after for key changes
   - Highlight action item status changes
   - List newly added items

### Phase 7: Update README if Necessary

1. **Check if Title or Key Outcomes Changed**
   - Compare meeting title in original vs updated
   - If title changed, README needs update

2. **Update README Abstract (if needed)**
   - Read `./meetings/{type_code}/000-README.md`
   - Find entry for this meeting (by filename reference)
   - Update meeting title in abstract
   - Use Edit tool to make targeted update

3. **Handle README Update Failure**
   - If README update fails:
     - Note in summary
     - Suggest manual update
     - Still consider edit successful

### Phase 8: Generate Summary Report

1. **Collect Update Details**
   - Original filename
   - Backup filename
   - Changes made (categorized)
   - Sections affected
   - README update status

2. **Display Comprehensive Summary**
   ```
   ✅ Meeting note updated successfully!

   📝 Meeting Details:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   File:        ./meetings/{type_code}/{filename}
   Title:       {Meeting Title}
   Type:        {Meeting Type} ({type_code})
   Backup:      {backup-filename}

   ✏️ Changes Applied:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - ACTION ITEMS: {N} added, {M} updated
   - DECISIONS: {N} added
   - DISCUSSION POINTS: {N} topics added
   - Grammar/formatting: {description}

   📊 Diff Summary:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   {Specific changes with before/after examples}

   Example:
   + ACTION ITEM 3: Complete API documentation — Assignee: Alex, Due: 2026-03-15, Status: Open
   ~ ACTION ITEM 2: Status changed from "In Progress" to "Completed"

   💾 Backup Created:
   - ✅ Original saved: {backup-filename}
   - 📍 Location: ./meetings/{type_code}/

   🎯 Next Steps:

   1. Review changes in meeting note:
      cat ./meetings/{type_code}/{filename}

   2. Sync action items to summary:
      /meetings-update-progress @{###}

   3. Search for related action items:
      /meetings-search --assignee "{name}" --status Open

   4. If changes incorrect, restore from backup:
      cp ./meetings/{type_code}/{backup} ./meetings/{type_code}/{filename}

   ✨ Meeting note updated! Backup preserved for safety. ✨
   ```

3. **Provide Rollback Instructions**
   - Show exact command to restore from backup if needed
   - Note that backups are preserved (not auto-deleted)

## Input Format

**Command:**
```
/meetings-edit {@doc} "context..."
/meetings-edit {@doc}
```

**Examples:**
```bash
# Add action item with details
/meetings-edit @001 "Add action item: Complete API documentation by March 15, assign to Alex"

# Mark action item as completed
/meetings-edit @002-20260312-1600-sprint-retro "Mark action item 2 as completed"

# Add decision
/meetings-edit @sprint-planning "Add decision: Adopt TypeScript strict mode. Rationale: Reduces runtime errors. Impact: All new code must pass strict checks."

# Update discussion points
/meetings-edit @001 "Add discussion point about database migration timing under Performance topic"

# Fix grammar only
/meetings-edit @003 "Fix grammar and formatting throughout"

# Interactive mode (prompts for context)
/meetings-edit @001
```

## Output Format

```
✅ Meeting note updated successfully!

📝 Meeting Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
File:        ./meetings/spr/001-20260312-0930-sprint-12-planning.md
Title:       Sprint 12 Planning
Type:        Sprint Planning (spr)
Backup:      001-20260312-0930-sprint-12-planning.backup-20260312153045.md

✏️ Changes Applied:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- ACTION ITEMS: 1 added, 1 updated
- DECISIONS: 0 added
- DISCUSSION POINTS: 0 topics added
- Grammar/formatting: No changes

📊 Diff Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
+ ACTION ITEM 3: Complete API documentation — Assignee: Alex Chen, Due: 2026-03-15, Status: Open
~ ACTION ITEM 2: Update database migration scripts — Status changed from "In Progress" to "Completed"

💾 Backup Created:
- ✅ Original saved: 001-20260312-0930-sprint-12-planning.backup-20260312153045.md
- 📍 Location: ./meetings/spr/

🎯 Next Steps:

1. Review changes in meeting note:
   cat ./meetings/spr/001-20260312-0930-sprint-12-planning.md

2. Sync action items to summary:
   /meetings-update-progress @001

3. Search for Alex's open action items:
   /meetings-search --assignee "Alex Chen" --status Open

4. If changes incorrect, restore from backup:
   cp ./meetings/spr/001-20260312-0930-sprint-12-planning.backup-20260312153045.md ./meetings/spr/001-20260312-0930-sprint-12-planning.md

✨ Meeting note updated! Backup preserved for safety. ✨
```

## Important Notes

- **Backup Safety:** Always creates backup before any edits to prevent data loss
- **Context-Guided:** Uses natural language context to understand what changes to make
- **Structure Preservation:** Maintains all required sections even when making updates
- **Validation:** Checks that updated content still has all required sections
- **Flexible References:** Supports multiple doc reference formats (@001, @full-name, @partial)
- **Grammar Fixes:** Can perform intelligent grammar and formatting corrections
- **Status Updates:** Easy to update action item status (Open → In Progress → Completed)
- **Batch Updates:** Can make multiple types of changes in single command
- **README Sync:** Automatically updates README if meeting title changes
- **Rollback Support:** Backup files enable easy rollback if changes are incorrect
- **Diff Display:** Shows clear before/after summary of changes made

## Error Handling

**No Document Reference Provided:**
- Display error: "Please provide a meeting note reference using @doc syntax"
- Examples: `@001`, `@sprint-planning`, `@001-20260312-0930-sprint-planning`
- Suggest using `/meetings-search` to find meetings

**Meeting Note Not Found:**
- Display error: "No meeting note found matching: {@doc}"
- Suggest: "Use /meetings-search to find the meeting you're looking for"
- List recent meetings from all type codes as suggestions
- Abort operation

**Multiple Matches Found:**
- Display all matches with AskUserQuestion
- Format: `{type_code}/{filename} - {meeting title}`
- Let user select which meeting to edit
- If user cancels selection, abort operation

**Backup Creation Failed:**
- Display error: "Could not create backup file. Edit aborted for safety."
- Reason: Cannot safely edit without backup
- Check disk space and permissions
- Suggest manual backup: `cp original backup`
- Abort operation (do NOT edit without backup)

**File Write Failed:**
- Original file unchanged (backup creation ensures this)
- Display error: "Could not write updated content to file"
- Backup preserved at: {backup-path}
- Provide updated content for manual application
- Suggest: Restore from backup if needed

**Invalid Content After Update:**
- Validation detects missing required sections
- Display error: "Updated content is invalid - missing required sections"
- Sections required: Metadata, ACTION ITEMS, DECISIONS, DISCUSSION POINTS, NEXT STEPS, Notes
- Restore from backup automatically
- Display original content vs attempted update
- Ask user to clarify context and try again

**README Update Failed:**
- Meeting note updated successfully
- Display warning: "Could not update README index"
- Note: This is non-critical, main update succeeded
- Suggest manual README update if title changed

**Empty Context Provided:**
- Prompt user with AskUserQuestion
- Cannot proceed without knowing what to change
- Provide common update options as multiSelect
- If user cancels, abort operation

**Ambiguous Context:**
- Display warning: "Context is unclear. Please provide more specific instructions."
- Example clear context:
  - ✅ "Add action item: Complete docs, assign to Alex, due March 15"
  - ❌ "Update the meeting notes"
- Ask user to re-specify context
- Provide examples of clear context strings

## Success Criteria

The `/meetings-edit` command is successful when:
1. ✅ Document reference parsed and meeting note located
2. ✅ Context parameter extracted or prompted from user
3. ✅ Single matching meeting note identified (or user selects from multiple)
4. ✅ Current meeting note content read successfully
5. ✅ Update type determined from context (add action, mark complete, add decision, etc.)
6. ✅ Backup file created before any edits
7. ✅ Backup filename follows convention: `{original}.backup-{timestamp}.md`
8. ✅ Updates applied correctly based on context:
   - Action items added with all fields (description, assignee, due date, status)
   - Action item status updated correctly
   - Decisions added with rationale and impact
   - Discussion points added to appropriate topics
   - Grammar and formatting fixes applied
9. ✅ All required sections preserved in updated content
10. ✅ Markdown formatting remains valid
11. ✅ Updated content written to file successfully
12. ✅ Diff summary generated showing changes made
13. ✅ README updated if meeting title changed
14. ✅ User receives comprehensive summary with:
    - Changes applied (categorized)
    - Diff summary (before/after)
    - Backup location
    - Rollback instructions
15. ✅ Next steps provided (sync, search, review)

## Future Enhancements

### v1.1.0
- Batch editing (update multiple meetings at once)
- Template-based edits (apply same change to multiple meetings)
- AI-suggested improvements based on meeting type
- Automatic action item reminder generation

### v1.2.0
- Visual diff display (side-by-side comparison)
- Merge conflict resolution for concurrent edits
- Version history tracking beyond single backup
- Undo/redo support for multiple edit sessions

### v1.3.0
- Real-time collaborative editing
- Change attribution (who made which changes)
- Approval workflow for sensitive meeting notes
- Integration with calendar events for auto-updates
