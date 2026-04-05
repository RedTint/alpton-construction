# Define Documentation Command

Elaborate and refine specific documentation files with AI assistance, using context from related documents to generate comprehensive content. Supports draft mode for working on documentation enhancements without affecting production docs, and finalize mode for promoting drafts to production.

## Execution Steps

### Phase 1: Parse Input and Validate Target Document

1. **Detect Operation Mode**
   - Check for `--draft` flag in command arguments
   - Check for `--finalize` flag in command arguments
   - Determine operation mode:
     - **Normal Mode**: No flags - standard document elaboration
     - **Draft Mode**: `--draft` flag present - creates draft version with `-draft` suffix
     - **Finalize Mode**: `--finalize` flag present - removes `-draft` suffix and promotes to production
   - Flags are mutually exclusive - if both present, show error

2. **Extract Target Document**
   - Parse the command arguments to extract the target filename
   - Support both relative paths (e.g., `002-prd-v1.0.0.md`) and full paths (e.g., `docs/002-prd-v1.0.0.md`)
   - If path doesn't include `docs/`, automatically prepend it
   - Extract any additional context/prompt provided by the user
   - For **Finalize Mode**: Validate document has `-draft` suffix, otherwise show error

3. **Validate Target Document**
   - **For Normal and Draft Mode:**
     - Use Read tool to check if the target document exists
     - If document doesn't exist, inform user and suggest running `/setup` first
     - Parse the current version number from filename (e.g., v1.0.0)
     - Identify document type based on filename prefix (002 = PRD, 100 = userflows, etc.)
   - **For Finalize Mode:**
     - Verify document has `-draft` suffix (e.g., `prd-v1.3.0-draft.md`)
     - Check if document exists
     - Parse version number (without `-draft` suffix)
     - Check if production version already exists
     - If production version exists, warn user about overwriting

4. **Read Current Content**
   - Read the entire target document
   - Identify existing sections and structure
   - Determine if document is a skeleton or already has content
   - Note any placeholder text or TODO items
   - **For Finalize Mode:** Skip elaboration - document already has final content

### Phase 2: Aggregate Context from Related Documents

**Note:** Skip this phase entirely for **Finalize Mode** - jump directly to Phase 6.

Based on the target document type, read related documents to gather context:

**For any document:**
- Always read `docs/001-project-init.md` if it exists (project vision)
- Always read `docs/002-prd-v1.0.0.md` (or latest version) if it exists

**For specific document types:**

**100-userflows (User Flows):**
- Read: 002-prd (personas), 125-design-system (UI context)

**125-design-system (Design System):**
- Read: 002-prd (product context), 100-userflows (user needs), 150-tech-stacks (frontend tech)

**150-tech-stacks (Tech Stack):**
- Read: 002-prd (requirements), 400-testing-strategy (testing needs), 425-devops (infrastructure needs)

**175-c4-diagrams (Architecture):**
- Read: 002-prd, 150-tech-stacks, 300-frontend, 325-backend, 350-api-contract, 375-database-schema

**200-atomic-stories (User Stories):**
- Read: 002-prd, 100-userflows, 125-design-system, 150-tech-stacks
- **⚠️ SCRIPT-FIRST FLOW:** When the target document is `200-atomic-stories`, do NOT write stories inline. Instead:
  1. Plan epics and stories (determine epic IDs, story titles, UACs, priorities, points, dependencies)
  2. For each epic, ensure epic directory exists: `docs/epics/{epicId}-{slug}/`
  3. For each story, call `create-story-file.js` to create the story file directly in `docs/epics/`:
     ```bash
     node .ai-dev/ai-dev-scripts/create-story-file.js \
       --epic=001 \
       --title="Story Title" \
       --priority=high \
       --points=8 \
       --description="As a user, I want... So that..." \
       --tags=v1.0.0,frontend,api \
       --dependencies=001-001,002-100 \
       --uacs='[{"type":"FE","text":"User can see dashboard"},{"type":"BE","text":"API returns data"},{"type":"TEST","text":"Unit tests pass"}]'
     ```
  4. After all stories are created, regenerate the atomic-stories index:
     ```bash
     node .ai-dev/ai-dev-scripts/sync-board.js --generate-index --docs-path=./docs
     ```
  5. The `200-atomic-stories` doc becomes a **read-only table index** — never edit it manually
  - This flow eliminates format parsing issues and ensures story files are always valid
  - If the agent needs to create a NEW epic, first create the epic directory and `epic.md`:
    ```bash
    mkdir -p docs/epics/{epicId}-{slug}/{pending,in-progress,qa,done,blocked}
    ```
    Then create `docs/epics/{epicId}-{slug}/epic.md` with YAML frontmatter:
    ```yaml
    ---
    epic_id: "001"
    epic_name: "Epic Name"
    epic_version: "v1.0.0"
    ---
    ```

**300-frontend (Frontend Architecture):**
- Read: 125-design-system, 150-tech-stacks, 350-api-contract, 200-atomic-stories

**325-backend (Backend Architecture):**
- Read: 150-tech-stacks, 350-api-contract, 375-database-schema, 200-atomic-stories

**350-api-contract (API Contract):**
- Read: 002-prd, 150-tech-stacks, 300-frontend, 325-backend, 200-atomic-stories

**375-database-schema (Database Schema):**
- Read: 002-prd, 150-tech-stacks, 325-backend, 350-api-contract, 200-atomic-stories

**400-testing-strategy (Testing):**
- Read: 150-tech-stacks, 200-atomic-stories, 300-frontend, 325-backend

**425-devops (DevOps):**
- Read: 150-tech-stacks, 300-frontend, 325-backend, 375-database-schema

**450-workers (Background Jobs):**
- Read: 150-tech-stacks, 325-backend, 375-database-schema, 200-atomic-stories

**progress/000-progress (Progress Tracking):**
- Read: 200-atomic-stories (all versions)

**For ADRs (adr/*.md):**
- Read: 175-c4-diagrams, relevant implementation docs based on ADR topic

4. **Aggregate Context**
   - Use Glob tool to find latest versions of related documents
   - **For Draft Mode:** Exclude other `-draft` documents to maintain isolation
   - **For Normal Mode:** Include all production documents
   - Read all related documents in parallel
   - Extract relevant information from each
   - Build comprehensive context for the AI generation

5. **Include User's Additional Context**
   - Append any additional prompt/context provided by the user
   - Combine with aggregated context from related documents

### Phase 3: Generate Comprehensive Content

**Note:** Skip this phase entirely for **Finalize Mode** - jump directly to Phase 6.

1. **Synthesize Information**
   - Analyze the target document's purpose and structure
   - Review all aggregated context
   - Identify gaps or missing information
   - Plan comprehensive content that:
     - Addresses all sections in the document
     - Uses information from related documents
     - Maintains consistency across documentation
     - Provides concrete, actionable content
     - Includes examples where appropriate

2. **Generate Content**
   - Fill in all skeleton sections with detailed content
   - Maintain the existing document structure (headers, formatting)
   - Preserve version number in filename
   - Keep the document header (Project, Version, Date)
   - Update "Last Updated" or "Date" field to current date if present
   - Include cross-references to related documents where relevant
   - Add Mermaid diagrams where appropriate (flows, architecture, ERDs)

3. **Ensure Quality**
   - Content should be specific to this project (not generic)
   - Use concrete examples based on project context
   - Maintain consistent terminology across documents
   - Follow best practices for the document type
   - Ensure technical accuracy

### Phase 4: Update Target Document

**Note:** Skip this phase entirely for **Finalize Mode** - jump directly to Phase 6.

1. **Write Updated Content**
   - **For Draft Mode:**
     - Determine draft filename: Add `-draft` suffix before file extension
       - Example: `002-prd-v1.3.0.md` → `002-prd-v1.3.0-draft.md`
     - Write content to draft filename
     - Preserve original file if it exists
   - **For Normal Mode:**
     - Use Edit tool (preferred) or Write tool to update the document
     - Preserve the original filename and version
   - Ensure all formatting is correct
   - Maintain markdown conventions

2. **Validate Structure**
   - Verify all major sections are present
   - Check that headers follow proper hierarchy
   - Ensure code blocks and diagrams are properly formatted
   - Confirm version number is preserved in content and filename

### Phase 5: Version Management

**Note:** Skip this phase entirely for **Finalize Mode** - jump directly to Phase 6.

1. **Ask About Version Increment**
   - **For Draft Mode:** Skip version increment question - always keep current version with `-draft` suffix
   - **For Normal Mode:** Use AskUserQuestion tool to ask if version should be incremented
   - Present options:
     - "Keep current version (v1.0.0)" - Content updates without structural changes
     - "Increment patch version (v1.0.1)" - Bug fixes, minor clarifications
     - "Increment minor version (v1.1.0)" - New sections, significant additions (Recommended for major content updates)
     - "Increment major version (v2.0.0)" - Breaking changes, complete rewrites
   - Set multiSelect: false (single choice)

2. **Handle Version Increment**
   - If user chooses to increment version:
     - Parse current version (e.g., v1.0.0 → major=1, minor=0, patch=0)
     - Calculate new version based on choice
     - Create new filename with new version (e.g., `002-prd-v1.1.0.md`)
     - Use Bash to copy file to new version:
       ```bash
       cp docs/002-prd-v{current}.md docs/002-prd-v{new}.md
       ```
     - Keep old version file intact (version history)
     - Use Edit tool to update "Version" field in document header to match new version
     - **IMPORTANT:** Never use Write tool - always `cp` then Edit for version creation
   - If user keeps current version:
     - Document already updated in place
     - No additional file operations needed

### Phase 6: Finalize Draft (Finalize Mode Only)

**Note:** This phase only executes in **Finalize Mode**. For Normal/Draft modes, skip to Phase 7.

1. **Remove Draft Suffix**
   - Parse draft filename: `002-prd-v1.3.0-draft.md`
   - Generate production filename: `002-prd-v1.3.0.md`
   - Read draft document content
   - Write content to production filename (without `-draft` suffix)
   - Optionally delete draft file after successful write

2. **Update Cross-References**
   - Use Grep to search for references to the draft file across all documentation
   - Find patterns like:
     - `002-prd-v1.3.0-draft.md`
     - `prd-v1.3.0-draft`
     - References in related documents
   - Update all references to remove `-draft` suffix
   - Use Edit tool to update each file with cross-references

3. **Validate Finalized Document**
   - Read the finalized document
   - Verify structure is complete
   - Check all sections are present
   - Ensure no TODO or placeholder text
   - Validate version number is correct

4. **Trigger Progress Update**
   - Inform user to run `/update-progress` to track completion
   - Finalized documents can now be picked up by `/build` skills

5. **Generate Finalization Summary**
   - List what was finalized:
     - Draft filename → Production filename
     - Number of cross-references updated
     - Files affected by cross-reference updates
   - Confirm document is now production-ready
   - Note that `/build` skills can now process it

### Phase 7: Update CLAUDE.md References

1. **Check if CLAUDE.md Needs Update**
   - **For Finalize Mode:** Update references from draft to production filename
   - **For Draft Mode:** Skip CLAUDE.md update - draft documents not referenced
   - **For Normal Mode:** Read `.claude/CLAUDE.md`
   - Search for references to the updated document
   - If document is referenced and version was incremented:
     - Update version references in CLAUDE.md
     - Use Edit tool to update specific version strings
   - If new document type was created (not previously referenced):
     - Consider adding it to CLAUDE.md documentation structure section

2. **Update CLAUDE.md**
   - Replace old version references with new version (e.g., `v1.0.0` → `v1.1.0`)
   - Maintain all other content unchanged
   - Ensure formatting is preserved

### Phase 8: Provide Summary

1. **Generate Summary Report**
   - **For Finalize Mode:**
     - Display finalization summary (already generated in Phase 6.5)
     - Skip suggestion of next documents
   - **For Draft Mode:**
     - List what was created:
       - Draft document name (with `-draft` suffix)
       - Key sections that were elaborated
       - Related documents used for context (excluding other drafts)
       - Note: Draft excluded from `/build` skills
       - Note: Can be refined with multiple `/define --draft` calls
     - Suggest next actions:
       - Continue refining with `/define --draft`
       - Finalize with `/define --finalize`
   - **For Normal Mode:**
     - List what was updated:
       - Target document name and version
       - Key sections that were elaborated
       - Related documents used for context
       - Version increment action taken (if any)
       - CLAUDE.md update status
     - Highlight major changes or additions
     - Suggest next steps (e.g., which document to define next)

2. **Suggest Next Documents**
   - Based on the document dependency graph, recommend which document to define next
   - Follow logical progression: 001 → 002 → 100 → 125 → 150 → 175 → 200 → 300/325 → 350 → 375 → 400 → 425 → 450
   - **Special case — `200-atomic-stories`:** When the target document is atomic stories, the agent should have already used `create-story-file.js` for each story (see Phase 2 context). Now regenerate the atomic-stories index:
     ```
     📋 Regenerating Atomic Stories Index...

     Stories created directly in docs/epics/ via create-story-file.js.
     Regenerating 200-atomic-stories as a read-only index...
     ```

     Execute:
     ```bash
     node .ai-dev/ai-dev-scripts/sync-board.js --generate-index --docs-path=./docs
     ```

     Then display results and continue:
     ```
     ✅ Atomic stories index regenerated!

     📋 Index Results:
     - {N} stories across {M} epics
     - {P} total story points
     - File: docs/200-atomic-stories-v{X}.md (read-only index)

     Story files include:
     - ✅ v2 YAML frontmatter with all required fields
     - ✅ Related documentation links (auto-discovered)
     - ✅ Changelog with creation timestamp
     - ✅ Dependency tracking for DAG visualization

     Documentation Sequence:
     1. ✅ docs/epics/ structure populated (Complete)
     2. ✅ 200-atomic-stories-v{X}.md index generated (Complete)
     3. ⏳ 300-frontend-v{X}.md
     4. ⏳ 325-backend-v{X}.md
     ...
     ```

     If sync-board.js reports errors, display them and suggest manual `/sync-board` run.

## Input Format

**Normal Mode (Standard Elaboration):**
```
/define @{document-name} {optional additional context}
```

**Draft Mode (Create Draft Version):**
```
/define --draft @{document-name} {optional additional context}
```

**Finalize Mode (Promote Draft to Production):**
```
/define --finalize @{document-name-with-draft-suffix}
```

**Examples:**

**Normal Mode:**
```
/define @002-prd-v1.0.0.md
/define @100-userflows-v1.0.0.md based on the personas from PRD
/define @150-tech-stacks-v1.0.0.md suggest appropriate tech stack for a SaaS product
/define @200-atomic-stories-v1.0.0.md for MVP features only
/define @docs/350-api-contract-v1.0.0.md include authentication endpoints
```

**Draft Mode:**
```
/define --draft @350-api-contract-v1.1.0.md add new authentication endpoints
/define --draft @002-prd-v1.3.0.md add analytics integration features
/define --draft @300-frontend-v1.2.0.md update component architecture
```

**Finalize Mode:**
```
/define --finalize @002-prd-v1.3.0-draft.md
/define --finalize @350-api-contract-v1.1.0-draft.md
/define --finalize @docs/300-frontend-v1.2.0-draft.md
```

## Output Format

**Normal Mode Output:**
```
✅ Document elaborated successfully!

📄 Updated Document: docs/002-prd-v1.0.0.md
🔄 Version Action: Incremented to v1.1.0 (new file created)
📝 New File: docs/002-prd-v1.1.0.md

🔍 Context Used:
- docs/001-project-init.md - Project vision and initial brainstorm

📋 Sections Elaborated:
- Product Overview and Vision
- User Personas (3 detailed personas)
- Features Breakdown (15 features)
- MVP Scope (v1.0.0 definition)
- Roadmap (v1.1.0, v1.2.0)
- Success Criteria

🔗 Cross-References Added:
- Referenced user flows in 100-userflows-v1.0.0.md
- Linked to tech stack decisions in 150-tech-stacks-v1.0.0.md

📚 CLAUDE.md Updated:
- Updated version reference from v1.0.0 to v1.1.0

🎯 Next Steps:

**Recommended Next Document:**
/define @100-userflows-v1.0.0.md based on the personas from PRD

**Documentation Sequence:**
1. ✅ 002-prd-v1.1.0.md (Complete)
2. ⏭️ 100-userflows-v1.0.0.md (Next)
3. ⏳ 125-design-system-v1.0.0.md
4. ⏳ 150-tech-stacks-v1.0.0.md
5. ⏳ 175-c4-diagrams-v1.0.0.md
6. ⏳ 200-atomic-stories-v1.0.0.md
```

**Draft Mode Output:**
```
✅ Draft document created successfully!

📄 Draft Document: docs/350-api-contract-v1.1.0-draft.md
🔒 Draft Status: Isolated from production docs
⚠️ Build Skills: Will NOT process this draft (excluded)

🔍 Context Used (Production Only):
- docs/002-prd-v1.0.0.md - Product requirements
- docs/150-tech-stacks-v1.0.0.md - Technology stack
- docs/300-frontend-v1.0.0.md - Frontend architecture
- docs/325-backend-v1.0.0.md - Backend architecture

📋 Sections Elaborated:
- Authentication Endpoints (OAuth 2.0, JWT)
- User Management API
- Request/Response Schemas
- Error Handling Standards

🔄 Draft Workflow:
- ✅ Draft created with isolated context
- ⏳ Can be refined: /define --draft @350-api-contract-v1.1.0-draft.md
- ⏳ Ready to finalize: /define --finalize @350-api-contract-v1.1.0-draft.md

🎯 Next Steps:

**Option 1: Continue Refining Draft**
/define --draft @350-api-contract-v1.1.0-draft.md add payment endpoints

**Option 2: Finalize Draft**
/define --finalize @350-api-contract-v1.1.0-draft.md

**Note:** Draft documents are excluded from `/build` skills. Finalize to make them production-ready.
```

**Finalize Mode Output:**
```
✅ Draft finalized successfully!

📄 Finalized Document: docs/002-prd-v1.3.0.md
📝 Promoted From: docs/002-prd-v1.3.0-draft.md
✅ Production Ready: Can now be processed by /build skills

🔗 Cross-References Updated (3 files):
- docs/200-atomic-stories-v1.3.0.md (2 references updated)
- docs/300-frontend-v1.3.0.md (1 reference updated)
- .claude/CLAUDE.md (version reference updated)

✅ Validation:
- ✅ Document structure complete
- ✅ All sections present
- ✅ No placeholder text
- ✅ Version number correct (v1.3.0)
- ✅ Markdown formatting valid

🎯 Next Steps:

1. **Update Progress Tracking:**
   /update-progress

2. **Build Skills Can Now Process:**
   - /build (will detect new version)
   - /build-fe (if frontend UACs present)
   - /build-be (if backend UACs present)
   - /build-devops (if DevOps UACs present)

✨ Document is now production-ready! ✨
```

## Important Notes

- **Version Preservation:** Always preserve the version number unless user explicitly requests increment
- **Context Aggregation:** Always read related documents to maintain consistency
- **User Participation:** User provides project-specific context through 001-project-init.md and additional prompts
- **Quality Over Speed:** Take time to generate comprehensive, high-quality content
- **Cross-References:** Link related documents to create cohesive documentation
- **Version History:** Keep old version files intact when incrementing versions
- **CLAUDE.md Sync:** Always update CLAUDE.md when versions change
- **Validation:** Verify document structure and formatting before completion
- **Suggestions:** Guide users through logical documentation sequence
- **Draft Mode Isolation:** Draft documents use production context but don't affect it - other drafts are excluded
- **Draft Iteration:** Can run `/define --draft` multiple times to refine the same draft
- **Draft Exclusion:** Draft documents (with `-draft` suffix) are excluded from `/build` skills
- **Build Warnings:** When drafts exist, `/build` skills should show warnings
- **Finalize Safety:** Always validate document before finalizing - cannot easily revert
- **Cross-Reference Updates:** Finalize mode updates ALL references to draft across documentation
- **Production Promotion:** Only finalize when draft is complete and ready for implementation

## Error Handling

**Document Not Found:**
- Inform user the document doesn't exist
- Suggest running `/setup` first
- List available documents in docs/ directory

**Missing Context Documents:**
- Proceed with available context
- Inform user which context documents are missing
- Suggest defining those documents first for better results

**Version Parsing Error:**
- Default to keeping current version
- Inform user about the parsing issue
- Ask for clarification on desired version

**CLAUDE.md Update Failure:**
- Complete the document update successfully
- Inform user that CLAUDE.md needs manual update
- Provide exact changes needed

**Both Flags Present (--draft and --finalize):**
- Display error: "Cannot use both --draft and --finalize flags together"
- Explain: "--draft creates draft version, --finalize promotes draft to production"
- Suggest correct usage:
  - `/define --draft @{doc}` to create draft
  - `/define --finalize @{doc-draft}` to finalize

**Finalize Without Draft Suffix:**
- Display error: "Document must have -draft suffix to finalize"
- Current filename: `{provided-name}`
- Expected format: `{name}-v{version}-draft.md`
- Suggest: Check filename or use `/define --draft` first

**Draft File Not Found (Finalize Mode):**
- Display error: "Draft document not found: {filename}"
- Suggest: Check if draft was created with `/define --draft`
- List existing draft files in docs/ directory

**Production Version Already Exists (Finalize Mode):**
- Display warning: "Production version already exists: {production-filename}"
- Use AskUserQuestion to ask:
  - "Overwrite existing production version"
  - "Cancel finalization"
- If overwrite: Proceed with backup note
- If cancel: Exit without changes

**Cross-Reference Update Failures (Finalize Mode):**
- Complete finalization of main document
- Display warning: "Some cross-reference updates failed"
- List files that couldn't be updated
- Provide manual update instructions
- Document is still production-ready

## Success Criteria

The `/define` command is successful when:

**Normal Mode:**
1. ✅ Target document is elaborated with comprehensive content
2. ✅ Content uses context from related documents
3. ✅ Document structure and formatting are preserved
4. ✅ Version management is handled correctly
5. ✅ CLAUDE.md is updated if version changed
6. ✅ User receives clear summary of changes
7. ✅ Next steps are suggested to guide workflow

**Draft Mode:**
1. ✅ Draft document created with `-draft` suffix
2. ✅ Content uses production context (excludes other drafts)
3. ✅ Draft is isolated - doesn't affect production docs
4. ✅ Document structure and formatting are correct
5. ✅ User receives draft summary with refinement options
6. ✅ Draft is excluded from `/build` skills
7. ✅ Can be refined with multiple calls

**Finalize Mode:**
1. ✅ Draft document successfully promoted to production filename
2. ✅ All cross-references updated across documentation
3. ✅ Document validated for completeness
4. ✅ CLAUDE.md updated with production reference
5. ✅ Draft file optionally removed
6. ✅ User receives finalization summary
7. ✅ Document is now processable by `/build` skills
8. ✅ Progress tracking notification provided
