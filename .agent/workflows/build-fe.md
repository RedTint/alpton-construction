---
description: Build frontend implementation with epic context pre-load, story file status transitions, and UAC checkbox tracking in docs/epics/
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

3. Parse Input and Identify Pending Frontend UACs
   Search for draft documents: docs/**/*-draft.md — warn if found, exclude from reads

   If --story-file provided:
   - Read body of story file
   - Extract unchecked "- [ ] FE:" lines from ## User Acceptance Criteria section
   - Skip already-checked "- [x] FE:" lines

   If no --story-file (fallback):
   - Find latest docs/200-atomic-stories-v*.md (EXCLUDE -draft)
   - Find latest docs/progress/000-progress-v*.md (EXCLUDE -draft)
   - Extract all FE: tagged UACs, cross-reference progress to find pending ones

   Validate prerequisites: check that required docs exist (125-design-system, 150-tech-stacks, 300-frontend, 350-api-contract)

4. Gather Context from Documentation
   Read latest docs/150-tech-stacks-v*.md — extract FE framework, styling, state, testing tools
   Read latest docs/125-design-system-v*.md — extract typography, colors, spacing, components
   Read latest docs/300-frontend-v*.md — extract architecture patterns and conventions
   Read latest docs/350-api-contract-v*.md — extract endpoints and schemas
   Read latest docs/100-userflows-v*.md — extract user journeys and flows
   Check docs/learnings/000-README.md for relevant frontend learnings (optional)
   Display context summary

5. Analyze Frontend Requirements
   Map each pending FE: UAC to components, pages, hooks, and services
   Determine file structure from docs/300-frontend-v*.md
   Generate component specifications with props, state, API calls, styling
   Plan API service layer — group endpoints by resource

6. Generate Frontend Implementation
   Create directory structure: src/components/, pages/, hooks/, services/api/, types/, utils/, contexts/
   Generate TypeScript type definitions in src/types/
   Generate API service layer in src/services/api/
   Generate common UI components in src/components/common/
   Generate feature components in src/components/features/
   Generate pages and routing
   Generate custom hooks in src/hooks/
   Generate context providers in src/contexts/
   Generate utility functions in src/utils/

7. Generate Tests
   Generate unit tests for all components (Vitest + @testing-library/react)
   Generate unit tests for hooks and utilities
   Generate E2E tests from user flows (Playwright)
   Generate test configuration files (vitest.config.ts, playwright.config.ts)
   Generate test utilities (renderWithProviders, mockData factories)
   Target: 80% code coverage minimum

8. Validate Generated Code
   Run: npx tsc --noEmit
   Run: npx eslint src/ --ext .ts,.tsx --fix
   Run: npx prettier --write "src/**/*.{ts,tsx,css}"
   Verify architecture compliance (naming conventions, component separation)
   Verify design system compliance (colors, typography, spacing)
   Verify API contract compliance (endpoint paths, schemas)
   Run: npm run test → display results
   Run: npm run test:e2e → display results

9. Update Progress Tracking
   Read latest docs/progress/000-progress-v*.md
   Mark completed FE: UACs as done
   Calculate new completion percentage
   Add build notes to changelog
   Update story completion status

   If --story-file was provided:
   - Mark implemented UACs as checked in story file body ("- [ ] FE:" → "- [x] FE:")
   - Update story frontmatter: test_unit_status, test_e2e_status, uac_completed, uac_pending, uac_completion_pct, updated_at
   - Move story file from in-progress/ → qa/:
     Run: mv {epicDir}/in-progress/{filename} {epicDir}/qa/{filename}
   - Update frontmatter story_status: qa
   - Run: node .ai-dev/ai-dev-scripts/aggregate-epics.js --update --docs-path=./docs --epic={epicId}
   - Display: "✅ Story {storyId} transitioned: in-progress → qa"

10. Generate Summary Report
    Display build statistics: components, pages, hooks, services, types, tests created
    Show file tree of generated code
    Show UAC implementation summary
    Show validation results
    Show test results and coverage
    Show epic story file transition status
    Suggest next steps: /build-be, /build-devops, /update-progress
