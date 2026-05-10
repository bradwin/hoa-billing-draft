# Integration Test Instructions

## Scope

The current automated suite includes controller/component-level and domain integration-rule tests. It passes without a live PostgreSQL database. True database-backed integration execution is still a production blocker and must be completed before real financial or homeowner master data is used.

## Existing Integration Coverage

| Scenario | Path | Current Status |
|---|---|---|
| Auth and session flow | `apps/api/test/integration/auth-session.integration.spec.ts` | `it.todo` skeleton |
| Audit with protected mutation | `apps/api/test/integration/audit-protected-mutation.integration.spec.ts` | `it.todo` skeleton |
| Settings, approval, support intent flow | `apps/api/test/integration/settings-approval-support.integration.spec.ts` | `it.todo` skeleton |
| UOW-02 ownership/contact/billable validation rules | `apps/api/test/integration/uow02-workflows.integration.spec.ts` | Passing integration-rule tests |
| Protected web shell | `apps/web/test/integration/protected-shell.integration.spec.tsx` | Passing component-level skeleton |
| Foundation web workflows | `apps/web/test/integration/foundation-workflows.integration.spec.tsx` | `it.todo` skeleton |

## Required Local Integration Environment

### 1. Start Local Services

```bash
docker compose -f docker/docker-compose.local.yml up --build
```

### 2. Configure Database URL

Use a local test database, not production data.

```bash
export DATABASE_URL=postgresql://hoa_local:hoa_local_password@localhost:5432/hoa_billing_local
```

### 3. Apply Migrations

```bash
npm run prisma:migrate:dev
```

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

## Integration Scenarios To Operationalize

### Scenario 1: UOW-01 Authentication And Session Flow

- Create invited user with role-specific MFA requirement.
- Activate invitation using token digest only.
- Login returns generic failures for invalid credentials.
- Administrative roles enter MFA pending state.
- Logout is idempotent and revokes the session.
- Audit entries are created for security-sensitive actions.

Expected result: user/session/MFA state transitions are correct, raw tokens are never persisted, and audit records are append-only.

### Scenario 2: UOW-01 Settings Update With Audit

- Authenticate an actor with `settings.update_hoa_profile`.
- Update an allowed HOA profile setting.
- Reject an unknown setting key.
- Verify version increment and audit entry creation in the same logical mutation path.

Expected result: valid settings persist, invalid settings fail safely, and audit records preserve old/new values without sensitive metadata.

### Scenario 3: UOW-02 Homeowner Duplicate Review

- Create a homeowner with normalized contact and name keys.
- Attempt creation of a likely duplicate.
- Verify duplicate candidates are returned with safe signals.
- Confirm distinct homeowner with reason or remarks.
- Verify duplicate override audit includes actor, timestamp, reviewed candidate IDs, reason or remarks, and correlation ID.

Expected result: duplicate candidates block unattended creation, distinct-record override is audited, and unrestricted PII is not exposed.

### Scenario 4: UOW-02 Property Alias And Billable Validation

- Create a canonical property.
- Add and update aliases.
- Verify aliases resolve to the canonical property in search.
- Validate billable property for a supplied `validationDate`.

Expected result: alias mutation is audited, property identity remains canonical, and billable validation uses effective ownership period, effective billing-account period, and active responsible homeowner eligibility.

### Scenario 5: UOW-02 Ownership Transfer

- Create active homeowner and billable property.
- Assign primary owner effective `2025-01-01`.
- Transfer primary ownership effective `2025-06-01`.
- Verify previous period closes with `effectiveTo = 2025-06-01`.
- Verify new period starts at `2025-06-01`.
- Verify billing-account period is created only for the billing-responsible homeowner.

Expected result: half-open intervals do not overlap, new owner is responsible starting the transfer date, and historical responsibility remains intact.

### Scenario 6: UOW-02 Contact Change Approval

- Submit homeowner contact-only change request.
- Approve as authorized staff.
- Verify only UOW-02 approved contact fields change.
- Verify UOW-01 login email does not change.
- Reject a separate request and verify homeowner contact fields do not mutate.

Expected result: Pending can transition to Approved or Rejected, terminal states cannot transition, and contact email approval does not mutate authentication credentials.

## Cleanup

```bash
docker compose -f docker/docker-compose.local.yml down
```

Do not run destructive database cleanup against staging or production.

## Contract And E2E Notes

- REST endpoint contracts are currently validated through controllers and Zod schemas, not an OpenAPI contract suite.
- End-to-end browser automation is not yet configured.
- Add API contract and E2E test runners before production launch or before financial workflows are exposed to users.
