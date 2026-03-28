---
description: Initialize all project starting files with complete documentation structure for a new software project
---

1. Create Directory Structure
   Create the following directories if they don't exist:
   // turbo
   mkdir -p docs/progress docs/releases docs/adr docs/epics

   Create docs/epics/README.md with content:
   # Epics Index
   This directory organizes stories by epic. Each epic has subdirs:
   pending/, in-progress/, qa/, done/, blocked/, bugs/
   Use /new-feature to create stories or /migrate to import existing ones.

   Confirm all directories are created successfully

2. Delegate to Setup Script (preferred)
   Check if setup script exists:
   Run: ls .ai-dev/ai-dev-scripts/setup.sh 2>/dev/null

   If script exists:
   Run: bash .ai-dev/ai-dev-scripts/setup.sh
   Confirm files created with: ls docs/
   Skip to step 8 (Generate Completion Summary)

   If script does not exist:
   Continue with steps 3-7 (inline file creation fallback)

3. Create Documentation Guide (000-README.md)
   Write comprehensive documentation guide to docs/000-README.md explaining:
   - Overview of the numbered documentation system
   - How to use the /define, /update-progress, /create-adr, and /build commands
   - Description of each documentation file (000-450 series) and its purpose
   - Versioning conventions (v1.0.0, v1.1.0, etc.)
   - Workflow guide: which files to complete in which order
   - Recommended sequence: 001 → 002 → 100 → 125 → 150 → 175 → 200 → 300/325 → 350 → 375 → 400 → 425 → 450

4. Create Project Init Template (001-project-init.md)
   Write brain dump template to docs/001-project-init.md with sections:
   - Project Vision: What is the core problem we're solving?
   - Target Users: Who are we building this for?
   - Key Features: Brain dump all ideas, features, and concepts
   - Technical Considerations: Initial thoughts on technology, constraints
   - Success Metrics: How will we measure success?
   - Questions & Unknowns: What needs to be figured out?
   - Next Steps: What happens after this brain dump?

   Include current date in header

5. Create Lightweight Documentation Skeletons
   Create the following files with MINIMAL section headers only:

   - docs/002-prd-v1.0.0.md (Product Requirements)
     Sections: Product overview, User personas, Features, MVP scope, Roadmap, Success criteria

   - docs/100-userflows-v1.0.0.md (User Flows)
     Sections: Persona definitions, User journey maps, Flow diagrams, Edge cases

   - docs/125-design-system-v1.0.0.md (Design System)
     Sections: Typography, Color palette, Spacing, Components, Layouts, Sitemap, Frontend structure

   - docs/150-tech-stacks-v1.0.0.md (Tech Stack)
     Sections: Frontend tech, Backend tech, Database, Testing tools, DevOps, Third-party services, SLA requirements

   - docs/175-c4-diagrams-v1.0.0.md (Architecture)
     Sections: System Context, Container diagram, Component diagram, Code diagram, Architecture notes

   - docs/200-atomic-stories-v1.0.0.md (User Stories)
     Sections: Story format, UAC format, Technical tasks, Test requirements, Story points, Dependencies

   - docs/300-frontend-v1.0.0.md (Frontend Architecture)
     Sections: Folder structure, Modules, Component patterns, State management, Routing, Best practices

   - docs/325-backend-v1.0.0.md (Backend Architecture)
     Sections: Folder structure, Modules, API patterns, Business logic, Data access, Middleware

   - docs/350-api-contract-v1.0.0.md (API Contract)
     Sections: API overview, Authentication, Endpoints, Request/response schemas, Error handling, Versioning

   - docs/375-database-schema-v1.0.0.md (Database Schema)
     Sections: ERD, Table definitions, Relationships, Indexes, Validation rules, Business rules, Migrations

   - docs/400-testing-strategy-v1.0.0.md (Testing Strategy)
     Sections: Testing pyramid, Unit testing, Integration testing, E2E testing, Coverage targets, CI integration

   - docs/425-devops-v1.0.0.md (DevOps)
     Sections: Infrastructure as Code, CI/CD pipeline, Build process, Deployment strategy, Environments, PR workflow

   - docs/450-workers-v1.0.0.md (Background Jobs - Optional)
     Sections: Job definitions, Scheduling, Intervals, Error handling, Monitoring

   Each file should include:
   - Appropriate header with version number
   - Section headers only (minimal content)
   - Note: "Use /define @{filename} to elaborate this document"

6. Create Progress Tracking Template
   Write lightweight skeleton to docs/progress/000-progress-v1.0.0.md with sections:
   - Feature completion checklist
   - Status per atomic story
   - Blockers and issues
   - Completion percentage
   - Timeline tracking
   - Note: Will be populated by /update-progress command

7. Create Initial Release Notes
   Write lightweight skeleton to docs/releases/release-v0.0.1.md with sections:
   - Release version and date
   - Release overview (start with "Hello World" deployment)
   - Features included
   - Technical changes
   - Deployment notes
   - Known issues

8. Create ADR System Documentation
   Write comprehensive ADR guide to docs/adr/000-README.md including:
   - Purpose and format of ADRs
   - Naming convention: YYYYMMDD-{purpose}.md
   - Empty index/table with headers: | ADR # | Title | Status | Date |
   - Complete ADR template showing all sections:
     - Title: # ADR-XXX: {Decision Title}
     - Status: Proposed/Accepted/Deprecated/Superseded
     - Date: YYYY-MM-DD format
     - Deciders: Who made the decision
     - Context: Problem statement and background
     - Decision: What was decided
     - Consequences: Positive and negative impacts
     - Alternatives Considered: Other options evaluated
   - Guidelines for when to create an ADR
   - Examples of good ADR topics

9. Generate Completion Summary
   Display summary of all created files:

   ✅ Project documentation structure initialized!

   Created files:
   📁 docs/
   ├── 000-README.md (comprehensive guide)
   ├── 001-project-init.md (brain dump template - FILL THIS OUT FIRST)
   ├── 002-prd-v1.0.0.md (skeleton)
   ├── 100-userflows-v1.0.0.md (skeleton)
   ├── 125-design-system-v1.0.0.md (skeleton)
   ├── 150-tech-stacks-v1.0.0.md (skeleton)
   ├── 175-c4-diagrams-v1.0.0.md (skeleton)
   ├── 200-atomic-stories-v1.0.0.md (skeleton)
   ├── 300-frontend-v1.0.0.md (skeleton)
   ├── 325-backend-v1.0.0.md (skeleton)
   ├── 350-api-contract-v1.0.0.md (skeleton)
   ├── 375-database-schema-v1.0.0.md (skeleton)
   ├── 400-testing-strategy-v1.0.0.md (skeleton)
   ├── 425-devops-v1.0.0.md (skeleton)
   ├── 450-workers-v1.0.0.md (skeleton)
   ├── 📁 adr/
   │   └── 000-README.md (comprehensive ADR guide)
   ├── 📁 epics/
   │   └── README.md (index placeholder)
   ├── 📁 progress/
   │   └── 000-progress-v1.0.0.md (skeleton)
   └── 📁 releases/
       └── release-v0.0.1.md (skeleton)

   🎯 Next Steps (IMPORTANT):

   Step 1: Define Your Project
   → Open docs/001-project-init.md and fill it with your brain dump
   → This is YOUR input - describe vision, features, and ideas

   Step 2: Formalize Requirements
   → Review docs/002-prd-v1.0.0.md
   → Run: /define @002-prd-v1.0.0.md to elaborate based on brain dump

   Step 3: Elaborate Documentation
   → Use /define @{filename} to flesh out specific documents
   → Work sequentially: 100 → 200 → 300 → 400
   → Each /define uses context from previous documents

   Examples:
   /define @100-userflows-v1.0.0.md based on personas from PRD
   /define @150-tech-stacks-v1.0.0.md suggest appropriate tech stack
   /define @200-atomic-stories-v1.0.0.md for MVP features only

   Why This Approach?
   Skeleton files save tokens. You provide project context first,
   then we elaborate documents one-by-one as needed.
