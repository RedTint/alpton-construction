---
description: Create releases with version tagging, release notes, and documentation tracking
---

1. Determine Release Version
   Find latest release:
   Find files matching: docs/releases/release-v*.md
   Parse version numbers (semantic versioning: vMAJOR.MINOR.PATCH)
   Identify latest: v1.0.0

   Ask user for version increment:
   - Patch (v1.0.0 → v1.0.1): Bug fixes, small improvements
   - Minor (v1.0.0 → v1.1.0): New features, backward compatible
   - Major (v1.0.0 → v2.0.0): Breaking changes, major features

   Provide context:
   Read docs/progress/000-progress-v*.md
   Count completed stories since last release
   Display: "Completed since last release: 4 stories (build-skill, build-fe, build-be, build-devops)"

   Suggest appropriate version:
   If has breaking changes → suggest Major
   If has new features → suggest Minor
   If only bug fixes → suggest Patch

   Calculate new version based on choice
   Validate format: vMAJOR.MINOR.PATCH

2. Gather Release Context
   Read latest progress document:
   Find: docs/progress/000-progress-v*.md
   Extract:
   - Overall completion percentage
   - Completed stories since last release
   - Story details (title, effort, completion date)
   - Milestone status

   Read latest atomic stories:
   Find: docs/200-atomic-stories-v*.md
   Extract version info for completed stories
   Group by version (v1.0.0, v1.1.0, v1.2.0)

   Scan epic files for completion (epic-aware):
   Find files matching: docs/epics/*/epic.md
   For each epic.md: read epic_id, epic_name, epic_status, completion_pct, total_stories, completed_stories, total_points
   Identify newly completed epics: completion_pct == 100 AND epic_status != "completed"
   Store epic metrics for release notes and post-release epic status updates

   Check git status:
   Run: git status
   Warn if uncommitted changes exist
   Suggest committing before release

   Run: git log --oneline -20
   Extract commit messages for release notes

3. Identify Documentation Versions
   Find all versioned docs and track latest versions:

   Run: ls docs/002-prd-v*.md | sort -V | tail -1
   Run: ls docs/100-userflows-v*.md | sort -V | tail -1
   Run: ls docs/125-design-system-v*.md | sort -V | tail -1
   Run: ls docs/150-tech-stacks-v*.md | sort -V | tail -1
   Run: ls docs/175-c4-diagrams-v*.md | sort -V | tail -1
   Run: ls docs/200-atomic-stories-v*.md | sort -V | tail -1
   Run: ls docs/300-frontend-v*.md | sort -V | tail -1
   Run: ls docs/325-backend-v*.md | sort -V | tail -1
   Run: ls docs/350-api-contract-v*.md | sort -V | tail -1
   Run: ls docs/375-database-schema-v*.md | sort -V | tail -1
   Run: ls docs/400-testing-strategy-v*.md | sort -V | tail -1
   Run: ls docs/425-devops-v*.md | sort -V | tail -1
   Run: ls docs/450-workers-v*.md | sort -V | tail -1
   Run: ls docs/progress/000-progress-v*.md | sort -V | tail -1

   Build documentation alignment manifest

4. Generate Release Notes
   Create docs/releases/release-v{version}.md with comprehensive sections:

   ---
   # Release Notes v{version}

   **Release Version:** v{version}
   **Release Date:** {today}
   **Release Type:** {Patch/Minor/Major}
   **Previous Version:** v{prev_version}

   ## Summary

   {1-2 paragraphs overview of release highlights}

   **Highlights:**
   - ✅ Feature 1
   - ✅ Feature 2
   - ✅ Feature 3

   ## New Features

   ### Story {ID}: {Title}
   {Description of feature}

   **Capabilities:**
   - Capability 1
   - Capability 2

   **Deliverables:**
   - File 1
   - File 2

   ## Enhancements

   - Enhancement 1
   - Enhancement 2

   ## Bug Fixes

   - Fix 1
   - Fix 2

   ## Breaking Changes (if major release)

   - Change 1 and migration steps
   - Change 2 and migration steps

   ## Documentation Alignment

   | Document | Version | File |
   |----------|---------|------|
   | Product Requirements | v{x.y.z} | docs/002-prd-v{x.y.z}.md |
   | User Flows | v{x.y.z} | docs/100-userflows-v{x.y.z}.md |
   | ... (all 14 docs) ... |

   ## Metrics

   **Stories Delivered:** {N} stories
   **Story Points:** {N} points
   **Lines of Code:** {N} lines
   **Test Coverage:** {N}%

   ## Known Issues

   - Issue 1 and workaround
   - Issue 2 and workaround

   ## Installation

   {Installation instructions}

   ## Upgrade Notes

   {Upgrade instructions from previous version}

   ## Contributors

   - Claude Sonnet 4.5
   - {User names}

   ## Next Steps

   Upcoming in v{next}:
   - Feature 1
   - Feature 2
   ---

5. Add Epic Completion Section to Release Notes
   If any epics are fully completed (completion_pct == 100):
   Add to release notes file:

   ## Epic Completion

   | Epic | Stories | Points | Status |
   |------|---------|--------|--------|
   | Epic {id} — {name} | {completed}/{total} | {completed_pts}/{total_pts} | ✅ Complete |

   If epics are partially complete, add ## Epic Progress section with a similar table.

6. Update Progress Documentation
   Edit docs/progress/000-progress-v*.md:

   Add release milestone to Milestones table:
   | v{version} Release | {date} | ✅ Complete | 100% |

   Add change log entry:
   ### {date} - 🚀 Release v{version}
   - **Released v{version} - {summary}**
   - **Release Type:** {type}
   - **Stories Included:** {count} ({IDs})
   - **Story Points Delivered:** {N} points
   - **Documentation Alignment:** {N} files tracked
   - **Key Achievements:**
     - ✅ Achievement 1
     - ✅ Achievement 2
   - 📄 **Release Notes:** [v{version}](../releases/release-v{version}.md)
   - 🏷️ **Git Tag:** v{version}

7. Update Completed Epic Statuses (epic-aware)
   For each epic with completion_pct == 100 AND epic_status != "completed":
   Edit docs/epics/{epicDir}/epic.md frontmatter:
   - epic_status: completed
   - updated_at: {ISO timestamp}
   Run: node .ai-dev/ai-dev-scripts/aggregate-epics.js --update --docs-path=./docs --epic={epicId}
   Display: "✅ Epic {epicId} — {epicName} marked as completed"

8. Update Repository README
   Edit README.md:

   Update version badge:
   ![Version](https://img.shields.io/badge/version-v{version}-blue)

   Update Latest Release section:
   ## Latest Release: v{version} ({date})

   {Brief summary of release}

   ### What's New in v{version}
   - ✅ Feature 1
   - ✅ Feature 2

   📄 [Full Release Notes](docs/releases/release-v{version}.md)

   Update Documentation Versions table:
   ## Documentation Versions

   | Document | Version | File |
   |----------|---------|------|
   | ... all 14 docs with current versions ... |

   Full alignment manifest: [v{version} Release Notes](docs/releases/release-v{version}.md#documentation-alignment)

9. Create Git Tag
   Verify git repository:
   Run: git rev-parse --git-dir
   If not git repo, warn and skip tagging

   Check for existing tag:
   Run: git tag -l "v{version}"
   If exists, ask user: delete and recreate, skip, or cancel

   Stage release files:
   Run: git add docs/releases/release-v{version}.md
   Run: git add docs/progress/000-progress-v*.md
   Run: git add README.md

   Create commit:
   Run: git commit -m "Release v{version}

   - Created release notes
   - Updated progress tracking
   - Updated README with version and documentation alignment

   Includes Stories: {story-ids}
   Documentation Aligned: {doc-count} files tracked

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

   Create annotated tag:
   Run: git tag -a "v{version}" -m "Release v{version}

   {Release summary from release notes}

   Full release notes: docs/releases/release-v{version}.md"

   Verify tag created:
   Run: git tag -l "v{version}"

10. Prompt for Remote Push
   Ask user: "Do you want to push to remote repository?"
   Options:
   - Yes, push now
   - No, push later (provide commands)

   If yes:
   Run: git push origin main
   Run: git push origin v{version}

   Handle errors:
   - No remote configured → suggest: git remote add origin {url}
   - Push rejected → suggest: git pull --rebase origin main
   - No network → suggest: push manually later

11. Generate Release Summary
   Display comprehensive report:

   🚀 Release v{version} Created Successfully!

   📊 Release Summary:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Version:           v{old} → v{new}
   Release Date:      {date}
   Release Type:      {Patch/Minor/Major}

   📦 Content:
   Stories Included:  {N} ({story-ids})
   Story Points:      {N}
   New Features:      {N}
   Bug Fixes:         {N}
   Documentation:     {N}

   📚 Documentation Alignment:
   Tracked Files:     {N} documentation files
   Latest Versions:   Atomic Stories v{x.y.z}, Progress v{x.y.z}

   📄 Files Created/Updated:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - ✅ docs/releases/release-v{version}.md (created)
   - ✅ docs/progress/000-progress-v*.md (updated - milestone added)
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
   5. Begin work on next version (v{next})

   📄 Release Notes: docs/releases/release-v{version}.md
   🏷️ Git Tag: v{version}

   ✨ Release complete! Ready to share with the world! ✨

IMPORTANT NOTES:
- Semantic versioning: vMAJOR.MINOR.PATCH
- Track all documentation versions (14+ files)
- Update progress document with release milestone
- README synchronization mandatory
- Git commit and annotated tag required
- Optional remote push with user confirmation
- Comprehensive release notes auto-generated
- Documentation alignment manifest critical for traceability
