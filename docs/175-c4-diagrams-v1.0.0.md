# C4 Architecture Diagrams v1.0.0

**Project:** Alpton Construction Website & Admin Portal
**Version:** v1.0.0
**Date:** 2026-03-28

> Defined based on the React + Supabase Serverless Architecture.

## Level 1: System Context

```mermaid
C4Context
  title System Context — Alpton Construction Portal

  Person(client, "Potential Client", "Browses portfolio, applies for financing")
  Person(admin, "Alpton Admin", "Manages portfolio, reviews leads")
  System(spa, "Alpton SPA", "The core React application")
  System_Ext(supabase, "Supabase BaaS", "Provides Auth, Database, Storage, and Edge compute")
  System_Ext(fb, "Facebook Ads", "Source of attributed lead traffic")

  Rel(client, fb, "Clicks ad")
  Rel(fb, spa, "Redirects to site with ?agent_id")
  Rel(client, spa, "Views portfolio, submits inquiry")
  Rel(admin, spa, "Logs in, manages data")
  Rel(spa, supabase, "Reads/Writes data, authenticates")
```

## Level 2: Container Diagram

```mermaid
C4Container
  title Container Diagram — Serverless Infrastructure

  Person(client, "Potential Client")
  Person(admin, "Alpton Admin")

  System_Ext(fb, "Facebook / Agent Pages")

  Container_Boundary(frontend, "Frontend (Hosting: Vercel/Netlify)") {
    Container(spa, "React SPA", "React, Vite, Zustand", "Handles all rendering, routing, and UI state")
  }

  Container_Boundary(backend, "Backend (Supabase)") {
    Container(auth, "GoTrue Auth", "Supabase", "JWT issuing & validation")
    ContainerDb(db, "PostgreSQL", "Supabase", "Stores Leads and Portfolio metadata")
    Container(storage, "S3 Storage", "Supabase", "Stores raw and watermarked images")
    Container(edge, "Deno Edge Functions", "Supabase", "Executes watermarking on upload triggers")
  }

  Rel(fb, spa, "Routes traffic")
  Rel(client, spa, "Interacts")
  Rel(admin, spa, "Interacts")
  
  Rel(spa, auth, "Authenticates admins")
  Rel(spa, db, "CRUD operations (via PostgREST)")
  Rel(spa, storage, "Uploads raw images (Admins only) / Fetches images (Clients)")
  Rel(storage, edge, "Storage Webhook Trigger")
  Rel(edge, storage, "Saves watermarked image")
```

## Level 3: Component Diagram

```mermaid
C4Component
  title Component Diagram — React SPA

  Container_Boundary(spa, "React SPA") {
    Component(router, "React Router", "Routing", "Handles URL states and protected routes")
    Component(landing, "Landing Page View", "React Component", "Displays hero and services")
    Component(gallery, "Portfolio Gallery", "lightgalleryjs", "Immersive image viewer")
    Component(wizard, "Inquiry Wizard", "React Form", "Multi-step user data collection")
    Component(adminDash, "Admin Dashboard", "React Component", "Protected CRM table and upload forms")
    Component(store, "Zustand Store", "State", "Manages admin session & tracking params")
  }

  Rel(router, landing, "Routes /")
  Rel(router, wizard, "Routes /build-now-pay-later")
  Rel(router, adminDash, "Routes /admin (Protected)")
  Rel(landing, gallery, "Initializes")
  Rel(adminDash, store, "Reads Auth State")
  Rel(wizard, store, "Reads FB Agent ID")
```

## Data Flow Descriptions

### Flow 1: Lead Submission with Agent Attribution

```text
Facebook Ad -> SPA (Extracts ?agent_id & Saves to Zustand) -> User Fills Wizard -> SPA maps User Data + agent_id -> POST to Supabase DB -> Lead Created
```

- When a user clicks a Facebook link, the SPA's router extracts the `agent` parameter and stores it in the global state/session.
- The user progresses through the "BUILD NOW, PAY LATER" wizard.
- On step submission, the SPA bundles the form data with the tracked `agent_id` and makes a direct PostgREST call to the Supabase PostgreSQL database.

### Flow 2: Automated Portfolio Watermarking

```text
Admin -> SPA Uploads Image -> Supabase Storage (Bucket) -> Triggers Deno Edge Function -> Applies Watermark -> Saves to Public Bucket -> DB Updated
```

- An authenticated Admin uploads a raw project photo directly to a private Supabase Storage bucket.
- Supabase triggers a webhook to a Deno Edge Function.
- The Edge function downloads the image, composites the Alpton logo/watermark over it, and saves the final result to the public portfolio bucket.
- The Edge function then inserts a record into the PostgreSQL `portfolio_assets` table with the public URL.

## Architecture Notes & Decisions

- **Serverless Paradigm:** Evaluated and intentionally discarded NestJS to remove idle compute costs and deployment complexity (See Tech Stacks).
- **Edge Compute:** Watermarking via Supabase Edge Functions ensures the SPA client isn't bogged down by heavy image processing libraries (e.g., HTMLCanvas operations), creating a more reliable admin experience.
