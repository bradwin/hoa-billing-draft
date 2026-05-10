# UOW-05 Functional Design Plan

## Unit

- **Unit ID**: UOW-05
- **Unit Name**: Payments, Allocations, Credits, Receipts, and Financial Corrections
- **Stage**: Functional Design, Planning
- **Current Gate**: Waiting for Functional Design approval

## Purpose

Define the business logic, domain model, business rules, validation behavior, and frontend design for UOW-05 before NFR Requirements, NFR Design, Infrastructure Design, and Code Generation. UOW-05 is financially sensitive because it owns posted payments, payment allocation, credits, receipts, reversals, financial correction coordination, and payment-side Account Balance impact.

Ambiguity in this unit is treated as dangerous. Payment posting, allocation, credits, receipts, and reversals must be explicit before generation because later penalties, statements, reports, imports, and portal reads depend on these records being immutable and reconcilable.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/inception/application-design/unit-of-work.md` | UOW-05 purpose, responsibilities, out-of-scope boundaries, and construction notes. |
| `aidlc-docs/inception/application-design/unit-of-work-story-map.md` | UOW-05 owns US-015, US-016, US-017, US-018, US-019, US-044, and US-045. |
| `aidlc-docs/inception/application-design/unit-of-work-dependency.md` | UOW-05 depends on UOW-01, UOW-02, UOW-03, and UOW-04 and supplies payment, allocation, credit, receipt, reversal, correction, and balance-impact source records to later units. |
| `aidlc-docs/construction/uow-01-platform-foundation/` | Actor context, authorization, audit, approval workflow, support-service contracts, and safe error patterns. |
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/` | Homeowner, property, billing account, ownership, object authorization, and read models used to validate payment proof ownership and posting targets. |
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/` | Payment method configuration, receipt numbering metadata, rounding rules, and template references consumed by UOW-05. |
| `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/` | Issued invoice source records, invoice open-amount input facts, invoice status, and invoice query models consumed by allocation and receipt workflows. |

## Functional Design Scope

### In Scope

- Homeowner payment proof intake against authorized billing accounts or invoices.
- Staff verification, rejection, and posting of payment proofs.
- Direct staff payment entry where permitted by role and audit.
- Payment source records, posted payment records, allocation records, overpayment credit records, receipt source records, receipt numbers, reversal records, and correction records.
- Default automatic allocation to oldest eligible unpaid invoices, with explicit manual allocation validation.
- Allocation order within an invoice, including penalties and fees before dues when applicable.
- Credit creation, credit application, credit reversal, and credit visibility rules.
- Receipt generation after posted payments, using UOW-03 numbering metadata and UOW-08 support intents for later PDF/email handling.
- Payment reversal with approval, reason, immutable linked records, allocation reversal, receipt invalidation semantics, and audit.
- Generic approved financial correction coordination for adjustments without mutating prior source records.
- Account Balance impact facts for posted payments, allocations, credits, receipts, reversals, and adjustments.
- Staff and homeowner-safe frontend components for payment proof, verification, allocation, receipts, reversal requests, corrections, and history.
- PBT candidates for allocation totals, nonnegative open balances, credit remainder, reversal restoration, receipt number uniqueness, and immutable history.

### Out of Scope

- Invoice creation, invoice lines, invoice numbering, invoice status lifecycle, and issued invoice snapshots owned by UOW-04.
- Penalty creation, delinquency classification, penalty waiver, and reminder eligibility owned by UOW-06.
- Statements, reports, dashboards, exports, and reconciliation report output owned by UOW-07.
- Concrete file storage for payment proof uploads, receipt PDF rendering, SMTP delivery, retry workers, and homeowner portal composition owned by UOW-08.
- Mutable account-balance source-of-truth records. UOW-05 may create balance-impact source facts only.

## Functional Design Checklist

- [x] Read UOW-05 unit definition.
- [x] Read UOW-05 assigned stories.
- [x] Read Functional Design rule details.
- [x] Confirm Security Baseline and Property-Based Testing extensions remain enabled.
- [x] Identify UOW-05 business logic risks and integration boundaries.
- [x] Create this Functional Design plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory.
- [x] Generate `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/functional-design/business-logic-model.md`.
- [x] Generate `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/functional-design/business-rules.md`.
- [x] Generate `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/functional-design/domain-entities.md`.
- [x] Generate `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/functional-design/frontend-components.md`.
- [x] Verify Security Baseline compliance summary.
- [x] Verify Property-Based Testing compliance summary and PBT candidate properties.
- [x] Verify content validation before artifact creation.
- [x] Present the standardized Functional Design completion message.

## Required Functional Design Artifacts

After this plan is answered and validated, generate:

- `business-logic-model.md`
- `business-rules.md`
- `domain-entities.md`
- `frontend-components.md`

## Functional Design Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

### Question 1
What payment proof state model should UOW-05 use for MVP?

A) Use `Submitted`, `UnderReview`, `Rejected`, `Posted`, and `Cancelled`; only submitted or under-review proofs can be rejected, cancelled, or posted, and posted is terminal except through linked reversal records (recommended)
B) Use only `Pending`, `Approved`, and `Rejected`
C) Store free-form proof statuses managed by staff
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What payment posting state model should UOW-05 use for posted payment records?

A) Use immutable posted payment records with lifecycle states `Posted` and `Reversed`; posted records are never edited in place, and reversal creates linked reversal and balance-impact records (recommended)
B) Allow posted payment records to be edited until month-end close
C) Treat payment proof approval itself as the posted payment record with no separate payment source record
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
How should homeowner payment proof be scoped?

A) Require the proof to identify an authorized billing account, property, homeowner, amount, payment date, payment method, reference number when required by resolved payment-method or proof-channel configuration, and optional target invoice references; UOW-08 later owns file storage for proof attachments (recommended)
B) Allow proof submission with amount and note only
C) Require every proof to target exactly one issued invoice
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
How should UOW-05 validate staff posting of a payment proof?

A) Revalidate homeowner, property or billing account authorization, proof state, payment method configuration, positive amount, duplicate reference risk, target invoice eligibility, allocation totals, and actor authority immediately before posting (recommended)
B) Trust the data captured at proof submission and only check actor authority
C) Allow posting even when allocation is invalid, then repair later through reports
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
What duplicate payment guard should UOW-05 enforce?

A) Block or require elevated override review when the same billing account, payment method, external reference, amount, and payment date appear in a non-reversed posted payment or active proof, where active proof means `Submitted` or `UnderReview`; override must be audited with reviewed candidate IDs and reason (recommended)
B) Do not check duplicates because homeowners may pay identical amounts
C) Enforce a global unique payment reference number across all accounts
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
What default automatic allocation order should UOW-05 use across invoices?

A) Allocate to oldest eligible issued invoices first by due date, then issue date, then invoice number; apply only to non-voided invoice source records with positive open amount (recommended)
B) Allocate to newest invoices first
C) Allocate proportionally across all open invoices
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
What allocation order should apply within an invoice?

A) Apply eligible penalties and fees first, then dues or regular invoice charges, then other manual charges, while respecting available open amount facts from source records; UOW-06 later supplies penalty source records (recommended)
B) Apply dues first, then penalties and fees
C) Apply in invoice line display order only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
How should manual allocation be validated?

A) Require staff actor, reason, exact allocation targets, invoice eligibility, nonnegative line or component open amounts, total allocations equal payment amount less explicit credit remainder, and audit (recommended)
B) Allow staff to allocate any amount to any invoice and let reports identify errors
C) Allow manual allocation only when no open invoices exist
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
How should overpayments be represented?

A) Create an explicit credit source record for the unapplied remainder tied to the billing account and property where applicable; credits are immutable source records consumed by later allocation and reporting flows (recommended)
B) Increase a mutable account-balance field
C) Refund automatically outside the system with no credit record
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
How should existing credits be applied to invoices?

A) Allow staff-managed credit application with reason and audit, or automatic application only when a later approved rule enables it; each application creates linked credit-application records and never mutates the original credit amount in place (recommended)
B) Automatically apply all credits to the newest invoice without staff review
C) Treat credits as negative payments with no separate credit entity
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 11
When should receipt records and receipt numbers be created?

A) Create receipt records and assign immutable receipt numbers transactionally after payment posting succeeds; rejected proofs and drafts never consume receipt numbers, and reversed receipt numbers are not reused (recommended)
B) Reserve receipt numbers when proof is submitted
C) Generate receipt numbers only when a PDF is rendered by UOW-08
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 12
What should a receipt snapshot include?

A) Snapshot payment ID, receipt number, payer, billing account, property if applicable, amount, payment date, posting date, payment method, external reference, allocation summary, credit remainder, actor, configuration references, and source proof reference where applicable (recommended)
B) Store only receipt number, amount, and current payment ID
C) Store only a generated PDF reference
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 13
How should payment reversals work?

A) Require approval, reason, actor, linked posted payment, linked allocations, linked receipt, reversal effective date, immutable reversal records, balance-impact reversal facts, and audit; posted payment and receipt history remain visible (recommended)
B) Delete the posted payment, allocations, and receipt after approval
C) Allow any staff member to mark payments reversed without approval
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 14
What generic financial correction behavior should UOW-05 own?

A) Own approved adjustment/correction source records for payment, allocation, credit, receipt, and opening-balance correction impacts; corrections are linked, reasoned, audited, and never overwrite original source records (recommended)
B) Defer all correction and adjustment behavior to UOW-07 reports
C) Allow direct editing of any financial source record with audit
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 15
How should receipt document and email behavior be represented in UOW-05?

A) UOW-05 records receipt document/email intent requests against receipt snapshots through UOW-01 support contracts; UOW-08 later renders PDFs, stores files, sends emails, retries failures, and enforces document downloads (recommended)
B) UOW-05 renders receipt PDFs and sends SMTP emails directly
C) UOW-05 excludes all receipt document/email intent state
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 16
What object authorization should apply to payment, credit, and receipt reads?

A) Staff roles read according to permissions, Board Member access is read-only and PII-minimized, and homeowners can read only records tied to their authorized billing accounts, properties, homeowner profile, or submitted proofs (recommended)
B) Any authenticated user can read all payment and receipt records
C) Only System Administrators can read payment records
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 17
Which frontend surfaces should UOW-05 include?

A) Include homeowner payment proof submission/status, staff proof review, posting/allocation workspace, manual payment entry, credit ledger/application, receipt detail/history, reversal request/status, correction request/status, and document/email intent status (recommended)
B) Include staff-only proof review and posting screens; portal surfaces wait for UOW-08
C) Provide API-only workflows with no frontend in this unit
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 18
Which properties should receive property-based tests?

A) Allocation totals equal posted payment amount minus credit remainder, allocations never exceed eligible open amounts, credit remainder equals overpayment, reversal restores observable balance impact, receipt numbers are unique, and immutable source records are not edited in place (recommended)
B) Use example-based tests only
C) Apply PBT only to receipt numbering
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant for Functional Design | Functional Design includes homeowner object authorization, staff authority, Board Member PII minimization, duplicate override audit, approval for reversals, support-intent boundaries, and no direct document/email implementation. |
| Property-Based Testing | Compliant for Functional Design | Functional Design includes PBT candidates for allocation totals, open amount limits, credit remainder, reversal balance impact, receipt number uniqueness, and immutable history properties. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
