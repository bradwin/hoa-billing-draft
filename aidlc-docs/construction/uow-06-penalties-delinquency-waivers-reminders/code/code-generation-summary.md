# UOW-06 Code Generation Summary

## Unit

- **Unit ID**: UOW-06
- **Unit Name**: Penalties, Delinquency, Waivers, and Reminders
- **Stage**: Code Generation

## Generated Application Code

| Area | Paths |
|---|---|
| Shared domain code | `packages/shared/src/uow06/` |
| Shared schemas | `packages/shared/src/schemas/uow06.ts` |
| Shared permissions | `packages/shared/src/permissions/permissions.ts`, `packages/shared/src/permissions/matrix.ts` |
| Database schema and migration | `prisma/schema.prisma`, `prisma/migrations/202605100006_uow06_penalties_delinquency_waivers_reminders/migration.sql` |
| API module | `apps/api/src/modules/uow06/` |
| API repository | `apps/api/src/persistence/repositories/uow06.repository.ts` |
| Frontend feature and routes | `apps/web/src/features/uow06/`, `apps/web/src/app/uow06/penalties/page.tsx`, `apps/web/src/app/portal/delinquency/page.tsx` |
| Tests | `packages/shared/test/uow06/`, `packages/shared/test/pbt/uow06.pbt.spec.ts`, `apps/api/test/uow06/`, `apps/web/test/uow06/` |

## Business Logic Coverage

| Capability | Implementation |
|---|---|
| Overdue evaluation | Shared date-control helpers derive first overdue date, aging day count, and aging bucket from explicit `evaluationDate`. |
| Aging | API and frontend support aging list views with deterministic bucket labels. |
| Penalties | Shared helpers calculate non-compounding basis, penalty period keys, percentage penalty amounts, duplicate keys, and duplicate-blocking statuses. |
| Waivers | Shared lifecycle helpers enforce waiver idempotency keys and available unpaid penalty limits. |
| Reminders | Shared reminder helpers define duplicate keys and MVP suppression for duplicate same-period reminders or missing authorized contact paths. |
| Balance impacts | Prisma and repository layer persist penalty-side and waiver-side balance-impact facts without creating a mutable balance source of truth. |

## Boundary Confirmation

UOW-06 code does not create invoices, invoice lines, invoice numbers, payments, allocations, credits, receipts, statements, reports, exports, rendered documents, sent emails, stored files, import batches, retry jobs, support jobs, or mutable account-balance source-of-truth records.

Reminder workflows create reminder intent records and delegate delivery to UOW-01 support intent contracts for later UOW-08 processing. UOW-06 does not render PDFs, send SMTP email, store files, or retry delivery.

## Verification Scope

Planned verification covers Prisma generation, TypeScript typecheck, shared UOW-06 tests, API UOW-06 tests, web UOW-06 tests, property-based tests, boundary scans, content validation, and duplicate generated file checks.
