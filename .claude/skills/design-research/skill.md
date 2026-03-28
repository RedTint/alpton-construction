# Design Research Command

Research UI designs with AI assistance based on project context, generating multiple design options with visual mockups across various formats. Creates versioned design documents with comprehensive design considerations including accessibility, responsive design, and performance.

## Execution Steps

### Phase 1: Parse Input and Validate Parameters

1. **Extract Design Description**
   - Parse the command arguments to get design description
   - Design description should be clear and specific (1-3 sentences)
   - Examples:
     - "Dashboard layout with metrics cards, charts, and activity feed"
     - "User profile page with avatar, bio, activity tabs, and settings"
     - "Mobile navigation drawer with nested menu items and search"

2. **Detect Draft Mode**
   - Check if `--draft` flag is present in arguments
   - Draft mode behavior:
     - Creates versioned design files in `/design/` folder
     - Design files are versioned independently (e.g., `dashboard-v1.0.0.md`)
     - Draft designs can be iterated without affecting implemented designs
     - Status tracked as "Draft" until approved for implementation
   - Non-draft mode:
     - Same versioning approach, just without "Draft" status label
     - Design files are always versioned regardless of draft flag

3. **Detect Platform Flag**
   - Check if `--platform web|mobile` flag is present
   - Platform options:
     - `web` - Web/desktop design (default if not specified)
     - `mobile` - Mobile app design (iOS/Android patterns)
   - If not specified, default to `web` platform
   - Platform affects:
     - Design patterns (desktop nav vs mobile nav)
     - Component sizing (touch targets for mobile)
     - Layout constraints (viewport width considerations)
     - Interaction patterns (hover vs tap)

4. **Validate Design Description**
   - Ensure description is not empty
   - Should describe WHAT to design (not HOW to implement)
   - Should be specific enough to generate concrete designs
   - If unclear, use AskUserQuestion to clarify:
     - What is the main purpose of this UI?
     - Who is the primary user?
     - What key actions should be supported?

### Phase 2: Create and Validate Design Folder Structure

1. **Check Existing Design Folder**
   - Use Bash to check if `/design` folder exists at project root
   - Check for platform-specific subfolders:
     - `/design/web/` - Web design system
     - `/design/mobile/` - Mobile design system

2. **Create Design Folder Structure**
   - If `/design` doesn't exist, create it
   - Create platform-specific folder based on `--platform` flag:
     - For web: `/design/web/`
     - For mobile: `/design/mobile/`
   - Create category subfolders within platform folder:
     - `components/` - Individual component designs
     - `pages/` - Full page designs
     - `features/` - Feature-specific multi-component designs
     - `patterns/` - Reusable design patterns
     - `dashboard/` - Dashboard-specific designs (if applicable)

3. **Determine Design Category**
   - Analyze design description to categorize:
     - **Component**: Single UI element (button, card, form, etc.)
     - **Page**: Complete page layout (home, profile, settings, etc.)
     - **Feature**: Multi-component feature (checkout flow, onboarding, etc.)
     - **Pattern**: Reusable pattern (navigation, forms, data display, etc.)
     - **Dashboard**: Dashboard-specific (metrics, charts, analytics, etc.)
   - Use category to determine subfolder placement
   - Example: "Dashboard layout" → `/design/web/dashboard/`
   - Example: "User profile page" → `/design/web/pages/`
   - Example: "Mobile navigation drawer" → `/design/mobile/components/`

4. **Check for Existing Versions**
   - Use Glob to find existing design files for this design
   - Pattern: `{category}/{design-name}-v*.md`
   - Parse version numbers to determine next version
   - Examples:
     - If `dashboard-v1.0.0.md` exists, next could be `dashboard-v1.1.0.md` (iteration)
     - If no existing file, start with `v1.0.0`
   - Version numbering:
     - **v1.0.0** - Initial design
     - **v1.1.0** - Minor iteration (small changes)
     - **v2.0.0** - Major redesign (significant changes)

### Phase 3: Aggregate Context from Documentation

1. **Identify Required Context Documents**
   - Based on design type, determine which documents to read:
     - **Always read**:
       - `docs/002-prd-v*.md` - Product goals and user needs
       - `docs/125-design-system-v*.md` - Design system (colors, typography, components)
     - **For UI designs**:
       - `docs/300-frontend-v*.md` - Frontend architecture and patterns
       - `docs/100-userflows-v*.md` - User flows and personas
     - **For data-driven designs**:
       - `docs/350-api-contract-v*.md` - API endpoints and data structure
       - `docs/375-database-schema-v*.md` - Data models (if complex data)
     - **For feature designs**:
       - `docs/200-atomic-stories-v*.md` - User stories and acceptance criteria

2. **Read Context Documents**
   - Use Glob to find latest versions of required documents
   - Read all relevant documents in parallel
   - Extract key information:
     - **From PRD**: Product vision, target users, key features
     - **From Design System**: Color palette, typography, spacing, component patterns
     - **From Frontend Architecture**: Component structure, state management, routing
     - **From User Flows**: User journeys, personas, interaction patterns
     - **From API Contract**: Available data, endpoints, request/response schemas
     - **From Atomic Stories**: Feature requirements, acceptance criteria

3. **Extract Design System Details**
   - Parse 125-design-system to extract:
     - **Typography**: Font families, sizes, weights, line heights
     - **Colors**: Primary, secondary, semantic colors (success, error, warning)
     - **Spacing**: Spacing scale (4px, 8px, 16px, etc.)
     - **Components**: Existing component library
     - **Layouts**: Grid system, breakpoints, container widths
     - **Patterns**: Design patterns already established
   - Store for mockup generation

4. **Extract API Data Structure**
   - If design requires data, read API contract
   - Identify relevant endpoints and schemas
   - Extract sample data structure for mockups
   - Example: User profile needs `/users/:id` endpoint data
   - Use actual field names and data types in mockups

5. **Build Comprehensive Context**
   - Combine all extracted information
   - Create design brief summarizing:
     - Design purpose and goals
     - Target users and personas
     - Key features and interactions
     - Design constraints (technical, brand, accessibility)
     - Available components and patterns
     - Data requirements

### Phase 4: Generate Design Options (2-3 Variations)

1. **Analyze Design Requirements**
   - Review design description and aggregated context
   - Identify key design challenges:
     - Information hierarchy
     - User interaction patterns
     - Responsive requirements
     - Accessibility needs
     - Performance constraints
   - Determine variation focus areas:
     - **Variation 1**: Conservative/familiar pattern
     - **Variation 2**: Modern/innovative approach
     - **Variation 3**: Alternative layout or interaction model (optional)

2. **Generate Design Option 1 (Conservative)**
   - **Approach**: Use familiar, proven design patterns
   - **Layout**: Traditional structure (header, sidebar, content)
   - **Visual Style**: Clean, minimal, professional
   - **Components**: Standard components from design system
   - **Interaction**: Conventional patterns (click, hover, scroll)
   - **Target**: Broad user base, high accessibility
   - **Rationale**: Minimizes learning curve, high usability

3. **Generate Design Option 2 (Modern)**
   - **Approach**: Contemporary, visually engaging design
   - **Layout**: Dynamic, card-based or grid layout
   - **Visual Style**: Bold colors, modern typography, subtle animations
   - **Components**: Enhanced components with micro-interactions
   - **Interaction**: Progressive disclosure, contextual actions
   - **Target**: Tech-savvy users, modern aesthetic
   - **Rationale**: Differentiates brand, increases engagement

4. **Generate Design Option 3 (Alternative) - Optional**
   - **Approach**: Experimental or niche-specific design
   - **Layout**: Unconventional structure (split-screen, modal-based, etc.)
   - **Visual Style**: Distinct from options 1 and 2
   - **Components**: Custom or creative component usage
   - **Interaction**: Unique interaction patterns
   - **Target**: Specific use case or advanced users
   - **Rationale**: Explores alternatives, addresses edge cases

5. **Design Considerations for Each Option**
   - **Accessibility (a11y)**:
     - Color contrast ratios (WCAG AA or AAA)
     - Keyboard navigation support
     - Screen reader compatibility (ARIA labels)
     - Focus indicators
     - Touch target sizes (minimum 44x44px for mobile)
   - **Responsive Design**:
     - Mobile-first approach (if web)
     - Breakpoint strategy (mobile, tablet, desktop)
     - Content reflow and stacking
     - Touch-friendly interactions for mobile
     - Desktop enhancements (hover states, larger layouts)
   - **Performance**:
     - Image optimization (lazy loading, appropriate formats)
     - Minimal JavaScript dependencies
     - CSS performance (avoid layout thrashing)
     - Bundle size considerations
     - Loading states and skeleton screens
   - **Usability**:
     - Clear information hierarchy
     - Scannable content
     - Obvious call-to-action buttons
     - Error prevention and recovery
     - Consistent patterns across design

6. **Document Design Rationale**
   - For each option, document:
     - **Strengths**: What makes this design effective
     - **Weaknesses**: Trade-offs or limitations
     - **Best For**: Ideal use cases or user types
     - **Implementation Complexity**: Easy, Medium, Hard
     - **Design System Alignment**: How well it fits existing system
     - **Recommendation Score**: 1-10 rating with justification

### Phase 5: Generate Mockups for Each Design Option

1. **Prepare Mockup Data**
   - Extract sample data from API contract (if applicable)
   - Create realistic content for mockups:
     - User names, profile info
     - Metrics, numbers, percentages
     - Text content (headlines, descriptions)
     - Dates, timestamps
   - Use actual field names from API schemas
   - Ensure data is representative of real use cases

2. **Generate PNG Mockups (Nano Banana)**
   - **For Each Design Option**:
     - Use Nano Banana AI image generation
     - Provide detailed prompt describing:
       - Layout structure (header, sidebar, main content, footer)
       - Component arrangement (cards, forms, buttons, etc.)
       - Color scheme from design system
       - Typography style
       - Visual hierarchy
       - Interactive elements
       - Platform-specific details (web browser chrome vs mobile device frame)
     - Generate high-fidelity visual mockup
     - Save as: `{design-name}-v{version}-option{1|2|3}-mockup.png`
     - Example: `dashboard-v1.0.0-option1-mockup.png`

3. **Generate HTML Mockups (Interactive Prototype)**
   - **For Each Design Option**:
     - Create standalone HTML file with inline CSS
     - Include:
       - Complete HTML structure matching design
       - CSS styles from design system (colors, typography, spacing)
       - Realistic content and data
       - Interactive elements (buttons, forms, tabs)
       - Responsive breakpoints (if web)
       - Basic JavaScript for interactivity (click, hover, toggle)
     - No external dependencies (all inline)
     - Mobile viewport meta tag (for web designs)
     - Save as: `{design-name}-v{version}-option{1|2|3}-mockup.html`
     - Example: `dashboard-v1.0.0-option1-mockup.html`
   - **HTML Structure Template**:
     ```html
     <!DOCTYPE html>
     <html lang="en">
     <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>{Design Name} - Option {1|2|3}</title>
       <style>
         /* Design system CSS variables */
         :root {
           --primary-color: {from design system};
           --text-color: {from design system};
           /* etc. */
         }
         /* Component styles */
         /* Layout styles */
         /* Responsive styles */
       </style>
     </head>
     <body>
       <!-- HTML structure matching design -->
       <script>
         // Basic interactivity
       </script>
     </body>
     </html>
     ```

4. **Generate ASCII Mockups (Wireframe)**
   - **For Each Design Option**:
     - Create ASCII art wireframe showing structure
     - Use box-drawing characters (─, │, ┌, ┐, └, ┘, ├, ┤, ┬, ┴, ┼)
     - Show layout structure and component placement
     - Annotate with labels [Button], [Input], [Card], etc.
     - Include dimensions or proportions
     - Save as: `{design-name}-v{version}-option{1|2|3}-mockup.txt`
     - Example: `dashboard-v1.0.0-option1-mockup.txt`
   - **ASCII Mockup Template**:
     ```
     ┌─────────────────────────────────────────────────────────┐
     │ [Header - Logo, Navigation, User Menu]                  │
     ├─────────────────────────────────────────────────────────┤
     │ ┌─────┐ ┌─────────────────────────────────────────────┐│
     │ │     │ │ [Main Content Area]                         ││
     │ │ Nav │ │                                             ││
     │ │     │ │ [Metrics Cards]                             ││
     │ │     │ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       ││
     │ │     │ │ │Card 1│ │Card 2│ │Card 3│ │Card 4│       ││
     │ │     │ │ └──────┘ └──────┘ └──────┘ └──────┘       ││
     │ │     │ │                                             ││
     │ │     │ │ [Chart Area]                                ││
     │ │     │ │ ┌───────────────────────────────────────┐  ││
     │ │     │ │ │        Line Chart                     │  ││
     │ │     │ │ │                                       │  ││
     │ │     │ │ └───────────────────────────────────────┘  ││
     │ └─────┘ └─────────────────────────────────────────────┘│
     └─────────────────────────────────────────────────────────┘
     ```

5. **Generate SVG Mockups (Vector Graphics)**
   - **For Each Design Option**:
     - Create SVG file with vector representation
     - Include:
       - Layout structure using SVG rectangles and groups
       - Text elements with design system typography
       - Color fills from design system palette
       - Icons as SVG paths (if applicable)
       - Annotations and labels
     - Scalable and editable
     - Save as: `{design-name}-v{version}-option{1|2|3}-mockup.svg`
     - Example: `dashboard-v1.0.0-option1-mockup.svg`
   - **SVG Mockup Template**:
     ```svg
     <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
       <!-- Header -->
       <rect x="0" y="0" width="1200" height="60" fill="#ffffff" stroke="#e0e0e0"/>
       <text x="20" y="35" font-family="Inter" font-size="18" fill="#333">Logo</text>

       <!-- Sidebar -->
       <rect x="0" y="60" width="200" height="740" fill="#f5f5f5" stroke="#e0e0e0"/>

       <!-- Main Content -->
       <rect x="200" y="60" width="1000" height="740" fill="#ffffff"/>

       <!-- Components with labels -->
       <!-- ... -->
     </svg>
     ```

6. **Save Mockup Files**
   - Use Write tool to create each mockup file
   - Save in appropriate platform/category folder
   - File naming convention:
     - `{design-name}-v{version}-option{1|2|3}-mockup.{png|html|txt|svg}`
   - Ensure all 4 formats for each of 2-3 options
   - Total: 8-12 mockup files per design research session

### Phase 6: Create Design Document with Recommendations

1. **Structure Design Document**
   - Create comprehensive markdown document
   - File name: `{design-name}-v{version}.md`
   - Location: `/design/{platform}/{category}/{design-name}-v{version}.md`
   - Example: `/design/web/dashboard/dashboard-v1.0.0.md`

2. **Document Header**
   ```markdown
   # {Design Name} v{version}

   **Project:** {Project Name from PRD}
   **Version:** v{version}
   **Date:** {Current Date}
   **Platform:** {Web/Mobile}
   **Category:** {Component/Page/Feature/Pattern/Dashboard}
   **Status:** {Draft/Approved/Implemented/Deprecated}
   **Designer:** Claude Sonnet 4.5 (AI-Assisted Design Research)

   ## Design Brief

   {Design description provided by user}

   **Purpose:** {What this design aims to achieve}
   **Target Users:** {Personas from user flows}
   **Key Features:** {Main capabilities this design supports}
   ```

3. **Context Section**
   ```markdown
   ## Context & Requirements

   ### Product Context
   - Product Vision: {from PRD}
   - User Needs: {from PRD and user flows}
   - Success Criteria: {from PRD}

   ### Technical Context
   - Frontend Stack: {from frontend architecture}
   - Component Library: {from design system}
   - State Management: {from frontend architecture}
   - API Integration: {from API contract}

   ### Design Constraints
   - Design System Compliance: {existing patterns to follow}
   - Accessibility: {WCAG level, screen reader support}
   - Responsive Requirements: {breakpoints, device support}
   - Performance Budget: {load time, bundle size}
   - Browser/Device Support: {compatibility requirements}
   ```

4. **Design Options Section**
   - For each design option (1-3):
   ```markdown
   ## Design Option {1|2|3}: {Option Name}

   ### Overview
   {Brief description of this design approach}

   ### Visual Mockups

   ![PNG Mockup](./{design-name}-v{version}-option{1|2|3}-mockup.png)

   **Interactive Prototype:** [{design-name}-v{version}-option{1|2|3}-mockup.html](./{design-name}-v{version}-option{1|2|3}-mockup.html)

   **ASCII Wireframe:**
   ```
   {Include ASCII wireframe inline or reference .txt file}
   ```

   **Vector Graphics:** [{design-name}-v{version}-option{1|2|3}-mockup.svg](./{design-name}-v{version}-option{1|2|3}-mockup.svg)

   ### Layout Structure
   - **Header:** {description}
   - **Main Content:** {description}
   - **Sidebar/Navigation:** {description}
   - **Footer:** {description}

   ### Components Used
   - {Component 1}: {usage and variant}
   - {Component 2}: {usage and variant}
   - ...

   ### Design Patterns
   - {Pattern 1}: {how it's applied}
   - {Pattern 2}: {how it's applied}

   ### Interaction Model
   - {Primary actions and how users trigger them}
   - {Navigation flow}
   - {State changes and feedback}

   ### Accessibility Considerations
   - **Color Contrast:** {WCAG compliance level, contrast ratios}
   - **Keyboard Navigation:** {tab order, shortcuts}
   - **Screen Readers:** {ARIA labels, semantic HTML}
   - **Focus Management:** {focus indicators, focus traps}
   - **Touch Targets:** {minimum sizes for mobile}

   ### Responsive Behavior
   - **Mobile (< 768px):** {layout changes, stacked content}
   - **Tablet (768px - 1024px):** {layout adjustments}
   - **Desktop (> 1024px):** {full layout, additional features}

   ### Performance Considerations
   - **Image Optimization:** {formats, lazy loading}
   - **Code Splitting:** {bundle strategy}
   - **Critical CSS:** {above-the-fold optimization}
   - **Loading States:** {skeleton screens, spinners}

   ### Design Rationale

   **Strengths:**
   - {Strength 1}
   - {Strength 2}
   - {Strength 3}

   **Weaknesses:**
   - {Weakness 1 and mitigation}
   - {Weakness 2 and mitigation}

   **Best For:**
   - {Use case 1}
   - {User type 1}

   **Implementation Complexity:** {Easy/Medium/Hard}
   - {Complexity factors}

   **Design System Alignment:** {Score}/10
   - {Explanation of alignment with existing design system}

   **Recommendation Score:** {Score}/10
   - {Detailed justification of score}
   ```

5. **Comparison Section**
   ```markdown
   ## Design Comparison Matrix

   | Criteria | Option 1 | Option 2 | Option 3 |
   |----------|----------|----------|----------|
   | Accessibility | {score}/10 | {score}/10 | {score}/10 |
   | Usability | {score}/10 | {score}/10 | {score}/10 |
   | Visual Appeal | {score}/10 | {score}/10 | {score}/10 |
   | Implementation | {Easy/Med/Hard} | {Easy/Med/Hard} | {Easy/Med/Hard} |
   | Performance | {score}/10 | {score}/10 | {score}/10 |
   | Responsive | {score}/10 | {score}/10 | {score}/10 |
   | Design System Fit | {score}/10 | {score}/10 | {score}/10 |
   | **Overall Score** | **{total}**/70 | **{total}**/70 | **{total}**/70 |

   ## Recommendations

   ### Primary Recommendation: {Option Name}

   **Rationale:**
   {Detailed explanation of why this option is recommended}

   **Key Advantages:**
   - {Advantage 1}
   - {Advantage 2}
   - {Advantage 3}

   **Considerations:**
   - {Consideration 1}
   - {Consideration 2}

   **Implementation Priority:** {High/Medium/Low}

   ### Alternative Recommendation: {Option Name}

   **When to Consider:**
   {Scenarios where alternative option might be better}

   **Trade-offs:**
   {What you gain and lose with this alternative}
   ```

6. **Implementation Guidance**
   ```markdown
   ## Implementation Guidance

   ### Component Breakdown
   1. {Component 1}: {file path, props, state}
   2. {Component 2}: {file path, props, state}
   3. ...

   ### File Structure
   ```
   src/
   ├── components/
   │   └── {category}/
   │       ├── {ComponentName}.tsx
   │       ├── {ComponentName}.test.tsx
   │       ├── {ComponentName}.stories.tsx
   │       └── index.ts
   ├── pages/
   │   └── {PageName}.tsx
   └── ...
   ```

   ### State Management
   - {State requirements}
   - {Data flow}
   - {API integration points}

   ### Testing Strategy
   - **Unit Tests:** {what to test}
   - **Integration Tests:** {component interactions}
   - **E2E Tests:** {user workflows}
   - **Accessibility Tests:** {a11y validation}
   - **Visual Regression:** {screenshot comparison}

   ### Performance Optimization
   - {Optimization 1}
   - {Optimization 2}

   ### Next Steps
   1. {Step 1: e.g., Review with stakeholders}
   2. {Step 2: e.g., Validate with users}
   3. {Step 3: e.g., Create Storybook stories}
   4. {Step 4: e.g., Implement with /build-fe}
   5. {Step 5: e.g., User testing}
   ```

7. **Write Design Document**
   - Use Write tool to create the design markdown file
   - Save in correct location: `/design/{platform}/{category}/{design-name}-v{version}.md`
   - Ensure all sections are complete and well-formatted
   - Include all mockup references and links

### Phase 7: Generate Summary Report

1. **Collect All Generated Files**
   - Design document: `{design-name}-v{version}.md`
   - PNG mockups: 2-3 files (one per option)
   - HTML mockups: 2-3 files (one per option)
   - ASCII mockups: 2-3 files (one per option)
   - SVG mockups: 2-3 files (one per option)
   - Total: 9-13 files (1 doc + 8-12 mockups)

2. **Analyze Design Options**
   - Compare scores from design comparison matrix
   - Identify recommended option
   - Note key differentiators between options

3. **Display Comprehensive Summary**
   ```
   ✅ Design research completed successfully!

   🎨 Design Details:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Design:      {Design Name}
   Version:     v{version}
   Platform:    {Web/Mobile}
   Category:    {Component/Page/Feature/Pattern/Dashboard}
   Status:      {Draft/Approved}
   Options:     {2-3} design variations

   📄 Files Generated:
   - ✅ /design/{platform}/{category}/{design-name}-v{version}.md (Design Document)

   🖼️ Mockups Generated (Option 1):
   - ✅ {design-name}-v{version}-option1-mockup.png (PNG Visual)
   - ✅ {design-name}-v{version}-option1-mockup.html (Interactive Prototype)
   - ✅ {design-name}-v{version}-option1-mockup.txt (ASCII Wireframe)
   - ✅ {design-name}-v{version}-option1-mockup.svg (Vector Graphics)

   🖼️ Mockups Generated (Option 2):
   - ✅ {design-name}-v{version}-option2-mockup.png (PNG Visual)
   - ✅ {design-name}-v{version}-option2-mockup.html (Interactive Prototype)
   - ✅ {design-name}-v{version}-option2-mockup.txt (ASCII Wireframe)
   - ✅ {design-name}-v{version}-option2-mockup.svg (Vector Graphics)

   🖼️ Mockups Generated (Option 3) [if applicable]:
   - ✅ {design-name}-v{version}-option3-mockup.png (PNG Visual)
   - ✅ {design-name}-v{version}-option3-mockup.html (Interactive Prototype)
   - ✅ {design-name}-v{version}-option3-mockup.txt (ASCII Wireframe)
   - ✅ {design-name}-v{version}-option3-mockup.svg (Vector Graphics)

   🔍 Context Used:
   - docs/002-prd-v{version}.md - Product goals and user needs
   - docs/125-design-system-v{version}.md - Design system (colors, typography, components)
   - docs/300-frontend-v{version}.md - Frontend architecture and patterns
   - docs/100-userflows-v{version}.md - User flows and personas (if applicable)
   - docs/350-api-contract-v{version}.md - API structure (if applicable)
   - docs/200-atomic-stories-v{version}.md - Feature requirements (if applicable)

   🏆 Design Comparison:

   Option 1 - {Name}: {total score}/70 {★★★★☆}
   - Accessibility: {score}/10
   - Usability: {score}/10
   - Visual Appeal: {score}/10
   - Implementation: {Easy/Medium/Hard}

   Option 2 - {Name}: {total score}/70 {★★★★★}
   - Accessibility: {score}/10
   - Usability: {score}/10
   - Visual Appeal: {score}/10
   - Implementation: {Easy/Medium/Hard}

   Option 3 - {Name}: {total score}/70 {★★★☆☆} (if applicable)
   - Accessibility: {score}/10
   - Usability: {score}/10
   - Visual Appeal: {score}/10
   - Implementation: {Easy/Medium/Hard}

   💡 Primary Recommendation: {Option Name}

   **Why This Option:**
   {2-3 sentence rationale for recommendation}

   **Key Strengths:**
   - {Strength 1}
   - {Strength 2}
   - {Strength 3}

   **Implementation Complexity:** {Easy/Medium/Hard}

   ♿ Accessibility Score: {score}/10
   - Color contrast: {WCAG AA/AAA compliance}
   - Keyboard navigation: {Full support}
   - Screen reader: {ARIA labels included}
   - Touch targets: {44x44px minimum for mobile}

   📱 Responsive Design:
   - Mobile: {description of mobile layout}
   - Tablet: {description of tablet layout}
   - Desktop: {description of desktop layout}

   ⚡ Performance Considerations:
   - Image optimization: {lazy loading, WebP format}
   - Code splitting: {component-level splitting}
   - Bundle size: {estimated KB}
   - Loading states: {skeleton screens implemented}

   🎯 Next Steps:

   1. **Review Design Document:**
      Open: /design/{platform}/{category}/{design-name}-v{version}.md

   2. **Preview Interactive Mockups:**
      Open in browser: /design/{platform}/{category}/{design-name}-v{version}-option{X}-mockup.html

   3. **Validate with Stakeholders:**
      - Share mockups with team
      - Gather feedback on recommended option
      - Validate accessibility requirements

   4. **Create Storybook Stories (if approved):**
      /design-storybook "{design-name}"

   5. **Plan Implementation:**
      /design-planning "{design-name} integration"

   6. **Implement Design (when ready):**
      /design-update-frontend "{component-name}" --version v{version} --option {1|2|3}

   ✨ Design research "{design-name}" completed! ✨
   ```

4. **Provide Contextual Recommendations**
   - Suggest next commands based on design type:
     - For components: Suggest `/design-storybook`
     - For pages/features: Suggest `/design-planning`
     - For patterns: Suggest updating design system doc
   - Provide validation checklist
   - Offer implementation timeline estimate

## Input Format

**Command:**
```
/design-research {design-description}
/design-research --draft {design-description}
/design-research --platform web|mobile {design-description}
/design-research --draft --platform mobile {design-description}
```

**Examples:**

```
/design-research "Dashboard layout with metrics cards, line chart, and recent activity feed"

/design-research --draft "User profile page with avatar, bio section, activity tabs, and settings"

/design-research --platform mobile "Mobile navigation drawer with nested menu items and search"

/design-research --draft --platform web "E-commerce product listing page with filters, sorting, and grid layout"

/design-research "Data table component with sorting, filtering, pagination, and row actions"

/design-research --platform mobile "Onboarding flow with welcome screen, feature highlights, and signup form"
```

## Output Format

```
✅ Design research completed successfully!

🎨 Design Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Design:      Dashboard Layout
Version:     v1.0.0
Platform:    Web
Category:    Dashboard
Status:      Draft
Options:     3 design variations

📄 Files Generated:
- ✅ /design/web/dashboard/dashboard-v1.0.0.md (Design Document - 1,245 lines)

🖼️ Mockups Generated (Option 1):
- ✅ dashboard-v1.0.0-option1-mockup.png (PNG Visual - High Fidelity)
- ✅ dashboard-v1.0.0-option1-mockup.html (Interactive Prototype - Clickable)
- ✅ dashboard-v1.0.0-option1-mockup.txt (ASCII Wireframe - Structure)
- ✅ dashboard-v1.0.0-option1-mockup.svg (Vector Graphics - Scalable)

🖼️ Mockups Generated (Option 2):
- ✅ dashboard-v1.0.0-option2-mockup.png (PNG Visual - High Fidelity)
- ✅ dashboard-v1.0.0-option2-mockup.html (Interactive Prototype - Clickable)
- ✅ dashboard-v1.0.0-option2-mockup.txt (ASCII Wireframe - Structure)
- ✅ dashboard-v1.0.0-option2-mockup.svg (Vector Graphics - Scalable)

🖼️ Mockups Generated (Option 3):
- ✅ dashboard-v1.0.0-option3-mockup.png (PNG Visual - High Fidelity)
- ✅ dashboard-v1.0.0-option3-mockup.html (Interactive Prototype - Clickable)
- ✅ dashboard-v1.0.0-option3-mockup.txt (ASCII Wireframe - Structure)
- ✅ dashboard-v1.0.0-option3-mockup.svg (Vector Graphics - Scalable)

🔍 Context Used:
- docs/002-prd-v1.2.0.md - Product goals and user needs
- docs/125-design-system-v1.0.0.md - Design system (Inter font, blue/gray palette, 4px spacing)
- docs/300-frontend-v1.0.0.md - React/TypeScript architecture, component patterns
- docs/100-userflows-v1.1.0.md - Admin and analyst personas, dashboard workflow
- docs/350-api-contract-v1.0.0.md - Metrics API, analytics endpoints
- docs/200-atomic-stories-v1.2.0.md - Dashboard feature requirements (Story 215)

🏆 Design Comparison:

Option 1 - Classic Dashboard: 58/70 ★★★★☆
- Accessibility: 9/10 (WCAG AAA, full keyboard nav)
- Usability: 9/10 (Familiar patterns, clear hierarchy)
- Visual Appeal: 7/10 (Professional but conservative)
- Implementation: Easy (Standard components)

Option 2 - Modern Dashboard: 63/70 ★★★★★
- Accessibility: 8/10 (WCAG AA, good keyboard nav)
- Usability: 9/10 (Intuitive, contextual actions)
- Visual Appeal: 9/10 (Contemporary, engaging)
- Implementation: Medium (Enhanced components, animations)

Option 3 - Minimal Dashboard: 54/70 ★★★☆☆
- Accessibility: 8/10 (WCAG AA compliance)
- Usability: 7/10 (Learning curve for unique patterns)
- Visual Appeal: 8/10 (Distinctive, clean)
- Implementation: Hard (Custom components, unique interactions)

💡 Primary Recommendation: Option 2 - Modern Dashboard

**Why This Option:**
Strikes the perfect balance between visual appeal and usability. The card-based layout with micro-interactions creates an engaging experience while maintaining high accessibility standards. Implementation complexity is manageable with existing component library enhancements.

**Key Strengths:**
- Dynamic card-based layout that scales beautifully across devices
- Subtle animations and hover states increase engagement without distraction
- Progressive disclosure keeps interface clean while providing access to detailed data
- Strong design system alignment (uses 95% existing components)

**Implementation Complexity:** Medium
- Requires enhanced Card component with hover animations
- Chart library integration (Recharts or Chart.js)
- Responsive grid system already in place
- Estimated: 3-5 days development + 2 days testing

♿ Accessibility Score: 8/10
- Color contrast: WCAG AA compliance (4.5:1 text, 3:1 UI)
- Keyboard navigation: Full support with visible focus indicators
- Screen reader: Comprehensive ARIA labels on all interactive elements
- Touch targets: 44x44px minimum for mobile, 48x48px on buttons

📱 Responsive Design:
- Mobile (<768px): Single column, stacked cards, collapsible chart
- Tablet (768-1024px): Two-column grid, visible chart, sticky header
- Desktop (>1024px): Four metrics cards, full-width chart, sidebar navigation

⚡ Performance Considerations:
- Image optimization: SVG icons, no raster images needed
- Code splitting: Chart component lazy-loaded below fold
- Bundle size: Estimated +45KB gzipped (chart library)
- Loading states: Skeleton screens for metrics, chart placeholder

🎯 Next Steps:

1. **Review Design Document:**
   Open: /design/web/dashboard/dashboard-v1.0.0.md

2. **Preview Interactive Mockups:**
   Open in browser: /design/web/dashboard/dashboard-v1.0.0-option2-mockup.html
   (Click through to test interactions and responsive behavior)

3. **Validate with Stakeholders:**
   - Share mockups with product team
   - Gather feedback on Option 2 (recommended)
   - Validate accessibility with QA team
   - Confirm performance budget

4. **Create Storybook Stories (if approved):**
   /design-storybook "Dashboard Layout"

5. **Plan Implementation:**
   /design-planning "Dashboard layout integration with existing app structure"

6. **Implement Design (when ready):**
   /design-update-frontend "DashboardLayout" --version v1.0.0 --option 2

✨ Design research "Dashboard Layout" completed! ✨
```

## Important Notes

- **Platform-Specific Patterns**: Web vs mobile have distinct interaction models (hover vs tap)
- **Mockup Variety**: 4 formats ensure all stakeholders can review (visual, interactive, structural, scalable)
- **Version Independence**: Design versions are independent of code versions
- **Context Aggregation**: Always read latest documentation for accurate design constraints
- **Accessibility First**: WCAG AA minimum, AAA preferred for text
- **Performance Budget**: Consider bundle size impact of design choices
- **Design System Alignment**: Prioritize existing components, note when new components needed
- **Responsive Required**: All web designs must specify mobile, tablet, desktop behavior
- **Touch Targets**: 44x44px minimum for mobile, 48x48px recommended for buttons
- **Draft Status**: Draft designs tracked separately from implemented designs
- **Iteration Support**: Version numbers allow design evolution tracking

## Error Handling

**Design Description Missing:**
- Display error: "Please provide a design description"
- Suggest: "/design-research {description}" or "/design-research --draft {description}"
- Example: "/design-research 'User profile page with activity feed'"

**Invalid Platform Flag:**
- Display error: "Invalid platform: {value}. Must be 'web' or 'mobile'"
- Default to 'web' and continue
- Inform user of default choice

**Design System Not Found:**
- Display warning: "Design system (125-design-system-v*.md) not found"
- Suggest: "Run /setup first or create design system manually"
- Continue with generic design system (use common patterns)
- Note limitation in summary

**Frontend Architecture Not Found:**
- Display warning: "Frontend architecture (300-frontend-v*.md) not found"
- Continue with generic frontend patterns
- Note limitation in design document

**PRD Not Found:**
- Display warning: "PRD (002-prd-v*.md) not found"
- Suggest: "Run /setup first to initialize documentation"
- Continue with user-provided design description only
- Note limited context in summary

**Mockup Generation Failed:**
- Complete design document successfully
- Display warning: "Could not generate {format} mockup for option {X}"
- Provide template for manual mockup creation
- List successfully generated mockups

**Design Folder Creation Failed:**
- Display error: "Could not create /design folder structure"
- Check permissions and disk space
- Provide manual folder creation commands
- Exit with error

**Version Detection Failed:**
- Default to v1.0.0 for new design
- Display warning: "Could not detect existing versions, starting with v1.0.0"
- User can manually rename if needed

**Context Document Read Failed:**
- Display warning: "Could not read {document}, proceeding with available context"
- List which documents were successfully read
- Note limited context in design considerations
- Continue with design research

**Write Permission Error:**
- Display error: "Cannot write to {filepath}, check permissions"
- Provide file content for manual creation
- List files that were successfully created
- Suggest permission fix

## Success Criteria

The `/design-research` command is successful when:
1. ✅ Design description parsed and validated
2. ✅ Draft mode and platform flags correctly detected
3. ✅ Design folder structure created or validated
4. ✅ Design category determined (component/page/feature/pattern/dashboard)
5. ✅ Version number determined (existing or new v1.0.0)
6. ✅ Context aggregated from relevant documentation
7. ✅ Design system details extracted (colors, typography, spacing)
8. ✅ API data structure extracted (if applicable)
9. ✅ 2-3 design options generated with distinct approaches
10. ✅ Each option includes accessibility, responsive, and performance considerations
11. ✅ Mockups generated in 4 formats for each option (8-12 total files)
12. ✅ Design document created with comprehensive details
13. ✅ Design comparison matrix completed with scores
14. ✅ Primary recommendation provided with rationale
15. ✅ Implementation guidance included
16. ✅ All files saved in correct location with proper naming
17. ✅ User receives comprehensive summary report
18. ✅ Next steps provided for validation and implementation

## Future Enhancements

### v1.3.1
- AI-powered design critique (analyze existing designs for improvements)
- Design system compliance checker (flag deviations)
- Automated A/B test variant generation
- Export to Figma/Sketch format

### v1.4.0
- User testing simulation (predict usability issues)
- Design performance score (predict Core Web Vitals)
- Accessibility audit automation (WCAG validation)
- Design-to-code accuracy score

### v1.5.0
- Multi-page design research (design entire flows)
- Design system evolution tracker (track pattern changes)
- Design analytics (track which designs are most implemented)
- Integration with analytics data (inform design decisions with usage data)
