---
description: Intelligently orchestrate implementation using epic story files from docs/epics/ (or atomic stories fallback), passing --story-file to domain build skills
---

1. Detect Draft Documents
   Search for all draft documents: docs/**/*-draft.md
   If draft documents exist:
   - Display prominent warning listing draft files
   - Note they are excluded from build
   Continue (excluding drafts)

2. Detect Epic Story Files (primary source)
   Glob docs/epics/*/pending/*.md — exclude epic.md files and bugs/ directory
   Glob docs/epics/*/in-progress/*.md — already-started stories
   For each found story file, read YAML frontmatter: story_id, epic_id, story_name, story_status, uac_by_type
   Build story map: { storyFilePath, storyId, epicId, uac_by_type }

   If epic story files found:
   - Calculate pending FE: UACs across stories with uac_by_type.fe > 0
   - Calculate pending BE:/DB: UACs across stories with uac_by_type.be or uac_by_type.db > 0
   - Calculate pending DevOps: UACs across stories with uac_by_type.devops > 0
   - Display story file count and UAC distribution

   If NO epic story files found (fallback to atomic stories):
   - Search for docs/200-atomic-stories-v*.md (EXCLUDE -draft suffix)
   - Read latest production version
   - Extract UACs by tag (FE:, BE:, DB:, DevOps:)

3. Find and Read Progress Tracking
   Search for progress document: docs/progress/000-progress-v*.md
   EXCLUDE files with -draft suffix
   Read matching version
   Identify stories: Completed (skip), In Progress (show), Pending (show), Blocked (warn)

4. Check for Relevant Learnings
   Check if docs/learnings/000-README.md exists
   If exists, scan for keywords related to pending stories
   Display relevant learnings if found

5. Analyze UAC Distribution
   Count total and pending UACs by type
   Determine which build commands are needed:
   - Pending FE: UACs → Need /build-fe
   - Pending BE:/DB: UACs → Need /build-be
   - Pending DevOps: UACs → Need /build-devops

6. Detect Available Build Skills
   Look for skill files:
   - .claude/skills/build-fe/skill.md
   - .claude/skills/build-be/skill.md
   - .claude/skills/build-devops/skill.md
   Match available skills to pending UAC types

7. Present Options to User
   Display pending work summary and available build commands
   // Note: Manual user input required
   // Original: AskUserQuestion tool
   Ask: "Which build commands should be executed? (build-fe / build-be / build-devops / all)"
   Ask: "Sequential or parallel execution?"

8. Execute Build Commands
   Sequential: execute one at a time
   Parallel (recommended): launch multiple agents concurrently

   If epic story files were detected in step 2, pass --story-file argument:
   - For FE stories: Execute /build-fe --story-file {feStoryFilePath}
   - For BE stories: Execute /build-be --story-file {beStoryFilePath}
   - For DevOps stories: Execute /build-devops --story-file {devopsStoryFilePath}
   - Multiple pending stories for same domain: launch one agent per story

   // Original: Parallel execution (Claude Task tool)
   // Antigravity: Run sequentially or manually coordinate parallel execution

   If no epic story files (fallback mode): execute skills without --story-file

9. Aggregate Results and Update Progress
   Collect outputs from each build command
   Run /update-progress to refresh progress document
   Validate generated code (lint, type check, syntax)

10. Display Unified Summary
    Show consolidated report:
    - Files created per domain
    - UACs implemented
    - Test results
    - Epic story files transitioned (pending→in-progress→qa)
    - Overall progress percentage
