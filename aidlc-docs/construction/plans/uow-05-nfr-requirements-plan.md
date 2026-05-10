# UOW-05 NFR Requirements Plan

## Unit

- **Unit ID**: UOW-05
- **Unit Name**: Payments, Allocations, Credits, Receipts, and Financial Corrections
- **Stage**: NFR Requirements, Planning
- **Current Gate**: Waiting for NFR Requirements approval

## Purpose

Define the non-functional requirements and technology stack decisions for UOW-05 before NFR Design, Infrastructure Design, and Code Generation. UOW-05 creates financially material payment, allocation, credit, receipt, reversal, correction, and balance-impact source facts. Ambiguity in transactionality, concurrency, precision, auditability, authorization, receipt numbering, proof handling, and reversal reliability is dangerous and must be resolved before implementation.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/functional-design/business-logic-model.md` | Approved UOW-05 flows, source-record boundaries, allocation logic, reversal logic, and PBT candidates. |
| `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/functional-design/business-rules.md` | Approved UOW-05 business rules for proof, posting, duplicate checks, allocation, credits, receipts, reversals, corrections, access, and PBT. |
| `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/functional-design/domain-entities.md` | UOW-05 proof, payment, allocation, credit, receipt, reversal, correction, balance-impact, and support-intent entities. |
| `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/functional-design/frontend-components.md` | UOW-05 homeowner and staff frontend scope and stable test IDs. |
| `aidlc-docs/construction/uow-01-platform-foundation/` | Existing auth, authorization, audit, approval, support-intent, safe-error, logging, and shared kernel foundations. |
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/` | Homeowner, property, billing account, and object authorization facts consumed by UOW-05. |
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/` | Payment method configuration, receipt numbering metadata, rounding rules, and template references consumed by UOW-05. |
| `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/` | Issued invoice source records, invoice open-amount input facts, and invoice query models consumed by UOW-05 allocation. |

## NFR Assessment Scope

### In Scope

- Performance targets for proof submission, proof review, payment posting, allocation calculation, receipt lookup, credit ledger reads, and reversal/correction review.
- Scalability assumptions for first-scope HOA payment volume and later growth.
- Transactional reliability for posting, allocation, credit creation, receipt numbering, receipt snapshots, balance-impact facts, audit, and approval linkage.
- Concurrency controls for duplicate payment review, allocation overrun prevention, credit application, reversal uniqueness, and receipt numbering.
- Availability and fail-closed behavior when UOW-02, UOW-03, or UOW-04 source facts are missing or ambiguous.
- Security and authorization requirements for staff, Treasurer, Board Member, and homeowner payment/receipt access.
- PII and financial data minimization for logs, errors, Board Member reads, and duplicate-review surfaces.
- Decimal precision and deterministic allocation requirements.
- Durability requirements for source records, receipt snapshots, reversal facts, correction facts, support intents, and audit references.
- Accessibility and usability requirements for homeowner proof submission and staff payment workflows.
- Observability requirements for payment proof, posting, allocation, duplicate review, receipt numbering, reversals, corrections, denied access, and support intents.
- PBT and example-test requirements for UOW-05 financial invariants.

### Out of Scope

- NFR design patterns. These belong to NFR Design.
- Infrastructure topology and deployment mappings. These belong to Infrastructure Design.
- Application code, migrations, API handlers, and tests. These belong to Code Generation.
- Invoice creation, penalty creation, report/export generation, concrete file storage, PDF rendering, SMTP delivery, retry workers, and import processing.

## NFR Requirements Checklist

- [x] Read UOW-05 Functional Design artifacts.
- [x] Read NFR Requirements rule details.
- [x] Confirm Security Baseline and Property-Based Testing extensions remain enabled.
- [x] Identify UOW-05 NFR risks and stack decisions.
- [x] Create this NFR Requirements plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory.
- [x] Generate `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/nfr-requirements/nfr-requirements.md`.
- [x] Generate `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/nfr-requirements/tech-stack-decisions.md`.
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
What first-scope payment volume should UOW-05 assume?

A) Same first-scope HOA posture as prior financial units: up to 25 operational users, up to 2,000 properties, low-to-moderate daily payment proof volume, month-end spikes, and paginated staff review (recommended)
B) Design immediately for national payment processor scale with distributed event streaming
C) Defer payment volume assumptions until Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What performance target should apply to homeowner payment proof submission?

A) Submit validated proof metadata within p95 1 second under first-scope load, excluding UOW-08 file upload/storage time, with safe duplicate-risk feedback where available (recommended)
B) No target because payment proof is asynchronous
C) Allow submission to wait until all downstream receipt workflows complete
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
What performance target should apply to staff proof review and payment lists?

A) Protected list/detail queries p95 under 500 ms for first-scope data, with pagination, filters, server-side sorting, and no full-table browser loads (recommended)
B) Load all payment history into the browser for staff convenience
C) No target until production data exists
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
What performance and reliability target should apply to payment posting?

A) Single-payment posting p95 under 2 seconds under first-scope load, with transactional creation of payment, allocations, credits, receipt, balance-impact facts, and audit; batch posting may return per-payment results (recommended)
B) Post payments asynchronously without immediate success/failure detail
C) Allow partial commits and repair failures manually
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
What concurrency controls should protect posting, allocation, credits, reversals, and receipt numbering?

A) Use PostgreSQL transactions, unique constraints/indexes, row-level or advisory locking where needed, and revalidation inside the transaction so duplicate posts, over-allocation, duplicate credit application, duplicate reversal, and duplicate receipt numbers cannot occur under concurrent requests (recommended)
B) Rely on frontend disabling and staff procedures
C) Accept occasional duplicates and correct them in reports
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
How should UOW-05 handle missing or ambiguous UOW-02/UOW-03/UOW-04 source facts?

A) Fail closed with safe reason-coded errors; do not post payments, allocate, create receipts, apply credits, reverse, or correct until source facts are valid and resolvable (recommended)
B) Use the closest available fact and warn staff later
C) Create placeholder records for later cleanup
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
What durability requirement should apply to UOW-05 financial source records?

A) Payment, allocation, credit, receipt, reversal, correction, balance-impact facts, snapshots, approval references, and audit references must be durable in PostgreSQL and included in encrypted backup/restore controls (recommended)
B) Reconstruct receipts and allocations from logs only
C) Store only current account balance and discard detailed source records
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
What security model should UOW-05 use?

A) Backend route, role, object/scope authorization, homeowner isolation, Board Member read-only PII minimization, Treasurer approval for reversals/corrections where required, safe errors, and denial audit/security events through UOW-01 contracts (recommended)
B) Frontend role hiding is sufficient
C) Any authenticated staff user can post, reverse, and correct payments
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
How should sensitive payment and proof data be logged?

A) Structured logs may include correlation ID, payment/proof/receipt IDs, action, status, safe failure code, and counts, but must not log full homeowner PII, full proof payloads, attachment contents, payment account details, or email recipient payloads (recommended)
B) Log full proof and payment payloads for debugging
C) Do not log payment operations at all
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
What precision and arithmetic requirement should UOW-05 carry forward?

A) Use decimal-safe calculation helpers and integer minor units or validated decimal representations for payments, allocations, credits, receipts, reversals, and corrections; never use JavaScript floating point for financial amount logic (recommended)
B) Use JavaScript number and round at display time
C) Store amounts as unvalidated strings
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 11
What database/query approach should UOW-05 use?

A) PostgreSQL with typed source-record tables, indexed duplicate-risk fields, indexed proof/payment/receipt statuses, indexed billing account/property/invoice links, unique receipt-number constraints, and JSON only for bounded snapshot metadata where structured columns are not justified (recommended)
B) Store payments and receipts only as JSON documents in one table
C) Add a separate search engine for payment lists immediately
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 12
How should payment proof attachment and receipt document/email reliability be handled?

A) UOW-05 records proof attachment references/intents and receipt document/email intents through UOW-01 support contracts; support failure must not roll back a valid posted payment, and UOW-08 owns file storage, rendering, delivery, and retries (recommended)
B) UOW-05 directly stores proof files, renders PDFs, and sends emails synchronously
C) Exclude proof attachment and receipt support intent state from UOW-05
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 13
What validation stack should UOW-05 use?

A) Shared TypeScript domain validators plus Zod request schemas, aligned with existing shared-kernel and UOW-02/UOW-03/UOW-04 patterns (recommended)
B) Controller-only validation without shared domain helpers
C) Database constraints only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 14
What PBT requirement should UOW-05 implement later?

A) `fast-check` PBT for allocation conservation, open amount limits, credit remainder correctness, reversal restoration, receipt number uniqueness, duplicate payment keys, and source-record immutability (recommended)
B) PBT only for receipt numbering
C) No PBT because staff reviews payments
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 15
What accessibility/usability requirement should apply to UOW-05 frontend screens?

A) WCAG 2.2 AA-oriented forms/tables, keyboard-accessible proof review/posting/allocation/credit workflows, clear validation summaries, stable `data-testid` values, no JSON-only normal staff workflow, and visible separation of proof, payment, receipt, credit, reversal, and correction states (recommended)
B) Accessibility deferred until homeowner portal work
C) JSON editor is sufficient for MVP
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 16
What observability signals should UOW-05 produce?

A) Metrics/log events for proof submitted/reviewed/rejected/cancelled, duplicate candidates and overrides, posting success/failure, allocation failures, credit creation/application, receipt numbering conflicts, reversal/correction requests and decisions, denied access, and support intent requests (recommended)
B) Only generic API request metrics
C) No UOW-05-specific observability
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 17
What auditability and retention posture should UOW-05 use?

A) Financial source records, approvals, reasons, actor IDs, timestamps, correlation IDs, and audit references must be retained immutably according to the platform retention posture; destructive deletion is prohibited for posted financial records (recommended)
B) Allow staff to delete payment history after correction
C) Retain only receipts and discard proof/allocation details
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 18
What tech stack posture should UOW-05 use?

A) Continue the existing TypeScript monorepo stack: NestJS API, Prisma/PostgreSQL, shared TypeScript/Zod contracts, Next.js frontend, Jest and fast-check tests, and UOW-01 audit/approval/support contracts (recommended)
B) Introduce a separate payment microservice for UOW-05 immediately
C) Replace Prisma with raw SQL for all UOW-05 work
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant for NFR Requirements | NFR artifacts define backend authorization, homeowner isolation, Board Member PII minimization, Treasurer approval, denial audit, safe logging, support-intent boundaries, and retention. |
| Property-Based Testing | Compliant for NFR Requirements | NFR artifacts define PBT requirements for allocation conservation, open amount limits, credit remainder, reversal restoration, receipt number uniqueness, duplicate keys, and source-record immutability. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
