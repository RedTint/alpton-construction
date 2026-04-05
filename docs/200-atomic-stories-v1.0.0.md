# Atomic Stories v1.0.0

**Project:** Alpton Construction Website & Admin Portal
**Version:** v1.0.0
**Date:** 2026-03-28

> This file acts as the primary registry and breakdown of the MVP feature set into atomic stories. Each story maps to an individual file in `docs/epics/` via the `/sync-board` command.

---

## Epic 001 - Foundation & "BUILD NOW, PAY LATER" MVP

### Story 001 - Initialize React SPA & Tailwind Setup

**Priority:** Critical
**Effort:** 5

**As a** developer
**I want** to initialize the React SPA with Vite, React Router, and TailwindCSS
**So that** [the app has a solid foundation matching the "Architectural Monolith" design tokens]

- [ ] FE: Set up Vite + React + TypeScript project scaffold
- [ ] FE: Configure TailwindCSS with custom design tokens from design system
- [ ] FE: Set up React Router with base route structure
- [ ] TEST: Verify dev server runs and landing route loads

### Story 002 - Build Public Landing & Services Pages

**Priority:** High
**Effort:** 5

**As a** potential client
**I want** to view the company's landing page and services
**So that** [I can understand what Alpton Construction offers and contact them]

- [ ] FE: Implement static hero section with company profile
- [ ] FE: Build services layout using standard UI components
- [ ] FE: Ensure responsive design across mobile and desktop
- [ ] TEST: Smoke test all public page routes render correctly

### Story 003 - Integrate lightgalleryjs Portfolio

**Priority:** High
**Effort:** 5

**As a** potential client
**I want** to browse the construction portfolio in a gallery
**So that** [I can view full-screen project photos before making an inquiry]

- [ ] FE: Build masonry portfolio grid component
- [ ] FE: Integrate lightgalleryjs for full-screen viewing
- [ ] FE: Load portfolio data from static JSON or Supabase
- [ ] TEST: Verify gallery opens and navigates correctly

### Story 004 - Implement Inquiry Wizard UI & Form State

**Priority:** Critical
**Effort:** 8

**As a** prospective client
**I want** to complete a multi-step inquiry form
**So that** [I can apply for the "BUILD NOW, PAY LATER" qualification process]

- [ ] FE: Build multi-step wizard with Zustand form state
- [ ] FE: Implement all steps — contact info, project details, qualification fields
- [ ] FE: Add validation and step navigation (back/next/submit)
- [ ] TEST: Verify form state persists across steps and submits correctly

### Story 005 - Capture Facebook Agent Attribution

**Priority:** High
**Effort:** 3

**As a** marketing manager
**I want** Facebook agent attribution captured on form submissions
**So that** [I can track which agent's link drove the lead]

- [ ] FE: Parse `?agent=` URL parameter on initial page load
- [ ] FE: Persist agent value in Zustand store and SessionStorage
- [ ] FE: Include agent field in wizard submission payload
- [ ] TEST: Verify agent value is captured and retained across page reloads

---

## Epic 002 - Backend Services & Admin Portal

### Story 001 - Configure Supabase DB & Auth

**Priority:** Critical
**Effort:** 5

**As a** developer
**I want** to initialize Supabase with PostgreSQL schema and GoTrue Auth
**So that** [the backend is ready to persist leads and authenticate admin users]

- [ ] BE: Initialize Supabase project with `leads` and `portfolio` tables
- [ ] BE: Configure GoTrue Auth for admin user management
- [ ] BE: Set up Row Level Security policies for admin-only access
- [ ] TEST: Verify DB connection and auth flow work end-to-end

### Story 002 - Build Admin Login & Protected Routes

**Priority:** High
**Effort:** 5

**As a** site administrator
**I want** to log in to an admin dashboard with protected routes
**So that** [only authorized users can view and manage lead data]

- [ ] FE: Create `/admin` login screen with Supabase auth
- [ ] FE: Secure dashboard routes in React Router using session state
- [ ] FE: Redirect unauthenticated users to login
- [ ] TEST: Verify protected routes are inaccessible without valid session

### Story 003 - Connect Wizard to Supabase DB

**Priority:** Critical
**Effort:** 5

**As a** system
**I want** wizard submissions persisted to Supabase
**So that** [lead data including agent attribution is reliably stored in the database]

- [ ] BE: Wire wizard final step to insert into `leads` table
- [ ] BE: Include `agent` attribution field in DB insert
- [ ] FE: Handle submission success and error states in wizard UI
- [ ] TEST: Verify lead record appears in Supabase after form submission

### Story 004 - Implement Admin Leads Dashboard

**Priority:** High
**Effort:** 5

**As a** site administrator
**I want** to view all incoming leads in a dashboard table
**So that** [I can review and follow up on client inquiries]

- [ ] FE: Build data table view in the Admin portal
- [ ] BE: Fetch leads from Supabase with pagination/sorting
- [ ] FE: Display all relevant lead fields including agent attribution
- [ ] TEST: Verify leads dashboard loads and displays data correctly

### Story 005 - Create Portfolio Upload Form

**Priority:** Medium
**Effort:** 5

**As a** site administrator
**I want** to upload new portfolio photos via an admin form
**So that** [the public portfolio stays up to date without developer intervention]

- [ ] FE: Build portfolio photo upload form in admin UI
- [ ] BE: Upload photos to Supabase Storage
- [ ] BE: Create `portfolio` record with photo URL after upload
- [ ] TEST: Verify uploaded photo appears in public portfolio gallery

### Story 006 - Develop Auto-Watermarking Edge Function

**Priority:** Medium
**Effort:** 8

**As a** site owner
**I want** uploaded portfolio photos automatically watermarked
**So that** [the company brand is protected on all public images]

- [ ] BE: Write Deno edge function triggered on Supabase Storage insert
- [ ] BE: Apply company watermark to uploaded image
- [ ] BE: Update portfolio record with watermarked public URL
- [ ] TEST: Verify watermark is applied and public URL is updated after upload

---

*To begin development on a story, use the `/new-feature` or `/build` commands to formally track progress in `docs/epics/`.*
