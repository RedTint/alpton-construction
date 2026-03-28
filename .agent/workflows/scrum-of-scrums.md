---
description: Create parallel workstream documentation with separate atomic stories and progress tracking for independent feature development
---

1. Parse and Validate Workstream Description
   Extract workstream short description from arguments (kebab-case, 2-4 words)
   Examples: "cli-dashboard", "mobile-app", "admin-portal", "api-v2"

   Convert to kebab-case if needed:
   - Lowercase all characters
   - Replace spaces/underscores with hyphens
   - Remove special characters
   - Trim leading/trailing hyphens

2. Generate Workstream ID
   Find existing workstreams:
   Run: ls -d docs/scrums/*/ 2>/dev/null | sort

   Parse highest numeric ID from directory names
   Calculate next ID (highest + 1)
   Format as 3-digit zero-padded (001, 002, etc.)

3. User Input: Select Parent-Mapped Documents
   // Note: Manual user input required
   // Original: AskUserQuestion with multi-select

   Ask user which documents should reference parent instead of creating workstream versions:
   - 001-project-init.md (project vision - usually shared)
   - 002-prd-v*.md (product requirements - usually shared)
   - 100-userflows-v*.md (user flows)
   - 125-design-system-v*.md (design system)
   - 150-tech-stacks-v*.md (tech stack)
   - 175-c4-diagrams-v*.md (architecture diagrams)
   - 300-frontend-v*.md (frontend architecture)
   - 325-backend-v*.md (backend architecture)
   - 350-api-contract-v*.md (API contract)
   - 375-database-schema-v*.md (database schema)
   - 400-testing-strategy-v*.md (testing strategy)
   - 425-devops-v*.md (DevOps infrastructure)
   - 450-workers-v*.md (background jobs)

   Note: 200-atomic-stories and progress are ALWAYS workstream-specific

4. Create Workstream Directory Structure
   // turbo
   mkdir -p docs/scrums/{ID}-{description}
   mkdir -p docs/scrums/{ID}-{description}/progress
   mkdir -p docs/scrums/{ID}-{description}/adr
   mkdir -p docs/scrums/{ID}-{description}/releases

5. Create Workstream README
   Write comprehensive README to docs/scrums/{ID}-{description}/000-README.md
   Include:
   - Workstream overview and purpose
   - Parent-mapped documents list (with links)
   - Workstream-specific documents list
   - Documentation structure
   - Workflow guide
   - Team structure (optional)

6. Create Workstream Atomic Stories
   Write initial atomic stories to docs/scrums/{ID}-{description}/200-atomic-stories-v1.0.0.md
   Include:
   - Story format documentation
   - Placeholder for workstream stories
   - Example story W{ID}-001
   - Link to parent atomic stories

7. Create Workstream Progress Tracking
   Write initial progress to docs/scrums/{ID}-{description}/progress/000-progress-v1.0.0.md
   Include:
   - Workstream summary (0% completion initially)
   - Story tracking structure
   - Change log with creation entry
   - Next steps section

8. Create Workstream ADR Index
   Write ADR index to docs/scrums/{ID}-{description}/adr/000-README.md
   Include:
   - Link to parent ADRs
   - Placeholder for workstream ADRs
   - Usage instructions

9. Create Parent-Mapped Reference Files
   For each parent-mapped document selected by user:
   Create .ref.md file in workstream directory
   Format: {filename}.ref.md
   Content: Link to parent document with workstream-specific notes

10. Create Workstream-Specific Document Placeholders
    For each non-parent-mapped document:
    Create placeholder file in workstream directory
    Copy structure from parent but leave as templates
    Add workstream context to headers

11. Update Parent README
    Edit docs/000-README.md
    Add workstream entry to "Workstreams (Scrum of Scrums)" section
    Format: - **[{ID}-{description}](scrums/{ID}-{description}/000-README.md)** - {Purpose}

12. Display Summary
    Show comprehensive workstream creation summary:
    - Workstream ID and name
    - Directory path
    - Parent-mapped documents count
    - Workstream-specific documents count
    - Created files list
    - Next steps for development
