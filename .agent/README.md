# Antigravity Workflows

These workflows were automatically converted from Claude Code Skills.

## Available Workflows

Total: 33 workflows

### Meeting Management
- `/meetings-new` - Create structured meeting notes with automatic template generation (5,159 chars)
- `/meetings-edit` - Update meeting notes with AI-assisted improvements and backups (5,324 chars)
- `/meetings-update-progress` - Sync action items and decisions to SUMMARY.md with carry-forward tracking (7,560 chars)
- `/meetings-search` - Search across all meeting notes with powerful filtering (6,959 chars)

### Setup & Documentation
- `/setup` - Initialize project documentation structure (7,204 chars)
- `/review-and-setup` - Analyze existing codebase and generate documentation (7,476 chars)
- `/define` - Elaborate documentation files (5,167 chars)
- `/update-progress` - Update progress tracking (4,078 chars)
- `/create-adr` - Create architectural decision records (3,020 chars)
- `/scrum-of-scrums` - Create parallel workstream documentation structures (3,965 chars)
- `/workstream-build` - Build workstream features with auto-detection (3,812 chars)
- `/workstream-update-progress` - Update workstream progress tracking (3,908 chars)

### Development
- `/new-feature` - Add new feature requirements with draft mode support (8,273 chars)
- `/build` - Build orchestrator (5,330 chars)
- `/build-skill` - Create new Claude Code Skills (1,503 chars)
- `/build-fe` - Generate frontend implementation with tests (7,904 chars)
- `/build-be` - Generate backend implementation with tests (11,988 chars)
- `/build-devops` - Generate infrastructure, CI/CD, deployment automation (12,326 chars)

### Design System
- `/design` - Design workflow with 4 operation modes (10,205 chars)
- `/design-research` - Research UI designs with AI assistance (6,263 chars)

### Analytics Integration
- `/google-analytics` - Google Analytics 4 planning and implementation (10,226 chars)

### Quality & Release
- `/log-bug` - Log bugs into atomic stories and progress documentation (6,989 chars)
- `/fix-bug` - Locate, analyze, and fix bugs with Root Cause Analysis (10,674 chars)
- `/log-learning` - Capture learnings with searchable knowledge base and README index (4,328 chars)
- `/code-review` - Comprehensive code review with structured reporting (8,946 chars)
- `/release` - Create releases with version tagging and documentation tracking (9,154 chars)

### Research & Utilities
- `/research` - Internet research with dated materials, references, confidence/relevance scoring (8,553 chars)
- `/create-ai-dev-persona` - Create RPG-style AI development personas (10,143 chars)
- `/set-ai-dev-persona` - Activate AI dev personas to transform agent behavior (9,110 chars)
- `/create-landing-page` - Generate high-converting landing pages (9,882 chars)
- `/sync-board` - Generate backend/src/data/board.json from documentation (7,382 chars)
- `/create-pr` - Create GitHub pull request (5,217 chars)

## Usage

In Antigravity IDE, trigger workflows with:

```
/workflow-name
```

Examples:
```
/setup
/build-fe
/release
```

You can also pass arguments where applicable:
```
/create-adr Switch from Postgres to MySQL
/define @002-prd-v1.0.0.md
```

## Important Notes

### Manual Testing Required
Test each workflow in Antigravity before relying on it. All workflows have been validated to be under Antigravity's 12,000 character limit.

### Character Limits (All workflows ✅ validated)
| Workflow | Characters | Status |
|----------|------------|--------|
| build-skill | 1,503 | ✅ Under limit (12.5%) |
| create-adr | 3,020 | ✅ Under limit (25.1%) |
| update-progress | 4,078 | ✅ Under limit (33.9%) |
| log-learning | 4,328 | ✅ Under limit (36.1%) |
| define | 5,167 | ✅ Under limit (43.0%) |
| build | 5,330 | ✅ Under limit (44.4%) |
| setup | 7,204 | ✅ Under limit (60.0%) |
| review-and-setup | 7,476 | ✅ Under limit (62.3%) |
| build-fe | 7,904 | ✅ Under limit (65.8%) |
| new-feature | 8,273 | ✅ Under limit (68.9%) |
| release | 9,154 | ✅ Under limit (76.2%) |
| design | 10,205 | ✅ Under limit (85.0%) |
| google-analytics | 10,226 | ✅ Under limit (85.2%) |
| research | 8,553 | ✅ Under limit (71.3%) |
| build-be | 11,520 | ✅ Under limit (96.0%) |
| build-devops | 11,923 | ✅ Under limit (99.3%) |

**Total:** 245,091 characters across 33 workflows
**Average:** 7,427 characters per workflow (61.9% of 12,000 limit)

### Source of Truth
Claude Skills in `.claude/skills/` remain canonical. After updating Claude Skills, re-run `/convert-to-antigravity` to regenerate workflows.

## Customization

Feel free to modify these workflows for Antigravity-specific optimizations:
- Simplify steps for your specific workflow
- Combine or split workflows as needed
- Optimize for Antigravity execution patterns

**Note:** Changes made here won't sync back to Claude Skills.

## Workflow Descriptions

### /setup
Initialize new project documentation structure
- Creates directory structure (docs/, progress/, releases/, adr/)
- Creates comprehensive documentation guide
- Sets up skeleton files for all documentation
**Use Case:** Starting brand new software project

### /review-and-setup
Analyze existing codebase and generate comprehensive documentation
- Explores project structure and identifies technologies
- Analyzes frontend, backend, database, DevOps setup
- Extracts actual architecture from code
- Generates complete documentation based on real implementation
**Use Case:** Documenting existing/legacy codebase

### /create-adr
Create architectural decision records with automatic indexing
- Filename generation (YYYYMMDD-purpose.md)
- ADR numbering (ADR-001, ADR-002, etc.)
- Index table updates and git commits

### /update-progress
Automatically update progress tracking
- Reads atomic stories and current progress
- Calculates completion percentages
- Identifies blockers and updates story statuses

### /define
Elaborate documentation files
- Reads related context documents
- Generates comprehensive content
- Maintains consistency across docs
- Manages document versions

### /build
Orchestrate implementation
- Analyzes pending UACs from atomic stories
- Detects available build commands
- Coordinates builds based on user selection

### /build-skill
Create new Claude Code Skills (not Antigravity workflows)
- Analyzes existing skills for patterns
- Generates comprehensive skill.md files
- Updates CLAUDE.md with new command
**Note:** Creates Claude Skills, then run /convert-to-antigravity for Antigravity version

### /build-fe
Generate frontend implementation with comprehensive tests
- Reads design system, API contract, frontend architecture
- Generates React/Next.js components with Tailwind styling
- Creates unit tests (Vitest) and E2E tests (Playwright)
- Enforces 80% test coverage minimum
- Validates with linter and type checker

### /build-be
Generate backend implementation with comprehensive tests
- Reads API contract (PRIMARY), database schema, backend architecture
- Generates API endpoints, services, repositories
- Creates database models and migrations
- Generates unit and integration tests
- Enforces 80% test coverage minimum
**CRITICAL:** API contract is LAW - matches exactly

### /build-devops
Generate infrastructure, CI/CD pipelines, deployment automation
- Generates multi-stage Dockerfiles for frontend/backend
- Creates docker-compose.yml for local development
- Generates GitHub Actions CI/CD pipelines (PR, staging, production)
- Creates Terraform infrastructure modules
- Sets up monitoring, alerting, secrets management
**CRITICAL:** Always re-reads docs/425-devops-v1.0.0.md (evolving document)

### /release
Create releases with version tagging and documentation tracking
- Interactive version selection (patch/minor/major)
- Auto-generates comprehensive release notes
- Tracks documentation alignment (14+ files)
- Updates progress document and README
- Creates git commit and annotated tag
- Optional remote push

### /new-feature
Add new feature requirements with draft mode support
- Accepts feature description with optional --draft flag
- Analyzes feature impact (FE, BE, DB, DevOps)
- Auto-creates draft versions of PRD and Atomic Stories
- Generates architecture docs for affected components
- Creates draft ADR documenting architectural decisions
- Version consistency across all documents

### /design
Design workflow with 4 operation modes
- `--research`: UI design options with mockups
- `--plan`: Component integration planning
- `--storybook`: Versioned component examples (5+ story variants)
- `--update-fe`: Frontend component updates with PR creation
- Context-driven from 5+ documentation files
- Design system alignment validation

### /google-analytics
Google Analytics 4 planning and implementation
- `--plan` mode: Creates comprehensive analytics implementation plan
  - Identifies 2-5 conversion funnels
  - Maps page views, interactions, conversions, custom events
  - Defines KPIs and custom dimensions
  - GA4 configuration with privacy compliance (GDPR/CCPA)
  - Analytics provider comparison
  - Testing checklist
- `--implement` mode: Generates tracking code with 27+ tests
  - 5 implementation files (config, gtag, hooks, component)
  - 15 unit tests + 12 E2E tests
  - Privacy-first implementation

### /log-learning
Capture and document learnings from development, debugging, and implementations
- Creates learning documents in `docs/learnings/` folder
- Filename format: `{YYYYMMDD}-{domain}-{short-desc}.md`
- Multi-domain tagging (FE, BE, DevOps, DB, Testing, Design, Architecture)
- Auto-numbered learnings (LEARN-001, LEARN-002, etc.)
- Searchable README.md index with abstracts and keywords
- Domain-specific lists for easy browsing
- Integrates with progress tracking
- Code snippets and related document links
- Statistics by domain and recent activity
**Note:** Domain selection is manual (no AskUserQuestion in Antigravity)

### /research
Conduct comprehensive internet research
- Dated materials in `docs/research/` (YYMMddHHmm format)
- 8 scope options (Technical, Best Practices, Use Cases, etc.)
- Confidence scoring (⭐-⭐⭐⭐⭐⭐) based on source authority
- Relevance scoring (⭐-⭐⭐⭐⭐⭐) based on query alignment
- References with excerpts and annotations
- Follow-up research prompts
- README.md index with research abstracts
**Note:** Manual web research required (no WebSearch automation)

### /scrum-of-scrums
Create parallel workstream documentation structures for independent feature development
- Creates `docs/scrums/{ID}-{description}/` directory structure
- User selects which parent documents to map vs create workstream-specific versions
- Always creates separate workstream atomic-stories and progress tracking
- Supports CLI, mobile, admin portal, API v2, or other parallel workstreams
- Independent documentation with parent integration points
- Full documentation structure mirroring parent project
**Use Case:** Building CLI dashboard while web frontend continues separately

### /workstream-build
Build workstream features with automatic workstream detection
- Auto-detects workstream if only one exists (no --workstream flag needed)
- Reads workstream-specific atomic stories and progress
- References parent-mapped documents for context
- Executes build commands (build-fe, build-be, build-devops) with workstream context
- Outputs to workstream-specific directories
- Auto-updates workstream progress after build
- Shows parent dependencies clearly
**Note:** Sequential execution (original used parallel Task)

### /workstream-update-progress
Update workstream progress tracking with automatic detection
- Auto-detects workstream if only one exists
- Tracks workstream stories with W{ID}-### numbering
- Calculates workstream-specific completion percentages
- Generates workstream change log with timestamps
- Creates workstream next steps (immediate, short term, medium term)
- Separate from parent project progress
- Highlights parent integration blockers
**Note:** Maintains independent progress for each workstream

## Troubleshooting

### Workflow Not Found
Make sure you're in the correct project directory where `.agent/workflows/` exists.

### Git Commit Failures
Some workflows include git operations. If commits fail:
- Check that you're in a git repository
- Verify git is configured properly
- Check for pre-commit hooks that might be blocking

## Need Help?

- Review original Claude Skills in `.claude/skills/` for detailed documentation
- Read `CONVERSION-NOTES.md` for known limitations
- Check atomic stories in `docs/200-atomic-stories-v*.md` for requirements
