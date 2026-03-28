# Design System v1.0.0

**Project:** {{PROJECT_NAME}}
**Version:** v1.0.0
**Date:** {{DATE}}

> Use `/define @125-design-system-v1.0.0.md` to elaborate based on PRD and user flows.

## Look & Feel

[Describe the intended aesthetic — tone, mood, visual personality. e.g. "Clean and minimal, professional but approachable, inspired by Linear/Notion"]

## Typography

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| H1 | | | | |
| H2 | | | | |
| H3 | | | | |
| Body | | | | |
| Caption | | | | |
| Code | | | | |

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | | Primary actions, links |
| `--color-primary-hover` | | |
| `--color-secondary` | | Secondary actions |
| `--color-neutral-50` | | Background |
| `--color-neutral-100` | | Surface |
| `--color-neutral-500` | | Muted text |
| `--color-neutral-900` | | Primary text |
| `--color-success` | | Success states |
| `--color-warning` | | Warning states |
| `--color-error` | | Error states |

## Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | |
| `--space-2` | 8px | |
| `--space-3` | 12px | |
| `--space-4` | 16px | Default padding |
| `--space-6` | 24px | |
| `--space-8` | 32px | Section spacing |
| `--space-12` | 48px | |
| `--space-16` | 64px | Page sections |

## Component Inventory

| Component | Status | Description |
|-----------|--------|-------------|
| Button | ⏳ | Primary, secondary, ghost, danger variants |
| Input | ⏳ | Text, password, search |
| Modal | ⏳ | |
| Toast | ⏳ | Success, error, info |
| Table | ⏳ | Sortable, paginated |
| Card | ⏳ | |
| Badge | ⏳ | |
| Dropdown | ⏳ | |

## Layout Patterns

### Grid System
[Columns, gutters, breakpoints]

| Breakpoint | Width | Columns | Gutter |
|-----------|-------|---------|--------|
| Mobile | < 768px | 4 | 16px |
| Tablet | 768–1024px | 8 | 24px |
| Desktop | > 1024px | 12 | 32px |

### Page Layouts
[Describe common page templates — sidebar, full-width, centered, dashboard]

## Frontend Folder Structure

```
src/
├── components/
│   ├── ui/          # Design system primitives (Button, Input, etc.)
│   ├── layout/      # Page layouts, nav, sidebar
│   └── features/    # Feature-specific components
├── pages/           # Route-level page components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers
├── styles/          # Global styles, CSS variables
└── assets/          # Images, icons, fonts
```

## Design Notes & Principles

- [Principle 1 — e.g. "Prefer empty states over hiding UI elements"]
- [Principle 2 — e.g. "Every destructive action requires confirmation"]
- [Principle 3]
