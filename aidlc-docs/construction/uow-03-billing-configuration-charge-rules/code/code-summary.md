# UOW-03 Code Summary

## Unit

- **Unit ID**: UOW-03
- **Unit Name**: Billing Configuration and Charge Rules
- **Stage**: Code Generation

## Application Code Generated

| Area | Paths |
|---|---|
| Shared contracts | `packages/shared/src/uow03/`, `packages/shared/src/schemas/uow03.ts`, `packages/shared/src/permissions/` |
| Shared tests | `packages/shared/test/uow03/`, `packages/shared/test/pbt/uow03.pbt.spec.ts` |
| Database | `prisma/schema.prisma`, `prisma/migrations/202605100001_uow03_billing_configuration/migration.sql` |
| API repository | `apps/api/src/persistence/repositories/uow03.repository.ts` |
| API module | `apps/api/src/modules/uow03/`, `apps/api/src/app.module.ts` |
| API tests | `apps/api/test/uow03/` |
| Frontend | `apps/web/src/features/uow03/`, `apps/web/src/app/uow03/billing-configuration/page.tsx` |
| Frontend tests | `apps/web/test/uow03/uow03-components.spec.tsx` |

## Implemented Story Coverage

| Story | Coverage |
|---|---|
| US-008 | Dues rate, billing cycle, rounding, effective-dated activation, resolution services, staff UI, unit tests, and PBT coverage. |
| US-009 | Due date and grace-period metadata, downstream resolution output for UOW-04 and UOW-06 consumers, staff UI, unit tests, and PBT coverage. |
| US-010 | Charge type catalog, manual tax-like configuration eligibility, numbering/template/payment metadata, staff UI, typed contracts, and tests. |

## Boundary Confirmation

UOW-03 code creates immutable, effective-dated billing configuration versions and pure resolution results only. It does not create invoices, invoice lines, balances, payments, penalties, credits, adjustments, statements, reports, documents, emails, support jobs, or import batches. It does not calculate actual invoice amounts for a property, automatically calculate tax-like charges, apply penalties, create penalty records, waive penalties, classify delinquency, allocate document numbers, render templates, or post payments.

## Verification Scope

Verification completed for Prisma client generation, TypeScript typecheck, targeted shared UOW-03 tests, targeted API UOW-03 tests, API PBT, targeted frontend UOW-03 tests, full workspace `npm run test`, and boundary keyword scans. The API targeted test run required `--no-cache` after an initial stale transform-cache failure against old shared exports.

## Deployment Impact

UOW-03 adds Prisma schema objects and a database migration for billing configuration drafts, immutable configuration versions, and related rule records. Deployment requires applying the UOW-03 migration before enabling the registered API module and frontend route.

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
