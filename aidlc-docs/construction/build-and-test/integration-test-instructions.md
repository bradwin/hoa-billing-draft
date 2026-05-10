# Integration Test Instructions

## Purpose

Validate interactions across generated units and shared infrastructure boundaries.

## Existing Integration Suites

| Scenario | Command | Expected Result |
|---|---|---|
| UOW-01 auth/session integration | `npm test -w @hoa/api -- test/integration/auth-session.integration.spec.ts` | Auth/session flows stay server-authorized. |
| Audit-protected mutation integration | `npm test -w @hoa/api -- test/integration/audit-protected-mutation.integration.spec.ts` | Protected mutations produce audit facts. |
| Settings, approval, and support integration | `npm test -w @hoa/api -- test/integration/settings-approval-support.integration.spec.ts` | UOW-01 support contracts remain usable by later units. |
| UOW-02 workflow integration | `npm test -w @hoa/api -- test/integration/uow02-workflows.integration.spec.ts` | Homeowner/property/contact workflows remain valid. |
| UOW-06 boundary integration | `npm test -w @hoa/api -- test/integration/uow06-boundaries.integration.spec.ts` | Reminder work remains intent-only and does not render or deliver directly. |
| Protected web shell integration | `npm test -w @hoa/web -- test/integration/protected-shell.integration.spec.tsx` | Frontend protected shell behavior remains stable. |
| Foundation workflow integration | `npm test -w @hoa/web -- test/integration/foundation-workflows.integration.spec.tsx` | Frontend foundation workflows remain stable. |

## Full Integration-Oriented Verification

```bash
npm run test
```

## Database Migration Verification

For a local PostgreSQL database:

```bash
npm run prisma:migrate:deploy
```

Expected results:

| Check | Expected Result |
|---|---|
| Prisma migration order | UOW-01 through UOW-06 migrations apply cleanly. |
| UOW-06 uniqueness | Penalty duplicate, waiver idempotency, and reminder duplicate constraints exist. |
| UOW-06 relationships | Waiver, reminder intent, and balance-impact foreign keys are present. |

## Cleanup

Use a disposable local database for migration verification. Drop or reset the local database after testing when test data is no longer needed.
