# UOW-04 NFR Design Plan

## Unit

- **Unit ID**: UOW-04
- **Unit Name**: Invoice Lifecycle and Invoice Source Records
- **Stage**: NFR Design, Planning
- **Current Gate**: Waiting for answers in this file

## Purpose

Translate approved UOW-04 NFR Requirements into concrete non-functional patterns and logical components before Infrastructure Design and Code Generation. UOW-04 is the first unit that creates financial source records, so the design must make duplicate prevention, issued numbering uniqueness, snapshot durability, decimal safety, support-intent boundaries, fail-closed validation, authorization, audit, observability, and PBT explicit.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/nfr-requirements/nfr-requirements.md` | Approved UOW-04 NFR requirements. |
| `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/nfr-requirements/tech-stack-decisions.md` | Approved UOW-04 stack decisions. |
| `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/functional-design/` | UOW-04 business logic, rules, entities, and frontend components. |
| `aidlc-docs/construction/uow-01-platform-foundation/` | Foundation patterns for auth, authorization, approval, audit, safe errors, support intents, logging, validation, and testing. |
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/` | Billable validation, billing-account periods, ownership responsibility, and lot area facts. |
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/` | Resolution DTOs for rate, rounding, charge type, due date, numbering, and template metadata. |

## NFR Design Scope

### In Scope

- Batch generation and retry-safety patterns for up to 2,000 candidates.
- Issuance transaction, revalidation, numbering, snapshot, and audit patterns.
- PostgreSQL-backed duplicate prevention, uniqueness, and locking patterns.
- Fail-closed source validation and safe error patterns.
- Decimal-safe calculation and snapshot patterns.
- Durable support-intent pattern for document/email requests without rendering or SMTP.
- Backend authorization, object/scope authorization, approval, and PII minimization patterns.
- Structured logging, metrics/event, and redaction patterns.
- Staff and homeowner-safe frontend accessibility and workflow patterns.
- PBT generator, state-model, seed, shrinking, and regression-capture patterns.
- Logical components needed to implement the above.

### Out of Scope

- Concrete database migrations, code, DTO implementations, generated tests, and API handlers. These belong to Code Generation.
- Concrete infrastructure resource definitions, TLS, backup commands, network policy, and deployment topology. These belong to Infrastructure Design.
- Payment posting, receipt generation, penalty application, statements, reports, exports, PDF rendering, SMTP delivery, file storage, and import processing.

## NFR Design Checklist

- [x] Read UOW-04 NFR Requirements artifacts.
- [x] Read UOW-04 Functional Design artifacts.
- [x] Read NFR Design rule details.
- [x] Confirm Security Baseline and Property-Based Testing extensions are enabled.
- [x] Identify UOW-04 NFR design patterns and logical component decisions.
- [x] Create this NFR Design plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory.
- [x] Generate `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/nfr-design/nfr-design-patterns.md`.
- [x] Generate `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/nfr-design/logical-components.md`.
- [x] Verify Security Baseline compliance summary.
- [x] Verify Property-Based Testing compliance summary.
- [x] Verify content validation before artifact creation.
- [x] Present the standardized NFR Design completion message.

## Required NFR Design Artifacts

After this plan is answered and validated, generate:

- `nfr-design-patterns.md`: Batch, issuance, duplicate prevention, numbering, snapshot, validation, precision, authorization, audit, support-intent, observability, frontend, and PBT patterns.
- `logical-components.md`: Logical components, responsibilities, dependencies, request flows, data responsibilities, and NFR responsibility mapping.

## NFR Design Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

### Question 1
What recurring batch generation pattern should UOW-04 use?

A) Synchronous staff-triggered command for first-scope batches up to 2,000 candidates, chunked internally where useful, returning summary counts and persisted exceptions, with retry-safe duplicate prevention (recommended)
B) Distributed asynchronous workflow engine from the start
C) Browser-driven generation by sending all candidates to the client
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What issuance transaction pattern should UOW-04 use?

A) Per-invoice issuance transaction inside selected batch processing: revalidate draft, lock number sequence/scope, assign number, persist snapshots/open-amount input, write audit, and return per-invoice result (recommended)
B) One all-or-nothing transaction for every selected invoice in a batch regardless of size
C) Assign numbers first and snapshot later asynchronously
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
What duplicate prevention and replacement pattern should UOW-04 use?

A) Database-backed unique/indexed duplicate key plus service guard; cancelled recurring draft replacement requires explicit linked replacement action with reason, actor, and audit (recommended)
B) Service-only duplicate search without persistence guard
C) Staff review is sufficient to catch duplicates
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
What issued-number concurrency pattern should UOW-04 use?

A) PostgreSQL transaction with row-level or advisory lock per numbering scope, unique issued-number constraint, and stable conflict error on race (recommended)
B) Generate numbers from current timestamp
C) Let UOW-03 allocate invoice numbers
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
What fail-closed validation pattern should UOW-04 use?

A) Validation gateway that resolves UOW-02 billable facts and UOW-03 configuration, returns typed success or safe failure codes, persists billing exceptions for recurring candidates, and blocks issuance on unresolved facts (recommended)
B) Best-effort validation that fills missing values from previous invoices
C) Allow staff override directly in invoice forms
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
What snapshot durability pattern should UOW-04 use?

A) Persist issued header and line snapshots as durable source records with core structured columns and bounded metadata JSON, created transactionally with issuance (recommended)
B) Reconstruct issued invoices from current UOW-02/UOW-03 data at display time
C) Store only generated PDF files as invoice history
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
What decimal and rounding pattern should UOW-04 use?

A) Central invoice calculation policy using shared decimal-safe helpers, integer minor units or validated decimals, UOW-03 rounding metadata, and explicit snapshot of inputs/outputs (recommended)
B) JavaScript floating point internally with formatting at the UI
C) Store all amounts as text and avoid calculation helpers
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
What support-intent pattern should UOW-04 use for documents and emails?

A) Durable intent adapter that records document/email intents against issued snapshots through UOW-01 contracts after or within issuance as appropriate; failures are visible but never invalidate issued invoices (recommended)
B) Render PDFs and send SMTP email directly in UOW-04
C) Do not model document/email intents until UOW-08
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
What security and authorization pattern should UOW-04 use?

A) UOW-01 actor context, backend route guards, object/scope policies for invoice/property/account access, Treasurer approval checks for issued void/reissue, safe denials, and audit/security events (recommended)
B) Frontend route protection plus authenticated API calls
C) Broad staff access to all invoice reads and mutations
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
What observability and logging pattern should UOW-04 use?

A) Structured metrics/events for generation, exceptions, duplicates, issuance, numbering conflicts, validation failures, denied access, lifecycle approvals, snapshot creation, and support intents, with safe identifiers and redacted PII/payloads (recommended)
B) Full invoice and homeowner payload logs for debugging
C) Generic HTTP logs only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 11
What frontend NFR pattern should UOW-04 use?

A) Server-authorized data loading, paginated tables, keyboard-accessible batch review and issue flows, safe validation summaries, stable `data-testid` values, and clear separation of lifecycle status from payment-derived status (recommended)
B) Single JSON editor for invoices and invoice lines
C) Accessibility deferred to UOW-08 portal integration
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 12
What PBT design pattern should UOW-04 use?

A) Centralized `fast-check` generators and state models for duplicate keys, numbering scopes, invoice lines/totals, source snapshots, decimal cases, and void/reissue transitions with seed replay and shrinking capture (recommended)
B) Ad hoc primitive generators in individual tests only
C) PBT only for decimal rounding
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 13
What logical component decomposition should UOW-04 use?

A) Separate logical components for RecurringBatchGeneration, InvoiceValidationGateway, DuplicateGuard, InvoiceCalculationPolicy, ManualInvoiceDraft, IssuanceCoordinator, NumberingAllocator, SnapshotWriter, LifecycleActionService, BalanceInputPublisher, SupportIntentAdapter, AuthorizationPolicy, AuditAdapter, ObservabilityAdapter, FrontendInteraction, and PBTGenerators (recommended)
B) One large InvoiceService containing all behavior
C) Defer decomposition to Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Post-Answer Processing

After all `[Answer]:` tags are complete:

- Answers will be checked for blanks, invalid choices, contradictions, and vague wording.
- Follow-up questions will be added if any answer is ambiguous.
- If answers are clear, NFR Design artifacts will be generated directly from this plan and approved source context.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Selected answers require backend authorization, object/scope policies, Treasurer approval checks, safe denials, audit/security events, safe logging, PII redaction, and support-intent boundaries. |
| Property-Based Testing | Compliant | Selected answers require `fast-check` generators and state models for UOW-04 financial and lifecycle invariants with seed replay and shrinking capture. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
- All answers are valid `A` choices.
- No contradictory or ambiguous answers were detected.
- No follow-up questions are required.
