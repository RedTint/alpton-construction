# Update Progress Command

Automatically update progress tracking documentation based on completion status of atomic stories and their User Acceptance Criteria (UACs). Ensures consistent Change Log formatting with timestamps and comprehensive Next Steps sections.

## Execution Steps

### Phase 1: Git Branch Safety Check

1. **Check Current Git Branch**
   - Use Bash: `git rev-parse --abbrev-ref HEAD`
   - Store current branch name in variable
   - Examples: `main`, `develop`, `staging`, `feature/update-docs`

2. **Identify Protected Branches**
   - Protected branch list: `main`, `master`, `develop`, `staging`, `production`
   - Check if current branch matches any protected branch (case-insensitive)

3. **Handle Protected Branch Detection**
   - If on protected branch:
     - Display warning (not error, since progress updates are less destructive than builds):
       ```
       ⚠️  PROTECTED BRANCH DETECTED ⚠️

       You are currently on branch: {branch_name}

       It's recommended to update progress on a feature branch for easier review.

       Continue anyway? [y/N]
       ```
     - Use AskUserQuestion to confirm
     - If user declines, exit gracefully
     - If user confirms, proceed with warning note in summary

4. **Display Branch Confirmation**
   - If on safe branch (non-protected):
     - Display:
       ```
       ✅ Git Branch: {branch_name} (safe for updates)
       ```
   - If on protected branch but confirmed:
     - Display:
       ```
       ⚠️  Git Branch: {branch_name} (protected - updating with confirmation)
       ```

### Phase 2: Aggregate Epic & Story Stats

1. **Detect Project Format**
   - Check if `docs/epics/` directory exists and contains epic subdirectories
   - If `docs/epics/` is populated → **use script path** (new epic format)
   - If only `docs/200-atomic-stories-v*.md` exists → **fall back to legacy parse** (old format)
   - Display detected format:
     ```
     📂 Format: Epic folder structure (docs/epics/)
     ```

2. **Run Reconcile + Aggregation Script** (epic format)
   - Execute via Bash:
     ```bash
     node .ai-dev/ai-dev-scripts/aggregate-epics.js --reconcile --docs-path=./docs
     ```
   - `--reconcile` does three things atomically:
     1. **Reads body UAC checkboxes** from each story file (`- [x]` / `- [ ]` lines in the UAC section)
     2. **Syncs frontmatter** UAC stats (`uac_completed`, `uac_pending`, `uac_completion_pct`, `uac_by_type`) from the body counts
     3. **Moves story files** to the correct status directory when status changes (e.g., all UACs checked → moves to `done/`). Forward-only rule: stories already in `done/` are never moved back; instead, any unchecked boxes in their body are checked off to make the file consistent.
     4. After all moves, rewrites stale `epic.md` frontmatter stats (implies `--update`)
   - Capture stdout as JSON and parse it into `stats` variable
   - If script fails (non-zero exit), display error and abort
   - Display confirmation:
     ```
     ✅ Epic stats reconciled — {N} epics, {M} stories, {P} total points
        {X} story files updated · {Y} moved to new status dirs
     ```

3. **Extract Key Metrics from Script Output**
   Store for use in subsequent phases:
   - `stats.overall.completionPct` → overall completion percentage
   - `stats.overall.totalStories` / `completedStories` / `pendingStories` / `inProgressStories`
   - `stats.overall.totalPoints` / `completedPoints` / `pendingPoints`
   - `stats.overall.uacTotal` / `uacCompleted` / `uacPending` / `uacCompletionPct`
   - `stats.overall.uacByType` → breakdown by fe/be/db/devops/cli/test
   - `stats.epics[]` → per-epic breakdown with stories array
   - For each epic: `epicId`, `epicName`, `epicStatus`, `completionPct`, `byStatus`
   - For each story: `storyId`, `storyName`, `storyStatus`, `storyPoints`, `uacCompleted`, `uacTotal`

4. **Identify Blockers from Script Data**
   - Filter `stats.epics[].stories` where `storyStatus === 'blocked'`
   - These are active blockers requiring documentation in progress doc
   - `stats.overall.blockedStories` gives the count

5. **Calculate Velocity from Story Completion Dates**
   - Filter stories where `completedAt !== null` across all epics
   - Sort by `completedAt` descending
   - Current sprint: stories completed in last 14 days → sum `storyPoints`
   - Historical: stories completed in last 60 days → avg points/week
   - Trend: compare current sprint vs historical average
     - If current > historical × 1.1 → "accelerating"
     - If current < historical × 0.9 → "decelerating"
     - Else → "stable"

6. **Check for Draft Atomic Stories** (informational only)
   - Use Glob: `docs/200-atomic-stories-v*-draft.md`
   - If draft files found, display info:
     ```
     ℹ️  Draft Stories Detected

     Draft versions found (not tracked): 200-atomic-stories-v{Y}.0-draft.md
     To promote draft to production: /define --finalize @atomic-stories-v{Y}.0-draft.md
     ```

### Phase 3: Build Change Summary

1. **Read Current Progress Document** (covered in Phase 4) to compare before/after
   - Note the *previous* `overall_completion` and per-epic percentages
   - These deltas drive the Change Log entry content

2. **Determine What Changed**
   - Compare `stats.overall.completionPct` vs previous value in progress doc
   - For each epic in `stats.epics`: compare `completionPct` vs progress doc section
   - Identify newly completed stories: stories in `done/` whose `completedAt` is recent (today or since last update)
   - Identify newly started stories: stories in `in-progress/` not previously tracked
   - Identify resolved blockers: stories moved out of `blocked/`

3. **Calculate Category Progress from Epic Versions**
   - Group epics by `epicVersion` (v1.0.0, v1.1.0, etc.)
   - For each version group: sum stories/points, calculate completion %
   - These map to the "By Version" section in the progress doc

4. **Identify Blockers**
   - All stories with `storyStatus === 'blocked'` (from `stats`)
   - Extract story name, epic, and any notes from the story file body
   - Determine severity from story priority field

### Phase 4: Find Progress Document

1. **Locate Progress File**
   - Look for `docs/progress/000-progress-v*.md`
   - Find the version that matches atomic stories version
     - If atomic stories is v1.0.0, find progress-v1.0.0.md
     - If atomic stories is v1.1.0, find or create progress-v1.1.0.md
   - If matching version not found, use latest version or create new one

2. **Read Current Progress Document**
   - Parse existing progress data
   - Note current completion percentages for comparison
   - Identify existing blockers to see if they've been resolved
   - Extract current "Last Updated" date
   - **Read existing Change Log section** to understand current format
   - **Extract existing Next Steps sections** to preserve manual additions
   - **Check for existing archive statistics** to compare with current state

### Phase 5: Detect What Changed Since Last Update

1. **Compare Story Statuses**
   - For each story, compare current status vs progress doc status
   - Identify newly completed stories (⏳ → ✅ or 🚧 → ✅)
   - Identify newly started stories (⏳ → 🚧)
   - Identify newly blocked stories (any → ⏸️)
   - Track newly completed UACs per story

2. **Categorize Changes**
   - **Skills Created:** New `/command-name` skills added
   - **Stories Completed:** Full stories marked ✅
   - **UACs Completed:** Individual UACs marked ✅
   - **Features Released:** Version releases tagged
   - **Documentation Updated:** New docs or architecture files
   - **Antigravity Conversions:** Skills converted to workflows
   - **Personas Created:** New AI dev personas

3. **Detect Compression Events**
   - Compare current atomic stories structure with what progress.md last saw
   - Check if any stories moved from full format to compressed format
   - Check if new archive files were created in `docs/archive/`
   - If compression detected:
     - Note: "Compression applied to v{X}.0 stories"
     - Record: Number of stories compressed
     - Record: Compression level applied (Level 1/2/3)
     - Record: Archive file created (if applicable)
     - Calculate: Document size reduction percentage
   - Store compression event data for change log

4. **Calculate Metrics**
   - Total lines of code/documentation added
   - Story points delivered since last update
   - Number of files created/modified
   - Test coverage added
   - Document compression statistics (if compression occurred)

### Phase 6: Generate Change Log Entry

1. **Get Current Timestamp**
   - Use Bash: `date +"%B %d, %Y %H:%M"`
   - Format: "February 26, 2026 14:30"
   - For major releases, use just date: "February 26, 2026"

2. **Determine Entry Type**
   Based on changes detected:
   - **🚀 Release vX.X.X** - For official version releases
   - **✅ Story Completion** - When story fully completed
   - **🛠️ Development Progress** - Skills/features created
   - **📋 Documentation Update** - Doc-only changes
   - **🐛 Bug Fixes** - Bug-related work
   - **🎭 Special Features** - Unique features (personas, etc.)
   - **📦 Document Compression** - When atomic stories compression applied

3. **Structure Change Log Entry**
   Follow this exact format:

   ```markdown
   ### {Date} [{Time}] - {Emoji} {Title}
   - {Emoji} **{Action} `/command-name`** ({metrics})
     - {Detail line 1}
     - {Detail line 2}
     - {Detail line 3}
   - {Emoji} **{Action} {Item}** ({metrics})
     - {Details}
   - 📊 **Total:** {summary metrics}
   ```

   **Examples:**

   ```markdown
   ### February 26, 2026 14:30 - 🛠️ Additional Development Skills
   - 🔍 **Created `/search-backlog` command** (588 lines)
     - Search atomic stories and progress documentation
     - Find features, stories, tasks, bugs, tech debt by keyword
     - Gather comprehensive context from 17+ document types
   - 📊 **Total:** 2,618 lines of skill infrastructure
   ```

   ```markdown
   ### February 22, 2026 - 🎭 AI Dev Persona System (Release v1.5.0)
   - 🎭 **Created `/create-ai-dev-persona` command** (1,318 lines)
     - RPG-style persona creation with strategic frameworks
   - 🚀 **Released v1.5.0** - AI Dev Persona System
   - 📄 **Release Notes:** [v1.5.0](../releases/release-v1.5.0.md)
   - 🏷️ **Git Tag:** v1.5.0
   ```

4. **Use Appropriate Emojis**
   - 🔍 Search/Find features
   - 🐛 Bug fixes
   - 🔍 Code review
   - 🎨 Design/UI features
   - 🎭 Personas/Characters
   - 🎯 Goals/Targets
   - 🌐 Web/Conversion features
   - 🔄 Conversions/Transformations
   - 📊 Metrics/Statistics
   - 📄 Documentation
   - 🏷️ Git tags
   - 🚀 Releases
   - ✅ Completions
   - 📦 Compression/Archiving

5. **Include All Relevant Details**
   For each item:
   - **Action verb** (Created, Updated, Released, Completed, Fixed)
   - **Item name** (command name, story ID, feature name)
   - **Metrics in parentheses** (lines of code, story points, file count)
   - **Bullet points** (3-7 key details, features, or achievements)
   - **File paths** when relevant
   - **Links** to release notes, ADRs, or documentation

6. **Add Total Summary**
   Always end entry with:
   ```markdown
   - 📊 **Total:** {X} lines of {type} / {Y} story points / {Z} files
   ```

7. **Add Compression Entry** (if compression event detected)
   If compression was applied during this update:
   ```markdown
   ### {Date} {Time} - 📦 Document Compression Applied
   - 📦 **Compressed atomic stories v{X}.0** (Level {1/2/3} compression)
     - {N} completed stories compressed to {summary/list/aggregate} format
     - Full details archived to docs/archive/atomic-stories-v{X}.0-full.md
     - Document size reduced by ~{percentage}%
   - 📊 **Total:** {N} stories compressed, {size-reduction} KB saved
   ```

### Phase 7: Generate Next Steps Section

1. **Analyze Remaining Work**
   - Read atomic stories to find all pending stories
   - Categorize by priority (High, Medium, Low)
   - Check dependencies to determine which are ready to start
   - Calculate story points for remaining work

2. **Create Immediate Actions (This Sprint)**
   - List 1-3 actionable items for current sprint
   - Focus on:
     - Unblocking blockers
     - Completing in-progress stories
     - High-priority pending stories with no dependencies
   - Format:
     ```markdown
     ### Immediate Actions (This Sprint)

     1. **{Action Item Title}:**
        - {Detail 1}
        - {Detail 2}
        - {Detail 3}
     ```

3. **Create Short Term (Next 2-4 Weeks)**
   - List remaining high-priority stories from current version
   - Group by category if helpful
   - Format:
     ```markdown
     ### Short Term (Next 2-4 Weeks)

     **Remaining v{X.X.X} High Priority Stories:**
     1. Story {ID} (`/{command-name}`) - {X} points
     2. Story {ID} (`/{command-name}`) - {X} points

     **Remaining v{X.X.X} Medium Priority Stories:**
     4. Story {ID} (`/{command-name}`) - {X} points
     ```

4. **Create Medium Term (Next 1-3 Months)**
   - List next version goals
   - Include optional stories
   - Add strategic initiatives
   - Format:
     ```markdown
     ### Medium Term (Next 1-3 Months)

     1. **Complete v{X.X.X} Release**
        - All {N} stories completed
        - Comprehensive testing
        - Documentation updates

     2. **Optional: Story {ID} (`/{command-name}`)** - {X} points

     3. **v{X+1.X.X} Planning** — {Description}
     ```

5. **Add Long Term Section (if applicable)**
   For major future versions:
   ```markdown
   ### Long Term (Next 3-6 Months)

   1. **v{X.0.0} Planning** — {Vision statement}
   2. **{Strategic Initiative}** — {Description}
   ```

6. **Ensure Consistency**
   - Check that all pending high-priority stories are mentioned
   - Verify story points are accurate
   - Include command names when applicable
   - Maintain priority ordering (High before Medium)
   - Check dependencies are noted

### Phase 8: Update Progress Document

1. **Generate YAML Frontmatter** (NEW - Progress v2.0.0 format)
   - Create structured YAML frontmatter with all progress stats
   - This makes data easily parsable by frontend dashboard and `/sync-board`
   - Check if file already has frontmatter:
     - If yes: Parse existing, update values, preserve custom fields
     - If no: Create new frontmatter block
   - Insert or update at top of file (before markdown title)

   **Frontmatter Structure:**
   ```yaml
   ---
   version: "{version from progress filename}"
   project_name: "{extracted from document or CLAUDE.md}"
   date_created: "{first creation date}"
   last_updated: "{current timestamp ISO 8601}"

   # Overall Progress
   overall_completion: {percentage}
   total_stories: {count}
   completed_stories: {count}
   in_progress_stories: {count}
   blocked_stories: {count}
   pending_stories: {count}
   cancelled_stories: {count}

   # Story Points
   total_points: {sum of all effort}
   completed_points: {sum of completed effort}
   in_progress_points: {sum of in-progress effort}
   pending_points: {sum of pending effort}

   # Version Progress (calculated from atomic stories)
   mvp_completion: {percentage for v1.0.0}
   mvp_stories: {count for v1.0.0}
   mvp_completed: {completed count for v1.0.0}
   future_versions:
     - version: "1.1.0"
       total_stories: {count}
       completed_stories: {count}
       completion: {percentage}
     - version: "1.2.0"
       total_stories: {count}
       completed_stories: {count}
       completion: {percentage}

   # Category Progress
   categories:
     - name: "{category name}"
       completion: {percentage}
       stories_total: {count}
       stories_completed: {count}

   # Velocity Metrics
   velocity:
     current_sprint_points: {points completed in current sprint}
     avg_points_per_week: {total_completed_points / weeks_elapsed}
     historical_avg_points: {average from archive if available}
     trend: "stable"  # accelerating, stable, decelerating
     last_3_sprints: [{points}, {points}, {points}]

   # Timeline
   timeline:
     project_start_date: "{YYYY-MM-DD}"
     mvp_target_date: "{YYYY-MM-DD}"
     mvp_completion_date: "{YYYY-MM-DD or null}"
     projected_completion_date: "{based on velocity}"
     days_elapsed: {count}
     estimated_days_remaining: {based on velocity}

   # Test Coverage
   test_coverage:
     overall_percentage: {average across all modules}
     unit_tests_count: {count of TEST: UACs for unit tests}
     integration_tests_count: {count of TEST: UACs for integration}
     e2e_tests_count: {count of TEST: UACs for e2e}
     target_coverage: 80
     coverage_by_category:
       - category: "{category name}"
         coverage: {percentage}
         target: 80

   # Blockers
   active_blockers_count: {count where status != resolved}
   resolved_blockers_count: {count where status == resolved}
   blockers:
     - story_id: "{story ID}"
       severity: "{low/medium/high/critical}"
       description: "{blocker description}"
       reported_date: "{YYYY-MM-DD}"
       resolved_date: "{YYYY-MM-DD or null}"
       status: "{active/resolved}"

   # Risk Assessment
   risks:
     high: {count}
     medium: {count}
     low: {count}

   # Links to related docs
   atomic_stories_file: "docs/200-atomic-stories-v{version}.md"
   prd_file: "docs/002-prd-v{version}.md"
   linked_docs:
     - "{path to related doc}"

   # Metadata
   generated_by: "/update-progress"
   format_version: "2.0.0"
   ---
   ```

   **Calculation Logic:**
   - `overall_completion`: Round((completed_stories / total_stories) * 100)
   - `total_points`: Sum of all story effort points
   - `completed_points`: Sum of effort where status == completed
   - `mvp_completion`: (mvp_completed / mvp_stories) * 100
   - `categories[].completion`: (stories_completed / stories_total) * 100
   - `velocity.avg_points_per_week`: completed_points / weeks_since_start
   - `velocity.trend`: Compare current velocity to historical average
     - If current > historical * 1.1: "accelerating"
     - If current < historical * 0.9: "decelerating"
     - Else: "stable"
   - `timeline.days_elapsed`: Days since project_start_date
   - `timeline.estimated_days_remaining`: pending_points / (avg_points_per_week / 7)
   - `test_coverage.overall_percentage`: Average of all test coverage percentages
   - `test_coverage.unit_tests_count`: Count of completed TEST: UACs with "unit test" in description
   - `active_blockers_count`: Blockers array where status != "resolved"

2. **Add Frontmatter Note in Markdown Body**
   - After the frontmatter and main title, add note:
     ```markdown
     > **Note:** Stats above auto-generated from atomic stories tracking.
     > See YAML frontmatter for structured data accessible by dashboard.
     ```

3. **Update Last Updated Field** (in both frontmatter and markdown body)
   - Frontmatter: `last_updated: 2026-03-15T14:30:00Z`
   - Markdown body: Replace date in "Last Updated" line
   - Update "Overall Completion" percentage
   - Update version-specific completion percentages
   - Update story counts

3. **Update Each Story Section**
   - For each story in atomic stories:
     - Find corresponding section in progress document
     - Update status emoji (✅, 🚧, ⏸️, ⏳, ❌)
     - Update "Status" field text
     - Update completion dates if newly completed
     - Check off completed UACs (change ⏳ to ✅)
     - Add notes about new completions
     - Update test status if tests written

4. **Update Feature Completion by Category**
   - Update category progress percentages
   - Mark completed categories with ✅
   - Keep pending categories with ⏳

5. **Update Blockers and Issues Section**
   - Add new blockers to "Active Blockers" list
   - Move resolved blockers to "Resolved Blockers" list
   - Include blocker details:
     - Story ID affected
     - Description of blocker
     - Severity (High, Medium, Low)
     - Mitigation steps taken or planned
     - Owner responsible for resolution

6. **Update Velocity and Timeline**
   - Update current sprint progress
   - Calculate velocity based on completed story points
   - Update milestone completion percentages
   - Adjust estimated completion dates if needed

7. **Update Change Log**
   - Insert new Change Log entry at the top of the Change Log section
   - Place immediately after `## Change Log` heading
   - Add separator `---` before previous entry
   - Preserve all previous entries
   - Maintain chronological order (newest first)

8. **Update Next Steps Section**
   - Replace entire "## Next Steps" section with newly generated content
   - Ensure all subsections are present:
     - ### Immediate Actions (This Sprint)
     - ### Short Term (Next 2-4 Weeks)
     - ### Medium Term (Next 1-3 Months)
     - ### Long Term (if applicable)

### Phase 8b: Story File Sync (Epic Structure)

> **Only runs when `docs/epics/` is the active format.**
> This phase is executed automatically because Phase 2 calls `--reconcile` which already
> handles steps 1–4 below. Verify the results here and surface them to the user.

1. **Confirm files were reconciled** (from Phase 2 script stderr output):
   - How many story files had UAC counts updated
   - How many files were moved to a new status directory
   - Example output from script stderr:
     ```
     Moved:   005-312-monetization-planning.md  pending/ → done/
     Updated: 005-313-poc-building.md
     Reconcile: 2 file(s) updated, 1 moved.
     Updated 1 of 7 epic.md file(s).
     ```

2. **Include file moves in the Change Log entry** (Phase 6):
   - If any stories were moved: note them explicitly
   - Example: "✅ Story 312 promoted to `done/` (UACs 100% complete)"

3. **If `--reconcile` was NOT used** (legacy atomic stories format fallback):
   - After updating the progress doc, manually locate each story whose status changed
   - Use Glob: `docs/epics/*/{pending,in-progress,qa,done,blocked}/{epic_id}-{story_id}-*.md`
   - For each status change: move file, update `story_status`, `uac_completed`, `completed_at`, `updated_at` in frontmatter
   - After all moves: run `node .ai-dev/ai-dev-scripts/aggregate-epics.js --update` to refresh epic.md stats

### Phase 9: Validate and Write

1. **Validate Updated Content**
   - Verify all percentages are between 0-100
   - Check that completed story count matches stories with all UACs ✅
   - Ensure dates are in correct format (YYYY-MM-DD or Month DD, YYYY)
   - Verify Markdown formatting is correct
   - **Validate Change Log format:**
     - Entry has proper heading (### Date [Time] - Emoji Title)
     - Each item has emoji, bold action, metrics
     - Bullet points properly indented
     - Total summary included
   - **Validate Next Steps format:**
     - All required subsections present
     - Story IDs and points accurate
     - Command names included where applicable

2. **Write Updated Progress Document**
   - Use Edit tool to update specific sections (preferred)
   - Or use Write tool to replace entire file
   - Preserve document structure and formatting
   - Maintain version number in filename and header

3. **Handle Version Alignment**
   - If atomic stories version doesn't match progress version:
     - Display version mismatch info
     - Ask user if new progress version should be created
     - If yes:
       - Use Bash to copy latest progress file:
         ```bash
         cp docs/progress/000-progress-v{current}.md docs/progress/000-progress-v{new}.md
         ```
       - Use Edit tool to update version in header
       - Use Edit tool to align with new atomic stories version
       - Continue with normal update flow
     - If no:
       - Update existing file
       - Add note in change log about version mismatch

**IMPORTANT:** Never use Write tool to create new progress versions
- Always use `cp` to copy existing version first
- Then use Edit tool for version updates
- Preserves all change log history and story tracking data

### Phase 10: Generate Summary Report

1. **Compare Before and After**
   - Calculate progress delta (new % - old %)
   - List newly completed stories
   - List newly completed UACs
   - Identify new blockers
   - Note resolved blockers

2. **Generate Insights**
   - Velocity trend (stories/week)
   - Estimated completion date for remaining stories
   - Risk assessment based on blockers
   - Recommendations for next sprint

3. **Display Comprehensive Summary**
   - Show clear, concise progress update
   - Highlight achievements (completed stories)
   - Flag concerns (new blockers, delayed milestones)
   - **Display Change Log entry preview**
   - **Display Next Steps summary**
   - Suggest next actions

## Input Format

**Command:**
```
/update-progress
```

No arguments required - automatically detects and processes latest atomic stories and progress files.

**Optional Arguments (Future):**
```
/update-progress --version 1.1.0          # Update specific version
/update-progress --story 004              # Update specific story only
/update-progress --dry-run                # Show changes without writing
```

## Output Format

```
✅ Progress tracking updated successfully!

📝 Git Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Branch:    feature/update-progress-docs
Protected: No

📊 Progress Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Previous:  60% (3 of 5 MVP stories)
Current:   80% (4 of 5 MVP stories)
Change:    +20% ⬆️

📦 Archive Summary (if archive exists):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Archived Versions:     v1.0.0 - v1.3.0
Archived Stories:      28 stories (150 points)
Archive Files:         1 file
Archive Location:      docs/archive/atomic-stories-v1.0.0-v1.3.0-full.md
Compression Applied:   Level 3 (aggregate summary)
Document Size Saved:   ~847 KB (65% reduction)

🎯 Completed Since Last Update:
- ✅ Story 004 - Progress Tracking System
  - All 7 UACs completed
  - 5 story points delivered

📋 Current Status by Category:
- Documentation System:  100% ✅ (2/2 stories)
- Core Commands:          67% 🚧 (2/3 stories)
- Build Automation:       0% ⏳ (0/3 stories)
- Advanced Features:      0% ⏳ (0/1 story)

⚠️ Blockers:
No active blockers

🔓 Resolved Blockers:
None

📈 Velocity:
- Current sprint: 16 story points completed
- Last 4 weeks: 8 points/week
- Historical avg: 12 points/week (from 28 archived + 5 active stories)
- Trend: -33% (current below historical average)
- Projected completion: March 1, 2026

📝 Change Log Entry Added:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### February 26, 2026 14:30 - ✅ Progress Tracking Enhanced
- 🔄 **Updated `/update-progress` command** (enhanced)
  - Consistent Change Log formatting with timestamps
  - Comprehensive Next Steps sections
  - Automatic priority-based task organization
- 📊 **Total:** Story 004 complete (5 points)

🎯 Next Steps Updated:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### Immediate Actions (This Sprint)
1. Complete Story 005 (ADR Management) - 3 points
2. Begin Story 101 (Build Frontend Command) - 13 points

### Short Term (Next 2-4 Weeks)
**Remaining v1.1.0 High Priority Stories:**
1. Story 102 (`/build-be`) - 13 points
2. Story 103 (`/build-devops`) - 13 points

### Medium Term (Next 1-3 Months)
1. Complete v1.1.0 Release
2. v1.2.0 Planning — Cross-IDE compatibility

📝 Updated File: docs/progress/000-progress-v1.0.0.md
🕐 Last Updated: February 26, 2026 14:30

✨ Great progress! Keep up the momentum! ✨
```

## Change Log Format Reference

### Standard Entry Format

```markdown
### {Month} {Day}, {Year} [{Hour}:{Minute}] - {Emoji} {Title}
- {Emoji} **{Action} `/command-name`** ({metrics})
  - {Detail 1}
  - {Detail 2}
  - {Detail 3}
- {Emoji} **{Action} {Item}** ({metrics})
  - {Details}
- 📊 **Total:** {summary}
```

### Release Entry Format

```markdown
### {Month} {Day}, {Year} - 🚀 Release vX.X.X
- **Released vX.X.X - {Release Name}**
- **Release Type:** {Major/Minor/Patch} Feature Release
- **Stories Included:** {count} ({story IDs})
- **Story Points Delivered:** {points} points
- **Key Achievements:**
  - ✅ **{Achievement 1}:** {Description}
  - ✅ **{Achievement 2}:** {Description}
- 📄 **Release Notes:** [vX.X.X](../releases/release-vX.X.X.md)
- 🏷️ **Git Tag:** vX.X.X
```

### Update Entry Format

```markdown
### {Month} {Day}, {Year} (Update {N} - vX.X.X) - {Title} {Emoji}

**{Story ID} — {Layer} {Status}:**
- {Detail 1}
- {Detail 2}

**Progress Delta:**
- **Story {ID}:** {before} → {after}
- **Story {ID} status:** {before} → {after}
- **Overall completion:** {before} → {after}
- **v{X.X.X}:** {before} → {after}

**Next:** {What's next}
```

## Next Steps Format Reference

### Complete Structure

```markdown
## Next Steps

### Immediate Actions (This Sprint)

1. **{Actionable Item Title}:**
   - {Detail or step 1}
   - {Detail or step 2}
   - {Detail or step 3}

2. **{Another Item}:**
   - {Details}

### Short Term (Next 2-4 Weeks)

**Remaining v{X.X.X} High Priority Stories:**
1. Story {ID} (`/{command-name}`) - {points} points
2. Story {ID} (`/{command-name}`) - {points} points
3. Story {ID} (`/{command-name}`) - {points} points

**Remaining v{X.X.X} Medium Priority Stories:**
4. Story {ID} (`/{command-name}`) - {points} points
5. Story {ID} (`/{command-name}`) - {points} points

### Medium Term (Next 1-3 Months)

1. **Complete v{X.X.X} Release**
   - All {N} stories completed
   - Comprehensive testing
   - Documentation updates
   - Release notes generation

2. **Optional: Story {ID} (`/{command-name}`)** - {points} points

3. **v{X+1.X.X} Planning** — {Description of next version}

### Long Term (Next 3-6 Months)

1. **v{X.0.0} Vision** — {Strategic vision}
2. **{Strategic Initiative}** — {Description}
```

## Detailed Calculation Logic

### Story Completion Status

```typescript
function calculateStoryStatus(story: Story): Status {
  const totalUACs = story.uacs.length
  const completedUACs = story.uacs.filter(uac => uac.status === '✅').length
  const blockedUACs = story.uacs.filter(uac => uac.status === '⏸️').length

  if (blockedUACs > 0) {
    return 'Blocked' // ⏸️
  }

  if (completedUACs === 0) {
    return 'Pending' // ⏳
  }

  if (completedUACs === totalUACs) {
    return 'Completed' // ✅
  }

  return 'In Progress' // 🚧
}
```

### Overall Completion Percentage

```typescript
function calculateOverallCompletion(stories: Story[]): number {
  const mvpStories = stories.filter(s => s.version === 'v1.0.0')
  const completedStories = mvpStories.filter(s => {
    return s.uacs.every(uac => uac.status === '✅')
  })

  const percentage = (completedStories.length / mvpStories.length) * 100
  return Math.round(percentage)
}
```

### Category Progress

```typescript
function calculateCategoryProgress(category: string, stories: Story[]): number {
  const categoryStories = stories.filter(s => s.category === category)
  const completed = categoryStories.filter(s => s.status === 'Completed')

  return Math.round((completed.length / categoryStories.length) * 100)
}
```

### Velocity Calculation

```typescript
function calculateVelocity(completedStories: Story[], timeframe: number): number {
  const totalPoints = completedStories.reduce((sum, s) => sum + s.effort, 0)
  return totalPoints / timeframe // points per week
}
```

## Progress Document Structure to Update

The skill updates these sections in the progress document:

1. **Last Updated** (Line ~6)
   - Update date and brief description

2. **Progress Summary** (Lines 11-13)
   - Overall completion percentage
   - Story counts
   - Version-specific completion

3. **Story Sections** (Lines 24+)
   - Individual story status
   - UAC checkboxes
   - Completion dates
   - Notes

4. **Feature Completion by Category** (Lines ~250+)
   - Category percentages
   - Status emojis

5. **Blockers and Issues** (Lines ~300+)
   - Active blockers list
   - Resolved blockers list

6. **Velocity and Timeline** (Lines ~350+)
   - Sprint progress
   - Velocity metrics
   - Milestone dates

7. **Change Log** (Lines ~500+)
   - **NEW ENTRY INSERTED AT TOP**
   - Separator added before previous entry
   - Chronological order maintained (newest first)

8. **Next Steps** (Lines ~900+)
   - **ENTIRE SECTION REPLACED**
   - All subsections regenerated
   - Priority-based organization

## Blocker Detection

Blockers are identified by:
- UACs marked with ⏸️ emoji
- Stories with "Blocked" status
- Notes mentioning "blocker", "blocked", "waiting for", "dependency"
- Stories past due date with no progress

Blocker severity determined by:
- **High**: Blocks multiple stories or critical path
- **Medium**: Blocks single story
- **Low**: Slows progress but doesn't fully block

## Version Alignment

The progress document version should match atomic stories version:

| Atomic Stories | Progress Document | Action |
|---------------|------------------|--------|
| v1.0.0 | v1.0.0 | ✅ Update existing |
| v1.1.0 | v1.0.0 | ⚠️ Ask to create v1.1.0 |
| v1.1.0 | v1.1.0 | ✅ Update existing |
| v1.0.0 | v1.1.0 | ⚠️ Version mismatch warning |

## Important Notes

- **Automatic Detection:** Command auto-detects latest atomic stories and progress files
- **Draft Exclusion:** Automatically excludes `-draft` documents from progress tracking
- **Git Branch Safety:** Warns when running on protected branches (main/staging/develop)
- **Compression Awareness:** Handles compressed story formats (Level 1/2/3) from `/new-feature`
- **Archive Support:** Recognizes and processes archived stories in `docs/archive/`
- **Historical Velocity:** Calculates velocity using both active and archived story data
- **Non-Destructive:** Preserves all manual notes and custom sections
- **Idempotent:** Can run multiple times safely
- **Version-Aware:** Handles multiple versions of atomic stories
- **Smart Updates:** Only updates changed sections, preserves rest
- **Validation:** Verifies all calculations before writing
- **Rollback-Safe:** Old version preserved if creating new version
- **Timestamp Precision:** Includes hour and minute for detailed tracking
- **Change Log Consistency:** Follows exact format from existing entries
- **Compression Event Logging:** Tracks and reports compression activities with 📦 emoji
- **Next Steps Intelligence:** Automatically organizes by priority and dependencies
- **Emoji Standards:** Uses consistent emojis for each type of change
- **Metrics Tracking:** Captures lines of code, story points, file counts, compression stats
- **Archive Statistics:** Displays archive summary with versions, stories, points, and size savings

## Error Handling

**Atomic Stories Not Found:**
- Display error: "No atomic stories found in docs/"
- Suggest: "Run /setup or create 200-atomic-stories-v1.0.0.md first"

**Protected Branch Warning:**
- If on protected branch:
  - Display warning with branch name
  - Ask user to confirm: "Continue anyway? [y/N]"
  - If declined: Exit gracefully with message
  - If confirmed: Proceed with warning note in summary

**Progress File Not Found:**
- Create new progress file if it doesn't exist
- Initialize with structure from atomic stories
- Note that this is first progress update

**Version Mismatch:**
- Warn user about version discrepancy
- Ask whether to create new version or update existing
- Provide clear guidance on which option to choose

**Calculation Error:**
- Log error details
- Display user-friendly message
- Complete partial update if possible
- Don't corrupt existing progress file

**Parse Error:**
- Note which story or section failed to parse
- Continue with remaining stories
- Include error note in output
- Request user to check atomic stories format

**Change Log Format Error:**
- If existing Change Log doesn't match expected format:
  - Display warning
  - Attempt to insert new entry at top anyway
  - Suggest manual review of Change Log section

**Next Steps Parsing Error:**
- If cannot parse existing Next Steps:
  - Display warning
  - Generate new Next Steps from atomic stories
  - Note that manual additions may be lost

**Compressed Story Parsing Error:**
- If compressed story format unrecognized:
  - Log warning with story ID
  - Skip that story's detailed parsing
  - Continue with other stories
  - Note in summary: "Some compressed stories could not be parsed"

**Archive Read Error:**
- If archive file exists but cannot be read:
  - Log warning with file path
  - Continue without archive data
  - Note in summary: "Archive detected but could not be loaded"

## Success Criteria

The `/update-progress` command is successful when:
1. ✅ Git branch safety check performed (warning on protected branches)
2. ✅ Draft documents excluded from progress tracking
3. ✅ All story statuses accurately reflect UAC completion (including compressed stories)
4. ✅ Archive folder detected and processed (if exists)
5. ✅ Compressed story formats parsed correctly (Level 1/2/3)
6. ✅ Overall completion percentage is correct
7. ✅ Category progress percentages are accurate
8. ✅ Blockers are identified and documented
9. ✅ Historical velocity calculated using archived data (if available)
10. ✅ Compression events detected and logged
11. ✅ **Change Log entry added with proper timestamp format**
12. ✅ **Change Log follows consistent emoji and structure patterns**
13. ✅ **Compression entry added to Change Log (if compression occurred)**
14. ✅ **Next Steps section fully regenerated with all subsections**
15. ✅ **High-priority stories listed in Short Term section**
16. ✅ **Medium-priority stories listed appropriately**
17. ✅ **Immediate Actions focused on current sprint**
18. ✅ Progress document is written successfully
19. ✅ User receives clear summary of changes
20. ✅ **Summary includes git branch information**
21. ✅ **Summary includes archive statistics (if archive exists)**
22. ✅ **Summary includes Change Log preview**
23. ✅ **Summary includes Next Steps preview**
24. ✅ **Summary shows historical velocity with archive contribution**

## Future Enhancements

### v1.1.0
- Compare with git history to auto-detect completions
- Integration with GitHub Issues/PRs
- Slack notifications on progress updates
- Trend analysis and burndown charts
- Automatic story point estimation for new stories

### v1.2.0
- Automatic progress updates on UAC completion
- Real-time progress dashboard integration with `/sync-board`
- Team member contribution tracking
- Milestone alerts and reminders
- Historical Change Log analysis and insights

### v2.0.0
- Multi-project progress tracking
- Advanced analytics and forecasting
- Integration with project management tools (Jira, Linear)
- Automated sprint planning
- AI-powered next steps recommendations
- Burndown chart generation
