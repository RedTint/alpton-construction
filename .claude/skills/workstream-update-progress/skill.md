# Workstream Update Progress Command

Automatically update workstream progress tracking documentation based on completion status of workstream atomic stories and their User Acceptance Criteria (UACs). Ensures consistent Change Log formatting with timestamps and comprehensive Next Steps sections for workstream-specific development.

## Execution Steps

### Phase 1: Identify Target Workstream

1. **Parse Workstream ID from Arguments**
   - Check if `--workstream {ID}` flag is present in command arguments
   - Extract workstream ID (e.g., `--workstream 001` → ID: 001)
   - Format: 3-digit zero-padded (001, 002, etc.)

2. **Auto-Detect Workstream (if not specified)**
   - Use Glob to find all workstreams: `docs/scrums/*/`
   - Count workstreams:
     - If **0 workstreams**: Display error (no workstreams exist)
     - If **1 workstream**: Auto-select (no flag needed)
     - If **2+ workstreams**: Require `--workstream {ID}` flag
   - Parse workstream ID from directory name (e.g., `001-cli-dashboard` → ID: 001)

3. **Validate Workstream Exists**
   - Verify directory exists: `docs/scrums/{ID}-{description}/`
   - If not found:
     - Display error: "Workstream not found: {ID}"
     - List available workstreams
     - Suggest: `/scrum-of-scrums {description}` to create new workstream

4. **Extract Workstream Details**
   - Parse workstream directory name to get description
   - Read workstream README: `docs/scrums/{ID}-{description}/000-README.md`
   - Extract workstream name and purpose
   - Note parent-mapped vs workstream-specific documents

### Phase 2: Read Workstream Atomic Stories

1. **Find Latest Workstream Atomic Stories Version**
   - Use Glob to find workstream atomic stories: `docs/scrums/{ID}-*/200-atomic-stories-v*.md`
   - Parse version numbers from filenames
   - Identify the latest version (highest semantic version)
   - Read the latest workstream atomic stories document

2. **Parse All Workstream Stories**
   - Extract all story sections from the workstream document
   - For each workstream story, capture:
     - Story ID (e.g., "Story W{ID}-001" for workstream-specific numbering)
     - Story title
     - Priority (High, Medium, Low)
     - Effort (story points)
     - Dependencies (both workstream and parent story dependencies)
     - All User Acceptance Criteria (UACs) with completion status (✅ or ⏳)
     - Test requirements and status
   - Build structured data model of all workstream stories

3. **Categorize Workstream Stories**
   - Separate stories by version:
     - Workstream v1.0.0 stories
     - Workstream v1.1.0 stories
     - Future workstream stories
   - Identify workstream story categories:
     - Workstream-specific features
     - Parent integration features
     - Workstream infrastructure

### Phase 3: Calculate Workstream Completion Status

1. **Analyze Workstream Story Completion**
   - For each workstream story, count:
     - Total UACs
     - Completed UACs (marked with ✅)
     - Pending UACs (marked with ⏳)
     - Blocked UACs (marked with ⏸️)
   - Calculate workstream story completion percentage: `(completed UACs / total UACs) * 100`
   - Determine workstream story status:
     - **Completed** (✅): All UACs marked as ✅
     - **In Progress** (🚧): Some UACs completed, some pending
     - **Blocked** (⏸️): Has blocked UACs
     - **Pending** (⏳): No UACs started
     - **Cancelled** (❌): Explicitly marked as cancelled

2. **Calculate Overall Workstream Progress**
   - Count total workstream stories
   - Count completed workstream stories (all UACs ✅)
   - Calculate overall workstream completion: `(completed stories / total stories) * 100`
   - Round to nearest integer

3. **Calculate Workstream Category Progress**
   - For each workstream category:
     - Count stories in category
     - Count completed stories
     - Calculate percentage
   - Identify which workstream categories are lagging

4. **Identify Workstream Blockers**
   - Find all workstream stories with status "Blocked" (⏸️)
   - Find all workstream UACs marked as blocked
   - Extract blocker descriptions from notes or comments
   - Check if blockers are workstream-specific or parent dependencies
   - Determine if blockers are resolving or escalating

### Phase 4: Find Workstream Progress Document

1. **Locate Workstream Progress File**
   - Look for `docs/scrums/{ID}-*/progress/000-progress-v*.md`
   - Find the version that matches workstream atomic stories version
     - If workstream atomic stories is v1.0.0, find workstream progress-v1.0.0.md
     - If workstream atomic stories is v1.1.0, find or create workstream progress-v1.1.0.md
   - If matching version not found, use latest version or create new one

2. **Read Current Workstream Progress Document**
   - Parse existing workstream progress data
   - Note current completion percentages for comparison
   - Identify existing workstream blockers to see if they've been resolved
   - Extract current "Last Updated" date
   - **Read existing Change Log section** to understand current format
   - **Extract existing Next Steps sections** to preserve manual additions

### Phase 5: Detect What Changed Since Last Workstream Update

1. **Compare Workstream Story Statuses**
   - For each workstream story, compare current status vs workstream progress doc status
   - Identify newly completed workstream stories (⏳ → ✅ or 🚧 → ✅)
   - Identify newly started workstream stories (⏳ → 🚧)
   - Identify newly blocked workstream stories (any → ⏸️)
   - Track newly completed UACs per workstream story

2. **Categorize Workstream Changes**
   - **Workstream Features Completed:** Full workstream stories marked ✅
   - **Workstream UACs Completed:** Individual workstream UACs marked ✅
   - **Workstream Code Generated:** New workstream files created
   - **Workstream Tests Added:** Test files for workstream
   - **Parent Integration:** Integration points with parent project
   - **Workstream Documentation Updated:** New workstream docs or architecture files

3. **Calculate Workstream Metrics**
   - Total lines of workstream code/documentation added
   - Workstream story points delivered since last update
   - Number of workstream files created/modified
   - Workstream test coverage added

### Phase 6: Generate Workstream Change Log Entry

1. **Get Current Timestamp**
   - Use Bash: `date +"%B %d, %Y %H:%M"`
   - Format: "February 28, 2026 14:30"
   - For major workstream releases, use just date: "February 28, 2026"

2. **Determine Workstream Entry Type**
   Based on workstream changes detected:
   - **🚀 Workstream Release vX.X.X** - For official workstream version releases
   - **✅ Workstream Story Completion** - When workstream story fully completed
   - **🛠️ Workstream Development Progress** - Workstream features created
   - **📋 Workstream Documentation Update** - Doc-only changes
   - **🐛 Workstream Bug Fixes** - Bug-related work in workstream
   - **🔗 Parent Integration** - Integration with parent project

3. **Structure Workstream Change Log Entry**
   Follow this exact format:

   ```markdown
   ### {Date} [{Time}] - {Emoji} {Title}
   - {Emoji} **Workstream {ID}: {Action}** ({metrics})
     - {Detail line 1}
     - {Detail line 2}
     - {Detail line 3}
   - {Emoji} **{Action} {Item}** ({metrics})
     - {Details}
   - 📊 **Total:** {summary metrics}
   ```

   **Examples:**

   ```markdown
   ### February 28, 2026 14:30 - 🛠️ CLI Dashboard Development
   - 🖥️ **Workstream 001: Completed Story W001-002** (13 story points)
     - Terminal-based dashboard rendering
     - Real-time metrics polling from parent API
     - Color-coded status indicators
     - 7 unit tests created
   - 📊 **Total:** 8 workstream UACs completed, 15 files generated
   ```

   ```markdown
   ### February 28, 2026 - 🚀 Workstream 001 Release v1.0.0
   - 🎉 **Workstream 001: CLI Dashboard v1.0.0 Released**
     - All 4 v1.0.0 stories completed
     - 25 UACs implemented
     - Integration with parent API validated
   - 📄 **Workstream Release Notes:** [v1.0.0](../releases/workstream-001-v1.0.0.md)
   - 🏷️ **Git Tag:** workstream-001-v1.0.0
   ```

4. **Use Appropriate Emojis**
   - 🖥️ CLI/Terminal features
   - 📱 Mobile features
   - 🔗 Integration/API features
   - 🛠️ Development progress
   - 🐛 Bug fixes
   - 🎨 Design/UI features
   - 🎯 Goals/Targets
   - 📊 Metrics/Statistics
   - 📄 Documentation
   - 🏷️ Git tags
   - 🚀 Releases
   - ✅ Completions

5. **Include All Relevant Workstream Details**
   For each item:
   - **Action verb** (Completed, Updated, Released, Implemented, Fixed)
   - **Workstream ID** (W{ID}-### for story IDs)
   - **Item name** (story ID, feature name)
   - **Metrics in parentheses** (lines of code, story points, file count)
   - **Bullet points** (3-7 key details, features, or achievements)
   - **File paths** when relevant (workstream-specific paths)
   - **Links** to workstream release notes, ADRs, or documentation

6. **Add Total Summary**
   Always end entry with:
   ```markdown
   - 📊 **Total:** {X} workstream UACs / {Y} story points / {Z} files
   ```

### Phase 7: Generate Workstream Next Steps Section

1. **Analyze Remaining Workstream Work**
   - Read workstream atomic stories to find all pending workstream stories
   - Categorize by priority (High, Medium, Low)
   - Check dependencies (both workstream and parent) to determine which are ready to start
   - Calculate workstream story points for remaining work

2. **Create Immediate Actions (This Sprint)**
   - List 1-3 actionable items for current workstream sprint
   - Focus on:
     - Unblocking workstream blockers
     - Completing in-progress workstream stories
     - High-priority pending workstream stories with no dependencies
   - Format:
     ```markdown
     ### Immediate Actions (This Sprint)

     1. **Complete Story W{ID}-003: {Title}** (8 pts)
        - Implement remaining 5 UACs
        - Add integration tests with parent API
        - Validate terminal color schemes

     2. **Resolve Blocker: {Description}**
        - Parent API endpoint needed for feature X
        - Coordinate with parent project team
     ```

3. **Create Short Term (Next 2-4 Weeks)**
   - List remaining high-priority workstream stories from current version
   - Group by workstream category if helpful
   - Format:
     ```markdown
     ### Short Term (Next 2-4 Weeks)

     **Remaining Workstream v{X.X.X} High Priority Stories:**
     1. Story W{ID}-004: {Title} - {X} points
     2. Story W{ID}-005: {Title} - {X} points

     **Parent Integration Points:**
     - Integrate with parent API v1.1.0 endpoints
     - Validate against parent database schema
     ```

4. **Create Medium Term (Next 1-3 Months)**
   - List next workstream version goals
   - Include optional workstream stories
   - Add workstream strategic initiatives
   - Format:
     ```markdown
     ### Medium Term (Next 1-3 Months)

     1. **Complete Workstream v{X.X.X} Release**
        - All {N} workstream stories completed
        - Comprehensive workstream testing
        - Workstream documentation updates

     2. **Workstream v{X+1.X.X} Planning**
        - Advanced CLI features
        - Parent project integration enhancements
     ```

5. **Add Long Term Section (if applicable)**
   For major future workstream versions:
   ```markdown
   ### Long Term (Next 3-6 Months)

   1. **Workstream v{X.0.0} Planning** — {Vision statement}
   2. **Workstream-to-Parent Merge** — Integration and consolidation
   ```

6. **Ensure Consistency**
   - Check that all pending high-priority workstream stories are mentioned
   - Verify workstream story points are accurate
   - Include parent dependencies when applicable
   - Maintain priority ordering (High before Medium)
   - Check workstream dependencies are noted

### Phase 8: Update Workstream Progress Document

1. **Update Last Updated Field**
   - Replace date in "Last Updated" line
   - Format: `**Last Updated:** {Date} (Workstream {ID}: {Brief description of what changed})`
   - Example: `**Last Updated:** February 28, 2026 (Workstream 001: Story W001-002 completed ✅)`

2. **Update Workstream Progress Summary**
   - Update "Overall Workstream Completion" percentage
   - Update workstream version-specific completion percentages
   - Update workstream story counts

3. **Update Each Workstream Story Section**
   - For each workstream story in atomic stories:
     - Find corresponding section in workstream progress document
     - Update status emoji (✅, 🚧, ⏸️, ⏳, ❌)
     - Update "Status" field text
     - Update completion dates if newly completed
     - Check off completed UACs (change ⏳ to ✅)
     - Add notes about new workstream completions
     - Update workstream test status if tests written

4. **Update Workstream Feature Completion by Category**
   - Update workstream category progress percentages
   - Mark completed workstream categories with ✅
   - Keep pending workstream categories with ⏳

5. **Update Workstream Blockers and Issues Section**
   - Add new workstream blockers to "Active Blockers" list
   - Move resolved workstream blockers to "Resolved Blockers" list
   - Include blocker details:
     - Workstream Story ID affected
     - Description of blocker (workstream-specific or parent dependency)
     - Severity (High, Medium, Low)
     - Mitigation steps taken or planned

6. **Prepend New Change Log Entry**
   - Add new entry to the top of Change Log section
   - Keep existing entries (reverse chronological order)
   - Maintain consistent formatting

7. **Update Next Steps Section**
   - Replace "Immediate Actions" section with new content
   - Replace "Short Term" section with new content
   - Replace "Medium Term" section with new content
   - Preserve any manually added sections

8. **Write Updated Workstream Progress Document**
   - Use Edit tool to update workstream progress file
   - Preserve all existing content structure
   - Ensure proper markdown formatting

### Phase 9: Generate Summary Report

1. **Collect Summary Data**
   - Workstream ID and name
   - Total workstream UACs completed since last update
   - Workstream stories completed
   - Workstream story points delivered
   - Files created/modified in workstream
   - Overall workstream progress percentage
   - Change log entry created
   - Next steps generated

2. **Display Comprehensive Summary**
   ```
   ✅ Workstream {ID} progress updated successfully!

   📊 Workstream Progress Summary:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Workstream ID:   {ID}
   Name:            {Workstream Name}
   Path:            docs/scrums/{ID}-{description}/

   📈 Progress Update:
   - Stories Completed: {X}/{Y} ({Z}%)
   - UACs Completed: {X}/{Y} ({Z}%)
   - Story Points Delivered: {X} points
   - Overall Workstream Completion: {Z}%

   📝 Changes Since Last Update:
   - {X} workstream stories completed
   - {Y} workstream UACs marked as done
   - {Z} workstream files created/modified
   - {N} workstream tests added

   🔄 Workstream Change Log Entry Added:
   ### {Date} [{Time}] - {Title}
   - {Summary of changes}

   🎯 Workstream Next Steps Generated:
   - Immediate Actions: {X} items
   - Short Term: {Y} items
   - Medium Term: {Z} items

   📄 Updated Document:
   - docs/scrums/{ID}-{description}/progress/000-progress-v{version}.md

   🎯 Next Actions for Workstream {ID}:

   1. **Review Updated Progress:**
      cat docs/scrums/{ID}-{description}/progress/000-progress-v{version}.md

   2. **Continue Workstream Development:**
      {Next workstream story to implement}

   3. **Build Remaining Workstream Features:**
      /workstream-build --workstream {ID}

   4. **Create Workstream Release (when ready):**
      /release --workstream {ID}

   ✨ Workstream {ID} ({Name}) progress tracking updated! ✨
   ```

## Input Format

**Command:**
```
/workstream-update-progress --workstream {ID}
/workstream-update-progress
```

**Examples:**
```
/workstream-update-progress --workstream 001

/workstream-update-progress --workstream 002

/workstream-update-progress
(Auto-detects if only one workstream exists)
```

## Output Format

```
✅ Workstream 001 progress updated successfully!

📊 Workstream Progress Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Workstream ID:   001
Name:            CLI Dashboard
Path:            docs/scrums/001-cli-dashboard/

📈 Progress Update:
- Stories Completed: 2/4 (50%)
- UACs Completed: 13/25 (52%)
- Story Points Delivered: 13 points
- Overall Workstream Completion: 52%

📝 Changes Since Last Update:
- 1 workstream story completed (Story W001-002)
- 8 workstream UACs marked as done
- 15 workstream files created/modified
- 7 workstream tests added

🔄 Workstream Change Log Entry Added:
### February 28, 2026 14:30 - 🛠️ CLI Dashboard Development
- 🖥️ **Workstream 001: Completed Story W001-002** (13 story points)
  - Terminal-based dashboard rendering
  - Real-time metrics polling from parent API
  - Color-coded status indicators
  - 7 unit tests created
- 📊 **Total:** 8 workstream UACs completed, 15 files generated

🎯 Workstream Next Steps Generated:
- Immediate Actions: 2 items
- Short Term: 2 remaining stories
- Medium Term: 1 version planning item

📄 Updated Document:
- docs/scrums/001-cli-dashboard/progress/000-progress-v1.0.0.md

🎯 Next Actions for Workstream 001:

1. **Review Updated Progress:**
   cat docs/scrums/001-cli-dashboard/progress/000-progress-v1.0.0.md

2. **Continue Workstream Development:**
   Implement Story W001-003: Real-time metrics display (8 pts)

3. **Build Remaining Workstream Features:**
   /workstream-build --workstream 001

4. **Create Workstream Release (when ready):**
   /release --workstream 001

✨ Workstream 001 (CLI Dashboard) progress tracking updated! ✨
```

## Important Notes

- **Workstream Isolation**: Progress tracking is completely separate from parent project
- **Workstream Story IDs**: Use W{ID}-### format for workstream-specific story numbering
- **Parent Dependencies**: Track parent dependencies that may block workstream progress
- **Auto-Detection**: If only one workstream exists, `--workstream {ID}` flag is optional
- **Timestamp Format**: Always include date and time for workstream change log entries
- **Metrics**: Track workstream-specific metrics (story points, UACs, files)
- **Next Steps**: Generate workstream-specific action items and recommendations
- **Integration Awareness**: Note parent integration points in workstream progress
- **Version Alignment**: Workstream version may differ from parent project version
- **Change Log**: Workstream change log is separate from parent change log

## Error Handling

**No Workstream ID Specified (Multiple Workstreams Exist):**
- Display error: "Multiple workstreams found. Please specify which one to update."
- List available workstreams:
  ```
  Available workstreams:
  - 001-cli-dashboard
  - 002-mobile-app
  - 003-admin-portal
  ```
- Suggest: "/workstream-update-progress --workstream {ID}"

**Workstream Not Found:**
- Display error: "Workstream not found: {ID}"
- List available workstreams
- Suggest: "/scrum-of-scrums {description}" to create new workstream

**No Workstreams Exist:**
- Display error: "No workstreams found in docs/scrums/"
- Suggest: "/scrum-of-scrums {description}" to create first workstream
- Or: "Use /update-progress for parent project progress"

**Workstream Atomic Stories Not Found:**
- Display error: "Workstream atomic stories not found: docs/scrums/{ID}-*/200-atomic-stories-v*.md"
- Suggest: "/define @scrums/{ID}-{desc}/200-atomic-stories-v1.0.0.md"

**Workstream Progress Not Found:**
- Create workstream progress file automatically
- Initialize with workstream stories from atomic stories
- Display note: "Created workstream progress: docs/scrums/{ID}-*/progress/000-progress-v1.0.0.md"

**No Changes Detected:**
- Display message: "No changes detected in workstream {ID} since last update"
- Show current workstream progress summary
- Suggest reviewing pending workstream stories

**Progress Update Failed:**
- Display error: "Could not update workstream progress file"
- Check disk space and permissions
- Provide content for manual update
- List what was calculated

**Date Command Failed:**
- Default to current date from system
- Continue with progress update
- Note: Timestamp may be less precise

## Success Criteria

The `/workstream-update-progress` command is successful when:
1. ✅ Workstream ID identified (auto-detected or from flag)
2. ✅ Workstream directory validated
3. ✅ Workstream atomic stories read successfully
4. ✅ All workstream stories parsed with UACs
5. ✅ Workstream completion status calculated
6. ✅ Workstream progress document located/created
7. ✅ Changes since last update detected
8. ✅ Workstream change log entry generated with proper format
9. ✅ Workstream next steps generated with actionable items
10. ✅ Workstream progress document updated with all sections
11. ✅ User receives comprehensive summary with:
    - Workstream details
    - Progress metrics
    - Changes summary
    - Change log entry preview
    - Next steps count
    - Next actions
12. ✅ Workstream progress is accurately tracked
13. ✅ Documentation is up-to-date and consistent

## Future Enhancements

### v1.1.0
- Workstream velocity tracking (story points per sprint)
- Workstream burndown charts (visual progress)
- Parent dependency tracking (blockers from parent project)
- Workstream milestone tracking

### v1.2.0
- Multi-workstream progress comparison dashboard
- Workstream integration readiness scoring
- Automated workstream release notes generation
- Workstream risk analysis (blockers, delays)

### v1.3.0
- Workstream-to-parent merge impact analysis
- Cross-workstream dependency visualization
- Workstream resource allocation tracking
- Workstream completion predictions (ML-based)
