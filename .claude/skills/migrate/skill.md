# Migrate to AI Dev Agency Standard Format Command

Migrate existing project documentation to standardized AI Dev Agency format with epic-based organization, file-based structure, YAML frontmatter integration, and proper markdown checklist formatting.

## Execution Steps

### Phase 1: Analyze Current Documentation Structure

1. **Detect Atomic Stories File**
   - Use Glob to find atomic stories: `docs/200-atomic-stories-v*.md`
   - **EXCLUDE** files with `-draft` suffix
   - Read the latest production version
   - Store as `current_atomic_stories`

2. **Analyze Story Organization Pattern**
   - Parse the atomic stories document structure
   - **Detect grouping strategy:**
     - **Version-Based**: Stories grouped by `## v1.0.0`, `## v1.1.0`, etc.
       - Example: `## v1.0.0 MVP (Released...)` followed by stories
       - Versions represent delivery milestones/releases
       - Common in current AI Dev Agency project
     - **Epic-Based**: Stories grouped by `## Epic 1 - {Description}`
       - Example: `## Epic 1 - User Authentication` followed by stories
       - Epics represent feature areas/themes
       - Common in other projects using AI Dev Agency
     - **Mixed**: Combination of both patterns
   - Store detected pattern as `organization_type`

3. **Analyze UAC Checkbox Format**
   - Search for User Acceptance Criteria sections
   - **Detect current format:**
     - **Status Emoji**: `- ✅ FE:` or `- ⏳ FE:` (current format)
     - **Markdown Checkbox**: `- [ ] FE:` or `- [x] FE:` (target format)
     - **Plain List**: `- FE:` (no status indicator)
   - Count occurrences of each format
   - Store as `uac_format_type`

4. **Detect File Structure**
   - Check if `docs/epics/` directory exists
   - **File-based structure:** Epic folders with status subdirectories
     ```
     docs/epics/
       001-mvp-features/
         pending/
         in-progress/
         qa/
         done/
         blocked/
       002-authentication/
         ...
     ```
   - **Document-based structure:** Single monolithic atomic stories file
     ```
     docs/200-atomic-stories-v1.6.0.md
     ```
   - Store as `structure_type`

5. **Read Related Documentation**
   - Read `docs/002-prd-v*.md` (if exists) for epic descriptions
   - Read `docs/progress/000-progress-v*.md` (if exists) for completion status
   - Read `docs/175-c4-diagrams-v*.md` (if exists) for architecture context
   - Store all as context for migration

6. **Generate Migration Plan Summary**
   - Display analysis results:
     ```
     📊 Current Documentation Analysis:
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     Source File: docs/200-atomic-stories-v1.6.0.md
     Organization: Version-Based (v1.0.0, v1.1.0, v1.2.0, ...)
     UAC Format: Status Emoji (✅/⏳)
     Structure: Document-Based (monolithic file)
     Total Stories: 45
     Total Epics/Versions: 6

     🎯 Target Format:
     Organization: Epic-Based (Epic 1, Epic 2, ...)
     UAC Format: Markdown Checkbox ([ ]/[x])
     Structure: File-Based (epic folders + YAML frontmatter)
     ```

### Phase 2: Generate Custom Migration Script

1. **Analyze Story Format Patterns**
   - Extract 3-5 sample stories from atomic stories file
   - Detect story header pattern:
     - `### Story {num} - {title}` (standard)
     - `## Story {num}: {title}` (alternative)
     - Custom patterns detected via regex analysis
   - Detect metadata format:
     - `**Priority:** {value}` (bold markers)
     - `Priority: {value}` (plain text)
     - YAML frontmatter already present
   - Detect UAC format:
     - `- ✅ FE:` (emoji status)
     - `- [ ] FE:` (checkbox)
     - `- FE:` (plain list)
   - Detect user story format:
     - `**As a** {persona} **I want** {want} **So that** {benefit}` (standard)
     - Alternative formats or missing components

2. **Generate Custom Parser Module**
   - Create `./.ai-dev/ai-dev-scripts/migration/parsers/custom-parser-{timestamp}.js`
   - Generate regex patterns based on detected format:
     ```javascript
     // Auto-generated parser for this project
     const STORY_HEADER_PATTERN = /{detected-pattern}/;
     const METADATA_PATTERN = /{detected-pattern}/;
     const UAC_PATTERN = /{detected-pattern}/;
     ```
   - Include format conversion logic:
     - Emoji → Checkbox conversion if needed
     - Plain list → Checkbox if needed
     - Already checkbox → Preserve
   - Add validation checks for detected format

3. **Generate Project-Specific Migration Script**
   - Create `./.ai-dev/ai-dev-scripts/migration/migrate-{project-name}-{timestamp}.js`
   - Import custom parser module
   - Configure paths specific to this project:
     ```javascript
     const ATOMIC_STORIES_PATH = 'docs/200-atomic-stories-v{version}.md';
     const EPICS_BASE_PATH = 'docs/epics/';
     const EPIC_MAPPING = {detected-mappings};
     ```
   - Include project-specific logic:
     - Handle detected organization type (version-based vs epic-based)
     - Handle detected UAC format
     - Handle any custom fields or patterns
   - Add dry-run capability for safe testing

4. **Validate Generated Script**
   - Test parser against sample stories
   - Verify all patterns match correctly
   - Check for edge cases (missing fields, special characters)
   - Display validation results:
     ```
     ✅ Script Generation Validation:
     - Story header pattern: 47/47 stories matched
     - Metadata extraction: 47/47 complete
     - UAC parsing: 456/456 UACs parsed
     - Format conversion: Emoji → Checkbox (456 conversions)
     ```

5. **Ask User to Review Script**
   - Use AskUserQuestion to present options:
     - "Review generated script first" → Display script path, pause for review
     - "Run script with --dry-run" → Execute dry-run mode
     - "Run script now" → Execute migration immediately
     - "Cancel migration" → Stop and preserve current state
   - If user selects review:
     - Display script location
     - Show sample transformations (3 stories)
     - Wait for user to examine script
     - Re-prompt for action

### Phase 3: Map Versions to Epics

1. **Extract Version Sections**
   - Use generated custom parser to extract version sections
   - For each version (e.g., v1.0.0, v1.1.0):
     - Extract version title: "v1.0.0 MVP"
     - Extract description: "Released February 6, 2026"
     - Extract story list
     - Extract completion status

2. **Generate Epic Mapping**
   - Convert each version to an epic:
     - **Epic ID**: Numeric sequence (001, 002, 003, ...)
     - **Epic Name**: Version title without version number
       - `v1.0.0 MVP` → `Epic 001 - MVP Features`
       - `v1.1.0 Code Generation Toolkit` → `Epic 002 - Code Generation Toolkit`
       - `v1.6.0 Sync-Board & Project Management` → `Epic 007 - Sync-Board & Project Management`
   - Create mapping table:
     ```
     v1.0.0 → Epic 001 - MVP Features
     v1.1.0 → Epic 002 - Code Generation Toolkit
     v1.2.0 → Epic 003 - Cross-IDE Compatibility & QA
     v1.3.0 → Epic 004 - Draft Workflow & Design System
     v1.4.0 → Epic 005 - Knowledge Management & BI
     v1.5.0 → Epic 006 - Meeting Management System
     v1.6.0 → Epic 007 - Sync-Board & Project Management
     ```

3. **Handle Edge Cases**
   - **Already Epic-Based**: If document uses Epic format, skip this mapping
   - **Mixed Format**: Prioritize epic names, create epics for version-only sections
   - **Custom Groupings**: Preserve custom epic names if already present

4. **Extract Epic Metadata**
   - For each epic, calculate:
     - **Total Stories**: Count of stories in the epic
     - **Completed Stories**: Stories marked as ✅
     - **Total Points**: Sum of story points
     - **Completed Points**: Sum of completed story points
     - **Completion Percentage**: `(completed_points / total_points) * 100`
     - **Priority**: High (if contains MVP/critical), Medium, or Low
     - **Tags**: Extract from version description (mvp, core, v1.0.0, etc.)

5. **Validate Epic Assignments**
   - Ensure every story belongs to exactly one epic
   - Check for orphaned stories (no epic assignment)
   - Verify epic IDs are sequential and unique

### Phase 3: Convert UAC Format to Markdown Checkboxes

1. **Parse All User Acceptance Criteria**
   - For each story, extract UAC sections
   - Identify UAC lines by role tag prefix:
     - `FE:`, `BE:`, `DB:`, `DevOps:`, `CLI:`
   - Track current status indicator

2. **Convert Status Indicators**
   - **From Status Emoji to Checkbox:**
     - `- ✅ FE: Component renders correctly` → `- [x] FE: Component renders correctly`
     - `- ⏳ BE: API endpoint created` → `- [ ] BE: API endpoint created`
     - `- 🚧 DB: Migration script runs` → `- [ ] DB: Migration script runs`
     - `- ⏸️ DevOps: CI pipeline configured` → `- [ ] DevOps: CI pipeline configured`
   - **Mapping:**
     - ✅ (completed) → `[x]`
     - ⏳ (pending) → `[ ]`
     - 🚧 (in progress) → `[ ]`
     - ⏸️ (blocked) → `[ ]` with note
     - ❌ (cancelled) → `[x]` with ~~strikethrough~~

3. **Preserve UAC Details**
   - Keep all UAC description text exactly as is
   - Maintain indentation and sub-bullets if present
   - Preserve role tags (FE:, BE:, DB:, DevOps:, CLI:)

4. **Handle Special Cases**
   - **Multi-line UACs**: Preserve continuation lines
   - **Nested UACs**: Maintain hierarchy with proper indentation
   - **Notes/Comments**: Keep notes after UAC (e.g., "// blocked by Story 123")

5. **Validate Checkbox Format**
   - Verify all UACs use proper markdown checkbox syntax
   - Ensure `[ ]` has exactly one space inside brackets
   - Ensure `[x]` has lowercase x
   - Check that checkboxes render correctly in markdown viewers

### Phase 4: Generate Epic Directory Structure

1. **Create Epic Folders**
   - Create `docs/epics/` directory if it doesn't exist
   - For each epic from Phase 2 mapping:
     ```bash
     mkdir -p docs/epics/{epic-id}-{epic-slug}/
     ```
   - Epic slug: Lowercase, hyphenated version of epic name
     - `Epic 001 - MVP Features` → `001-mvp-features`
     - `Epic 007 - Sync-Board & Project Management` → `007-sync-board-project-management`

2. **Create Status Subdirectories**
   - For each epic folder, create status directories:
     ```bash
     mkdir -p docs/epics/{epic-id}/pending/
     mkdir -p docs/epics/{epic-id}/in-progress/
     mkdir -p docs/epics/{epic-id}/qa/
     mkdir -p docs/epics/{epic-id}/done/
     mkdir -p docs/epics/{epic-id}/blocked/
     ```
   - These map to story lifecycle stages

3. **Determine Story Status**
   - For each story, calculate current status:
     - **Done (✅)**: All UACs marked as complete (100%)
     - **QA (🔍)**: 80-99% UACs complete
     - **In Progress (🚧)**: 1-79% UACs complete
     - **Pending (⏳)**: 0% UACs complete (none started)
     - **Blocked (⏸️)**: Has blocked UACs or explicit block marker
   - Use completion percentage and context to determine folder

4. **Assign Stories to Status Folders**
   - Based on calculated status, plan file locations:
     ```
     Story 001 (100% complete) → docs/epics/001-mvp-features/done/001-001-project-setup.md
     Story 320 (40% complete) → docs/epics/007-sync-board/in-progress/007-320-epic-story-management.md
     Story 335 (0% complete) → docs/epics/007-sync-board/pending/007-335-bug-workflow.md
     ```

5. **Generate Story Filename Convention**
   - **Format**: `{epic-id}-{story-num}-{story-slug}.md`
   - **Examples:**
     - Story 001 → `001-001-project-setup.md`
     - Story 320 → `007-320-epic-story-management.md`
   - **Story Slug**: Derived from story title
     - "Epic and Story File-Based Management" → `epic-story-management`
     - "Sprint Planning with Burndown Charts" → `sprint-planning-burndown-charts`

### Phase 5: Generate Story Markdown Files with YAML Frontmatter

1. **Create Story File Template**
   - Each story file follows this structure:
     ```markdown
     ---
     story_id: "{epic-id}-{story-num}"
     epic_id: "{epic-id}"
     story_name: "{Story Title}"
     story_status: pending|in-progress|qa|done|blocked
     priority: high|medium|low
     story_points: {points}
     assignees: []
     tags: [{tag1}, {tag2}]
     dependencies: [{story-id}]
     created_at: "{ISO8601 timestamp}"
     updated_at: "{ISO8601 timestamp}"
     completed_at: "{ISO8601 timestamp or null}"
     ---

     ## Description

     **As a** {persona}
     **I want** {capability}
     **So that** {benefit}

     {Additional description paragraphs}

     ## User Acceptance Criteria

     - [ ] FE: {Frontend acceptance criterion}
     - [ ] BE: {Backend acceptance criterion}
     - [ ] DB: {Database acceptance criterion}
     - [x] DevOps: {Completed DevOps criterion}

     ## Test Requirements

     - **Unit Tests:** {Description}
     - **E2E Tests:** {Description}

     ## Dependencies

     - Story {ID}: {Dependency description}

     ## Notes

     {Additional notes, blockers, or context}
     ```

2. **Parse Story Content from Atomic Stories**
   - For each story in the source document:
     - Extract story ID and title
     - Extract user story (As a/I want/So that)
     - Extract priority and effort (story points)
     - Extract dependencies
     - Extract all UACs (with converted checkbox format)
     - Extract test requirements
     - Extract any notes or comments

3. **Generate YAML Frontmatter**
   - **story_id**: `{epic-id}-{story-num}` (e.g., "007-320")
   - **epic_id**: Mapped epic ID (e.g., "007")
   - **story_name**: Story title
   - **story_status**: Calculated from Phase 4
   - **priority**: Extract from story (High/Medium/Low)
   - **story_points**: Effort value (Fibonacci: 1,2,3,5,8,13,21)
   - **assignees**: Empty array (to be filled manually)
   - **tags**: Extract from epic tags + story-specific tags
   - **dependencies**: Array of story IDs this story depends on
   - **created_at**: Use PRD release date or current timestamp
   - **updated_at**: Current timestamp
   - **completed_at**: Completion date if done, otherwise null

4. **Generate Markdown Body**
   - **Description Section**:
     - User story in standard format
     - Additional description paragraphs from atomic stories
   - **User Acceptance Criteria Section**:
     - All UACs in markdown checkbox format `[ ]` or `[x]`
     - Preserve role tags (FE:, BE:, DB:, DevOps:, CLI:)
     - Maintain original order and grouping
   - **Test Requirements Section**:
     - Unit tests description
     - E2E tests description
   - **Dependencies Section** (if applicable):
     - List dependent stories with brief description
   - **Notes Section** (if applicable):
     - Blockers, context, or additional information

5. **Write Story Files**
   - For each story:
     - Use Write tool to create file at:
       `docs/epics/{epic-id}/{status}/{epic-id}-{story-num}-{slug}.md`
     - Content: YAML frontmatter + markdown body
     - Validate YAML syntax with gray-matter compatible format
   - Display progress:
     ```
     Creating story files...
     ✅ 001-001-project-setup.md (done)
     ✅ 007-320-epic-story-management.md (in-progress)
     ✅ 007-321-sprint-planning.md (pending)
     ...
     ```

### Phase 6: Create Epic Metadata Files

1. **Generate Epic Summary File**
   - For each epic, create `docs/epics/{epic-id}/README.md`:
     ```markdown
     # Epic {ID} - {Epic Name}

     **Epic ID:** {epic-id}
     **Priority:** {high|medium|low}
     **Status:** {active|completed|cancelled}
     **Total Stories:** {count}
     **Completed Stories:** {count}
     **Story Points:** {total}/{completed}
     **Completion:** {percentage}%

     ## Description

     {Epic description from version/epic section}

     ## Stories

     ### Done ✅ ({count} stories, {points} points)
     - [Story {ID}](done/{filename}.md) - {title} ({points} pts)
     - ...

     ### In Progress 🚧 ({count} stories, {points} points)
     - [Story {ID}](in-progress/{filename}.md) - {title} ({points} pts)
     - ...

     ### Pending ⏳ ({count} stories, {points} points)
     - [Story {ID}](pending/{filename}.md) - {title} ({points} pts)
     - ...

     ### Blocked ⏸️ ({count} stories, {points} points)
     - [Story {ID}](blocked/{filename}.md) - {title} ({points} pts)
     - ...

     ## Timeline

     - **Started:** {date}
     - **Target Completion:** {date}
     - **Actual Completion:** {date or TBD}

     ## Dependencies

     - Epic {ID}: {Description}

     ## Notes

     {Additional context, risks, or information}
     ```

2. **Calculate Epic Metrics**
   - For each epic:
     - Count stories by status
     - Sum story points by status
     - Calculate completion percentage
     - Determine epic status (active if any pending/in-progress, completed if all done)

3. **Generate Story Links**
   - Create markdown links to all story files
   - Group by status (Done, In Progress, Pending, Blocked)
   - Include story title and points for quick reference

4. **Write Epic README Files**
   - Use Write tool to create each epic's README.md
   - Ensure links are relative and work correctly

### Phase 7: Create Master Epic Index

1. **Generate `docs/epics/README.md`**
   - Master index of all epics:
     ```markdown
     # Project Epics

     This directory contains all project epics organized by feature areas. Each epic has its own folder with stories categorized by status.

     ## Epic Structure

     ```
     docs/epics/
       {epic-id}-{epic-slug}/
         README.md           # Epic overview and metrics
         pending/            # Stories not yet started
         in-progress/        # Stories currently being worked on
         qa/                 # Stories in review/testing
         done/               # Completed stories
         blocked/            # Stories with blockers
     ```

     ## All Epics

     | Epic ID | Name | Stories | Points | Completion | Status |
     |---------|------|---------|--------|------------|--------|
     | 001 | MVP Features | 6/6 | 32/32 | 100% | ✅ Complete |
     | 002 | Code Generation Toolkit | 4/4 | 45/45 | 100% | ✅ Complete |
     | 003 | Cross-IDE Compatibility | 2/6 | 15/42 | 36% | 🚧 Active |
     | 007 | Sync-Board & Project Management | 0/13 | 0/162 | 0% | ⏳ Pending |

     ## Epic Descriptions

     ### [Epic 001 - MVP Features](001-mvp-features/)
     Complete documentation system with project setup, review, define, progress tracking, ADR management, and build orchestration.

     ### [Epic 002 - Code Generation Toolkit](002-code-generation-toolkit/)
     Frontend, backend, and DevOps code generation with comprehensive testing.

     ### [Epic 007 - Sync-Board & Project Management](007-sync-board-project-management/)
     File-based project dashboard with real-time sync, epic/story management, YAML frontmatter, sprint planning, and bug tracking.

     ## Quick Stats

     - **Total Epics:** {count}
     - **Active Epics:** {count}
     - **Completed Epics:** {count}
     - **Total Stories:** {count}
     - **Completed Stories:** {count}
     - **Total Story Points:** {total}
     - **Completed Story Points:** {completed}
     - **Overall Completion:** {percentage}%

     ## Navigation

     - [View All Stories by Status](../atomic-stories-v1.6.0.md) (Legacy)
     - [View Progress Tracking](../progress/)
     - [View PRD](../002-prd-v1.6.0.md)
     ```

2. **Calculate Overall Metrics**
   - Aggregate metrics across all epics
   - Calculate total stories, points, completion
   - Generate epic status summary table

3. **Create Epic Links**
   - Link to each epic's README.md
   - Include epic description summary
   - Display key metrics in table format

4. **Write Master Index**
   - Use Write tool to create `docs/epics/README.md`

### Phase 8: Convert Atomic Stories Document to Epic/Story Index

1. **Read Current Atomic Stories**
   - Read the source atomic stories file
   - Extract version, date, history

2. **Add Index Notice**
   - Add prominent notice at top of document:
     ```markdown
     > **📋 EPIC & STORY INDEX**
     >
     > This document serves as an index to all epics and stories in the project.
     > Actual story files are located in `docs/epics/{epic-id}/{status}/` directories.
     >
     > - **Master Epic Index:** [docs/epics/README.md](epics/README.md)
     > - **Migration Date:** {current date}
     > - **Migration Command:** `/migrate`
     >
     > **Note:** `/new-feature` and `/log-bug` commands update this index and create
     > actual story/bug files in the epic folder structure.
     ```

3. **Update Document Header**
   - Change title: "Atomic User Stories v1.6.0" → "Atomic Stories Index v1.6.0"
   - Add "Last Updated" with migration date
   - Add "Role: Story Index" note
   - Keep version number unchanged (it's the document version)

4. **Convert Stories to Index Entries**
   - Replace full story content with index entries:
     ```markdown
     ### Story 320 - Epic and Story File-Based Management

     **Location:** [docs/epics/007-sync-board/in-progress/007-320-epic-story-management.md](epics/007-sync-board/in-progress/007-320-epic-story-management.md)
     **Epic:** Epic 007 - Sync-Board & Project Management
     **Status:** In Progress 🚧
     **Priority:** High
     **Points:** 13
     **Assignees:** None
     **UACs:** 8 total (3 complete, 5 pending)

     **Quick Summary:**
     As a developer, I want epic and story management via markdown files with YAML frontmatter,
     so that I can organize work hierarchically and track status through file location.

     **UAC Progress:**
     - [x] BE: Epic metadata CRUD endpoints (3/8)
     - [ ] FE: Kanban board with drag-drop (0/8)
     - [ ] DB: File-based data model (0/8)

     [View Full Story →](epics/007-sync-board/in-progress/007-320-epic-story-management.md)
     ```

5. **Group by Epic (Not Version)**
   - Reorganize document structure:
     ```markdown
     ## Epic 001 - MVP Features ✅ 100% Complete

     **Location:** [docs/epics/001-mvp-features/](epics/001-mvp-features/)
     **Stories:** 6 | **Points:** 32/32 | **Status:** Complete

     - [Story 001 - Project Setup Command](epics/001-mvp-features/done/001-001-project-setup.md) ✅
     - [Story 002 - Review and Setup Command](epics/001-mvp-features/done/001-002-review-setup.md) ✅
     - ... (all stories with links)

     ## Epic 007 - Sync-Board & Project Management ⏳ 0% Complete

     **Location:** [docs/epics/007-sync-board-project-management/](epics/007-sync-board-project-management/)
     **Stories:** 13 | **Points:** 0/162 | **Status:** Pending

     - [Story 320 - Epic and Story File-Based Management](epics/007-sync-board/in-progress/007-320-epic-story-management.md) 🚧
     - [Story 321 - Sprint Planning with Burndown Charts](epics/007-sync-board/pending/007-321-sprint-planning.md) ⏳
     - ... (all stories with links)
     ```

6. **Add Future Workflow Notes**
   - Document how commands interact with index:
     ```markdown
     ## How This Index Works

     This document is automatically maintained by:

     - **/new-feature**: Adds new story to this index + creates file in `docs/epics/{epic-id}/pending/`
     - **/log-bug**: Adds bug entry to this index + creates file in `docs/epics/{epic-id}/bugs/`
     - **/sync-board**: Reads this index + epic files to generate dashboard data
     - **/migrate**: Converts legacy format to epic-based structure + updates this index

     When you move a story between statuses (pending → in-progress), the file moves
     between directories and this index updates automatically via file watchers.
     ```

7. **Write Updated Atomic Stories Index**
   - Use Edit tool to add index notice
   - Use Edit tool to restructure as index (not full content)
   - Use Edit tool to group by epic instead of version
   - Preserve version history section for reference

### Phase 9: Update Progress Tracking

1. **Find Progress Document**
   - Use Glob to find: `docs/progress/000-progress-v*.md`
   - Read matching version

2. **Update Progress Structure**
   - Add reference to epic structure:
     ```markdown
     ## Epic Progress

     Progress is now tracked at the epic level in `docs/epics/{epic-id}/README.md`.

     See [Epic Index](../epics/README.md) for detailed epic progress.

     ## Legacy Story Progress

     {Existing progress content}
     ```

3. **Update Story References**
   - For each story reference in progress:
     - Add link to new file location
     - Keep existing completion tracking
     - Note migration status

4. **Write Updated Progress**
   - Use Edit tool to update progress document

### Phase 10: Create Migration Summary Document

1. **Generate Migration Report**
   - Create `docs/MIGRATION-REPORT.md`:
     ```markdown
     # AI Dev Agency Format Migration Report

     **Migration Date:** {current date}
     **Migration Command:** /migrate
     **Source Document:** docs/200-atomic-stories-v1.6.0.md

     ## Migration Summary

     ✅ Successfully migrated {count} stories across {epic-count} epics to standardized AI Dev Agency format.

     ## Changes Applied

     ### 1. Organization Structure
     - **From:** Version-based grouping (v1.0.0, v1.1.0, ...)
     - **To:** Epic-based grouping (Epic 001, Epic 002, ...)

     ### 2. UAC Format
     - **From:** Status emoji (✅ ⏳ 🚧 ⏸️)
     - **To:** Markdown checkboxes ([ ] [x])

     ### 3. File Structure
     - **From:** Monolithic atomic-stories-v1.6.0.md
     - **To:** File-based epic structure with YAML frontmatter

     ## Epic Mapping

     | Version | Epic ID | Epic Name | Stories | Points |
     |---------|---------|-----------|---------|--------|
     | v1.0.0 | 001 | MVP Features | 6 | 32 |
     | v1.1.0 | 002 | Code Generation Toolkit | 4 | 45 |
     | v1.6.0 | 007 | Sync-Board & Project Management | 13 | 162 |

     ## File Structure Created

     ```
     docs/epics/
       README.md (Master epic index)
       001-mvp-features/
         README.md (Epic overview)
         done/
           001-001-project-setup.md
           001-002-review-setup.md
           ... (6 stories)
       007-sync-board-project-management/
         README.md
         pending/
           007-320-epic-story-management.md
           007-321-sprint-planning.md
           ... (13 stories)
     ```

     ## Statistics

     - **Total Epics Created:** {count}
     - **Total Stories Migrated:** {count}
     - **Total Files Created:** {count}
     - **Total Story Points:** {total}
     - **Average Story Points per Epic:** {avg}

     ## Validation

     ✅ All stories migrated successfully
     ✅ All UACs converted to checkbox format
     ✅ YAML frontmatter validated
     ✅ File structure created correctly
     ✅ Epic metadata calculated accurately
     ✅ Cross-references updated

     ## Next Steps

     1. Review epic structure: `docs/epics/README.md`
     2. Verify story files: `docs/epics/{epic-id}/`
     3. Update sync-board to use new structure: `/sync-board`
     4. Test dashboard integration
     5. Commit migration to git

     ## Rollback Instructions

     If migration needs to be reverted:

     1. Delete `docs/epics/` directory
     2. Restore `docs/200-atomic-stories-v1.6.0.md` from git
     3. Restore `docs/progress/` from git

     The original atomic stories file is preserved with migration notices for reference.
     ```

2. **Write Migration Report**
   - Use Write tool to create `docs/MIGRATION-REPORT.md`

### Phase 11: Validate Migration

1. **Validate Epic Structure**
   - Verify all epic directories created
   - Check all status subdirectories exist
   - Verify epic README files exist and are readable

2. **Validate Story Files**
   - Count total story files created
   - Verify each file has valid YAML frontmatter
   - Check that all UACs use checkbox format `[ ]` or `[x]`
   - Verify story content is complete

3. **Validate Cross-References**
   - Check links in epic READMEs point to correct story files
   - Verify master epic index links work
   - Confirm atomic stories migration notices are present

4. **Validate Data Integrity**
   - Count stories before and after migration (should match)
   - Sum story points before and after (should match)
   - Verify no stories were lost or duplicated

5. **Generate Validation Report**
   - Display validation results:
     ```
     ✅ Validation Complete

     Epic Structure:
     - ✅ {epic-count} epic directories created
     - ✅ {status-count} status subdirectories per epic
     - ✅ All epic README files present

     Story Files:
     - ✅ {story-count} story files created
     - ✅ All files have valid YAML frontmatter
     - ✅ All UACs use checkbox format
     - ✅ All story content preserved

     Cross-References:
     - ✅ Epic index links verified
     - ✅ Story links in epic READMEs verified
     - ✅ Migration notices in atomic stories

     Data Integrity:
     - ✅ Story count: {before} → {after} (match)
     - ✅ Story points: {before} → {after} (match)
     - ✅ No duplicate stories detected
     ```

### Phase 12: Generate Summary Report

1. **Collect Migration Metrics**
   - Total epics created
   - Total stories migrated
   - Total files created
   - UACs converted
   - Validation status

2. **Display Comprehensive Summary**
   ```
   ✅ Migration to AI Dev Agency standard format complete!

   📊 Migration Summary:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Source:  docs/200-atomic-stories-v1.6.0.md
   Target:  docs/epics/ (file-based structure)
   Date:    {current date}

   📋 Changes Applied:

   1. Organization:
      ✅ Converted from version-based to epic-based grouping
      - v1.0.0 MVP → Epic 001 - MVP Features
      - v1.6.0 Sync-Board → Epic 007 - Sync-Board & Project Management

   2. UAC Format:
      ✅ Converted {count} UACs from emoji to checkboxes
      - ✅ → [x] (completed)
      - ⏳ → [ ] (pending)

   3. File Structure:
      ✅ Created epic-based file structure with YAML frontmatter
      - {epic-count} epic directories
      - {story-count} story markdown files
      - Epic README files with metrics

   📁 Files Created:

   - docs/epics/README.md (master index)
   - docs/epics/001-mvp-features/README.md + 6 stories
   - docs/epics/007-sync-board-project-management/README.md + 13 stories
   - docs/MIGRATION-REPORT.md (detailed report)

   📈 Statistics:

   - Epics: {count}
   - Stories: {count}
   - Story Points: {total}
   - Files Created: {count}
   - UACs Migrated: {count}

   ✅ Validation:

   - ✅ All stories migrated successfully
   - ✅ Data integrity verified (no loss)
   - ✅ YAML frontmatter validated
   - ✅ Checkbox format confirmed
   - ✅ Cross-references working

   🎯 Next Steps:

   1. Review epic structure:
      - Master index: docs/epics/README.md
      - Epic details: docs/epics/{epic-id}/README.md

   2. Update sync-board:
      /sync-board

   3. Test dashboard integration:
      - Open dashboard: http://localhost:3001
      - Verify epics and stories load correctly

   4. Commit migration to git:
      git add docs/epics/ docs/MIGRATION-REPORT.md
      git commit -m "feat: migrate to AI Dev Agency standard format"

   ✨ Migration complete! Your documentation is now standardized. ✨
   ```

3. **Provide Rollback Instructions**
   - Include rollback steps in case migration needs reverting
   - Reference git commands to restore original state

## Input Format

**Command:**
```
/migrate
```

No arguments required - automatically detects and migrates from current format.

**Optional Arguments (Future):**
```
/migrate --dry-run              # Show migration plan without executing
/migrate --epic-prefix {text}   # Custom epic prefix (default: "Epic")
/migrate --preserve-versions    # Keep version numbers in epic names
/migrate --rollback             # Revert previous migration
```

**Examples:**
```
/migrate
(Analyze and migrate to standard format)

/migrate --dry-run
(Preview migration without making changes)
```

## Output Format

```
✅ Migration to AI Dev Agency standard format complete!

📊 Migration Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Source:  docs/200-atomic-stories-v1.6.0.md
Target:  docs/epics/ (file-based structure)
Date:    March 15, 2026

📋 Changes Applied:

1. Organization: Version-based → Epic-based ✅
2. UAC Format: Emoji → Checkboxes ✅
3. File Structure: Monolithic → File-based ✅

📁 Created:
- 7 epic directories
- 45 story files
- Epic README files
- Master epic index

📈 Statistics:
- Epics: 7
- Stories: 45
- Points: 450
- Files: 53
- UACs: 180

🎯 Next: Review docs/epics/README.md and run /sync-board
```

## Important Notes

- **Backward Compatible**: Original atomic stories file preserved with migration notices
- **Idempotent**: Can run multiple times safely (will detect existing migration)
- **Non-Destructive**: All original content preserved, no data loss
- **Validation Built-In**: Comprehensive validation ensures data integrity
- **Git-Friendly**: All changes in `docs/epics/` directory for easy version control
- **Dashboard Ready**: Output format designed for `/sync-board` consumption
- **YAML Compliant**: Frontmatter compatible with gray-matter parsing library
- **Markdown Standard**: Uses proper `[ ]` and `[x]` checkbox format
- **Epic Metadata**: Calculates completion, points, status automatically
- **Cross-References**: Maintains links between docs, epics, and stories
- **Rollback Support**: Clear instructions for reverting migration if needed

## Error Handling

**Atomic Stories Not Found:**
- Display error: "No atomic stories found in docs/"
- Suggest: "Run /setup first to initialize documentation"
- Or: "Check if atomic stories exist in different location"

**Invalid Document Format:**
- Display error: "Could not parse atomic stories format"
- Show: Which sections failed to parse
- Suggest: "Ensure document follows standard format or run /review-and-setup"

**Epic Mapping Conflict:**
- Display warning: "Version/Epic mapping conflict detected"
- Show: Which versions couldn't be mapped
- Ask: "How should {version} be mapped to an epic?"
- Options: "Create new epic", "Merge with existing epic", "Skip this version"

**Story Duplication Detected:**
- Display error: "Duplicate story IDs found: {story-ids}"
- Show: Stories with same ID
- Ask: "How to resolve?"
- Options: "Renumber duplicates", "Keep first", "Manual resolution"

**UAC Format Detection Failed:**
- Display warning: "Could not detect UAC format"
- Default to converting all list items to checkboxes
- Preserve original if unsure

**Directory Creation Failed:**
- Display error: "Could not create epic directory: {path}"
- Check permissions and disk space
- Abort migration with rollback instructions

**File Write Failed:**
- Display error: "Could not write story file: {filename}"
- Show: Which files were successfully created
- Provide: Content for manual file creation
- Offer: Retry or skip this file

**YAML Frontmatter Invalid:**
- Display error: "Invalid YAML in story {id}: {error}"
- Show: Problematic YAML section
- Suggest: Corrections to fix syntax
- Allow: Continue with remaining stories

**Validation Failed:**
- Display warnings for failed validations
- Show: Which checks failed and why
- Offer: "Continue anyway" or "Abort migration"
- Provide: Steps to fix validation issues

**Partial Migration (Interrupted):**
- Detect incomplete migration from previous run
- Ask: "Resume migration from {step}" or "Start fresh"
- Clean up partial artifacts if starting fresh

## Success Criteria

The `/migrate` command is successful when:
1. ✅ Current documentation format detected accurately
2. ✅ Version/Epic mapping generated correctly
3. ✅ All UACs converted to markdown checkbox format
4. ✅ Epic directory structure created with status folders
5. ✅ All story files created with valid YAML frontmatter
6. ✅ Epic README files generated with accurate metrics
7. ✅ Master epic index created
8. ✅ Atomic stories document updated with migration notices
9. ✅ Progress tracking updated with epic references
10. ✅ Migration report generated
11. ✅ All validations passed (no data loss)
12. ✅ Cross-references verified and working
13. ✅ User receives comprehensive summary
14. ✅ Rollback instructions provided

## Future Enhancements

### v1.1.0
- **Incremental Migration**: Migrate only new stories since last migration
- **Custom Epic Mapping**: Interactive epic assignment for ambiguous cases
- **Migration Hooks**: Allow custom scripts to run during migration
- **Format Detection**: Auto-detect and support more documentation formats

### v1.2.0
- **Multi-Project Migration**: Batch migrate multiple projects at once
- **Migration Templates**: Pre-configured mappings for common patterns
- **Undo/Redo**: Stack-based migration history with rollback to any point
- **Migration Validation Suite**: Comprehensive automated testing of migrated data

### v1.3.0
- **AI-Assisted Mapping**: Use AI to suggest epic assignments based on story content
- **Migration Analytics**: Track migration metrics and patterns across projects
- **Export/Import**: Export migration configuration for reuse
- **Live Migration**: Migrate while preserving concurrent edits
