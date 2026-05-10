# UOW-04 Code Summary

## Unit

- **Unit ID**: UOW-04
- **Unit Name**: Invoice Lifecycle and Invoice Source Records
- **Stage**: Code Generation

## Application Code Generated

| Area | Paths |
|---|---|
| Shared contracts | `packages/shared/src/uow04/`, `packages/shared/src/schemas/uow04.ts`, `packages/shared/src/permissions/` |
| Shared tests | `packages/shared/test/uow04/`, `packages/shared/test/pbt/uow04.pbt.spec.ts` |
| Database | `prisma/schema.prisma`, `prisma/migrations/202605100002_uow04_invoice_lifecycle/migration.sql` |
| API repository | `apps/api/src/persistence/repositories/uow04.repository.ts` |
| API module | `apps/api/src/modules/uow04/`, `apps/api/src/app.module.ts` |
| API tests | `apps/api/test/uow04/` |
| Frontend | `apps/web/src/features/uow04/`, `apps/web/src/app/uow04/`, `apps/web/src/app/portal/invoices/` |
| Frontend tests | `apps/web/test/uow04/uow04-components.spec.tsx` |

## Implemented Story Coverage

| Story | Coverage |
|---|---|
| US-011 | Recurring batch command surface, validation/duplicate helper contracts, billing exception persistence structures, staff UI, and tests. |
| US-012 | Draft review, selected issuance service, issued number assignment structures, snapshot/open-amount input persistence structures, lifecycle history UI, and tests. |
| US-013 | Manual draft invoice service, configured charge type fields, manual tax-like validation schema, amount validation, staff UI, and tests. |
| US-014 | Durable document/email support intent API and UI status surfaces against issued snapshots, with UOW-08 PDF/SMTP/storage boundary preserved. |

## Boundary Confirmation

UOW-04 code creates invoice source records, invoice lines, issued snapshots, issued invoice numbers, billing exceptions, lifecycle actions, open-amount input facts, and support intents only. It does not create payments, allocations, credits, receipts, penalties, penalty waivers, adjustments, statements, reports, exports, rendered documents, sent emails, stored files, import batches, concrete support jobs, or mutable account-balance source-of-truth records.

## Verification Scope

Verification is tracked in the Code Generation plan. Required checks include Prisma generation, TypeScript typecheck, targeted UOW-04 tests, PBT tests, broader workspace tests where feasible, and final boundary scans.

## Deployment Impact

UOW-04 adds Prisma schema objects and a database migration for invoice batches, invoice source records, line records, issued snapshots, issued number assignments, open-amount input facts, lifecycle actions, billing exceptions, and support intents. Deployment requires applying the UOW-04 migration before enabling invoice generation and issuance workflows.

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
