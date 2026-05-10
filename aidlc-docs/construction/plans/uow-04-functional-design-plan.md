# UOW-04 Functional Design Plan

## Unit

- **Unit ID**: UOW-04
- **Unit Name**: Invoice Lifecycle and Invoice Source Records
- **Stage**: Functional Design, Planning
- **Current Gate**: Waiting for Functional Design approval

## Purpose

Define the business logic, domain model, rules, validation behavior, and frontend design for invoice lifecycle and invoice source records before NFR Requirements, NFR Design, Infrastructure Design, and Code Generation. UOW-04 is financially sensitive because it creates invoice source records, immutable issued invoice snapshots, invoice numbers, and invoice balance inputs consumed by payment, penalty, statement, report, document, email, and portal units.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/inception/application-design/unit-of-work.md` | UOW-04 purpose, responsibilities, out-of-scope boundaries, and construction notes. |
| `aidlc-docs/inception/application-design/unit-of-work-story-map.md` | UOW-04 owns US-011, US-012, US-013, and US-014. |
| `aidlc-docs/inception/application-design/unit-of-work-dependency.md` | UOW-04 depends on UOW-01, UOW-02, and UOW-03 and supplies invoice source records to later units. |
| `aidlc-docs/inception/requirements/requirements.md` | Invoice generation, issuance, duplicate prevention, PDFs, email, audit, and financial correctness requirements. |
| `aidlc-docs/construction/uow-01-platform-foundation/` | UOW-01 audit, approval, authorization, numbering configuration consumption, and support-service contracts. |
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/` | UOW-02 billable property validation, ownership responsibility, lot area, billing account identity, and read models. |
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/` | UOW-03 resolved rates, cycles, due dates, grace-period metadata, rounding, charge types, numbering metadata, and template references. |

## Functional Design Scope

### In Scope

- Recurring draft invoice batch generation from UOW-02 billable property validation and UOW-03 resolved configuration.
- Billing exception records for properties that cannot be invoiced.
- Invoice source records, invoice line source records, and immutable issued invoice snapshots.
- Manual draft invoices and manual line-item validation, including manual tax-like charge validation through UOW-03 configuration.
- Draft review, issue, cancel, void, and reissue workflows.
- Issued invoice number assignment at issuance time only.
- Invoice status, invoice totals, open invoice balance input facts, and query models consumed by UOW-05 through UOW-08.
- Audit and approval rules for invoice-sensitive actions.
- Document and email intent queuing through UOW-01 support contracts for later UOW-08 implementation.
- Staff and homeowner-safe frontend components for invoice generation, review, issue, manual invoice creation, invoice detail, and PDF/email intent status.
- PBT candidates for duplicate prevention, invoice total correctness, snapshot immutability, and issued numbering uniqueness.

### Out of Scope

- Payment proof intake, payment posting, allocations, credits, receipts, reversals, and financial corrections owned by UOW-05.
- Penalty application, delinquency, waivers, and reminders owned by UOW-06.
- Statements, dashboards, formal reports, exports, and reconciliation reports owned by UOW-07.
- Concrete PDF rendering, file storage, SMTP delivery, retry workers, and portal document download implementation owned by UOW-08.
- Mutable account-balance source-of-truth tables. UOW-04 may create invoice source records and invoice balance input facts only.

## Functional Design Checklist

- [x] Read UOW-04 unit definition.
- [x] Read UOW-04 assigned stories.
- [x] Read Functional Design rule details.
- [x] Confirm Security Baseline and Property-Based Testing extensions remain enabled.
- [x] Identify UOW-04 business logic risks and integration boundaries.
- [x] Create this Functional Design plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory.
- [x] Generate `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/functional-design/business-logic-model.md`.
- [x] Generate `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/functional-design/business-rules.md`.
- [x] Generate `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/functional-design/domain-entities.md`.
- [x] Generate `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/functional-design/frontend-components.md`.
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
Which billing date should UOW-04 pass to UOW-02 billable-property validation for recurring draft invoice generation?

A) Use the billing period start date as the `validationDate`; UOW-04 documents this as the recurring responsibility control date for MVP, and later proration or transfer-period billing requires approved scope (recommended)
B) Use the billing period end date
C) Use the invoice issue date
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Use the billing period start date as the `validationDate`. UOW-04 shall document this as the recurring responsibility control date for MVP. Later proration, mid-period ownership transfer billing, or alternate responsibility-date logic requires approved future scope.

### Question 2
How should UOW-04 select UOW-03 rate, rounding, charge type, due date, and numbering configuration for recurring invoices?

A) Resolve configuration by billing period start date for rate/rounding/charge rules, compute due date from the resolved due-date rule, and resolve numbering metadata only when issuing invoices (recommended)
B) Resolve all configuration by draft generation date
C) Resolve all configuration by invoice issue date
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Resolve configuration by billing period start date for rate, rounding, and charge rules. Compute due date from the resolved due-date rule. Resolve numbering metadata only when issuing invoices. Draft generation must not consume issued invoice numbers.

### Question 3
What duplicate prevention key should block recurring draft generation?

A) Prevent more than one non-voided recurring invoice for the same property, responsible billing account, charge type, and billing period; authorized override can create a replacement only through an explicit correction/reissue workflow (recommended)
B) Prevent duplicates by property and billing period only
C) Allow duplicate drafts and rely on staff review to remove extras
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Prevent more than one non-voided recurring invoice for the same property, responsible billing account, charge type, and billing period. Authorized correction or replacement must use an explicit correction/reissue workflow and must preserve audit and linkage to the prior invoice source record.

### Question 4
How should invalid billable properties be handled during recurring generation?

A) Do not create an invoice; create a billing exception record with property, validationDate, failure reason, correlation ID, and source validation details for later review/reporting (recommended)
B) Create a zero-amount invoice with an exception note
C) Skip the property silently
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Do not create an invoice for invalid billable properties. Create a billing exception record with property, validationDate, failure reason, correlation ID, and source validation details for later review and reporting. Skipping silently is not allowed.

### Question 5
What invoice status model should UOW-04 use for MVP?

A) `Draft`, `Issued`, `Cancelled`, `Voided`, and `Reissued`, where issued financial history remains immutable and terminal statuses require reason and audit (recommended)
B) `Draft`, `Issued`, and `Paid` only
C) A free-form status string managed by staff
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Use `Draft`, `Issued`, `Cancelled`, `Voided`, and `Reissued`. Issued financial history remains immutable. Terminal statuses require reason and audit. Payment-related states such as `Paid` or `PartiallyPaid` are not UOW-04 invoice lifecycle statuses and should be derived later from UOW-05 payment/allocation facts.

### Question 6
When should invoice numbers be assigned?

A) Assign immutable invoice numbers only during issuance in one transaction; draft invoices use internal IDs and never consume issued invoice numbers (recommended)
B) Assign invoice numbers when drafts are generated
C) Reserve invoice numbers when a batch is opened for review
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Assign immutable invoice numbers only during issuance in one transaction. Draft invoices use internal IDs and must never consume issued invoice numbers. Voided or cancelled issued invoice numbers must not be reused.

### Question 7
How should issuing a batch work?

A) Staff may issue selected valid draft invoices from a reviewed batch; each issued invoice is validated again, numbered transactionally, snapshotted, and audited, while invalid drafts remain draft or exceptioned (recommended)
B) The whole batch must issue all-or-nothing
C) Draft generation should automatically issue every invoice
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Staff may issue selected valid draft invoices from a reviewed batch. Each selected draft invoice must be revalidated before issuance, numbered transactionally, snapshotted, and audited. Invalid drafts remain in draft state or become exceptioned according to the validation result.

### Question 8
What must be snapshotted on issued invoice lines?

A) Property, billing account, responsible homeowner, billing period, charge type, lot area, rate, quantity/basis, rounding rule, due date, line amount, tax-like/manual metadata, configuration version references, and calculation inputs used (recommended)
B) Only the final line amount and description
C) Only references to current UOW-02 and UOW-03 records
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Issued invoice lines must snapshot property, billing account, responsible homeowner, billing period, charge type, lot area, rate, quantity or basis, rounding rule, due date, line amount, tax-like/manual metadata, configuration version references, and calculation inputs used. Issued invoices must remain reproducible even if UOW-02 or UOW-03 data changes later.

### Question 9
How should UOW-04 calculate recurring dues line amounts?

A) Use UOW-02 lot area facts and UOW-03 resolved rate/rounding configuration with decimal-safe arithmetic, snapshot inputs and outputs, and never recalculate issued invoices after configuration changes (recommended)
B) Use JavaScript floating point and round at display time
C) Store the rate only and let UOW-05 calculate invoice amounts during payment allocation
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Calculate recurring dues line amounts using UOW-02 lot area facts and UOW-03 resolved rate and rounding configuration with decimal-safe arithmetic. Snapshot all inputs and outputs. Issued invoices must never be recalculated or mutated after later configuration, rate, lot area, ownership, or billing-account changes.

### Question 10
How should manual invoices be validated?

A) Require property/billing account, responsible homeowner, due date, at least one configured charge type, description, amount, reason, actor, audit, and manual tax-like eligibility from UOW-03 when applicable (recommended)
B) Allow staff to enter free-form line items without configured charge types
C) Allow manual invoices only for dues charges
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Manual invoices require property or billing account, responsible homeowner, due date, at least one configured charge type, description, amount, reason, actor, and audit. Manual tax-like lines are allowed only when the charge type is configured as manual-entry eligible and tax-like according to UOW-03 configuration.

### Question 11
How should cancel, void, and reissue be distinguished?

A) Draft cancellation can be staff-managed with reason and audit; issued void/reissue require approval, reason, immutable reversal linkage, and a new invoice source record when reissued (recommended)
B) Any staff user can delete any invoice before payment
C) Issued invoices can be edited in place with audit only
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Draft cancellation can be staff-managed with reason and audit. Issued void/reissue actions require approval, reason, immutable reversal or supersession linkage, and a new invoice source record when reissued. Issued invoices must not be edited in place.

### Question 12
What balance-related facts may UOW-04 own?

A) UOW-04 owns invoice source records, invoice line amounts, invoice status, and invoice open-amount input facts for later balance derivation; it does not create payments, credits, penalties, adjustments, or a mutable account-balance source of truth (recommended)
B) UOW-04 owns the full account balance ledger including payments and penalties
C) UOW-04 stores only PDFs and leaves all financial values to later units
X) Other (please describe after [Answer]: tag below)

[Answer]: A. UOW-04 owns invoice source records, invoice line amounts, invoice status, issued invoice snapshots, and invoice open-amount input facts for later balance derivation. It does not create payments, credits, penalties, adjustments, or a mutable account-balance source of truth.

### Question 13
How should invoice PDF and email behavior be represented in UOW-04?

A) UOW-04 records document/email intent requests against issued invoice snapshots through UOW-01 support contracts; UOW-08 later renders PDFs, stores files, sends emails, retries failures, and enforces document downloads (recommended)
B) UOW-04 renders PDFs and sends SMTP emails directly
C) UOW-04 excludes all PDF/email-related state
X) Other (please describe after [Answer]: tag below)

[Answer]: A. UOW-04 records document and email intent requests against issued invoice snapshots through UOW-01 support contracts. UOW-08 later renders PDFs, stores files, sends emails, retries failures, and enforces document download behavior. UOW-04 does not directly render PDFs or send SMTP emails.

### Question 14
What object authorization should apply to invoice reads?

A) Staff roles read according to permissions, Board Member access is read-only and PII-minimized, and homeowners can read only invoices tied to their own authorized billing accounts/properties (recommended)
B) Any authenticated user can read all invoices
C) Only System Administrators can read invoices
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Staff roles may read invoices according to permissions. Board Member access is read-only and PII-minimized. Homeowners may read only invoices tied to their own authorized billing accounts, properties, or homeowner profile. All invoice reads must be server-authorized.

### Question 15
Which frontend surfaces should UOW-04 include?

A) Staff pages for recurring batch generation, exception review, draft review, issue action, manual invoice creation, invoice detail/history, void/reissue request status, and document/email intent status; homeowner-safe invoice detail is limited to authorized read models (recommended)
B) A single JSON editor for invoices and invoice lines
C) No frontend; invoices are managed through database rows only
X) Other (please describe after [Answer]: tag below)

[Answer]: A. UOW-04 should include staff pages for recurring batch generation, exception review, draft review, issue action, manual invoice creation, invoice detail/history, void/reissue request status, and document/email intent status. Homeowner-safe invoice detail must be limited to authorized read models.

### Question 16
Which properties should receive property-based tests?

A) Duplicate prevention, issued numbering uniqueness, invoice total equals line totals, snapshot immutability, decimal rounding stability, and void/reissue state transitions (recommended)
B) Only example-based tests are needed
C) Only frontend rendering needs tests
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Property-based tests should cover duplicate prevention, issued numbering uniqueness, invoice total equals line totals, snapshot immutability, decimal rounding stability, and void/reissue state transitions. These are financially sensitive invariants and should not rely only on example-based tests.

## Post-Answer Processing

After all `[Answer]:` tags are complete:

- Answers will be checked for blanks, invalid choices, contradictions, and vague wording.
- Follow-up questions will be added if any answer is ambiguous.
- If answers are clear, Functional Design artifacts will be generated directly from this plan and approved source context.

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant for planning | Questions require authorization, audit, approval boundaries, homeowner object isolation, Board Member read-only minimization, and support-service boundaries. |
| Property-Based Testing | Compliant for planning | Questions include explicit PBT candidates for UOW-04 financial and state invariants. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
