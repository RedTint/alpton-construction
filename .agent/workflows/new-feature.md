---
description: Add new feature to latest PRD and Atomic Stories, select/create target epic, create story file in docs/epics/ with YAML frontmatter. Supports --draft mode.
---

1. Parse Input and Detect Draft Mode
   Extract feature description from command arguments.
   Check if --draft flag is present.
   - Draft mode: creates documents with -draft suffix, excluded from /build execution
   - Production mode: documents immediately available to build skills

   Validate description is not empty and benefit-focused (describes WHAT, not HOW).

   // Note: Manual user input required if description is unclear
   // Original: AskUserQuestion tool
   Ask user: What problem does this feature solve? Who is the primary user?

2. Find Latest PRD and Atomic Stories
   Find files matching: docs/002-prd-v*.md → select highest version
   Find files matching: docs/200-atomic-stories-v*.md → select highest version (exclude -draft.md)

   Calculate next version: minor increment (v1.2.0 → v1.3.0 for new features).
   Apply -draft suffix if in draft mode.

3. Read Documentation Context
   Read latest PRD and Atomic Stories.
   Read related context (as available):
   - docs/150-tech-stacks-v*.md
   - docs/175-c4-diagrams-v*.md
   - docs/300-frontend-v*.md
   - docs/325-backend-v*.md
   - docs/350-api-contract-v*.md
   - docs/375-database-schema-v*.md
   - docs/425-devops-v*.md

4. Analyze Feature Impact
   Identify affected components from description keywords:
   - Frontend (FE): UI/dashboard/form/display/component
   - Backend (BE): API/endpoint/service/business logic
   - Database (DB): store/persist/schema/migration
   - DevOps: deploy/scale/monitor/infrastructure

   Flag architectural decisions requiring ADR creation.

5. Select Target Epic
   // Note: Manual user input required
   // Original: AskUserQuestion tool

   Find files matching: docs/epics/*/epic.md
   Read epic_id and epic_name from each file's YAML frontmatter.

   Display list:
   [001] MVP Features
   [002] Code Generation Toolkit
   ...
   [NEW] Create a new epic

   Ask: "Which epic does this story belong to? Enter the epic ID or 'new'."

   If existing epic selected:
   - Store selectedEpicId (e.g., "007") and selectedEpicDir (e.g., "007-sync-board-project-management")
   - Read epic.md to get epic_name and epic_version for story tags

   If 'new' selected:
   - Ask user for epic name and description
   - Determine next epic ID (pad to 3 digits)
   - Run: mkdir -p docs/epics/{epicId}-{slug}/{pending,in-progress,qa,done,blocked,bugs}
   - Create docs/epics/{epicId}-{slug}/epic.md with YAML frontmatter (total_stories: 0, etc.)
   - Set selectedEpicId and selectedEpicDir to the new epic

6. Create Updated PRD Version
   // turbo
   cp docs/002-prd-v{current}.md docs/002-prd-v{next}[-draft].md

   Edit header: update version, date, add Previous Version reference.
   Edit version history table: add new row.
   Edit to add new feature to appropriate version section with description, user story, success metrics.

7. Create Updated Atomic Stories Version + Epic Story File

   Apply graduated compression to completed stories if needed:
   - Level 1 (recent completed): summarize with key achievements
   - Level 2 (older): compress to list format (ID, title, points)
   - Level 3 (ancient): aggregate with archive reference

   // turbo
   cp docs/200-atomic-stories-v{current}.md docs/200-atomic-stories-v{next}[-draft].md

   Edit header: update version, date, Previous Version reference.
   Edit to apply compression summaries (if applicable).
   Edit to add new version section with new user story:
   - Format: As a {persona} / I want {capability} / So that {benefit}
   - Priority: High/Medium/Low
   - Effort: Fibonacci points (1, 2, 3, 5, 8, 13, 21)
   - UACs tagged: FE: / BE: / DB: / DevOps: / CLI: / TEST:
   - Dependencies on existing stories

   After atomic stories updated, create individual epic story file:

   Determine story file path:
   - Scan docs/epics/{selectedEpicDir}/*/ for existing story numbers → next storyNum
   - Title slug: lowercase, hyphens, max 60 chars
   - Path: docs/epics/{selectedEpicDir}/pending/{epicId}-{storyNum}-{title-slug}.md

   Count UAC lines by type (FE/BE/DB/DevOps/CLI/TEST) from the story created above.

   Write story file with YAML frontmatter:
   ---
   story_id: "{epicId}-{storyNum}"
   epic_id: "{epicId}"
   story_name: "{feature title}"
   story_status: pending
   priority: {high|medium|low}
   story_points: {points}
   assignees: []
   tags: [{epicVersion}, {epic slug tags}]
   dependencies: []
   created_at: "{ISO timestamp}"
   updated_at: "{ISO timestamp}"
   completed_at: null
   uac_total: {count}
   uac_completed: 0
   uac_pending: {count}
   uac_completion_pct: 0
   uac_by_type:
     fe: {count}
     be: {count}
     db: {count}
     devops: {count}
     cli: {count}
     test: {count}
   test_coverage: null
   test_unit_status: "pending"
   test_e2e_status: "pending"
   test_integration_status: "pending"
   ---

   Body: ## Description, ## User Acceptance Criteria (- [ ] TYPE: text checkboxes),
   ## Test Requirements, ## Dependencies, ## Notes

   Refresh epic stats:
   node .ai-dev/ai-dev-scripts/aggregate-epics.js --update --docs-path=./docs --epic={selectedEpicId}

8. Create Draft Architecture Documents
   Use copy-then-edit pattern for each affected component:

   If FE impact:
   cp docs/300-frontend-v{current}.md docs/300-frontend-v{next}[-draft].md
   Edit: add new components, pages/routes, state management updates

   If BE impact:
   cp docs/325-backend-v{current}.md docs/325-backend-v{next}[-draft].md
   Edit: add new API endpoints, services, repositories, middleware

   If DB impact:
   cp docs/375-database-schema-v{current}.md docs/375-database-schema-v{next}[-draft].md
   Edit: add new tables (ERD), columns, relationships, migrations

   If API changes:
   cp docs/350-api-contract-v{current}.md docs/350-api-contract-v{next}[-draft].md
   Edit: add new endpoints, request/response schemas, error codes

   If DevOps impact:
   cp docs/425-devops-v{current}.md docs/425-devops-v{next}[-draft].md
   Edit: add infrastructure changes, deployment updates, monitoring

9. Create Draft ADR
   Create docs/adr/YYYYMMDD-{feature-name}[-draft].md with:
   - Status: Proposed (Draft)
   - Context, Decision, Consequences (Positive/Negative)
   - Alternatives Considered, Implementation Notes
   - Link to related atomic story and affected architecture docs

   If production mode (not draft): update docs/adr/000-README.md index.

10. Update Progress Tracking
    Find latest: docs/progress/000-progress-v*.md

    Add new story entry with status "Draft" (draft mode) or "Pending" (production).
    Include Story ID, title, priority, effort, all UACs marked ⏳.
    Update story counts; draft stories don't affect completion percentage.

11. Display Summary Report
    ✅ New feature added!

    Description: {feature description}
    Mode:        {Draft / Production}
    Story ID:    Story {epicId}-{storyNum}
    Epic:        {epicId} — {epicName}
    Priority:    {High/Medium/Low}
    Effort:      {points} story points
    Version:     v{version}

    📄 Documents Created:
    - ✅ docs/002-prd-v{version}[-draft].md
    - ✅ docs/200-atomic-stories-v{version}[-draft].md
    - ✅ docs/epics/{epicDir}/pending/{epicId}-{storyNum}-{slug}.md (epic story file)
    - ✅ docs/epics/{epicDir}/epic.md (stats refreshed)
    - ✅ docs/300-frontend-v{version}[-draft].md (if FE impact)
    - ✅ docs/325-backend-v{version}[-draft].md (if BE impact)
    - ✅ docs/375-database-schema-v{version}[-draft].md (if DB impact)
    - ✅ docs/350-api-contract-v{version}[-draft].md (if API impact)
    - ✅ docs/425-devops-v{version}[-draft].md (if DevOps impact)
    - ✅ docs/adr/YYYYMMDD-{feature-name}[-draft].md

    🔍 Feature Impact: FE: {✅/⏸️} | BE: {✅/⏸️} | DB: {✅/⏸️} | DevOps: {✅/⏸️}

    If draft mode:
    ⚠️ Draft documents excluded from /build execution.
    To finalize: /define --finalize @prd-v{version}-draft.md

    🎯 Next Steps (draft): Review → /define --draft @{doc} → /define --finalize @{doc} → /build
    🎯 Next Steps (production): Review → /define @{doc} → /build → /update-progress
