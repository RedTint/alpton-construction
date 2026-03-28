---
description: Research UI designs with AI assistance based on project context, generating multiple design options with visual mockups and versioned design documents
---

1. Parse Input and Validate Parameters
   Extract design description from command arguments (should be 1-3 sentences describing WHAT to design)
   Detect --draft flag → if present, set draft_mode = true and label design as "Draft"
   Detect --platform flag → web (default) or mobile; affects design patterns, sizing, and interaction patterns
   If description is empty or unclear, use AskUserQuestion to clarify:
   - What is the main purpose of this UI?
   - Who is the primary user?
   - What key actions should be supported?

2. Create Design Folder Structure
   Check if /design folder exists at project root
   Create folder structure based on --platform flag:
   - Web: /design/web/{category}/
   - Mobile: /design/mobile/{category}/
   Categories: components/ | pages/ | features/ | patterns/ | dashboard/
   Determine category from design description:
   - Single UI element (button, card, form) → components/
   - Complete page layout → pages/
   - Multi-component feature (checkout, onboarding) → features/
   - Reusable pattern (navigation, data display) → patterns/
   - Metrics, charts, analytics → dashboard/

3. Read Project Design System Context
   Use Glob to find docs/125-design-system-v*.md — select highest version
   If found, read it and extract:
   - Color palette and brand colors
   - Typography scale and font families
   - Spacing system and grid settings
   - Existing component library
   - Design principles and patterns
   If not found, note "Design system not found — using generic design patterns"
   Use Glob to find docs/100-userflows-v*.md — select highest version
   If found, extract relevant user personas and journeys for the design context

4. Generate Design Options
   Based on description, platform, and design system context, generate 3 distinct design options:

   Option A — Conservative/Minimal:
   - Clean, minimal layout with standard patterns
   - Focus on clarity and usability over visual complexity
   - Uses existing design system components without extension
   - Lower implementation effort

   Option B — Balanced/Recommended:
   - Balances visual appeal with usability
   - Extends design system thoughtfully
   - Moderate implementation effort
   - Recommended for most use cases

   Option C — Progressive/Rich:
   - Feature-rich with advanced interactions
   - May introduce new design patterns
   - Higher implementation effort
   - Best for high-priority or flagship features

   For each option generate:
   - ASCII/text mockup showing component layout and hierarchy
   - Component list with estimated implementation effort
   - Key design decisions and rationale
   - Accessibility considerations (ARIA labels, color contrast, keyboard navigation)
   - Responsive behavior description (how it adapts to different screen sizes)
   - Performance implications (lazy loading, animation impact, bundle size)

5. Ask User to Select Design Option
   Present all 3 options with mockups
   Use AskUserQuestion:
   - "Option A — {brief description}"
   - "Option B — {brief description} (Recommended)"
   - "Option C — {brief description}"
   - Other: describe custom combination or modifications
   Store selection as chosen_option
   If user selects Other, ask for specific modifications or combination preferences

6. Determine Design Document Filename
   Generate 3 file name candidates based on design description (kebab-case, max 40 chars)
   Use AskUserQuestion to let user choose filename:
   - Option 1: {candidate-1}
   - Option 2: {candidate-2}
   - Option 3: {candidate-3}
   - Other: type custom name
   Determine version number: find existing files matching the chosen name in the target folder, use v1.0.0 for new or increment for existing
   Final filename: {chosen-name}-v{N}.md (draft status in doc if --draft flag)

7. Generate Design Document Content
   Create comprehensive design document with these sections:
   - Title and metadata (version, date, status, platform, design system version)
   - Overview: design description, user personas, primary use case
   - Design Options Summary: brief description of all 3 options
   - Selected Design: full details of chosen_option including:
     - Complete ASCII mockup
     - Component breakdown with specifications
     - Color, typography, and spacing decisions (referencing design system)
     - Interaction states (default, hover, focus, active, disabled, loading, error)
     - Responsive breakpoints and behavior
     - Accessibility checklist (WCAG 2.1 AA compliance)
   - Implementation Notes:
     - Component dependencies
     - Estimated effort in story points
     - Any new patterns or components needed
     - Integration points with existing codebase
   - Alternative Options: brief summary of Options not selected (for reference)
   - Design Decisions Log: table of key decisions and rationale

8. Write Design Document
   Use Write tool to create the design file at /design/{platform}/{category}/{filename}
   Ensure all sections are populated (no empty placeholders)

9. Update Design Index (if README exists)
   Check if /design/README.md or /design/{platform}/README.md exists
   If yes, add a new row to the design inventory table:
   | {filename} | {title} | {version} | {date} | {status} | {brief description} |
   If no README exists, create one with a table of contents header and the new entry
   Use Edit (existing) or Write (new) to save

10. Generate Summary Report
    Display design research summary:
    - Design description
    - Platform: web / mobile
    - Design option selected: A / B / C / Custom
    - Document created: /design/{platform}/{category}/{filename}
    - Design system referenced: {filename or "not found"}
    - Components identified: N new components, N existing components reused
    Suggest next steps:
    - Review the design document and refine the mockup
    - Share with team using /create-pr for feedback
    - Use /design --plan to plan component integration
    - Use /design --storybook {component} to create Storybook stories
    - Use /build-fe when ready to implement
