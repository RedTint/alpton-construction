---
description: Search epic story files (docs/epics/), atomic stories, and related docs to find features, bugs, and tech debt with full epic context
---

1. Parse Search Query
   Extract search intent and keywords from arguments
   Identify search type:
   - Story/Feature (default)
   - Bug (keywords: "bug", "BUG-", "issue", "defect")
   - Tech Debt (keywords: "tech debt", "refactor", "improvement")
   - Story ID search (e.g., "Story 315", "007-315")

2. Find Documentation Files
   Primary corpus — epic story files (canonical story content):
   - Glob docs/epics/*/pending/*.md (exclude epic.md)
   - Glob docs/epics/*/in-progress/*.md
   - Glob docs/epics/*/qa/*.md
   - Glob docs/epics/*/done/*.md
   - Glob docs/epics/*/blocked/*.md
   - Glob docs/epics/*/bugs/*.md (if bug search)
   - Cross-epic index: docs/epics/bugs-index.md (if bug search)

   Secondary sources:
   - docs/200-atomic-stories-v*.md (index/fallback)
   - docs/progress/000-progress-v*.md

   Architecture & design (for context):
   - docs/adr/000-README.md and docs/adr/*.md
   - docs/002-prd-v*.md, docs/100-userflows-v*.md
   - docs/125-design-system-v*.md, docs/150-tech-stacks-v*.md

   Implementation details (if relevant):
   - docs/300-frontend-v*.md, docs/325-backend-v*.md
   - docs/350-api-contract-v*.md, docs/375-database-schema-v*.md
   - docs/425-devops-v*.md

3. Search Epic Story Files and Documentation
   For each epic story file found in step 2:
   - Read YAML frontmatter: story_id, story_name, story_status, epic_id, priority, story_points, tags, uac_by_type
   - Read markdown body: description, UAC checkboxes, notes
   - Derive epic context from path: {epicDir}/{statusDir}/{filename}
   - For bug files: extract bug_severity, bug_category, bug_status, related_story

   Search logic:
   - Specific story ID (007-315 / Story 315): find exact story_id match first
   - Bug ID (BUG-042): glob docs/epics/*/bugs/*-bug-042-*.md
   - Keywords: search story_name, description body, UAC text, tags array

   Also search atomic stories doc for stories not yet in epic format

   Rank by relevance: exact story_id > story_name exact > story_name contains > body contains
   Include epic context in each result: [Epic {epicId} / {statusDir}]

4. Present Search Results to User
   // Note: Manual user input required
   // Original: AskUserQuestion tool
   Display up to 4 top matches:
   - Story 007-315: AI Dev Persona System [Epic 007 / done] (✅ Completed)
   - Story 007-314: Landing Page Generator [Epic 007 / pending] (⏳ Pending)
   - BUG-003: Auth login redirect issue [Epic 007 / bugs] (Critical - P0)
   Each option shows: ID, title, Epic context [epicId / statusDir], status, severity (bugs), file path

5. Extract Selected Item Details
   Read full content of selected story file from its file path
   From YAML frontmatter: story_id, story_name, story_status, epic_id, priority, story_points, tags, dependencies
   From YAML: uac_total, uac_completed, uac_completion_pct, uac_by_type, test_*_status
   From markdown body: full description, UAC checkboxes with check state, test requirements, notes
   Display: "📁 Source: {filePath} [Epic {epicId} / {statusDir}]"

   Identify component tags from uac_by_type: fe/be/db/devops/test

6. Search Related ADRs
   Read docs/adr/000-README.md for ADR list
   Search ADR titles and content for relevance to selected item
   Return matching ADRs with titles and paths

7. Gather Related Architecture Documents
   Based on component tags (uac_by_type):
   - fe > 0: read docs/300-frontend-v*.md relevant sections
   - be > 0: read docs/325-backend-v*.md + docs/350-api-contract-v*.md
   - db > 0: read docs/375-database-schema-v*.md
   - devops > 0: read docs/425-devops-v*.md

8. Search Related Design Documents
   Read docs/002-prd-v*.md — search for feature mentions
   Read docs/100-userflows-v*.md — related user flows
   Read docs/125-design-system-v*.md (if fe > 0)
   Read docs/150-tech-stacks-v*.md — relevant technology decisions

9. Compile Comprehensive Context Report
   Display full report:
   - Overview: ID, Epic (epicId / epic_name), Location (filePath / statusDir), Status, Priority, Points
   - UAC progress: {uac_completed}/{uac_total} ({uac_completion_pct}%)
   - Test status: Unit / E2E / Integration
   - Full description from story file body
   - UAC checkboxes with current check state (- [x] done / - [ ] pending)
   - Related ADRs
   - Relevant sections from architecture docs
   - Related design doc references
   - Suggested next action: /build-fe, /build-be, /build-devops, /fix-bug, etc.
