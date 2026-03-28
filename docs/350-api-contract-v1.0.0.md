# API Contract v1.0.0

**Project:** Alpton Construction Website & Admin Portal
**Version:** v1.0.0
**Date:** 2026-03-28

> Defined based on Supabase PostgREST client integrations.

## Overview

- **SDK Interface:** `@supabase/supabase-js` (Frontend abstraction over REST)
- **Protocol:** HTTP REST & WebSockets
- **Auth:** Supabase JWT Bearer via Session handling.

## Authentication

```javascript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@alpton.com',
  password: 'securePassword'
})

// Logout
await supabase.auth.signOut()
```

## Endpoints (Data Access)

### Leads Submission (Wizard)

```javascript
// Request: Insert new lead from Wizard
const { data, error } = await supabase
  .from('leads')
  .insert([
    { 
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      facebook_account: 'johndoe.real',
      affiliation_job: 'Software Engineer',
      affiliation_company: 'TechCorp',
      affiliation_years: 5,
      linkedin_url: 'linkedin.com/in/johndoe',
      agent_id: 'mark_s' // Captured from Zustand state tracking param
    }
  ])
  .select()
```

### Fetch Admin Dashboard Leads

```javascript
// Fetch all leads (Requires Admin JWT session; RLS enforces protection)
const { data, error } = await supabase
  .from('leads')
  .select('*, agents(name)')
  .order('created_at', { ascending: false })
```

### Portfolio Image Upload

```javascript
// Upload raw image to storage trigger bucket
// This initiates the Edge Function processing the watermark.
const { data, error } = await supabase.storage
  .from('raw-portfolio')
  .upload(`projects/${fileName}`, fileData, {
    cacheControl: '3600',
    upsert: false
  })
```

## Error Response Format

Errors return the standard PostgREST error structure out of the box:
```json
{
  "code": "23505",
  "details": "Key (id)=(...) already exists.",
  "hint": null,
  "message": "duplicate key value violates unique constraint"
}
```
