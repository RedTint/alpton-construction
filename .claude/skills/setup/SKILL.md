---
name: setup
description: Initialize all project starting files with the complete documentation structure for a new software project
---

# Project Setup Command

Initialize a complete documentation structure for a new software development project following the document-driven development approach.

## Execution Steps

### Phase 1: Create Directory Structure & Skeleton Files

1. **Create Directory Structure**
   - Create `docs/` directory if it doesn't exist
   - Create `docs/progress/` subdirectory
   - Create `docs/releases/` subdirectory
   - Create `docs/adr/` subdirectory (Architectural Decision Records)
   - Create `docs/epics/` subdirectory (Epic-based story organization)
   - Create `docs/epics/README.md` with placeholder:
     ```markdown
     # Epics Index

     This directory organizes stories by epic using the file-system-as-board pattern.
     Each epic has its own subdirectory with status subdirectories:
     `pending/`, `in-progress/`, `qa/`, `done/`, `blocked/`, `bugs/`

     ## Epics

     *(No epics yet — use `/new-feature` to create stories, or `/migrate` to import existing ones)*
     ```

2. **Delegate to Setup Script (Preferred)**
   - Check if `.ai-dev/ai-dev-scripts/setup.sh` exists: `ls .ai-dev/ai-dev-scripts/setup.sh 2>/dev/null`
   - If the script exists:
     - Run: `bash .ai-dev/ai-dev-scripts/setup.sh` (script copies templates to `docs/`, substitutes date/project name)
     - Confirm output: display created file list
     - Skip to Step 4 (Pause for Human Intervention)
   - If the script does **not** exist: proceed with Step 3 (inline file creation)

3. **Create Lightweight Documentation Files (Fallback — when setup.sh unavailable)**

Create all documentation files with MINIMAL skeleton templates in the `docs/` directory. These should be lightweight placeholders that will be fleshed out later once the project is defined.

**IMPORTANT:** Only create comprehensive templates for 000-README.md and 001-project-init.md. All other files should have minimal section headers and brief instructions.

### 000-README.md
Explain the documentation system, command usage, and purpose of each file. Include:
- Overview of the numbered documentation system
- How to use the commands
- Description of each documentation file and its purpose
- Versioning conventions
- Workflow guide (which files to complete in which order)

### 001-project-init.md
Create a brain dump template for capturing initial ideas:
```markdown
# Project Initial Brainstorm

Date: [Current Date]

## Project Vision
[What is the core problem we're solving?]

## Target Users
[Who are we building this for?]

## Key Features (Brain Dump)
[List all ideas, features, and concepts - no filtering yet]

## Technical Considerations
[Any initial thoughts on technology, constraints, or requirements]

## Success Metrics
[How will we measure success?]

## Questions & Unknowns
[What do we need to figure out?]

## Next Steps
[What should happen after this brain dump?]
```

### 002-prd-v1.0.0.md
Product Requirements Document template with section headers:
- Product overview and vision
- User personas (detailed)
- Features breakdown
- MVP scope (v1.0.0)
- Roadmap for v1.1.0 and v1.2.0
- Success criteria
- Out of scope items

**Note:** Keep content minimal with placeholder text. Will be elaborated after 001-project-init.md is completed.

### 100-userflows-v1.0.0.md
User flows template with section headers:
- Persona definitions
- User journey maps
- Flow diagrams for key interactions
- Edge cases and error flows

**Note:** Minimal skeleton with section headers only. Use /define to elaborate.

### 125-design-system-v1.0.0.md
Design system template with section headers:
- Typography (h1, h2, h3, p, etc.)
- Color palette (primary, secondary, neutral, semantic colors)
- Spacing system
- Component inventory
- Layout patterns
- Sitemap
- Design notes and principles
- Frontend folder structure recommendations
- Look and feel description

**Note:** Minimal skeleton with section headers only. Use /define to elaborate.

### 150-tech-stacks-v1.0.0.md
Tech stack template with section headers:
- Frontend technology choices
- Backend technology choices
- Database selection
- Testing tools (unit, integration, E2E)
- DevOps tools
- Third-party services
- SLA requirements (p95, p99 latency, uptime, reliability)
- Technology justification

**Note:** Minimal skeleton with section headers only. Use /define to elaborate.

### 175-c4-diagrams-v1.0.0.md
C4 architecture diagrams template with section headers:
- Level 1: System Context diagram
- Level 2: Container diagram
- Level 3: Component diagram (for key containers)
- Level 4: Code diagram (if needed)
- Architecture notes and decisions
- Data flow descriptions

**Note:** Minimal skeleton with section headers only. Use /define to elaborate.

### 200-atomic-stories-v1.0.0.md
Atomic stories template with section headers:
- Story format (As a... I want... So that...)
- User Acceptance Criteria (UAC)
- Technical tasks breakdown
- Test requirements (unit + E2E)
- Story points/effort estimation
- Dependencies
- One iteration per feature approach

**Note:** Minimal skeleton with section headers only. Use /define to elaborate.

### 300-frontend-v1.0.0.md
Frontend architecture template with section headers:
- Folder structure
- Module organization
- Component architecture patterns
- State management approach
- Routing structure
- Best practices
- Code conventions
- Implementation notes

**Note:** Minimal skeleton with section headers only. Use /define to elaborate.

### 325-backend-v1.0.0.md
Backend architecture template with section headers:
- Folder structure
- Module organization
- API architecture patterns
- Business logic organization
- Data access layer
- Middleware structure
- Best practices
- Code conventions

**Note:** Minimal skeleton with section headers only. Use /define to elaborate.

### 350-api-contract-v1.0.0.md
API contract template with section headers:
- API overview
- Authentication/authorization
- Endpoint specifications (REST/GraphQL)
- Request/response schemas
- Error handling
- Versioning strategy
- OpenAPI/Swagger specification

**Note:** Minimal skeleton with section headers only. Use /define to elaborate.

### 375-database-schema-v1.0.0.md
Database schema template with section headers:
- Entity Relationship Diagram (ERD)
- Table definitions
- Relationships and foreign keys
- Indexes
- Data validation rules
- Business rules
- Migration strategy
- Seed data requirements

**Note:** Minimal skeleton with section headers only. Use /define to elaborate.

### 400-testing-strategy-v1.0.0.md
Testing strategy template with section headers:
- Testing pyramid breakdown
- Unit testing requirements and tools
- Integration testing approach
- E2E testing strategy and tools
- Performance testing requirements
- Security testing considerations
- Code coverage targets
- CI integration
- Test data management

**Note:** Minimal skeleton with section headers only. Use /define to elaborate.

### 425-devops-v1.0.0.md
DevOps template with section headers:
- Infrastructure as Code (Terraform/CloudFormation)
- CI/CD pipeline design
- Build and packaging process
- Deployment strategy (blue/green, canary, etc.)
- Environment management (dev, staging, prod)
- Automated testing in pipeline
- PR workflow (creation, modification, merge)
- Monitoring and alerting
- Rollback procedures
- Release strategy

**Note:** Minimal skeleton with section headers only. Use /define to elaborate.

### 450-workers-v1.0.0.md (Optional)
Workers/background jobs template with section headers:
- Job definitions
- Scheduling requirements
- Execution intervals
- Error handling and retries
- Monitoring requirements
- Resource requirements

**Note:** Minimal skeleton with section headers only. Use /define to elaborate.

### progress/000-progress-v1.0.0.md
Progress tracking template with section headers:
- Feature completion checklist
- Status per atomic story
- Blockers and issues
- Completion percentage
- Timeline tracking
- Version alignment with atomic stories

**Note:** Minimal skeleton with section headers only. Use /define to elaborate.

### releases/release-v0.0.1.md
Initial release notes template with section headers:
- Release version and date
- Release overview
- Features included (start with "Hello World" end-to-end)
- Technical changes
- Deployment notes
- Known issues
- Next release planning

**Note:** Minimal skeleton with section headers only. Use /define to elaborate.

### adr/000-README.md
Architectural Decision Records table of contents with comprehensive content:
- Purpose and format of ADRs
- Explanation of ADR naming convention (YYYYMMDD-{purpose}.md)
- Index/table of contents of all decisions (empty initially)
- Template for creating new ADRs
- Guidelines for when to create an ADR

Example ADR template structure to include:
- Title
- Status (proposed, accepted, deprecated, superseded)
- Context (what is the issue we're facing)
- Decision (what we decided to do)
- Consequences (what becomes easier/harder as a result)
- Date
- Deciders

**Note:** This file should be comprehensive as it serves as the ADR guide.

4. **Pause for Human Intervention**
   After creating all skeleton files, instruct the user to:
   - Fill out `docs/001-project-init.md` with their initial ideas
   - Review and optionally fill out `docs/002-prd-v1.0.0.md`
   - Use `/define @{filename}` command to elaborate specific documents as needed

5. **Confirm Completion**
   List all created files and provide clear next steps.

## Output Format

After creating all files, provide:

```
✅ Project documentation structure initialized!

Created files:
📁 docs/
├── 000-README.md
├── 001-project-init.md
├── 002-prd-v1.0.0.md
├── 100-userflows-v1.0.0.md
├── 125-design-system-v1.0.0.md
├── 150-tech-stacks-v1.0.0.md
├── 175-c4-diagrams-v1.0.0.md
├── 200-atomic-stories-v1.0.0.md
├── 300-frontend-v1.0.0.md
├── 325-backend-v1.0.0.md
├── 350-api-contract-v1.0.0.md
├── 375-database-schema-v1.0.0.md
├── 400-testing-strategy-v1.0.0.md
├── 425-devops-v1.0.0.md
├── 450-workers-v1.0.0.md
├── 📁 adr/
│   └── 000-README.md
├── 📁 epics/
│   └── README.md
├── 📁 progress/
│   └── 000-progress-v1.0.0.md
└── 📁 releases/
    └── release-v0.0.1.md

🎯 Next Steps (IMPORTANT):

**Step 1: Define Your Project**
→ Open and fill out docs/001-project-init.md with your initial brain dump
→ This is YOUR input - describe the project vision, features, and ideas

**Step 2: Formalize Requirements**
→ Review docs/002-prd-v1.0.0.md
→ Use /define @002-prd-v1.0.0.md to elaborate based on your brain dump

**Step 3: Elaborate Documentation**
→ Use /define @{filename} {context} to flesh out specific documents
→ Work sequentially: 100 → 200 → 300 → 400
→ Each /define will use context from previous documents

Examples:
  /define @100-userflows-v1.0.0.md based on the personas from PRD
  /define @150-tech-stacks-v1.0.0.md suggest appropriate tech stack
  /define @200-atomic-stories-v1.0.0.md for MVP features only

**Why This Approach?**
Skeleton files are created now to save tokens. You provide the project context first, then we elaborate documents one-by-one as needed. This avoids wasting tokens on premature details.
```

## Notes

- Most files should be created as LIGHTWEIGHT skeletons with section headers only
- Only 000-README.md and 001-project-init.md should have comprehensive templates
- All other files include a note to use `/define` command to elaborate
- This approach saves tokens and allows human input before AI elaboration
- File paths should be in a `docs/` directory to keep documentation organized
- Ensure version numbers are consistent (v1.0.0 for initial MVP documentation)
- The workflow is: human defines project → AI elaborates documents → iterative refinement
