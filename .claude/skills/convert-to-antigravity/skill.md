# Convert to Antigravity Command

Convert Claude Code Skills to Google Antigravity IDE Workflows automatically, enabling cross-IDE development workflow.

## Execution Steps

### Phase 1: Discover and Analyze Claude Skills

1. **Find All Claude Skills**
   - Use Glob to find all skill files: `.claude/skills/*/skill.md`
   - List all discovered skills
   - **Self-Exclusion:** Filter out `convert-to-antigravity` skill from conversion list
   - Count total skills to be converted

2. **Read Each Skill File**
   - Read the content of each skill markdown file
   - Extract skill name from directory name
   - Parse skill structure:
     - Identify phase sections (### Phase X:)
     - Extract execution steps within each phase
     - Note any special sections (Input Format, Output Format, etc.)
   - Build structured representation of each skill

3. **Analyze Conversion Complexity**
   - For each skill, detect patterns that affect conversion:
     - **Nested phases:** Count depth of phase nesting
     - **Parallel Task usage:** Search for `Task(` calls with `subagent_type`
     - **AskUserQuestion usage:** Search for `AskUserQuestion` tool calls
     - **Complex conditional logic:** Look for complex if/else structures
     - **Tool variety:** Count different Claude tools used (Read, Write, Edit, Bash, Glob, Grep)

4. **Assign Conversion Confidence Score**
   - Calculate confidence score (0-100%):
     - Start at 100%
     - Deduct 10% for each nested phase level beyond 1
     - Deduct 20% for parallel Task usage (no Antigravity equivalent)
     - Deduct 5% for each AskUserQuestion (needs manual prompts)
     - Deduct 5% for complex conditional logic
   - Categorize:
     - **High confidence (90-100%):** Simple, linear skills
     - **Medium confidence (70-89%):** Moderate complexity
     - **Low confidence (<70%):** Complex patterns, may need manual adjustment

5. **Generate Pre-Conversion Report**
   - Display analysis summary:
     ```
     📊 Claude Skills Analysis
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     Total Skills Found: 6
     Skills to Convert: 5 (excluding convert-to-antigravity)

     Conversion Confidence:
     - High (90-100%): 3 skills
     - Medium (70-89%): 1 skill
     - Low (<70%): 1 skill

     ⚠️ Complex Patterns Detected:
     - build/skill.md: Uses parallel Task execution (no Antigravity equivalent)
     - define/skill.md: Uses AskUserQuestion (convert to manual prompts)
     ```

### Phase 2: Convert Each Skill to Antigravity Workflow

1. **Create Output Directory**
   - Check if `.agent/workflows/` directory exists
   - If not, create it: `mkdir -p .agent/workflows`
   - Confirm directory creation

2. **For Each Skill, Generate Workflow File**
   - Take skill name (e.g., "setup" from `.claude/skills/setup/skill.md`)
   - Create output filename: `.agent/workflows/{skill-name}.md`

3. **Generate YAML Frontmatter**
   - Extract skill description from first paragraph or title
   - **Description Limit:** Maximum 250 characters (Antigravity constraint)
   - If description exceeds 250 characters:
     - Truncate to 247 characters
     - Add "..." to indicate truncation
   - Create YAML frontmatter:
     ```yaml
     ---
     description: [Brief description of what this workflow does]
     ---
     ```
   - Keep description concise (1-2 sentences, under 250 chars)

4. **Convert Phases to Numbered Steps**
   - Iterate through each phase in the Claude Skill
   - Flatten nested phases into sequential steps
   - For each phase:
     - Extract phase title
     - Extract substeps within phase
     - Create numbered step format:
       ```markdown
       1. Phase Title
          [Commands or actions to execute]
       ```

5. **Map Claude Tools to Antigravity Commands**
   - **Read tool:** Convert to file read commands
     ```
     Read the file at [path]
     ```
   - **Write tool:** Convert to file write commands
     ```
     Write the following content to [path]:
     [content]
     ```
   - **Edit tool:** Convert to file edit instructions
     ```
     Edit [file] by replacing [old] with [new]
     ```
   - **Bash tool:** Keep as shell commands
     ```
     Run: [bash command]
     ```
   - **Glob tool:** Convert to file search
     ```
     Find files matching pattern: [pattern]
     ```
   - **Grep tool:** Convert to content search
     ```
     Search for "[pattern]" in [path]
     ```
   - **Task tool (parallel):** **Cannot convert directly**
     - Add comment: `// Note: Original skill uses parallel execution - run these steps manually in sequence`
     - List tasks sequentially
   - **AskUserQuestion:** **Cannot convert directly**
     - Add comment: `// Note: Manual user input required`
     - Add placeholder step asking user to provide input

6. **Handle Non-Convertible Features**
   - For parallel Task execution:
     ```markdown
     X. Coordinate Multiple Actions
        // Original: Parallel execution (Claude Task tool)
        // Antigravity: Run these sequentially or manually coordinate
        - Action 1
        - Action 2
        - Action 3
     ```
   - For AskUserQuestion:
     ```markdown
     X. User Input Required
        // Original: AskUserQuestion tool
        // Antigravity: Manually provide answer to: [question text]
        Proceed with: [expected input type]
     ```
   - For nested phases:
     ```markdown
     X. Complex Multi-Step Process
        // Original: Nested phases (Phase X.Y.Z)
        // Antigravity: Flattened to sequential steps
        - Substep 1
        - Substep 2
     ```

7. **Add `// turbo` Annotations (Optional)**
   - For simple, safe commands that don't require confirmation:
     ```markdown
     1. Create Directory
        // turbo
        mkdir -p docs/adr
     ```
   - Don't add `// turbo` for:
     - File writes that overwrite existing files
     - Destructive operations (rm, git reset, etc.)
     - Commands requiring user input

8. **Write Converted Workflow File**
   - Combine YAML frontmatter + numbered steps
   - Write to `.agent/workflows/{skill-name}.md`
   - Preserve markdown formatting

### Phase 3: Validate Generated Workflows

1. **For Each Generated Workflow, Validate:**
   - **YAML Frontmatter:**
     - Check `---` delimiters present at start and end
     - Verify `description` field exists and is non-empty
     - Ensure proper YAML syntax (no syntax errors)

   - **Content Length (Antigravity Constraint):**
     - Count total characters in the workflow file (frontmatter + steps)
     - **Maximum:** 12,000 characters
     - If content exceeds 12,000 characters:
       - Mark workflow with ⚠️ warning
       - Calculate overage amount
       - Add to validation report
       - Suggest splitting skill into smaller workflows
       - Note: User must manually simplify or split the workflow

   - **Numbered Steps:**
     - Verify steps are numbered sequentially (1., 2., 3., ...)
     - Check each step has a title
     - Ensure proper indentation for substeps

   - **`// turbo` Placement:**
     - Must appear immediately before a command (not in middle of step)
     - Can't be used with interactive commands

   - **Markdown Formatting:**
     - Proper heading levels
     - Code blocks properly formatted
     - No broken markdown syntax

2. **Collect Validation Results**
   - Track validation status per workflow:
     - ✅ Valid (no issues)
     - ⚠️ Warning (minor issues, will work but could be improved)
     - ❌ Error (syntax errors, won't work)
   - Collect specific issues found:
     - Syntax errors
     - Content length violations (>12,000 chars)
     - Missing required fields
     - Formatting issues
   - For workflows exceeding 12,000 characters:
     - Record filename
     - Record total character count
     - Calculate overage (characters over limit)
     - Add to "Manual Attention Required" list

### Phase 4: Create Documentation Files

1. **Create `.agent/README.md`**
   - Write usage instructions for converted workflows:
     ```markdown
     # Antigravity Workflows

     These workflows were automatically converted from Claude Code Skills.

     ## Available Workflows

     - `/setup` - Initialize project documentation structure
     - `/define` - Elaborate documentation files (requires manual input for questions)
     - `/update-progress` - Update progress tracking
     - `/create-adr` - Create architectural decision records
     - `/build` - Build orchestrator (simplified - no parallel execution)

     ## Usage

     In Antigravity IDE, trigger workflows with:
     ```
     /workflow-name
     ```

     Or explicitly:
     ```
     /setup
     ```

     ## Important Notes

     - **Manual Testing Required:** Test each workflow in Antigravity before relying on it
     - **User Input:** Some workflows require manual prompts (marked with comments)
     - **No Parallel Execution:** Workflows that used Claude's parallel Task tool run sequentially
     - **Source of Truth:** Claude Skills remain canonical - re-run converter after updates

     ## Customization

     Feel free to modify these workflows for Antigravity-specific optimizations:
     - Add `// turbo` for auto-execution (use cautiously)
     - Simplify steps for your specific workflow
     - Combine or split workflows as needed

     Changes made here won't sync back to Claude Skills.
     ```

2. **Create `.agent/CONVERSION-NOTES.md`**
   - Document limitations and manual adjustments:
     ```markdown
     # Conversion Notes

     ## Antigravity Constraints

     Antigravity workflows have strict character limits:
     - **Description:** Maximum 250 characters
     - **Content:** Maximum 12,000 characters (including frontmatter and all steps)

     If a converted workflow exceeds these limits:
     - **Description:** Automatically truncated to 247 chars + "..."
     - **Content:** Marked with warning - requires manual splitting or simplification

     ## Limitations

     The following Claude features don't have direct Antigravity equivalents:

     ### Parallel Task Execution
     - **Claude:** Can execute multiple tasks concurrently
     - **Antigravity:** Workflows run sequentially
     - **Workaround:** Run multiple workflows manually or sequentially

     ### Nested Phases
     - **Claude:** Supports multi-level phase nesting (Phase 1.2.3)
     - **Antigravity:** Flat numbered steps only
     - **Conversion:** Flattened to sequential steps

     ### AskUserQuestion Tool
     - **Claude:** Interactive user prompts during execution
     - **Antigravity:** No built-in equivalent
     - **Workaround:** Manual user input required (noted in comments)

     ### Workflow-to-Workflow Calls
     - **Claude:** Skills can invoke other skills
     - **Antigravity:** No workflow chaining
     - **Workaround:** Run workflows sequentially

     ## Workflows Exceeding Content Limit

     [List of workflows that exceed 12,000 character limit - requires manual action]

     [If none exceed limit, show:]
     ✅ All workflows are within Antigravity's 12,000 character content limit.

     [If any exceed limit, show example:]
     ### /complex-workflow (complex-workflow.md)
     - **Content Length:** 14,523 characters (2,523 over limit)
     - **Issue:** Workflow too large for Antigravity
     - **Options:**
       1. Split into 2+ smaller workflows (recommended)
       2. Simplify steps by removing detailed explanations
       3. Extract substeps into separate workflows
     - **Manual Action:** Review and split before use in Antigravity

     ## Skills Requiring Manual Adjustments

     [List of skills that need manual testing/adjustment]

     ### /build (build.md)
     - **Issue:** Used parallel Task for build-fe, build-be, build-devops
     - **Converted To:** Sequential steps with comments
     - **Manual Action:** Run builds one at a time or manually coordinate

     ### /define (define.md)
     - **Issue:** Uses AskUserQuestion for version increment choice
     - **Converted To:** Comment asking for manual input
     - **Manual Action:** Decide version increment manually

     ## Conversion Statistics

     - **Total Skills:** 6
     - **Converted:** 5 (excluding converter itself)
     - **High Confidence:** 3 workflows
     - **Medium Confidence:** 1 workflow
     - **Low Confidence:** 1 workflow
     - **Content Length Issues:** X workflows exceed 12,000 chars
     - **Validation:** X passed, Y warnings, Z errors
     ```

### Phase 5: Generate Conversion Report

1. **Collect Conversion Statistics**
   - Total skills analyzed
   - Skills successfully converted
   - Confidence score per skill
   - Validation results per workflow
   - Features that don't convert 1:1
   - Manual steps required

2. **Display Comprehensive Report**
   ```
   ✅ Claude Skills converted to Antigravity Workflows!

   📊 Conversion Summary
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Skills Analyzed: 6
   Skills Converted: 5
   Self-Excluded: convert-to-antigravity

   📋 Conversion Results by Skill:

   ✅ setup.md
      Confidence: 95% (High)
      Status: Converted successfully
      Issues: None
      Validation: ✅ Valid

   ⚠️ define.md
      Confidence: 85% (Medium)
      Status: Converted with notes
      Issues: Uses AskUserQuestion (manual input required)
      Validation: ⚠️ 1 warning

   ✅ update-progress.md
      Confidence: 92% (High)
      Status: Converted successfully
      Issues: None
      Validation: ✅ Valid

   ✅ create-adr.md
      Confidence: 90% (High)
      Status: Converted successfully
      Issues: None
      Validation: ✅ Valid

   ⚠️ build.md
      Confidence: 65% (Low)
      Status: Converted with significant notes
      Issues:
        - Parallel Task execution (no equivalent)
        - Complex orchestration logic
        - Content length: 8,234 chars (within limit)
      Validation: ⚠️ 2 warnings

   📁 Output Location:
   - Workflows: .agent/workflows/ (5 files)
   - Documentation: .agent/README.md
   - Conversion Notes: .agent/CONVERSION-NOTES.md

   ⚠️ Features Requiring Manual Attention:

   - **Parallel Execution:** build.md originally used parallel Task
     → Converted to sequential steps with comments

   - **User Prompts:** define.md originally used AskUserQuestion
     → Added comments for manual input

   - **Content Length Exceeded:** (If any workflows exceed 12,000 chars)
     → Example: complex-workflow.md (14,523 chars, 2,523 over limit)
     → Action: Split into smaller workflows or simplify steps

   📈 Validation Results:
   - ✅ Valid: 3 workflows
   - ⚠️ Warnings: 2 workflows
   - ❌ Errors: 0 workflows

   ⏱️ Conversion Time: 2.4 seconds

   🎯 Next Steps:

   1. Review generated workflows in .agent/workflows/
   2. Read .agent/CONVERSION-NOTES.md for limitations
   3. ⚠️ If any workflows exceed 12,000 chars: Split or simplify before use
   4. Manually test each workflow in Antigravity IDE:
      - Open Antigravity IDE
      - Navigate to .agent/workflows/
      - Test with: /setup, /define, /update-progress, etc.
   5. Make Antigravity-specific customizations as needed
   6. Note: Claude Skills remain source of truth
   7. Re-run /convert-to-antigravity after updating Claude Skills

   📖 Documentation:
   - Usage instructions: .agent/README.md
   - Conversion notes: .agent/CONVERSION-NOTES.md
   - Original skills: .claude/skills/

   ✨ Conversion complete! Test workflows in Antigravity IDE. ✨
   ```

### Phase 6: Optional - Create ADR for Conversion

1. **Offer to Create ADR**
   - Ask user if they want to document this conversion as an ADR
   - If yes, create ADR documenting the conversion approach and decisions

2. **ADR Content** (if requested)
   - Title: "Claude Skills to Antigravity Workflows Conversion"
   - Status: Accepted
   - Context: Cross-IDE development requirements
   - Decision: Convert to Workflows (not Skills) for user control
   - Consequences: Limitations documented, manual testing required

## Input Format

**Command:**
```
/convert-to-antigravity
```

No arguments required - automatically discovers and converts all Claude Skills.

**Optional Arguments (Future):**
```
/convert-to-antigravity --skill setup           # Convert specific skill only
/convert-to-antigravity --dry-run               # Show conversion plan without writing
/convert-to-antigravity --with-turbo            # Add // turbo annotations aggressively
/convert-to-antigravity --validate-only         # Only validate existing workflows
```

## Output Format

```
✅ Conversion complete!

📊 Summary:
- Skills converted: 5/6 (excluding converter itself)
- Output directory: .agent/workflows/
- Documentation: .agent/README.md, .agent/CONVERSION-NOTES.md

⚠️ Manual attention required:
- 2 workflows have warnings (see CONVERSION-NOTES.md)
- Test all workflows in Antigravity before use

🎯 Next: Test workflows with /setup, /define, etc. in Antigravity IDE
```

## Conversion Mapping Examples

### Example 1: Simple Skill (High Confidence)

**Claude Skill (create-adr/skill.md):**
```markdown
### Phase 1: Parse Input

1. Extract Purpose
   - Parse command arguments
   - Clean purpose string

### Phase 2: Create ADR

1. Generate Filename
   - Get current date
   - Construct YYYYMMDD-purpose.md

2. Write ADR File
   - Use Write tool
   - Save to docs/adr/
```

**Antigravity Workflow (create-adr.md):**
```markdown
---
description: Create a new Architectural Decision Record with proper formatting
---

1. Parse Input and Extract Purpose
   Parse the command arguments and clean the purpose string
   Remove special characters and format as kebab-case

2. Generate ADR Filename
   Get current date in YYYYMMDD format
   Construct filename: YYYYMMDD-purpose.md

3. Create ADR File
   Write ADR content to docs/adr/[filename]
   Include: Status, Date, Deciders, Context, Decision, Consequences

4. Update ADR Index
   Add new entry to docs/adr/000-README.md
   Insert row at top of table (newest first)
```

### Example 2: Complex Skill with Parallel Execution (Low Confidence)

**Claude Skill (build/skill.md):**
```markdown
### Phase 4: Execute Build Commands

**Parallel Execution:**
- Use Task tool to launch multiple agents
- Task(subagent_type: "general-purpose", prompt: "Execute /build-fe")
- Task(subagent_type: "general-purpose", prompt: "Execute /build-be")
```

**Antigravity Workflow (build.md):**
```markdown
---
description: Orchestrate implementation based on atomic stories
---

1. Analyze Pending Work
   Read docs/200-atomic-stories-v*.md
   Identify pending UACs by type (FE, BE, DevOps)

2. Execute Build Commands
   // Original: Parallel execution (Claude Task tool)
   // Antigravity: Run these sequentially

   Run frontend build:
   Execute /build-fe workflow (if available)

   Run backend build:
   Execute /build-be workflow (if available)

   Run DevOps build:
   Execute /build-devops workflow (if available)

3. Update Progress
   Run /update-progress to refresh tracking
```

## Important Notes

- **Self-Exclusion:** This skill excludes itself from conversion (can't convert the converter)
- **Source of Truth:** Claude Skills remain canonical - Antigravity workflows are generated copies
- **One-Way Conversion:** Changes in Antigravity don't sync back to Claude Skills
- **Manual Testing Required:** Always test converted workflows in Antigravity before relying on them
- **Re-run After Updates:** When Claude Skills are updated, re-run converter to regenerate Antigravity workflows
- **Customization Encouraged:** Feel free to optimize converted workflows for Antigravity-specific features
- **Version Tracking:** Consider versioning .agent/workflows/ separately from Claude Skills

## Error Handling

**No Skills Found:**
- Display: "No Claude Skills found in .claude/skills/"
- Suggest: "Run /setup first to initialize project structure"

**Output Directory Creation Failed:**
- Display error: "Could not create .agent/workflows/ directory"
- Check permissions and disk space
- Suggest manual directory creation

**Conversion Failure for Specific Skill:**
- Continue converting remaining skills
- Note failed skill in report
- Provide error details
- Suggest manual conversion

**Validation Errors:**
- Report syntax errors in generated workflows
- Don't fail entire conversion
- Mark problematic workflows with ❌ in report
- Provide specific error locations

**Write Permission Issues:**
- Display: "Permission denied writing to .agent/workflows/"
- Suggest checking file permissions
- Offer to display converted content instead of writing

## Success Criteria

The `/convert-to-antigravity` command is successful when:
1. ✅ All Claude Skills (except self) are discovered and parsed
2. ✅ Workflows are generated in .agent/workflows/ directory
3. ✅ YAML frontmatter is valid for all workflows
4. ✅ Numbered steps are properly formatted
5. ✅ Non-convertible features are documented in comments
6. ✅ README.md and CONVERSION-NOTES.md are created
7. ✅ Conversion report provides clear next steps
8. ✅ Validation catches syntax errors
9. ✅ Conversion completes in < 30 seconds for 10 skills

## Future Enhancements

### v1.2.1
- Incremental conversion (only convert changed skills)
- Conversion history tracking
- Rollback to previous conversion
- Confidence score tuning based on actual testing results

### v1.3.0
- Bidirectional conversion (Antigravity → Claude) for simple workflows
- Conversion templates for common patterns
- AI-powered optimization suggestions
- Integration with Antigravity IDE API (if available)

### v2.0.0
- Universal skill format (works in any AI IDE)
- Skill translation layer for multiple IDEs
- Automated testing framework for converted workflows
- Community conversion pattern library
