# UOW-05 Code Generation Plan

## Unit

- **Unit ID**: UOW-05
- **Unit Name**: Payments, Allocations, Credits, Receipts, and Financial Corrections
- **Stage**: Code Generation, Part 2 - Generation
- **Current Gate**: Waiting for approval before continuing to the next stage

## Purpose

Generate UOW-05 application code, database schema, API layer, frontend components, tests, and code summaries in the existing TypeScript modular monorepo. This plan is the single source of truth for UOW-05 Code Generation. After approval, generation must execute the steps below in order and mark each checkbox complete in the same interaction where the work is completed.

UOW-05 creates financially material source records. Implementation must keep payment posting transactional, allocation and credit math decimal-safe, receipt numbering unique and transactional, duplicate review database-backed, reversals and corrections immutable and linked, support intents durable but side-effect-free, and payment/receipt reads server-authorized.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/inception/application-design/unit-of-work-story-map.md` | UOW-05 story ownership: US-015, US-016, US-017, US-018, US-019, US-044, and US-045. |
| `aidlc-docs/inception/application-design/unit-of-work-dependency.md` | UOW-05 depends on UOW-01, UOW-02, UOW-03, and UOW-04 and supplies payment records to later units. |
| `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/functional-design/` | Business logic, rules, domain entities, and frontend component design. |
| `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/nfr-requirements/` | Performance, security, durability, observability, accessibility, and PBT requirements. |
| `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/nfr-design/` | Logical components and design patterns for implementation. |
| `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/infrastructure-design/` | PostgreSQL, migration, locking, observability, backup, and deployment constraints. |
| `aidlc-docs/construction/shared-infrastructure.md` | Shared deployment and infrastructure rules. |
| `aidlc-docs/aidlc-state.md` | Workspace root, project structure, extension configuration, and current stage. |

## Story Traceability

| Story | Title | UOW-05 Implementation Coverage |
|---|---|---|
| US-015 | Submit homeowner payment proof | Proof submission, proof metadata validation, support attachment reference/intents, homeowner-safe status UI, authorization, audit, tests, and PBT. |
| US-016 | Verify and post payments | Staff review, posting validation, duplicate review, transactional payment source records, audit, staff UI, tests, and PBT. |
| US-017 | Allocate payments automatically and manually | Automatic allocation, manual allocation validation, open-amount guards, credit remainder, balance-impact facts, staff UI, tests, and PBT. |
| US-018 | Generate official or provisional receipts | Receipt source records, receipt numbering, receipt snapshots, document/email support intents, receipt detail UI, tests, and PBT. |
| US-019 | Reverse posted payments | Approval-backed reversal, linked reversal facts, equal-and-opposite balance impacts, receipt reversal status, audit, staff UI, tests, and PBT. |
| US-044 | Approve financial adjustments | Approval-backed correction workflow, correction source records, balance-impact facts, audit, staff UI, tests, and PBT. |
| US-045 | Preserve immutable financial history | Immutable payment, allocation, credit, receipt, reversal, and correction source records with linked corrective records, tests, and PBT. |

## Dependencies and Boundaries

| Dependency | Use |
|---|---|
| UOW-01 authentication/session | Resolve actor context for protected APIs and frontend shell. |
| UOW-01 authorization | Enforce role and object/scope access for payment, proof, credit, and receipt reads/mutations. |
| UOW-01 approval workflow | Treasurer approval for reversals and corrections where required. |
| UOW-01 audit | Append audit entries for proof lifecycle, posting, allocation, credits, receipts, duplicate overrides, reversals, corrections, support intents, and denials. |
| UOW-01 support intents | Persist proof attachment references/intents and receipt document/email intent requests for later UOW-08 implementation. |
| UOW-01 logging/errors/correlation | Redacted structured logs, safe errors, and correlation IDs. |
| UOW-02 read models | Validate homeowner, property, billing account, ownership, and object authorization facts. |
| UOW-03 resolution DTOs | Use payment methods, reference requirements, receipt numbering metadata, rounding/decimal metadata, and template references. |
| UOW-04 invoice records | Allocate against issued non-voided invoice source records, invoice lines/components, and open-amount input facts. |
| Prisma/PostgreSQL | UOW-05 tables, indexes, constraints, migrations, row/advisory locking, and transaction boundaries. |

UOW-05 must not create invoices, invoice lines, invoice numbers, penalties, penalty waivers, delinquency classifications, statements, reports, exports, rendered documents, sent emails, stored files, import batches, concrete support jobs, or mutable account-balance source-of-truth records. UOW-05 must not directly render PDFs, send SMTP emails, store proof files, apply penalties, generate reports, process imports, or bypass UOW-02/UOW-03/UOW-04 validation.

## Code Location

Application code must be generated in the workspace root only:

| Area | Target Paths |
|---|---|
| Shared domain/kernel code | `packages/shared/src/uow05/`, `packages/shared/src/schemas/uow05.ts`, `packages/shared/test/uow05/`, `packages/shared/test/pbt/uow05*.spec.ts` |
| Shared exports and permissions | `packages/shared/src/index.ts`, `packages/shared/src/schemas/index.ts`, `packages/shared/src/permissions/` |
| Database schema and migration | `prisma/schema.prisma`, `prisma/migrations/{timestamp}_uow05_payments_allocations_receipts/` |
| API module | `apps/api/src/modules/uow05/`, `apps/api/src/persistence/repositories/uow05*.repository.ts`, `apps/api/test/uow05/`, `apps/api/test/integration/uow05*.integration.spec.ts` |
| API registration | `apps/api/src/app.module.ts` |
| Frontend components | `apps/web/src/features/uow05/`, `apps/web/src/app/uow05/`, `apps/web/src/app/portal/payments/`, `apps/web/src/app/portal/receipts/`, `apps/web/test/uow05/` |
| Documentation summaries | `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/code/` |

Do not create duplicate modified files. If a target file already exists, modify it in place.

## Generation Checklist

### Part 1 - Planning

- [x] Read UOW-05 Functional Design artifacts.
- [x] Read UOW-05 NFR Requirements artifacts.
- [x] Read UOW-05 NFR Design artifacts.
- [x] Read UOW-05 Infrastructure Design artifacts.
- [x] Read Code Generation rule details.
- [x] Read workspace root and project structure from `aidlc-docs/aidlc-state.md`.
- [x] Inspect existing monorepo structure and UOW-01/UOW-02/UOW-03/UOW-04 implementation patterns.
- [x] Identify UOW-05 stories, dependencies, interfaces, entities, service boundaries, and target paths.
- [x] Create this Code Generation plan.
- [x] Log approval prompt in `aidlc-docs/audit.md`.
- [x] Receive explicit approval for this plan.

### Part 2 - Generation

- [x] Step 1: Load this approved plan and re-check current worktree status.
- [x] Step 2: Add shared UOW-05 domain types, enums, statuses, reason codes, duplicate-risk key helpers, proof lifecycle helpers, payment reversal helpers, credit availability helpers, receipt numbering scope helpers, support-intent reference types, balance-impact fact types, and safe failure codes under `packages/shared/src/uow05/`.
- [x] Step 3: Add shared UOW-05 decimal-safe calculation helpers and validators for allocation conservation, open amount limits, credit remainder, credit application, reversal offset facts, receipt totals, duplicate-risk keys, immutable source-record metadata, and correction state transitions.
- [x] Step 4: Add shared UOW-05 Zod schemas under `packages/shared/src/schemas/uow05.ts` for payment proof submission, proof review, proof rejection/cancellation, manual payment entry, posting, automatic/manual allocation, credit application, receipt reads, reversal requests, correction requests, support intents, list filters, and safe errors.
- [x] Step 5: Update shared exports and permissions for UOW-05 proof read/submit/review, payment read/post, allocation manage, credit manage, receipt read/manage, reversal request/approve, correction request/approve, and support-intent actions, preserving Board Member read-only and homeowner isolation semantics.
- [x] Step 6: Add shared UOW-05 unit tests and PBT generators for proof state transitions, duplicate-risk keys, allocation conservation, open amount limits, credit remainder, credit application, reversal restoration, receipt number uniqueness, and immutable source-record transitions.
- [x] Step 7: Update `prisma/schema.prisma` with UOW-05 enums, models, relations, indexes, and constraints for payment proofs, posted payments, payment allocations, credits, credit applications, receipts, receipt snapshots, payment reversals, financial corrections, balance-impact facts, document/email/attachment intents, and approval/audit references.
- [x] Step 8: Add a UOW-05 Prisma migration under `prisma/migrations/` with duplicate-risk indexes, receipt-number uniqueness, reversal uniqueness, status filters, allocation target indexes, credit application indexes, balance-impact indexes, and support-intent persistence structures.
- [x] Step 9: Add API persistence repositories for payment proofs, payment posting, allocations, credits, credit applications, receipts, receipt snapshots, reversals, corrections, balance-impact facts, duplicate-risk lookups, receipt numbering, and support intents.
- [x] Step 10: Add API domain services for PaymentProofIntake, PaymentValidationGateway, DuplicatePaymentGuard, PaymentPostingCoordinator, AllocationPolicy, CreditLedgerService, ReceiptNumberAllocator, ReceiptSnapshotWriter, ReversalCoordinator, FinancialCorrectionService, BalanceImpactPublisher, SupportIntentAdapter, AuthorizationPolicy, AuditAdapter, ObservabilityAdapter, and safe error mapping.
- [x] Step 11: Add API controllers and DTO validation for homeowner proof submission/status, staff proof review/list/detail, proof rejection/cancellation, manual payment entry, payment posting, allocation preview/manual allocation, credit ledger/application, receipt detail/history, reversal request/status, correction request/status, and proof/receipt support intents.
- [x] Step 12: Register the UOW-05 API module in `apps/api/src/app.module.ts`.
- [x] Step 13: Add API unit tests for validation gateway, duplicate guard, allocation policy, credit ledger, posting coordinator, receipt numbering conflict handling, receipt snapshot immutability, reversal idempotency, correction immutability, support intent boundaries, authorization policies, audit adapter, observability adapter, and safe errors.
- [x] Step 14: Add API integration tests for proof submission, proof rejection/cancellation, duplicate proof/payment blocking and override audit, posting success/failure atomicity, automatic allocation, manual allocation validation, overpayment credit creation, credit application, receipt numbering non-reuse, reversal approval flow, correction approval flow, support intent persistence, and route authorization.
- [x] Step 15: Add API PBT tests using `fast-check` for duplicate payment keys, allocation totals, open amount limits, credit remainder, credit application availability, receipt numbering scopes, reversal restoration, and immutable source-record state models.
- [x] Step 16: Add frontend API client methods and typed view models for payment proofs, proof review, payment posting, allocation preview, credit ledger, receipts, reversals, corrections, support intents, and homeowner-safe payment/receipt views.
- [x] Step 17: Add frontend UOW-05 components for payment workspace, homeowner payment proof form, homeowner proof status, payment proof review panel, duplicate candidate panel, payment posting workspace, allocation editor, credit ledger panel, receipt detail panel, payment history panel, reversal request panel, financial correction panel, and receipt document/email intent panel.
- [x] Step 18: Add Next.js route entries for UOW-05 staff payment views and homeowner-safe payment/receipt portal views using existing protected shell conventions.
- [x] Step 19: Add frontend tests for accessible forms/tables, stable `data-testid` values, safe validation summaries, duplicate candidate display, posting/allocation results, credit availability indicators, receipt snapshot display, reversal/correction status separation, support intent status, and no JSON-only normal staff workflow.
- [x] Step 20: Add code summary markdown under `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/code/` covering business logic, API layer, repository layer, frontend layer, database migration, tests, deployment impact, and boundary confirmation.
- [x] Step 21: Run generation verification commands: `npm run prisma:generate`, `npm run typecheck`, targeted tests for shared/API/web UOW-05 areas, targeted PBT tests, and broader workspace tests where feasible.
- [x] Step 22: Fix defects found by generation verification without widening scope.
- [x] Step 23: Verify no UOW-05 code creates invoices, invoice lines, invoice numbers, penalties, penalty waivers, delinquency classifications, statements, reports, exports, rendered documents, sent emails, stored files, import batches, concrete support jobs, or mutable account-balance source-of-truth records.
- [x] Step 24: Verify UOW-05 code uses UOW-02 authorization facts, UOW-03 payment/numbering metadata, UOW-04 invoice/open-amount facts, decimal-safe calculation, database-backed duplicate/receipt-numbering controls, immutable source records, support-intent boundaries, server authorization, safe logs, and stable frontend test IDs.
- [x] Step 25: Verify Security Baseline compliance, PBT compliance, content validation, and no duplicate generated files.
- [x] Step 26: Mark all completed plan steps and story coverage checkboxes.
- [x] Step 27: Present the standardized Code Generation completion message.

## Implementation Notes

### Domain and Schema Rules

- Payment proof statuses are `Submitted`, `UnderReview`, `Rejected`, `Posted`, and `Cancelled`.
- Posted payment status is `Posted`, with `Reversed` derived from approved linked reversal records and related reversal facts.
- Active proofs for duplicate checks are `Submitted` and `UnderReview`.
- Payment reference requirements are configuration-driven by resolved UOW-03 payment method and proof channel metadata.
- Payment posting, allocation, credit creation, receipt creation, balance-impact facts, and audit must succeed or fail together per payment.
- Receipt numbers are assigned only after posting succeeds and are never reused.
- Credits are immutable source records; available credit is derived from linked applications and reversals.
- Corrections create linked source records and must not overwrite original financial records.
- JavaScript floating-point arithmetic must not be used for UOW-05 financial amount logic.

### API Boundaries

- Backend authorization is authoritative; frontend controls are usability only.
- Homeowners can read only proofs, payments, credits, receipts, and support intent status tied to their authorized billing accounts, properties, homeowner profile, or submitted proofs.
- Board Member access is read-only and PII-minimized.
- Reversal and correction actions require approval where required by business rules.
- Support intents are persisted for later UOW-08 processing; UOW-05 does not store files, render PDFs, send SMTP emails, or run retry jobs.
- UOW-05 creates payment-side balance-impact facts only; later units derive complete account balance views.

### Frontend Boundaries

- UOW-05 screens must rely on server-authorized data.
- UOW-05 components must use stable `data-testid` values from Functional Design.
- Normal staff workflows must use structured forms/tables, not JSON-only editing.
- UI must clearly separate proof, payment, receipt, credit, reversal, and correction states.
- UI must not imply invoice creation, penalty application, report/export generation, PDF rendering, SMTP delivery, file storage, import execution, or mutable balance editing.

## Story Completion Checklist

- [x] US-015 implemented: homeowner payment proof submission, authorization, support attachment references/intents, status UI, tests, and PBT.
- [x] US-016 implemented: proof verification, duplicate review, payment posting, transactional source records, audit, staff UI, tests, and PBT.
- [x] US-017 implemented: automatic/manual allocation, open-amount guards, credit remainder, credit application, balance-impact facts, staff UI, tests, and PBT.
- [x] US-018 implemented: receipt source records, receipt numbering, receipt snapshots, receipt support intents, receipt UI, tests, and PBT.
- [x] US-019 implemented: approval-backed payment reversal, linked reversal facts, receipt reversal status, balance-impact reversal facts, audit, staff UI, tests, and PBT.
- [x] US-044 implemented: approval-backed financial correction source records, balance-impact facts, audit, staff UI, tests, and PBT.
- [x] US-045 implemented: immutable financial history across payments, allocations, credits, receipts, reversals, corrections, linked corrective records, tests, and PBT.

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Generated API routes enforce backend permission checks, homeowner/Board Member read constraints are represented in shared permissions and service authorization calls, support-intent boundaries are side-effect-free, and financial actions audit actor and correlation metadata. |
| Property-Based Testing | Compliant | Generated `fast-check` tests cover UOW-05 duplicate keys, allocation conservation, credit remainder, and service-level posting invariants, and `npm run test:pbt` passed. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
- Content scan found no Mermaid or ASCII diagram syntax in the UOW-05 code summary or code generation plan.
