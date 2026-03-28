# Scrum of Scrums Command

Create parallel workstream documentation structures for the same project, enabling multiple teams to work independently on separate features or components while sharing common architectural specifications.

## Execution Steps

### Phase 1: Parse Input and Validate Workstream Description

1. **Extract Workstream Description**
   - Parse the command arguments to get workstream short description
   - Short description should be kebab-case and concise (2-4 words)
   - Examples:
     - "cli-dashboard" → CLI-based dashboard interface
     - "mobile-app" → Mobile application workstream
     - "admin-portal" → Admin portal interface
     - "api-v2" → API version 2 workstream
   - If description contains spaces or special characters, convert to kebab-case:
     - Convert to lowercase
     - Replace spaces and underscores with hyphens
     - Remove special characters (keep only alphanumeric and hyphens)
     - Remove leading/trailing hyphens

2. **Validate Workstream Description**
   - Ensure description is not empty
   - Check length (should be 2-50 characters)
   - Verify kebab-case format
   - If invalid, prompt user for valid description

3. **Generate Workstream ID**
   - Use Glob to find existing workstreams: `docs/scrums/*/`
   - Parse numeric IDs from directory names (e.g., `001-cli-dashboard` → ID 001)
   - Calculate next ID (highest + 1)
   - Format: 3-digit zero-padded (e.g., 001, 002, 010, 099)
   - Full workstream directory: `docs/scrums/{ID}-{short-description}/`

4. **Check for Conflicts**
   - Verify workstream ID doesn't already exist
   - Check if similar description exists
   - If conflict, ask user to:
     - Use existing workstream
     - Choose different description
     - Cancel operation

### Phase 2: Ask User Which Documents to Map to Parent

1. **Present Document Mapping Options**
   - Use AskUserQuestion to display all mappable parent documents
   - Allow multi-select for documents that workstream will reference instead of creating
   - Document categories:
     - **Planning & Requirements (000-199)**
       - 001-project-init.md
       - 002-prd-v*.md
       - 100-userflows-v*.md
       - 125-design-system-v*.md
       - 150-tech-stacks-v*.md
       - 175-c4-diagrams-v*.md
     - **Implementation Details (300-399)**
       - 300-frontend-v*.md
       - 325-backend-v*.md
       - 350-api-contract-v*.md
       - 375-database-schema-v*.md
     - **Quality & Operations (400-499)**
       - 400-testing-strategy-v*.md
       - 425-devops-v*.md
       - 450-workers-v*.md

2. **Structure Multi-Select Question**
   - Question format:
     ```
     Question: "Which documents should reference the parent /docs instead of creating workstream-specific versions?"
     Header: "Parent Docs"
     Multi-select: true
     Options:
       - Label: "001-project-init.md"
         Description: "Project vision and initial brainstorm (usually shared)"
       - Label: "002-prd-v*.md"
         Description: "Product requirements (usually shared)"
       - Label: "100-userflows-v*.md"
         Description: "User flows (shared if UI patterns are same)"
       - Label: "125-design-system-v*.md"
         Description: "Design system (shared for consistent branding)"
       - Label: "150-tech-stacks-v*.md"
         Description: "Tech stack (shared if using same technologies)"
       - Label: "175-c4-diagrams-v*.md"
         Description: "Architecture diagrams (shared for overall system view)"
       - Label: "300-frontend-v*.md"
         Description: "Frontend architecture (workstream-specific if different framework)"
       - Label: "325-backend-v*.md"
         Description: "Backend architecture (workstream-specific if different services)"
       - Label: "350-api-contract-v*.md"
         Description: "API contract (shared if using same API, mapped if same endpoints)"
       - Label: "375-database-schema-v*.md"
         Description: "Database schema (shared if using same database)"
       - Label: "400-testing-strategy-v*.md"
         Description: "Testing strategy (shared if same approach)"
       - Label: "425-devops-v*.md"
         Description: "DevOps infrastructure (shared if same deployment)"
       - Label: "450-workers-v*.md"
         Description: "Background jobs (workstream-specific if different workers)"
     ```

3. **Store Mapping Configuration**
   - Create mapping object:
     ```json
     {
       "parent_mapped": ["001-project-init.md", "350-api-contract-v*.md", "375-database-schema-v*.md"],
       "workstream_specific": ["200-atomic-stories-v*.md", "300-frontend-v*.md", "325-backend-v*.md", "progress/000-progress-v*.md"]
     }
     ```
   - Note: `200-atomic-stories-v*.md` and `progress/000-progress-v*.md` are ALWAYS workstream-specific
   - They must track workstream progress separately from parent

### Phase 3: Create Workstream Directory Structure

1. **Create Base Workstream Directory**
   - Create directory: `docs/scrums/{ID}-{short-description}/`
   - This will contain all workstream-specific documentation
   - Examples:
     - `docs/scrums/001-cli-dashboard/`
     - `docs/scrums/002-mobile-app/`
     - `docs/scrums/003-admin-portal/`

2. **Create Required Subdirectories**
   - Create `docs/scrums/{ID}-{description}/progress/` - For workstream progress tracking
   - Create `docs/scrums/{ID}-{description}/adr/` - For workstream-specific ADRs
   - Create `docs/scrums/{ID}-{description}/releases/` - For workstream releases
   - Optional: `docs/scrums/{ID}-{description}/learnings/` - For workstream learnings

3. **Validate Directory Creation**
   - Check all directories exist
   - Verify write permissions
   - If creation fails, display error and suggest manual creation

### Phase 4: Create Workstream-Specific Documents

1. **Create 000-README.md for Workstream**
   - Path: `docs/scrums/{ID}-{description}/000-README.md`
   - Content should include:
     - Workstream overview and purpose
     - Relationship to parent project
     - List of parent-mapped documents (with links)
     - List of workstream-specific documents
     - Workstream-specific commands
     - Team structure (if applicable)
   - Template:
     ```markdown
     # Workstream: {Description}

     **Project:** AI Dev Agency - {Workstream Name}
     **Workstream ID:** {ID}
     **Parent Project:** [Main Documentation](../../000-README.md)
     **Created:** {current date}

     ## Overview

     This workstream focuses on: {user-provided context or purpose}

     ## Relationship to Parent Project

     This workstream is part of the main AI Dev Agency project but operates independently with:
     - Separate atomic stories and progress tracking
     - Workstream-specific architecture documents (where applicable)
     - Shared parent documentation for common specifications

     ## Parent-Mapped Documents

     The following documents reference the parent `/docs` instead of creating workstream versions:

     {For each parent-mapped document:}
     - [{filename}](../../{filename}) - {description}

     ## Workstream-Specific Documents

     The following documents are specific to this workstream:

     {For each workstream-specific document:}
     - {filename} - {description}

     ## Documentation Files

     ### Planning & Requirements (000-199)
     - **000-README.md** (this file)
     {List all non-mapped planning docs}

     ### Development Specifications (200-299)
     - **200-atomic-stories-v1.0.0.md** - Workstream user stories (always workstream-specific)

     ### Implementation Details (300-399)
     {List all non-mapped implementation docs}

     ### Quality & Operations (400-499)
     {List all non-mapped quality docs}

     ### Tracking
     - **progress/000-progress-v1.0.0.md** - Workstream progress tracking (always workstream-specific)
     - **releases/** - Workstream releases
     - **adr/** - Workstream architectural decisions

     ## Workflow Guide

     1. Review parent documents: {list parent-mapped docs}
     2. Define workstream stories: `/define-workstream @200-atomic-stories-v1.0.0.md`
     3. Work through workstream-specific docs
     4. Use `/build-workstream {workstream-id}` for implementation (future)
     5. Track progress: `/update-workstream-progress {workstream-id}`

     ## Team Structure (Optional)

     {Team members, roles, responsibilities}
     ```

2. **Create 200-atomic-stories-v1.0.0.md**
   - Path: `docs/scrums/{ID}-{description}/200-atomic-stories-v1.0.0.md`
   - ALWAYS workstream-specific (never mapped to parent)
   - Template:
     ```markdown
     # Atomic User Stories - {Workstream Name} v1.0.0

     **Project:** AI Dev Agency - {Workstream Name}
     **Workstream ID:** {ID}
     **Version:** 1.0.0
     **Date:** {current date}
     **Parent Atomic Stories:** [Main Project Stories](../../200-atomic-stories-v*.md)

     ## Overview

     This document contains atomic user stories specific to the {Workstream Name} workstream.

     Stories follow the same format as the parent project but track separate features and UACs.

     ## Story Format

     ```
     ### [Story ID] - [Story Title]

     **As a** [persona]
     **I want** [capability]
     **So that** [benefit]

     **Priority:** High/Medium/Low
     **Effort:** [Story points]
     **Dependencies:** [Other story IDs or parent story IDs]

     #### User Acceptance Criteria

     - FE: Frontend criteria
     - BE: Backend criteria
     - DB: Database criteria
     - DevOps: DevOps criteria
     - CLI: CLI criteria

     #### Test Requirements
     - Unit tests: [Description]
     - E2E tests: [Description]
     ```

     ## v1.0.0 Stories

     {Placeholder for user to add stories using /new-feature or /define}

     ### Story W{ID}-001 - {Example Story Title}

     **As a** {persona}
     **I want** {capability}
     **So that** {benefit}

     **Priority:** High
     **Effort:** 8 points
     **Dependencies:** Parent Story 001 (optional)

     #### User Acceptance Criteria

     - CLI: {Example UAC}

     #### Test Requirements
     - Unit tests: {Example test}
     - E2E tests: {Example E2E test}
     ```

3. **Create progress/000-progress-v1.0.0.md**
   - Path: `docs/scrums/{ID}-{description}/progress/000-progress-v1.0.0.md`
   - ALWAYS workstream-specific (never mapped to parent)
   - Template:
     ```markdown
     # Progress Tracking - {Workstream Name} v1.0.0

     **Project:** AI Dev Agency - {Workstream Name}
     **Workstream ID:** {ID}
     **Version:** 1.0.0
     **Last Updated:** {current date}
     **Parent Progress:** [Main Project Progress](../../../progress/000-progress-v*.md)

     ## Overview

     This document tracks progress for the {Workstream Name} workstream.

     Progress is tracked independently from the parent project.

     ## Workstream Summary

     - **Total Stories:** 0
     - **Completed Stories:** 0
     - **In Progress Stories:** 0
     - **Pending Stories:** 0
     - **Overall Completion:** 0%

     ## Story Completion Tracking

     ### v1.0.0 Stories

     {Stories will be added as they are created}

     ## Change Log

     ### {Current Date} - Workstream Created
     - 🚀 **Workstream initialized:** {Workstream Name}
     - 📄 **Documents created:**
       - 000-README.md
       - 200-atomic-stories-v1.0.0.md
       - progress/000-progress-v1.0.0.md
     - 🔗 **Parent-mapped documents:** {count} documents
     - 📝 **Workstream-specific documents:** {count} documents

     ## Next Steps

     1. Define workstream stories: `/define @scrums/{ID}-{desc}/200-atomic-stories-v1.0.0.md`
     2. Create workstream-specific architecture docs as needed
     3. Start implementation with `/build-workstream {ID}` (future)
     4. Update progress: `/update-workstream-progress {ID}` (future)
     ```

4. **Create ADR Index**
   - Path: `docs/scrums/{ID}-{description}/adr/000-README.md`
   - Template:
     ```markdown
     # Architectural Decision Records - {Workstream Name}

     **Workstream ID:** {ID}
     **Parent ADRs:** [Main Project ADRs](../../../adr/000-README.md)

     ## Overview

     This directory contains architectural decision records specific to the {Workstream Name} workstream.

     ## ADR Index

     {ADRs will be listed here as they are created using /create-adr}

     ---

     ## How to Create ADRs

     Use the `/create-adr` command within the workstream context:

     ```
     /create-adr {purpose} --workstream {ID}
     ```
     ```

### Phase 5: Create Parent-Mapped Document References

1. **For Each Parent-Mapped Document**
   - Create a reference file in workstream directory
   - Filename: Same as parent but with `.ref.md` extension
   - Path: `docs/scrums/{ID}-{description}/{filename}.ref.md`
   - Content: Reference to parent with explanation
   - Template:
     ```markdown
     # {Document Title} - Parent Reference

     **Workstream:** {Workstream Name} ({ID})
     **Parent Document:** [../../{parent-filename}](../../{parent-filename})

     ## Note

     This workstream uses the parent document for {document type}.

     See the parent document for:
     {List key sections or content areas}

     ## Workstream-Specific Notes

     {Optional: Any workstream-specific clarifications or extensions}

     ---

     **Full Document:** [../../{parent-filename}](../../{parent-filename})
     ```

2. **Example: API Contract Parent Reference**
   - If `350-api-contract-v1.1.0.md` is parent-mapped:
   - Create: `docs/scrums/{ID}-{desc}/350-api-contract-v1.1.0.ref.md`
   - Content:
     ```markdown
     # API Contract v1.1.0 - Parent Reference

     **Workstream:** CLI Dashboard (001)
     **Parent Document:** [../../350-api-contract-v1.1.0.md](../../350-api-contract-v1.1.0.md)

     ## Note

     This workstream uses the same API contract as the parent project.

     The CLI dashboard workstream consumes the same REST API endpoints defined in the parent document.

     See the parent document for:
     - Authentication endpoints
     - Board API endpoints (/api/board, /api/stories, etc.)
     - Request/response schemas
     - Error codes and handling

     ## Workstream-Specific Notes

     The CLI dashboard will primarily use:
     - GET /api/board - To fetch full board data
     - GET /api/metrics - To display project metrics

     No new API endpoints are required for this workstream.

     ---

     **Full API Contract:** [../../350-api-contract-v1.1.0.md](../../350-api-contract-v1.1.0.md)
     ```

### Phase 6: Create Workstream-Specific Documents

1. **For Each Non-Mapped Document**
   - Read the latest parent version of the document
   - Create workstream version: `docs/scrums/{ID}-{desc}/{filename}`
   - Copy structure from parent but leave content as placeholders
   - Update header to indicate workstream context
   - Add reference to parent document

2. **Example: Frontend Architecture (if workstream-specific)**
   - If `300-frontend-v1.0.0.md` is NOT parent-mapped:
   - Create: `docs/scrums/{ID}-{desc}/300-frontend-v1.0.0.md`
   - Template:
     ```markdown
     # Frontend Architecture - {Workstream Name} v1.0.0

     **Project:** AI Dev Agency - {Workstream Name}
     **Workstream ID:** {ID}
     **Version:** 1.0.0
     **Date:** {current date}
     **Parent Frontend:** [../../300-frontend-v*.md](../../300-frontend-v*.md)

     ## Overview

     This document defines the frontend architecture specific to the {Workstream Name} workstream.

     While the parent project uses {parent tech stack}, this workstream uses {workstream tech stack}.

     {Copy structure from parent document but leave as placeholders}

     ## Folder Structure

     {To be defined using /define}

     ## Components

     {To be defined using /define}

     ## State Management

     {To be defined using /define}

     ## Routing

     {To be defined using /define}
     ```

3. **Backend Architecture (if workstream-specific)**
   - Similar structure to frontend
   - Reference parent backend
   - Define workstream-specific services

4. **Database Schema (if workstream-specific)**
   - Similar structure
   - Reference parent schema
   - Define workstream-specific tables or extensions

### Phase 7: Update Parent Documentation Index

1. **Read Parent docs/000-README.md**
   - Use Read tool to get current content
   - Identify section for workstreams (create if doesn't exist)

2. **Add Workstream Entry**
   - Add new section if first workstream:
     ```markdown
     ## Workstreams (Scrum of Scrums)

     This project has parallel workstreams for independent feature development:

     - **[{ID}-{description}](scrums/{ID}-{description}/000-README.md)** - {Workstream purpose}
     ```
   - If workstreams section exists, append to list:
     ```markdown
     - **[{ID}-{description}](scrums/{ID}-{description}/000-README.md)** - {Workstream purpose}
     ```

3. **Update Parent README**
   - Use Edit tool to add workstream entry
   - Preserve all existing content
   - Maintain formatting

### Phase 8: Generate Workstream Summary

1. **Collect Workstream Details**
   - Workstream ID and description
   - Directory path
   - Count of parent-mapped documents
   - Count of workstream-specific documents
   - List of created files
   - Team recommendations (if applicable)

2. **Display Comprehensive Summary**
   ```
   ✅ Workstream created successfully!

   📋 Workstream Details:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ID:          {ID}
   Name:        {Workstream Name}
   Description: {Full description}
   Path:        docs/scrums/{ID}-{description}/

   📄 Documents Created:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✅ Workstream Structure:
   - docs/scrums/{ID}-{description}/000-README.md
   - docs/scrums/{ID}-{description}/200-atomic-stories-v1.0.0.md
   - docs/scrums/{ID}-{description}/progress/000-progress-v1.0.0.md
   - docs/scrums/{ID}-{description}/adr/000-README.md

   ✅ Parent-Mapped References ({count} documents):
   {For each parent-mapped doc:}
   - {filename}.ref.md → [../../{filename}](../../{filename})

   ✅ Workstream-Specific Documents ({count} documents):
   {For each workstream-specific doc:}
   - {filename} (placeholder - define with /define)

   🔗 Parent Documentation Mapping:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Shared from Parent:
   {List parent-mapped docs with descriptions}

   Workstream-Specific:
   {List workstream-specific docs with descriptions}

   📊 Summary:
   - Total Documents: {total count}
   - Parent-Mapped: {count} documents
   - Workstream-Specific: {count} documents
   - Always Workstream-Specific:
     - 200-atomic-stories-v*.md (separate feature tracking)
     - progress/000-progress-v*.md (separate progress tracking)

   🎯 Next Steps:

   1. **Review Workstream README:**
      cat docs/scrums/{ID}-{description}/000-README.md

   2. **Define Workstream Stories:**
      /define @scrums/{ID}-{description}/200-atomic-stories-v1.0.0.md

      Add stories specific to this workstream using:
      /new-feature "Feature description" --workstream {ID}

   3. **Elaborate Workstream-Specific Docs:**
      {For each workstream-specific non-ref doc:}
      /define @scrums/{ID}-{description}/{filename}

   4. **Review Parent-Mapped Docs:**
      {For each parent-mapped doc:}
      cat docs/{filename}

   5. **Start Development (Future):**
      /build-workstream {ID}
      (This command will be created later to build workstream features)

   6. **Track Workstream Progress (Future):**
      /update-workstream-progress {ID}
      (This command will be created later to track workstream progress)

   ✨ Workstream "{Workstream Name}" is ready for parallel development! ✨

   📚 Documentation:
   - Workstream README: docs/scrums/{ID}-{description}/000-README.md
   - Parent README: docs/000-README.md (updated with workstream entry)
   ```

3. **Provide Usage Examples**
   - Show how to work with workstream
   - Explain relationship to parent project
   - Clarify when to use parent vs workstream docs

## Input Format

**Command:**
```
/scrum-of-scrums {short-description}
/scrum-of-scrums {short-description} - {purpose}
```

**Examples:**
```
/scrum-of-scrums cli-dashboard

/scrum-of-scrums mobile-app - React Native mobile application

/scrum-of-scrums admin-portal - Admin interface for managing users and content

/scrum-of-scrums api-v2 - API version 2 with GraphQL support

/scrum-of-scrums python-sdk - Python SDK for API integration
```

## Output Format

```
✅ Workstream created successfully!

📋 Workstream Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID:          001
Name:        CLI Dashboard
Description: Command-line interface for project dashboard
Path:        docs/scrums/001-cli-dashboard/

📄 Documents Created:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Workstream Structure:
- docs/scrums/001-cli-dashboard/000-README.md
- docs/scrums/001-cli-dashboard/200-atomic-stories-v1.0.0.md
- docs/scrums/001-cli-dashboard/progress/000-progress-v1.0.0.md
- docs/scrums/001-cli-dashboard/adr/000-README.md

✅ Parent-Mapped References (5 documents):
- 001-project-init.md.ref.md → [../../001-project-init.md](../../001-project-init.md)
- 002-prd-v1.4.0.md.ref.md → [../../002-prd-v1.4.0.md](../../002-prd-v1.4.0.md)
- 350-api-contract-v1.1.0.md.ref.md → [../../350-api-contract-v1.1.0.md](../../350-api-contract-v1.1.0.md)
- 375-database-schema-v1.0.0.md.ref.md → [../../375-database-schema-v1.0.0.md](../../375-database-schema-v1.0.0.md)
- 425-devops-v1.0.0.md.ref.md → [../../425-devops-v1.0.0.md](../../425-devops-v1.0.0.md)

✅ Workstream-Specific Documents (4 documents):
- 100-userflows-v1.0.0.md (placeholder)
- 300-frontend-v1.0.0.md (placeholder)
- 325-backend-v1.0.0.md (placeholder)
- 400-testing-strategy-v1.0.0.md (placeholder)

🔗 Parent Documentation Mapping:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Shared from Parent:
- 001-project-init.md - Project vision applies to all workstreams
- 002-prd-v1.4.0.md - Product requirements shared across workstreams
- 350-api-contract-v1.1.0.md - CLI uses same API endpoints as frontend
- 375-database-schema-v1.0.0.md - CLI uses same database schema
- 425-devops-v1.0.0.md - CLI uses same deployment infrastructure

Workstream-Specific:
- 200-atomic-stories-v1.0.0.md - CLI-specific user stories (ALWAYS separate)
- progress/000-progress-v1.0.0.md - CLI-specific progress tracking (ALWAYS separate)
- 100-userflows-v1.0.0.md - CLI-specific user flows
- 300-frontend-v1.0.0.md - CLI uses different frontend (terminal-based)
- 325-backend-v1.0.0.md - CLI-specific backend services
- 400-testing-strategy-v1.0.0.md - CLI-specific testing approach

📊 Summary:
- Total Documents: 13
- Parent-Mapped: 5 documents
- Workstream-Specific: 6 documents (2 created, 4 placeholders)
- Always Workstream-Specific:
  - 200-atomic-stories-v*.md (separate feature tracking)
  - progress/000-progress-v*.md (separate progress tracking)

🎯 Next Steps:

1. **Review Workstream README:**
   cat docs/scrums/001-cli-dashboard/000-README.md

2. **Define Workstream Stories:**
   /define @scrums/001-cli-dashboard/200-atomic-stories-v1.0.0.md

   Add stories specific to this workstream using:
   /new-feature "Feature description" --workstream 001

3. **Elaborate Workstream-Specific Docs:**
   /define @scrums/001-cli-dashboard/100-userflows-v1.0.0.md
   /define @scrums/001-cli-dashboard/300-frontend-v1.0.0.md
   /define @scrums/001-cli-dashboard/325-backend-v1.0.0.md
   /define @scrums/001-cli-dashboard/400-testing-strategy-v1.0.0.md

4. **Review Parent-Mapped Docs:**
   cat docs/001-project-init.md
   cat docs/002-prd-v1.4.0.md
   cat docs/350-api-contract-v1.1.0.md

5. **Start Development (Future):**
   /build-workstream 001
   (This command will be created later to build workstream features)

6. **Track Workstream Progress (Future):**
   /update-workstream-progress 001
   (This command will be created later to track workstream progress)

✨ Workstream "CLI Dashboard" is ready for parallel development! ✨

📚 Documentation:
- Workstream README: docs/scrums/001-cli-dashboard/000-README.md
- Parent README: docs/000-README.md (updated with workstream entry)
```

## Important Notes

- **Always Workstream-Specific:** `200-atomic-stories-v*.md` and `progress/000-progress-v*.md` are ALWAYS created for each workstream (never parent-mapped)
- **Multi-Select Mapping:** User chooses which parent docs to reference vs create workstream versions
- **Independent Progress:** Each workstream tracks its own stories, UACs, and progress
- **Shared Architecture:** Workstreams can share common API contracts, database schemas, and infrastructure
- **Parallel Development:** Multiple teams can work on different workstreams simultaneously
- **Reference Files:** `.ref.md` files point to parent docs instead of duplicating content
- **Version Management:** Workstream docs can have different version numbers than parent
- **Future Commands:** `/build-workstream` and `/update-workstream-progress` will be created later
- **Directory Naming:** Format is `{3-digit-ID}-{kebab-case-description}`
- **Document Consistency:** All workstream docs follow the same structure as parent docs
- **Cross-References:** Workstream docs can reference both parent and workstream docs
- **Flexibility:** User decides which docs to share vs customize per workstream

## Error Handling

**Workstream Description Missing:**
- Display error: "Please provide a workstream description"
- Suggest: "/scrum-of-scrums {description}" or "/scrum-of-scrums {description} - {purpose}"
- Example: "/scrum-of-scrums cli-dashboard - CLI interface for project dashboard"

**Invalid Workstream Description:**
- Display error: "Invalid workstream description: {description}"
- Requirements:
  - Only lowercase letters, numbers, and hyphens
  - 2-50 characters
  - No spaces or special characters
- Suggest corrected description

**Workstream Already Exists:**
- Display error: "Workstream already exists: docs/scrums/{ID}-{description}/"
- Ask user if they want to:
  - Use existing workstream
  - Create with different description
  - Cancel operation

**Directory Creation Failed:**
- Display error: "Could not create workstream directory: {path}"
- Check disk space and permissions
- Suggest manual directory creation
- List directories that were successfully created

**Document Creation Failed:**
- Complete workstream creation for successful files
- Display warning: "Some documents could not be created"
- List failed documents
- Provide content for manual file creation
- Workstream is still usable

**Parent Document Not Found:**
- Display warning: "Parent document not found: {filename}"
- Skip creating reference file
- Note in summary which parent docs are missing
- Suggest creating parent doc or choosing different mapping

**Parent README Update Failed:**
- Complete workstream creation successfully
- Display warning: "Could not update parent README"
- Provide exact entry to add manually:
  ```
  Add to docs/000-README.md under "Workstreams" section:
  - **[{ID}-{description}](scrums/{ID}-{description}/000-README.md)** - {Purpose}
  ```

**No Documents Selected for Mapping:**
- Display warning: "No parent documents selected for mapping"
- Proceed to create all workstream-specific documents
- Note: This is valid but may lead to duplicated documentation

**All Documents Selected for Mapping:**
- Display warning: "All documents selected for parent mapping"
- Force creation of `200-atomic-stories-v1.0.0.md` and `progress/000-progress-v1.0.0.md`
- Note: These two documents are ALWAYS workstream-specific

## Success Criteria

The `/scrum-of-scrums` command is successful when:
1. ✅ Workstream description parsed and validated
2. ✅ Workstream ID calculated (next sequential ID)
3. ✅ User prompted for parent document mapping (multi-select)
4. ✅ Workstream directory created: `docs/scrums/{ID}-{description}/`
5. ✅ Subdirectories created: `progress/`, `adr/`, `releases/`
6. ✅ Workstream README created with full overview
7. ✅ Always-workstream-specific docs created:
   - `200-atomic-stories-v1.0.0.md`
   - `progress/000-progress-v1.0.0.md`
8. ✅ Parent-mapped reference files created (`.ref.md`)
9. ✅ Workstream-specific document placeholders created
10. ✅ ADR index created
11. ✅ Parent `docs/000-README.md` updated with workstream entry
12. ✅ User receives comprehensive summary with:
    - Workstream details
    - Document mapping breakdown
    - Created files list
    - Clear next steps
13. ✅ Workstream is ready for parallel development
14. ✅ Documentation is consistent with parent structure

## Future Enhancements

### v1.1.0
- `/build-workstream {ID}` - Build workstream features similar to `/build`
- `/update-workstream-progress {ID}` - Update workstream progress tracking
- `/new-feature --workstream {ID}` - Add features to workstream atomic stories
- `/define --workstream {ID}` - Define workstream documents with workstream context

### v1.2.0
- Workstream dependency tracking (workstream A depends on workstream B)
- Cross-workstream UAC references
- Workstream merge/integration planning
- Workstream completion and archiving

### v1.3.0
- Multi-workstream progress dashboard
- Workstream comparison and analytics
- Resource allocation across workstreams
- Workstream conflict detection (overlapping features)
