---
description: Elaborate and refine specific documentation files with AI assistance, using context from related documents
---

1. Parse Input and Extract Target Document
   Parse command arguments to extract the target filename
   Support both relative paths (002-prd-v1.0.0.md) and full paths (docs/002-prd-v1.0.0.md)
   If path doesn't include docs/, automatically prepend it
   Extract any additional context/prompt provided by user

2. Validate Target Document Exists
   Check if the target document exists at the specified path
   If document doesn't exist, inform user and suggest running /setup first
   Parse current version number from filename (e.g., v1.0.0)
   Identify document type based on filename prefix (002 = PRD, 100 = userflows, etc.)

3. Read Current Document Content
   Read the entire target document
   Identify existing sections and structure
   Determine if document is a skeleton or already has content
   Note any placeholder text or TODO items

4. Aggregate Context from Related Documents
   Based on document type, read related documents:

   For any document:
   - Always read docs/001-project-init.md (project vision)
   - Always read docs/002-prd-v*.md (latest version)

   For specific document types:
   - 100-userflows: Read 002-prd, 125-design-system
   - 125-design-system: Read 002-prd, 100-userflows, 150-tech-stacks
   - 150-tech-stacks: Read 002-prd, 400-testing-strategy, 425-devops
   - 175-c4-diagrams: Read 002-prd, 150-tech-stacks, 300/325/350/375
   - 200-atomic-stories: Read 002-prd, 100-userflows, 125-design-system, 150-tech-stacks
     ⚠️ SCRIPT-FIRST: Do NOT write stories inline. Use create-story-file.js per story:
     node .ai-dev/ai-dev-scripts/create-story-file.js --epic=NNN --title="..." --priority=high --points=N --uacs='[...]' --description="..."
     Then regenerate index: node .ai-dev/ai-dev-scripts/sync-board.js --generate-index --docs-path=./docs
   - 300-frontend: Read 125-design-system, 150-tech-stacks, 350-api-contract, 200-atomic-stories
   - 325-backend: Read 150-tech-stacks, 350-api-contract, 375-database-schema, 200-atomic-stories
   - 350-api-contract: Read 002-prd, 150-tech-stacks, 300-frontend, 325-backend, 200-atomic-stories
   - 375-database-schema: Read 002-prd, 150-tech-stacks, 325-backend, 350-api-contract
   - 400-testing-strategy: Read 150-tech-stacks, 200-atomic-stories, 300-frontend, 325-backend
   - 425-devops: Read 150-tech-stacks, 300-frontend, 325-backend, 375-database-schema
   - 450-workers: Read 150-tech-stacks, 325-backend, 375-database-schema, 200-atomic-stories

   Find latest versions using pattern matching (e.g., docs/*-v*.md)
   Read all related documents
   Extract relevant information from each

5. Synthesize and Generate Comprehensive Content
   Analyze the target document's purpose and structure
   Review all aggregated context from related documents
   Identify gaps or missing information
   Generate comprehensive content that:
   - Addresses all sections in the document
   - Uses information from related documents
   - Maintains consistency across documentation
   - Provides concrete, actionable content
   - Includes examples where appropriate
   - Adds Mermaid diagrams where relevant (flows, architecture, ERDs)

6. Update Target Document
   Fill in all skeleton sections with detailed content
   Maintain existing document structure (headers, formatting)
   Preserve version number in filename
   Keep document header (Project, Version, Date)
   Update "Last Updated" or "Date" field to current date
   Include cross-references to related documents
   Write updated content to the file

7. Ask User About Version Increment
   // Note: Manual user input required
   // Original: AskUserQuestion tool
   // Antigravity: User must decide version increment

   Present version increment options to user:
   - "Keep current version (v1.0.0)" - Content updates without structural changes
   - "Increment patch (v1.0.1)" - Bug fixes, minor clarifications
   - "Increment minor (v1.1.0)" - New sections, significant additions (Recommended for major updates)
   - "Increment major (v2.0.0)" - Breaking changes, complete rewrites

8. Handle Version Increment (if user chooses to increment)
   If user decides to increment version:
   - Parse current version (e.g., v1.0.0 → major=1, minor=0, patch=0)
   - Calculate new version based on user's choice
   - Create new filename with new version (e.g., 002-prd-v1.1.0.md)
   - // Copy-then-edit pattern (token-efficient)
   - Run: cp docs/002-prd-v{current}.md docs/002-prd-v{new}.md
   - Keep old version file intact (version history)
   - Edit new file to update "Version" field in document header to match new version
   - // IMPORTANT: Never use full write - always cp then Edit

   If user keeps current version:
   - Document already updated in place
   - No additional file operations needed

9. Update CLAUDE.md References (if version changed)
   Read .claude/CLAUDE.md
   Search for references to the updated document
   If document is referenced and version was incremented:
   - Replace old version references with new version (e.g., v1.0.0 → v1.1.0)
   - Maintain all other content unchanged
   - Write updated CLAUDE.md

10. Generate Summary Report
    Display what was updated:
    - Target document name and version
    - Key sections that were elaborated
    - Related documents used for context
    - Version increment action taken (if any)
    - CLAUDE.md update status

    Suggest next documents based on dependency graph:
    Recommended sequence: 001 → 002 → 100 → 125 → 150 → 175 → 200 → 300/325 → 350 → 375 → 400 → 425 → 450

11. Regenerate Atomic Stories Index (if atomic stories updated)
    If the target document matches `200-atomic-stories-v*.md`:
    Stories should already be created via create-story-file.js (see step 4).
    Now regenerate the read-only index:
    // turbo
    Run: node .ai-dev/ai-dev-scripts/sync-board.js --generate-index --docs-path=./docs
    Display: "📋 Atomic stories index regenerated from docs/epics/"
    Display index results (stories count, points, epics count)

    If any errors from sync-board.js:
    Display error details and suggest manual /sync-board run
