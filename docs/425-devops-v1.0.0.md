# DevOps & Local Setup v1.0.0

**Project:** Alpton Construction Website & Admin Portal
**Version:** v1.0.0
**Date:** 2026-03-28

> Defined specifically around a local Dockerized workflow (`bash up.sh`) and Terraform provisioning target.

## Infrastructure Overview

| Component | Technology | Target |
|-----------|-----------|-------------|
| Frontend Host | Vercel or Netlify | Vercel (Deployed via GitHub Actions or Vercel CLI) |
| Backend/DB | Supabase | Cloud or Local Docker Instance via Supabase CLI |
| IaC | Terraform | Provisioning Supabase projects/buckets & Vercel project |

## Local Development Setup

To ensure developers can test the full stack offline or locally, the environment is fully **Dockerized** using the official Supabase CLI combined with Docker Compose principles. Developers do not need to connect to a cloud DB.

### Directory Setup

```text
/alpton-construction
├── /frontend           # React SPA
├── /supabase           # Supabase Edge Functions, Migrations, local config
├── /terraform          # Infrastructure as Code
└── up.sh               # Single command bootstrap
```

### The `up.sh` Script

```bash
#!/bin/bash
echo "🚀 Starting Alpton Construction Local Environment..."

# 1. Start local Supabase instance using Docker (Auth, Postgres, Storage, Edge Runtime)
npx supabase start

# 2. Deploy database migrations locally if needed
npx supabase db push

# 3. Start Frontend
cd frontend && npm install && npm run dev
```

## Infrastructure as Code (Terraform)

**Location:** `terraform/`

**Providers:**
- `supabase/supabase` (for project configuration, database settings, auth settings)
- `vercel/vercel` (for pushing the React frontend to edge networks)

**Resources managed:**
- **Supabase Project & Organization Setup**
- **Row Level Security (RLS) enforcement** (usually orchestrated via migration SQL applied through TF or CLI)
- **Storage Buckets** (`raw-portfolio` and `portfolio-assets`)
- **Vercel Frontend Deployment** tied to the specific GitHub repository

## CI/CD Pipeline

Our Vercel integration automatically creates preview deployments on every Pull Request.

### Pull Request Pipeline
```text
push to branch
  → Vercel Preview Build Trigger
  → Frontend Lints & Types (Vitest)
  → Supabase CLI: Validates Migrations against clean DB
```

### Merge to Main Pipeline
```text
merge to main
  → Terraform Apply (if `terraform/` files changed)
  → Vercel Production Build
  → Supabase Actions: Push migrations to production DB
  → Supabase Actions: Deploy Deno Edge functions to Cloud
```

## Rollback Procedures
- **Frontend:** Instant rollback via Vercel dashboard to previous deployment ID.
- **Database:** Supabase automated daily backups and Point-in-Time Recovery (PITR).
