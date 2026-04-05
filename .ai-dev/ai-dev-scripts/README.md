# AI Dev Scripts

Supporting scripts for Claude Code skills. These scripts handle repetitive, mechanical I/O so the LLM only orchestrates — keeping token usage low and execution reliable.

## Convention

Every script in this directory must have a corresponding entry in this README describing:
- **What it does** — one-sentence summary
- **Called by** — which skill(s) invoke it
- **Usage** — CLI signature with all flags
- **Output** — what it prints / writes / returns

Scripts should be runnable standalone from the project root for debugging:
```bash
bash .ai-dev/ai-dev-scripts/{script}.sh --flag value
node .ai-dev/ai-dev-scripts/{script}.js --flag value
```

Templates used by scripts live in `templates/` with the same subdirectory name as the script prefix (e.g., `client-new-setup.sh` → `templates/clients/`).

---

## Scripts

### `setup.sh`
**What it does:** Scaffolds the full `docs/` documentation structure for a new AI Dev Agency project by copying templates from `templates/docs/` with `{{PROJECT_NAME}}` and `{{DATE}}` substitution.
**Called by:** `/setup`, `/review-and-setup`
**Usage:**
```bash
bash .ai-dev/ai-dev-scripts/setup.sh
bash .ai-dev/ai-dev-scripts/setup.sh --project-name "My Project"
```
**Output:** Creates 17+ `docs/` files; prints `✅ Created: {path}` per file; skips existing files with `⚠️ Skip`.

---

### `aggregate-epics.js`
**What it does:** Reads all `docs/epics/*/epic.md` and story files, aggregates project stats (totals, points, status breakdowns), and optionally writes recalculated frontmatter back to `epic.md` files.
**Called by:** `/update-progress`, `/new-feature`, `/sync-board`
**Usage:**
```bash
node .ai-dev/ai-dev-scripts/aggregate-epics.js
node .ai-dev/ai-dev-scripts/aggregate-epics.js --update
node .ai-dev/ai-dev-scripts/aggregate-epics.js --reconcile
node .ai-dev/ai-dev-scripts/aggregate-epics.js --epic=008
node .ai-dev/ai-dev-scripts/aggregate-epics.js --output=table
node .ai-dev/ai-dev-scripts/aggregate-epics.js --docs-path=./docs --update
```
**Options:**
| Flag | Description |
|------|-------------|
| `--update` | Write recalculated stats back to each `epic.md` frontmatter |
| `--reconcile` | Sync story frontmatter from body UAC checkboxes, move files to correct status dirs, then run `--update` |
| `--epic=<id>` | Process only a specific epic (e.g. `--epic=005`) |
| `--output=json\|table` | Output format (default: json) |
| `--docs-path=<path>` | Path to docs directory (default: `./docs`) |

**Output:** JSON to stdout `{ generatedAt, docsPath, overall, epics }` or formatted table. Exit 0 on success, 1 if `docs/epics/` not found.

---

### `client-new-setup.sh`
**What it does:** Scaffolds a new client folder under `docs/clients/{ID}-{slug}/` from templates, auto-increments the client ID, and updates `docs/clients/README.md` index.
**Called by:** `/client-new`
**Usage:**
```bash
bash .ai-dev/ai-dev-scripts/client-new-setup.sh --client-name "Acme Corp"
bash .ai-dev/ai-dev-scripts/client-new-setup.sh --client-name "Acme Corp" --client-id 003
```
**Options:**
| Flag | Description |
|------|-------------|
| `--client-name` | **(Required)** Display name of the client |
| `--client-id` | **(Optional)** Override the auto-incremented ID (zero-padded, e.g. `003`) |

**Output:** Creates 6 files under `docs/clients/{ID}-{slug}/`; updates `docs/clients/README.md`; prints `CLIENT_DIR=`, `CLIENT_ID=`, `CLIENT_SLUG=` lines for the skill to parse.

**Templates:** `templates/clients/` — all files contain YAML frontmatter with `{{CLIENT_ID}}`, `{{CLIENT_NAME}}`, `{{CLIENT_SLUG}}`, `{{DATE}}` placeholders.

---

### `validate-stories.js`
**What it does:** Validates all story and epic files in `docs/epics/` for schema correctness, fixes safe issues, and migrates old files to v2 format.
**Called by:** `/sync-board`, `/build-*` (pre-build validation), `/uat`
**Usage:**
```bash
node .ai-dev/ai-dev-scripts/validate-stories.js
node .ai-dev/ai-dev-scripts/validate-stories.js --fix
node .ai-dev/ai-dev-scripts/validate-stories.js --migrate
node .ai-dev/ai-dev-scripts/validate-stories.js --fix --migrate
node .ai-dev/ai-dev-scripts/validate-stories.js --epic=007
node .ai-dev/ai-dev-scripts/validate-stories.js --output=table
```
**Options:**
| Flag | Description |
|------|-------------|
| `--fix` | Auto-fix safe issues (UAC counts, status mismatches) |
| `--migrate` | Upgrade old files to v2 format (adds `design_links`, `related_docs`, `changelog`; additive only) |
| `--epic=<id>` | Process only a specific epic |
| `--output=json\|table` | Output format (default: json) |
| `--docs-path=<path>` | Path to docs directory (default: `./docs`) |

**Output:** JSON to stdout `{ valid, errors[], warnings[], fixed, migrated }`. Exit 0 on success, 1 if no epics dir, 2 if errors found.

---

### `create-story-file.js`
**What it does:** Creates a properly formatted v2 story file with full YAML frontmatter, auto-discovered related doc links, changelog, and markdown body.
**Called by:** `/new-feature`, `/sync-board` (internally)
**Usage:**
```bash
node .ai-dev/ai-dev-scripts/create-story-file.js \
  --epic=007 --title="Feature Name" --priority=high --points=8 \
  --uacs='[{"type":"FE","text":"UI shows status"}]' \
  --description="As a dev, I want..."
```
**Options:**
| Flag | Description |
|------|-------------|
| `--epic=<id>` | **(Required)** Target epic ID |
| `--title=<string>` | **(Required)** Story title |
| `--priority=<level>` | high\|medium\|low (default: medium) |
| `--points=<number>` | Story points (default: 5) |
| `--uacs=<json>` | JSON array of `{type, text}` UAC objects |
| `--uacs-file=<path>` | Path to JSON file with UAC array |
| `--description=<string>` | Free-form description text |
| `--tags=<csv>` | Comma-separated tags |
| `--dependencies=<csv>` | Comma-separated dependency story IDs |
| `--dry-run` | Print content without writing |
| `--docs-path=<path>` | Path to docs directory (default: `./docs`) |

**Output:** Prints `STORY_FILE=<path>` and `STORY_ID=<id>` to stdout. Calls `aggregate-epics.js --update` after creation.

---

### `dependency-graph.js`
**What it does:** Builds a DAG from story `dependencies` fields, detects circular dependencies, calculates topological sort, and outputs XYFlow-compatible JSON, Mermaid, or raw graph data.
**Called by:** `/build`, `/update-progress`
**Usage:**
```bash
node .ai-dev/ai-dev-scripts/dependency-graph.js --output=xyflow
node .ai-dev/ai-dev-scripts/dependency-graph.js --output=mermaid --epic=007
node .ai-dev/ai-dev-scripts/dependency-graph.js --output=json
```
**Options:**
| Flag | Description |
|------|-------------|
| `--output=xyflow\|mermaid\|json` | Output format (default: json) |
| `--epic=<id>` | Process only a specific epic |
| `--direction=LR\|TD` | Mermaid graph direction (default: LR) |
| `--docs-path=<path>` | Path to docs directory (default: `./docs`) |

**Output:** JSON (xyflow/raw) or Mermaid text to stdout. XYFlow JSON includes `nodes[]` with position, status color, UAC data and `edges[]` with animation. Stderr shows summary (node/edge count, cycles, parallelizable stories).

---

### `sync-board.js`
**What it does:** Parses `docs/200-atomic-stories-v*.md`, creates/moves story files in `docs/epics/`, and refreshes epic stats. Replaces token-expensive agentic sync workflow.
**Called by:** `/sync-board`, `/define` (auto-trigger after atomic stories)
**Usage:**
```bash
node .ai-dev/ai-dev-scripts/sync-board.js
node .ai-dev/ai-dev-scripts/sync-board.js --dry-run
node .ai-dev/ai-dev-scripts/sync-board.js --epic=007
node .ai-dev/ai-dev-scripts/sync-board.js --validate
```
**Options:**
| Flag | Description |
|------|-------------|
| `--dry-run` | Show changes without writing |
| `--epic=<id>` | Only sync a specific epic |
| `--validate` | Run `validate-stories.js` only (no sync) |
| `--docs-path=<path>` | Path to docs directory (default: `./docs`) |

**Output:** JSON to stdout `{ created, skipped, moved, errors[], epics[] }`. Calls `aggregate-epics.js --update` after sync.

---

## Templates

```
templates/
├── docs/                          # Used by setup.sh
│   ├── 000-README.md
│   ├── 001-project-init.md
│   └── ... (17 doc templates)
└── clients/                       # Used by client-new-setup.sh
    ├── 000.README.md              # Client overview (YAML frontmatter)
    ├── 001.client-profile.md      # Who the client is (YAML frontmatter)
    ├── 002.client-deliverables.md # Deliverables checklist (YAML frontmatter)
    ├── 003.client-context.md      # Running context log (YAML frontmatter)
    ├── 004.client-issues.md       # Issue tracker (YAML frontmatter)
    └── meetings/
        └── README.md              # Meeting notes index (YAML frontmatter)
```

All client templates are parsed by `gray-matter` (already a dependency via `package.json`).

### Meeting Note Template Placeholders

`templates/clients/meetings/meeting-note.md` uses these placeholders (substituted at runtime by `client-new-setup.sh` or a future `meeting-new-setup.sh`):

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{CLIENT_ID}}` | Zero-padded client ID | `001` |
| `{{CLIENT_NAME}}` | Display name | `Acme Corp` |
| `{{CLIENT_SLUG}}` | kebab-case slug | `acme-corp` |
| `{{MEETING_NUM}}` | Zero-padded meeting sequence | `003` |
| `{{MEETING_TITLE}}` | Human-readable title | `Q2 Roadmap Review` |
| `{{MEETING_TYPE}}` | Full type label | `Client Sync` |
| `{{TYPE_CODE}}` | 3-char type code | `cls` |
| `{{YYYYMMDD-HHii}}` | Combined datetime stamp — matches filename convention | `20260318-1000` |
| `{{ATTENDEES}}` | Comma-separated names | `Alex Chen, Jordan Smith` |
| `{{ABSENT}}` | Absent attendees or `None` | `None` |
| `{{DURATION}}` | Duration in minutes | `60` |
| `{{DATE}}` | Date only — used in non-meeting templates | `2026-03-18` |

> **Convention:** Always use `{{YYYYMMDD-HHii}}` for datetime fields in meeting templates. Never split into separate `{{DATE}}` and `{{TIME}}` placeholders — they can collapse into a single line during `sed` substitution. Non-meeting templates (profile, deliverables, etc.) use `{{DATE}}` for date-only fields.

> **Metadata blocks:** Always write metadata as bullet points (`- **Field:** value`), never as consecutive bare `**Field:** value` lines. Bare lines collapse into a single run-on string in many markdown renderers and shell substitutions.

> **Note for `/meetings-new`:** This skill currently generates meeting note content inline. It should be updated to use `templates/clients/meetings/meeting-note.md` (or a parallel `templates/meetings/meeting-note.md`) via a `meeting-new-setup.sh` script — same pattern as `client-new-setup.sh` — to reduce token usage on repeated invocations.
