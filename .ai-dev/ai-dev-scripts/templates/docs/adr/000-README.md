# Architectural Decision Records

This directory contains ADRs (Architectural Decision Records) — lightweight documents that capture significant technical decisions made during development.

## What Is an ADR?

An ADR records a decision that was made, the context that drove it, the alternatives considered, and the consequences. They are immutable once accepted — if a decision changes, a new ADR supersedes the old one.

## Naming Convention

```
YYYYMMDD-{kebab-case-decision-title}.md
```

Examples:
- `20260101-use-postgresql-over-mysql.md`
- `20260115-adopt-nestjs-for-backend.md`
- `20260203-switch-to-file-based-story-tracking.md`

## ADR Template

```markdown
# ADR-XXX: {Decision Title}

**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-YYY
**Date:** YYYY-MM-DD
**Deciders:** [Who made this decision]

## Context

[What is the problem or situation that required a decision?
What constraints, pressures, or requirements exist?]

## Decision

[What was decided? State it clearly and directly.]

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| Option A (chosen) | | |
| Option B | | |
| Option C | | |

## Consequences

**Positive:**
- [Benefit 1]
- [Benefit 2]

**Negative / Trade-offs:**
- [Trade-off 1]
- [Trade-off 2]

**Risks:**
- [Risk 1 and mitigation]
```

## When to Write an ADR

Write an ADR when:
- Choosing a technology, framework, or library
- Making a significant architectural change
- Establishing a pattern that others must follow
- Reversing or changing a previous decision
- Making a trade-off with non-obvious consequences

Do NOT write an ADR for:
- Routine implementation details
- Decisions that are easily reversible
- Personal style preferences

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| — | *(No ADRs yet — use `/create-adr {purpose}` to add one)* | | |
