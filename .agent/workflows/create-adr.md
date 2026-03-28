---
description: Create a new Architectural Decision Record with proper formatting, indexing, and automatic git commit
---

1. Parse Input and Generate Filename
   Extract the ADR purpose/title from command arguments
   Clean the purpose string: convert to lowercase, replace spaces with hyphens, remove special characters
   Generate filename in format: YYYYMMDD-purpose.md (e.g., 20260209-use-redis-for-caching.md)

2. Check for Duplicate Filenames
   Search for existing ADR files in docs/adr/ directory
   If duplicate filename exists, append -v2, -v3, etc. or warn user
   Display warning if similar ADR name already exists

3. Determine Next ADR Number
   Find all ADR files in docs/adr/ (excluding 000-README.md)
   Count existing ADRs
   Calculate next ADR number as ADR-XXX (zero-padded 3 digits)
   Example: If 4 ADRs exist, next is ADR-005

4. Generate ADR Content
   Read ADR template structure from docs/adr/000-README.md
   Create ADR content with the following sections:
   - Title: # ADR-XXX: {purpose}
   - Status: Proposed (default)
   - Date: Current date in YYYY-MM-DD format
   - Deciders: Project Team (default)
   - Context section with placeholder
   - Decision section with placeholder
   - Consequences section (Positive and Negative)
   - Alternatives Considered section
   - Related ADRs section
   - References section

5. Write ADR File
   Write the generated content to docs/adr/YYYYMMDD-purpose.md
   Ensure proper Markdown formatting and line breaks

6. Update ADR Index Table
   Read docs/adr/000-README.md
   Find the ADR table section
   Create new table row: | ADR-XXX | [Title](./YYYYMMDD-purpose.md) | Proposed | YYYY-MM-DD |
   Insert new row at top of table (newest first, after header row)
   Write updated index file

7. Validate ADR Structure
   Read the newly created ADR file
   Verify required sections present:
   - Title with proper heading level
   - Status field (bold)
   - Date field in correct format
   - Context, Decision, Consequences sections
   Check Markdown formatting is correct
   Display validation checklist

8. Git Commit (if in repository)
   Check if current directory is a git repository
   If yes, stage the new ADR file and updated index:
   // turbo
   git add docs/adr/YYYYMMDD-purpose.md docs/adr/000-README.md

   Create commit with message:
   git commit -m "$(cat <<'EOF'
   docs: add ADR-XXX for {title}

   Created architectural decision record to document {brief description}.

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
   EOF
   )"

   Display commit hash
   If git commit fails, note that files were created but not committed

9. Generate Summary Report
   Display ADR creation summary:
   - ADR number assigned
   - Title and status
   - Filename created
   - Date
   - Index update status
   - Git commit status
   - Validation results

   Suggest next steps:
   - Edit ADR file to add detailed context
   - Update status when decision is finalized
   - Link related ADRs
   - Reference ADR in relevant documentation
