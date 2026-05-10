# UOW-04 Code Generation Plan

## Unit

- **Unit ID**: UOW-04
- **Unit Name**: Invoice Lifecycle and Invoice Source Records
- **Stage**: Code Generation, Part 2 - Generation
- **Current Gate**: Waiting for code generation approval before next stage

## Purpose

Generate UOW-04 application code, database schema, API layer, frontend components, tests, and code summaries in the existing TypeScript modular monorepo. This plan is the single source of truth for UOW-04 Code Generation. After approval, generation must execute the steps below in order and mark each checkbox complete in the same interaction where the work is completed.

UOW-04 is the first unit that creates financial source records. Implementation must keep duplicate prevention database-backed, issued numbering unique and transactional, issued snapshots immutable, decimal calculation safe, support intents durable but side-effect-free, and invoice reads server-authorized.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/inception/application-design/unit-of-work-story-map.md` | UOW-04 story ownership: US-011, US-012, US-013, US-014. |
| `aidlc-docs/inception/application-design/unit-of-work-dependency.md` | UOW-04 depends on UOW-01, UOW-02, and UOW-03 and supplies invoice records to later units. |
| `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/functional-design/` | Business logic, rules, domain entities, and frontend component design. |
| `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/nfr-requirements/` | Performance, security, durability, observability, accessibility, and PBT requirements. |
| `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/nfr-design/` | Logical components and design patterns for implementation. |
| `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/infrastructure-design/` | PostgreSQL, migration, locking, observability, backup, and deployment constraints. |
| `aidlc-docs/construction/shared-infrastructure.md` | Shared deployment and infrastructure rules. |
| `aidlc-docs/aidlc-state.md` | Workspace root, project structure, extension configuration, and current stage. |

## Story Traceability

| Story | Title | UOW-04 Implementation Coverage |
|---|---|---|
| US-011 | Generate draft recurring invoices | Recurring batch generation, UOW-02 billable validation consumption, UOW-03 resolution consumption, duplicate prevention, billing exceptions, staff UI, tests, and PBT. |
| US-012 | Review and issue invoices | Draft review, selected issuance, revalidation, issued numbering, immutable snapshots, open-amount input facts, lifecycle history, staff UI, tests, and PBT. |
| US-013 | Create manual invoices | Manual draft invoice flow, configured charge type validation, manual tax-like eligibility, manual line amount validation, audit, staff UI, tests, and PBT. |
| US-014 | Generate and send invoice PDFs | Durable document/email support intents against issued snapshots through UOW-01 contracts; no UOW-04 PDF rendering, SMTP delivery, file storage, retry worker, or download implementation. |

## Dependencies and Boundaries

| Dependency | Use |
|---|---|
| UOW-01 authentication/session | Resolve actor context for protected APIs and frontend shell. |
| UOW-01 authorization | Enforce role and object/scope access for invoice reads/mutations. |
| UOW-01 approval workflow | Treasurer approval for issued void and reissue actions. |
| UOW-01 audit | Append audit entries for generation, exceptions, manual drafts, issuance, lifecycle actions, support intents, and denials. |
| UOW-01 support intents | Persist document/email intent requests for later UOW-08 implementation. |
| UOW-01 logging/errors/correlation | Redacted structured logs, safe errors, and correlation IDs. |
| UOW-02 billable validation | Validate properties by billing period start date for recurring generation. |
| UOW-02 read models | Use property, billing account, responsible homeowner, lot area, and ownership facts. |
| UOW-03 resolution DTOs | Use rate, rounding, charge type, due date, numbering, and template metadata. |
| Prisma/PostgreSQL | UOW-04 tables, indexes, constraints, migrations, row/advisory locking, and transaction boundaries. |

UOW-04 must not create payments, allocations, credits, receipts, penalties, penalty waivers, adjustments, statements, reports, exports, rendered documents, sent emails, stored files, import batches, concrete support jobs, or mutable account-balance source-of-truth records. UOW-04 must not directly render PDFs, send SMTP emails, store document files, post payments, apply penalties, generate reports, or bypass UOW-02/UOW-03 validation.

## Code Location

Application code must be generated in the workspace root only:

| Area | Target Paths |
|---|---|
| Shared domain/kernel code | `packages/shared/src/uow04/`, `packages/shared/src/schemas/uow04.ts`, `packages/shared/test/uow04/`, `packages/shared/test/pbt/uow04*.spec.ts` |
| Shared exports and permissions | `packages/shared/src/index.ts`, `packages/shared/src/schemas/index.ts`, `packages/shared/src/permissions/` |
| Database schema and migration | `prisma/schema.prisma`, `prisma/migrations/{timestamp}_uow04_invoice_lifecycle/` |
| API module | `apps/api/src/modules/uow04/`, `apps/api/src/persistence/repositories/uow04*.repository.ts`, `apps/api/test/uow04/`, `apps/api/test/integration/uow04*.integration.spec.ts` |
| API registration | `apps/api/src/app.module.ts` |
| Frontend components | `apps/web/src/features/uow04/`, `apps/web/src/app/uow04/`, `apps/web/src/app/portal/invoices/`, `apps/web/test/uow04/` |
| Documentation summaries | `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/code/` |

Do not create duplicate modified files. If a target file already exists, modify it in place.

## Generation Checklist

### Part 1 - Planning

- [x] Read UOW-04 Functional Design artifacts.
- [x] Read UOW-04 NFR Requirements artifacts.
- [x] Read UOW-04 NFR Design artifacts.
- [x] Read UOW-04 Infrastructure Design artifacts.
- [x] Read Code Generation rule details.
- [x] Read workspace root and project structure from `aidlc-docs/aidlc-state.md`.
- [x] Inspect existing monorepo structure and UOW-01/UOW-02/UOW-03 implementation patterns.
- [x] Identify UOW-04 stories, dependencies, interfaces, entities, service boundaries, and target paths.
- [x] Create this Code Generation plan.
- [x] Log approval prompt in `aidlc-docs/audit.md`.
- [x] Receive explicit approval for this plan.

### Part 2 - Generation

- [x] Step 1: Load this approved plan and re-check current worktree status.
- [x] Step 2: Add shared UOW-04 domain types, enums, statuses, reason codes, duplicate-key helpers, invoice lifecycle transition helpers, issued-number scope helpers, support-intent reference types, snapshot types, and safe failure codes under `packages/shared/src/uow04/`.
- [x] Step 3: Add shared UOW-04 decimal-safe invoice calculation helpers and validators for line amounts, invoice totals, manual tax-like line eligibility, recurring duplicate keys, issued snapshot immutability metadata, and void/reissue state transitions.
- [x] Step 4: Add shared UOW-04 Zod schemas under `packages/shared/src/schemas/uow04.ts` for recurring generation, draft list filters, manual invoice draft creation, issuance, cancellation, void/reissue requests, support intents, invoice reads, and safe errors.
- [x] Step 5: Update shared exports and permissions for UOW-04 invoice read/manage/issue/lifecycle/support-intent actions, preserving Board Member read-only and homeowner isolation semantics.
- [x] Step 6: Add shared UOW-04 unit tests and PBT generators for duplicate prevention, issued numbering uniqueness, invoice total equals line totals, snapshot immutability, decimal rounding stability, cancelled draft replacement, and void/reissue state transitions.
- [x] Step 7: Update `prisma/schema.prisma` with UOW-04 enums, models, relations, indexes, and constraints for invoice batches, billing exceptions, invoices, invoice lines, issued snapshots, issued line snapshots, invoice number assignments, open-amount input facts, lifecycle actions, document intents, and email intents.
- [x] Step 8: Add a UOW-04 Prisma migration under `prisma/migrations/` with duplicate-key indexes, issued-number uniqueness, lifecycle indexes, status filters, and support-intent persistence structures.
- [x] Step 9: Add API persistence repositories for UOW-04 invoice batches, billing exceptions, drafts, invoice lines, issued snapshots, number assignments, open-amount input facts, lifecycle actions, and support intents.
- [x] Step 10: Add API domain services for recurring batch generation, invoice validation gateway, duplicate guard, invoice calculation policy, manual invoice draft creation, issuance coordinator, numbering allocator, snapshot writer, lifecycle action service, balance input publisher, support intent adapter, authorization policy, audit adapter, observability adapter, and safe error mapping.
- [x] Step 11: Add API controllers and DTO validation for recurring batch generation, billing exception review, draft review/list/detail, manual invoice creation, selected issuance, invoice detail/history, draft cancellation, issued void/reissue request/status, and document/email support intents.
- [x] Step 12: Register the UOW-04 API module in `apps/api/src/app.module.ts`.
- [x] Step 13: Add API unit tests for validation gateway, duplicate guard, calculation policy, manual tax-like validation, issuance revalidation, numbering conflict handling, snapshot immutability, lifecycle transitions, support intent boundaries, authorization policies, audit adapter, observability adapter, and safe errors.
- [x] Step 14: Add API integration tests for recurring generation success, billing exception persistence, duplicate generation block, cancelled draft explicit replacement, manual invoice draft creation, manual tax-like eligibility rejection, selected issuance success/failure results, issued number non-reuse, void/reissue approval flow, support intent persistence, and route authorization.
- [x] Step 15: Add API PBT tests using `fast-check` for recurring duplicate keys, issued numbering scopes, invoice line totals, snapshot immutability, decimal edge cases, and void/reissue state models.
- [x] Step 16: Add frontend API client methods and typed view models for UOW-04 invoice batches, exceptions, drafts, manual invoice form, issuance results, invoice detail/history, lifecycle requests, and support intents.
- [x] Step 17: Add frontend UOW-04 components for invoice workspace, recurring batch page, billing exception review panel, draft invoice review table, issue action panel, manual invoice form, invoice detail page, lifecycle history panel, void/reissue request panel, document/email intent panel, and homeowner invoice detail.
- [x] Step 18: Add Next.js route entries for UOW-04 staff invoice views and homeowner-safe invoice detail views using existing protected shell conventions.
- [x] Step 19: Add frontend tests for accessible forms/tables, stable `data-testid` values, safe validation summaries, selected issuance results, manual tax-like indicators, lifecycle status versus payment-derived status separation, support intent status, and no JSON-only normal staff workflow.
- [x] Step 20: Add code summary markdown under `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/code/` covering business logic, API layer, repository layer, frontend layer, database migration, tests, deployment impact, and boundary confirmation.
- [x] Step 21: Run generation verification commands: `npm run prisma:generate`, `npm run typecheck`, targeted tests for shared/API/web UOW-04 areas, targeted PBT tests, and broader workspace tests where feasible.
- [x] Step 22: Fix defects found by generation verification without widening scope.
- [x] Step 23: Verify no UOW-04 code creates payments, allocations, credits, receipts, penalties, penalty waivers, adjustments, statements, reports, exports, rendered documents, sent emails, stored files, import batches, concrete support jobs, or mutable account-balance source-of-truth records.
- [x] Step 24: Verify UOW-04 code uses UOW-02 validation date semantics, UOW-03 resolution DTOs, decimal-safe calculation, database-backed duplicate/numbering controls, immutable issued snapshots, support-intent boundaries, server authorization, safe logs, and stable frontend test IDs.
- [x] Step 25: Verify Security Baseline compliance, PBT compliance, content validation, and no duplicate generated files.
- [x] Step 26: Mark all completed plan steps and story coverage checkboxes.
- [x] Step 27: Present the standardized Code Generation completion message.

## Implementation Notes

### Domain and Schema Rules

- UOW-04 uses billing period start date as the recurring generation `validationDate`.
- UOW-04 resolves UOW-03 rate, rounding, and charge rules by billing period start date.
- UOW-04 resolves UOW-03 numbering metadata only during issuance.
- Draft invoices use internal IDs and never consume issued invoice numbers.
- Issued invoice numbers are immutable and never reused.
- Recurring duplicate prevention key is property, responsible billing account, charge type, and billing period.
- Cancelled recurring draft replacement requires explicit linked replacement action with reason, actor, and audit.
- Issued snapshots persist enough source facts to reproduce invoices after UOW-02 or UOW-03 changes.
- Invoice totals must equal line totals after configured rounding behavior.
- JavaScript floating-point arithmetic must not be used for invoice amount calculation.

### API Boundaries

- Backend authorization is authoritative; frontend controls are usability only.
- Homeowners can read only invoices tied to their authorized billing accounts, properties, or homeowner profile.
- Board Member access is read-only and PII-minimized.
- Issued void/reissue actions require Treasurer approval through UOW-01.
- Support intents are persisted for later UOW-08 processing; UOW-04 does not render PDFs, send SMTP emails, store files, or run retry jobs.
- UOW-04 creates invoice open-amount input facts only; later units derive payment, credit, penalty, adjustment, and account-balance effects.

### Frontend Boundaries

- UOW-04 screens must rely on server-authorized data.
- UOW-04 components must use stable `data-testid` values from Functional Design.
- Normal staff workflows must use structured forms/tables, not JSON-only editing.
- UI must clearly separate UOW-04 lifecycle status from payment-derived status.
- UI must not imply payment posting, receipt generation, penalty application, report/export generation, PDF rendering, SMTP delivery, file storage, import execution, or mutable balance editing.

## Story Completion Checklist

- [x] US-011 implemented: recurring draft generation, UOW-02/UOW-03 validation/resolution, duplicate prevention, billing exceptions, staff UI, tests, and PBT.
- [x] US-012 implemented: draft review, selected issuance, transactional numbering, immutable snapshots, open-amount input facts, lifecycle history, staff UI, tests, and PBT.
- [x] US-013 implemented: manual invoice drafts, configured charge type validation, manual tax-like eligibility, amount validation, audit, staff UI, tests, and PBT.
- [x] US-014 implemented: issued invoice snapshot support for document/email intents, durable support-intent records, staff/homeowner-safe UI status, and explicit UOW-08 boundary tests.

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant for generation | Generated code includes backend authorization checks, role permissions, audit adapter usage, support-intent boundaries, homeowner-safe view surfaces, and no client-only security reliance for UOW-04 API routes. |
| Property-Based Testing | Compliant for generation | Generated and executed `fast-check` PBT coverage for UOW-04 duplicate-key, decimal-total, and lifecycle invariants in shared/API test suites. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
