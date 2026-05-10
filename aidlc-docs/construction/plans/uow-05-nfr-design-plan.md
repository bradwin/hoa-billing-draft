# UOW-05 NFR Design Plan

## Unit

- **Unit ID**: UOW-05
- **Unit Name**: Payments, Allocations, Credits, Receipts, and Financial Corrections
- **Stage**: NFR Design, Planning
- **Current Gate**: Waiting for NFR Design approval

## Purpose

Translate approved UOW-05 NFR Requirements into concrete non-functional patterns and logical components before Infrastructure Design and Code Generation. UOW-05 creates financially material source records, so the design must make transaction boundaries, duplicate prevention, allocation locks, credit safety, receipt numbering uniqueness, reversal idempotency, fail-closed validation, authorization, audit, observability, support-intent isolation, and PBT explicit.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/nfr-requirements/nfr-requirements.md` | Approved UOW-05 NFR requirements. |
| `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/nfr-requirements/tech-stack-decisions.md` | Approved UOW-05 stack decisions. |
| `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/functional-design/` | UOW-05 business logic, rules, entities, and frontend components. |
| `aidlc-docs/construction/uow-01-platform-foundation/` | Foundation patterns for auth, authorization, approval, audit, safe errors, support intents, logging, validation, and testing. |
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/` | Homeowner, property, billing account, ownership, and object authorization facts. |
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/` | Payment method, receipt numbering, rounding, and template metadata. |
| `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/` | Issued invoice records, open-amount input facts, invoice status, and invoice query models. |

## NFR Design Scope

### In Scope

- Payment proof submission and review patterns.
- Payment posting transaction, allocation, credit creation, receipt creation, balance-impact, and audit patterns.
- PostgreSQL-backed duplicate payment, over-allocation, credit application, reversal uniqueness, and receipt-numbering patterns.
- Fail-closed validation and safe error patterns for UOW-02, UOW-03, and UOW-04 facts.
- Decimal-safe amount policy and deterministic allocation patterns.
- Durable proof attachment reference and receipt support-intent patterns without concrete storage, rendering, or SMTP.
- Backend authorization, object/scope authorization, approval, PII minimization, and audit/security event patterns.
- Structured logging, metrics/event, redaction, and observability patterns.
- Staff and homeowner-safe frontend accessibility and workflow patterns.
- PBT generator, state model, seed replay, shrinking, and regression-capture patterns.
- Logical components needed to implement the above.

### Out of Scope

- Concrete database migrations, code, DTO implementations, generated tests, and API handlers. These belong to Code Generation.
- Concrete infrastructure resource definitions, TLS, backup commands, network policy, and deployment topology. These belong to Infrastructure Design.
- Invoice creation, penalty creation, statements, reports, exports, PDF rendering, SMTP delivery, file storage, and import processing.

## NFR Design Checklist

- [x] Read UOW-05 NFR Requirements artifacts.
- [x] Read UOW-05 Functional Design artifacts.
- [x] Read NFR Design rule details.
- [x] Confirm Security Baseline and Property-Based Testing extensions are enabled.
- [x] Identify UOW-05 NFR design patterns and logical component decisions.
- [x] Create this NFR Design plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory.
- [x] Generate `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/nfr-design/nfr-design-patterns.md`.
- [x] Generate `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/nfr-design/logical-components.md`.
- [x] Verify Security Baseline compliance summary.
- [x] Verify Property-Based Testing compliance summary.
- [x] Verify content validation before artifact creation.
- [x] Present the standardized NFR Design completion message.

## Required NFR Design Artifacts

After this plan is answered and validated, generate:

- `nfr-design-patterns.md`: Proof, posting, allocation, credit, receipt, reversal, correction, validation, precision, authorization, audit, support-intent, observability, frontend, and PBT patterns.
- `logical-components.md`: Logical components, responsibilities, dependencies, request flows, data responsibilities, and NFR responsibility mapping.

## NFR Design Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

### Question 1
What payment proof submission pattern should UOW-05 use?

A) Synchronous metadata validation and proof record creation through server-authorized API, with attachment reference/intent captured for later UOW-08 storage and safe duplicate-risk feedback where available (recommended)
B) Browser-only draft proof storage until staff review
C) Direct file-storage workflow inside UOW-05
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What payment posting transaction pattern should UOW-05 use?

A) Single-payment posting transaction that revalidates source facts, duplicate risk, open amounts, allocation totals, credit remainder, receipt numbering, balance-impact facts, and audit before commit; batch posting returns per-payment results (recommended)
B) One all-or-nothing transaction for all selected payments in a batch
C) Split payment, allocation, receipt, and audit into independent commits
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
What duplicate payment guard pattern should UOW-05 use?

A) Service guard plus database-backed indexed duplicate-risk lookup using billing account, payment method, external reference, amount, and payment date; active proofs are `Submitted` or `UnderReview`; override requires elevated audit (recommended)
B) Service-only duplicate search without persistence support
C) No duplicate guard because identical payments can be legitimate
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
What allocation concurrency pattern should UOW-05 use?

A) Recompute eligible open amounts inside the posting/application transaction and lock affected invoice, component, payment, or credit rows where needed so concurrent allocation cannot overrun open amounts (recommended)
B) Trust precomputed open amounts from the review screen
C) Allow over-allocation and correct it later through reports
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
What credit application pattern should UOW-05 use?

A) Treat credits as immutable source records with derived availability; every application creates linked application facts, validates available credit inside a transaction, and never mutates original credit amount in place (recommended)
B) Store and decrement one mutable available credit field only
C) Treat credits as negative payments without separate source records
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
What receipt numbering pattern should UOW-05 use?

A) PostgreSQL transaction with row-level or advisory lock per receipt numbering scope, unique receipt-number constraint, and stable conflict error on race; receipt numbers are assigned only after posting succeeds (recommended)
B) Generate receipt numbers from current timestamp
C) Let UOW-08 allocate receipt numbers when rendering PDFs
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
What reversal idempotency pattern should UOW-05 use?

A) Approval-backed reversal command with unique reversal constraint per posted payment, transactionally linked reversal facts, equal-and-opposite balance-impact facts, and safe duplicate-command handling (recommended)
B) Directly update the posted payment row to `Reversed` without linked facts
C) Allow repeated reversals as long as staff enters a reason
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
What correction pattern should UOW-05 use?

A) Approval-backed correction command that creates linked correction source records and balance-impact facts, rejects direct source-record edits, and supports approved import/opening-balance owner inputs through UOW-05 services (recommended)
B) Allow staff to edit original records with audit
C) Defer corrections to UOW-07 reports
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
What fail-closed validation pattern should UOW-05 use?

A) Validation gateway that resolves UOW-02 authorization facts, UOW-03 payment/numbering metadata, and UOW-04 invoice/open-amount facts, returning typed success or safe failure codes that block posting or correction on unresolved facts (recommended)
B) Best-effort validation that fills missing facts from recent records
C) Staff override directly in payment forms
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
What decimal and amount pattern should UOW-05 use?

A) Central payment calculation policy using shared decimal-safe helpers, integer minor units or validated decimals, and deterministic allocation/credit/reversal balance-impact calculations (recommended)
B) JavaScript floating point internally with formatting at the UI
C) Store all amounts as text and avoid calculation helpers
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 11
What support-intent pattern should UOW-05 use?

A) Durable support-intent adapter that records proof attachment references/intents and receipt document/email intents through UOW-01 contracts; failures are visible but never invalidate posted payments (recommended)
B) Store files, render PDFs, and send SMTP email directly in UOW-05
C) Do not model proof attachment or receipt intents until UOW-08
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 12
What security and authorization pattern should UOW-05 use?

A) UOW-01 actor context, backend route guards, object/scope policies for payment/proof/receipt/credit access, Treasurer approval checks, safe denials, PII minimization, and audit/security events (recommended)
B) Frontend route protection plus authenticated API calls
C) Broad staff access to all payment reads and mutations
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 13
What observability and logging pattern should UOW-05 use?

A) Structured metrics/events for proof lifecycle, duplicate candidates/overrides, posting, allocation, credits, receipt numbering, reversal/correction approvals, denied access, support intents, and safe identifiers with redacted PII/payloads (recommended)
B) Full proof, payment, and homeowner payload logs for debugging
C) Generic HTTP logs only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 14
What frontend NFR pattern should UOW-05 use?

A) Server-authorized data loading, paginated tables, keyboard-accessible proof/posting/allocation/credit/reversal/correction flows, safe validation summaries, stable `data-testid` values, and clear separation of proof/payment/receipt/credit/reversal/correction states (recommended)
B) Single JSON editor for payment records
C) Accessibility deferred to UOW-08 portal integration
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 15
What PBT design pattern should UOW-05 use?

A) Centralized `fast-check` generators and state models for payment amounts, allocation targets, credit availability, duplicate keys, receipt numbering scopes, reversal commands, and immutable source-record transitions with seed replay and shrinking capture (recommended)
B) Ad hoc primitive generators in individual tests only
C) PBT only for receipt numbering
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 16
What logical component decomposition should UOW-05 use?

A) Separate logical components for PaymentProofIntake, PaymentValidationGateway, DuplicatePaymentGuard, PaymentPostingCoordinator, AllocationPolicy, CreditLedgerService, ReceiptNumberAllocator, ReceiptSnapshotWriter, ReversalCoordinator, FinancialCorrectionService, BalanceImpactPublisher, SupportIntentAdapter, AuthorizationPolicy, AuditAdapter, ObservabilityAdapter, FrontendInteraction, and PBTGenerators (recommended)
B) One large PaymentService containing all behavior
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
| Security Baseline | Compliant for NFR Design | NFR Design artifacts define backend authorization, object/scope policies, Treasurer approval checks, safe denials, PII minimization, audit/security events, safe logging, and support-intent boundaries. |
| Property-Based Testing | Compliant for NFR Design | NFR Design artifacts define `fast-check` generators and state models for allocation, credits, duplicate keys, receipt numbering, reversals, and immutability. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
- All answers are valid `A` choices.
- No contradictory or ambiguous answers were detected.
- No follow-up questions are required.
