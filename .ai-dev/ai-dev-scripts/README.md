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
