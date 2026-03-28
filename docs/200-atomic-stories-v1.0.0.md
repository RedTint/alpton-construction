# Atomic Stories v1.0.0

**Project:** Alpton Construction Website & Admin Portal
**Version:** v1.0.0
**Date:** 2026-03-28

> This file acts as the primary registry and breakdown of the MVP feature set into atomic stories. (These can later be converted into individual files in `docs/epics/` using the `/new-feature` workflow).

## Epic 001: Foundation & "BUILD NOW, PAY LATER" MVP

| Story ID | Title | Priority | Status | Description |
|----------|-------|----------|--------|-------------|
| 001-001 | Initialize React SPA & Tailwind Setup | Critical | ✅ Done | Set up Vite, React Router, and TailwindCSS matching the "Architectural Monolith" design tokens. |
| 001-002 | Build Public Landing & Services Pages | High | ✅ Done | Implement the static hero section, company profile, and services layout using standard UI components. |
| 001-003 | Integrate lightgalleryjs Portfolio | High | ✅ Done | Build the masonry portfolio grid components and wire up `lightgalleryjs` for full-screen viewing. |
| 001-004 | Implement Inquiry Wizard UI & Form State | Critical | 🏃 In Progress | Build the interactive multi-step form for the "BUILD NOW, PAY LATER" qualification process. |
| 001-005 | Capture Facebook Agent Attribution | High | ⏳ Pending | Parse `?agent=` URL parameter on initial load and persist it in Zustand/SessionStorage to map to submissions. |

## Epic 002: Backend Services & Admin Portal

| Story ID | Title | Priority | Status | Description |
|----------|-------|----------|--------|-------------|
| 002-001 | Configure Supabase DB & Auth | Critical | ⏳ Pending | Initialize Supabase project, setup PostgreSQL schema for `leads` and `portfolio`, and configure GoTrue Auth. |
| 002-002 | Build Admin Login & Protected Routes | High | ⏳ Pending | Create the `/admin` login screen and secure the dashboard routes in React Router using Supabase session state. |
| 002-003 | Connect Wizard to Supabase DB | Critical | ⏳ Pending | Wire the final step of the Inquiry Wizard to insert data (including `agent` attribution) into the Supabase database. |
| 002-004 | Implement Admin Leads Dashboard | High | ⏳ Pending | Build a data table view in the Admin portal to fetch and display incoming leads from Supabase. |
| 002-005 | Create Portfolio Upload Form | Medium | ⏳ Pending | Build UI for admins to upload new portfolio photos directly to Supabase Storage. |
| 002-006 | Develop Auto-Watermarking Edge Function | Medium | ⏳ Pending | Write a Deno edge function that triggers on storage insert, applies the watermark, and updates the public URL. |

---

*To begin development on a story, use the `/new-feature` or `/build` commands to formally track progress in `docs/epics/`.*
