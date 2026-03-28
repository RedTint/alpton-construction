# C4 Architecture Diagrams v1.0.0

**Project:** {{PROJECT_NAME}}
**Version:** v1.0.0
**Date:** {{DATE}}

> Use `/define @175-c4-diagrams-v1.0.0.md` to generate diagrams from the tech stack and PRD.

## Level 1: System Context

Who uses the system and what external systems does it depend on?

```mermaid
C4Context
  title System Context — {{PROJECT_NAME}}

  Person(user, "User", "Primary user persona")
  System(system, "{{PROJECT_NAME}}", "Core system")
  System_Ext(ext1, "External Service", "e.g. Auth provider, payment, email")

  Rel(user, system, "Uses")
  Rel(system, ext1, "Calls API")
```

## Level 2: Container Diagram

What are the major deployable units (apps, databases, services)?

```mermaid
C4Container
  title Container Diagram — {{PROJECT_NAME}}

  Person(user, "User")

  Container_Boundary(system, "{{PROJECT_NAME}}") {
    Container(frontend, "Frontend", "React / Next.js", "User interface")
    Container(backend, "Backend", "Node.js / NestJS", "API and business logic")
    ContainerDb(db, "Database", "PostgreSQL", "Persistent storage")
    Container(cache, "Cache", "Redis", "Session and query cache")
  }

  Rel(user, frontend, "Uses", "HTTPS")
  Rel(frontend, backend, "API calls", "REST / WebSocket")
  Rel(backend, db, "Reads/writes")
  Rel(backend, cache, "Reads/writes")
```

## Level 3: Component Diagram

What are the major components inside the backend/frontend containers?

```mermaid
C4Component
  title Component Diagram — Backend

  Container_Boundary(backend, "Backend") {
    Component(controller, "Controllers", "NestJS", "HTTP request handling")
    Component(service, "Services", "NestJS", "Business logic")
    Component(repo, "Repositories", "TypeORM", "Data access layer")
    Component(auth, "AuthModule", "JWT / Passport", "Authentication")
  }

  Rel(controller, service, "Calls")
  Rel(service, repo, "Uses")
  Rel(controller, auth, "Validates token")
```

## Data Flow Descriptions

### Flow 1: [Name — e.g. User Authentication]

```
User → Frontend → POST /auth/login → AuthService → DB → JWT → Response
```

[Describe the key steps, what data moves, and any transformations]

### Flow 2: [Name]

```
[Describe]
```

## Architecture Notes & Decisions

- [Key architectural decision 1 — link to ADR if applicable]
- [Key architectural decision 2]
- [Known constraints or trade-offs]
