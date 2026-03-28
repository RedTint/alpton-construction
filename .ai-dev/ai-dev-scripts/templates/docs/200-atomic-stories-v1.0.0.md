# Atomic Stories v1.0.0

**Project:** {{PROJECT_NAME}}
**Version:** v1.0.0
**Date:** {{DATE}}

> This file is a **read-only index** pointing to individual story files in `docs/epics/`.
> Use `/new-feature` to add stories. Use `/update-progress` to sync completion status.

## Story Format Reference

Each story lives as an individual file: `docs/epics/{epic-id}/{status}/{epic-id}-{story-id}-{slug}.md`

```yaml
---
story_id: 001-001
epic_id: '001'
story_name: Example Story
story_status: pending        # pending | in-progress | qa | done | blocked
priority: high               # critical | high | medium | low
story_points: 5
uac_total: 4
uac_completed: 0
uac_completion_pct: 0
uac_by_type:
  fe: 2
  be: 1
  db: 0
  devops: 0
  cli: 0
  test: 1
---
```

UAC checkbox format in story body:
```markdown
- [ ] FE: Description of frontend acceptance criterion
- [ ] BE: Description of backend acceptance criterion
- [ ] TEST: Description of test requirement
- [x] FE: Completed criterion
```

## Epic Index

### Epic 001 — [Epic Name] (v1.0.0)

| Story | Title | Status | Points |
|-------|-------|--------|--------|
| [001-001](epics/001-[slug]/pending/001-001-[slug].md) | [Story name] | ⏳ Pending | 0 |

---

*Stories are created via `/new-feature` and tracked in `docs/epics/`.*
*Run `/update-progress` to reconcile status from story file UAC checkboxes.*
*Run `/sync-board` to regenerate this index from epic files.*
