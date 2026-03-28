---
description: Build DevOps infrastructure with epic context pre-load, story file status transitions, and UAC checkbox tracking in docs/epics/
---

1. Epic Context Pre-load
   Check if --story-file {path} argument was provided (passed by /build orchestrator)

   If --story-file provided:
   - Read story file YAML frontmatter: extract epic_id → store as epicId
   - Read docs/epics/{epicId}/epic.md for epic scope and conventions
   - Glob docs/epics/{epicId}/done/*.md → read completed stories as pattern reference
   - Glob docs/epics/{epicId}/in-progress/*.md → read sibling stories to avoid conflicts
   - Display epic context summary

   Transition story to in-progress (if story_status is "pending"):
   - Run: mv {storyFilePath} {epicDir}/in-progress/{filename}
   - Update frontmatter: story_status: in-progress, updated_at: {ISO now}
   - Run: node .ai-dev/ai-dev-scripts/aggregate-epics.js --update --docs-path=./docs --epic={epicId}
   - Display: "🚧 Story {storyId} transitioned: pending → in-progress"

2. Git Branch Safety Check
   Run: git rev-parse --abbrev-ref HEAD
   If branch is protected (main, master, develop, staging, production):
   - Display error and exit — DO NOT proceed

3. Parse Input and Identify Pending DevOps UACs
   Search for draft documents: docs/**/*-draft.md — warn if found, exclude from reads

   If --story-file provided:
   - Read body of story file
   - Extract unchecked "- [ ] DevOps:" lines from ## User Acceptance Criteria
   - Skip already-checked "- [x] DevOps:" lines

   If no --story-file (fallback):
   - Find latest docs/200-atomic-stories-v*.md (EXCLUDE -draft)
   - Find latest docs/progress/000-progress-v*.md (EXCLUDE -draft)
   - Extract all DevOps: tagged UACs, cross-reference progress to find pending ones

   Group UACs by domain: Containerization, CI/CD Pipelines, Infrastructure as Code, Environment Management, Deployment Automation, Monitoring & Alerting, Security & Secrets

4. Gather Context from Documentation
   Read latest docs/425-devops-v*.md (EXCLUDE -draft) — primary reference
   Read latest docs/150-tech-stacks-v*.md — infrastructure and tooling decisions
   Read latest docs/350-api-contract-v*.md — API health check endpoints
   Check docs/learnings/000-README.md for relevant DevOps learnings (optional)
   Display context summary

5. Analyze DevOps Requirements
   Map each pending DevOps: UAC to infrastructure component
   Plan containerization: Dockerfiles, docker-compose configs
   Plan CI/CD pipelines: build, test, deploy stages
   Plan infrastructure as code: networking, compute, database, storage
   Plan monitoring: metrics, logging, health checks, alerts
   Plan security: secrets management, scanning, HTTPS/TLS

6. Generate DevOps Implementation
   Create Dockerfiles (multi-stage builds for frontend and backend)
   Create docker-compose.yml for local development
   Create CI/CD pipeline configurations (GitHub Actions / GitLab CI)
   Create Terraform modules for infrastructure provisioning
   Create environment configuration files (dev, staging, production)
   Create deployment scripts (blue/green, rolling, canary)
   Create monitoring configuration (Prometheus, Grafana, alerting rules)
   Create security configurations (secrets management, TLS certs)

7. Validate Infrastructure
   Run: docker build . --no-cache → verify image builds successfully
   Run: docker-compose config → validate compose file syntax
   Run: terraform validate → validate IaC syntax
   Run: terraform plan → preview infrastructure changes
   Run: yamllint .github/workflows/ → validate CI/CD YAML
   Verify monitoring configurations
   Verify security settings

8. Generate Infrastructure Tests
   Create Dockerfile linting tests (hadolint)
   Create IaC policy tests (OPA/Sentinel if available)
   Create integration tests for deployment scripts
   Create smoke tests for environment health checks
   Target: All critical deployment paths covered

9. Update Progress Tracking
   Read latest docs/progress/000-progress-v*.md
   Mark completed DevOps: UACs as done
   Add build notes to changelog

   If --story-file was provided:
   - Mark implemented UACs as checked ("- [ ] DevOps:" → "- [x] DevOps:")
   - Update story frontmatter: test_integration_status, uac_completed, uac_pending, uac_completion_pct, updated_at
   - Move story file from in-progress/ → qa/:
     Run: mv {epicDir}/in-progress/{filename} {epicDir}/qa/{filename}
   - Update frontmatter story_status: qa
   - Run: node .ai-dev/ai-dev-scripts/aggregate-epics.js --update --docs-path=./docs --epic={epicId}
   - Display: "✅ Story {storyId} transitioned: in-progress → qa"

10. Generate Summary Report
    Display implementation statistics: files created by domain, UACs implemented
    Show validation results per infrastructure component
    Show test results
    Show epic story file transition status
    Suggest next steps: /build-fe, /build-be, /update-progress
