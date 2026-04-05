# Atomic Stories v1.0.0

**Project:** {{PROJECT_NAME}}
**Version:** v1.0.0
**Date:** {{DATE}}

> This document defines user stories in the **heading-based format** required by the automation scripts.
> After elaboration, run `/sync-board` to scaffold individual story files in `docs/epics/`.

---

## Format Reference (MANDATORY)

Stories MUST use this exact heading pattern for script compatibility:

- **Epic heading:** `## Epic NNN – Epic Name` (en-dash `–` or em-dash `—` or colon `:`)
- **Story heading:** `### Story NNN – Story Title` (same separator options)
- **UAC checkboxes:** `- [ ] TYPE: description` (NOT tables, NOT bullet lists without checkboxes)
- **NNN** = zero-padded 3-digit number (001, 002, etc.)
- **TYPE** = `FE` | `BE` | `DB` | `DevOps` | `CLI` | `TEST`

---

## Epic 001 – [Epic Name]

### Story 001 – [Story Title]

**As a** [persona]
**I want** [goal]
**So that** [benefit]

**Priority:** High
**Effort:** 5
**Dependencies:** None

#### User Acceptance Criteria
- [ ] FE: [Frontend acceptance criterion]
- [ ] BE: [Backend acceptance criterion]
- [ ] TEST: [Test requirement]

<!-- Add more stories under this epic using ### Story NNN – Title -->

---

<!--
## Epic 002 – [Next Epic Name]

### Story 002 – [Next Story Title]

**As a** [persona]
**I want** [goal]
**So that** [benefit]

**Priority:** Medium
**Effort:** 3
**Dependencies:** Story 001

#### User Acceptance Criteria
- [ ] FE: [Description]
- [ ] BE: [Description]
- [ ] DB: [Description]
- [ ] TEST: [Description]
-->

---

*Stories are elaborated via `/define @200-atomic-stories-v1.0.0.md`.*
*Run `/sync-board` after elaboration to scaffold `docs/epics/` structure.*
*Run `/new-feature` to add individual stories after initial setup.*
