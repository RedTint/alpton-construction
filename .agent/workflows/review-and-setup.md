---
description: Analyze existing/legacy codebase and create comprehensive documentation based on actual code and existing docs
---

1. Explore Project Structure
   Identify project root and main directories:
   - Frontend folders (src, components, pages, etc.)
   - Backend folders (api, server, controllers, services, etc.)
   - Infrastructure folders (terraform, kubernetes, docker, etc.)
   - Configuration files (package.json, requirements.txt, pom.xml, etc.)

   Detect technology stack from package/dependency files
   Find existing documentation (README files, /docs, /wiki, .github)
   Identify configuration files and environment setups

2. Read Existing Documentation
   Scan for and read all README files at all levels
   Look for documentation in /docs, /wiki, .github directories
   Read any existing architectural decision records
   Review comments in key configuration files (webpack, tsconfig, etc.)

   Note any discrepancies between code and existing docs

3. Analyze Frontend Structure (if applicable)
   Identify frontend framework (React, Vue, Angular, etc.)
   Map component structure and organization
   Identify state management approach (Redux, Context, Zustand, MobX, etc.)
   Document routing structure (React Router, Next.js, etc.)
   Extract styling approach (CSS, SCSS, Tailwind, styled-components, etc.)
   Note API integration patterns

4. Analyze Backend Structure (if applicable)
   Identify backend framework (Express, Django, Spring Boot, etc.)
   Map API structure and endpoints
   Document database connections and ORMs (Sequelize, Mongoose, TypeORM, etc.)
   Identify business logic organization (services, controllers, repositories)
   Note authentication/authorization mechanisms
   Document middleware and request processing flow

5. Analyze Database Schema (if applicable)
   Find and read schema files, migrations, or ORM models
   Extract table definitions and relationships
   Document indexes and constraints
   Note data validation rules in code
   Identify seed data approach

6. Analyze DevOps Setup (if applicable)
   Locate CI/CD configuration (GitHub Actions, GitLab CI, Jenkins, etc.)
   Find deployment scripts and infrastructure code (Terraform, CloudFormation, etc.)
   Document build and packaging process
   Identify environment configurations (dev, staging, prod)
   Note monitoring and alerting setup

7. Analyze Testing Approach
   Identify test files and directories
   Document testing frameworks (Jest, Pytest, JUnit, etc.)
   Note current test coverage patterns
   Identify E2E testing tools (Cypress, Playwright, Selenium, etc.)
   Document integration testing approach

8. Create Documentation Directory Structure
   Create directories if they don't exist:
   // turbo
   mkdir -p docs/progress docs/releases docs/adr docs/epics

   Create docs/epics/README.md with index placeholder

9. Scaffold Template Structure (Phase 2.5)
   Check if setup script exists:
   Run: ls .ai-dev/ai-dev-scripts/setup.sh 2>/dev/null

   If script exists:
   Run: bash .ai-dev/ai-dev-scripts/setup.sh
   Script writes static template files with section headers and placeholders
   Confirm files created: ls docs/
   NOTE: Step 10 will use Edit tool to fill discovered content into placeholder sections

   If script not found:
   Step 10 will create all docs fully inline using Write tool (original behavior)

10. Generate Comprehensive Documentation Files
   Based on codebase analysis. If setup.sh ran in step 9: use Edit tool to fill in
   [To be clarified] / placeholder sections only. If no script: use Write tool to create
   full files from scratch.

   Create or fill the following files with ACTUAL content discovered from the codebase:

   - docs/000-README.md
     Documentation guide explaining the numbered system and commands

   - docs/001-project-init.md
     Capture current state as "Project Initial State Analysis":
     - Project overview (what the system does)
     - Current users/personas (inferred)
     - Existing features (list all found)
     - Technology stack identified
     - Architecture observations
     - Questions & unknowns
     - Technical debt identified

   - docs/002-prd-v1.0.0.md
     Product Requirements based on existing features:
     - Product overview (inferred from code/docs)
     - User personas (identified)
     - Current features breakdown
     - Existing functionality scope
     - Potential roadmap (from TODOs, issues)
     - Known limitations

   - docs/100-userflows-v1.0.0.md
     Document existing user flows based on routes and pages

   - docs/125-design-system-v1.0.0.md
     Extract design system from frontend code:
     - Typography (from CSS/styles)
     - Color palette (from stylesheets)
     - Component inventory (all components)
     - Sitemap (from routes)
     - Frontend folder structure (actual)

   - docs/150-tech-stacks-v1.0.0.md
     Document discovered technology stack with versions

   - docs/175-c4-diagrams-v1.0.0.md
     Create architecture diagrams from code analysis:
     - System Context (external dependencies)
     - Container diagram (apps, databases, services)
     - Component diagram (major modules)
     - Data flow descriptions

   - docs/200-atomic-stories-v1.0.0.md
     Convert existing features into user stories format

   - docs/300-frontend-v1.0.0.md
     Document actual frontend architecture and structure

   - docs/325-backend-v1.0.0.md
     Document actual backend architecture and structure

   - docs/350-api-contract-v1.0.0.md
     Extract and document actual API endpoints and schemas

   - docs/375-database-schema-v1.0.0.md
     Document actual database schema from migrations/models

   - docs/400-testing-strategy-v1.0.0.md
     Document current testing approach and coverage

   - docs/425-devops-v1.0.0.md
     Document actual DevOps setup and CI/CD pipeline

   - docs/450-workers-v1.0.0.md (if applicable)
     Document background jobs if found

   - docs/progress/000-progress-v1.0.0.md
     List all current features as "completed"
     Create template for tracking future changes

   - docs/releases/release-v0.0.1.md
     Document current state as baseline release

   - docs/adr/000-README.md
     Create ADR system guide

   For any unclear items, mark as "[To be clarified]" rather than guessing

11. Create Initial ADRs (if identifiable)
    If architectural decisions can be inferred from code/comments/git history:
    - Create ADR files documenting those decisions
    - Use /create-adr command for each identified decision
    - Update ADR index in docs/adr/000-README.md

12. Cross-Reference Documentation
    Add links between related documents:
    - Link API endpoints to database tables
    - Link components to user flows
    - Link features to user stories
    - Reference configuration files with line numbers

13. Generate Comprehensive Summary Report
    Display analysis results:

    ✅ Legacy codebase documented successfully!

    📊 Analysis Summary:
    - Technology Stack: [List key technologies with versions]
    - Total Files Analyzed: [Number]
    - Features Documented: [Number]
    - API Endpoints Found: [Number]
    - Components/Modules: [Number]
    - Database Tables: [Number]
    - Test Coverage: [Percentage if available]

    📁 Created Documentation:
    [List all created files with file tree]

    ⚠️ Notable Findings:
    - Key architectural patterns identified
    - Technical debt areas
    - Missing documentation areas
    - Recommended improvements

    🔍 Areas Needing Clarification:
    [List anything unclear from code that needs human input]

    📝 Next Steps:
    1. Review all generated documentation for accuracy
    2. Fill in [To be clarified] sections with domain knowledge
    3. Use /create-adr for major architectural decisions not yet documented
    4. Use /define @{filename} to refine specific documents
    5. Keep documentation updated as codebase evolves
    6. Run /update-progress to track future changes

Important Notes:
- This is READ-ONLY analysis - no code modifications
- Prioritize accuracy - mark unclear items as "[To be clarified]"
- Extract actual patterns from code, don't guess
- Include file paths and line numbers for reference
- Use Mermaid diagrams for architecture visualization
