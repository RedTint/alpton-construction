# Frontend Architecture v1.0.0

**Project:** Alpton Construction Website & Admin Portal
**Version:** v1.0.0
**Date:** 2026-03-28

> Defined based on the Serverless React+Supabase target.

## Folder Structure

```text
src/
├── components/
│   ├── ui/                  # Primitives (Button, Tailwind Input, Modal, etc.)
│   ├── layout/              # MainShell, AdminSidebar, Header, Footer
│   └── features/            # Composite components
│       ├── landing/
│       ├── wizard/          # "BUILD NOW, PAY LATER" multi-step flow
│       ├── portfolio/       # component wrapping lightgalleryjs
│       └── admin/           # CRM tables and upload forms
├── pages/                   # Route-level components (React Router)
├── hooks/                   # Custom hooks (useAuth, useSupabase, etc.)
├── lib/                     # Utilities (tracking parser)
├── api/                     # Supabase client wrapper and queries
├── stores/                  # Zustand (Auth Session, Lead Agent Tracking)
├── styles/                  # Tailwind CSS entry and tokens
├── types/                   # Shared TypeScript models (Database.ts)
└── assets/                  # Static images
```

## Module Organization

| Module | Path | Responsibility |
|--------|------|----------------|
| Landing | `src/features/landing/` | Public hero, services, and profile. |
| Portfolio | `src/features/portfolio/`| Masonry display of watermarked images via `lightgalleryjs`. |
| Wizard | `src/features/wizard/` | Step-by-step state machine for inquiry data collection. |
| Admin | `src/features/admin/` | Protected routes, lead datatables, image uploading tools. |

## State Management

| State Type | Tool | Notes |
|-----------|------|-------|
| Server state | `@supabase/supabase-js` | In-built caching and real-time capabilities. |
| Global UI state | Zustand | Stores `?agent_id` from URL, manages active user session tree. |
| Local component state | `useState` / `useReducer` | Form toggles, wizard step current index. |

## Routing (React Router v6)

| Route | Component | Auth Required | Notes |
|-------|-----------|---------------|-------|
| `/` | `LandingPage` | ❌ | Parses `?agent=` |
| `/build-now-pay-later`| `WizardPage` | ❌ | 4-step wizard |
| `/admin/login` | `AdminLogin` | ❌ | |
| `/admin/*` | `DashboardLayout` | ✅ | Requires active Supabase session |

## Implementation Notes
- **Tailwind CSS:** Must carefully map the "Architectural Monolith" colors (`#0B1E38`, `#C5A059`) in `tailwind.config.js`.
- **lightgalleryjs:** Triggers dynamically on portfolio image clicks. Requires injecting the high-res watermarked URL as the overlay source.
