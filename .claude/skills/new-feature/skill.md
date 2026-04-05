# New Feature Command

Add new feature requirements to the latest PRD and Atomic Stories with draft mode support, automatically creating draft architecture documents and ADRs for affected components.

## Execution Steps

### Phase 1: Parse Input and Detect Draft Mode

1. **Extract Feature Description**
   - Parse the command arguments to get feature description
   - Feature description should be clear and concise (1-3 sentences)
   - Examples:
     - "Add user notification system with email and in-app notifications"
     - "Implement AI-powered recommendation engine based on user behavior"
     - "Add real-time collaboration with WebSocket support"

2. **Detect Draft Mode**
   - Check if `--draft` flag is present in arguments
   - Draft mode behavior:
     - Creates documents with `-draft` suffix (e.g., `prd-v1.3.0-draft.md`)
     - Excluded from `/build` skill execution
     - Build skills show warnings when draft documents exist
     - Isolated from production documentation context
   - Non-draft mode:
     - Creates production documents (no `-draft` suffix)
     - Immediately available to build skills
     - Integrated into production documentation

3. **Validate Feature Description**
   - Ensure description is not empty
   - Should describe WHAT the feature does (not HOW)
   - Should be user-centric (benefit-focused)
   - If unclear, use AskUserQuestion to clarify:
     - What problem does this feature solve?
     - Who is the primary user?
     - What is the expected outcome?

### Phase 2: Read Current Documentation Context

1. **Find Latest PRD and Atomic Stories**
   - Use Glob to find latest versions:
     - `docs/002-prd-v*.md` → Get highest version
     - `docs/200-atomic-stories-v*.md` → Get highest version
   - Parse version numbers to determine next version
   - Examples:
     - If PRD is v1.2.0, next will be v1.3.0
     - If Atomic Stories is v1.2.0, next will be v1.3.0

2. **Read Latest Documentation**
   - Read latest PRD version
   - Read latest Atomic Stories version
   - Read related context documents:
     - `docs/150-tech-stacks-v*.md` - Tech stack decisions
     - `docs/175-c4-diagrams-v*.md` - Architecture overview
     - `docs/300-frontend-v*.md` - Frontend architecture
     - `docs/325-backend-v*.md` - Backend architecture
     - `docs/350-api-contract-v*.md` - API definitions
     - `docs/375-database-schema-v*.md` - Database schema
     - `docs/425-devops-v*.md` - DevOps infrastructure
   - Extract current feature list and roadmap
   - Understand existing architecture patterns

3. **Determine Next Version Numbers**
   - Calculate next version based on latest:
     - Minor version increment (v1.2.0 → v1.3.0) for new features
     - Major version increment (v1.9.0 → v2.0.0) for breaking changes
   - Maintain version consistency across PRD and Atomic Stories
   - Apply `-draft` suffix if in draft mode

### Phase 3: Analyze Feature Impact

1. **Identify Affected Components**
   - Analyze feature description to determine impact:
     - **Frontend (FE):** New UI components, pages, user interactions
     - **Backend (BE):** New API endpoints, business logic, services
     - **Database (DB):** New tables, columns, relationships, migrations
     - **DevOps:** Infrastructure changes, deployment updates, monitoring
   - Use pattern matching to detect:
     - UI/UX keywords → Frontend impact (e.g., "dashboard", "form", "display")
     - API keywords → Backend impact (e.g., "endpoint", "API", "service")
     - Data keywords → Database impact (e.g., "store", "persist", "data")
     - Infrastructure keywords → DevOps impact (e.g., "deploy", "scale", "monitor")

2. **Determine Architecture Document Updates**
   - Based on affected components, identify documents to update:
     - If FE impact: `300-frontend-v*.md`
     - If BE impact: `325-backend-v*.md`
     - If DB impact: `375-database-schema-v*.md`
     - If API changes: `350-api-contract-v*.md`
     - If DevOps impact: `425-devops-v*.md`
   - All documents will get `-draft` suffix if in draft mode

3. **Select Target Epic**
   - Use Glob to discover all existing epics: `docs/epics/*/epic.md`
   - Read the YAML frontmatter of each `epic.md` to extract `epic_id` and `epic_name`
   - Display the list to the user:
     ```
     📚 Available Epics:
     [001] MVP Features
     [002] Code Generation Toolkit
     [003] Cross-IDE Compatibility & QA
     ...
     [NEW] Create a new epic
     ```
   - Use AskUserQuestion: "Which epic does this story belong to? Enter the epic ID or 'new' to create one."
   - If user selects an existing epic:
     - Store `selectedEpicId` (e.g., `"007"`) and `selectedEpicDir` (e.g., `"007-sync-board-project-management"`)
     - Read `docs/epics/{selectedEpicDir}/epic.md` to get `epic_name`, `epic_version`, and tags for the story
   - If user chooses 'new':
     - Use AskUserQuestion to collect: epic name and epic description
     - Determine next epic ID (pad to 3 digits, e.g., `"008"`)
     - Create the epic directory structure:
       ```bash
       mkdir -p docs/epics/{epicId}-{slug}/{pending,in-progress,qa,done,blocked,bugs}
       ```
     - Create `docs/epics/{epicId}-{slug}/epic.md` with YAML frontmatter:
       ```yaml
       epic_id: "{epicId}"
       epic_name: "{name}"
       epic_status: pending
       epic_version: "{next atomic stories version}"
       priority: medium
       total_stories: 0
       completed_stories: 0
       total_points: 0
       completed_points: 0
       completion_pct: 0
       stories_by_status:
         pending: 0
         in-progress: 0
         qa: 0
         done: 0
         blocked: 0
       created_at: "{ISO timestamp}"
       updated_at: "{ISO timestamp}"
       ```
     - Set `selectedEpicId` and `selectedEpicDir` to the new epic

4. **Detect Architectural Decisions**
   - Identify key decisions needed:
     - Technology choices (new libraries, frameworks)
     - Architecture patterns (microservices, monolith, serverless)
     - Data modeling decisions (schema changes, relationships)
     - Integration approaches (REST, GraphQL, WebSocket)
     - Security considerations (authentication, authorization)
   - Flag decisions that require ADR creation

### Phase 4: Create Draft PRD Version

1. **Read Current PRD**
   - Parse existing PRD structure
   - Identify sections to update:
     - **Roadmap** - Add new version with feature
     - **Features** - Add feature description
     - **Success Criteria** - Define metrics for new feature
     - **Technical Requirements** - Add any new requirements

2. **Copy Current PRD to New Version**
   - Use Bash to copy file:
     ```bash
     cp docs/002-prd-v{current-version}.md docs/002-prd-v{next-version}[-draft].md
     ```
   - Verify copy successful

3. **Update PRD Version with Incremental Edits**
   - Use Edit tool to update version in header:
     - Change `**Version:** v{current}` to `**Version:** v{next}`
     - Change `**Date:**` to current date
     - Add `**Previous Version:** v{current}`
   - Use Edit tool to update version history table:
     - Add new row at top of table
   - Use Edit tool to add new feature to appropriate section:
     - If v1.3.0 feature, add to "v1.3.0 Roadmap" section
     - Include feature description, user story, success metrics
     - Reference related atomic stories
   - If needed, use Edit tool to update "Open Questions" or "Future Considerations"

   **IMPORTANT:** Use Edit tool for ALL changes, NOT Write tool
   - Preserves existing content exactly
   - Only modifies what needs to change
   - Saves thousands of tokens

### Phase 5: Create Draft Atomic Stories Version

1. **Read Current Atomic Stories**
   - Parse existing story structure
   - Count existing stories to determine next story ID
   - Identify current version's story count

2. **Generate New User Story**
   - Create story following standard format:
     ```markdown
     ### Story {ID} - {Feature Title}

     **As a** {persona}
     **I want** {capability}
     **So that** {benefit}

     **Priority:** {High/Medium/Low}
     **Effort:** {story points}
     **Dependencies:** {other story IDs}

     #### User Acceptance Criteria

     - FE: {Frontend criteria if applicable}
     - BE: {Backend criteria if applicable}
     - DB: {Database criteria if applicable}
     - DevOps: {DevOps criteria if applicable}
     - CLI: {CLI criteria if applicable}

     #### Test Requirements
     - Unit tests: {description}
     - E2E tests: {description}
     ```
   - Generate realistic UACs based on feature description
   - Assign priority and effort estimate (Fibonacci: 1, 2, 3, 5, 8, 13, 21)
   - Identify dependencies on existing stories

3. **Apply Compression Strategy (Graduated Compression)**
   - **Before** creating the new version, compress completed stories from older versions
   - Apply progressive compression levels based on age:

   **Level 1 - Most Recent Completed Version (Preserve Context):**
   - Keep stories from previous version (v{current-1}.0) with moderate detail
   - Format:
     ```markdown
     ### Story {ID} - {Title} ✅
     **Status:** Completed ({date})
     **Priority:** {priority} | **Effort:** {points} points

     **Summary:** {1-2 sentence summary of what was delivered}

     **Key Achievements:**
     - {Achievement 1}
     - {Achievement 2}
     - {Achievement 3}

     **Full Details:** See 200-atomic-stories-v{version}.md
     ```

   **Level 2 - One Version Old (Summarize as List):**
   - Compress stories from v{current-2}.0 to simple list format
   - Format:
     ```markdown
     ### v{X}.0 Completed Stories ({count} stories, {total-points} points) ✅
     1. Story {ID} - {Title} ({points} points)
     2. Story {ID} - {Title} ({points} points)
     ...

     **Version Achievements:** {high-level summary}
     **Full Details:** See 200-atomic-stories-v{X}.0.md
     ```

   **Level 3 - Multiple Versions Old (Aggregate Summary):**
   - Compress multiple old versions (v1.0.0 - v{current-3}.0) into single aggregate
   - Format:
     ```markdown
     ### v1.0.0 - v{X}.0 Completed Work ({total-stories} stories, {total-points} points) ✅
     - MVP (v1.0.0): {count} stories - {brief summary}
     - {Feature Set} (v1.1.0): {count} stories - {brief summary}
     - {Feature Set} (v{X}.0): {count} stories - {brief summary}

     **Archive:** See docs/archive/atomic-stories-v1.0.0-v{X}.0-full.md
     ```

   **Archive Old Versions:**
   - If v{current-3}.0 or older versions exist with full details:
     - Create `docs/archive/` directory if it doesn't exist
     - Move detailed old versions to archive:
       - `docs/archive/atomic-stories-v{X}.0-full.md`
     - Update references in new version to point to archive

4. **Copy Current Atomic Stories to New Version**
   - Use Bash to copy file:
     ```bash
     cp docs/200-atomic-stories-v{current-version}.md docs/200-atomic-stories-v{next-version}[-draft].md
     ```
   - Verify copy successful

5. **Update Atomic Stories with Incremental Edits**
   - Use Edit tool to update header:
     - Change `**Version:** v{current}` to `**Version:** v{next}`
     - Change `**Date:**` to current date
     - Add `**Previous Version:** v{current}`

   - Use Edit tool to update version history table:
     - Add new row at top describing new story

   - Use Edit tool to apply compression (if needed):
     - Replace full story details with compressed format (from step 3)
     - Update "Completed Stories Summary" section

   - Use Edit tool to add new version section:
     - Add `## v{next-version} Stories` heading AFTER completed summary
     - Add new story in proper format

   **IMPORTANT:** Use Edit tool for ALL changes, NOT Write tool
   - Preserves all existing stories exactly
   - Only modifies what needs to change
   - Saves thousands of tokens (especially with large story lists)

### Phase 5b: Create Epic Story File via Script

Create an individual story file in `docs/epics/` using the `create-story-file.js` script so the dashboard and `/update-progress` see the new story immediately — without requiring a manual `/sync-board` run.

1. **Build the UACs JSON** from the UACs generated in Phase 5
   - Collect all UAC lines as a JSON array: `[{"type":"FE","text":"..."},{"type":"BE","text":"..."}]`
   - Write to a temp file if the JSON is long: `/tmp/uacs.json`

2. **Run create-story-file.js**
   ```bash
   node .ai-dev/ai-dev-scripts/create-story-file.js \
     --docs-path=./docs \
     --epic={selectedEpicId} \
     --title="{feature title}" \
     --priority={priority} \
     --points={story_points} \
     --uacs='[{uac json array}]' \
     --description="As a {persona}, I want {capability} so that {benefit}" \
     --tags="{epicVersion}" \
     --dependencies="{comma-separated dep IDs}"
   ```
   Or with file: `--uacs-file=/tmp/uacs.json`

   The script automatically:
   - Auto-increments the story number (scans existing files)
   - Discovers and links all related docs (PRD, frontend, backend, etc.)
   - Adds a changelog entry with creation timestamp
   - Generates full v2 YAML frontmatter + markdown body
   - Calls `aggregate-epics.js --update` to refresh epic stats

3. **Parse script output**
   The script prints to stdout:
   ```
   STORY_FILE=docs/epics/{epicDir}/pending/{filename}
   STORY_ID={epicId}-{storyNum}
   ```
   Parse these values for the summary report.

4. **Display confirmation**
   ```
   ✅ Epic story file created: {STORY_FILE}
   ✅ Epic {selectedEpicId} stats refreshed via aggregate-epics.js --update
   ```

   If the script exits non-zero, display the error but don't abort — fall back to manual file creation following the v2 story format.

### Phase 5c: Post-Creation Validation

1. **Validate the new story file**
   ```bash
   node .ai-dev/ai-dev-scripts/validate-stories.js --docs-path=./docs --epic={selectedEpicId}
   ```
   - Confirms YAML frontmatter is valid
   - Verifies UAC counts match body checkboxes
   - Checks dependency IDs resolve to existing stories

2. **Check dependency graph for issues**
   ```bash
   node .ai-dev/ai-dev-scripts/dependency-graph.js --docs-path=./docs --output=json
   ```
   - Detect circular dependencies introduced by the new story
   - Show parallelizable stories (what can be built next)
   - Display any warnings

3. **Display validation results**
   ```
   🔍 Validation: ✅ Story {STORY_ID} passes all checks
   🔗 Dependencies: {N} resolved, 0 circular, {M} stories now parallelizable
   ```
   If validation reports errors (broken dependency IDs, cycles), warn the user and suggest fixes.

### Phase 6: Create Draft Architecture Documents

1. **Determine Which Docs to Create**
   - Based on Phase 3 analysis, create drafts for:
     - Frontend architecture (if FE: UACs present)
     - Backend architecture (if BE: UACs present)
     - Database schema (if DB: changes needed)
     - API contract (if API changes needed)
     - DevOps infrastructure (if DevOps: changes needed)

2. **Create Frontend Architecture Draft (if needed)**
   - Find latest: `300-frontend-v*.md`
   - Use Bash to copy:
     ```bash
     cp docs/300-frontend-v{current}.md docs/300-frontend-v{next}[-draft].md
     ```
   - Use Edit tool to update version in header
   - Use Edit tool to add sections for new feature:
     - New components needed
     - New pages/routes
     - State management updates
     - API client changes
     - Implementation notes specific to feature

3. **Create Backend Architecture Draft (if needed)**
   - Find latest: `325-backend-v*.md`
   - Use Bash to copy:
     ```bash
     cp docs/325-backend-v{current}.md docs/325-backend-v{next}[-draft].md
     ```
   - Use Edit tool to update version in header
   - Use Edit tool to add sections for new feature:
     - New API endpoints
     - New services/business logic
     - New repositories/data access
     - Middleware changes
     - Error handling and validation

4. **Create Database Schema Draft (if needed)**
   - Find latest: `375-database-schema-v*.md`
   - Use Bash to copy:
     ```bash
     cp docs/375-database-schema-v{current}.md docs/375-database-schema-v{next}[-draft].md
     ```
   - Use Edit tool to update version in header
   - Use Edit tool to add sections for new feature:
     - New tables (with ERD)
     - New columns in existing tables
     - New relationships
     - Migration requirements
     - Data validation rules

5. **Create API Contract Draft (if needed)**
   - Find latest: `350-api-contract-v*.md`
   - Use Bash to copy:
     ```bash
     cp docs/350-api-contract-v{current}.md docs/350-api-contract-v{next}[-draft].md
     ```
   - Use Edit tool to update version in header
   - Use Edit tool to add sections for new feature:
     - New endpoints (method, path, auth)
     - Request/response schemas
     - Error codes
     - Rate limiting rules

6. **Create DevOps Draft (if needed)**
   - Find latest: `425-devops-v*.md`
   - Use Bash to copy:
     ```bash
     cp docs/425-devops-v{current}.md docs/425-devops-v{next}[-draft].md
     ```
   - Use Edit tool to update version in header
   - Use Edit tool to add sections for new feature:
     - Infrastructure changes (new services, scaling)
     - Deployment updates
     - Monitoring and alerting
     - Secrets management

**IMPORTANT NOTE:** All architecture documents use copy-then-edit pattern
- Never use Write tool for version creation
- Always `cp` old version to new filename first
- Then use Edit tool for incremental changes
- This preserves all existing content and saves thousands of tokens

### Phase 7: Create Draft ADR

1. **Identify Architectural Decisions**
   - From Phase 3 analysis, list key decisions:
     - Technology choices
     - Architecture patterns
     - Data modeling
     - Integration approaches
     - Security considerations

2. **Generate ADR**
   - Create ADR following YYYYMMDD-{purpose}.md convention
   - If draft mode, add `-draft` suffix
   - Include standard ADR structure:
     ```markdown
     # ADR-{number}: {Feature Name} - {Decision Title}

     **Status:** Proposed (Draft)
     **Date:** {current date}
     **Deciders:** {project team}
     **Related Feature:** Story {ID} - {feature title}

     ## Context

     {Describe why this feature needs this decision}
     {Explain the problem or requirement}

     ## Decision

     {Describe the chosen approach}
     {Explain why this approach was selected}

     ## Consequences

     ### Positive
     - {Benefit 1}
     - {Benefit 2}

     ### Negative
     - {Trade-off 1}
     - {Trade-off 2}

     ## Alternatives Considered

     ### Alternative 1: {name}
     - {Description}
     - Rejected because: {reason}

     ### Alternative 2: {name}
     - {Description}
     - Rejected because: {reason}

     ## Implementation Notes

     - {Note 1}
     - {Note 2}
     ```

3. **Write Draft ADR**
   - Use Write tool to create ADR file in `docs/adr/`
   - Link to related atomic story
   - Reference affected architecture documents

4. **Update ADR Index (Optional if not draft)**
   - If not in draft mode, read `docs/adr/000-README.md`
   - Add new ADR to index in reverse chronological order
   - Use Edit tool to update index

### Phase 8: Update Progress Tracking

1. **Determine Progress Version Alignment**
   - Get new atomic stories version from Phase 5 (e.g., v1.6.0)
   - Use Glob to find: `docs/progress/000-progress-v*.md`
   - Check if matching progress file exists: `docs/progress/000-progress-v{version}.md`

2. **Handle Version Alignment**
   - If no matching progress version exists:
     - Display: "Creating new progress version to match atomic stories v{version}"
     - Find latest progress file (e.g., v1.5.0)
     - Use Bash to copy:
       ```bash
       cp docs/progress/000-progress-v{current}.md docs/progress/000-progress-v{next}.md
       ```
     - Use Edit tool to update version in header
     - Use Edit tool to add empty version section for new stories
   - If matching version exists:
     - Will update existing progress-v{version}.md file

3. **Add New Story Entry to Progress**
   - Use Edit tool to add new story to appropriate version section
   - Mark status as "Draft" if in draft mode, otherwise "Pending"
   - Include:
     - Story ID and title
     - Priority and effort
     - Status: Draft / Pending
     - All UACs marked as ⏳ (pending)
     - Dependencies listed

4. **Update Progress Summary**
   - Use Edit tool to update story counts
   - Use Edit tool to recalculate percentages
   - Note that draft stories don't affect completion percentage

5. **Add Change Log Entry**
   - Use Edit tool to insert new entry at top of Change Log
   - Follow standard format with timestamp

**IMPORTANT:** Never use Write tool for progress documents
- Always use Edit tool for incremental updates
- If creating new version, use `cp` first, then Edit
- Preserves all historical data and change log entries

### Phase 9: Update Build Skills Exclusion (if draft mode)

1. **Read Build Skills**
   - Read: `.claude/skills/build/skill.md`
   - Read: `.claude/skills/build-fe/skill.md`
   - Read: `.claude/skills/build-be/skill.md`
   - Read: `.claude/skills/build-devops/skill.md`

2. **Verify Draft Exclusion Logic**
   - Check if skills already exclude `-draft` documents
   - If not present, note that skills need update
   - Document exclusion pattern:
     ```
     Exclude any document with `-draft` suffix:
     - prd-v*-draft.md
     - atomic-stories-v*-draft.md
     - frontend-v*-draft.md
     - backend-v*-draft.md
     - database-schema-v*-draft.md
     - api-contract-v*-draft.md
     - devops-v*-draft.md
     ```

3. **Add Draft Warning to Build Skills**
   - Each build skill should display warning when draft docs exist:
     ```
     ⚠️ Draft Documents Detected (not implemented):
     - docs/002-prd-v1.3.0-draft.md (1 new feature)
     - docs/350-api-contract-v1.1.0-draft.md (WebSocket endpoints)

     To finalize: /define --finalize @{document}
     ```
   - Warning does NOT block build execution
   - Helps developers stay aware of upcoming changes

### Phase 10: Generate Summary Report

1. **Collect All Created Files**
   - List all draft documents created:
     - Draft PRD
     - Draft Atomic Stories
     - Draft architecture documents
     - Draft ADR
   - Note version numbers and file paths

2. **Analyze Feature Impact**
   - Summarize affected components:
     - Frontend: {yes/no} - {description if yes}
     - Backend: {yes/no} - {description if yes}
     - Database: {yes/no} - {description if yes}
     - DevOps: {yes/no} - {description if yes}
   - List architectural decisions identified

3. **Display Comprehensive Summary**
   ```
   ✅ New feature added successfully!

   📝 Feature Details:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Description: {feature description}
   Mode:        {Draft / Production}
   Story ID:    Story {ID}
   Priority:    {High/Medium/Low}
   Effort:      {points} story points
   Version:     v{version}

   📄 Documents Created:
   - ✅ docs/002-prd-v{version}[-draft].md
   - ✅ docs/200-atomic-stories-v{version}[-draft].md (with compression applied)
   - ✅ docs/epics/{epicDir}/pending/{epicId}-{storyNum}-{title-slug}.md (epic story file)
   - ✅ docs/epics/{epicDir}/epic.md (stats refreshed via aggregate-epics.js --update)
   - ✅ docs/300-frontend-v{version}[-draft].md (if FE impact)
   - ✅ docs/325-backend-v{version}[-draft].md (if BE impact)
   - ✅ docs/375-database-schema-v{version}[-draft].md (if DB impact)
   - ✅ docs/350-api-contract-v{version}[-draft].md (if API impact)
   - ✅ docs/425-devops-v{version}[-draft].md (if DevOps impact)
   - ✅ docs/adr/YYYYMMDD-{feature-name}[-draft].md

   📦 Document Compression Applied:
   - ✅ Recent completed version (v{current-1}.0) preserved with context
   - ✅ Older version (v{current-2}.0) compressed to list format
   - ✅ Ancient versions (v1.0.0-v{current-3}.0) aggregated
   - ✅ Archived {count} old versions to docs/archive/ (if applicable)
   - 📉 Document size reduced by ~{percentage}% through compression

   🔍 Feature Impact Analysis:
   - Frontend:  {✅ Yes / ⏸️ No} {- description if yes}
   - Backend:   {✅ Yes / ⏸️ No} {- description if yes}
   - Database:  {✅ Yes / ⏸️ No} {- description if yes}
   - DevOps:    {✅ Yes / ⏸️ No} {- description if yes}

   📋 User Acceptance Criteria:
   - FE: {count} criteria defined
   - BE: {count} criteria defined
   - DB: {count} criteria defined
   - DevOps: {count} criteria defined

   🏛️ Architectural Decisions:
   - ADR: docs/adr/YYYYMMDD-{feature-name}[-draft].md
   - Key Decisions:
     1. {Decision 1}
     2. {Decision 2}

   ⚠️ Draft Mode Notes (if draft):
   - Draft documents excluded from /build skill execution
   - Build skills will show warning when draft documents exist
   - Draft documents isolated from production context
   - To finalize: /define --finalize @prd-v{version}-draft.md

   🎯 Next Steps:

   {If Draft Mode:}
   1. Review draft documents in docs/
   2. Elaborate draft architecture docs: /define --draft @{doc}
   3. Refine user acceptance criteria as needed
   4. Finalize when ready: /define --finalize @{doc}
   5. Start implementation: /build after finalization

   {If Production Mode:}
   1. Review created documents in docs/
   2. Elaborate architecture docs: /define @{doc}
   3. Start implementation: /build
   4. Track progress: /update-progress

   ✨ Feature "{feature description}" added to roadmap! ✨
   ```

4. **Provide Finalization Instructions (if draft)**
   - Clear steps to move from draft to production
   - Command examples for finalization
   - Timeline recommendations

## Input Format

**Command:**
```
/new-feature {feature-description}
/new-feature --draft {feature-description}
```

**Examples:**
```
/new-feature "Add user notification system with email and in-app notifications"

/new-feature --draft "Add AI-powered recommendation engine based on user behavior and purchase history"

/new-feature "Implement real-time collaboration with WebSocket support for multiple users"

/new-feature --draft "Add advanced analytics dashboard with custom reports and data visualization"

/new-feature "Add two-factor authentication (2FA) with SMS and authenticator app support"
```

## Output Format

```
✅ New feature added successfully!

📝 Feature Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Description: Add user notification system with email and in-app notifications
Mode:        Draft
Story ID:    Story 310
Priority:    High
Effort:      13 story points
Version:     v1.3.0

📄 Documents Created:
- ✅ docs/002-prd-v1.3.0-draft.md (Updated)
- ✅ docs/200-atomic-stories-v1.3.0-draft.md (New story added)
- ✅ docs/300-frontend-v1.1.0-draft.md (Notification UI components)
- ✅ docs/325-backend-v1.1.0-draft.md (Notification API endpoints)
- ✅ docs/375-database-schema-v1.1.0-draft.md (Notifications table)
- ✅ docs/350-api-contract-v1.1.0-draft.md (Notification endpoints)
- ✅ docs/adr/20260211-notification-system-architecture-draft.md

🔍 Feature Impact Analysis:
- Frontend:  ✅ Yes - Notification center component, toast notifications, preferences UI
- Backend:   ✅ Yes - Notification API, email service, push notification service
- Database:  ✅ Yes - Notifications table, user preferences table, notification templates
- DevOps:    ✅ Yes - Email service configuration, push notification infrastructure

📋 User Acceptance Criteria:
- FE: 8 criteria defined (notification UI, preferences, real-time updates)
- BE: 10 criteria defined (API endpoints, email/push services, scheduling)
- DB: 5 criteria defined (schema design, migrations, indexes)
- DevOps: 4 criteria defined (email service, push service, monitoring)

🏛️ Architectural Decisions:
- ADR: docs/adr/20260211-notification-system-architecture-draft.md
- Key Decisions:
  1. Use WebSocket for real-time in-app notifications
  2. Implement email notifications with SendGrid API
  3. Use Redis for notification queue management
  4. Store notification preferences in user settings table

⚠️ Draft Mode Notes:
- Draft documents excluded from /build skill execution
- Build skills will show warning: "Draft feature pending: Notification System"
- Draft documents isolated from production context
- To finalize: /define --finalize @prd-v1.3.0-draft.md

🎯 Next Steps:

1. Review draft documents in docs/
2. Elaborate draft architecture docs:
   - /define --draft @300-frontend-v1.1.0-draft.md
   - /define --draft @325-backend-v1.1.0-draft.md
   - /define --draft @375-database-schema-v1.1.0-draft.md
   - /define --draft @350-api-contract-v1.1.0-draft.md
3. Refine user acceptance criteria as needed
4. Finalize when ready:
   - /define --finalize @002-prd-v1.3.0-draft.md
   - /define --finalize @200-atomic-stories-v1.3.0-draft.md
   - /define --finalize @300-frontend-v1.1.0-draft.md
   - /define --finalize @325-backend-v1.1.0-draft.md
   - /define --finalize @375-database-schema-v1.1.0-draft.md
   - /define --finalize @350-api-contract-v1.1.0-draft.md
5. Start implementation: /build after finalization

✨ Feature "Add user notification system" added to roadmap! ✨
```

## Important Notes

- **Draft Mode by Default Recommended**: Use `--draft` for exploratory features to avoid disrupting production docs
- **Version Management**: All documents maintain version consistency (e.g., all v1.3.0-draft)
- **Architecture Documents**: Only creates drafts for affected components (not all documents every time)
- **ADR Creation**: Always creates ADR for new features to document decisions
- **Progress Tracking**: Automatically updates progress with draft status
- **Build Skill Warnings**: Draft documents trigger warnings but don't block builds
- **Finalization Workflow**: Use `/define --finalize` to convert drafts to production
- **Context Isolation**: Draft documents don't affect production documentation context
- **Story Point Estimation**: Uses Fibonacci sequence (1, 2, 3, 5, 8, 13, 21)
- **UAC Tagging**: All criteria tagged with FE:, BE:, DB:, DevOps:, or CLI:
- **Dependency Tracking**: New stories reference dependencies on existing stories

## Error Handling

**Feature Description Missing:**
- Display error: "Please provide a feature description"
- Suggest: "/new-feature {description}" or "/new-feature --draft {description}"
- Example: "/new-feature 'Add user authentication with OAuth2'"

**Latest PRD Not Found:**
- Display error: "No PRD found in docs/"
- Suggest: "Run /setup first to initialize documentation structure"
- Or: "Create PRD manually: docs/002-prd-v1.0.0.md"

**Latest Atomic Stories Not Found:**
- Display error: "No atomic stories found in docs/"
- Suggest: "Run /setup first to initialize documentation structure"
- Or: "Create atomic stories manually: docs/200-atomic-stories-v1.0.0.md"

**Version Parsing Error:**
- Display warning: "Could not parse version from {filename}"
- Default to v1.0.0 as base
- Ask user to confirm next version number

**File Write Failed:**
- Display error: "Could not write file: {filename}"
- Check disk space and permissions
- List files that were successfully created
- Provide content for manual file creation

**Architecture Document Read Failed:**
- Display warning: "Could not read {document}, skipping draft creation"
- Continue with other documents
- Note which documents were skipped in summary

**Progress Update Failed:**
- Complete feature addition successfully
- Display warning: "Could not update progress tracking"
- Suggest: "Run /update-progress manually"

**ADR Creation Failed:**
- Complete feature addition successfully
- Display warning: "Could not create ADR"
- Provide ADR content for manual creation

**Draft Flag Parse Error:**
- Display warning: "Could not parse --draft flag, defaulting to draft mode"
- Safer to default to draft than production

## Success Criteria

The `/new-feature` command is successful when:
1. ✅ Feature description parsed and validated
2. ✅ Draft mode correctly detected from `--draft` flag
3. ✅ Latest PRD and Atomic Stories versions identified
4. ✅ Next version numbers calculated correctly
5. ✅ Feature impact analyzed (FE, BE, DB, DevOps)
6. ✅ Target epic selected (existing or new) — story is not orphaned from epic structure
7. ✅ Draft PRD version created with feature added
8. ✅ Draft Atomic Stories version created with new story
9. ✅ New story follows proper format with UACs
10. ✅ Individual story file created in `docs/epics/{epicDir}/pending/` with correct YAML frontmatter
11. ✅ UAC checkboxes in story file body use `- [ ] TYPE: description` format (parseable by `--reconcile`)
12. ✅ Epic stats refreshed via `aggregate-epics.js --update` after story file creation
13. ✅ Draft architecture documents created for affected components only
14. ✅ Draft ADR created documenting architectural decisions
15. ✅ Progress tracking updated with draft story
16. ✅ All documents have consistent version numbers
17. ✅ `-draft` suffix applied correctly in draft mode
18. ✅ User receives comprehensive summary report
19. ✅ Clear next steps provided for finalization or implementation

## Future Enhancements

### v1.3.1
- Interactive feature builder with guided questions
- Feature template library (authentication, payments, notifications)
- Automatic effort estimation based on feature complexity
- Dependency detection from existing stories

### v1.4.0
- Multi-feature batch addition
- Feature comparison and prioritization
- Impact analysis visualization
- Automatic test case generation from UACs

### v1.5.0
- AI-powered feature decomposition (break large features into stories)
- Conflict detection with existing features
- Resource estimation (time, cost, team size)
- Integration with project management tools (Jira, Linear)
