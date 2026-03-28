# Epics Index

This directory organizes stories by epic using the **file-system-as-board** pattern.
The file location is the story status — no separate status field needed.

## Directory Structure

```
docs/epics/
└── {###}-{epic-slug}/
    ├── epic.md              # Epic metadata and story index
    ├── pending/             # Stories not yet started
    ├── in-progress/         # Stories currently being built
    ├── qa/                  # Stories awaiting testing/review
    ├── done/                # Completed stories
    ├── blocked/             # Stories blocked on a dependency
    └── bugs/                # Bug reports linked to this epic
```

## Story File Naming

```
{epicId}-{storyId}-{kebab-case-title}.md
```

Example: `007-321-yaml-frontmatter-integration.md`

## Epic Status Values

| Status | Meaning |
|--------|---------|
| `in-progress` | At least one story started, not all done |
| `completed` | All stories in `done/`, `completion_pct == 100` |
| `blocked` | Epic progress halted by external dependency |
| `planned` | No stories started yet |

## Commands

| Command | What it does |
|---------|-------------|
| `/new-feature {description}` | Creates a new story file in the correct epic's `pending/` |
| `/build` | Detects pending stories and implements them |
| `/update-progress` | Reconciles UAC checkboxes → frontmatter → moves files → updates epic.md |
| `/sync-board` | Regenerates the atomic stories index from epic files |
| `/log-bug {description}` | Creates a bug file in the relevant epic's `bugs/` |

## Epics

*(No epics yet — run `/new-feature` to create your first story)*
