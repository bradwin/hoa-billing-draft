# UOW-02 Code Generation Plan

## Unit

- **Unit ID**: UOW-02
- **Unit Name**: Homeowner, Property, Ownership, and Contact Requests
- **Stage**: Code Generation, Part 1 - Planning
- **Current Gate**: Approved for application code generation

## Purpose

Generate UOW-02 application code, database schema, API layer, frontend components, tests, and code summaries in the existing TypeScript modular monorepo. This plan is the single source of truth for UOW-02 Code Generation. After approval, generation must execute the steps below in order and mark each checkbox complete in the same interaction where the work is completed.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/inception/application-design/unit-of-work-story-map.md` | UOW-02 story ownership: US-004, US-005, US-006, US-007. |
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/functional-design/` | Business logic, rules, domain entities, and frontend component design. |
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/nfr-requirements/` | Performance, privacy, accessibility, audit, security, and PBT requirements. |
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/nfr-design/` | Logical components and design patterns for implementation. |
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/infrastructure-design/` | PostgreSQL, migration, observability, backup, and deployment constraints. |
| `aidlc-docs/construction/shared-infrastructure.md` | Shared deployment and infrastructure rules. |
| `aidlc-docs/aidlc-state.md` | Workspace root, project structure, extension configuration, and current stage. |

## Story Traceability

| Story | Title | UOW-02 Implementation Coverage |
|---|---|---|
| US-004 | Manage homeowner records | Homeowner schema, duplicate candidate checks, staff CRUD APIs, staff UI, audit, PII-filtered read models, tests. |
| US-005 | Manage property records and uniqueness | Property schema, aliases, canonical uniqueness, billable property validation, property APIs/UI, audit, tests. |
| US-006 | Preserve ownership history | Ownership periods, half-open interval rules, billing-account periods, transfer API/UI, conflict handling, tests. |
| US-007 | Approve homeowner contact change requests | Contact request schema, homeowner submission, staff decision APIs/UI, terminal states, UOW-02 contact email only, tests. |

## Dependencies and Boundaries

| Dependency | Use |
|---|---|
| UOW-01 authentication/session | Resolve actor context for protected APIs and frontend shell. |
| UOW-01 authorization | Enforce role, object, and own-resource access. |
| UOW-01 audit | Append audit entries for UOW-02 mutations, denials, duplicate overrides, alias changes, ownership changes, billing-account period changes, and contact decisions. |
| UOW-01 logging/errors/correlation | Redacted structured logs, safe errors, and correlation IDs. |
| Shared kernel | Pagination, date range, correlation, domain errors, transaction helpers, and value object patterns. |
| Prisma/PostgreSQL | UOW-02 tables, indexes, constraints, and migration. |

UOW-02 must not create invoices, balances, payments, penalties, credits, adjustments, statements, reports, documents, emails, or import batches. UOW-02 must not calculate dues, decide proration, or mutate UOW-01 login email during UOW-02 contact email approval.

## Code Location

Application code must be generated in the workspace root only:

| Area | Target Paths |
|---|---|
| Shared domain/kernel code | `packages/shared/src/uow02/`, `packages/shared/src/schemas/uow02.ts`, `packages/shared/test/uow02/`, `packages/shared/test/pbt/uow02*.spec.ts` |
| Database schema and migration | `prisma/schema.prisma`, `prisma/migrations/{timestamp}_uow02_homeowner_property_ownership/` |
| API module | `apps/api/src/modules/uow02/`, `apps/api/src/persistence/repositories/uow02*.repository.ts`, `apps/api/test/uow02/`, `apps/api/test/integration/uow02*.integration.spec.ts` |
| API registration | `apps/api/src/app.module.ts` |
| Frontend components | `apps/web/src/features/uow02/`, `apps/web/src/app/` route files where consistent with the existing Next.js structure, `apps/web/test/uow02/` |
| Documentation summaries | `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/code/` |

Do not create duplicate modified files. If a target file already exists, modify it in place.

## Generation Checklist

### Part 1 - Planning

- [x] Read UOW-02 Functional Design artifacts.
- [x] Read UOW-02 NFR Requirements artifacts.
- [x] Read UOW-02 NFR Design artifacts.
- [x] Read UOW-02 Infrastructure Design artifacts.
- [x] Read Code Generation rule details.
- [x] Read workspace root and project structure from `aidlc-docs/aidlc-state.md`.
- [x] Inspect existing monorepo structure and UOW-01 implementation patterns.
- [x] Identify UOW-02 stories, dependencies, interfaces, entities, service boundaries, and target paths.
- [x] Create this Code Generation plan.
- [x] Log approval prompt in `aidlc-docs/audit.md`.
- [x] Receive explicit approval for this plan.

### Part 2 - Generation

- [x] Step 1: Load this approved plan and re-check current worktree status.
- [x] Step 2: Add shared UOW-02 domain types, enums, reason codes, normalization helpers, date-interval validators, and Zod schemas under `packages/shared`.
- [x] Step 3: Add shared UOW-02 unit tests and PBT generators for normalization, half-open intervals, billable validation facts, duplicate candidate keys, and contact request state transitions.
- [x] Step 4: Update `prisma/schema.prisma` with UOW-02 enums, models, relations, indexes, and constraints for homeowners, contacts, duplicate reviews, properties, aliases, ownership periods, billing-account periods, contact change requests, and read-model support.
- [x] Step 5: Add a UOW-02 Prisma migration under `prisma/migrations/`.
- [x] Step 6: Add API persistence repositories for UOW-02 homeowner, property, ownership, billing-account period, contact request, and read-model queries.
- [x] Step 7: Add API domain services for homeowner profile, property registry, ownership timeline, billing-account period, billable validation, contact change, duplicate review, authorization policy, audit adapter, abuse signals, and safe error mapping.
- [x] Step 8: Add API controllers and DTO validation for homeowner search/detail/create/update/duplicate-check, property search/detail/create/update/alias, ownership transfer, billing-account period reads, billable validation by `validationDate`, contact request submit/list/approve/reject, and owner visibility.
- [x] Step 9: Register the UOW-02 API module in `apps/api/src/app.module.ts`.
- [x] Step 10: Add API unit tests for domain services, repositories where mockable, authorization policies, safe errors, duplicate override audit, property alias audit, contact request terminal states, and contact email versus login email separation.
- [x] Step 11: Add API integration tests for core workflows: homeowner creation with duplicate review, property creation with alias search, ownership transfer with half-open periods, billable validation with effective ownership/account period and active homeowner eligibility, contact approval/rejection, and role/PII restrictions.
- [x] Step 12: Add API PBT tests using `fast-check` for property normalization uniqueness, half-open interval non-overlap, billing-account period coverage, billable validation reason codes, and contact request state transitions.
- [x] Step 13: Add frontend API client methods and typed view models for UOW-02.
- [x] Step 14: Add frontend UOW-02 components for homeowner search/detail/form/duplicate review, property search/detail/form/alias editor, ownership timeline/transfer, billing-account period panel, billable validation panel, contact request form/queue/decision, owner visibility, and safe validation summaries.
- [x] Step 15: Add Next.js route entries for UOW-02 staff and homeowner views using the existing protected shell conventions.
- [x] Step 16: Add frontend tests for search/filter serialization, stable `data-testid` values, safe error rendering, PII-minimized rendering, contact payload restrictions, and terminal-state decision controls.
- [x] Step 17: Add code summary markdown under `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/code/` covering business logic, API layer, repository layer, frontend layer, database migration, and tests.
- [x] Step 18: Run generation verification commands: `npm run prisma:generate`, `npm run typecheck`, targeted tests for shared/API/web UOW-02 areas, and broader workspace tests where feasible.
- [x] Step 19: Fix defects found by generation verification without widening scope.
- [x] Step 20: Verify no UOW-02 code creates invoices, balances, payments, penalties, credits, adjustments, statements, reports, documents, emails, import batches, dues calculation, or automatic UOW-01 login email mutation.
- [x] Step 21: Verify Security Baseline compliance, PBT compliance, content validation, and no duplicate generated files.
- [x] Step 22: Mark all completed plan steps and story coverage checkboxes.
- [x] Step 23: Present the standardized Code Generation completion message.

## Implementation Notes

### Domain and Schema Rules

- Homeowner statuses are `Active`, `Inactive`, `Deceased`, and `Archived`.
- Property billing statuses are `Billable`, `NonBillable`, `Exempt`, and `CommonArea`.
- Contact request statuses are `Pending`, `Approved`, and `Rejected`.
- Ownership and billing-account periods use half-open intervals: `effectiveFrom` inclusive, `effectiveTo` exclusive, `null` open-ended.
- Billable validation accepts property ID and `validationDate` and checks effective ownership period, effective billing-account period, property status/lot area, and responsible homeowner eligibility.
- Responsible primary homeowner eligibility means `HomeownerStatus = Active` unless a later approved exception workflow exists. Do not implement the exception workflow in UOW-02.
- Billing-account periods are created only for the billing-responsible homeowner.
- Board Member access is read-only and PII-minimized.

### API Boundaries

- Backend authorization is authoritative; frontend controls are usability only.
- API errors must use stable safe codes, safe messages, and correlation IDs.
- Search endpoints must use bounded pagination and must not expose unrestricted PII.
- Contact email approval updates only UOW-02 approved contact email unless a separate UOW-01 account-email-change process is invoked and completed. Do not implement that separate process here.

### Frontend Boundaries

- Protected UOW-02 screens must rely on server-authorized data.
- UOW-02 components must use stable `data-testid` values from Functional Design.
- UI must not imply invoice generation, balance changes, payment posting, reporting, document creation, email dispatch, or import execution.

## Story Completion Checklist

- [x] US-004 implemented: homeowner master records, duplicate review, PII-filtered reads, audit, staff UI, and tests.
- [x] US-005 implemented: property records, canonical uniqueness, aliases, billable validation facts, staff UI, and tests.
- [x] US-006 implemented: ownership history, half-open transfers, billing-account periods, audit, UI, and tests.
- [x] US-007 implemented: homeowner contact change submission, staff approval/rejection, terminal states, UOW-02 contact-only mutation, UI, and tests.

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant for planning | Plan includes backend authorization, PII minimization, safe errors, audit, least-privilege persistence assumptions, redacted logs, abuse signals, and no new exposed infrastructure. |
| Property-Based Testing | Compliant for planning | Plan includes `fast-check` PBT generation for UOW-02 invariants and state models required by Functional Design and NFR Design. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
