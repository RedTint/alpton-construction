# .ai-dev/

Developer tooling for the AI Dev Agency project. Contains scripts and a local dashboard for tracking project progress.

---

## Directory Structure

```
.ai-dev/
├── ai-dev-scripts/          # Node.js scripts for project data aggregation
│   ├── aggregate-epics.js       ← main script
│   ├── aggregate-epics.test.js  ← tests (mocha)
│   ├── package.json
│   └── node_modules/
│
└── ai-dev-dashboard/        # Local NestJS + React dashboard
    ├── backend/                 ← NestJS API (port 3000)
    ├── frontend/                ← React app (port 3001)
    ├── scripts/                 ← dashboard-specific scripts
    ├── docker-compose.yml
    └── README.md
```

---

## ai-dev-scripts/

### aggregate-epics.js

Reads `docs/epics/` and outputs structured JSON stats for all epics and stories.

**Install dependencies (first time only):**
```bash
cd .ai-dev/ai-dev-scripts && npm install
```

**Usage:**

```bash
# Output JSON stats to stdout
node .ai-dev/ai-dev-scripts/aggregate-epics.js --docs-path=./docs

# Update stale epic.md frontmatter stats
node .ai-dev/ai-dev-scripts/aggregate-epics.js --update --docs-path=./docs

# Reconcile story files: parse body UAC checkboxes → sync frontmatter → move files → refresh epics
node .ai-dev/ai-dev-scripts/aggregate-epics.js --reconcile --docs-path=./docs

# Reconcile a single epic only
node .ai-dev/ai-dev-scripts/aggregate-epics.js --reconcile --epic 007 --docs-path=./docs

# Table output (human-readable)
node .ai-dev/ai-dev-scripts/aggregate-epics.js --output=table --docs-path=./docs
```

**Flags:**

| Flag | Description |
|------|-------------|
| `--docs-path=./docs` | Path to docs directory (required) |
| `--update` | Write updated stats to stale `epic.md` frontmatter files |
| `--reconcile` | Parse body UAC checkboxes, sync frontmatter, move story files to correct status dirs, refresh epic stats. Implies `--update`. |
| `--epic {id}` | Scope to a single epic (e.g. `--epic 007`) |
| `--output=table` | Human-readable table output instead of JSON |

**What `--reconcile` does:**
1. Parses `## User Acceptance Criteria` checkboxes from each story file body
2. Syncs `uac_total`, `uac_completed`, `uac_completion_pct`, `uac_by_type` in frontmatter
3. Moves story files to correct status dir based on completion:
   - 0% → `pending/`
   - 1–99% → `in-progress/`
   - 100% → `done/` (sets `completed_at`)
   - `blocked/` stories are never auto-promoted
   - `done/` stories are never moved backward (unchecked boxes get checked off instead)
4. Refreshes `epic.md` frontmatter stats for all affected epics

**Run tests:**
```bash
cd .ai-dev/ai-dev-scripts && npm test
```

---

## ai-dev-dashboard/

Local dashboard for visualizing project progress. See `ai-dev-dashboard/README.md` for full setup.

**Quick start:**
```bash
# Start backend (port 3000)
cd .ai-dev/ai-dev-dashboard/backend && npm run start:dev

# Start frontend (port 3001)
cd .ai-dev/ai-dev-dashboard/frontend && npm run dev

# Or via Docker Compose
cd .ai-dev/ai-dev-dashboard && docker-compose up
```

The dashboard reads from `docs/epics/` via the backend API to display epic and story progress.

---

## Integration with Skills

The `/update-progress` skill calls `aggregate-epics.js --reconcile` automatically in Phase 2. The `/sync-board` skill uses the epic folder structure that this script reads.

**Used by:**
- `/update-progress` → `node .ai-dev/ai-dev-scripts/aggregate-epics.js --reconcile --docs-path=./docs`
- `/sync-board` → reads `docs/epics/` directly
- Dashboard backend → reads `docs/epics/` at runtime
