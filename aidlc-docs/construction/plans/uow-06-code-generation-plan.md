# UOW-06 Code Generation Plan

## Unit

- **Unit ID**: UOW-06
- **Unit Name**: Penalties, Delinquency, Waivers, and Reminders
- **Stage**: Code Generation, Part 2 - Generation
- **Current Gate**: Waiting for approval before continuing to the next stage

## Purpose

Generate UOW-06 application code, database schema, API layer, frontend components, tests, and code summaries in the existing TypeScript modular monorepo. This plan is the single source of truth for UOW-06 Code Generation. After approval, generation must execute the steps below in order and mark each checkbox complete in the same interaction where the work is completed.

UOW-06 is financially sensitive. Implementation must keep overdue evaluation date-driven, aging deterministic, penalty calculation non-compounding, duplicate penalty prevention database-backed, waiver approval idempotent, reminder intents side-effect-free, balance-impact facts immutable, and every read or mutation server-authorized.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/inception/application-design/unit-of-work-story-map.md` | UOW-06 story ownership: US-020, US-021, US-022, and US-023. |
| `aidlc-docs/inception/application-design/unit-of-work-dependency.md` | UOW-06 depends on UOW-01, UOW-03, UOW-04, and UOW-05 and supplies delinquency, penalty, waiver, and reminder facts to later units. |
| `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/functional-design/` | Business logic, rules, domain entities, and frontend component design. |
| `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/nfr-requirements/` | Performance, security, durability, observability, accessibility, and PBT requirements. |
| `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/nfr-design/` | Logical components and design patterns for implementation. |
| `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/infrastructure-design/` | PostgreSQL, migration, locking, observability, backup, and deployment constraints. |
| `aidlc-docs/construction/shared-infrastructure.md` | Shared deployment and infrastructure rules. |
| `aidlc-docs/aidlc-state.md` | Workspace root, project structure, extension configuration, and current stage. |

## Story Traceability

| Story | Title | UOW-06 Implementation Coverage |
|---|---|---|
| US-020 | Detect overdue invoices and aging buckets | Explicit `evaluationDate`, grace-period boundary evaluation, first overdue date, aging day count, aging bucket classification, delinquency read models, staff/homeowner-safe UI, tests, and PBT. |
| US-021 | Apply recurring monthly penalties | Penalty candidate generation, UOW-03 configuration primitive resolution, non-compounding basis calculation, duplicate prevention, transactional penalty source records, balance-impact facts, audit, staff UI, tests, and PBT. |
| US-022 | Waive penalties with Treasurer approval | Approval-backed waiver request/application, idempotent waiver source records, waiver amount limit, waiver balance-impact facts, audit, staff UI, tests, and PBT. |
| US-023 | Send overdue reminders | Reminder eligibility evaluation, suppression, authorized contact path checks, duplicate reminder intent prevention, UOW-01 support intent persistence, status UI, tests, and PBT. |

## Dependencies and Boundaries

| Dependency | Use |
|---|---|
| UOW-01 authentication/session | Resolve actor context for protected APIs and frontend shell. |
| UOW-01 authorization | Enforce role, object/scope access, homeowner isolation, Board Member read-only access, and PII minimization. |
| UOW-01 approval workflow | Treasurer approval for penalty waivers and approval-sensitive corrective actions. |
| UOW-01 audit | Append audit entries for overdue runs, aging classification, penalty lifecycle, duplicate blocks, waiver lifecycle, reminder eligibility/intents, support intents, and denials. |
| UOW-01 support intents | Persist reminder document/email intent requests for later UOW-08 implementation. |
| UOW-01 logging/errors/correlation | Redacted structured logs, safe errors, metrics, and correlation IDs. |
| UOW-03 configuration primitives | Resolve grace-period metadata, penalty charge type, penalty charge rule references, rounding rule references, aging bucket configuration, and reminder suppression metadata. |
| UOW-04 invoice records | Consume issued non-voided invoice source facts, due dates, billing account, charge categories, responsible party, and invoice open-amount input facts. |
| UOW-05 financial effects | Consume payment, allocation, credit, reversal, correction, waiver-related availability, and balance-impact facts to derive open amounts. |
| Prisma/PostgreSQL | UOW-06 tables, indexes, constraints, migrations, row/advisory locking, idempotency keys, and transaction boundaries. |
| UOW-07 statements/reporting | Later consumer of UOW-06 source facts and read models; UOW-06 must not create statements, reports, or exports. |
| UOW-08 delivery/documents/jobs | Later processor of reminder content rendering, storage, SMTP delivery, retries, and download behavior. |

UOW-06 must not create invoices, invoice lines, invoice numbers, payments, allocations, credits, receipts, statements, reports, exports, rendered documents, emails, stored files, import batches, retry jobs, or mutable account-balance source-of-truth records. UOW-06 must not directly render PDFs, send SMTP emails, store files, generate reports, process imports, create support jobs, or bypass UOW-03/UOW-04/UOW-05 validation.

## Code Location

Application code must be generated in the workspace root only:

| Area | Target Paths |
|---|---|
| Shared domain/kernel code | `packages/shared/src/uow06/`, `packages/shared/src/schemas/uow06.ts`, `packages/shared/test/uow06/`, `packages/shared/test/pbt/uow06*.spec.ts` |
| Shared exports and permissions | `packages/shared/src/index.ts`, `packages/shared/src/schemas/index.ts`, `packages/shared/src/permissions/` |
| Database schema and migration | `prisma/schema.prisma`, `prisma/migrations/{timestamp}_uow06_penalties_delinquency_waivers_reminders/` |
| API module | `apps/api/src/modules/uow06/`, `apps/api/src/persistence/repositories/uow06*.repository.ts`, `apps/api/test/uow06/`, `apps/api/test/integration/uow06*.integration.spec.ts` |
| API registration | `apps/api/src/app.module.ts` |
| Frontend components | `apps/web/src/features/uow06/`, `apps/web/src/app/uow06/`, `apps/web/src/app/portal/delinquency/`, `apps/web/test/uow06/` |
| Documentation summaries | `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/code/` |

Do not create duplicate modified files. If a target file already exists, modify it in place.

## Generation Checklist

### Part 1 - Planning

- [x] Read UOW-06 Functional Design artifacts.
- [x] Read UOW-06 NFR Requirements artifacts.
- [x] Read UOW-06 NFR Design artifacts.
- [x] Read UOW-06 Infrastructure Design artifacts.
- [x] Read Code Generation rule details.
- [x] Read workspace root and project structure from `aidlc-docs/aidlc-state.md`.
- [x] Inspect existing monorepo structure and UOW-01 through UOW-05 implementation patterns.
- [x] Identify UOW-06 stories, dependencies, interfaces, entities, service boundaries, and target paths.
- [x] Create this Code Generation plan.
- [x] Log approval prompt in `aidlc-docs/audit.md`.
- [x] Receive explicit approval for this plan.

### Part 2 - Generation

- [x] Step 1: Load this approved plan and re-check current worktree status.
- [x] Step 2: Add shared UOW-06 domain types, enums, statuses, reason codes, failure codes, source-record references, period keys, support-intent references, and balance-impact fact types under `packages/shared/src/uow06/`.
- [x] Step 3: Add shared UOW-06 date, amount, and lifecycle helpers for explicit `evaluationDate`, HOA business timezone normalization, first overdue date, aging day count, aging bucket classification, penalty period keys, non-compounding basis exclusion, waiver amount limits, waiver idempotency, reminder suppression, duplicate penalty keys, immutable source-record transitions, and safe failures.
- [x] Step 4: Add shared UOW-06 Zod schemas under `packages/shared/src/schemas/uow06.ts` for overdue evaluation, aging list/detail filters, penalty candidate generation, penalty application, penalty void/reissue/correction requests, waiver request/approval/rejection, reminder eligibility, reminder intent creation, list filters, read models, and safe errors.
- [x] Step 5: Update shared exports and permissions for UOW-06 overdue read/evaluate, aging read, penalty read/generate/apply/void/reissue, waiver request/approve/read, reminder eligibility/read/create-intent, support-intent actions, homeowner reads, and Board Member read-only PII-minimized access.
- [x] Step 6: Add shared UOW-06 unit tests and PBT generators for overdue boundary dates, aging bucket classification, penalty duplicate keys, non-compounding basis exclusion, partial-payment basis, waiver amount limits, waiver idempotency, reminder duplicate suppression, and balance-impact conservation.
- [x] Step 7: Update `prisma/schema.prisma` with UOW-06 enums, models, relations, indexes, and constraints for overdue evaluation snapshots, aging classifications, penalty source records, penalty snapshots, waiver requests, waiver source records, waiver snapshots, reminder eligibility records, reminder intents, duplicate/idempotency keys, balance-impact facts, approval references, audit references, and support-intent references.
- [x] Step 8: Add a UOW-06 Prisma migration under `prisma/migrations/` with duplicate penalty constraints, waiver idempotency constraints, reminder duplicate constraints, status-filtered indexes, evaluation-date indexes, billing-account/property indexes, balance-impact indexes, and audit/support reference indexes.
- [x] Step 9: Add API persistence repositories for overdue evaluations, aging classifications, penalty candidates, penalty source records, waiver requests, waiver source records, reminder eligibility records, reminder intents, balance-impact facts, duplicate penalty lookups, idempotency lookups, and support-intent persistence references.
- [x] Step 10: Add API domain services for DateControlPolicy, ValidationGateway, OverdueEvaluationService, AgingClassifier, PenaltyRuleResolver, PenaltyRunCoordinator, DuplicatePenaltyGuard, PenaltyApplicationCoordinator, WaiverCoordinator, ReminderEligibilityService, ReminderIntentAdapter, AmountCalculationPolicy, BalanceImpactPublisher, AuthorizationPolicy, AuditAdapter, ObservabilityAdapter, and safe error mapping.
- [x] Step 11: Add API controllers and DTO validation for staff overdue evaluation, aging review, penalty candidate generation, selected penalty application, penalty detail/history, penalty void/reissue/correction request status, waiver request/review/approval/rejection, reminder eligibility review, reminder intent creation/status, and homeowner-safe delinquency/penalty/waiver/reminder reads.
- [x] Step 12: Register the UOW-06 API module in `apps/api/src/app.module.ts`.
- [x] Step 13: Add API unit tests for date control, validation gateway, overdue evaluation, aging classifier, penalty rule resolution, duplicate penalty guard, penalty application, waiver idempotency, waiver amount limit, reminder suppression, reminder intent boundaries, authorization policies, audit adapter, observability adapter, and safe errors.
- [x] Step 14: Add API integration tests for overdue evaluation, aging classification, penalty generation without mutation, selected penalty application atomicity, duplicate penalty blocking, penalty void/reissue linkage, waiver approval idempotency, waiver overage rejection, reminder duplicate suppression, support intent persistence, route authorization, and homeowner/Board Member read constraints.
- [x] Step 15: Add API PBT tests using `fast-check` for overdue boundaries, aging bucket classification, penalty duplicate prevention, non-compounding basis exclusion, partial-payment basis, waiver amount limits, waiver idempotency, reminder duplicate suppression, and penalty/waiver balance-impact conservation.
- [x] Step 16: Add frontend API client methods and typed view models for overdue review, aging worklists, penalty candidates, penalty application, penalty history, waiver requests/approvals, reminder eligibility/intents, and homeowner-safe delinquency views.
- [x] Step 17: Add frontend UOW-06 components for overdue review workspace, aging bucket table, penalty candidate panel, penalty application review, penalty detail/history, waiver request panel, waiver approval panel, reminder eligibility panel, reminder intent status panel, and homeowner delinquency/penalty/waiver/reminder detail.
- [x] Step 18: Add Next.js route entries for UOW-06 staff penalty/delinquency views and homeowner-safe delinquency portal views using existing protected shell conventions.
- [x] Step 19: Add frontend tests for accessible forms/tables, stable `data-testid` values, explicit financial date controls, validation summaries, duplicate penalty display, waiver amount errors, reminder suppression display, homeowner isolation, Board Member PII-minimized reads, support intent status, and no JSON-only normal staff workflow.
- [x] Step 20: Add code summary markdown under `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/code/` covering business logic, API layer, repository layer, frontend layer, database migration, tests, deployment impact, and boundary confirmation.
- [x] Step 21: Run generation verification commands: `npm run prisma:generate`, `npm run typecheck`, targeted tests for shared/API/web UOW-06 areas, targeted PBT tests, and broader workspace tests where feasible.
- [x] Step 22: Fix defects found by generation verification without widening scope.
- [x] Step 23: Verify no UOW-06 code creates invoices, invoice lines, invoice numbers, payments, allocations, credits, receipts, statements, reports, exports, rendered documents, sent emails, stored files, import batches, retry jobs, support jobs, or mutable account-balance source-of-truth records.
- [x] Step 24: Verify UOW-06 code uses explicit `evaluationDate`, UOW-03 configuration primitives, UOW-04 issued invoice/open-amount facts, UOW-05 payment/allocation/credit/reversal/correction effects, decimal-safe calculation, database-backed duplicate/idempotency controls, immutable source records, support-intent boundaries, server authorization, safe logs, and stable frontend test IDs.
- [x] Step 25: Verify Security Baseline compliance, PBT compliance, content validation, and no duplicate generated files.
- [x] Step 26: Mark all completed plan steps and story coverage checkboxes.
- [x] Step 27: Present the standardized Code Generation completion message.

## Implementation Notes

### Domain and Schema Rules

- Financial control dates must be explicit. The server clock must not decide overdue, aging, penalty, waiver, or reminder outcomes.
- Penalty source record statuses are `Draft`, `Applied`, `Voided`, and `Reissued`.
- Duplicate penalty checks are blocked by `Draft`, `Applied`, and `Reissued`; `Voided` remains historical and does not block linked reissue or correction.
- Recurring monthly penalties use a normalized `YYYY-MM` period key based on `evaluationDate` in the HOA business timezone.
- Penalty basis must exclude prior penalties, penalty waivers, reminder fees, and penalty-on-penalty amounts.
- Waiver approval processing must be idempotent by approval request and target penalty source record.
- Waivers cannot exceed the available unpaid target penalty amount and excess waiver amount must not automatically become a credit.
- Reminder suppression uses configured suppression rules when available; MVP suppresses duplicate same-scope same-period reminders and reminders without an authorized contact path.
- JavaScript floating-point arithmetic must not be used for UOW-06 financial amount logic.

### API Boundaries

- Backend authorization is authoritative; frontend controls are usability only.
- Homeowners can read only penalty, waiver, delinquency, and reminder status tied to their authorized billing accounts, properties, or homeowner profile.
- Board Member access is read-only and PII-minimized.
- UOW-03 supplies configuration primitives only; UOW-06 owns penalty eligibility, calculation logic, duplicate prevention, source records, and balance-impact facts.
- UOW-08 owns rendering, storage, SMTP delivery, retries, and document download behavior for reminders.
- UOW-06 creates penalty-side and waiver-side balance-impact facts only; later units derive complete account balance views.

### Frontend Boundaries

- UOW-06 screens must rely on server-authorized data.
- UOW-06 components must use stable `data-testid` values from Functional Design.
- Normal staff workflows must use structured forms/tables, not JSON-only editing.
- UI must clearly separate overdue state, aging classification, penalty source record state, waiver request/source record state, and reminder eligibility/intent state.
- UI must not imply invoice creation, payment posting, credit creation, report/export generation, PDF rendering, SMTP delivery, file storage, import execution, retry job execution, or mutable balance editing.

## Story Completion Checklist

- [x] US-020 implemented: overdue evaluation, aging buckets, first overdue date, aging day count, delinquency read models, authorization, staff/homeowner UI, tests, and PBT.
- [x] US-021 implemented: penalty candidate generation, non-compounding calculation, duplicate prevention, penalty source records, balance-impact facts, audit, staff UI, tests, and PBT.
- [x] US-022 implemented: approval-backed waiver requests, idempotent waiver source records, waiver amount limits, waiver balance-impact facts, audit, staff UI, tests, and PBT.
- [x] US-023 implemented: reminder eligibility, suppression, authorized contact path validation, duplicate intent prevention, support intent persistence, status UI, tests, and PBT.

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | API routes enforce backend permission checks, homeowner/Board Member read constraints are represented in permissions and views, waiver actions are approval-aware, reminder work stays behind support-intent boundaries, and sensitive actions write audit metadata. |
| Property-Based Testing | Compliant | `fast-check` tests cover overdue boundaries, duplicate penalty statuses, penalty duplicate keys, waiver idempotency keys, reminder duplicate keys, and period key normalization. `npm run test:pbt` passed. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
