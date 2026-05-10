# Unit Test Execution Instructions

## Scope

These instructions run generated unit, component, integration-rule, and property-based tests for UOW-01 and UOW-02.

## Test Commands

### 1. Run All Example Tests

```bash
npm test
```

Current verified result after UOW-02 generation:

| Workspace | Test Suites | Passing Tests | Todo Tests | Status |
|---|---:|---:|---:|---|
| `@hoa/api` | 24 | 34 | 9 | Pass |
| `@hoa/web` | 7 | 11 | 4 | Pass |
| `@hoa/worker` | 2 | 3 | 0 | Pass |
| `@hoa/shared` | 5 | 16 | 0 | Pass |
| Total | 38 | 64 | 13 | Pass |

The `it.todo` entries are intentional skeletons for database-backed integration and future workflow coverage. They do not execute assertions yet.

### 2. Run Property-Based Tests

```bash
npm run test:pbt
```

Current verified result after UOW-02 generation:

| Workspace | PBT Status |
|---|---|
| `@hoa/api` | 6 suites, 7 PBT tests passed |
| `@hoa/shared` | 2 suites, 5 PBT tests passed |
| `@hoa/web` | No PBT files; script exits successfully |
| `@hoa/worker` | No PBT files; script exits successfully |

### 3. Replay a PBT Failure

```bash
PBT_SEED=<seed> npm run test:pbt:replay
```

Replace `<seed>` with the failing seed printed by `fast-check`.

## UOW-02 Targeted Test Commands

```bash
npm --workspace packages/shared test -- --runTestsByPath test/uow02/uow02-domain.spec.ts test/pbt/uow02.pbt.spec.ts
npm --workspace apps/api test -- --runTestsByPath test/uow02/contact-change.service.spec.ts test/uow02/property.service.spec.ts test/uow02/ownership.service.spec.ts test/uow02/uow02.pbt.spec.ts test/integration/uow02-workflows.integration.spec.ts
npm --workspace apps/web test -- --runTestsByPath test/uow02/uow02-components.spec.tsx
```

## Test Areas

| Area | Path |
|---|---|
| Shared schemas | `packages/shared/test/schemas/` |
| Shared permissions | `packages/shared/test/permissions/` |
| Shared value-object PBT | `packages/shared/test/pbt/` |
| Shared UOW-02 domain and PBT | `packages/shared/test/uow02/`, `packages/shared/test/pbt/uow02.pbt.spec.ts` |
| API audit | `apps/api/test/audit/` |
| API auth/session/abuse protection | `apps/api/test/auth/` |
| API MFA | `apps/api/test/mfa/` |
| API authorization | `apps/api/test/authorization/` |
| API settings | `apps/api/test/settings/` |
| API approvals | `apps/api/test/approvals/` |
| API support intents | `apps/api/test/support-intents/` |
| API UOW-02 services and PBT | `apps/api/test/uow02/` |
| API UOW-02 integration rules | `apps/api/test/integration/uow02-workflows.integration.spec.ts` |
| Web forms and shell | `apps/web/test/` |
| Web UOW-02 components | `apps/web/test/uow02/` |
| Worker jobs | `apps/worker/test/` |

## Required Follow-Up For Failing Tests

1. Capture the failing command, workspace, suite, and test name.
2. Fix the underlying implementation or test expectation.
3. Rerun the narrow workspace command first.
4. Rerun `npm test`.
5. Rerun `npm run test:pbt` if any property or generator changed.

## Coverage

No coverage threshold is configured. Add thresholds during a later Build and Test refinement only after the team agrees on minimum line, branch, and critical-path coverage requirements.
