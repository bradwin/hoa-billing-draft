# UOW-03 Code Generation Plan

## Unit

- **Unit ID**: UOW-03
- **Unit Name**: Billing Configuration and Charge Rules
- **Stage**: Code Generation, Part 1 - Planning
- **Current Gate**: Waiting for approval before application code generation

## Purpose

Generate UOW-03 application code, database schema, API layer, frontend components, tests, and code summaries in the existing TypeScript modular monorepo. This plan is the single source of truth for UOW-03 Code Generation. After approval, generation must execute the steps below in order and mark each checkbox complete in the same interaction where the work is completed.

UOW-03 is financially sensitive configuration infrastructure. Implementation must keep configuration resolution fail-closed, activation approval/audit controlled, effective-dated versions immutable, decimal behavior safe, and downstream contracts typed. It must not create downstream financial source records.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/inception/application-design/unit-of-work-story-map.md` | UOW-03 story ownership: US-008, US-009, US-010. |
| `aidlc-docs/inception/application-design/unit-of-work-dependency.md` | UOW-03 depends on UOW-01 and supplies contracts to later units. |
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/functional-design/` | Business logic, rules, domain entities, and frontend component design. |
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/nfr-requirements/` | Performance, security, durability, observability, accessibility, and PBT requirements. |
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/nfr-design/` | Logical components and design patterns for implementation. |
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/infrastructure-design/` | PostgreSQL, migration, observability, backup, and deployment constraints. |
| `aidlc-docs/construction/shared-infrastructure.md` | Shared deployment and infrastructure rules. |
| `aidlc-docs/aidlc-state.md` | Workspace root, project structure, extension configuration, and current stage. |

## Story Traceability

| Story | Title | UOW-03 Implementation Coverage |
|---|---|---|
| US-008 | Configure dues rate and billing cycles | Rate rule schema/services, billing cycle schema/services, effective-dated activation, resolution APIs, staff UI, tests, and PBT. |
| US-009 | Configure due dates and grace periods | Due date and grace-period rule schema/services, activation, resolution APIs, staff UI, tests, and UOW-06-ready metadata contracts. |
| US-010 | Configure charge types and manual tax-like charges | Charge type catalog schema/services, manual-entry and automatic-generation eligibility rules, manual tax-like validation, staff UI, tests, and downstream typed contracts. |

## Dependencies and Boundaries

| Dependency | Use |
|---|---|
| UOW-01 authentication/session | Resolve actor context for protected APIs and frontend shell. |
| UOW-01 authorization | Enforce role, object/scope, preview, and activation access. |
| UOW-01 approval workflow | Treasurer approval for financial-impacting configuration activation. |
| UOW-01 audit | Append audit entries for activation, risky changes, denials, and immutable violation attempts. |
| UOW-01 logging/errors/correlation | Redacted structured logs, safe errors, and correlation IDs. |
| Shared kernel | Pagination, date range, correlation, domain errors, transaction helpers, and decimal-safe value patterns. |
| Prisma/PostgreSQL | UOW-03 tables, indexes, constraints, migrations, and fail-closed lookup paths. |

UOW-03 must not create invoices, invoice lines, balances, payments, penalties, credits, adjustments, statements, reports, documents, emails, support jobs, or import batches. UOW-03 must not calculate actual invoice amounts for a property, automatically calculate tax-like charges, apply penalties, create penalty records, waive penalties, classify delinquency, allocate document numbers, render templates, post payments, or mutate downstream source records.

## Code Location

Application code must be generated in the workspace root only:

| Area | Target Paths |
|---|---|
| Shared domain/kernel code | `packages/shared/src/uow03/`, `packages/shared/src/schemas/uow03.ts`, `packages/shared/test/uow03/`, `packages/shared/test/pbt/uow03*.spec.ts` |
| Database schema and migration | `prisma/schema.prisma`, `prisma/migrations/{timestamp}_uow03_billing_configuration/` |
| API module | `apps/api/src/modules/uow03/`, `apps/api/src/persistence/repositories/uow03*.repository.ts`, `apps/api/test/uow03/`, `apps/api/test/integration/uow03*.integration.spec.ts` |
| API registration | `apps/api/src/app.module.ts` |
| Frontend components | `apps/web/src/features/uow03/`, `apps/web/src/app/uow03/`, `apps/web/test/uow03/` |
| Documentation summaries | `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/code/` |

Do not create duplicate modified files. If a target file already exists, modify it in place.

## Generation Checklist

### Part 1 - Planning

- [x] Read UOW-03 Functional Design artifacts.
- [x] Read UOW-03 NFR Requirements artifacts.
- [x] Read UOW-03 NFR Design artifacts.
- [x] Read UOW-03 Infrastructure Design artifacts.
- [x] Read Code Generation rule details.
- [x] Read workspace root and project structure from `aidlc-docs/aidlc-state.md`.
- [x] Inspect existing monorepo structure and UOW-01/UOW-02 implementation patterns.
- [x] Identify UOW-03 stories, dependencies, interfaces, entities, service boundaries, and target paths.
- [x] Create this Code Generation plan.
- [x] Log approval prompt in `aidlc-docs/audit.md`.
- [x] Receive explicit approval for this plan.

### Part 2 - Generation

- [x] Step 1: Load this approved plan and re-check current worktree status.
- [x] Step 2: Add shared UOW-03 domain types, enums, reason codes, configuration identity helpers, half-open interval validators, decimal-safe metadata helpers, and Zod schemas under `packages/shared`.
- [x] Step 3: Add shared UOW-03 unit tests and PBT generators for effective-date non-overlap, resolution determinism, due/grace calculation, decimal precision, manual tax-like charge eligibility, numbering resolution, and immutable state transitions.
- [x] Step 4: Update `prisma/schema.prisma` with UOW-03 enums, models, relations, indexes, and constraints for configuration drafts, configuration versions, rate rules, billing cycle rules, due date rules, grace period rules, rounding rules, charge types, numbering formats, template references, payment methods, and resolution metadata support.
- [x] Step 5: Add a UOW-03 Prisma migration under `prisma/migrations/`.
- [x] Step 6: Add API persistence repositories for UOW-03 drafts, versions, rate rules, billing cycles, due/grace rules, rounding rules, charge types, numbering formats, template references, payment methods, and resolution lookups.
- [x] Step 7: Add API domain services for configuration drafts, approval activation, version timeline validation, resolution services, decimal policy, rate rules, billing cycles, due/grace rules, charge type catalog, numbering/template/payment catalog, authorization policy, audit adapter, observability adapter, and safe error mapping.
- [x] Step 8: Add API controllers and DTO validation for configuration dashboard, draft create/update/submit, activation, version history, rate rule management, billing cycle management, due/grace rule management, rounding rule management, charge type catalog, numbering format management, template reference metadata, payment method metadata, and resolution preview.
- [x] Step 9: Register the UOW-03 API module in `apps/api/src/app.module.ts`.
- [x] Step 10: Add API unit tests for version timeline validation, fail-closed resolution, activation approval checks, authorization policies, audit adapter, safe errors, decimal policy, charge type eligibility, manual tax-like restrictions, numbering/template/payment metadata, and no-downstream-side-effect boundaries.
- [x] Step 11: Add API integration tests for core workflows: draft creation, Treasurer-approved activation, rejected/missing approval activation failure, overlapping effective-date rejection, resolution success, missing/ambiguous resolution failure, manual tax-like charge configuration, and route authorization.
- [x] Step 12: Add API PBT tests using `fast-check` for effective-date non-overlap, rate resolution determinism, due/grace date calculation, half-up rounding metadata, manual tax-like charge eligibility, numbering resolution, and immutable version state transitions.
- [x] Step 13: Add frontend API client methods and typed view models for UOW-03.
- [x] Step 14: Add frontend UOW-03 components for billing configuration dashboard, rate rule page/form, billing cycle page/form, due/grace rule page/form, rounding rule page/form, charge type catalog/form, numbering format page, template reference page, payment method page, version history, approval panel, resolution preview, and safe configuration errors.
- [x] Step 15: Add Next.js route entries for UOW-03 staff configuration views using the existing protected shell conventions.
- [x] Step 16: Add frontend tests for accessible forms/tables, stable `data-testid` values, safe error rendering, approval status controls, version history, resolution preview, manual tax-like indicators, and no JSON-only normal staff workflow.
- [x] Step 17: Add code summary markdown under `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/code/` covering business logic, API layer, repository layer, frontend layer, database migration, tests, and deployment impact.
- [x] Step 18: Run generation verification commands: `npm run prisma:generate`, `npm run typecheck`, targeted tests for shared/API/web UOW-03 areas, and broader workspace tests where feasible.
- [x] Step 19: Fix defects found by generation verification without widening scope.
- [x] Step 20: Verify no UOW-03 code creates invoices, invoice lines, balances, payments, penalties, credits, adjustments, statements, reports, documents, emails, support jobs, import batches, invoice amount calculation, automatic tax-like charge calculation, penalty application, document number allocation, template rendering, or payment posting.
- [x] Step 21: Verify Security Baseline compliance, PBT compliance, content validation, and no duplicate generated files.
- [x] Step 22: Mark all completed plan steps and story coverage checkboxes.
- [x] Step 23: Present the standardized Code Generation completion message.

## Implementation Notes

### Domain and Schema Rules

- Effective-dated configuration versions use half-open intervals: `effectiveFrom` inclusive, `effectiveTo` exclusive, `null` open-ended.
- Active versions must not overlap for the same configuration identity, scope, and rule type.
- Distinct charge types, payment methods, and template references may be active during the same date range when identities differ.
- Resolution returns active approved versions only for downstream consumers.
- Missing or ambiguous required configuration fails closed with safe reason codes.
- Financial-impacting activation requires Treasurer approval.
- Activated versions are immutable; corrections require new versions.
- Resolution outputs include version ID, effective interval, approval reference where applicable, and enough metadata for downstream snapshotting.
- JavaScript floating-point arithmetic must not be used for financial decimal behavior.
- Lot area and rate metadata support up to 4 decimal places; money metadata uses 2 decimal places; rounding metadata is half-up.

### API Boundaries

- Backend authorization is authoritative; frontend controls are usability only.
- API errors must use stable safe codes, safe messages, and correlation IDs.
- Staff preview may resolve draft context only through explicitly authorized preview endpoints.
- Downstream units consume typed resolution DTOs, not raw UOW-03 tables.
- UOW-03 does not allocate invoice, receipt, statement, report, or document numbers; later owning units allocate numbers atomically.
- UOW-03 stores template metadata only; UOW-08 owns rendering/storage.
- UOW-03 stores payment method definitions only; UOW-05 owns payment records.
- UOW-03 stores grace-period metadata only; UOW-06 owns penalty eligibility/application.

### Frontend Boundaries

- Protected UOW-03 screens must rely on server-authorized data.
- UOW-03 components must use stable `data-testid` values from Functional Design.
- Normal staff workflows must use structured forms/tables, not JSON-only editing.
- UI must not imply invoice generation, balance changes, payment posting, penalty application, report generation, document rendering, email dispatch, support job execution, or import execution.

## Story Completion Checklist

- [x] US-008 implemented: dues rate and billing cycle configuration, effective-dated activation, resolution services, staff UI, tests, and PBT.
- [x] US-009 implemented: due date and grace-period configuration, resolution metadata for UOW-04/UOW-06, staff UI, tests, and PBT.
- [x] US-010 implemented: charge type catalog and manual tax-like configuration rules, staff UI, tests, and downstream typed contracts.

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Generated UOW-03 code includes backend authorization, Treasurer approval checks, audit events, safe errors, least-privilege route permissions, and no client-side security reliance. |
| Property-Based Testing | Compliant | Generated `fast-check` PBT coverage verifies UOW-03 interval, resolution, decimal, eligibility, numbering, and immutable-state invariants. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
