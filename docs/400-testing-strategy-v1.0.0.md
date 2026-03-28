# Testing Strategy v1.0.0

**Project:** {{PROJECT_NAME}}
**Version:** v1.0.0
**Date:** 2026-03-28

> Use `/define @400-testing-strategy-v1.0.0.md` to elaborate based on tech stack decisions.

## Testing Pyramid

```
        /\
       /E2E\          Few — critical user journeys only
      /------\
     /Integr. \       Moderate — API contracts, DB interactions
    /----------\
   / Unit Tests \     Many — services, utilities, components
  /--------------\
```

## Coverage Targets

| Layer | Target | Tool |
|-------|--------|------|
| Unit (overall) | 80% | |
| Unit (services) | 90% | |
| Integration | Key paths | |
| E2E | Critical journeys | |

## Unit Testing

**Tool:** [Jest / Vitest]
**Location:** Co-located with source (`*.spec.ts` / `*.test.ts`)

**What to test:**
- Service business logic
- Utility functions and formatters
- React component rendering and interactions
- Custom hooks

**What NOT to unit test:**
- Controllers (covered by integration)
- Database queries (covered by integration)
- External API calls (mock at boundary)

**Patterns:**
```typescript
describe('FeatureService', () => {
  it('should [expected behavior] when [condition]', () => {
    // Arrange
    // Act
    // Assert
  })
})
```

## Integration Testing

**Tool:** [Supertest / Jest with real DB]
**Location:** `test/` or `src/**/*.integration.spec.ts`

**What to test:**
- API endpoint request/response contracts
- Database read/write operations
- Auth flows (login → protected route)
- WebSocket events

**Setup:** Use a dedicated test database; reset between test suites.

## E2E Testing

**Tool:** [Playwright / Cypress]
**Location:** `e2e/` or `playwright/`

**Critical journeys to cover:**
- [ ] [Journey 1 — e.g. User sign-up and first login]
- [ ] [Journey 2 — e.g. Core feature happy path]
- [ ] [Journey 3 — e.g. Error and recovery flow]

## CI Integration

- Unit tests run on every PR (must pass before merge)
- Integration tests run on every PR
- E2E tests run on merge to `main` / nightly
- Coverage report generated and checked against targets

## Test Data Management

- Unit: use factories / builders (e.g. `fishery`, `factory-bot`)
- Integration: seed scripts per test suite
- E2E: dedicated test accounts and seeded data

## Performance Testing

[Describe load testing approach — tool, target endpoints, acceptable thresholds]

| Endpoint | p95 Target | Tool |
|----------|-----------|------|
| `GET /api/[resource]` | < 200ms | |
