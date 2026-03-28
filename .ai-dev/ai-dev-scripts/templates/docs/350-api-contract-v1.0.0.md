# API Contract v1.0.0

**Project:** {{PROJECT_NAME}}
**Version:** v1.0.0
**Date:** {{DATE}}

> Use `/define @350-api-contract-v1.0.0.md` to elaborate based on backend architecture and user flows.

## Overview

- **Base URL:** `http://localhost:3000/api` (dev) / `https://api.{{PROJECT_NAME}}.com` (prod)
- **Protocol:** REST over HTTPS
- **Auth:** [JWT Bearer / API Key / OAuth]
- **Format:** JSON (`Content-Type: application/json`)
- **Versioning:** [URL prefix `/v1/` / Header `API-Version`]

## Authentication

```
Authorization: Bearer <jwt_token>
```

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Exchange credentials for JWT |
| `/auth/refresh` | POST | Refresh access token |
| `/auth/logout` | POST | Invalidate token |

### Login Request/Response

```json
// POST /auth/login
// Request
{ "email": "user@example.com", "password": "secret" }

// Response 200
{ "access_token": "eyJ...", "refresh_token": "eyJ...", "expires_in": 3600 }

// Response 401
{ "message": "Invalid credentials" }
```

## Endpoints

### [Feature 1] — `/api/[resource]`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/[resource]` | GET | ✅ | List all |
| `/api/[resource]/:id` | GET | ✅ | Get one |
| `/api/[resource]` | POST | ✅ | Create |
| `/api/[resource]/:id` | PUT | ✅ | Update |
| `/api/[resource]/:id` | DELETE | ✅ | Delete |

#### GET `/api/[resource]`

```json
// Response 200
{
  "data": [{ "id": "uuid", "name": "string", "createdAt": "ISO8601" }],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

#### POST `/api/[resource]`

```json
// Request
{ "name": "string", "description": "string" }

// Response 201
{ "id": "uuid", "name": "string", "createdAt": "ISO8601" }

// Response 400 (validation error)
{ "message": "Validation failed", "errors": [{ "field": "name", "message": "required" }] }
```

## WebSocket Events (if applicable)

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `[event:name]` | Server → Client | `{ ... }` | |
| `[event:name]` | Client → Server | `{ ... }` | |

## Error Response Format

```json
{
  "statusCode": 400,
  "message": "Human-readable error message",
  "errors": [{ "field": "fieldName", "message": "Specific error" }]
}
```

## Pagination

All list endpoints accept:
- `?page=1` — page number (default: 1)
- `?limit=20` — items per page (default: 20, max: 100)
- `?sort=createdAt` — sort field
- `?order=desc` — sort direction (`asc` | `desc`)
