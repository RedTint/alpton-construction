# Backend Architecture v1.0.0

**Project:** Alpton Construction Website & Admin Portal
**Version:** v1.0.0
**Date:** 2026-03-28

> Defined based on the Serverless Supabase infrastructure.

## Application Layer

Because we are utilizing a pure **Backend-as-a-Service (Supabase)**, there is no traditional Node/NestJS API server to maintain. The "Backend" consists of:
1. **PostgreSQL Database** (Data layer and logic via Triggers)
2. **GoTrue Auth** (JWT management)
3. **Storage** (S3-compatible bucket)
4. **Deno Edge Functions** (Serverless compute for custom tasks)

## Module Organization (Functions & Dynamic Data)

Instead of controllers/services, custom business logic lives in Edge Functions and Database abstractions:

| Module / Function | Trigger/Source | Responsibility |
|----------|---------|----------------|
| `watermark-worker` | Storage Webhook | Intercepts `INSERT` into the `raw-portfolio` bucket, applies the Alpton watermark, and saves to the public `portfolio-assets` bucket. |
| **Dynamic Wizard API** | PostgREST (NativeDB) | Exposes `wizard_questions` table to automatically construct the "BUILD NOW, PAY LATER" frontend, preventing hardcoded forms. |
| **Lead Ingestion API** | PostgREST (NativeDB) | Accepts the atomic lead creation and simultaneously bundles `lead_answers` map logic. |

## Authentication & Authorization

| Mechanism | Details |
|-----------|---------|
| Strategy | Supabase Email/Password Auth (GoTrue). |
| Token type | JWT (persisted securely in local/session storage on frontend). |
| Role-based access| Managed globally via Postgres **Row Level Security (RLS)**. |

## Middleware & Request Pipeline (RLS Guards)

Instead of Express/NestJS middleware, data access is secured intimately at the database level:
- `leads` table: Public wrapper function can `INSERT`. Only authenticated users with `role = admin` can `SELECT`, `UPDATE`, `DELETE`.
- `portfolio_assets` table: Public can `SELECT`. Only authenticated admins can `INSERT`, `UPDATE`, `DELETE`.

## Code Conventions

- **Edge Functions:** Written in TypeScript (Deno runtime). Must be strictly stateless and handle fast cold starts.
- **Watermarking:** Use lightweight Wasm or native Deno image manipulation libraries to composite the logo quickly, explicitly avoiding function timeout limits.
