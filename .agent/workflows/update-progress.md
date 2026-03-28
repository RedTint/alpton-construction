---
description: Update progress tracking docs using aggregate-epics.js --reconcile to sync UAC checkboxes, move story files, refresh epic stats, then update the progress doc with change log and next steps.
---

1. Git Branch Safety Check
   Run: git rev-parse --abbrev-ref HEAD
   Store branch name.

   Protected branches: main, master, develop, staging, production

   If on protected branch:
   - Warn user (not a hard error):
       ⚠️  PROTECTED BRANCH: {branch_name}
       Recommended: use a feature branch for progress updates.
       Continue anyway? [y/N]
   - Manual confirmation required (AskUserQuestion not available in Antigravity)
   - If declining: exit gracefully
   - If proceeding: note in summary

   If on safe branch: display "✅ Branch: {branch_name}"

2. Run Aggregation + Reconcile Script
   // ⚠️ KEY SCRIPT — run this first, all stats come from here
   // Script location: .ai-dev/ai-dev-scripts/aggregate-epics.js
   // Full path from project root:  node .ai-dev/ai-dev-scripts/aggregate-epics.js

   Run:
     node .ai-dev/ai-dev-scripts/aggregate-epics.js --reconcile --docs-path=./docs

   What --reconcile does atomically:
   1. Parses UAC checkboxes from each story file's "## User Acceptance Criteria" body section
   2. Syncs frontmatter stats (uac_total, uac_completed, uac_completion_pct, uac_by_type)
   3. Moves story files to correct status dirs (pending/ → in-progress/ → done/) based on UAC completion
      - 0% checked   → pending/
      - 1–99% checked → in-progress/
      - 100% checked  → done/ (sets completed_at timestamp)
      - blocked/ stories are NEVER auto-promoted
      - done/ stories are NEVER moved backward (unchecked boxes get checked off instead)
   4. Refreshes epic.md frontmatter stats for all affected epics
   5. Then runs --update to write any remaining stale epic.md files

   Capture stdout as JSON → parse into stats variable.
   If script exits non-zero: display error and abort.

   Display confirmation:
     ✅ Reconcile complete — {N} epics, {M} stories, {P} total points

   // Fallback if docs/epics/ doesn't exist (legacy flat-file format):
   // Run: node .ai-dev/ai-dev-scripts/aggregate-epics.js --update --docs-path=./docs
   // OR fall back to reading docs/200-atomic-stories-v*.md directly

3. Extract Key Metrics from Script Output
   From stats.overall:
   - completionPct, totalStories, completedStories, inProgressStories, blockedStories, pendingStories
   - totalPoints, completedPoints, pendingPoints
   - uacTotal, uacCompleted, uacPending, uacCompletionPct
   - uacByType (fe/be/db/devops/cli/test breakdown)

   From stats.epics[]:
   - epicId, epicName, epicStatus, completionPct, byStatus
   - stories[]: storyId, storyName, storyStatus, storyPoints, uacCompleted, uacTotal, completedAt

   Store all for use in subsequent steps.

4. Detect Draft Stories (Informational)
   Search for: docs/200-atomic-stories-v*-draft.md
   If found, display info:
     ℹ️  Draft found (not tracked): 200-atomic-stories-v{Y}.0-draft.md
     To promote: /define --finalize @atomic-stories-v{Y}.0-draft.md

5. Identify Blockers and Velocity
   Blockers:
   - Filter stats.epics[].stories where storyStatus === 'blocked'
   - Extract story name, epic, notes for documentation
   - stats.overall.blockedStories gives count

   Velocity:
   - Filter stories where completedAt is not null across all epics
   - Current sprint: stories completed in last 14 days → sum storyPoints
   - Historical: stories completed in last 60 days → avg points/week
   - Trend: current > historical × 1.1 → "accelerating"
           current < historical × 0.9 → "decelerating"
           else → "stable"

6. Find Progress Document
   Glob: docs/progress/000-progress-v*.md
   Select version matching atomic stories version (or latest).
   Read current document.
   Note:
   - Previous overall_completion %
   - Per-epic percentages (for delta calculation)
   - Existing Change Log entries (to preserve format + prepend new entry)
   - Existing Next Steps (to replace entirely)
   - existing YAML frontmatter (to update in-place)

7. Determine What Changed Since Last Update
   Compare stats vs progress doc values:
   - Newly completed stories (completedAt recent, or status changed to done)
   - Newly started stories (status in-progress, not previously tracked)
   - Newly blocked stories
   - Resolved blockers (previously blocked, now in different status)

   Categories of changes to log:
   - Skills Created, Stories Completed, UACs Completed
   - Features Released, Documentation Updated
   - Reconcile applied (if files were moved or stats synced)

8. Get Current Timestamp
   Run: date +"%B %d, %Y %H:%M"
   Format: "March 15, 2026 14:30"
   Store as current_timestamp.

9. Generate Change Log Entry
   Format — standard entry:

     ### {Month} {Day}, {Year} [{HH:MM}] - {Emoji} {Title}
     - {Emoji} **{Action} `/{command-name}`** ({metrics})
       - {Detail 1}
       - {Detail 2}
       - {Detail 3}
     - 📊 **Total:** {summary}

   Entry type selection:
   - 🚀 Release vX.X.X   → official version release
   - ✅ Story Completion   → story fully completed
   - 🛠️ Development Progress → skills/features created
   - 📋 Documentation Update → doc-only changes
   - 🐛 Bug Fixes          → bug-related work
   - 📦 Document Compression → compression applied

   Emoji guide: 🔍 search, 🐛 bug, 🎨 UI, 🎭 personas, 📊 metrics,
                📄 docs, 🏷️ git tags, 🚀 releases, ✅ completions, 📦 archiving

   Always end entry with:
     - 📊 **Total:** {X} lines / {Y} story points / {Z} files

10. Generate Next Steps Section
    Analyze remaining stories from stats.epics[].stories where storyStatus != 'done'.

    Structure:
    ### Immediate Actions (This Sprint)
    1. **{Action}:**
       - {Detail 1}
       - {Detail 2}

    ### Short Term (Next 2-4 Weeks)
    **Remaining v{X.X.X} High Priority Stories:**
    1. Story {ID} (`/{command-name}`) - {X} points
    ...

    ### Medium Term (Next 1-3 Months)
    1. **Complete v{X.X.X} Release** — all {N} stories, testing, docs
    2. **v{X+1.X.X} Planning** — {description}

    ### Long Term (Next 3-6 Months)  [if applicable]
    1. **v{X.0.0} Vision** — {strategic goal}

    Rules:
    - Immediate: unblocking blockers, in-progress completions, high-priority pending
    - Short-term: remaining high-priority stories from current version
    - Medium-term: next version goals + optional stories
    - Always include story IDs, command names, points

11. Update YAML Frontmatter in Progress Document
    Check if file has existing frontmatter (--- delimiters).
    If yes: parse and update values in-place.
    If no: create new frontmatter block at top.

    Key fields to update:
      last_updated: "{current ISO 8601 timestamp}"
      overall_completion: {stats.overall.completionPct}
      total_stories: {stats.overall.totalStories}
      completed_stories: {stats.overall.completedStories}
      in_progress_stories: {stats.overall.inProgressStories}
      blocked_stories: {stats.overall.blockedStories}
      pending_stories: {stats.overall.pendingStories}
      total_points: {stats.overall.totalPoints}
      completed_points: {stats.overall.completedPoints}
      pending_points: {stats.overall.pendingPoints}

    Version progress (from stats.epics grouped by epicVersion):
      future_versions:
        - version: "1.x.x"
          total_stories: {N}
          completed_stories: {N}
          completion: {%}

    Velocity:
      velocity:
        current_sprint_points: {points in last 14 days}
        avg_points_per_week: {completedPoints / weeks_elapsed}
        trend: "{accelerating|stable|decelerating}"

    Blockers array: update from stats blockers list
    generated_by: "/update-progress"
    format_version: "2.0.0"

12. Update Markdown Body Sections
    Using Edit tool (preferred) or Write tool:

    a. Update "Last Updated" line in body header
    b. Update "Overall Completion" percentage
    c. Update per-version completion percentages
    d. Update story status sections (status emoji + UAC checkboxes)
    e. Update "Feature Completion by Category" percentages
    f. Update Blockers section:
       - Add new blockers to Active Blockers list
       - Move resolved blockers to Resolved Blockers list
    g. Update Velocity and Timeline section
    h. INSERT new Change Log entry at TOP of ## Change Log section
       - Place immediately after "## Change Log" heading
       - Add --- separator before previous entry
       - Preserve all previous entries (newest first)
    i. REPLACE entire ## Next Steps section with newly generated content

    IMPORTANT: Never use Write tool to create new progress versions.
    To create a new version: cp docs/progress/000-progress-v{old}.md docs/progress/000-progress-v{new}.md
    then use Edit tool for version updates.

13. Validate and Write
    Validate:
    - All percentages 0-100
    - Completed story count matches stories with 100% UACs
    - Dates in correct format
    - Change Log has proper heading format: ### {Date} [{Time}] - {Emoji} {Title}
    - Next Steps has all required subsections

    Write updated progress document using Edit tool.

14. Display Summary Report
    ✅ Progress tracking updated!

    📝 Git Branch: {branch_name} ({safe/protected})

    📊 Progress Summary:
    Previous:  {old_pct}% ({old_completed}/{old_total} stories)
    Current:   {new_pct}% ({new_completed}/{new_total} stories)
    Change:    {delta}% {⬆️/➡️/⬇️}

    🔄 Reconcile Results:
    Files moved:   {movedCount}
    Stats synced:  {changedCount}

    🎯 Completed Since Last Update:
    {list of newly completed stories with points}

    📋 By Epic/Category:
    {per-epic completion list}

    ⚠️ Active Blockers: {count}
    {list if any}

    📈 Velocity:
    Current sprint:   {X} points
    Avg/week:         {Y} points
    Trend:            {accelerating|stable|decelerating}
    Est. completion:  {date}

    📝 Change Log Entry Added:
    {preview of new entry}

    🎯 Next Steps Updated:
    {preview of Immediate Actions}

    📝 Updated: docs/progress/000-progress-v{version}.md
    🕐 Timestamp: {current_timestamp}
