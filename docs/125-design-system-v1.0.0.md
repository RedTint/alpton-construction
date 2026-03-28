# Design System v1.0.0

**Project:** Alpton Construction Website & Admin Portal
**Version:** v1.0.0
**Date:** 2026-03-28

> Defined from user reference images ("The Architectural Monolith") and functional requirements.

## Look & Feel

**The Architectural Monolith**
The aesthetic is premium, authoritative, and structurally cohesive. It leverages a dark, deeply saturated navy backdrop (`#0B1E38`) contrasted with sophisticated gold accents (`#C5A059`) to convey trust, high-end quality, and financial stability (ideal for the "BUILD NOW, PAY LATER" messaging). The UI feels expansive, precise, and meticulously engineered. 

## Typography

Primary Font Family: **Inter** or **Outfit** (Clean, geometric sans-serif for architectural precision).

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| H1 | Primary Sans | 64px (Desktop) | 700 (Bold) | 1.1 |
| H2 | Primary Sans | 48px | 600 (Semi-Bold) | 1.2 |
| H3 | Primary Sans | 32px | 600 | 1.3 |
| Body | Primary Sans | 16px | 400 (Regular) | 1.6 |
| Caption | Primary Sans | 14px | 400 | 1.4 |
| Code | Monospace | 14px | 400 | 1.5 |

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#0B1E38` | Deep Navy. Brand primary, main backgrounds, header/footer. |
| `--color-primary-light`| `#1D3557` | Hover states for primary elements. |
| `--color-secondary` | `#C5A059` | Gold. CTAs ("BUILD NOW, PAY LATER"), active states, accents. |
| `--color-secondary-hover`| `#DBC384` | Lighter gold for hover interactions. |
| `--color-tertiary`| `#301800` | Dark Brown. Earthy grounding tones for borders or subtle depths. |
| `--color-neutral-900` | `#1A1C1E` | Very Dark Charcoal. Deepest surface backgrounds, admin portal base. |
| `--color-neutral-100` | `#F8F9FA` | Off-white. Primary text on dark backgrounds, or card backgrounds in light mode. |
| `--color-neutral-500` | `#8A94A6` | Muted text, secondary labels, placeholders. |

*(Values derived directly from the "Architectural Monolith" reference designs).*

## Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | UI micro-adjustments |
| `--space-2` | 8px | Item spacing (e.g., icons next to text) |
| `--space-3` | 12px | Small paddings |
| `--space-4` | 16px | Default padding / input heights |
| `--space-6` | 24px | Card inner paddings |
| `--space-8` | 32px | Section inner spacing |
| `--space-12` | 48px | Form group spacing |
| `--space-16` | 64px | Page sections / whitespace to create "Monolithic" breathing room |

## Component Inventory

| Component | Status | Description |
|-----------|--------|-------------|
| Primary Button | ✅ | Solid Gold (`#C5A059`), dark text, sharp corners (no heavy border-radius). |
| Secondary Button | ✅ | Outlined Gold or Solid Navy. |
| **Lightbox Gallery** | ✅ | **Integrated via `lightgalleryjs`** for immersive, full-screen portfolio image viewing. |
| Input | ⏳ | Underlined or sharp-edged inputs for the Inquiry Wizard. |
| Modal | ⏳ | Standard pop-ups for confirmations. |
| Table | ⏳ | Admin dashboard lead list (Sortable, minimalistic dividers). |
| Image Card | ⏳ | Portfolio grid items with overlay triggers for `lightgalleryjs`. |

## Layout Patterns

### Grid System
Standard 12-column grid to maintain structural integrity.

| Breakpoint | Width | Columns | Gutter |
|-----------|-------|---------|--------|
| Mobile | < 768px | 4 | 16px |
| Tablet | 768–1024px | 8 | 24px |
| Desktop | > 1024px | 12 | 32px |

### Page Layouts
- **Immersive Landing (SPA):** Full-bleed hero images, large monolithic typography, scroll-triggered fade-ins.
- **Portfolio Grid:** Masonry or strict grid layout. Clicking an image launches `lightgalleryjs` with watermarked high-res images.
- **Admin Dashboard:** Sidebar navigation (Dark Navy) on the left, main content area (Light or Charcoal) summarizing leads and portfolio settings.

## Frontend Folder Structure

```text
src/
├── components/
│   ├── ui/          # Primitives (Button, Input)
│   ├── layout/      # Nav, Footer, AdminSidebar
│   └── portfolio/   # LightGallery wrapper components
├── pages/           # Landing, WizardSteps, AdminDash
├── hooks/           # Custom React hooks
├── lib/             # Utilities (watermarking helpers)
├── styles/          # Variables mapped to the Monolith palette
└── assets/          # Images, logos, fonts
```

## Design Notes & Principles

- **Structural Integrity:** Elements should align perfectly to the grid. Avoid overly rounded corners; use `0px` or `2px` border-radius to maintain an architectural, "carved from stone" feel.
- **High-Fidelity Viewing:** The portfolio is the primary trust-builder. Always rely on `lightgalleryjs` for a smooth, zoomable, and touch-friendly gallery experience.
- **Clear Contrast:** Maintain high legibility. Ensure the secondary gold (`#C5A059`) passes WCAG AA contrast ratios against the primary navy (`#0B1E38`).
