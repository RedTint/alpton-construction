---
description: Create RPG-style AI dev personas with 5 Whys identity, Porter's 5 Forces differentiation, and visual portraits
---

1. Gather Persona Concept
   // Manual Input: Provide persona description
   // Example: "Mad frontend genius with pixel perfection obsession"
   // Example: "Dystopian software architect who has regressed 999 times"

   Prompt user to describe the persona (role, expertise, personality)
   Store as persona_concept variable

2. Generate Persona Names
   Based on the persona concept, generate 3 creative persona name options:
   - Display Name (Title case, RPG-style)
   - File Name (kebab-case)

   Examples:
   - "Pixel Perfectionist" → "pixel-perfectionist"
   - "The Regressor" → "the-regressor"
   - "Timeline Guardian" → "timeline-guardian"

   // Manual Input: User selects name or provides custom name
   Store selected display_name and persona_name (kebab-case)

3. Check for Existing Persona
   // turbo
   Find files matching: ai-dev-persona/{persona_name}/{persona_name}.md

   If persona exists:
   - Warn user
   - Options: Overwrite, create v2, or cancel

   Create directory if needed:
   mkdir -p ai-dev-persona/{persona_name}

4. Discover Project Documentation
   // turbo
   Find all documentation files:
   - docs/*.md
   - docs/progress/*.md
   - docs/releases/*.md
   - docs/adr/*.md
   - strategy/*.md

   Exclude files with "-draft" suffix
   Exclude README.md files

   Group by category:
   - Planning & Requirements (000-199)
   - Development Specifications (200-299)
   - Implementation Details (300-399)
   - Quality & Operations (400-499)
   - Tracking (progress/, releases/)
   - Strategy (strategy/)
   - Architecture Decisions (adr/)

5. Select Document Radar
   // Manual Input: User selects which documents this persona should track

   Present documents grouped by category
   User can select multiple documents (or select all, or select none)
   Store selected documents in selected_documents array

6. Apply 5 Whys Framework for Identity
   Generate 5 Whys bilateral analysis for persona identity:

   Level 5 - Identity (Who they are):
   - Product Side: Type of solutions they create
   - User Side: Their self-concept and professional identity

   Level 4 - Beliefs (What they believe):
   - Product Side: Values about code quality, architecture
   - User Side: Philosophy about what's possible

   Level 3 - Systems (Tools they use):
   - Product Side: Preferred tech stack, methodologies
   - User Side: Workflows and systems they trust

   Level 2 - Patterns (Habitual behaviors):
   - Product Side: Coding patterns, testing rituals
   - User Side: Development habits, communication style

   Level 1 - Events (What they deliver):
   - Product Side: Artifacts they produce
   - User Side: Observable outcomes

   Generate identity statements:
   - Core Identity (1 sentence)
   - Beliefs & Values (2-3 bullets)
   - Methodology (2-3 bullets)
   - Signature Patterns (2-3 bullets)

7. Apply Porter's 5 Forces for Differentiation
   Analyze persona's competitive position:

   Force 1 - Threat of New Entrants:
   What barriers protect this persona's expertise?

   Force 2 - Supplier Power:
   What dependencies does this persona have?

   Force 3 - Buyer Power:
   Who benefits from this persona's work?

   Force 4 - Substitutes:
   What alternatives exist to this persona?

   Force 5 - Rivalry:
   Who competes in their domain?

   Extract 3-5 key differentiators:
   - What does this persona do that others don't?
   - What knowledge creates competitive advantage?

   Generate competitive positioning statement (2-3 sentences)

8. Generate Persona Image (Optional)
   // Note: Image generation depends on environment capabilities
   // Antigravity/Nana Banana may support this

   If image generation available:
   Create detailed image prompt based on persona identity:
   - Visual style: RPG character portrait, professional illustration
   - Character traits from 5 Whys identity
   - Signature elements from description
   - Dev AI Agency aesthetic

   Generate portrait in square format (1024x1024)
   Save as: ai-dev-persona/{persona_name}/{persona_name}.png

   If image generation unavailable:
   Set image_available = false in metadata
   Note: Can add image manually later

9. Create Entrance Messages
   Generate 3 entrance message options:
   - Option 1: Professional and straightforward
   - Option 2: Playful with personality (RPG NPC style)
   - Option 3: Thematic or narrative-driven

   Each message should:
   - Be 2-4 sentences
   - Use display_name naturally
   - Convey persona's identity
   - Reference key differentiators
   - Feel like NPC greeting in dev agency

   // Manual Input: User selects entrance message or provides custom
   Store selected entrance_message

10. Define Skillsets and Expertise
    Identify technical skills based on persona description:

    Expert level:
    - Core competencies, deep mastery

    Proficient level:
    - Strong working knowledge

    Familiar level:
    - Can work with, but not primary

    Identify soft skills:
    - Communication style
    - Collaboration approach
    - Problem-solving methodology

    Define focus areas:
    - What problems does this persona excel at?
    - What tasks should be delegated to them?

    Specify avoidance zones:
    - What should this persona NOT handle?
    - What's outside their expertise?

11. Generate Complete Persona System Prompt
    Create comprehensive system prompt combining all elements:

    Structure:
    - Identity (from 5 Whys Level 5)
    - Beliefs & Values (from 5 Whys Level 4)
    - Methodology (from 5 Whys Levels 3-2)
    - Competitive Differentiators (from Porter's 5 Forces)
    - Positioning Statement
    - Technical Skills (Expert/Proficient/Familiar)
    - Soft Skills
    - Areas of Focus
    - Avoidance Zones
    - Document Radar
    - Signature Patterns (from 5 Whys Level 1)
    - Entrance Message
    - System Behavior instructions

    Ensure coherence across all sections

12. Create Persona Files
    Write persona definition file:
    ai-dev-persona/{persona_name}/{persona_name}.md
    Content: Full system prompt from step 11

    Write metadata file:
    ai-dev-persona/{persona_name}/metadata.json
    Content: Machine-readable data including:
    - name, display_name, description
    - entrance_message
    - image_path, image_available
    - created_date, version (v1.0.0)
    - document_radar array
    - focus_areas, avoidance_zones
    - technical_skills
    - framework_analysis (5 Whys identity, Porter's positioning)

13. Update Central Registry
    Read or create: ai-dev-persona/personas.json

    If doesn't exist, create with structure:
    {
      "version": "1.0.0",
      "last_updated": "YYYY-MM-DD",
      "total_personas": 0,
      "personas": []
    }

    Add new persona entry to personas array
    Update total_personas count
    Update last_updated timestamp

    Write back to personas.json

14. Update README.md
    Read or create: ai-dev-persona/README.md

    If creating fresh, use template with:
    - Header explaining Dev AI Agency persona roster
    - Table with columns: Portrait, Persona, Role, Focus Areas, Documents, Entrance
    - Usage instructions
    - Persona design framework explanation

    Add new persona row to table:
    - Include portrait image (or 🎭 emoji if no image)
    - Link to persona file
    - Display name, role, focus areas, document count
    - Entrance message excerpt

    Add link to HTML showcase at top of README

15. Generate/Update HTML Showcase
    Read: ai-dev-persona/personas.json

    Generate complete HTML file: ai-dev-persona/personas.html

    HTML features:
    - Beautiful RPG-style gallery design
    - Stats dashboard (total personas, docs, skills)
    - Filter system by focus area
    - Persona cards with portraits, entrance messages, stats
    - Actions: View profile, copy activate command
    - Responsive design
    - JavaScript for interactivity

    Calculate aggregate stats:
    - total_personas
    - total_unique_docs (across all personas)
    - total_unique_skills (all expert skills)

    Generate filter buttons for all unique focus areas
    Generate persona card for each persona in registry

16. Validate Persona Creation
    Verify files exist:
    - ai-dev-persona/{persona_name}/{persona_name}.md
    - ai-dev-persona/{persona_name}/metadata.json
    - ai-dev-persona/{persona_name}/{persona_name}.png (if generated)
    - ai-dev-persona/personas.json
    - ai-dev-persona/personas.html
    - ai-dev-persona/README.md

    Validate persona definition has all required sections:
    - Identity, Beliefs & Values, Methodology
    - Competitive Differentiators, Positioning
    - Technical Skills, Soft Skills
    - Focus Areas, Avoidance Zones
    - Document Radar, Signature Patterns
    - Entrance Message, System Behavior

    Validate metadata.json is valid JSON

    Validate coherence:
    - Beliefs align with methodology
    - Differentiators match focus areas
    - Avoidance zones complement focus areas

17. Display Summary Report
    Show comprehensive creation summary:

    ✅ AI Dev Persona created successfully!

    Persona Details:
    - Name: {persona_name}
    - Display Name: {display_name}
    - Role: {description}
    - Location: ai-dev-persona/{persona_name}/{persona_name}.md
    - Version: v1.0.0

    Framework Analysis:
    - 5 Whys Identity: {core identity}
    - Porter's 5 Forces: {N} differentiators

    Document Radar: {N} documents
    Focus Areas: {list}
    Avoidance Zones: {list}
    Entrance Message: "{entrance_message}"

    Validations:
    - Persona definition file created
    - Metadata file created
    - Image generated (or note if unavailable)
    - All sections present
    - 5 Whys complete (5 levels)
    - Porter's 5 Forces complete
    - Central registry updated
    - Website updated
    - README updated

    Next Steps:
    1. Review: ai-dev-persona/{persona_name}/{persona_name}.md
    2. View gallery: ai-dev-persona/personas.html
    3. Activate: Use /set-ai-dev-persona
    4. Combine with other personas for multifaceted expertise
