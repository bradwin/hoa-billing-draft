# UOW-05 Code Summary

## Unit

- **Unit ID**: UOW-05
- **Unit Name**: Payments, Allocations, Credits, Receipts, and Financial Corrections
- **Stage**: Code Generation

## Application Code Generated

| Area | Paths |
|---|---|
| Shared contracts | `packages/shared/src/uow05/`, `packages/shared/src/schemas/uow05.ts`, `packages/shared/src/permissions/` |
| Shared tests | `packages/shared/test/uow05/`, `packages/shared/test/pbt/uow05.pbt.spec.ts` |
| Database | `prisma/schema.prisma`, `prisma/migrations/202605100003_uow05_payments_allocations_receipts/migration.sql` |
| API repository | `apps/api/src/persistence/repositories/uow05.repository.ts` |
| API module | `apps/api/src/modules/uow05/`, `apps/api/src/app.module.ts` |
| API tests | `apps/api/test/uow05/` |
| Frontend | `apps/web/src/features/uow05/`, `apps/web/src/app/uow05/`, `apps/web/src/app/portal/payments/`, `apps/web/src/app/portal/receipts/` |
| Frontend tests | `apps/web/test/uow05/uow05-components.spec.tsx` |

## Implemented Story Coverage

| Story | Coverage |
|---|---|
| US-015 | Payment proof submission contracts, API, proof status UI, support attachment reference boundary, authorization, and tests. |
| US-016 | Staff proof review, duplicate-risk guard, payment posting service, audit adapter use, staff UI, and tests. |
| US-017 | Allocation conservation helpers, posting allocation records, credit remainder creation, credit application route, balance-impact structures, UI, and PBT. |
| US-018 | Receipt source records, receipt numbering structure, receipt snapshots, receipt detail UI, and support intent boundary. |
| US-019 | Approval-backed reversal request API and immutable reversal source-record structures. |
| US-044 | Approval-backed financial correction request API and correction source-record structures. |
| US-045 | Immutable source-record helpers, linked reversal/correction structures, and PBT coverage for core invariants. |

## Boundary Confirmation

UOW-05 code creates payment proof records, payment source records, allocation records, credit records, receipt records, receipt snapshots, reversal records, correction records, balance-impact facts, and support intents only. It does not create invoices, invoice lines, invoice numbers, penalties, penalty waivers, delinquency classifications, statements, reports, exports, rendered documents, sent emails, stored files, import batches, concrete support jobs, or mutable account-balance source-of-truth records.

## Verification Scope

Verification is tracked in the Code Generation plan. Required checks include Prisma generation, TypeScript typecheck, targeted UOW-05 tests, PBT tests, broader workspace tests where feasible, and final boundary scans.

## Deployment Impact

UOW-05 adds Prisma schema objects and a database migration for payment proofs, posted payments, allocations, credits, credit applications, receipts, receipt snapshots, reversals, corrections, balance-impact facts, and receipt support intents. Deployment requires applying the UOW-05 migration before enabling payment posting workflows.

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
