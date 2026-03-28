---
description: Update workstream progress tracking with automatic workstream detection for independent progress monitoring
---

1. Identify Target Workstream
   Check for --workstream {ID} flag in arguments
   If not provided, auto-detect workstream:

   Run: ls -d docs/scrums/*/ 2>/dev/null | wc -l

   If 0 workstreams: Error - no workstreams exist
   If 1 workstream: Auto-select (extract ID from directory name)
   If 2+ workstreams: Error - require --workstream {ID} flag

2. Validate Workstream Exists
   Verify directory exists: docs/scrums/{ID}-{description}/
   If not found:
   - List available workstreams
   - Suggest: /scrum-of-scrums {description} to create

3. Extract Workstream Details
   Read workstream README: docs/scrums/{ID}-{description}/000-README.md
   Extract workstream name and purpose

4. Read Workstream Atomic Stories
   Find latest workstream atomic stories:
   Run: ls docs/scrums/{ID}-*/200-atomic-stories-v*.md | sort -V | tail -1

   Read the file
   Parse all workstream stories (W{ID}-### numbering)
   For each story extract:
   - Story ID, title, priority, effort
   - Dependencies (workstream and parent)
   - UACs with completion status (✅ or ⏳)
   - Test requirements

5. Calculate Workstream Completion Status
   For each workstream story:
   - Count total UACs
   - Count completed UACs (✅)
   - Count pending UACs (⏳)
   - Count blocked UACs (⏸️)
   - Calculate completion percentage

   Determine story status:
   - Completed ✅: All UACs done
   - In Progress 🚧: Some UACs done
   - Blocked ⏸️: Has blocked UACs
   - Pending ⏳: No UACs started

6. Calculate Overall Workstream Progress
   Count total workstream stories
   Count completed stories
   Calculate overall completion percentage
   Calculate category progress
   Identify workstream blockers

7. Read Current Workstream Progress Document
   Find matching version:
   Run: ls docs/scrums/{ID}-*/progress/000-progress-v*.md | sort -V | tail -1

   Read existing progress data
   Note current completion percentages
   Extract existing change log entries
   Extract existing next steps sections

8. Detect Changes Since Last Update
   Compare current story statuses vs progress document
   Identify:
   - Newly completed stories
   - Newly started stories
   - Newly blocked stories
   - Newly completed UACs

   Calculate metrics:
   - Story points delivered
   - Files created/modified
   - Tests added

9. Generate Workstream Change Log Entry
   Get current timestamp:
   Run: date +"%B %d, %Y %H:%M"

   Structure entry:
   ### {Date} [{Time}] - {Emoji} {Title}
   - {Emoji} **Workstream {ID}: {Action}** ({metrics})
     - {Detail 1}
     - {Detail 2}
   - 📊 **Total:** {summary metrics}

   Use appropriate emojis:
   🖥️ CLI, 📱 Mobile, 🔗 Integration, 🛠️ Development, etc.

10. Generate Workstream Next Steps
    Analyze remaining workstream work:
    - Categorize by priority
    - Check dependencies (workstream and parent)
    - Calculate story points for remaining work

    Create sections:
    - Immediate Actions (This Sprint): 1-3 items
    - Short Term (2-4 weeks): High-priority stories
    - Medium Term (1-3 months): Version goals

11. Update Workstream Progress Document
    Edit docs/scrums/{ID}-*/progress/000-progress-v{version}.md

    Update:
    - Last Updated field with date and description
    - Workstream progress summary percentages
    - Each story section (status, UACs, completion dates)
    - Workstream blockers section
    - Prepend new change log entry
    - Replace next steps sections

12. Display Progress Update Summary
    Show comprehensive workstream progress update:
    - Workstream ID and name
    - Progress metrics (stories, UACs, completion %)
    - Changes since last update
    - Change log entry preview
    - Next steps count
    - Updated document path
    - Next actions (continue dev, build, release)
