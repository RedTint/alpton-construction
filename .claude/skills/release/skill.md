# Release Management Command

Create and manage project releases with automatic version tagging, release notes generation, documentation alignment tracking, and progress updates.

## Execution Steps

### Phase 1: Determine Release Version

1. **Find Latest Release**
   - Use Glob to find all existing releases: `docs/releases/release-v*.md`
   - Parse version numbers from filenames (semantic versioning: vMAJOR.MINOR.PATCH)
   - Identify the latest release version
   - Example: If releases exist for v0.0.1, v1.0.0, find that v1.0.0 is latest
   - If no releases exist, default to v0.0.0 as previous version

2. **Ask User for Version Increment**
   - Use AskUserQuestion to prompt user for version increment type:
     - **Patch (v1.0.0 → v1.0.1)**: Bug fixes, small improvements, no new features
     - **Minor (v1.0.0 → v1.1.0)**: New features, backward compatible
     - **Major (v1.0.0 → v2.0.0)**: Breaking changes, major new features
     - **Custom**: User specifies exact version number
   - Provide context about completed stories/features to help decision
   - Example:
     ```
     Current version: v1.0.0
     Completed since last release: 4 stories (build-skill, build-fe, build-be, build-devops)

     Suggested: Minor release (v1.1.0) - New code generation features added
     ```

3. **Calculate New Version Number**
   - Based on user's choice, calculate new version:
     - Patch: Increment patch number (v1.0.0 → v1.0.1)
     - Minor: Increment minor, reset patch (v1.0.3 → v1.1.0)
     - Major: Increment major, reset minor and patch (v1.2.5 → v2.0.0)
     - Custom: Use user-provided version
   - Validate version follows semantic versioning format (vMAJOR.MINOR.PATCH)
   - Confirm new version with user before proceeding

### Phase 2: Gather Release Context

1. **Read Latest Progress Document**
   - Use Glob to find latest progress: `docs/progress/000-progress-v*.md`
   - Read the progress document
   - Extract:
     - Overall completion percentage
     - Completed stories since last release
     - Story details (title, effort, completion date)
     - Milestone status
     - Any active blockers or risks

2. **Read Latest Atomic Stories**
   - Use Glob to find latest atomic stories: `docs/200-atomic-stories-v*.md`
   - Read the document
   - Extract version information for completed stories
   - Group completed stories by version (v1.0.0, v1.1.0, v1.2.0)
   - Identify which stories are included in this release

3. **Scan Epic Files for Completion** (Epic-Aware)
   - Glob: `docs/epics/*/epic.md`
   - For each `epic.md`: read `epic_id`, `epic_name`, `epic_status`, `completion_pct`, `total_stories`, `completed_stories`, `total_points`, `completed_points`, `epic_version`
   - Identify **newly completed epics**: `completion_pct == 100` AND `epic_status != "completed"`
   - Identify **partially completed epics**: `completion_pct > 0` AND `completion_pct < 100`
   - Store all epic metrics for release notes and post-release epic status updates

4. **Check Git Status**
   - Run `git status` to check for uncommitted changes
   - If uncommitted changes exist:
     - Warn user about uncommitted changes
     - Suggest committing changes before creating release
     - Ask if user wants to proceed anyway
   - Run `git log` to get recent commits since last release tag
   - Extract commit messages for release notes

4. **Identify Documentation Versions**
   - Use Glob to find all documentation files with versions
   - Track which documentation versions are current:
     - `002-prd-v*.md` (Product Requirements)
     - `100-userflows-v*.md` (User Flows)
     - `125-design-system-v*.md` (Design System)
     - `150-tech-stacks-v*.md` (Tech Stacks)
     - `175-c4-diagrams-v*.md` (C4 Diagrams)
     - `200-atomic-stories-v*.md` (Atomic Stories)
     - `300-frontend-v*.md` (Frontend Architecture)
     - `325-backend-v*.md` (Backend Architecture)
     - `350-api-contract-v*.md` (API Contract)
     - `375-database-schema-v*.md` (Database Schema)
     - `400-testing-strategy-v*.md` (Testing Strategy)
     - `425-devops-v*.md` (DevOps Strategy)
     - `450-workers-v*.md` (Workers - optional)
     - `progress/000-progress-v*.md` (Progress Tracking)
   - Create documentation alignment manifest

### Phase 3: Generate Release Notes

1. **Categorize Changes**
   - Group completed stories by category:
     - **New Features**: New capabilities added
     - **Enhancements**: Improvements to existing features
     - **Bug Fixes**: Issues resolved
     - **Documentation**: Documentation updates
     - **Infrastructure**: DevOps, CI/CD improvements
     - **Breaking Changes**: Incompatible changes (for major releases)
   - Extract story details for each category
   - Include story points and effort metrics

2. **Generate Summary Section**
   - Write overview of release highlights
   - Include key achievements and milestones
   - Mention any breaking changes or migration requirements
   - Provide context about release scope
   - Example:
     ```markdown
     ## Summary

     This release introduces the complete code generation toolkit (v1.1.0), enabling
     full-stack development automation with comprehensive testing support. The new
     /build-skill, /build-fe, /build-be, and /build-devops commands provide end-to-end
     code generation capabilities from documentation.

     **Highlights:**
     - ✅ Complete code generation toolkit (4 new commands)
     - ✅ 5,449 lines of skill definitions created
     - ✅ Test-first approach with unit, integration, E2E tests
     - ✅ Multi-environment support (dev, staging, production)
     ```

3. **Generate Features Section**
   - List all new features with descriptions
   - Include User Acceptance Criteria (UACs) completed
   - Reference story IDs
   - Format:
     ```markdown
     ## New Features

     ### Code Generation Toolkit (Stories 100-103)

     **Story 100: Build Skill Meta-Command**
     - Created `/build-skill` command for rapid skill creation
     - Comprehensive validation and error handling
     - CLAUDE.md auto-update integration
     - 522 lines of skill definition

     **Story 101: Build Frontend Command**
     - Created `/build-fe` command for frontend code generation
     - Unit tests (Vitest) and E2E tests (Playwright)
     - 80% coverage enforcement
     - 1,508 lines of skill definition
     ```

4. **Generate Epic Completion Section**
   - If any epics are fully completed (from Phase 2 Step 3):
     ```markdown
     ## Epic Completion

     The following epics were completed in this release:

     ### Epic 007 — Sync-Board & Project Management System ✅
     - **Stories:** 13/13 completed
     - **Points:** 170/170 delivered
     - **Version:** v1.6.0
     - **All stories moved to `done/`**
     ```
   - If epics are partially complete, list progress metrics:
     ```markdown
     ## Epic Progress

     | Epic | Stories | Points | Completion |
     |------|---------|--------|------------|
     | Epic 005 — Knowledge Management | 6/9 | 85/130 | 65% |
     | Epic 007 — Sync-Board | 13/13 | 170/170 | 100% ✅ |
     ```
   - Omit section entirely if no epics have progress > 0%

5. **Generate Known Issues Section**
   - List any active blockers from progress document
   - Note limitations or caveats
   - Provide workarounds if available
   - Example:
     ```markdown
     ## Known Issues

     - Automated tests not yet implemented (manual testing only)
     - Performance testing command pending (Story 205)
     ```

5. **Generate Installation/Upgrade Section**
   - Provide instructions for using this release
   - Note any migration steps required
   - List prerequisite documentation
   - Example:
     ```markdown
     ## Installation

     This is a template repository. To use:

     1. Clone the repository
     2. Run `/setup` to initialize documentation
     3. Use code generation commands: `/build-fe`, `/build-be`, `/build-devops`

     ## Upgrade Notes

     No breaking changes from v1.0.0. All existing documentation remains compatible.
     ```

6. **Generate Documentation Alignment Section**
   - List all documentation versions used in this release
   - Provide manifest of aligned documentation
   - Example:
     ```markdown
     ## Documentation Alignment

     This release is aligned with the following documentation versions:

     - Product Requirements: v1.1.0
     - User Flows: v1.1.0
     - Design System: v1.0.0
     - Tech Stacks: v1.0.0
     - C4 Diagrams: v1.0.0
     - Atomic Stories: v1.1.0
     - Frontend Architecture: v1.0.0
     - Backend Architecture: v1.0.0
     - API Contract: v1.0.0
     - Database Schema: v1.0.0
     - Testing Strategy: v1.0.0
     - DevOps Strategy: v1.0.0
     - Progress Tracking: v1.1.0
     ```

7. **Generate Contributors Section**
   - List contributors to this release
   - Include AI agent contributions (Claude Sonnet 4.5)
   - Example:
     ```markdown
     ## Contributors

     - Claude Sonnet 4.5 (AI Development Agent)
     - [User Name] (Project Lead)
     ```

8. **Generate Next Steps Section**
   - Suggest what to work on next
   - Reference upcoming stories or features
   - Provide roadmap context
   - Example:
     ```markdown
     ## Next Steps

     Upcoming in v1.2.0:
     - Conversion mapping documentation (Story 202)
     - Performance testing command (Story 205)
     - Release management enhancements (Story 206)
     ```

### Phase 4: Create Release File

1. **Generate Release File Path**
   - Format: `docs/releases/release-v{version}.md`
   - Example: `docs/releases/release-v1.1.0.md`
   - Ensure docs/releases/ directory exists (create if needed)

2. **Write Release Notes**
   - Use Write tool to create release file
   - Include all generated sections:
     - Header (version, date, project name)
     - Summary
     - New Features
     - Enhancements
     - Bug Fixes
     - Documentation
     - Infrastructure
     - Breaking Changes (if major release)
     - Known Issues
     - Installation/Upgrade Notes
     - Documentation Alignment
     - Contributors
     - Next Steps
   - Format in clean, readable markdown
   - Include emojis for visual appeal (✅, 🚀, ⚠️, 📚)

3. **Validate Release File**
   - Read back the created file
   - Verify all sections present
   - Check markdown formatting
   - Ensure version number is correct throughout

### Phase 5: Update Progress Documentation

1. **Read Latest Progress File**
   - Find and read: `docs/progress/000-progress-v*.md`

2. **Add Release Milestone**
   - Find the "Milestones" section
   - Add new milestone entry for this release
   - Mark as Complete (✅)
   - Example:
     ```markdown
     | v1.1.0 Release | Feb 10, 2026 | ✅ Complete | 100% |
     ```

3. **Add Release to Change Log**
   - Add entry to Change Log section in progress document
   - Include release version, date, and summary
   - Example:
     ```markdown
     ### February 10, 2026 - Release v1.1.0
     - 🚀 Released v1.1.0 with complete code generation toolkit
     - Included Stories: 100, 101, 102, 103
     - Total: 4 stories, 52 story points delivered
     - Documentation aligned: 13 files tracked
     ```

4. **Update Release Notes Reference**
   - Add link to release notes in progress document
   - Example:
     ```markdown
     📄 Release Notes: [v1.1.0](../releases/release-v1.1.0.md)
     ```

5. **Save Updated Progress File**
   - Use Edit tool to update progress document
   - Preserve all existing content

6. **Update Completed Epic Statuses** (Epic-Aware)
   - For each epic identified in Phase 2 Step 3 with `completion_pct == 100` and `epic_status != "completed"`:
     - Edit `docs/epics/{epicDir}/epic.md` frontmatter:
       - `epic_status: completed`
       - `updated_at: {ISO now}`
     - Run: `node .ai-dev/ai-dev-scripts/aggregate-epics.js --update --docs-path=./docs --epic={epicId}`
   - Display confirmation: "✅ Epic {epicId} — {epicName} marked as completed"

### Phase 6: Update Repository README

1. **Read Current README.md**
   - Read root `README.md` file
   - Identify version badge or version section
   - If no version section exists, plan to add one

2. **Update Version Badge**
   - Find version badge (if exists):
     ```markdown
     ![Version](https://img.shields.io/badge/version-v1.0.0-blue)
     ```
   - Update to new version:
     ```markdown
     ![Version](https://img.shields.io/badge/version-v1.1.0-blue)
     ```
   - If no badge exists, add one at top of README

3. **Update Version in README Header**
   - Find and update version mentions in README
   - Common locations:
     - Project title header
     - Installation instructions
     - Quick start section
   - Example:
     ```markdown
     # AI Dev Agency v1.1.0

     Current version: **v1.1.0**
     ```

4. **Add Latest Release Section**
   - If "Latest Release" section exists, update it
   - If not, add after project description
   - Include:
     - Release version and date
     - Brief summary
     - Link to full release notes
   - Example:
     ```markdown
     ## Latest Release: v1.1.0 (February 10, 2026)

     Complete code generation toolkit now available! This release includes
     /build-skill, /build-fe, /build-be, and /build-devops commands for
     end-to-end development automation.

     📄 [Full Release Notes](docs/releases/release-v1.1.0.md)
     ```

5. **Update Documentation Alignment in README**
   - Add or update "Documentation Versions" section
   - List all current documentation versions
   - Example:
     ```markdown
     ## Documentation Versions

     This release uses the following documentation versions:

     | Document | Version |
     |----------|---------|
     | Product Requirements | v1.1.0 |
     | User Flows | v1.1.0 |
     | Design System | v1.0.0 |
     | Tech Stacks | v1.0.0 |
     | Atomic Stories | v1.1.0 |
     | Progress Tracking | v1.1.0 |

     Full alignment manifest: [v1.1.0 Release Notes](docs/releases/release-v1.1.0.md#documentation-alignment)
     ```

6. **Save Updated README**
   - Use Edit tool to update README.md
   - Preserve all existing content
   - Only update version-related sections

### Phase 7: Create Git Tag

1. **Verify Git Repository**
   - Check if current directory is a git repository
   - Run `git rev-parse --git-dir`
   - If not a git repo, skip git tagging and warn user

2. **Check for Existing Tag**
   - Run `git tag -l "v{version}"` to check if tag already exists
   - If tag exists:
     - Warn user: "Tag v{version} already exists"
     - Ask if user wants to:
       - Delete and recreate tag (force)
       - Skip tagging
       - Cancel release

3. **Commit Release Changes**
   - Stage release-related files:
     - `git add docs/releases/release-v{version}.md`
     - `git add docs/progress/000-progress-v*.md`
     - `git add README.md`
   - Create commit with release message:
     ```bash
     git commit -m "Release v{version}

     - Created release notes
     - Updated progress tracking
     - Updated README with version and documentation alignment

     Includes Stories: {story-ids}
     Documentation Aligned: {doc-count} files tracked"
     ```
   - If commit fails (nothing to commit), continue to tagging

4. **Create Annotated Git Tag**
   - Create annotated tag with release notes summary:
     ```bash
     git tag -a "v{version}" -m "Release v{version}

     {Release summary from release notes}

     Full release notes: docs/releases/release-v{version}.md"
     ```
   - Verify tag was created: `git tag -l "v{version}"`

5. **Prompt for Remote Push**
   - Ask user if they want to push to remote:
     - "Yes" - Push commit and tag to remote
     - "No" - Skip pushing (user can push manually later)
   - If yes, run:
     ```bash
     git push origin main
     git push origin v{version}
     ```
   - Handle errors gracefully (no remote, push rejected, etc.)

### Phase 8: Generate Release Summary

1. **Collect Release Metrics**
   - Version number (old → new)
   - Release date
   - Stories included (count and IDs)
   - Story points delivered
   - Files created/modified
   - Documentation alignment count
   - Git tag status
   - README update status

2. **Display Comprehensive Summary**
   ```
   🚀 Release v{version} created successfully!

   📊 Release Summary:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Version:           v{old-version} → v{new-version}
   Release Date:      {date}
   Release Type:      {Patch/Minor/Major}

   📦 Content:
   Stories Included:  {count} ({story-ids})
   Story Points:      {points}
   New Features:      {count}
   Bug Fixes:         {count}
   Documentation:     {count}

   📚 Documentation Alignment:
   Tracked Files:     {count} documentation files
   Latest Versions:   Atomic Stories v{version}, Progress v{version}

   📄 Files Created/Updated:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - ✅ docs/releases/release-v{version}.md (created)
   - ✅ docs/progress/000-progress-v{version}.md (updated - milestone added)
   - ✅ README.md (updated - version and documentation alignment)

   🏷️ Git Operations:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - ✅ Commit created: "Release v{version}"
   - ✅ Tag created: v{version}
   - {✅/⏳} Pushed to remote: {yes/no/skipped}

   🎯 Next Steps:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. Review release notes: docs/releases/release-v{version}.md
   2. {If not pushed} Push to remote: git push origin main && git push origin v{version}
   3. Share release notes with team
   4. Announce release to users
   5. Begin work on next version (v{next-version})

   📄 Release Notes: docs/releases/release-v{version}.md
   🏷️ Git Tag: v{version}

   ✨ Release complete! Ready to share with the world! ✨
   ```

3. **Provide Release Checklist**
   - Post-release actions:
     - Review release notes for accuracy
     - Verify git tag pushed to remote
     - Update project website/documentation (if applicable)
     - Announce release on communication channels
     - Close completed milestones in project tracker
     - Plan next release cycle

## Input Format

**Command:**
```
/release
```

No arguments required - interactive prompts guide user through release process.

**Examples:**
```
/release
```

## Output Format

```
🚀 Release v1.1.0 created successfully!

📊 Release Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Version:           v1.0.0 → v1.1.0
Release Date:      February 10, 2026
Release Type:      Minor

📦 Content:
Stories Included:  4 (100, 101, 102, 103)
Story Points:      52
New Features:      4
Bug Fixes:         0
Documentation:     1

📚 Documentation Alignment:
Tracked Files:     13 documentation files
Latest Versions:   Atomic Stories v1.1.0, Progress v1.1.0

📄 Files Created/Updated:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- ✅ docs/releases/release-v1.1.0.md (created)
- ✅ docs/progress/000-progress-v1.1.0.md (updated)
- ✅ README.md (updated)

🏷️ Git Operations:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- ✅ Commit created: "Release v1.1.0"
- ✅ Tag created: v1.1.0
- ✅ Pushed to remote: origin/main, tag v1.1.0

🎯 Next Steps:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Review release notes: docs/releases/release-v1.1.0.md
2. Share release notes with team
3. Announce release to users
4. Begin work on v1.2.0

📄 Release Notes: docs/releases/release-v1.1.0.md
🏷️ Git Tag: v1.1.0

✨ Release complete! Ready to share with the world! ✨
```

## Important Notes

- **Semantic Versioning**: Follow semver strictly (vMAJOR.MINOR.PATCH)
- **Interactive Process**: User chooses version increment type with context
- **Documentation Alignment**: Tracks all documentation versions for traceability
- **Atomic Operation**: All file updates happen together (rollback on failure)
- **Git Integration**: Creates commit and annotated tag automatically
- **README Sync**: Keeps README.md version information current
- **Progress Tracking**: Updates progress document with release milestone
- **Comprehensive Release Notes**: Auto-generates from completed stories
- **Story Points Tracking**: Calculates total effort delivered in release
- **Next Version Suggestion**: Helps plan upcoming releases
- **Remote Push Optional**: User decides whether to push immediately
- **Validation**: Verifies all files created successfully before tagging
- **Rollback Safe**: If any step fails, provides recovery guidance

## Error Handling

**No Progress Document Found:**
- Display error: "Progress document not found: docs/progress/000-progress-v*.md"
- Suggest: "Run /update-progress first to create progress tracking"
- Exit with error

**No Atomic Stories Found:**
- Display error: "Atomic stories not found: docs/200-atomic-stories-v*.md"
- Suggest: "Create atomic stories using /define @docs/200-atomic-stories"
- Exit with error

**No Completed Stories:**
- Display warning: "No completed stories found since last release"
- Ask user: "Do you want to create release anyway? (Empty release)"
- If yes, create release with note about no new features
- If no, exit gracefully

**Invalid Version Format:**
- Display error: "Invalid version format: {version}"
- Require: "Version must follow semantic versioning (vMAJOR.MINOR.PATCH)"
- Example: "v1.2.3"
- Ask user to provide valid version

**Git Tag Already Exists:**
- Display warning: "Git tag v{version} already exists"
- Ask user:
  - Force recreate tag (delete and recreate)
  - Skip git tagging
  - Cancel release
- Handle based on user choice

**Uncommitted Changes:**
- Display warning: "You have uncommitted changes in working directory"
- Show: `git status` output
- Ask user:
  - Proceed anyway (will commit release files only)
  - Cancel to commit changes first
- If proceed, create release without staging uncommitted files

**Git Push Failed:**
- Display error: "Failed to push to remote: {error}"
- Common causes:
  - No remote configured
  - Push rejected (out of date)
  - No network connection
- Suggest: "Release created locally. Push manually: git push origin main && git push origin v{version}"
- Continue with local release (don't fail entire process)

**README Update Failed:**
- Display warning: "Could not update README.md: {error}"
- Continue with release creation
- Note that README needs manual update
- Provide exact changes to make manually

**Progress Update Failed:**
- Display warning: "Could not update progress document: {error}"
- Continue with release creation
- Note that progress needs manual milestone addition
- Provide exact entry to add

**Documentation File Not Found:**
- Display warning: "Documentation file not found: {file}"
- Note in documentation alignment section
- Mark as "Not available" in manifest
- Continue with release

## Success Criteria

The `/release` command is successful when:

1. ✅ User prompted for version increment type
2. ✅ New version number calculated correctly
3. ✅ Latest progress document read and parsed
4. ✅ Latest atomic stories read and parsed
5. ✅ Completed stories identified for this release
6. ✅ Documentation versions tracked and recorded
7. ✅ Release notes generated with all sections
8. ✅ Release file created: `docs/releases/release-v{version}.md`
9. ✅ Progress document updated with release milestone
10. ✅ README.md updated with new version
11. ✅ README.md updated with documentation alignment
12. ✅ Git commit created for release changes
13. ✅ Git tag created: v{version}
14. ✅ User informed about push status
15. ✅ Comprehensive summary report displayed
16. ✅ User receives next steps guidance
17. ✅ Documentation alignment manifest complete
18. ✅ Release is ready to share
19. ✅ Epic files scanned: `completion_pct` and `epic_status` read from all `docs/epics/*/epic.md`
20. ✅ Completed epics updated: `epic_status: completed` written + `aggregate-epics.js --update` run
21. ✅ Epic completion metrics included in release notes

## Future Enhancements

### v1.2.0
- Automatic changelog generation from git commits
- Integration with GitHub Releases API
- Release notes templates customization
- Multi-project release coordination

### v1.3.0
- Automated semantic version suggestion (based on commit messages)
- Release branch creation and management
- Pre-release and release candidate support
- Release approval workflow

### v2.0.0
- Integration with package registries (npm, PyPI, Docker Hub)
- Automated deployment on release
- Release analytics and metrics
- Rollback capabilities
