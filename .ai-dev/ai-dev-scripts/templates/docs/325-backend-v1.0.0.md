# Backend Architecture v1.0.0

**Project:** {{PROJECT_NAME}}
**Version:** v1.0.0
**Date:** {{DATE}}

> Use `/define @325-backend-v1.0.0.md` to elaborate based on tech stack and API contract.

## Folder Structure

```
src/
├── modules/
│   └── [feature]/
│       ├── [feature].module.ts
│       ├── [feature].controller.ts
│       ├── [feature].service.ts
│       ├── [feature].repository.ts
│       ├── dto/
│       │   ├── create-[feature].dto.ts
│       │   └── update-[feature].dto.ts
│       └── entities/
│           └── [feature].entity.ts
├── common/
│   ├── guards/              # Auth guards
│   ├── interceptors/        # Logging, transform
│   ├── decorators/          # Custom decorators
│   ├── filters/             # Exception filters
│   └── pipes/               # Validation pipes
├── config/                  # Configuration modules
└── main.ts                  # Bootstrap
```

## Module Organization

| Module | Responsibility | Dependencies |
|--------|---------------|--------------|
| [Feature 1] | | |
| [Feature 2] | | |
| AuthModule | Authentication, JWT | |

## API Architecture Patterns

- **Controller** — HTTP layer only; delegates all logic to services
- **Service** — Business logic; orchestrates repositories and external calls
- **Repository** — Data access only; no business logic
- **DTO** — Request/response validation via class-validator
- **Entity** — ORM model; maps to database table

## Authentication & Authorization

| Mechanism | Details |
|-----------|---------|
| Strategy | |
| Token type | |
| Refresh | |
| Role-based access | |

## Middleware & Request Pipeline

```
Request → Guards → Interceptors → Controller → Service → Repository → DB
                                                     ↓
Response ← Transform Interceptor ← Controller ← Service
```

## Error Handling

| Error Type | HTTP Status | Response Format |
|-----------|-------------|-----------------|
| Validation | 400 | `{ message, errors[] }` |
| Unauthorized | 401 | `{ message }` |
| Forbidden | 403 | `{ message }` |
| Not Found | 404 | `{ message }` |
| Server Error | 500 | `{ message }` |

## Code Conventions

- [Convention 1 — e.g. "Services never access the database directly — always via repository"]
- [Convention 2 — e.g. "All endpoints require explicit auth guard unless marked @Public()"]
- [Convention 3]

## Implementation Notes

[Any noteworthy implementation details, gotchas, or architectural decisions]
