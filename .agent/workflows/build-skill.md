---
description: Create new Claude Code Skills with proper structure and formatting (Note: Creates Claude Skills, not Antigravity workflows)
---

// Note: This workflow creates Claude Code Skills in .claude/skills/
// For Antigravity workflows, manually create .md files in .agent/workflows/
// After creating Claude Skills, run /convert-to-antigravity to generate Antigravity versions

1. Parse Input and Validate Skill Name
   Extract skill name and description from user input
   Convert to kebab-case (e.g., "my-skill" not "My Skill")

   Check if exists:
   Find files matching: .claude/skills/*/skill.md

2. Analyze Existing Skills for Reference
   Read 2-3 existing skills from .claude/skills/ to understand structure
   Note common patterns: phases, input/output formats, error handling

3. Generate Skill Structure
   Create comprehensive skill.md with:
   - Title and description
   - Execution Steps (4-8 phases)
   - Input Format
   - Output Format
   - Error Handling
   - Success Criteria

4. Create Skill Files
   Create directory: .claude/skills/{skill-name}/
   Write file: .claude/skills/{skill-name}/skill.md

5. Update CLAUDE.md
   Read .claude/CLAUDE.md
   Add command entry: - **/{skill-name}** - {description}
   Place under appropriate category

6. Generate Summary
   Display: skill name, location, line count
   Usage: /{skill-name}

7. Optional: Convert to Antigravity
   Suggest running: /convert-to-antigravity
   This will create Antigravity workflow version automatically
