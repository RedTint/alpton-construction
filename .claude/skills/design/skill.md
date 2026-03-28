# Design Command

Comprehensive design workflow tool for researching UI designs, planning component integration, creating Storybook examples, and updating frontend components with proper versioning and validation.

## Execution Steps

### Phase 1: Parse Input and Detect Operation Mode

1. **Detect Operation Mode**
   - Check for mode flags in command arguments:
     - `--research`: Research and generate UI design options
     - `--plan`: Plan component/feature integration
     - `--storybook`: Create versioned Storybook examples
     - `--update-fe`: Update frontend with new component version
   - Flags are mutually exclusive - only one mode per command
   - If multiple flags present, display error
   - If no flag present, default to `--research` mode

2. **Extract Design/Component Description**
   - Parse remaining arguments for design/component description
   - Required for all modes
   - Examples:
     - Research: "Dashboard for project management"
     - Plan: "User authentication flow"
     - Storybook: "Button component"
     - Update-FE: "Button v1.1.0"

3. **Detect Additional Flags**
   - `--draft`: Create draft/experimental designs (research, storybook modes)
   - `--platform web|mobile`: Specify platform (research mode only)
   - Default platform: `web` if not specified

4. **Validate Input**
   - Ensure exactly one operation mode flag
   - Ensure description is not empty
   - Validate platform is `web` or `mobile` (if provided)
   - Display error for invalid combinations

### Phase 2: Execute Mode-Specific Workflow

**Branch based on detected mode:**

---

## MODE 1: Research (`--research`)

Generate UI design options with mockups based on project context.

### Phase 2R: Create Design Folder Structure

1. **Create Platform Folders**
   - Create `/design/web/` and `/design/mobile/`
   - Within each, create: `components/`, `features/`, `pages/`, `dashboard/`

2. **Determine Design Category and Name**
   - Analyze description to categorize (component/feature/page/dashboard)
   - Extract name in kebab-case
   - Find existing versions, determine next version number
   - Apply draft status if `--draft` flag present

### Phase 3R: Aggregate Documentation Context

1. **Read Design System** (`docs/125-design-system-v*.md`)
   - Extract typography, colors, spacing, component patterns

2. **Read Frontend Architecture** (`docs/300-frontend-v*.md`)
   - Extract component library, state management, styling approach

3. **Read Product Requirements** (`docs/002-prd-v*.md`)
   - Extract product vision, user personas, brand guidelines

4. **Read Atomic Stories** (`docs/200-atomic-stories-v*.md`)
   - Extract relevant user stories and UACs

5. **Read API Contract** (`docs/350-api-contract-v*.md`)
   - Extract data structures and API endpoints

### Phase 4R: Generate Design Options

1. **Analyze Requirements**
   - Combine context from all docs
   - Identify functional and non-functional requirements

2. **Generate 2-3 Design Variations**
   - Option 1: Conservative (follows existing patterns)
   - Option 2: Balanced (mix of familiar and innovative)
   - Option 3: Innovative (explores new patterns) [optional]

3. **Document Design Considerations**
   - Accessibility (WCAG compliance, ARIA, keyboard nav)
   - Responsiveness (breakpoints, fluid typography)
   - Performance (asset optimization, lazy loading)

4. **Provide Recommendations**
   - Compare options with pros/cons
   - Recommend one option with rationale

### Phase 5R: Generate Mockups

1. **ASCII Wireframes** (`.txt`)
   - Create ASCII art showing layout structure

2. **HTML Prototypes** (`.html`)
   - Interactive HTML with inline CSS
   - Design system tokens applied

3. **SVG Diagrams** (`.svg`)
   - Component composition diagrams

4. **Image Generation Prompts** (for `.png`)
   - Detailed Nano Banana prompts for visual mockups

### Phase 6R: Create Design Document

Create comprehensive markdown in `/design/{platform}/{category}/{name}-v{version}.md` with:
- Context and requirements
- Design options with mockups
- Design considerations (a11y, responsive, performance)
- Recommendation and rationale
- Next steps

---

## MODE 2: Plan (`--plan`)

Plan component/feature integration without breaking the app.

### Phase 2P: Analyze Current Frontend

1. **Read Frontend Architecture** (`docs/300-frontend-v*.md`)
   - Component structure and patterns
   - State management approach
   - Routing configuration

2. **Read API Contract** (`docs/350-api-contract-v*.md`)
   - Identify API dependencies

3. **Read Design System** (`docs/125-design-system-v*.md`)
   - Design tokens and patterns to follow

### Phase 3P: Identify Dependencies and Conflicts

1. **Detect Component Dependencies**
   - Parent/child component relationships
   - Shared state requirements
   - Context providers needed

2. **Identify Potential Conflicts**
   - Naming collisions
   - Style conflicts
   - State management overlaps
   - Routing conflicts

3. **Analyze Impact**
   - Components affected
   - State changes required
   - API integration points
   - Test coverage needs

### Phase 4P: Create Integration Plan

1. **Define Implementation Phases**
   - Phase 1: Backend preparation (if needed)
   - Phase 2: State management setup
   - Phase 3: Component development
   - Phase 4: Testing
   - Phase 5: Performance optimization

2. **Document Design Considerations**
   - Mobile/desktop responsiveness
   - Accessibility requirements
   - Performance implications

3. **List Dependencies**
   - Documents needing updates
   - Components to modify
   - Tests to create/update

4. **Provide Step-by-Step Approach**
   - Detailed implementation steps
   - Order of operations
   - Validation checkpoints

### Phase 5P: Write Integration Plan

Create plan file at `/design/{feature}/integration-plan-v{version}.md` with:
- Feature overview
- Dependencies and conflicts
- Implementation phases
- Design considerations
- Step-by-step approach
- Risk assessment

---

## MODE 3: Storybook (`--storybook`)

Create versioned Storybook examples for components.

### Phase 2S: Detect Component and Version

1. **Parse Component Name**
   - Extract component name from description
   - Convert to PascalCase for React component

2. **Detect or Increment Version**
   - Check for existing Storybook files
   - Find latest version (e.g., `Button-v1.0.0.stories.tsx`)
   - Auto-increment patch version for drafts (v1.0.0 → v1.0.1 → v1.0.2)
   - Use provided version or increment minor for production

3. **Determine Component Status**
   - Draft: Experimental, not approved
   - Selected: Approved, ready for implementation
   - Implemented: Currently in use
   - Deprecated: Replaced by newer version

### Phase 3S: Read Design Documentation

1. **Find Design Files**
   - Look for design research docs in `/design/`
   - Read component specifications

2. **Read Design System**
   - Extract component patterns
   - Get design tokens (colors, spacing, typography)

3. **Read Frontend Architecture**
   - Determine component library (React/Vue/etc.)
   - Get folder structure conventions

### Phase 4S: Generate Storybook Stories

1. **Create Story File**
   - File path: Frontend source + `/stories/{ComponentName}-v{version}.stories.tsx`
   - Format: Storybook CSF 3.0 format

2. **Generate 5+ Story Variants**
   - Default: Standard usage
   - Empty State: No data/content
   - Loading: Loading state
   - Error: Error state
   - Edge Cases: Min/max values, long text, etc.

3. **Include Component Metadata**
   - Status (Draft/Selected/Implemented/Deprecated)
   - Version number
   - Created date
   - Design file references
   - Props documentation

### Phase 5S: Configure Storybook

1. **Check Storybook Installation**
   - Verify Storybook is configured
   - If not, provide setup instructions

2. **Update Storybook Config**
   - Add new story to Storybook config if needed
   - Ensure story is discoverable

### Phase 6S: Write Summary

Provide:
- Story file location
- Component status and version
- Storybook URL (local dev server)
- Next steps for testing and approval

---

## MODE 4: Update Frontend (`--update-fe`)

Replace/add component version in frontend with PR.

### Phase 2U: Parse Component and Version

1. **Extract Component Name and Version**
   - Parse from description (e.g., "Button v1.1.0")
   - Validate version format (semantic versioning)

2. **Locate Storybook Example**
   - Find Storybook file for this version
   - Read component implementation from story

### Phase 3U: Read Current Implementation

1. **Find Current Component**
   - Search frontend codebase for existing component
   - Read current implementation

2. **Read Design System** (`docs/125-design-system-v*.md`)
   - Verify design system compliance

3. **Read Frontend Architecture** (`docs/300-frontend-v*.md`)
   - Verify architecture patterns

4. **Read API Contract** (`docs/350-api-contract-v*.md`)
   - Verify API integration points

### Phase 4U: Validate Changes

1. **Check for Breaking Changes**
   - Compare prop signatures
   - Identify removed/renamed props
   - Check for API changes
   - Validate backward compatibility

2. **Validate Design System Compliance**
   - Verify design tokens usage
   - Check component patterns
   - Validate styling approach

### Phase 5U: Implement Component

1. **Update/Create Component File**
   - Write component implementation
   - Follow frontend architecture patterns
   - Use design system tokens

2. **Update Component Imports**
   - Use Grep to find all imports of old version
   - Update import statements across codebase
   - Handle prop migrations if needed

3. **Generate Tests**
   - Create unit tests for component
   - Create E2E tests for interactions
   - Aim for 80%+ test coverage

### Phase 6U: Create Git Branch and PR

1. **Create Git Branch**
   - Branch name: `design/update-{component}-v{version}`
   - Commit changes with descriptive message

2. **Generate Pull Request**
   - Use `gh pr create` to create PR
   - PR title: "Design: Update {Component} to v{version}"
   - PR body with:
     - Summary of changes
     - Design file references
     - Breaking changes (if any)
     - Testing checklist
     - Screenshots/mockups

### Phase 7U: Provide Summary

Display:
- Component name and version
- Files changed
- PR URL
- Review instructions
- Testing checklist

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

## Output Format

Output varies by mode. See phase descriptions above for mode-specific outputs.

**General Success Format:**
```
✅ Design {mode} completed successfully!

[Mode-specific details]

📁 Files Created/Updated:
- {list of files}

🎯 Next Steps:
1. {next action 1}
2. {next action 2}
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

## Error Handling

**No Mode Flag:**
- Default to `--research` mode
- Display info: "No mode specified, defaulting to --research"

**Multiple Mode Flags:**
- Display error: "Only one mode flag allowed (--research, --plan, --storybook, --update-fe)"
- Suggest correct usage

**Invalid Platform:**
- Display error: "Invalid platform: {value}. Must be 'web' or 'mobile'"

**Missing Description:**
- Display error: "Please provide a {design/component/feature} description"
- Suggest example usage

**Storybook Not Configured:**
- Display error: "Storybook not found. Please configure Storybook first."
- Provide setup instructions

**Component Not Found (update-fe mode):**
- Display error: "Component {name} v{version} not found in Storybook"
- Suggest running `/design --storybook` first

**Breaking Changes Detected (update-fe mode):**
- Display warning: "Breaking changes detected"
- List breaking changes
- Ask user confirmation to proceed

**Git Operation Failed:**
- Display error with git output
- Suggest manual git operations
- Provide commands to run

## Success Criteria

**Research Mode:**
1. ✅ Design folder structure created
2. ✅ Context aggregated from 5+ docs
3. ✅ 2-3 design options generated
4. ✅ Mockups created (ASCII, HTML, SVG, PNG prompts)
5. ✅ Design document written
6. ✅ Recommendation provided

**Plan Mode:**
1. ✅ Frontend architecture analyzed
2. ✅ Dependencies identified
3. ✅ Conflicts detected
4. ✅ Implementation phases defined
5. ✅ Integration plan document created

**Storybook Mode:**
1. ✅ Component version determined
2. ✅ Storybook story file created
3. ✅ 5+ story variants generated
4. ✅ Component metadata included
5. ✅ Storybook config updated

**Update-FE Mode:**
1. ✅ Current implementation read
2. ✅ Changes validated (no breaking changes)
3. ✅ Component implemented
4. ✅ Imports updated across codebase
5. ✅ Tests generated (unit + E2E)
6. ✅ Git branch created
7. ✅ Pull request created
8. ✅ PR URL provided
