---
description: Build backend implementation with epic context pre-load, story file status transitions, and UAC checkbox tracking in docs/epics/
---

1. Epic Context Pre-load
   Check if --story-file {path} argument was provided (passed by /build orchestrator)

   If --story-file provided:
   - Read story file YAML frontmatter: extract epic_id → store as epicId
   - Read docs/epics/{epicId}/epic.md for epic scope and conventions
   - Glob docs/epics/{epicId}/done/*.md → read completed stories as pattern reference
   - Glob docs/epics/{epicId}/in-progress/*.md → read sibling stories to avoid conflicts
   - Display epic context summary

   Transition story to in-progress (if story_status is "pending"):
   - Run: mv {storyFilePath} {epicDir}/in-progress/{filename}
   - Update frontmatter: story_status: in-progress, updated_at: {ISO now}
   - Run: node .ai-dev/ai-dev-scripts/aggregate-epics.js --update --docs-path=./docs --epic={epicId}
   - Display: "🚧 Story {storyId} transitioned: pending → in-progress"

2. Git Branch Safety Check
   Run: git rev-parse --abbrev-ref HEAD
   If branch is protected (main, master, develop, staging, production):
   - Display error and exit — DO NOT proceed

3. Parse Input and Identify Pending Backend UACs
   Search for draft documents: docs/**/*-draft.md — warn if found, exclude from reads

   If --story-file provided:
   - Read body of story file
   - Extract unchecked "- [ ] BE:" and "- [ ] DB:" lines from ## User Acceptance Criteria
   - Skip already-checked "- [x] BE:" and "- [x] DB:" lines

   If no --story-file (fallback):
   - Find latest docs/200-atomic-stories-v*.md (EXCLUDE -draft)
   - Find latest docs/progress/000-progress-v*.md (EXCLUDE -draft)
   - Extract all BE:/DB: tagged UACs, cross-reference progress to find pending ones

   Group UACs by feature area (auth, user management, resource management, business rules, integrations)

4. Gather Context from Documentation
   Read latest docs/350-api-contract-v*.md (EXCLUDE -draft) — primary reference
   Read latest docs/325-backend-v*.md — architecture patterns and conventions
   Read latest docs/375-database-schema-v*.md — ERD and data rules
   Read latest docs/150-tech-stacks-v*.md — framework, ORM, testing tools
   Check docs/learnings/000-README.md for relevant backend learnings (optional)
   Display context summary

5. Analyze Backend Requirements
   Map each pending BE:/DB: UAC to controllers, services, repositories, models
   Plan API endpoints matching docs/350-api-contract-v*.md exactly
   Design service layer business logic per UAC
   Plan database entities and migrations per DB: UACs

6. Generate Backend Implementation
   Create directory structure following docs/325-backend-v*.md
   Generate TypeScript type definitions
   Generate database entities/models
   Generate repositories (data access layer)
   Generate services (business logic)
   Generate controllers (request handlers)
   Generate routes and middleware
   Generate utility functions (JWT, password hashing, etc.)
   Generate config files (database, env)

7. Generate Tests
   Generate unit tests for services and utilities
   Generate integration tests for API endpoints and database operations
   Target: 80% code coverage minimum

8. Validate Generated Code
   Run TypeScript compilation: npx tsc --noEmit
   Run linting: npx eslint src/ --fix
   Run unit tests: npm run test
   Run integration tests: npm run test:integration
   Verify API endpoints match docs/350-api-contract-v*.md
   Verify database schema matches docs/375-database-schema-v*.md

9. Update Progress Tracking
   Read latest docs/progress/000-progress-v*.md
   Mark completed BE:/DB: UACs as done
   Add build notes to changelog

   If --story-file was provided:
   - Mark implemented UACs as checked ("- [ ] BE:" → "- [x] BE:", "- [ ] DB:" → "- [x] DB:")
   - Update story frontmatter: test_unit_status, test_integration_status, uac_completed, uac_pending, uac_completion_pct, updated_at
   - Move story file from in-progress/ → qa/:
     Run: mv {epicDir}/in-progress/{filename} {epicDir}/qa/{filename}
   - Update frontmatter story_status: qa
   - Run: node .ai-dev/ai-dev-scripts/aggregate-epics.js --update --docs-path=./docs --epic={epicId}
   - Display: "✅ Story {storyId} transitioned: in-progress → qa"

10. Generate Summary Report
    Display implementation statistics: files created by type, UACs implemented
    Show test results and coverage
    Show epic story file transition status
    Suggest next steps: /build-fe, /build-devops, /update-progress
