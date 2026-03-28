# Database Schema v1.0.0

**Project:** {{PROJECT_NAME}}
**Version:** v1.0.0
**Date:** {{DATE}}

> Use `/define @375-database-schema-v1.0.0.md` to elaborate based on the API contract and backend architecture.

## Entity Relationship Diagram

```mermaid
erDiagram
  USER {
    uuid id PK
    string email
    string password_hash
    string role
    timestamp created_at
    timestamp updated_at
  }

  [ENTITY] {
    uuid id PK
    uuid user_id FK
    string name
    timestamp created_at
    timestamp updated_at
  }

  USER ||--o{ [ENTITY] : "owns"
```

## Table Definitions

### `users`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `email` | VARCHAR(255) | No | | Unique user email |
| `password_hash` | VARCHAR(255) | No | | Bcrypt hash |
| `role` | ENUM | No | `'user'` | `user` \| `admin` |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | |
| `updated_at` | TIMESTAMPTZ | No | `NOW()` | |

**Indexes:** `email` (unique)

### `[table_name]`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | |
| `user_id` | UUID | No | | FK → `users.id` |
| `name` | VARCHAR(255) | No | | |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | |
| `updated_at` | TIMESTAMPTZ | No | `NOW()` | |

**Indexes:** `user_id`
**Foreign Keys:** `user_id` → `users.id` ON DELETE CASCADE

## Relationships

| Table A | Relationship | Table B | Notes |
|---------|-------------|---------|-------|
| `users` | 1:N | `[table]` | A user owns many |

## Data Validation Rules

| Table | Column | Rule |
|-------|--------|------|
| `users` | `email` | Must be valid email format, unique |
| `users` | `password_hash` | Min 8 chars before hashing |

## Business Rules

- [Rule 1 — e.g. "A user cannot be deleted if they have active subscriptions"]
- [Rule 2]

## Migration Strategy

- Migrations managed by [TypeORM / Flyway / Prisma Migrate]
- Migration files in `src/migrations/` or `db/migrations/`
- Never edit applied migrations — always create a new one
- Naming: `YYYYMMDDHHMMSS-description.ts`

## Seed Data

[Describe any required seed data for development/staging — admin user, default categories, etc.]
