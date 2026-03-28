# /search-backlog

Search through atomic stories, progress documentation, and related technical documents to find features, stories, tasks, bugs, or tech debt with full context.

## Purpose

Provide comprehensive search capabilities across project documentation to help users quickly find and understand any feature, story, task, bug, or tech debt item along with all related technical context including ADRs, architecture documents, and implementation details.

## Input Format

```
/search-backlog {search query}
```

**Examples:**
- `/search-backlog landing page`
- `/search-backlog auth bug`
- `/search-backlog Story 315`
- `/search-backlog code review`
- `/search-backlog tech debt database`

## Execution Phases

### Phase 1: Parse Search Query

Extract search intent and keywords:
- Identify if searching for specific story ID (e.g., "Story 315", "UAC-310-BE-001")
- Extract keywords for text search
- Determine search type:
  - Story/Feature (default)
  - Bug (keywords: "bug", "issue", "defect")
  - Tech Debt (keywords: "tech debt", "refactor", "improvement")
  - Task/UAC (keywords: "task", "UAC", "acceptance criteria")

**Tools:** None (string parsing)

**Output:** Structured search parameters with keywords and search type

---

### Phase 2: Find Latest Documentation Files

Locate all relevant documentation files to search:

1. **Primary Sources (Required):**
   - Find latest atomic stories: `docs/200-atomic-stories-v*.md` (index/summary format)
   - Find latest progress doc: `docs/progress/000-progress-v*.md`
   - **Epic Story Files (canonical story content):**
     - Glob `docs/epics/*/pending/*.md` — exclude `epic.md`
     - Glob `docs/epics/*/in-progress/*.md`
     - Glob `docs/epics/*/qa/*.md`
     - Glob `docs/epics/*/done/*.md`
     - Glob `docs/epics/*/blocked/*.md`
     - Glob `docs/epics/*/bugs/*.md` (for bug searches)
   - **Cross-epic index:** `docs/epics/bugs-index.md` (if searching for bugs)

2. **Architecture & Design (If exist):**
   - ADR index: `docs/adr/000-README.md`
   - All ADRs: `docs/adr/*.md`
   - PRD: `docs/002-prd-v*.md`
   - User flows: `docs/100-userflows-v*.md`
   - Design system: `docs/125-design-system-v*.md`
   - Tech stacks: `docs/150-tech-stacks-v*.md`
   - C4 diagrams: `docs/175-c4-diagrams-v*.md`

3. **Implementation Details (If exist):**
   - Frontend: `docs/300-frontend-v*.md`
   - Backend: `docs/325-backend-v*.md`
   - API contract: `docs/350-api-contract-v*.md`
   - Database schema: `docs/375-database-schema-v*.md`

4. **Quality & Operations (If exist):**
   - Testing strategy: `docs/400-testing-strategy-v*.md`
   - DevOps: `docs/425-devops-v*.md`
   - Workers: `docs/450-workers-v*.md`

**Tools:** `Glob` for finding files with version patterns

**Output:** List of all available documentation file paths

---

### Phase 3: Search Epic Story Files and Documentation

Read and search primary documentation sources. **Epic story files are the canonical source** — atomic stories doc is a secondary index.

1. **Search Epic Story Files (primary)**
   - For each file discovered in Phase 2 (all status dirs + bugs/):
     - Read YAML frontmatter: `story_id`, `story_name`, `story_status`, `epic_id`, `priority`, `story_points`, `tags`, `uac_by_type`
     - Read markdown body: description, UAC checkboxes, notes
     - Derive epic context from file path: `{epicDir}/{statusDir}/{filename}.md`
   - Build searchable index of story objects with:
     - `{ storyId, storyName, epicId, statusDir, filePath, description, uacs, tags }`
   - For bug files: extract `bug_severity`, `bug_category`, `bug_status`, `related_story`

2. **Search Atomic Stories Document** (supplemental — for stories not yet in epic format)
   - Read latest `docs/200-atomic-stories-v*.md`
   - Extract any stories not already found in epic story files
   - Add to searchable index

3. **Read Progress Document** (for blocker and tech debt context)
   - Read latest `docs/progress/000-progress-v*.md`
   - Extract blockers and tech debt items
   - Cross-reference with epic story file statuses

4. **Execute Search**
   - If specific story ID provided (e.g., "Story 315", "007-315"):
     - Find exact `story_id` match in epic story files first
     - Fall back to atomic stories doc
   - If bug ID provided (e.g., "BUG-042"):
     - Search `docs/epics/*/bugs/` files
     - Check `docs/epics/bugs-index.md`
   - If keyword search:
     - Search `story_name` and description body
     - Search UAC text in body
     - Search `tags` frontmatter array
   - Rank results by relevance:
     - Exact story_id match (highest)
     - story_name exact match
     - story_name contains keyword
     - Description or UAC contains keyword
   - Include epic context in each result: which epic, which status dir

**Tools:** `Read`, `Glob`, string searching

**Output:** List of matching items with relevance scores and epic context

---

### Phase 4: Present Search Results to User

Display search results and let user select which item they want details about:

Use `AskUserQuestion` to present results:

```
Question: "Which item would you like to view details for?"
Options (up to 4 top matches):
- Story 007-315: AI Dev Persona System [Epic 007 / done] (✅ Completed)
- Story 007-314: Landing Page Generator [Epic 007 / pending] (⏳ Pending)
- Story 007-310: Learning Management [Epic 007 / in-progress] (🚧 In Progress)
- BUG-003: Auth login redirect issue [Epic 007 / bugs] (Critical - P0)
```

Each option should show:
- Type (Story/Bug/Tech Debt/Task)
- ID and title
- Epic context: [Epic {epicId} / {statusDir}]
- Status (✅ Completed / ⏳ Pending / 🚧 In Progress / ⚠️ Blocked)
- Severity (for bugs)
- File path (for direct navigation)

If more than 4 matches, show top 4 and mention total count.

**Tools:** `AskUserQuestion` with single-select

**Output:** User-selected item ID

---

### Phase 5: Extract Selected Item Details

Based on user selection, extract complete details — **read from epic story file first**:

1. **Read Epic Story File** (primary, if available)
   - Read the full content of `{filePath}` from Phase 3 results
   - Extract from YAML frontmatter:
     - `story_id`, `story_name`, `story_status`, `epic_id`
     - `priority`, `story_points`, `tags`, `dependencies`
     - `uac_total`, `uac_completed`, `uac_pending`, `uac_completion_pct`
     - `uac_by_type` (fe/be/db/devops/cli/test counts)
     - `test_unit_status`, `test_e2e_status`, `test_integration_status`
     - For bugs: `bug_severity`, `bug_category`, `bug_status`, `related_story`
   - Extract from markdown body:
     - Full description (As a / I want / So that)
     - All UAC checkboxes (`- [ ]` / `- [x]`) with check state
     - Test Requirements section
     - Dependencies section
     - Notes section
   - Display: `📁 Source: {filePath} [Epic {epicId} / {statusDir}]`

2. **Fallback: Read Atomic Stories** (only if no epic story file found)
   - Extract story from `docs/200-atomic-stories-v*.md`
   - Note: UAC checkbox state and test status not available here

3. **Progress Details** (cross-reference)
   - From story file: `story_status` frontmatter is authoritative
   - From progress doc: any additional blocker or tech debt context

4. **Identify Related Components** (from `uac_by_type` frontmatter)
   - `fe > 0` → need frontend docs
   - `be > 0` or `db > 0` → need backend docs + API contract
   - `devops > 0` → need DevOps docs
   - `test > 0` → need testing strategy

**Tools:** `Read`, parsing

**Output:** Structured item details with full UAC state, epic context, and component tags

---

### Phase 6: Search Related ADRs

Search all ADRs for entries related to the selected item:

1. **Read ADR index** (`docs/adr/000-README.md`)
   - Get list of all ADRs with titles

2. **Search ADR titles and content** for relevance:
   - Extract keywords from story title and description
   - Search ADR titles for keyword matches
   - For top matches, read ADR content to verify relevance

3. **Rank ADR matches:**
   - ADR title contains story keywords
   - ADR mentions story ID
   - ADR created around same time as story version
   - ADR context matches story domain (auth, UI, API, etc.)

**Tools:** `Read`, `Grep` (optional for searching ADR content)

**Output:** List of related ADRs with titles and file paths

---

### Phase 7: Gather Related Architecture Documents

Based on component tags, gather relevant architecture documentation:

**For Frontend UACs:**
- Read latest `docs/300-frontend-v*.md`
- Extract sections related to story (search by keywords)
- Find component architecture and folder structure references

**For Backend UACs:**
- Read latest `docs/325-backend-v*.md`
- Read latest `docs/350-api-contract-v*.md`
- Extract API endpoints related to story
- Find backend architecture and module references

**For Database UACs:**
- Read latest `docs/375-database-schema-v*.md`
- Extract table schemas and relationships related to story
- Find migration notes

**For DevOps UACs:**
- Read latest `docs/425-devops-v*.md`
- Extract CI/CD pipeline details
- Find infrastructure and deployment references

**For All Stories:**
- Read latest `docs/400-testing-strategy-v*.md`
- Extract testing requirements and coverage standards

**Tools:** `Read`, keyword search within documents

**Output:** Relevant sections from each architecture document

---

### Phase 8: Search Related Design Documents

Gather design and planning context:

1. **PRD Reference:**
   - Read latest `docs/002-prd-v*.md`
   - Search for story/feature mentions
   - Extract relevant feature descriptions

2. **User Flow Reference:**
   - Read latest `docs/100-userflows-v*.md`
   - Search for related user flows
   - Extract relevant personas and flow diagrams

3. **Design System Reference** (if FE UACs):
   - Read latest `docs/125-design-system-v*.md`
   - Extract component design guidelines
   - Find color schemes, typography, layout references

4. **Tech Stack Reference:**
   - Read latest `docs/150-tech-stacks-v*.md`
   - Extract relevant technology decisions

**Tools:** `Read`, keyword search

**Output:** Relevant sections from design documents

---

### Phase 9: Compile Comprehensive Context Report

Create a comprehensive report with all gathered information:

```markdown
# Search Results: {Item Title}

## Overview

**Type:** Story / Bug / Tech Debt / Task
**ID:** {ID}
**Epic:** {epicId} — {epic_name}
**Location:** {filePath} [{statusDir}]
**Status:** {Status}
**Priority:** {priority} | **Points:** {story_points}
**UACs:** {uac_completed}/{uac_total} complete ({uac_completion_pct}%)
**Tests:** Unit: {test_unit_status} | E2E: {test_e2e_status} | Integration: {test_integration_status}

## Description

{Full description from epic story file body (As a / I want / So that)}

## User Acceptance Criteria (UACs)

### Frontend (FE)
- [ ] UAC-XXX-FE-001: {Description} - {Status}
- [ ] UAC-XXX-FE-002: {Description} - {Status}

### Backend (BE)
- [ ] UAC-XXX-BE-001: {Description} - {Status}

### Database (DB)
- [ ] UAC-XXX-DB-001: {Description} - {Status}

### DevOps
- [ ] UAC-XXX-DevOps-001: {Description} - {Status}

### Testing
- [ ] UAC-XXX-TEST-001: {Description} - {Status}

## Progress Details

**Overall Status:** {Status}
**Completion:** {X}/{Y} UACs completed ({Z}%)

{Progress notes, blockers, tech debt if any}

---

## Related Architectural Decision Records (ADRs)

### ADR-XXX: {Title}
**File:** docs/adr/YYYYMMDD-{purpose}.md
**Date:** YYYY-MM-DD
**Summary:** {Brief summary of decision}

### ADR-YYY: {Title}
**File:** docs/adr/YYYYMMDD-{purpose}.md
**Date:** YYYY-MM-DD
**Summary:** {Brief summary of decision}

---

## Frontend Implementation Details

**Source:** docs/300-frontend-v{version}.md

{Relevant frontend architecture sections}

### Components Involved
- {Component 1}: {Description}
- {Component 2}: {Description}

### Folder Structure
{Relevant folder paths}

---

## Backend Implementation Details

**Source:** docs/325-backend-v{version}.md

{Relevant backend architecture sections}

### Modules Involved
- {Module 1}: {Description}
- {Module 2}: {Description}

---

## API Contract

**Source:** docs/350-api-contract-v{version}.md

### Endpoints

#### POST /api/{endpoint}
**Request:**
```json
{Request schema}
```

**Response:**
```json
{Response schema}
```

---

## Database Schema

**Source:** docs/375-database-schema-v{version}.md

### Tables Involved

#### {table_name}
{Schema definition}

### Relationships
{ER diagram or relationship description}

---

## Testing Requirements

**Source:** docs/400-testing-strategy-v{version}.md

### Unit Tests
- {Test requirement 1}
- {Test requirement 2}

### Integration Tests
- {Test requirement 1}

### E2E Tests
- {Test requirement 1}

**Coverage Target:** 80% minimum

---

## DevOps & Deployment

**Source:** docs/425-devops-v{version}.md

### CI/CD Pipeline
{Relevant pipeline details}

### Infrastructure
{Relevant infrastructure details}

---

## Design Context

### From PRD (docs/002-prd-v{version}.md)
{Relevant feature description from PRD}

### User Flows (docs/100-userflows-v{version}.md)
{Relevant user flow descriptions}

### Design System (docs/125-design-system-v{version}.md)
{Relevant design guidelines}

---

## Technology Stack

**Source:** docs/150-tech-stacks-v{version}.md

{Relevant tech stack decisions}

---

## Quick Actions

Use these commands for next steps:

- **Start building:** `/build` (orchestrator will detect pending UACs)
- **Build frontend:** `/build-fe` (if FE UACs exist)
- **Build backend:** `/build-be` (if BE UACs exist)
- **Build DevOps:** `/build-devops` (if DevOps UACs exist)
- **Update progress:** `/update-progress`
- **Create ADR:** `/create-adr {purpose}`
- **Log bug:** `/log-bug {description}` (if issues found)
- **Code review:** `/code-review` (quality check)

---

**Files Referenced:**
- {List all files read during search}

**Last Updated:** {Current date}
```

**Tools:** Markdown formatting, string compilation

**Output:** Comprehensive context report in markdown format

---

### Phase 10: Display Results

Display the comprehensive context report to the user in a readable format.

Include summary at the top:
- Item found
- Number of related ADRs found
- Number of related documents found
- Completion status
- Suggested next actions

If item is a bug:
- Highlight severity and urgency
- Show affected components
- Include reproduction steps

If item is pending:
- Show what's needed to start work
- List blockers if any
- Suggest which build command to use

**Tools:** Text output

**Output:** Full context displayed to user

---

## Output Format

### Success Output

```
🔍 Search Results for: "{search query}"

Found {X} matching items:

✅ Story 315: AI Dev Persona System (Completed)
⏳ Story 314: Landing Page Generator (Pending)
🚧 Story 313: POC Builder (In Progress)

[User selection prompt]

---

📋 Comprehensive Context: Story 315 - AI Dev Persona System

**Status:** ✅ Completed (100%)
**Version:** v1.4.0
**Components:** CLI, Documentation

{Full comprehensive report as detailed in Phase 9}

---

📚 Related Documentation:
- 2 ADRs found
- 3 architecture documents referenced
- 1 design document referenced

🎯 Next Steps:
- All UACs completed
- Consider /release to tag this version
- Review with /code-review for quality check
```

### No Results Output

```
🔍 Search Results for: "{search query}"

❌ No matching items found.

💡 Suggestions:
- Try different keywords
- Check spelling
- Search for story ID (e.g., "Story 315")
- Use category keywords: "bug", "tech debt", "feature"

📋 Available Stories:
{List recent stories from atomic stories}
```

### Error Output

```
❌ Error: {Error type}

Details: {Error message}

Troubleshooting:
- Ensure atomic stories exist: docs/200-atomic-stories-v*.md
- Ensure progress doc exists: docs/progress/000-progress-v*.md
- Check file permissions
```

---

## Error Handling

### Missing Required Files
**Condition:** Atomic stories or progress document not found
**Action:** Display error with file path expected and suggest running `/setup` or `/update-progress`

### No Search Results
**Condition:** Search query returns no matches
**Action:** Display helpful suggestions and list available stories

### Invalid Story Selection
**Condition:** User selects invalid option
**Action:** Re-prompt with valid options

### Missing Related Documents
**Condition:** Referenced documents don't exist (e.g., frontend docs for FE story)
**Action:** Note in report that document is missing, continue with available information

### ADR Search Failure
**Condition:** Cannot read or parse ADRs
**Action:** Note ADR search failed, continue with other documentation

---

## Success Criteria

- ✅ Successfully searches atomic stories and progress documentation
- ✅ Presents ranked search results to user
- ✅ Allows user to select specific item for details
- ✅ Extracts complete story/bug/task details with all UACs
- ✅ Finds and includes related ADRs based on keyword matching
- ✅ Gathers relevant architecture documentation (FE/BE/DB/DevOps/Testing)
- ✅ Includes design context (PRD, user flows, design system)
- ✅ Presents comprehensive context report in readable format
- ✅ Suggests actionable next steps based on item status
- ✅ Handles missing documents gracefully
- ✅ Provides helpful feedback when no results found

---

## Examples

### Example 1: Search for Story

```bash
/search-backlog landing page
```

**Output:**
- Finds Story 314: Landing Page Generator
- Shows ADR-015: Landing page framework selection
- Includes frontend docs for component structure
- Shows design system guidelines for landing pages
- Displays PRD section about landing page requirements
- Lists all pending UACs with descriptions
- Suggests `/build-fe` to start implementation

### Example 2: Search for Bug

```bash
/search-backlog auth bug
```

**Output:**
- Finds Bug #003: Auth login redirect issue
- Shows severity (P0 - Critical)
- Includes backend docs for auth module
- Shows API contract for auth endpoints
- Displays database schema for users table
- Lists reproduction steps
- Suggests `/log-bug` if not already logged

### Example 3: Search by Story ID

```bash
/search-backlog Story 315
```

**Output:**
- Directly matches Story 315
- Shows all 6 UACs (all completed)
- Includes 2 related ADRs about persona system
- Shows CLI documentation structure
- Displays complete implementation context
- Suggests `/code-review` for quality check

### Example 4: Search for Tech Debt

```bash
/search-backlog tech debt database
```

**Output:**
- Finds tech debt items related to database
- Shows affected stories and components
- Includes database schema documentation
- Shows migration history
- Lists impact and priority
- Suggests creating ADR if refactoring needed

---

## Notes

- Search is case-insensitive and keyword-based
- Related documents are gathered intelligently based on UAC tags (FE/BE/DB/DevOps)
- ADR search uses keyword matching and contextual relevance
- Missing documents are handled gracefully with notes in report
- Report provides actionable next steps based on item status
- All file paths are included for reference
- Report can be saved or used as context for subsequent commands

---

## Tool Dependencies

- **Read**: Reading all documentation files
- **Glob**: Finding versioned documentation files
- **AskUserQuestion**: Presenting search results for user selection
- **Grep** (optional): Searching large documents efficiently

---

## Version History

- **v1.0.0** - Initial implementation with comprehensive documentation search
