# Frontend Architecture v1.0.0

**Project:** {{PROJECT_NAME}}
**Version:** v1.0.0
**Date:** {{DATE}}

> Use `/define @300-frontend-v1.0.0.md` to elaborate based on design system and tech stack.

## Folder Structure

```
src/
├── components/
│   ├── ui/                  # Design system primitives (Button, Input, Modal, etc.)
│   ├── layout/              # Shell, Sidebar, Header, Footer
│   └── features/            # Feature-specific composite components
│       └── [feature-name]/
├── pages/                   # Route-level components (Next.js) or views (React)
├── hooks/                   # Custom hooks (useAuth, useFetch, etc.)
├── lib/                     # Utilities, formatters, validators
├── api/                     # API client, request functions, types
├── stores/                  # State management (Zustand, Redux, etc.)
├── styles/                  # Global CSS, CSS variables, Tailwind config
├── types/                   # Shared TypeScript types and interfaces
└── assets/                  # Static assets — images, icons, fonts
```

## Module Organization

| Module | Path | Responsibility |
|--------|------|----------------|
| [Feature 1] | `src/features/[name]/` | |
| [Feature 2] | `src/features/[name]/` | |

## Component Architecture

### Naming Conventions
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utilities: `camelCase.ts`
- Types: `PascalCase.types.ts`

### Component Patterns
- **UI primitives** (`components/ui/`) — stateless, fully controlled, no business logic
- **Feature components** (`components/features/`) — connected to state/API, business-aware
- **Page components** (`pages/`) — route entry points, handle layout and data fetching

## State Management

| State Type | Tool | Notes |
|-----------|------|-------|
| Server state | | e.g. React Query, SWR |
| Global UI state | | e.g. Zustand, Redux |
| Local component state | useState / useReducer | |
| Form state | | e.g. React Hook Form |

## Routing

| Route | Component | Auth Required | Notes |
|-------|-----------|---------------|-------|
| `/` | | | |
| `/[feature]` | | | |

## API Integration

[How the frontend communicates with the backend — REST client setup, auth headers, error handling, request/response typing]

## Code Conventions

- [Convention 1 — e.g. "Always type API responses with Zod schemas"]
- [Convention 2 — e.g. "No prop drilling beyond 2 levels — use context or state"]
- [Convention 3]

## Implementation Notes

[Any noteworthy implementation details, gotchas, or decisions specific to this project]
