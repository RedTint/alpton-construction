# Documentation Guide

This directory contains all project documentation following the numbered documentation system.

## Numbered Documentation System

| File | Purpose |
|------|---------|
| `001-project-init.md` | Initial brain dump — project vision, features, ideas |
| `002-prd-v*.md` | Product Requirements Document |
| `100-userflows-v*.md` | User personas and user flows |
| `125-design-system-v*.md` | Design system — typography, colors, components |
| `150-tech-stacks-v*.md` | Technology stack decisions |
| `175-c4-diagrams-v*.md` | C4 architecture diagrams |
| `200-atomic-stories-v*.md` | Atomic user stories with UACs |
| `300-frontend-v*.md` | Frontend architecture |
| `325-backend-v*.md` | Backend architecture |
| `350-api-contract-v*.md` | API contract |
| `375-database-schema-v*.md` | Database schema (ERD) |
| `400-testing-strategy-v*.md` | Testing strategy |
| `425-devops-v*.md` | DevOps and CI/CD |
| `450-workers-v*.md` | Background jobs (optional) |
| `epics/` | Epic-based story organization (file system as board) |
| `progress/000-progress-v*.md` | Progress tracking |
| `releases/release-v*.md` | Release notes |
| `adr/` | Architectural Decision Records |

## Commands

- `/setup` — Initialize this documentation structure
- `/define @{file}` — Elaborate a specific document
- `/new-feature {description}` — Add a new feature story
- `/build` — Build implementation from pending stories
- `/update-progress` — Sync story completion status
- `/release` — Create a versioned release

## Workflow

1. Fill out `001-project-init.md` with your project vision
2. Run `/define @002-prd-v1.0.0.md` to elaborate requirements
3. Work sequentially: `100 → 125 → 150 → 175 → 200 → 300 → 325 → 350 → 375 → 400 → 425`
4. Use `/new-feature` to add stories to `epics/`
5. Use `/build` to implement stories
6. Use `/update-progress` to track completion

## Versioning

Files use semantic versioning in their names: `002-prd-v1.0.0.md`, `002-prd-v1.1.0.md`, etc.
- **v1.0.0** — Initial MVP version
- **v1.1.0** — Minor updates, new features
- **v2.0.0** — Major revisions or breaking changes
