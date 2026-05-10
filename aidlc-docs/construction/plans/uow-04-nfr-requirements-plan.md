# UOW-04 NFR Requirements Plan

## Unit

- **Unit ID**: UOW-04
- **Unit Name**: Invoice Lifecycle and Invoice Source Records
- **Stage**: NFR Requirements, Planning
- **Current Gate**: Waiting for answers in this file

## Purpose

Define the non-functional requirements and technology stack decisions for UOW-04 before NFR Design, Infrastructure Design, and Code Generation. UOW-04 creates invoice source records, issued invoice numbers, immutable snapshots, invoice line amounts, billing exceptions, and support intents. Ambiguity in performance, transactionality, numbering concurrency, auditability, authorization, precision, and support-intent durability is dangerous and must be resolved before implementation.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/functional-design/business-logic-model.md` | Approved UOW-04 flows, boundaries, lifecycle, duplicate prevention, and PBT candidates. |
| `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/functional-design/business-rules.md` | Approved UOW-04 business rules and financial boundaries. |
| `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/functional-design/domain-entities.md` | UOW-04 invoice, snapshot, exception, numbering, lifecycle, and intent entities. |
| `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/functional-design/frontend-components.md` | UOW-04 staff and homeowner-safe frontend scope and stable test IDs. |
| `aidlc-docs/construction/uow-01-platform-foundation/` | Existing audit, authorization, approval, safe-error, support-intent, logging, and shared kernel foundations. |
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/` | Billable validation, ownership responsibility, billing account periods, and lot area facts consumed by UOW-04. |
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/` | Rate, cycle, due date, rounding, charge type, numbering, and template metadata consumed by UOW-04. |

## NFR Assessment Scope

### In Scope

- Performance targets for recurring draft generation, invoice review, issuance, and invoice detail reads.
- Scalability assumptions for first-scope HOA invoice volume and later growth.
- Transactional reliability for issuance, numbering, snapshots, and audit.
- Concurrency controls for duplicate prevention and issued invoice numbering.
- Availability and fail-closed behavior when UOW-02 or UOW-03 validation/resolution fails.
- Security and authorization requirements for staff, Treasurer, Board Member, and homeowner invoice access.
- PII minimization and safe error/logging requirements.
- Decimal precision and deterministic calculation requirements.
- Durability requirements for issued snapshots, lifecycle actions, billing exceptions, and support intents.
- Accessibility and usability requirements for invoice staff workflows and homeowner-safe detail views.
- Observability requirements for generation, issuance, duplicate blocks, exceptions, approval actions, and support intents.
- PBT and example-test requirements for UOW-04 invariants.

### Out of Scope

- NFR design patterns. These belong to NFR Design.
- Infrastructure topology and deployment mappings. These belong to Infrastructure Design.
- Application code, migrations, API handlers, and tests. These belong to Code Generation.
- Payment posting, receipt generation, penalty application, report/export generation, PDF rendering, SMTP delivery, file storage, and import processing.

## NFR Requirements Checklist

- [x] Read UOW-04 Functional Design artifacts.
- [x] Read NFR Requirements rule details.
- [x] Confirm Security Baseline and Property-Based Testing extensions remain enabled.
- [x] Identify UOW-04 NFR risks and stack decisions.
- [x] Create this NFR Requirements plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory.
- [x] Generate `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/nfr-requirements/nfr-requirements.md`.
- [x] Generate `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/nfr-requirements/tech-stack-decisions.md`.
- [x] Verify Security Baseline compliance summary.
- [x] Verify Property-Based Testing compliance summary.
- [x] Verify content validation before artifact creation.
- [x] Present the standardized NFR Requirements completion message.

## Required NFR Requirements Artifacts

After this plan is answered and validated, generate:

- `nfr-requirements.md`
- `tech-stack-decisions.md`

## NFR Requirements Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

### Question 1
What first-scope invoice volume should UOW-04 assume for recurring batch generation?

A) Same first-scope HOA posture as prior units: up to 25 operational users, up to 2,000 billable properties per recurring batch, low-frequency batch generation, and paginated staff review (recommended)
B) Design immediately for 100,000 properties per batch and distributed batch workers
C) Defer volume assumptions until Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What performance target should apply to recurring draft generation?

A) Generate drafts and exceptions for 2,000 candidate properties within 60 seconds in normal conditions, with progress/result visibility and no duplicate invoices on retry (recommended)
B) No explicit target because recurring generation is staff-triggered
C) Generation may run indefinitely as long as it eventually finishes
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
What performance target should apply to staff invoice review screens?

A) Protected list/detail queries p95 under 500 ms for first-scope data, with pagination, filters, and server-side sorting for drafts, exceptions, issued invoices, and lifecycle history (recommended)
B) Load entire batch and all invoice history into the browser
C) No target until production data exists
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
What performance and reliability target should apply to issuance?

A) Issue selected valid drafts transactionally, with each invoice revalidated, numbered, snapshotted, and audited; p95 under 2 seconds for single-invoice issuance and batch issuance allowed to process selected invoices with per-invoice results (recommended)
B) Issue the entire batch all-or-nothing regardless of size
C) Allow asynchronous issuance without immediate per-invoice success/failure visibility
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
What concurrency control should protect duplicate prevention and issued numbering?

A) Use PostgreSQL transactions, unique constraints/indexes, and row-level or advisory locking where needed so duplicate recurring invoices and duplicate issued numbers cannot occur under concurrent requests (recommended)
B) Rely only on frontend disabling and staff procedures
C) Accept occasional duplicates and clean them manually
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
How should UOW-04 handle missing or ambiguous UOW-02/UOW-03 source facts during generation or issuance?

A) Fail closed with safe reason-coded errors or billing exceptions; do not create or issue invoices until source facts are valid and resolvable (recommended)
B) Use the closest available source fact and warn staff later
C) Create invoices with placeholder values
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
What durability requirement should apply to issued invoices and snapshots?

A) Issued invoice source records, line records, number assignments, snapshots, open-amount input facts, lifecycle actions, and audit references must be transactionally coupled where practical and included in encrypted PostgreSQL backup/restore controls (recommended)
B) Store snapshots as reconstructable views only
C) Store only current invoice totals and rebuild details from UOW-02/UOW-03
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
What security model should UOW-04 use?

A) Backend route, role, object/scope authorization, homeowner isolation, Board Member read-only PII minimization, Treasurer approval for issued void/reissue, safe errors, and denial audit/security events through UOW-01 contracts (recommended)
B) Frontend role hiding is sufficient
C) Any authenticated staff user can issue, void, and reissue invoices
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
How should sensitive invoice data be logged?

A) Structured logs may include correlation ID, invoice ID, batch ID, action, status, safe failure code, and counts, but must not log full homeowner PII, full invoice payloads, payment-like details, or email recipient payloads (recommended)
B) Log full invoice and homeowner payloads for debugging
C) Do not log invoice operations at all
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
What precision and arithmetic implementation requirement should UOW-04 carry forward?

A) Use decimal-safe calculation helpers and integer minor units or validated decimal representations; never use JavaScript floating point for invoice amount calculation; preserve UOW-03 rate, lot area, and rounding rules in snapshots (recommended)
B) Use JavaScript number and round at display time
C) Store invoice amounts as unvalidated strings
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 11
What database/query approach should UOW-04 use?

A) PostgreSQL with typed invoice tables, indexed duplicate keys, indexed lifecycle/status filters, indexed issued-number lookups, and JSON only for bounded snapshot metadata where structured columns are not justified (recommended)
B) Store invoices only as JSON documents in one table
C) Add a separate search engine for invoice lists immediately
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 12
How should document and email intent reliability be handled?

A) UOW-04 records durable support intents after or within the invoice transaction as appropriate; intent failure must not roll back a valid issued invoice, and UOW-08 owns rendering, storage, delivery, and retries (recommended)
B) UOW-04 should directly render PDFs and send emails synchronously during issuance
C) Exclude document/email intent records from UOW-04
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 13
What validation stack should UOW-04 use?

A) Shared TypeScript domain validators plus Zod request schemas, aligned with existing shared-kernel and UOW-02/UOW-03 patterns (recommended)
B) Controller-only validation without shared domain helpers
C) Database constraints only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 14
What PBT requirement should UOW-04 implement later?

A) `fast-check` PBT for duplicate prevention, issued numbering uniqueness, invoice total equals line totals, snapshot immutability, decimal rounding stability, and void/reissue state transitions (recommended)
B) PBT only for decimal rounding
C) No PBT because invoices are staff-reviewed
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 15
What accessibility/usability requirement should apply to UOW-04 frontend screens?

A) WCAG 2.2 AA-oriented forms/tables, keyboard-accessible batch review and issue workflows, clear safe validation summaries, stable `data-testid` values, no JSON-only normal staff workflow, and explicit separation of lifecycle status from payment-derived status (recommended)
B) Accessibility deferred until homeowner portal work
C) JSON editor is sufficient for MVP
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 16
What observability signals should UOW-04 produce?

A) Metrics/log events for generation started/completed, exception counts, duplicate blocks, issuance success/failure, numbering conflicts, validation failures, denied access, void/reissue requests and decisions, snapshot creation, and document/email intent requests (recommended)
B) Only generic API request metrics
C) No UOW-04-specific observability
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 17
What tech stack posture should UOW-04 use?

A) Continue the existing TypeScript/NestJS/Next.js/Prisma/PostgreSQL/fast-check stack with no new dependency family unless NFR Design proves a hard need (recommended)
B) Add a distributed workflow engine for invoice generation now
C) Add a separate reporting/search database for invoice review now
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Post-Answer Processing

After all `[Answer]:` tags are complete:

- Answers will be checked for blanks, invalid choices, contradictions, and vague wording.
- Follow-up questions will be added if any answer is ambiguous.
- If answers are clear, NFR Requirements artifacts will be generated directly from this plan and approved source context.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Selected answers require backend authorization, Treasurer approval, audit, safe logs/errors, homeowner isolation, Board Member PII minimization, backup/restore durability, and no client-side security reliance. |
| Property-Based Testing | Compliant | Selected answers require `fast-check` PBT for duplicate prevention, numbering uniqueness, total correctness, snapshot immutability, rounding stability, and lifecycle transitions. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
- All answers are valid `A` choices.
- No contradictory or ambiguous answers were detected.
- No follow-up questions are required.
