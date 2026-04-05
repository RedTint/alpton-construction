---
name: review-and-setup
description: Analyze existing/legacy codebase and create comprehensive documentation structure with details filled in based on actual code and existing documentation
agent: Explore
---

# Review and Setup Command

Analyze an existing codebase and create comprehensive documentation that reflects the current state of the system. This command reverse-engineers documentation from legacy code.

## Execution Steps

### Phase 1: Codebase Discovery and Analysis

1. **Explore Project Structure**
   - Identify project root and main directories (frontend, backend, infrastructure, etc.)
   - Detect technology stack from package files (package.json, requirements.txt, pom.xml, etc.)
   - Find existing documentation (README files, docs folders, wikis)
   - Identify configuration files and environment setups

2. **Read Existing Documentation**
   - Scan for README files at all levels
   - Look for existing documentation in `/docs`, `/wiki`, `.github`, etc.
   - Read any architectural decision records if they exist
   - Review comments in key configuration files

3. **Analyze Codebase Structure**
   - Frontend: Identify framework, component structure, state management, routing
   - Backend: Identify framework, API structure, database connections, business logic organization
   - Database: Find schema files, migrations, ORMs
   - DevOps: Locate CI/CD configs, deployment scripts, infrastructure code
   - Testing: Identify test files, testing frameworks, coverage configs

### Phase 2: Create Documentation Structure

1. **Create Directory Structure**
   - Create `docs/` directory if it doesn't exist
   - Create `docs/progress/` subdirectory
   - Create `docs/releases/` subdirectory
   - Create `docs/adr/` subdirectory (Architectural Decision Records)
   - Create `docs/epics/` subdirectory with `README.md` placeholder

### Phase 2.5: Scaffold Template Structure

1. **Run Setup Script (if available)**
   - Check: `ls .ai-dev/ai-dev-scripts/setup.sh 2>/dev/null`
   - If exists: `bash .ai-dev/ai-dev-scripts/setup.sh`
     - Script copies static template files to `docs/` with section headers and placeholder text
     - These serve as the structural base; Phase 3 will fill in discovered content
     - Confirm files created with `ls docs/`
   - If not found: Phase 3 will create all docs fully inline (current behavior)

2. **Note the approach for Phase 3**
   - **Script ran:** Use the `Edit` tool in Phase 3 to fill in only the `[To be clarified]` and placeholder sections with discovered content. Do not rewrite the entire file.
   - **No script:** Use the `Write` tool in Phase 3 to create each doc with comprehensive content inferred from the analyzed codebase (original behavior).

### Phase 3: Generate Comprehensive Documentation

Create all documentation files with COMPREHENSIVE content based on the analyzed codebase.

> **If setup.sh ran in Phase 2.5:** Use `Edit` tool to fill in discovered content sections only — do not regenerate the entire file structure. Target sections marked `[To be clarified]`, empty lists, and placeholder text. Preserve all section headers and boilerplate written by the script.

> **If no script:** Use `Write` tool to create complete files from scratch (original behavior).

### 000-README.md
Documentation guide explaining:
- Overview of the numbered documentation system
- How to use the commands
- Description of each documentation file and its purpose
- Versioning conventions
- Workflow guide for maintaining documentation

### 001-project-init.md
Capture the current state as a "brain dump":
```markdown
# Project Initial State Analysis

Date: [Current Date]

## Project Overview
[Describe what the system does based on code analysis]

## Current Users/Personas
[Infer from code, comments, or existing docs]

## Existing Features
[List all features found in the codebase]

## Technology Stack Identified
[List all technologies, frameworks, libraries discovered]

## Architecture Observations
[High-level observations about how the system is structured]

## Questions & Unknowns
[Things that are unclear from the codebase]

## Technical Debt Identified
[Notable issues, anti-patterns, or areas needing improvement]
```

### 002-prd-v1.0.0.md
Product Requirements Document based on existing features:
- Product overview and vision (inferred from code/docs)
- User personas (identified from codebase)
- Current features breakdown
- Existing functionality scope
- Potential roadmap based on TODOs and comments
- Success criteria (if identifiable)
- Known limitations

### 100-userflows-v1.0.0.md
Document existing user flows:
- Identify user personas from code
- Map out current user journeys
- Document flow diagrams for key interactions (based on routes, pages, API calls)
- Edge cases and error handling found in code

### 125-design-system-v1.0.0.md
Extract design system from frontend code:
- Typography styles used (analyze CSS/styles)
- Color palette (extract from stylesheets)
- Spacing system (identify from CSS)
- Component inventory (list all components found)
- Layout patterns (analyze page structures)
- Sitemap (build from routes/pages)
- Design notes and principles (from comments/patterns)
- Current frontend folder structure
- Look and feel observations

### 150-tech-stacks-v1.0.0.md
Document discovered technology stack:
- Frontend technologies (framework, libraries, build tools)
- Backend technologies (framework, runtime, dependencies)
- Database(s) identified (type, version, ORM)
- Testing tools found (unit, integration, E2E frameworks)
- DevOps tools (CI/CD platform, deployment tools)
- Third-party services (APIs, analytics, auth providers)
- Current performance characteristics (if measurable)
- Technology justification (inferred from architecture)

### 175-c4-diagrams-v1.0.0.md
Create C4 architecture diagrams from code analysis:
- Level 1: System Context (external dependencies, APIs)
- Level 2: Container diagram (apps, databases, services)
- Level 3: Component diagram (major modules, their relationships)
- Architecture notes based on code structure
- Data flow descriptions (trace request/response paths)

### 200-atomic-stories-v1.0.0.md
Convert existing features into user stories. **⚠️ MANDATORY FORMAT** — use this exact heading pattern (required by `sync-board.js` parser):
```
## Epic NNN – Epic Name

### Story NNN – Story Title

**As a** {persona}
**I want** {goal}
**So that** {benefit}

**Priority:** High
**Effort:** 5
**Dependencies:** None

#### User Acceptance Criteria
- [ ] FE: {frontend criterion}
- [ ] BE: {backend criterion}
- [ ] TEST: {test requirement}
```
Format rules:
- Epic heading: `## Epic NNN –` (en-dash or em-dash, NOT colon, NNN = 3-digit zero-padded)
- Story heading: `### Story NNN –` (same dash rule)
- UAC: checkbox `- [ ] TYPE: text` — TYPE = FE | BE | DB | DevOps | CLI | TEST
- Do NOT use tables for stories or UACs
- Analyze features and create stories based on code behavior
- Document implicit acceptance criteria
- Note existing test coverage per feature
- Identify dependencies between features

### 300-frontend-v1.0.0.md
Document frontend architecture:
- Current folder structure (actual directories)
- Module organization (how code is grouped)
- Component architecture patterns (analyze component structure)
- State management approach (Redux, Context, Zustand, etc.)
- Routing structure (actual routes)
- API integration patterns
- Best practices observed
- Code conventions used
- Notable implementation details

### 325-backend-v1.0.0.md
Document backend architecture:
- Current folder structure
- Module organization
- API architecture patterns (REST, GraphQL, etc.)
- Business logic organization (services, controllers, etc.)
- Data access layer (repositories, DAOs)
- Middleware structure
- Authentication/authorization approach
- Best practices observed
- Code conventions used

### 350-api-contract-v1.0.0.md
Extract and document API contract:
- API overview
- Authentication/authorization mechanism
- All endpoint specifications (method, path, purpose)
- Request/response schemas (analyze actual DTOs/models)
- Error handling patterns
- API versioning (if used)
- Generate OpenAPI/Swagger spec if possible

### 375-database-schema-v1.0.0.md
Document database schema:
- Extract ERD from migrations/schema files
- Table definitions (columns, types, constraints)
- Relationships and foreign keys
- Indexes documented
- Data validation rules found in code
- Business rules related to data
- Migration history
- Seed data approach

### 400-testing-strategy-v1.0.0.md
Document current testing approach:
- Analyze test directory structure
- Unit testing coverage and tools used
- Integration testing approach
- E2E testing strategy and tools
- Current coverage metrics (if available)
- Testing patterns observed
- Gaps in testing
- Recommendations for improvement

### 425-devops-v1.0.0.md
Document DevOps setup:
- Infrastructure as Code (if found)
- CI/CD pipeline analysis (GitHub Actions, Jenkins, etc.)
- Build and packaging process
- Deployment strategy (analyze deploy scripts)
- Environment management (dev, staging, prod configs)
- Automated tests in pipeline
- PR workflow
- Monitoring and alerting (if configured)
- Rollback procedures
- Release strategy

### 450-workers-v1.0.0.md (If Applicable)
Document background jobs if found:
- Job definitions discovered
- Scheduling configuration
- Execution intervals
- Error handling approaches
- Monitoring setup
- Resource allocation

### progress/000-progress-v1.0.0.md
Create initial progress tracking:
- List all current features as "completed"
- Create template for tracking future changes
- Note current version/state
- Document known issues/bugs
- Track upcoming features (from TODOs, issues)

### releases/release-v0.0.1.md
Document current state as baseline release:
- Current version (from package file or git tags)
- Release date (document creation date)
- Complete feature list (everything currently implemented)
- Known technical debt
- Known issues
- Future release planning structure

### adr/000-README.md
Create ADR system:
- Purpose and format of ADRs
- Naming convention: YYYYMMDD-{purpose}.md
- Index (initially empty, ready for future decisions)
- Template for creating new ADRs
- Guidelines for documenting future architectural decisions

**Additionally:** If architectural decisions can be inferred from code/comments/git history, create initial ADR files documenting those decisions.

## Phase 4: Generate Summary Report

After creating all documentation, provide a comprehensive summary:

```
✅ Legacy codebase documented successfully!

📊 Analysis Summary:
- Technology Stack: [List key technologies]
- Total Files Analyzed: [Number]
- Features Documented: [Number]
- API Endpoints Found: [Number]
- Components/Modules: [Number]
- Database Tables: [Number]
- Test Coverage: [Percentage if available]

📁 Created Documentation:
[List all created files with file tree]

⚠️ Notable Findings:
- [Key architectural patterns]
- [Technical debt areas]
- [Missing documentation areas]
- [Recommended improvements]

🔍 Areas Needing Clarification:
[List anything unclear from code analysis that needs human input]

📝 Next Steps:
1. Review all generated documentation for accuracy
2. Fill in any [To be clarified] sections with domain knowledge
3. Create ADRs for any major architectural decisions not yet documented
4. Use /define @{filename} to refine specific documents
5. Keep documentation updated as codebase evolves
```

## Important Notes

- This is a READ-ONLY analysis - do not modify any existing code
- Be thorough in exploration - scan entire codebase
- Prioritize accuracy over assumptions - mark unclear items as "[To be clarified]"
- Extract actual code patterns, don't guess or make up details
- Include file paths and line numbers for reference
- Preserve any existing documentation found
- Note discrepancies between code and existing docs
- Identify areas where documentation is missing or outdated
- Use proper markdown formatting for all diagrams (mermaid)
- Cross-reference between documents (e.g., link API endpoints to database tables)

## Workflow

1. Start exploration from project root
2. Identify all major components and technologies
3. Read key files to understand architecture
4. Extract patterns and conventions
5. Generate comprehensive documentation
6. Validate by cross-referencing code
7. Provide summary with recommendations
