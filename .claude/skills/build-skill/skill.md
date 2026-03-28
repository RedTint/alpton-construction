# Build Skill Command

Create new Claude Code Skills with proper structure, formatting, and integration into the project's command system.

## Execution Steps

### Phase 1: Parse Input and Validate Skill Name

1. **Extract Skill Name and Description**
   - Parse the command arguments to get skill name and purpose
   - Skill name should be in kebab-case format (e.g., `build-fe`, `create-adr`, `update-progress`)
   - If name contains spaces or special characters, convert to kebab-case:
     - Convert to lowercase
     - Replace spaces and underscores with hyphens
     - Remove special characters (keep only alphanumeric and hyphens)
     - Remove leading/trailing hyphens
   - Examples:
     - "build frontend" → "build-frontend"
     - "Create ADR" → "create-adr"
     - "update_progress" → "update-progress"

2. **Extract Skill Purpose**
   - Get the brief description of what the skill does
   - This will be used as the skill's main description
   - If not provided, prompt user for a one-line description
   - Examples:
     - "Build and scaffold frontend implementation based on specifications"
     - "Create architectural decision records with automatic indexing"
     - "Update progress tracking documentation"

3. **Extract Detailed Requirements**
   - Parse any additional context about:
     - What documents/files the skill should read
     - What actions the skill should perform
     - What tools the skill should use
     - What output the skill should produce
     - Any special requirements or constraints
   - This will be used to generate the Execution Steps

4. **Validate Skill Name**
   - Use Glob to check if skill already exists in `.claude/skills/`
   - If skill exists:
     - Display warning: "Skill already exists: {skill-name}"
     - Ask user if they want to:
       - Overwrite existing skill
       - Create with different name (append -v2)
       - Cancel operation
   - Ensure skill name is not empty and follows conventions

### Phase 2: Analyze Existing Skills for Pattern Reference

1. **Read Existing Skills**
   - Use Glob to find all existing skill files: `.claude/skills/*/skill.md`
   - Read 2-3 representative skills to understand:
     - Common structure patterns
     - Phase organization style
     - Input/Output format conventions
     - Error handling patterns
     - Success criteria structure

2. **Extract Common Patterns**
   - Identify standard sections:
     - Title and description
     - Execution Steps (organized into Phases)
     - Input Format
     - Output Format
     - Important Notes
     - Error Handling
     - Success Criteria
   - Note any optional sections:
     - Validation Checklist
     - Future Enhancements
     - Examples
     - Logic/Pseudo-code sections

3. **Understand Phase Structure**
   - Phases are numbered and grouped logically
   - Each phase has clear objective
   - Steps within phases are numbered and detailed
   - Include concrete examples and code snippets where helpful

### Phase 3: Identify Script Opportunities (Token Savings)

Before writing the skill, identify any operations that would be **repeatedly invoked** or **generate large amounts of boilerplate** and offload them to scripts under `.ai-dev/ai-dev-scripts/`. This keeps the LLM's role limited to orchestration and decision-making — not mechanical I/O.

1. **Scan for Repetitive Operations**
   - Ask: will this skill ever scaffold multiple files or directories?
   - Ask: will it update a structured index (README, JSON, YAML) that could be machine-written?
   - Ask: will it perform file searches, count items, or aggregate stats?
   - Ask: could the same template content be reused across multiple invocations?

2. **Decide: Shell Script vs. Node.js Script**

   | Use a shell script (`.sh`) when... | Use a Node.js script (`.js`) when... |
   |-------------------------------------|---------------------------------------|
   | Creating directory structures | Parsing YAML frontmatter (use gray-matter) |
   | Copying + substituting templates | Calculating or aggregating stats |
   | Updating plain-text index tables | Writing structured YAML back to files |
   | Simple sed/awk replacements | Validating JSON Schema or business rules |
   | Running other CLI commands | Needing conditional logic on parsed data |

3. **Create Templates When Applicable**
   - If the skill generates file content that is largely the same each time, extract it to `.ai-dev/ai-dev-scripts/templates/{skill-name}/`
   - Template files use `{{VARIABLE}}` placeholders substituted at runtime by `sed`
   - Always include YAML frontmatter in templates for documents that need programmatic access
   - Example: `/client-new` uses `templates/clients/*.md` → copied by `client-new-setup.sh`

4. **Document the Script in the Skill**
   - In the skill's execution steps, invoke the script via Bash rather than reproducing its logic inline:
     ```bash
     bash .ai-dev/ai-dev-scripts/{skill-name}-setup.sh --arg1 "value"
     ```
   - Capture stdout to extract machine-readable output (e.g., `CLIENT_DIR=...`)
   - If the script exits non-zero, display its stderr and abort — never silently swallow errors

5. **Script Naming Convention**
   - Setup/scaffold scripts: `{skill-name}-setup.sh`
   - Aggregation/stats scripts: `aggregate-{noun}.js`
   - Validation scripts: `validate-{noun}.js`
   - Parser/updater scripts: `update-{noun}.js`

6. **Always Update `.ai-dev/ai-dev-scripts/README.md`**
   - Every new script must have a corresponding entry in `.ai-dev/ai-dev-scripts/README.md`
   - Entry must include: what it does, which skill(s) call it, full CLI usage, and what it outputs
   - Use Edit tool to append the new entry under the `## Scripts` section
   - This README is the single source of truth for all supporting scripts — without it, future agents and developers won't know the scripts exist or how to use them
   - Template entries should also list their placeholder variables under a `## Templates` section

### Phase 4: Generate Skill Structure

1. **Design Execution Phases**
   Based on the requirements provided, break down the skill into logical phases:
   - **Phase 1**: Usually input parsing and validation
   - **Phase 2**: Context gathering and reading related documents
   - **Phase 3**: Main processing logic
   - **Phase 4**: Output generation or file creation
   - **Phase 5**: Validation
   - **Phase 6**: Optional git commit or integration tasks
   - **Phase 7**: Summary report

   Number of phases should match complexity (3-7 phases typical)

2. **Markdown Formatting Rules — Enforce in All Generated Templates and Skills**

   These rules prevent common rendering and newline-collapse issues:

   - **Use bullet points for metadata blocks** — never write consecutive `**Field:** value` lines as bare paragraphs. Markdown renderers and shell `sed` substitutions can collapse adjacent lines into a single run-on string. Always use `- **Field:** value` lists instead:
     ```markdown
     ✅ Correct:
     - **Date:** {{YYYYMMDD-HHii}}
     - **Type:** {{MEETING_TYPE}}
     - **Client:** {{CLIENT_NAME}}

     ❌ Incorrect (collapses to one line):
     **Date:** {{YYYYMMDD-HHii}}
     **Type:** {{MEETING_TYPE}}
     **Client:** {{CLIENT_NAME}}
     ```
   - **Use `{{YYYYMMDD-HHii}}` for datetime stamps** — never split into separate `{{DATE}}` and `{{TIME}}` placeholders in the same field. This matches the filename convention (`{###}-{YYYYMMDD-HHii}-{desc}.md`) and avoids misalignment.
   - **Separate sections with `---` horizontal rules** — ensures sections never bleed into each other when content is long.
   - **One blank line between list items and the next heading** — prevents the heading from being parsed as list continuation.
   - **Apply these rules in**: skill output templates, `.ai-dev/ai-dev-scripts/templates/**/*.md`, and any inline markdown written by Write tool.

3. **Define Steps Within Each Phase**
   - Break each phase into numbered steps
   - Each step should be:
     - Actionable (clear what to do)
     - Specific (no vague instructions)
     - Ordered (logical sequence)
   - Include:
     - Tool usage (Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion)
     - Examples where helpful
     - Error handling considerations
     - Validation points

3. **Generate Input Format Section**
   - Define command syntax
   - Provide multiple examples showing different use cases
   - Document optional arguments if applicable
   - Format:
     ```
     ## Input Format

     **Command:**
     ```
     /skill-name {required-arg} {optional-arg}
     ```

     **Examples:**
     ```
     /skill-name example1
     /skill-name example2 with additional context
     ```
     ```

4. **Generate Output Format Section**
   - Define success output format
   - Show clear, structured output with emojis for visual appeal
   - Include all relevant information user needs to see
   - Format:
     ```
     ## Output Format

     ```
     ✅ Action completed successfully!

     📄 Details:
     - Key information
     - Results

     🎯 Next Steps:
     1. Follow-up action 1
     2. Follow-up action 2
     ```
     ```

5. **Generate Error Handling Section**
   - List common error scenarios
   - For each error:
     - Describe the condition
     - Specify error message to display
     - Provide recovery suggestions
   - Examples:
     - Invalid input
     - Missing dependencies
     - File not found
     - Git failures

6. **Generate Success Criteria Section**
   - List checkpoints that define successful execution
   - Each criterion should be verifiable
   - Format as checklist with ✅ markers

### Phase 4: Create Skill File

1. **Generate Complete Skill Content**
   - Combine all sections into proper markdown format:
     ```markdown
     # {Skill Title} Command

     {Brief description of what the skill does}

     ## Execution Steps

     ### Phase 1: {Phase Name}

     1. **{Step Title}**
        - Detailed instructions
        - Examples
        - Notes

     2. **{Step Title}**
        - ...

     ### Phase 2: {Phase Name}
     ...

     ## Input Format
     ...

     ## Output Format
     ...

     ## Important Notes
     - Key considerations
     - Best practices
     - Warnings

     ## Error Handling
     ...

     ## Success Criteria
     ...
     ```

2. **Ensure Content Quality**
   - All sections are comprehensive and detailed
   - Examples are concrete and project-specific
   - Tool usage is clearly specified
   - Error handling is thorough
   - Success criteria are clear

3. **Write Skill File**
   - Use Write tool to create `.claude/skills/{skill-name}/skill.md`
   - Ensure proper formatting with consistent indentation
   - Validate markdown syntax
   - Preserve line breaks and spacing

### Phase 5: Update CLAUDE.md

1. **Read Current CLAUDE.md**
   - Read `.claude/CLAUDE.md`
   - Identify the "Commands" section
   - Determine appropriate subsection for new skill:
     - Setup & Documentation
     - Development
     - Quality & Release
     - Utilities

2. **Generate Command Entry**
   - Format: `- **/{skill-name}** - {description}`
   - Insert in appropriate subsection
   - Maintain alphabetical order within subsection if applicable
   - Examples:
     - `- **/build-fe** - Build and scaffold frontend implementation based on specifications`
     - `- **/create-adr {purpose}** - Create a new Architectural Decision Record with automatic indexing`

3. **Update CLAUDE.md**
   - Use Edit tool to add new command entry
   - Preserve all existing content
   - Maintain formatting consistency
   - Verify the edit was successful

4. **Handle CLAUDE.md Update Failures**
   - If edit fails:
     - Complete skill creation successfully
     - Inform user that CLAUDE.md needs manual update
     - Provide exact entry to add

### Phase 6: Validate Skill Creation

1. **Verify Directory Structure**
   - Check that `.claude/skills/{skill-name}/` directory exists
   - Verify `skill.md` file is present

2. **Validate Skill File Content**
   - Read the created skill file
   - Verify all required sections are present:
     - ✅ Title and description
     - ✅ Execution Steps with phases
     - ✅ Input Format
     - ✅ Output Format
     - ✅ Error Handling
     - ✅ Success Criteria
   - Check markdown formatting is correct

3. **Verify CLAUDE.md Integration**
   - Read CLAUDE.md
   - Confirm new command is listed in Commands section
   - Verify formatting is consistent

4. **Generate Validation Report**
   - List all validation checks performed
   - Note any warnings or issues
   - Confirm skill is ready to use

### Phase 7: Generate Summary Report

1. **Collect Creation Details**
   - Skill name and command
   - File location
   - CLAUDE.md update status
   - Number of phases created
   - Validation results

2. **Display Comprehensive Summary**
   ```
   ✅ Claude Skill created successfully!

   📄 Skill Details:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Name:        {skill-name}
   Command:     /{skill-name}
   Description: {description}
   Location:    .claude/skills/{skill-name}/skill.md

   ✅ Validations:
   - ✅ Directory created
   - ✅ Skill file created
   - ✅ All required sections present
   - ✅ Proper markdown formatting
   - ✅ CLAUDE.md updated

   📋 Skill Structure:
   - {N} Execution Phases
   - Input Format defined
   - Output Format defined
   - Error Handling included
   - Success Criteria specified

   🎯 Next Steps:
   1. Test the skill: /{skill-name} {example-input}
   2. Review and refine skill.md if needed
   3. Update skill based on usage feedback
   4. Document the skill in project README if needed

   ✨ Your new /{skill-name} command is ready to use! ✨
   ```

3. **Provide Usage Example**
   - Show exact command to invoke the new skill
   - Provide sample input based on skill requirements
   - Suggest testing scenarios

## Input Format

**Command:**
```
/build-skill {skill-name} - {description}
{additional context about what the skill should do}
```

**Simplified Format:**
```
/build-skill {skill-name}
```
(Will prompt for description and requirements)

**Examples:**
```
/build-skill build-fe - Build and scaffold frontend implementation
The skill should read tech stacks, design system, user flows, and atomic stories to build frontend features.

/build-skill create-landing-page - Generate a landing page for the project
Should create an HTML/CSS landing page with hero section, features, and CTA.

/build-skill pressure-test - Run performance and load testing
Should analyze SLA requirements and run load tests to validate p95/p99 latency targets.

/build-skill build-fe
(Will prompt for description and requirements interactively)
```

## Output Format

```
✅ Claude Skill created successfully!

📄 Skill Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:        build-fe
Command:     /build-fe
Description: Build and scaffold frontend implementation based on specifications
Location:    .claude/skills/build-fe/skill.md

✅ Validations:
- ✅ Directory created: .claude/skills/build-fe/
- ✅ Skill file created: skill.md (1,247 lines)
- ✅ Title and description present
- ✅ 7 Execution Phases defined
- ✅ Input Format specified
- ✅ Output Format specified
- ✅ Error Handling included
- ✅ Success Criteria defined
- ✅ Proper markdown formatting
- ✅ CLAUDE.md updated with new command

📋 Skill Structure:
Phase 1: Parse Input and Identify Pending UACs
Phase 2: Gather Context from Documentation
Phase 3: Analyze Frontend Requirements
Phase 4: Generate Frontend Implementation
Phase 5: Validate Generated Code
Phase 6: Update Progress Tracking
Phase 7: Generate Summary Report

🔧 Tools Used:
- Read (for documentation files)
- Write (for generated code)
- Edit (for updates)
- Glob (for file discovery)
- Grep (for content search)
- Bash (for git operations)

🎯 Next Steps:
1. Test the skill: /build-fe
2. Review .claude/skills/build-fe/skill.md for completeness
3. Refine execution steps based on first test run
4. Use the skill to build your frontend features!

✨ Your new /build-fe command is ready to use! ✨
```

## Important Notes

- **Meta-Skill Nature**: This skill creates other skills, so it needs to be comprehensive and flexible
- **Pattern Recognition**: Always read 2-3 existing skills to understand current patterns before generating new ones
- **Consistency**: Generated skills should follow the same structure and style as existing skills
- **Completeness**: Don't generate placeholder content - make skills immediately usable
- **Documentation**: Always update CLAUDE.md to register the new command
- **Validation**: Thoroughly validate created skills before reporting success
- **Flexibility**: Handle both detailed requirements and minimal input gracefully
- **Examples**: Include concrete examples in all sections (Input, Output, Error Handling)
- **Tool Specification**: Clearly specify which tools (Read, Write, Edit, Bash, etc.) to use in each step
- **Git Integration**: Consider whether the new skill needs git operations
- **Progress Tracking**: For implementation skills, include progress update steps
- **Version Management**: For documentation skills, include version handling

## Error Handling

**Skill Name Not Provided:**
- Display error: "Please provide a skill name"
- Suggest: "/build-skill {skill-name} - {description}"
- Example: "/build-skill build-fe - Build frontend implementation"

**Skill Already Exists:**
- Display warning: "Skill already exists: .claude/skills/{skill-name}/"
- Use AskUserQuestion to ask:
  - "Overwrite existing skill"
  - "Create with different name (append -v2)"
  - "Cancel operation"
- Handle response accordingly

**Invalid Skill Name:**
- Display error: "Invalid skill name: {name}"
- Requirements:
  - Only lowercase letters, numbers, and hyphens
  - No spaces or special characters
  - Not empty
- Suggest corrected name

**Insufficient Requirements:**
- Display warning: "Skill requirements not clear"
- Use AskUserQuestion to gather:
  - What documents should the skill read?
  - What actions should the skill perform?
  - What output should the skill produce?
- Generate skill based on answers

**Directory Creation Failed:**
- Display error: "Could not create skill directory: {path}"
- Check permissions
- Suggest manual directory creation
- Abort skill creation

**Skill File Write Failed:**
- Display error: "Could not write skill file: {error}"
- Check disk space and permissions
- Suggest manual file creation
- Provide generated content for manual copying

**CLAUDE.md Update Failed:**
- Complete skill creation successfully
- Display warning: "Could not update CLAUDE.md"
- Provide exact entry to add manually:
  ```
  Add to Commands section under appropriate category:
  - **/{skill-name}** - {description}
  ```

**Validation Failures:**
- If non-critical sections missing:
  - Display warnings
  - Complete skill creation
  - Suggest adding missing sections later
- If critical sections missing:
  - Display error
  - Offer to regenerate skill
  - Or provide manual fix instructions

## Success Criteria

The `/build-skill` command is successful when:
1. ✅ Skill name validated and converted to proper format
2. ✅ Skill directory created at `.claude/skills/{skill-name}/`
3. ✅ Skill file created with comprehensive content
4. ✅ All required sections present:
   - Title and description
   - Execution Steps (with phases)
   - Input Format
   - Output Format
   - Error Handling
   - Success Criteria
5. ✅ Generated content follows patterns from existing skills
6. ✅ Examples are concrete and helpful
7. ✅ Tool usage is clearly specified
8. ✅ CLAUDE.md updated with new command entry
9. ✅ Skill file validated for structure and formatting
10. ✅ User receives comprehensive summary with next steps
11. ✅ New skill is immediately usable

## Future Enhancements

### v1.1.0
- Interactive skill builder with step-by-step prompts
- Template selection (simple, standard, complex)
- Automatic test case generation for skills
- Skill validation against project conventions

### v1.2.0
- Skill versioning support
- Skill dependencies management
- Automatic skill testing framework
- Skill usage analytics and optimization suggestions

### v1.3.0
- Skill composition (combine multiple skills)
- Skill marketplace/library
- AI-assisted skill refinement based on usage
- Cross-project skill portability
