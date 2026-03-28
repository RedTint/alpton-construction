---
name: design
description: Comprehensive design workflow for researching UI designs, planning component integration, creating Storybook examples, and updating frontend components with proper versioning and validation.
---

# Design Command

Comprehensive design workflow tool for researching UI designs, planning component integration, creating Storybook examples, and updating frontend components with proper versioning and validation.

## Steps

### 1. Parse Input and Detect Operation Mode

Detect operation mode from flags (mutually exclusive - only one mode per command):
- `--research`: Research and generate UI design options
- `--plan`: Plan component/feature integration
- `--storybook`: Create versioned Storybook examples
- `--update-fe`: Update frontend with new component version

Default to `--research` if no flag present. Extract design/component description from remaining arguments. Detect additional flags: `--draft` (for research/storybook modes), `--platform web|mobile` (research mode only, default: web).

**Note:** If multiple mode flags detected, display error and suggest correct usage.

### 2. Execute Mode-Specific Workflow

Branch based on detected mode.

---

## MODE 1: Research (--research)

Generate UI design options with mockups based on project context.

### 2R. Create Design Folder Structure

Create `/design/web/` and `/design/mobile/` folders. Within each, create: `components/`, `features/`, `pages/`, `dashboard/`. Analyze description to categorize (component/feature/page/dashboard). Extract name in kebab-case. Find existing versions, determine next version. Apply draft status if `--draft` flag present.

### 3R. Aggregate Documentation Context

Read design documentation:
- `docs/125-design-system-v*.md` - Extract typography, colors, spacing, component patterns
- `docs/300-frontend-v*.md` - Extract component library, state management, styling approach
- `docs/002-prd-v*.md` - Extract product vision, user personas, brand guidelines
- `docs/200-atomic-stories-v*.md` - Extract relevant user stories and UACs
- `docs/350-api-contract-v*.md` - Extract data structures and API endpoints

### 4R. Generate Design Options

Analyze requirements from all docs. Generate 2-3 design variations:
- **Option 1:** Conservative (follows existing patterns)
- **Option 2:** Balanced (mix of familiar and innovative)
- **Option 3:** Innovative (explores new patterns) [optional]

Document design considerations: Accessibility (WCAG compliance, ARIA, keyboard nav), Responsiveness (breakpoints, fluid typography), Performance (asset optimization, lazy loading). Compare options with pros/cons. Recommend one option with rationale.

### 5R. Generate Mockups

Create multiple mockup formats:
- **ASCII Wireframes** (`.txt`) - Layout structure in ASCII art
- **HTML Prototypes** (`.html`) - Interactive HTML with inline CSS and design tokens
- **SVG Diagrams** (`.svg`) - Component composition diagrams
- **Image Generation Prompts** (for `.png`) - Detailed prompts for visual mockups

### 6R. Create Design Document

Create comprehensive markdown at `/design/{platform}/{category}/{name}-v{version}.md` with:
- Context and requirements
- Design options with mockups
- Design considerations (a11y, responsive, performance)
- Recommendation and rationale
- Next steps

---

## MODE 2: Plan (--plan)

Plan component/feature integration without breaking the app.

### 2P. Analyze Current Frontend

Read frontend documentation:
- `docs/300-frontend-v*.md` - Component structure, state management, routing
- `docs/350-api-contract-v*.md` - API dependencies
- `docs/125-design-system-v*.md` - Design tokens and patterns

### 3P. Identify Dependencies and Conflicts

Detect component dependencies: parent/child relationships, shared state requirements, context providers needed. Identify potential conflicts: naming collisions, style conflicts, state management overlaps, routing conflicts. Analyze impact: components affected, state changes required, API integration points, test coverage needs.

### 4P. Create Integration Plan

Define implementation phases:
1. Backend preparation (if needed)
2. State management setup
3. Component development
4. Testing
5. Performance optimization

Document design considerations (mobile/desktop responsiveness, accessibility, performance). List dependencies (documents needing updates, components to modify, tests to create/update). Provide step-by-step approach with order of operations and validation checkpoints.

### 5P. Write Integration Plan

Create plan file at `/design/{feature}/integration-plan-v{version}.md` with: feature overview, dependencies and conflicts, implementation phases, design considerations, step-by-step approach, risk assessment.

---

## MODE 3: Storybook (--storybook)

Create versioned Storybook examples for components.

### 2S. Detect Component and Version

Parse component name from description. Convert to PascalCase for React component. Check for existing Storybook files, find latest version (e.g., `Button-v1.0.0.stories.tsx`). Auto-increment patch version for drafts (v1.0.0 → v1.0.1 → v1.0.2). Use provided version or increment minor for production.

Determine component status: Draft (experimental, not approved), Selected (approved, ready for implementation), Implemented (currently in use), Deprecated (replaced by newer version).

### 3S. Read Design Documentation

Look for design research docs in `/design/`. Read component specifications. Read design system to extract component patterns and design tokens (colors, spacing, typography). Read frontend architecture to determine component library (React/Vue/etc.) and folder structure conventions.

### 4S. Generate Storybook Stories

Create story file at: `{frontend-src}/stories/{ComponentName}-v{version}.stories.tsx` using Storybook CSF 3.0 format.

Generate 5+ story variants:
- **Default:** Standard usage
- **Empty State:** No data/content
- **Loading:** Loading state
- **Error:** Error state
- **Edge Cases:** Min/max values, long text, etc.

Include component metadata: Status (Draft/Selected/Implemented/Deprecated), Version number, Created date, Design file references, Props documentation.

### 5S. Configure Storybook

Check Storybook installation. Verify Storybook is configured (if not, provide setup instructions). Update Storybook config to add new story if needed. Ensure story is discoverable.

### 6S. Write Summary

Provide: Story file location, Component status and version, Storybook URL (local dev server), Next steps for testing and approval.

---

## MODE 4: Update Frontend (--update-fe)

Replace/add component version in frontend with PR.

### 2U. Parse Component and Version

Extract component name and version from description (e.g., "Button v1.1.0"). Validate version format (semantic versioning). Locate Storybook file for this version. Read component implementation from story.

### 3U. Read Current Implementation

Search frontend codebase for existing component. Read current implementation. Read design system (`docs/125-design-system-v*.md`) to verify compliance. Read frontend architecture (`docs/300-frontend-v*.md`) to verify patterns. Read API contract (`docs/350-api-contract-v*.md`) to verify integration points.

### 4U. Validate Changes

Check for breaking changes: compare prop signatures, identify removed/renamed props, check for API changes, validate backward compatibility. Validate design system compliance: verify design tokens usage, check component patterns, validate styling approach.

### 5U. Implement Component

Update/create component file following frontend architecture patterns and using design system tokens. Use `grep` to find all imports of old version. Update import statements across codebase, handle prop migrations if needed. Generate unit tests and E2E tests aiming for 80%+ test coverage.

### 6U. Create Git Branch and PR

Create git branch: `design/update-{component}-v{version}`. Commit changes with descriptive message. Use `gh pr create` to create PR with title "Design: Update {Component} to v{version}".

PR body should include: Summary of changes, Design file references, Breaking changes (if any), Testing checklist, Screenshots/mockups.

### 7U. Provide Summary

Display: Component name and version, Files changed, PR URL, Review instructions, Testing checklist.

---

## Input Format

**Research Mode:**
```
/design --research "{design description}"
/design --research --platform web "{design description}"
/design --research --draft "{design description}"
```

**Plan Mode:**
```
/design --plan "{feature/component description}"
```

**Storybook Mode:**
```
/design --storybook "{component name}"
/design --storybook --draft "{component name}"
```

**Update Frontend Mode:**
```
/design --update-fe "{component name} v{version}"
```

**Examples:**
```
/design --research "Dashboard for project management"
/design --research --platform mobile "Login screen with social auth"
/design --plan "User authentication flow"
/design --storybook "Button component"
/design --storybook --draft "ExperimentalCard"
/design --update-fe "Button v1.1.0"
```

## Important Notes

- **Mode Selection:** Use exactly one mode flag (--research, --plan, --storybook, --update-fe)
- **Draft Mode:** Available for research and storybook modes only
- **Version Management:** Storybook mode auto-increments patch versions for drafts
- **Platform Specific:** Research mode supports web/mobile platform selection
- **Context-Driven:** All modes read project documentation for context
- **Design System Alignment:** All outputs must align with design system
- **Storybook Dependency:** Storybook mode requires Storybook to be configured
- **Git Integration:** Update-FE mode creates branches and PRs automatically
- **Testing:** Update-FE mode generates unit and E2E tests
- **Validation:** Update-FE mode validates against design system and architecture

## Conversion Notes

**From Claude Skill:** /design (14KB original)
**Antigravity Limitations:**
- **AskUserQuestion:** Not available - breaking changes confirmation in Step 4U requires manual user prompt
- **Parallel Tasks:** Not available - all steps run sequentially
- **Nested Phases:** Flattened to mode-specific step groups
