# UOW-01 Test Summary

## Example Tests

| Area | Test Paths |
|---|---|
| Shared schemas | `packages/shared/test/schemas/schemas.spec.ts` |
| Permissions | `packages/shared/test/permissions/permissions.spec.ts` |
| Audit | `apps/api/test/audit/` |
| Auth/session/abuse | `apps/api/test/auth/` |
| MFA | `apps/api/test/mfa/` |
| Authorization | `apps/api/test/authorization/` |
| Settings | `apps/api/test/settings/` |
| Approvals | `apps/api/test/approvals/` |
| Support intents | `apps/api/test/support-intents/` |
| Worker | `apps/worker/test/` |
| Frontend | `apps/web/test/` |

## Property-Based Tests

| Property | Test Path |
|---|---|
| Money parse/format round-trip | `packages/shared/test/pbt/value-objects.pbt.spec.ts` |
| Audit append/hash-chain preservation | `apps/api/test/audit/audit.pbt.spec.ts` |
| Session digest determinism and raw-token non-equivalence | `apps/api/test/auth/session.pbt.spec.ts` |
| Password reset token consumption idempotence | `apps/api/test/auth/reset-token.pbt.spec.ts` |
| Undefined permission deny-by-default | `apps/api/test/authorization/authorization.pbt.spec.ts` |
| Approval terminal state transitions | `apps/api/test/approvals/approval-state.pbt.spec.ts` |

## Seed Replay

PBT supports `PBT_SEED` through npm scripts:

- `npm run test:pbt`
- `PBT_SEED=<seed> npm run test:pbt:replay`

## Verification Execution

Verification executed during UOW-01 Code Generation:

- `npm run typecheck`
- `npm test`
- `npm run test:pbt`
- `npm run build`
- `npm run lint`
- `npm audit`

All commands passed. Integration tests that require a real PostgreSQL test database remain represented as `it.todo` skeletons for the Build and Test stage to operationalize with test infrastructure.
