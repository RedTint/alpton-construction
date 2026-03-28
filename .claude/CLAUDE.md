# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **reusable software development template repository** that provides standardized agents, commands, and skills for building production-ready applications. It implements a structured, document-driven development workflow that ensures comprehensive planning, clear architecture, and quality deliverables.

## Repository Purpose

This repository serves as a **starting point for new software projects** by providing:

1. **Reusable Commands** - Automated workflows for project setup, documentation, and development
2. **Custom Subagents** - Specialized AI assistants for different aspects of software development
3. **Development Skills** - Domain-specific capabilities for frontend, backend, DevOps, and testing
4. **Standardized Documentation Structure** - Consistent project documentation framework

## Architecture & Philosophy

This template follows a **document-driven development approach** where:
- All requirements, designs, and specifications are documented before implementation
- Documentation files follow a numbered versioning system (e.g., v1.0.0, v1.1.0)
- Each phase of development has clear inputs and outputs
- Progress is tracked systematically through the development lifecycle

## Documentation Structure

The project uses a numbered documentation system with the following categories:

### Planning & Requirements (000-199)
- **000-README.md** - Documentation guide explaining the command system and file purposes
- **001-project-init.md** - Initial brain dump of features, ideas, and concepts for the project
- **002-prd-v1.2.0.md** - Product Requirements Document including features, personas, MVP scope, and roadmap (includes v1.3.0 draft workflow, design system management, and analytics integration)
- **100-userflows-v1.2.0.md** - User personas and user flow documentation (includes /define command flow)
- **125-design-system-v1.0.0.md** - Design system including themes (typography, colors), components, layouts, frontend structure, design notes
- **150-tech-stacks-v1.0.0.md** - Technology stack decisions, testing tools, SLA requirements (e.g., p95 latency, high reliability)
- **175-c4-diagrams-v1.1.0.md** - C4 architecture diagrams showing system structure top-down (Context, Container, Component, Code)

### Development Specifications (200-299)
- **200-atomic-stories-v1.4.0.md** - Atomic user stories with UACs for MVP (v1.0.0), code generation (v1.1.0), cross-IDE compatibility (v1.2.0), draft workflow/design system management (v1.3.0), and knowledge management/business intelligence/project dashboard (v1.4.0)

### Implementation Details (300-399)
- **300-frontend-v1.2.0.md** - Frontend folder structure, modules, component architecture, practices, implementation notes
- **325-backend-v1.2.0.md** - Backend folder structure, modules, architecture patterns
- **350-api-contract-v1.2.0.md** - API contract defining frontend-backend communication (endpoints, request/response schemas)
- **375-database-schema-v1.1.0.md** - Entity Relationship Diagrams (ERD) and data business rules

### Quality & Operations (400-499)
- **400-testing-strategy-v1.0.0.md** - Testing tools, requirements, coverage standards, test types (unit, integration, E2E)
- **425-devops-v1.1.0.md** - CI/CD pipelines, Terraform, release strategy, build/packaging, deployment automation, PR testing
- **450-workers-v1.0.0.md** - (Optional) Background jobs, scheduled tasks, recurring job specifications

### Tracking (progress/ and releases/)
- **progress/000-progress-v1.0.0.md** - Feature completion tracking aligned with atomic stories version
- **releases/release-v0.0.1.md** - Release notes starting with first end-to-end "Hello World" deployment

### Architecture Decision Records (adr/)
- **adr/000-README.md** - Table of contents for all architectural decision records
- **adr/YYYYMMDD-{purpose}.md** - Dated ADR files documenting significant architectural decisions (e.g., `20260206-switch-from-postgres-to-mysql.md`)

## Commands

This repository provides the following commands for project lifecycle management:

### Setup & Documentation
- **/setup** - Initialize all project starting files with the complete documentation structure
- **/review-and-setup** - Analyze existing/legacy codebase and create comprehensive documentation structure with details filled in based on actual code and existing documentation
- **/define @{doc} {additional prompt}** - Define or refine a specific documentation file with additional context
- **/define --draft @{doc}** - Create draft version of document for isolated elaboration without affecting production docs
- **/define --finalize @{doc-draft}** - Finalize draft document by removing -draft suffix and updating cross-references

### Development
- **/new-feature {description}** - Add new feature requirements to latest PRD and Atomic Stories with automatic architecture document creation and draft mode support
- **/design --research {description}** - Research UI designs with AI assistance, generating design options with mockups
- **/design --plan {description}** - Plan component/feature integration to avoid breaking changes
- **/design --storybook {component}** - Create versioned Storybook examples with component status tracking
- **/design --update-fe {component} v{version}** - Update frontend components with PR creation and validation
- **/google-analytics --plan** - Create Google Analytics implementation plan with event tracking strategy and GA4 configuration
- **/google-analytics --implement** - Generate analytics tracking code with tests based on analytics plan
- **/build** - Intelligent orchestrator that detects pending UACs and executes available build commands in parallel or sequentially
- **/build-fe** - Build and scaffold frontend implementation with unit and E2E tests based on specifications
- **/build-be** - Build and scaffold backend implementation with unit and integration tests based on specifications
- **/build-devops** - Build and scaffold DevOps infrastructure, CI/CD pipelines, and deployment automation with comprehensive testing
- **/strategy {description}** - Create a versioned strategy document on an isolated git branch, grounded in project context, with goals, metrics, experiments, and incremental execution planning
- **/create-pr** - Create a GitHub pull request for the current branch with user-confirmed title and customizable description sections (all included by default)
- **/sync-board** - Generate `backend/src/data/board.json` from the latest atomic stories and progress documentation, consumed by the NestJS backend and React dashboard for project visualization

### Quality & Release
- **/code-review [--agents persona1,persona2] [--scope all|frontend|backend|tests] [--focus all|security|performance|quality|architecture]** - Comprehensive code review using agent teams or personas, generating structured reports with actionable solutions
- **/log-bug {description}** - Log bugs into atomic stories and progress documentation for tracking and future resolution
- **/fix-bug {bug-id}** - Locate bug documentation with Root Cause Analysis, review the RCA, confirm the approach, implement the fix, update/create tests, verify the fix, and update all tracking documentation
- **/log-learning {description}** - Capture and document learnings from development, debugging, and implementations with searchable knowledge base
- **/release** - Create and manage project releases with automatic version tagging, release notes generation, documentation alignment tracking, and progress updates

### Utilities
- **/build-skill {name} - {description}** - Create new Claude Code Skills with proper structure and formatting
- **/convert-to-antigravity** - Convert Claude Skills to Google Antigravity Workflows for cross-IDE development
- **/create-adr {purpose}** - Create a new Architectural Decision Record with automatic indexing
- **/create-ai-dev-persona {name} - {description}** - Create RPG-style AI development personas with strategic identity frameworks, document awareness, and visual portraits
- **/create-landing-page** - Generate high-converting landing pages with proven frameworks (Alex Hormozi, StoryBrand, Feature Showcase, Hybrid) based on project documentation
- **/invoke-ai-dev-subagent {persona} {task}** - Spawn one or multiple AI dev persona subagents to execute tasks independently (supports parallel, sequential, and hybrid modes)
- **/client-new {client-name}** - Scaffold a new client folder under `docs/clients/` with all template documents and update the client index
- **/client-update --profile {client} {details}** - Update a client's profile fields using natural language (industry, website, tech stack, contacts, goals, notes, etc.)
- **/meetings-new {type_code}** - Create structured meeting notes with automatic template generation, sequential numbering, and index updates
- **/meetings-edit {@doc} "context..."** - Update existing meeting notes with AI-assisted improvements, grammar fixes, and status updates while preserving structure and creating backups
- **/meetings-update-progress {@doc}** - Sync action items and decisions from meeting notes to SUMMARY.md with automatic carry-forward tracking and 30-day archival
- **/meetings-search {query}** - Search across all meeting notes for action items, decisions, and discussion points with powerful filtering and contextual snippets
- **/migrate** - Migrate existing project documentation to standardized AI Dev Agency format with epic-based organization, file-based structure, YAML frontmatter integration, and proper markdown checklist formatting
- **/research {query}** - Conduct comprehensive internet research with dated materials, references, excerpts, annotations, confidence/relevance scoring, and actionable next steps for continued exploration
- **/scrum-of-scrums {short-description}** - Create parallel workstream documentation structures for independent feature development with separate atomic stories and progress tracking
- **/search-backlog {query}** - Search atomic stories, progress docs, and all related technical documentation (ADRs, architecture docs, design docs) to find and understand features, stories, tasks, bugs, or tech debt with full context
- **/set-ai-dev-persona** - Activate one or multiple AI dev personas to transform agent behavior and embody specialized expertise
- **/update-progress** - Update progress tracking documentation
- **/workstream-build [--workstream {ID}]** - Build workstream features with automatic workstream detection when only one exists
- **/workstream-update-progress [--workstream {ID}]** - Update workstream progress tracking with automatic workstream detection

## Subagents

Custom subagents will be created for specialized roles:
- **Product Manager** - Requirements gathering, user stories, acceptance criteria
- **Solution Architect** - System design, C4 diagrams, technology decisions
- **Frontend Specialist** - React/Next.js implementation, component architecture
- **Backend Specialist** - API development, database design, business logic
- **DevOps Engineer** - Infrastructure, CI/CD, deployment automation
- **QA Engineer** - Testing strategy, test implementation, quality assurance
- **Technical Writer** - Documentation creation and maintenance

## Skills

Domain-specific skills will be developed for:
- **Document Generation** - Creating standardized documentation files
- **Code Scaffolding** - Generating project structure and boilerplate
- **Architecture Design** - Creating C4 diagrams and system designs
- **API Contract Definition** - Defining and validating API specifications
- **Test Generation** - Creating unit, integration, and E2E tests
- **Release Management** - Version control, changelog generation, deployment

## Versioning Convention

All documentation files use semantic versioning:
- **v1.0.0** - Initial version for MVP
- **v1.1.0** - Minor updates, feature additions
- **v2.0.0** - Major revisions, breaking changes

Version numbers in filenames (e.g., `002-prd-v1.0.0.md`) allow tracking evolution of requirements and designs over time.

## Current Configuration

The repository uses:
- **Model:** Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
- **Max Tokens:** 8192
- **Allowed Tools:** Read, Write, Edit, Bash, Glob, Grep
- **Protected Files:** `.env`, `.env.*`, `production.config.*`
- **Hooks:** Auto-format Python files with Black after writing

## Getting Started

When using this template for a new project:

1. Run `/setup` to initialize the complete documentation structure
2. Fill out `002-prd-v1.1.0.md` with product requirements
3. Work through documentation files sequentially (100 → 200 → 300 → 400)
4. Use `/build-fe`, `/build-be`, `/build-devops` to implement each layer
5. Track progress using `/update-progress` throughout development
6. Create releases with `/release` when features are complete

## Development Principles

- **Documentation First** - All decisions are documented before implementation
- **Version Everything** - Track changes through semantic versioning
- **Atomic Stories** - Features are broken into small, testable units
- **Quality Gates** - Testing and validation at every stage
- **Automation** - CI/CD pipelines for consistent, reliable deployments
