# Create ADR (Architectural Decision Record) Command

Create a new Architectural Decision Record with proper formatting, indexing, and version control.

## Execution Steps

### Phase 1: Parse Input and Generate Filename

1. **Extract Purpose from User Input**
   - Parse the command arguments to get ADR title/purpose
   - Clean the purpose string:
     - Remove special characters (keep only alphanumeric and hyphens)
     - Convert to lowercase
     - Replace spaces with hyphens
     - Limit length to 50 characters for readability
   - Examples:
     - "Switch from Postgres to MySQL" → "switch-from-postgres-to-mysql"
     - "Use Redis for caching" → "use-redis-for-caching"

2. **Generate Filename**
   - Get current date in YYYYMMDD format
   - Construct filename: `YYYYMMDD-{cleaned-purpose}.md`
   - Examples:
     - "20260209-switch-from-postgres-to-mysql.md"
     - "20260209-use-redis-for-caching.md"

3. **Check for Duplicate Filenames**
   - Use Glob to find existing ADRs in `docs/adr/`
   - Check if filename already exists
   - If duplicate found:
     - Append `-v2`, `-v3`, etc. to filename
     - Or suggest user provide different purpose
     - Display warning: "ADR with similar name exists: {existing-file}"

### Phase 2: Gather ADR Information

1. **Read ADR Template**
   - Read `docs/adr/000-README.md` to get standard template
   - Extract template structure and required fields
   - Ensure consistency with documented format

2. **Prompt User for ADR Details** (Optional - can auto-fill some)
   - Use AskUserQuestion tool if needed, or infer from context:
     - **Title**: Use provided purpose (already have)
     - **Status**: Default to "Proposed" (or ask: Proposed/Accepted/Deprecated/Superseded)
     - **Deciders**: Ask who made/will make the decision (e.g., "Alex - Solo Developer, Technical Lead")
     - **Context**: Briefly describe the issue or situation (can be provided in command or asked)
     - **Decision**: What is being decided (can be inferred from title)
     - **Consequences**: What happens as a result (ask user or leave placeholder)

3. **Smart Defaults**
   - If user doesn't provide full details, create ADR with placeholders:
     - Status: "Proposed"
     - Date: Current date (auto-filled)
     - Deciders: "Project Team" (default)
     - Context: "## Context\n\n[Describe the context and problem statement]\n"
     - Decision: "## Decision\n\n[Describe the decision made]\n"
     - Consequences: "## Consequences\n\n### Positive\n- [Benefit 1]\n\n### Negative\n- [Trade-off 1]\n"
   - Allow user to fill in details later by editing the file

### Phase 3: Create ADR File

1. **Generate ADR Content**
   - Use template structure from 000-README.md
   - Fill in all sections:
     ```markdown
     # ADR-XXX: {Title}

     **Status:** {Proposed/Accepted/Deprecated/Superseded}
     **Date:** {YYYY-MM-DD}
     **Deciders:** {Names or roles}

     ## Context

     {Background information and problem statement}

     ## Decision

     {Description of the decision made}

     ## Consequences

     ### Positive
     - {Benefit 1}
     - {Benefit 2}

     ### Negative
     - {Trade-off 1}
     - {Trade-off 2}

     ## Alternatives Considered

     ### Alternative 1: {Name}
     - {Description}
     - Rejected because: {Reason}

     ### Alternative 2: {Name}
     - {Description}
     - Rejected because: {Reason}

     ## Related ADRs

     - [ADR-XXX: Related Decision](./YYYYMMDD-related-decision.md)

     ## References

     - [Documentation or article](https://example.com)
     ```

2. **Determine ADR Number**
   - Use Glob to find all ADR files in `docs/adr/`
   - Count existing ADRs (excluding 000-README.md)
   - Increment by 1 to get next ADR number
   - Format as ADR-001, ADR-002, etc. (zero-padded 3 digits)

3. **Write ADR File**
   - Write to `docs/adr/{YYYYMMDD-purpose}.md`
   - Use Write tool
   - Ensure proper formatting and line breaks

### Phase 4: Update ADR Index

1. **Read Current ADR Index**
   - Read `docs/adr/000-README.md`
   - Parse existing ADR table
   - Identify insertion point (ADRs should be in reverse chronological order - newest first)

2. **Generate New Index Entry**
   - Create table row with:
     - ADR number (e.g., ADR-005)
     - Title from ADR
     - Status (Proposed, Accepted, etc.)
     - Date (YYYY-MM-DD)
     - Link to ADR file
   - Format: `| ADR-XXX | [Title](./YYYYMMDD-purpose.md) | Status | YYYY-MM-DD |`

3. **Update Index Table**
   - Insert new row at the top of the table (after header)
   - Maintain table formatting and alignment
   - Use Edit tool to update specific section
   - Preserve all other content in 000-README.md

4. **Example Index Table After Update**
   ```markdown
   | ADR # | Title | Status | Date |
   |-------|-------|--------|------|
   | ADR-005 | [Switch from Postgres to MySQL](./20260209-switch-from-postgres-to-mysql.md) | Proposed | 2026-02-09 |
   | ADR-004 | [Use Redis for Caching](./20260208-use-redis-for-caching.md) | Accepted | 2026-02-08 |
   | ADR-003 | [Adopt Microservices Architecture](./20260201-adopt-microservices.md) | Accepted | 2026-02-01 |
   ```

### Phase 5: Validate ADR Structure

1. **Read Created ADR File**
   - Read the newly created ADR file
   - Parse content to validate structure

2. **Verify Required Sections**
   - Check for required sections:
     - ✅ Title (# ADR-XXX: ...)
     - ✅ Status
     - ✅ Date
     - ✅ Deciders
     - ✅ Context section
     - ✅ Decision section
     - ✅ Consequences section
   - If any missing, display warning but don't fail

3. **Verify Formatting**
   - Title uses proper heading level (# for H1)
   - Metadata fields are bold (**Status:**)
   - Sections use proper heading level (## for H2)
   - Dates in YYYY-MM-DD format
   - Status is valid: Proposed, Accepted, Deprecated, or Superseded

4. **Generate Validation Report**
   - Display checklist of validated items
   - Note any warnings or missing sections
   - Suggest improvements if needed

### Phase 6: Optional Git Commit

1. **Check if Git Repository**
   - Run `git status` to check if in a git repository
   - If not in git repo, skip this phase

2. **Stage ADR Files**
   - Stage new ADR file: `git add docs/adr/{YYYYMMDD-purpose}.md`
   - Stage updated index: `git add docs/adr/000-README.md`

3. **Create Commit**
   - Generate commit message:
     ```
     docs: add ADR-XXX for {title}

     Created architectural decision record to document {brief description}.

     Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
     ```
   - Commit changes with generated message
   - Display commit hash to user

4. **Handle Errors**
   - If git commit fails (hooks, conflicts, etc.):
     - Display error message
     - Note that files were created but not committed
     - Suggest manual commit if needed

### Phase 7: Generate Summary Report

1. **Collect Creation Details**
   - ADR number assigned
   - Filename created
   - Index updated
   - Git commit status (if applicable)
   - Validation results

2. **Display Summary**
   - Show clear, concise creation summary:
     ```
     ✅ ADR created successfully!

     📄 ADR Details:
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     Number:   ADR-005
     Title:    Switch from Postgres to MySQL
     Status:   Proposed
     Date:     2026-02-09
     File:     docs/adr/20260209-switch-from-postgres-to-mysql.md

     ✅ Validations:
     - ✅ Required sections present
     - ✅ Proper formatting
     - ✅ Valid status
     - ✅ Indexed in 000-README.md

     📝 Git:
     - ✅ Committed (abc123f)

     🎯 Next Steps:
     1. Edit the ADR file to add more details if needed
     2. Update status when decision is accepted/rejected
     3. Link related ADRs if applicable
     4. Reference this ADR in relevant documentation
     ```

3. **Suggest Next Actions**
   - Edit ADR to add more context/details
   - Update related documentation (PRD, tech stack, etc.)
   - Create follow-up ADRs for related decisions
   - Update status when decision is finalized

## Input Format

**Command:**
```
/create-adr {purpose/title}
```

**Examples:**
```
/create-adr Switch from Postgres to MySQL
/create-adr Use Redis for caching
/create-adr Adopt microservices architecture
/create-adr Migrate to TypeScript
```

**Optional Arguments (Future):**
```
/create-adr {title} --status accepted          # Set status directly
/create-adr {title} --deciders "Team Lead"     # Set deciders
/create-adr {title} --no-commit                # Skip git commit
/create-adr {title} --template custom          # Use custom template
```

## Output Format

```
✅ ADR created successfully!

📄 ADR Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Number:   ADR-003
Title:    Use Redis for Caching
Status:   Proposed
Date:     2026-02-09
Deciders: Project Team
File:     docs/adr/20260209-use-redis-for-caching.md

✅ Validations:
- ✅ Title: # ADR-003: Use Redis for Caching
- ✅ Status: Proposed
- ✅ Date: 2026-02-09
- ✅ Deciders: Project Team
- ✅ Context section present
- ✅ Decision section present
- ✅ Consequences section present
- ✅ Proper Markdown formatting

📋 Index Updated:
- ✅ Added to docs/adr/000-README.md
- ✅ Table row inserted (newest first)
- ✅ Link verified

📝 Git:
- ✅ Files staged
- ✅ Committed: abc123f
- ✅ Message: "docs: add ADR-003 for use redis for caching"

🎯 Next Steps:
1. Edit docs/adr/20260209-use-redis-for-caching.md to add:
   - Detailed context and problem statement
   - Specific decision details
   - Positive and negative consequences
   - Alternatives considered
2. Update status to "Accepted" when decision is finalized
3. Link this ADR in relevant docs (150-tech-stacks, 325-backend)
4. Commit changes: git commit -m "docs: update ADR-003 details"

✨ ADR-003 created! Document your architectural decisions. ✨
```

## Filename Generation Logic

```typescript
function generateADRFilename(purpose: string): string {
  // Get current date
  const date = new Date()
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '')

  // Clean purpose
  const cleaned = purpose
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-')          // Spaces to hyphens
    .replace(/-+/g, '-')           // Multiple hyphens to single
    .slice(0, 50)                   // Limit length

  return `${yyyymmdd}-${cleaned}.md`
}

// Examples:
// "Switch from Postgres to MySQL" → "20260209-switch-from-postgres-to-mysql.md"
// "Use Redis for Caching!!" → "20260209-use-redis-for-caching.md"
```

## ADR Number Assignment

```typescript
function getNextADRNumber(): string {
  // Find all ADR files
  const adrFiles = glob('docs/adr/*.md')

  // Filter out README and count
  const adrCount = adrFiles.filter(f => !f.includes('000-README')).length

  // Next number (zero-padded)
  const nextNumber = (adrCount + 1).toString().padStart(3, '0')

  return `ADR-${nextNumber}`
}

// Examples:
// 0 existing ADRs → "ADR-001"
// 5 existing ADRs → "ADR-006"
// 99 existing ADRs → "ADR-100"
```

## Index Update Logic

```typescript
function updateADRIndex(adrNumber: string, title: string, filename: string, status: string, date: string) {
  // Read current index
  const indexContent = readFile('docs/adr/000-README.md')

  // Find table section
  const tableRegex = /\| ADR # \| Title \| Status \| Date \|[\s\S]*?\n\n/

  // Create new row
  const newRow = `| ${adrNumber} | [${title}](\./${filename}) | ${status} | ${date} |`

  // Insert after header (newest first)
  const updatedTable = indexContent.replace(
    /(\| ADR # \| Title \| Status \| Date \|\n\|-------|-------|--------|------\|)\n/,
    `$1\n${newRow}\n`
  )

  // Write updated index
  writeFile('docs/adr/000-README.md', updatedTable)
}
```

## Validation Checklist

The skill validates the following:

- ✅ **Filename Format**: YYYYMMDD-purpose.md
- ✅ **Title Present**: # ADR-XXX: {Title}
- ✅ **Status Valid**: One of [Proposed, Accepted, Deprecated, Superseded]
- ✅ **Date Format**: YYYY-MM-DD
- ✅ **Deciders Present**: Named individuals or roles
- ✅ **Context Section**: ## Context exists
- ✅ **Decision Section**: ## Decision exists
- ✅ **Consequences Section**: ## Consequences exists
- ✅ **Index Updated**: Entry added to 000-README.md
- ✅ **Markdown Valid**: Proper heading levels, formatting

## Important Notes

- **Chronological Order**: ADRs are indexed in reverse chronological order (newest first)
- **Immutable**: Once created, ADRs should not be deleted (update status to Deprecated/Superseded instead)
- **Numbered**: ADR numbers are sequential and permanent
- **Dated**: Filename includes date for easy sorting and reference
- **Status Evolution**: ADRs typically progress: Proposed → Accepted/Rejected → Deprecated/Superseded
- **Git Integration**: Automatic git commit keeps ADRs versioned
- **Template Consistency**: All ADRs follow same template from 000-README.md

## Error Handling

**Purpose Not Provided:**
- Display error: "Please provide an ADR title/purpose"
- Suggest: "/create-adr {purpose}"
- Example: "/create-adr Use Redis for caching"

**ADR Directory Not Found:**
- Display error: "ADR directory not found: docs/adr/"
- Suggest: "Run /setup first to create documentation structure"
- Or create directory if user confirms

**Duplicate Filename:**
- Display warning: "ADR with similar name exists: 20260209-use-redis.md"
- Options:
  - Append version suffix (-v2)
  - Ask user to provide different purpose
  - Show existing ADR content for reference

**Index Update Failed:**
- Display error: "Could not update ADR index"
- Note: "ADR file created but not indexed"
- Suggest: "Manually add entry to docs/adr/000-README.md"

**Git Commit Failed:**
- Display warning: "Git commit failed: {error}"
- Note: "ADR files created but not committed"
- Suggest: "Commit manually: git add docs/adr/ && git commit -m '...'"

**Validation Warnings:**
- Display warnings for missing optional sections
- Don't fail creation
- Suggest adding missing content

## Success Criteria

The `/create-adr` command is successful when:
1. ✅ ADR file created with proper filename format (YYYYMMDD-purpose.md)
2. ✅ ADR number assigned sequentially (ADR-XXX)
3. ✅ Required sections present (Status, Date, Deciders, Context, Decision, Consequences)
4. ✅ Index (000-README.md) updated with new entry
5. ✅ Entry added in reverse chronological order
6. ✅ Validation passes for structure and formatting
7. ✅ Git commit created (if in git repo)
8. ✅ User receives clear summary with next steps

## Future Enhancements

### v1.1.0
- Support for custom ADR templates
- Interactive mode for filling in all sections
- Validation against architectural constraints
- Cross-referencing related ADRs automatically

### v1.2.0
- ADR status update command (/update-adr-status)
- Supersede existing ADRs with new ones
- Generate ADR reports (by status, date range)
- Export ADRs to different formats (PDF, HTML)

### v1.3.0
- ADR approval workflow
- Integration with pull request reviews
- Automatic linking in related documentation
- ADR dependency graphs and visualization
