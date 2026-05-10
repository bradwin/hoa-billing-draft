# UOW-02 Code Summary

## Unit

- **Unit ID**: UOW-02
- **Unit Name**: Homeowner, Property, Ownership, and Contact Requests
- **Stage**: Code Generation

## Application Code Generated

| Area | Paths |
|---|---|
| Shared contracts | `packages/shared/src/uow02/`, `packages/shared/src/schemas/uow02.ts` |
| Shared tests | `packages/shared/test/uow02/`, `packages/shared/test/pbt/uow02.pbt.spec.ts` |
| Database | `prisma/schema.prisma`, `prisma/migrations/202605090002_uow02_homeowner_property_ownership/migration.sql` |
| API repository | `apps/api/src/persistence/repositories/uow02.repository.ts` |
| API module | `apps/api/src/modules/uow02/`, `apps/api/src/app.module.ts` |
| API tests | `apps/api/test/uow02/`, `apps/api/test/integration/uow02-workflows.integration.spec.ts` |
| Frontend | `apps/web/src/features/uow02/`, `apps/web/src/app/uow02/`, `apps/web/src/app/styles.css` |
| Frontend tests | `apps/web/test/uow02/uow02-components.spec.tsx` |

## Implemented Story Coverage

| Story | Coverage |
|---|---|
| US-004 | Homeowner master schema, duplicate review, staff APIs, PII-shaped reads, UI components, and tests. |
| US-005 | Property schema, canonical identity, aliases, billable validation, staff APIs, UI components, and tests. |
| US-006 | Ownership period model, half-open transfer behavior, billing-account period creation for billing-responsible homeowner, APIs, UI components, and tests. |
| US-007 | Contact change submission, approval, rejection, terminal state behavior, contact-only payload validation, UI components, and tests. |

## Boundary Confirmation

UOW-02 code supplies master data and effective-dated responsibility facts only. It does not create invoices, balances, payments, penalties, credits, adjustments, statements, reports, documents, emails, or import batches. It does not calculate dues, decide proration, or automatically mutate UOW-01 login email when UOW-02 contact email changes are approved.

## Verification Scope

Verification is tracked in the Code Generation plan. Required checks include Prisma generation, TypeScript typecheck, targeted UOW-02 tests, PBT tests, and final boundary scans.

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
