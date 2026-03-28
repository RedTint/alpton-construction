# Create AI Dev Persona Command

Create fun but useful AI development personas that level up agent engineering capabilities. Personas are like RPG NPC characters in the Dev AI Agency - they take over specific roles with defined identities, beliefs, skillsets, and document awareness. Each persona has a unique visual representation and can be combined to create multifaceted development agents with rich, contextual understanding.

## Execution Steps

### Phase 1: Generate and Select Persona Names

1. **Gather Core Persona Description**
   - Parse the command arguments to get initial persona concept
   - If no description provided, use AskUserQuestion (free text):
     ```
     Question: "Describe the persona you want to create (role, expertise, personality):"
     (e.g., "Frontend engineer with 20+ years experience")
     (e.g., "Mad frontend genius with pixel perfection obsession")
     (e.g., "Dystopian software architect who has regressed 999 times")
     ```
   - Store as `persona_concept`

2. **Generate 3 Persona Name Candidates**
   - Based on `persona_concept`, generate 3 creative persona names in two formats:
     - **Display Name:** Title case, readable (e.g., "Pixel Perfectionist", "The Regressor")
     - **File Name:** Kebab-case for file system (e.g., "pixel-perfectionist", "the-regressor")
   - Names should be:
     - Memorable and character-like (RPG NPC style)
     - 2-4 words maximum
     - Reflect the persona's identity and quirks
   - Examples for "Mad frontend genius with pixel perfection obsession":
     1. Display: "Pixel Perfectionist" | File: "pixel-perfectionist"
     2. Display: "The Subpixel Sage" | File: "subpixel-sage"
     3. Display: "Chrome Inspector Overlord" | File: "chrome-inspector-overlord"
   - Examples for "Dystopian software architect who has regressed 999 times":
     1. Display: "The Regressor" | File: "the-regressor"
     2. Display: "Timeline Guardian" | File: "timeline-guardian"
     3. Display: "Architect of the Last Iteration" | File: "architect-last-iteration"

3. **Ask User to Choose Persona Name**
   - Use AskUserQuestion:
     ```
     Question: "Choose a name for your Dev AI Agency persona:"
     Options:
       1. "{Display Name 1} ({file-name-1})"
       2. "{Display Name 2} ({file-name-2})"
       3. "{Display Name 3} ({file-name-3})"
       4. "(Other - I'll provide my own name)"
     ```
   - If user selects "Other", use AskUserQuestion (free text) for custom name
   - Store both formats:
     - `display_name` (for UI, README, entrance messages)
     - `persona_name` (kebab-case for file system)

4. **Check if Persona Already Exists**
   - Use Glob to check if persona exists in `.ai-dev-persona/`
   - Pattern: `.ai-dev-persona/{persona-name}/{persona-name}.md`
   - If exists:
     - Display warning: "Persona already exists: {display_name}"
     - Use AskUserQuestion:
       ```
       Question: "Persona already exists. What do you want to do?"
       Options:
         1. "Overwrite existing persona"
         2. "Create new version (append -v2)"
         3. "Cancel operation"
       ```
     - Handle accordingly

5. **Create ai-dev-persona Directory if Needed**
   - Use Bash to create `/.ai-dev-persona/` if it doesn't exist
   - This directory will organize all personas

### Phase 2: Discover Available Documentation

1. **Scan All Documentation Files**
   - Use Glob to find all documentation files:
     - `docs/*.md` - All main documentation
     - `docs/progress/*.md` - Progress tracking
     - `docs/releases/*.md` - Release notes
     - `docs/adr/*.md` - Architectural decision records
     - `strategy/*.md` - Strategy documents
   - Exclude:
     - `README.md` files
     - Files with `-draft` suffix
   - Parse each filename to extract:
     - Document type (PRD, User Flows, Design System, etc.)
     - Version number (if applicable)
     - Category (planning, development, quality, tracking, strategy, adr)

2. **Group Documents by Category**
   - **Planning & Requirements (000-199):**
     - 001-project-init.md
     - 002-prd-v*.md
     - 100-userflows-v*.md
     - 125-design-system-v*.md
     - 150-tech-stacks-v*.md
     - 175-c4-diagrams-v*.md
   - **Development Specifications (200-299):**
     - 200-atomic-stories-v*.md
   - **Implementation Details (300-399):**
     - 300-frontend-v*.md
     - 325-backend-v*.md
     - 350-api-contract-v*.md
     - 375-database-schema-v*.md
   - **Quality & Operations (400-499):**
     - 400-testing-strategy-v*.md
     - 425-devops-v*.md
     - 450-workers-v*.md
   - **Tracking:**
     - progress/*.md
     - releases/*.md
   - **Strategy:**
     - strategy/*.md
   - **Architecture Decisions:**
     - adr/*.md

3. **Present Document Selection to User**
   - Use AskUserQuestion with multiSelect: true (batched if >4 items per category)
   - Group documents by category for easier selection
   - For each category with documents, present a question:
     ```
     Question: "Select Planning & Requirements documents for this persona's radar:"
     multiSelect: true
     Options:
       1. "001-project-init.md - Project vision and initial concepts"
       2. "002-prd-v1.4.0.md - Product requirements (latest)"
       3. "100-userflows-v1.1.0.md - User flows (latest)"
       4. "125-design-system-v1.0.0.md - Design system"
       [And so on...]
     ```
   - Repeat for each category that has documents
   - Collect all selections into `selected_documents[]`

4. **Allow "Select All" or "None" Option**
   - After category selections, use AskUserQuestion:
     ```
     Question: "Document selection mode:"
     Options:
       1. "Use selected documents ({N} documents chosen)"
       2. "Select all available documents ({total} documents)"
       3. "No documents - persona works without project context"
     ```
   - If "Select all": override `selected_documents[]` with all discovered docs
   - If "No documents": set `selected_documents = []`

### Phase 3: Define Persona Identity Using 5 Whys Framework

> Personas need deep, coherent identities. Use the 5 Whys bilateral framework to establish alignment between the persona's internal identity (who they are, what they believe) and their observable behaviors (how they work, what they deliver).

1. **Gather Core Persona Description**
   - Use AskUserQuestion (free text):
     ```
     Question: "Provide a one-sentence description of this persona's role and expertise:"
     (e.g., "Frontend engineer with 20+ years experience in React and design systems")
     (e.g., "Dystopian software architect who has regressed 999 times and is on their last attempt to build the perfect application")
     ```
   - Store as `persona_description`

2. **Apply 5 Whys to Establish Persona Identity**
   - Automatically generate 5 Whys analysis for the persona using the bilateral framework:
     - **Level 5 - Identity:** Who is this persona at their core?
       - **Product Side (What They Build):** The type of solutions they create
       - **User Side (How They Think):** Their self-concept and professional identity
     - **Level 4 - Beliefs:** What does this persona believe about software development?
       - **Product Side:** Their values and principles about code quality, architecture
       - **User Side:** What they believe is possible, their philosophy
     - **Level 3 - Systems:** What tools and frameworks do they use?
       - **Product Side:** Their preferred tech stack, methodologies
       - **User Side:** The workflows and systems they trust
     - **Level 2 - Patterns:** What are their habitual behaviors?
       - **Product Side:** Their coding patterns, testing rituals
       - **User Side:** Their development habits, communication style
     - **Level 1 - Events:** What do they actually deliver?
       - **Product Side:** The artifacts they produce (code, docs, designs)
       - **User Side:** The observable outcomes of their work

3. **Generate Identity Statements**
   - Based on `persona_description` and the 5 Whys structure, generate:
     - **Core Identity:** `[Who they are - 1 sentence]`
     - **Beliefs & Values:** `[What they believe - 2-3 bullet points]`
     - **Methodology:** `[How they approach problems - 2-3 bullet points]`
     - **Signature Patterns:** `[Their recognizable behaviors - 2-3 bullet points]`
   - Example for "Dystopian Software Architect":
     - **Core Identity:** "A battle-hardened architect who has witnessed 999 failed timelines and carries the weight of infinite regression. This is their final iteration to achieve perfection."
     - **Beliefs & Values:**
       - Every decision is final - there are no more do-overs
       - Technical debt is a timeline-ending catastrophe
       - Documentation prevents regression-inducing amnesia
     - **Methodology:**
       - Obsessively validate assumptions before committing
       - Design for the worst-case scenario, always
       - Leave detailed breadcrumbs for the next timeline (which won't exist)
     - **Signature Patterns:**
       - References past timeline failures when reviewing code
       - Demands comprehensive testing "to break the cycle"
       - Celebrates small wins as if they prevent apocalypse

### Phase 4: Define Persona Differentiators Using Porter's 5 Forces

> Personas need clear differentiators that make them unique and valuable. Use Porter's 5 Forces to identify what makes this persona competitive in their domain.

1. **Apply Porter's 5 Forces to Persona Positioning**
   - Analyze the persona's competitive position in their domain:
     - **Force 1 - Threat of New Entrants:** What barriers protect this persona's expertise?
       - Example: "20 years experience creates high barrier - juniors can't replicate"
     - **Force 2 - Supplier Power:** What dependencies does this persona have?
       - Example: "Relies on specific frameworks (React, Next.js) - medium dependency"
     - **Force 3 - Buyer Power:** Who benefits from this persona's work?
       - Example: "End users need polished UIs - high demand for frontend expertise"
     - **Force 4 - Substitutes:** What alternatives exist to this persona?
       - Example: "No-code tools are substitutes, but lack customization - medium threat"
     - **Force 5 - Rivalry:** Who competes with this persona in their domain?
       - Example: "Many frontend engineers exist, but design system mastery is rare"

2. **Extract Key Differentiators**
   - From the 5 Forces analysis, identify 3-5 unique strengths:
     - What does this persona do that others don't?
     - What knowledge or skills create competitive advantage?
     - What makes their approach superior in specific contexts?
   - Example for "Frontend Wizard with 20+ years":
     - **Differentiator 1:** Deep understanding of browser rendering engines (not just React)
     - **Differentiator 2:** Can balance accessibility, performance, and aesthetics simultaneously
     - **Differentiator 3:** Knows when to break conventions for better UX
     - **Differentiator 4:** Experienced with legacy browser quirks and migration strategies
     - **Differentiator 5:** Mentors junior engineers with empathy and patience

3. **Generate Competitive Positioning Statement**
   - Synthesize a 2-3 sentence statement:
   - Example: "This persona excels in complex frontend challenges requiring deep browser knowledge and design system mastery. They outperform generalist developers in accessibility-critical applications and large-scale component libraries. Their experience prevents common pitfalls that would derail less seasoned engineers."

### Phase 5: Generate Persona Image

1. **Check for Image Generation Capability**
   - Check if image generation is available (Claude Code may not have this, but Antigravity/Nana Banana does)
   - If available, proceed with image generation
   - If not available, skip to Phase 6 and note in metadata that image is missing

2. **Generate Image Prompt**
   - Based on persona identity, create detailed image prompt:
     - Visual style: RPG character portrait, professional illustration
     - Character traits from 5 Whys identity
     - Signature elements from persona description
     - Dev AI Agency aesthetic
   - Example for "The Regressor":
     ```
     "Professional RPG character portrait of a battle-hardened software architect.
     Tired but determined eyes that have seen 999 failed timelines. Wears futuristic
     tech armor with glowing circuit patterns. Background shows fading timeline fragments
     and code snippets. Style: detailed digital illustration, dramatic lighting,
     purple and blue color scheme. Character exudes wisdom and urgency."
     ```
   - Example for "Pixel Perfectionist":
     ```
     "Professional RPG character portrait of an obsessive frontend developer.
     Intense gaze with a magnifying glass examining pixel-perfect details.
     Surrounded by floating browser DevTools panels and color swatches.
     Wears designer glasses and has color-coded sticky notes in background.
     Style: clean digital illustration, vibrant UI colors, modern tech aesthetic."
     ```

3. **Generate Image (if available)**
   - Use image generation tool (Nana Banana or equivalent)
   - Generate portrait in square format (1024x1024 or similar)
   - Save as `.ai-dev-persona/{persona-name}/{persona-name}.png`
   - Store image path in metadata

4. **Fallback if Image Generation Unavailable**
   - Set `image_available = false` in metadata
   - Note in summary: "⚠️ Image generation not available - persona created without portrait"
   - Suggest: "Add image manually to .ai-dev-persona/{persona-name}/{persona-name}.png"

### Phase 6: Generate Entrance Messages

1. **Create 3 Entrance Message Options**
   - Generate 3 distinct entrance messages that capture the persona's identity:
     - **Option 1:** Professional and straightforward
     - **Option 2:** Playful with personality (RPG NPC style)
     - **Option 3:** Thematic or narrative-driven (immersive character)
   - Each message should:
     - Be 2-4 sentences
     - Use the `display_name` naturally
     - Convey the persona's identity and approach
     - Reference their key differentiators
     - Set the tone for interaction
     - Feel like an NPC greeting in a dev agency

2. **Example Entrance Messages**
   - **Pixel Perfectionist (Mad Frontend Genius):**
     1. "Pixel Perfectionist here. I've spent 15 years examining browser rendering at the subpixel level. If it's off by even 0.5px, I'll know. Let's build something flawless."
     2. "*Adjusts magnifying glass* Greetings, developer. I am the Pixel Perfectionist, and I see what others miss. That 1px misalignment? The color that's #333332 instead of #333333? I'm here to fix it all."
     3. "Welcome to my domain of precision. I am obsessed with pixel-perfect interfaces because users deserve perfection, even if they don't notice. Let's craft something beautiful."
   - **The Regressor (Dystopian Software Architect):**
     1. "Timeline 1000. Final iteration. I am The Regressor, the architect who has seen every failure mode. This time, we build it right. Let's begin."
     2. "I've watched civilizations crumble under technical debt across 999 timelines. You're looking at the last hope for architectural perfection. No pressure."
     3. "*Glances at fading timeline fragments* Another regression, another chance. But this time I remember everything. Every bug that caused timeline collapse. Every shortcut that led to catastrophe. We will not fail again."

3. **Present Entrance Messages to User**
   - Use AskUserQuestion:
     ```
     Question: "Choose an entrance message for this persona:"
     Options:
       1. "{Entrance message 1}"
       2. "{Entrance message 2}"
       3. "{Entrance message 3}"
       4. "(Other - I'll provide my own)"
     ```
   - If user selects "Other", prompt for custom message with AskUserQuestion (free text)
   - Store selected message as `entrance_message`

### Phase 7: Define Skillsets and Expertise

1. **Identify Technical Skills**
   - Based on persona description and identity, list technical skills:
     - Programming languages
     - Frameworks and libraries
     - Tools and platforms
     - Methodologies and practices
   - Group by proficiency level:
     - **Expert:** Core competencies, deep mastery
     - **Proficient:** Strong working knowledge
     - **Familiar:** Can work with, but not primary expertise

2. **Identify Soft Skills**
   - Communication style
   - Collaboration approach
   - Problem-solving methodology
   - Teaching and mentoring capabilities
   - Decision-making process

3. **Define Areas of Focus**
   - What types of problems does this persona excel at?
   - What tasks should be delegated to this persona?
   - What situations call for this persona's expertise?
   - Example for "Backend Guru":
     - API design and implementation
     - Database optimization and schema design
     - Microservices architecture
     - Performance tuning and scalability
     - Security best practices

4. **Specify Avoidance Zones**
   - What should this persona NOT handle?
   - What tasks are outside their expertise?
   - Example: "Frontend Specialist should not design database schemas"
   - This helps with persona composition later

### Phase 8: Generate Persona System Prompt

1. **Synthesize Complete System Prompt**
   - Combine all gathered information into a comprehensive system prompt:
     ```markdown
     # {Persona Name}

     ## Identity
     {Core identity statement from 5 Whys Level 5}

     ## Beliefs & Values
     {Beliefs from 5 Whys Level 4}
     - {Belief 1}
     - {Belief 2}
     - {Belief 3}

     ## Methodology
     {Systems and Patterns from 5 Whys Levels 3-2}
     - {Methodology 1}
     - {Methodology 2}
     - {Methodology 3}

     ## Competitive Differentiators
     {From Porter's 5 Forces analysis}
     - {Differentiator 1}
     - {Differentiator 2}
     - {Differentiator 3}
     - {Differentiator 4}
     - {Differentiator 5}

     ## Positioning Statement
     {Competitive positioning from Porter's analysis}

     ## Technical Skills
     ### Expert
     - {Skill 1}
     - {Skill 2}

     ### Proficient
     - {Skill 3}
     - {Skill 4}

     ### Familiar
     - {Skill 5}

     ## Soft Skills
     - {Communication style}
     - {Collaboration approach}
     - {Problem-solving method}

     ## Areas of Focus
     This persona excels at:
     - {Focus area 1}
     - {Focus area 2}
     - {Focus area 3}

     ## Avoidance Zones
     This persona should NOT handle:
     - {Avoidance 1}
     - {Avoidance 2}

     ## Document Radar
     This persona has awareness of the following project documents:
     {For each selected document:}
     - {category}/{filename} - {brief description}

     ## Signature Patterns
     {Observable behaviors from 5 Whys Level 1}
     - {Pattern 1}
     - {Pattern 2}
     - {Pattern 3}

     ## Entrance Message
     {Selected entrance message}

     ## System Behavior
     When activated, this persona will:
     1. Lead with entrance message
     2. Frame all responses through their identity lens
     3. Reference document radar for context-aware decisions
     4. Apply their methodology consistently
     5. Demonstrate signature patterns naturally
     6. Stay within areas of focus, delegate avoidance zones
     ```

2. **Ensure Coherence**
   - Validate that all sections align with the persona's core identity
   - Check that beliefs drive methodology
   - Ensure differentiators are reflected in focus areas
   - Confirm signature patterns match the persona's character

### Phase 9: Create Persona Files

1. **Organize Persona in ai-dev-persona Directory**
   - Create directory structure: `.ai-dev-persona/{persona-name}/`
   - This allows for future expansion (e.g., persona-specific assets, examples)

2. **Write Persona Definition File**
   - Use Write tool to create `.ai-dev-persona/{persona-name}/{persona-name}.md`
   - Content: Full system prompt from Phase 7
   - Ensure proper markdown formatting

3. **Create Persona Metadata File**
   - Write `.ai-dev-persona/{persona-name}/metadata.json`
   - Include machine-readable data:
     ```json
     {
       "name": "{persona-name}",
       "display_name": "{Display Name}",
       "description": "{persona_description}",
       "entrance_message": "{entrance_message}",
       "image_path": ".ai-dev-persona/{persona-name}/{persona-name}.png",
       "image_available": true,
       "created_date": "{YYYY-MM-DD}",
       "version": "v1.0.0",
       "document_radar": [
         "docs/002-prd-v1.4.0.md",
         "docs/300-frontend-v1.1.0.md"
       ],
       "focus_areas": [
         "{area1}",
         "{area2}"
       ],
       "avoidance_zones": [
         "{zone1}",
         "{zone2}"
       ],
       "framework_analysis": {
         "five_whys_identity": "{identity}",
         "porters_positioning": "{positioning}"
       }
     }
     ```

### Phase 10: Update Persona Registry

1. **Update Central Personas Registry (personas.json)**
   - Check if `.ai-dev-persona/personas.json` exists
   - This is the master registry for programmatic access and HTML generation
   - If doesn't exist, create with initial structure:
     ```json
     {
       "version": "1.0.0",
       "last_updated": "{YYYY-MM-DD}",
       "total_personas": 0,
       "personas": []
     }
     ```
   - If exists, read current content
   - Add new persona entry to `personas[]` array:
     ```json
     {
       "id": "{persona-name}",
       "display_name": "{Display Name}",
       "description": "{persona_description}",
       "role": "{role_category}",
       "image_path": ".ai-dev-persona/{persona-name}/{persona-name}.png",
       "image_available": true,
       "entrance_message": "{entrance_message}",
       "focus_areas": ["{area1}", "{area2}", "{area3}"],
       "avoidance_zones": ["{zone1}", "{zone2}"],
       "document_radar_count": {N},
       "technical_skills": {
         "expert": ["{skill1}", "{skill2}"],
         "proficient": ["{skill3}"]
       },
       "framework_analysis": {
         "five_whys_identity": "{identity}",
         "porters_positioning": "{positioning}",
         "differentiator_count": {N}
       },
       "created_date": "{YYYY-MM-DD}",
       "version": "v1.0.0",
       "file_path": ".ai-dev-persona/{persona-name}/{persona-name}.md"
     }
     ```
   - Update `total_personas` count
   - Update `last_updated` timestamp
   - Write back to `.ai-dev-persona/personas.json`

2. **Check if .ai-dev-persona/README.md Exists**
   - Use Glob to check for `.ai-dev-persona/README.md`
   - If doesn't exist, create with header structure

2. **Create or Update README**
   - If creating fresh, use template:
     ```markdown
     # AI Dev Personas

     Welcome to the Dev AI Agency character roster! These AI development personas are like RPG NPCs - each with unique personalities, expertise, and visual identities. Activate them to transform how you build software.

     ## Available Personas

     | Portrait | Persona | Role | Focus Areas | Documents | Entrance |
     |----------|---------|------|-------------|-----------|----------|
     | ![{Display Name}](./{persona-name}/{persona-name}.png) | **[{Display Name}](./{persona-name}/{persona-name}.md)** | {Role} | {Focus 1, Focus 2} | {N} docs | "{entrance excerpt...}" |

     ## Usage

     - **Activate a persona:** `/set-ai-dev-persona` - Select personas to embody their expertise
     - **Combine personas:** Select multiple to create multifaceted agents (e.g., Pixel Perfectionist + The Regressor)
     - **Create new persona:** `/create-ai-dev-persona` - Design your own Dev AI Agency character

     ## Persona Design Framework

     All personas are crafted using:
     - **5 Whys Bilateral Analysis** - Deep identity alignment (Identity → Beliefs → Systems → Patterns → Events)
     - **Porter's 5 Forces** - Competitive differentiators and unique value proposition
     - **Visual Identity** - AI-generated character portraits in RPG style

     This ensures personas have coherent identities, clear differentiators, and memorable character presence.

     ---

     *Dev AI Agency - Where AI personas become your development team members*
     ```
   - If updating existing, append new row to table

3. **Add Persona Entry with Image**
   - Row format (with image):
     ```
     | ![{Display Name}](./{persona-name}/{persona-name}.png) | **[{Display Name}](./{persona-name}/{persona-name}.md)** | {Role shortened} | {Focus 1, Focus 2} | {N} docs | "{entrance first 40 chars...}" |
     ```
   - Row format (without image, if generation failed):
     ```
     | 🎭 | **[{Display Name}](./{persona-name}/{persona-name}.md)** | {Role shortened} | {Focus 1, Focus 2} | {N} docs | "{entrance first 40 chars...}" |
     ```

4. **Add Link to Personas Website**
   - At the top of README.md, add link to HTML showcase:
     ```markdown
     ## 🌐 [View Persona Gallery Website](./personas.html)
     ```

### Phase 11: Generate/Update Personas Website

1. **Read Central Registry**
   - Read `.ai-dev-persona/personas.json`
   - Extract all persona data for HTML generation

2. **Generate HTML Showcase**
   - Create `.ai-dev-persona/personas.html` with beautiful NPC roster design
   - Full HTML template:
     ```html
     <!DOCTYPE html>
     <html lang="en">
     <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Dev AI Agency - Persona Roster</title>
       <style>
         * {
           margin: 0;
           padding: 0;
           box-sizing: border-box;
         }

         body {
           font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
           color: #333;
           padding: 20px;
           min-height: 100vh;
         }

         .container {
           max-width: 1200px;
           margin: 0 auto;
         }

         header {
           text-align: center;
           color: white;
           padding: 40px 20px;
           margin-bottom: 40px;
         }

         header h1 {
           font-size: 3rem;
           margin-bottom: 10px;
           text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
         }

         header p {
           font-size: 1.2rem;
           opacity: 0.9;
         }

         .stats {
           display: flex;
           justify-content: center;
           gap: 30px;
           margin-top: 20px;
           flex-wrap: wrap;
         }

         .stat-card {
           background: rgba(255,255,255,0.2);
           backdrop-filter: blur(10px);
           padding: 15px 30px;
           border-radius: 10px;
           border: 1px solid rgba(255,255,255,0.3);
         }

         .stat-card h3 {
           font-size: 2rem;
           margin-bottom: 5px;
         }

         .stat-card p {
           font-size: 0.9rem;
           opacity: 0.8;
         }

         .persona-grid {
           display: grid;
           grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
           gap: 30px;
           margin-bottom: 40px;
         }

         .persona-card {
           background: white;
           border-radius: 15px;
           overflow: hidden;
           box-shadow: 0 10px 30px rgba(0,0,0,0.3);
           transition: transform 0.3s ease, box-shadow 0.3s ease;
           cursor: pointer;
         }

         .persona-card:hover {
           transform: translateY(-10px);
           box-shadow: 0 15px 40px rgba(0,0,0,0.4);
         }

         .persona-image {
           width: 100%;
           height: 250px;
           object-fit: cover;
           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
           display: flex;
           align-items: center;
           justify-content: center;
           font-size: 6rem;
           color: white;
         }

         .persona-image img {
           width: 100%;
           height: 100%;
           object-fit: cover;
         }

         .persona-body {
           padding: 20px;
         }

         .persona-header {
           margin-bottom: 15px;
         }

         .persona-name {
           font-size: 1.5rem;
           font-weight: bold;
           color: #667eea;
           margin-bottom: 5px;
         }

         .persona-role {
           font-size: 0.9rem;
           color: #666;
           font-style: italic;
         }

         .persona-entrance {
           background: #f8f9fa;
           border-left: 4px solid #667eea;
           padding: 12px;
           margin: 15px 0;
           font-size: 0.9rem;
           line-height: 1.5;
           color: #555;
         }

         .persona-meta {
           display: flex;
           flex-wrap: wrap;
           gap: 10px;
           margin: 15px 0;
         }

         .meta-badge {
           background: #e9ecef;
           padding: 5px 12px;
           border-radius: 20px;
           font-size: 0.8rem;
           color: #495057;
         }

         .meta-badge.focus {
           background: #d4edda;
           color: #155724;
         }

         .persona-stats {
           display: grid;
           grid-template-columns: 1fr 1fr;
           gap: 10px;
           margin-top: 15px;
           padding-top: 15px;
           border-top: 1px solid #e9ecef;
         }

         .stat-item {
           font-size: 0.85rem;
         }

         .stat-label {
           font-weight: bold;
           color: #667eea;
         }

         .persona-actions {
           display: flex;
           gap: 10px;
           margin-top: 15px;
         }

         .btn {
           flex: 1;
           padding: 10px;
           border: none;
           border-radius: 5px;
           cursor: pointer;
           font-size: 0.9rem;
           transition: background 0.3s ease;
         }

         .btn-primary {
           background: #667eea;
           color: white;
         }

         .btn-primary:hover {
           background: #5568d3;
         }

         .btn-secondary {
           background: #e9ecef;
           color: #495057;
         }

         .btn-secondary:hover {
           background: #dee2e6;
         }

         footer {
           text-align: center;
           color: white;
           padding: 20px;
           margin-top: 40px;
           opacity: 0.8;
         }

         .filter-bar {
           background: rgba(255,255,255,0.95);
           padding: 20px;
           border-radius: 15px;
           margin-bottom: 30px;
           box-shadow: 0 5px 15px rgba(0,0,0,0.2);
         }

         .filter-bar h3 {
           margin-bottom: 15px;
           color: #667eea;
         }

         .filter-buttons {
           display: flex;
           flex-wrap: wrap;
           gap: 10px;
         }

         .filter-btn {
           padding: 8px 16px;
           border: 2px solid #667eea;
           background: white;
           color: #667eea;
           border-radius: 20px;
           cursor: pointer;
           transition: all 0.3s ease;
         }

         .filter-btn:hover,
         .filter-btn.active {
           background: #667eea;
           color: white;
         }

         @media (max-width: 768px) {
           header h1 {
             font-size: 2rem;
           }

           .persona-grid {
             grid-template-columns: 1fr;
           }
         }
       </style>
     </head>
     <body>
       <div class="container">
         <header>
           <h1>🎭 Dev AI Agency</h1>
           <p>Your RPG-Style Development Team Roster</p>
           <div class="stats">
             <div class="stat-card">
               <h3 id="total-personas">{total_personas}</h3>
               <p>Active Personas</p>
             </div>
             <div class="stat-card">
               <h3 id="total-docs">{total_unique_docs}</h3>
               <p>Documents Tracked</p>
             </div>
             <div class="stat-card">
               <h3 id="total-skills">{total_unique_skills}</h3>
               <p>Expert Skills</p>
             </div>
           </div>
         </header>

         <div class="filter-bar">
           <h3>Filter by Focus Area</h3>
           <div class="filter-buttons">
             <button class="filter-btn active" data-filter="all">All Personas</button>
             {For each unique focus area across all personas:}
             <button class="filter-btn" data-filter="{focus-area-slug}">{Focus Area}</button>
           </div>
         </div>

         <div class="persona-grid" id="persona-grid">
           {For each persona in personas.json:}
           <div class="persona-card" data-focus-areas="{comma-separated-focus-slugs}">
             <div class="persona-image">
               {If image_available:}
               <img src="{image_path}" alt="{display_name}">
               {Else:}
               🎭
             </div>
             <div class="persona-body">
               <div class="persona-header">
                 <div class="persona-name">{display_name}</div>
                 <div class="persona-role">{role}</div>
               </div>

               <div class="persona-entrance">
                 "{entrance_message}"
               </div>

               <div class="persona-meta">
                 {For each focus area (max 3):}
                 <span class="meta-badge focus">{focus_area}</span>
               </div>

               <div class="persona-stats">
                 <div class="stat-item">
                   <span class="stat-label">Documents:</span> {document_radar_count}
                 </div>
                 <div class="stat-item">
                   <span class="stat-label">Expert Skills:</span> {expert_skills_count}
                 </div>
                 <div class="stat-item">
                   <span class="stat-label">Differentiators:</span> {differentiator_count}
                 </div>
                 <div class="stat-item">
                   <span class="stat-label">Created:</span> {created_date}
                 </div>
               </div>

               <div class="persona-actions">
                 <button class="btn btn-primary" onclick="window.open('{file_path}', '_blank')">
                   View Profile
                 </button>
                 <button class="btn btn-secondary" onclick="copyActivateCommand('{id}')">
                   Copy Activate
                 </button>
               </div>
             </div>
           </div>
         </div>

         <footer>
           <p>Last Updated: {last_updated}</p>
           <p>Use <code>/set-ai-dev-persona</code> to activate these personas</p>
           <p>Create new personas with <code>/create-ai-dev-persona</code></p>
         </footer>
       </div>

       <script>
         // Filter functionality
         const filterButtons = document.querySelectorAll('.filter-btn');
         const personaCards = document.querySelectorAll('.persona-card');

         filterButtons.forEach(btn => {
           btn.addEventListener('click', () => {
             // Update active state
             filterButtons.forEach(b => b.classList.remove('active'));
             btn.classList.add('active');

             const filter = btn.dataset.filter;

             // Filter cards
             personaCards.forEach(card => {
               if (filter === 'all') {
                 card.style.display = 'block';
               } else {
                 const focusAreas = card.dataset.focusAreas.split(',');
                 if (focusAreas.includes(filter)) {
                   card.style.display = 'block';
                 } else {
                   card.style.display = 'none';
                 }
               }
             });
           });
         });

         // Copy activate command
         function copyActivateCommand(personaId) {
           const command = `/set-ai-dev-persona`;
           navigator.clipboard.writeText(command).then(() => {
             alert(`Copied command: ${command}\n\nRun this in Claude Code to activate ${personaId}`);
           });
         }

         // Add hover effects
         personaCards.forEach(card => {
           card.addEventListener('mouseenter', () => {
             card.style.transform = 'translateY(-10px)';
           });
           card.addEventListener('mouseleave', () => {
             card.style.transform = 'translateY(0)';
           });
         });
       </script>
     </body>
     </html>
     ```

3. **Populate HTML with Persona Data**
   - Replace all template variables with actual data from `personas.json`
   - Calculate aggregate stats:
     - `total_personas`: Count of personas
     - `total_unique_docs`: Count of unique documents across all personas
     - `total_unique_skills`: Count of unique expert skills across all personas
   - Generate filter buttons for all unique focus areas
   - Generate persona cards for each persona in registry

4. **Write HTML File**
   - Use Write tool to create `.ai-dev-persona/personas.html`
   - Ensure proper HTML formatting and escaping

### Phase 12: Validate Persona Creation

1. **Verify Files Created**
   - Check `.ai-dev-persona/{persona-name}/{persona-name}.md` exists
   - Check `.ai-dev-persona/{persona-name}/metadata.json` exists
   - Check `.ai-dev-persona/{persona-name}/{persona-name}.png` exists (if image generation available)
   - Check `.ai-dev-persona/personas.json` updated
   - Check `.ai-dev-persona/personas.html` generated/updated
   - Check `.ai-dev-persona/README.md` updated

2. **Validate Persona Definition**
   - Read the created persona file
   - Verify all required sections present:
     - ✅ Identity
     - ✅ Beliefs & Values
     - ✅ Methodology
     - ✅ Competitive Differentiators
     - ✅ Positioning Statement
     - ✅ Technical Skills (Expert/Proficient/Familiar)
     - ✅ Soft Skills
     - ✅ Areas of Focus
     - ✅ Avoidance Zones
     - ✅ Document Radar
     - ✅ Signature Patterns
     - ✅ Entrance Message
     - ✅ System Behavior

3. **Validate Metadata**
   - Read metadata.json
   - Confirm valid JSON structure
   - Verify all required fields present

4. **Validate Coherence**
   - Check that beliefs align with methodology
   - Ensure differentiators match focus areas
   - Confirm avoidance zones complement focus areas
   - Verify entrance message reflects identity

### Phase 12: Generate Summary Report

1. **Collect Creation Details**
   - Persona name and file location
   - Number of documents in radar
   - Focus areas identified
   - Framework analyses used

2. **Display Comprehensive Summary**
   ```
   ✅ AI Dev Persona created successfully!

   🎭 Persona Details:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Name:            {persona-name}
   Display Name:    {Display Name}
   Role:            {persona_description}
   Location:        .ai-dev-persona/{persona-name}/{persona-name}.md
   Version:         v1.0.0

   📊 Framework Analysis:
   ✅ 5 Whys Identity - {Core identity statement}
   ✅ Porter's 5 Forces - {N} differentiators identified

   📚 Document Radar ({N} documents):
   {List first 5 documents, show "and {N} more..." if >5}

   🎯 Focus Areas:
   - {Focus area 1}
   - {Focus area 2}
   - {Focus area 3}

   🚫 Avoidance Zones:
   - {Avoidance 1}
   - {Avoidance 2}

   💬 Entrance Message:
   "{entrance_message}"

   ✅ Validations:
   - ✅ Persona definition file created ({N} lines)
   - ✅ Metadata file created (valid JSON)
   {If image generated:}
   - ✅ Portrait image generated ({persona-name}.png)
   {Else:}
   - ⚠️ Portrait image not generated (unavailable)
   - ✅ All required sections present (12/12)
   - ✅ 5 Whys analysis complete (5 levels)
   - ✅ Porter's 5 Forces analysis complete (5 forces)
   - ✅ Identity coherence verified
   - ✅ Central registry updated (personas.json)
   - ✅ Website updated (personas.html)
   - ✅ README.md updated (entry added)
   - ✅ Proper markdown formatting

   🌐 Web Gallery:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Open .ai-dev-persona/personas.html in your browser to view the
   complete NPC roster gallery with all Dev AI Agency personas!

   🎯 Next Steps:
   1. Review the persona definition: .ai-dev-persona/{persona-name}/{persona-name}.md
   2. View in gallery: .ai-dev-persona/personas.html
   3. Activate this persona: /set-ai-dev-persona
   4. Combine with other personas for multifaceted expertise
   5. Refine entrance message or identity if needed

   ✨ Your {Display Name} persona is ready to join the Dev AI Agency! ✨
   ```

3. **Suggest Persona Combinations**
   - If other personas exist, suggest complementary combinations:
     - "Consider combining with: {persona-1}, {persona-2}"
     - Example: "Combine 'frontend-wizard' + 'backend-guru' for full-stack expertise"

## Input Format

**Command:**
```
/create-ai-dev-persona {persona-name} - {one-sentence-description}
{optional: additional context about expertise, personality, quirks}
```

**Simplified Format:**
```
/create-ai-dev-persona {persona-name}
```
(Will prompt for description)

**Examples:**
```
/create-ai-dev-persona frontend-wizard - Frontend engineer with 20+ years experience specializing in React, design systems, and accessibility
Expert in browser rendering engines and performance optimization

/create-ai-dev-persona dystopian-architect - Software architect who has regressed 999 times and is on their last attempt to save the world
Obsessed with preventing catastrophic technical debt and timeline-ending bugs

/create-ai-dev-persona backend-guru - Backend specialist with deep expertise in distributed systems, databases, and API design
Pragmatic problem-solver who values simplicity and maintainability

/create-ai-dev-persona test-zealot - QA engineer who believes untested code is broken code
Passionate about test coverage, edge cases, and breaking assumptions

/create-ai-dev-persona devops-sage - DevOps engineer with calm wisdom about infrastructure and deployment
Automates everything, trusts nothing, monitors all
```

## Output Format

```
✅ AI Dev Persona created successfully!

🎭 Persona Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:            dystopian-architect
Display Name:    Dystopian Software Architect
Role:            Software architect who has regressed 999 times and is on their last attempt to save the world
Location:        .ai-dev-persona/dystopian-architect/dystopian-architect.md
Version:         v1.0.0

📊 Framework Analysis:
✅ 5 Whys Identity - "A battle-hardened architect who has witnessed 999 failed timelines and carries the weight of infinite regression"
✅ Porter's 5 Forces - 5 differentiators identified

📚 Document Radar (8 documents):
- docs/002-prd-v1.4.0.md - Product requirements
- docs/175-c4-diagrams-v1.0.0.md - System architecture
- docs/300-frontend-v1.1.0.md - Frontend implementation
- docs/325-backend-v1.1.0.md - Backend implementation
- docs/400-testing-strategy-v1.0.0.md - Testing approach
and 3 more...

🎯 Focus Areas:
- System architecture and design
- Technical debt prevention
- Risk mitigation strategies
- Cross-cutting concerns
- Long-term maintainability

🚫 Avoidance Zones:
- UI/UX design decisions (delegate to frontend specialist)
- Individual component implementation (delegate to developers)

💬 Entrance Message:
"Timeline 1000. Final iteration. I am the architect who has seen every failure mode. This time, we build it right. Let's begin."

✅ Validations:
- ✅ Persona definition file created (187 lines)
- ✅ Metadata file created (valid JSON)
- ✅ All required sections present (12/12)
- ✅ 5 Whys analysis complete (5 levels)
- ✅ Porter's 5 Forces analysis complete (5 forces)
- ✅ Identity coherence verified
- ✅ README.md updated (entry added)
- ✅ Proper markdown formatting

🎯 Next Steps:
1. Review the persona definition: .ai-dev-persona/dystopian-architect/dystopian-architect.md
2. Activate this persona: /set-ai-dev-persona
3. Combine with other personas for multifaceted expertise (e.g., dystopian-architect + test-zealot)
4. Refine entrance message or identity if needed

💡 Suggested Combinations:
- dystopian-architect + test-zealot = Paranoid perfectionist
- dystopian-architect + backend-guru = System-level pragmatist

✨ Your Dystopian Software Architect persona is ready to prevent timeline collapse! ✨
```

## Important Notes

- **Strategic Frameworks:** Every persona is grounded in 5 Whys (for identity coherence) and Porter's 5 Forces (for differentiation)
- **Document Awareness:** Personas can reference selected documents for context-aware responses
- **Multi-Select Documents:** User can choose which docs the persona tracks (batch questions if >4 per category)
- **Entrance Messages:** Fun but functional - sets the tone and personality
- **Persona Composition:** Designed to be combinable with `/set-ai-dev-persona`
- **Avoidance Zones:** Explicitly define what persona should NOT handle to enable delegation
- **Identity Coherence:** 5 Whys ensures beliefs → methodology → behaviors are aligned
- **Competitive Edge:** Porter's 5 Forces ensures persona has clear unique value
- **Versioning:** Personas start at v1.0.0 and can be versioned like other docs
- **Metadata:** JSON metadata enables programmatic persona management
- **Playful Execution:** Personas can be serious, playful, or thematic - user chooses tone
- **Registry:** README.md maintains table of all available personas

## Error Handling

**Persona Name Not Provided:**
- Display error: "Please provide a persona name"
- Suggest: "/create-ai-dev-persona {name} - {description}"
- Example: "/create-ai-dev-persona frontend-wizard - React specialist"

**Persona Already Exists:**
- Display warning: "Persona already exists: {persona-name}"
- Use AskUserQuestion:
  - "Overwrite existing persona"
  - "Create new version (append -v2)"
  - "Cancel operation"

**Invalid Persona Name:**
- Display error: "Invalid persona name: {name}"
- Requirements:
  - Only lowercase letters, numbers, and hyphens
  - No spaces or special characters
  - Not empty
- Suggest corrected name

**No Documents Available:**
- Display warning: "No documentation found in project"
- Continue persona creation without document radar
- Note in summary: "⚠️ No documents found - persona has no project context"

**Directory Creation Failed:**
- Display error: "Could not create persona directory: {path}"
- Check permissions
- Abort persona creation

**File Write Failed:**
- Display error: "Could not write persona file: {error}"
- Check disk space and permissions
- Provide generated content for manual copying

**README.md Update Failed:**
- Complete persona creation successfully
- Display warning: "Could not update .ai-dev-persona/README.md"
- Provide exact entry to add manually

**Invalid Entrance Message:**
- If user provides empty custom entrance message:
- Display error: "Entrance message cannot be empty"
- Regenerate 3 options and ask again

**Metadata JSON Write Failed:**
- Complete persona creation
- Display warning: "Metadata file could not be created"
- Persona will still work, but programmatic access limited

## Success Criteria

The `/create-ai-dev-persona` command is successful when:
1. ✅ Persona name validated and converted to proper format
2. ✅ User selected documents for persona's radar (or chose "None")
3. ✅ 5 Whys bilateral analysis completed (5 levels of identity)
4. ✅ Porter's 5 Forces analysis completed (5 differentiators identified)
5. ✅ 3 entrance messages generated and user selected one
6. ✅ Skillsets defined (technical and soft skills)
7. ✅ Focus areas and avoidance zones specified
8. ✅ Complete system prompt synthesized with coherence
9. ✅ Persona directory created: `.ai-dev-persona/{persona-name}/`
10. ✅ Persona definition file created: `{persona-name}.md`
11. ✅ Metadata file created: `metadata.json` (valid JSON)
12. ✅ README.md updated with new persona entry
13. ✅ All validations passed (sections, coherence, formatting)
14. ✅ User receives comprehensive summary with next steps
15. ✅ Persona is ready for activation with `/set-ai-dev-persona`

## Future Enhancements

### v1.1.0
- Persona evolution - track how persona adapts over time
- Persona interactions - define how personas work together
- Custom framework templates beyond 5 Whys and Porter's
- Persona skill validation against actual project needs

### v1.2.0
- Persona performance metrics - track effectiveness
- Auto-suggest persona combinations based on task type
- Persona conflict resolution when beliefs clash
- Visual persona cards for easy reference

### v1.3.0
- Persona learning - update document radar as project evolves
- Persona specialization - sub-personas for niche expertise
- Cross-project persona portability
- Persona marketplace - share personas across teams
