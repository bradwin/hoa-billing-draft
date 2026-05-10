# UOW-06 Functional Design Plan

## Unit

- **Unit ID**: UOW-06
- **Unit Name**: Penalties, Delinquency, Waivers, and Reminders
- **Stage**: Functional Design, Planning
- **Current Gate**: Waiting for Functional Design approval

## Purpose

Define the business logic, domain model, business rules, validation behavior, and frontend design for UOW-06 before NFR Requirements, NFR Design, Infrastructure Design, and Code Generation. UOW-06 is financially sensitive because it adds penalty and waiver impact to the derived account balance model and supplies delinquency and reminder facts consumed by reports, statements, dashboards, jobs, and portal views.

Ambiguity in this unit is dangerous. Penalty eligibility, duplicate prevention, waiver effects, aging buckets, and reminder eligibility must be explicit before generation because later UOW-07 reports and UOW-08 notifications will rely on these records as auditable source facts.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/inception/application-design/unit-of-work.md` | UOW-06 purpose, responsibilities, out-of-scope boundaries, and construction notes. |
| `aidlc-docs/inception/application-design/unit-of-work-story-map.md` | UOW-06 owns US-020, US-021, US-022, and US-023. |
| `aidlc-docs/inception/application-design/unit-of-work-dependency.md` | UOW-06 depends on UOW-01, UOW-03, UOW-04, and UOW-05 and supplies penalty, waiver, aging, and reminder eligibility facts to UOW-07 and UOW-08. |
| `aidlc-docs/construction/uow-01-platform-foundation/` | Actor context, authorization, audit, approval workflow, support-service contracts, and safe error patterns. |
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/` | Grace-period metadata and charge configuration consumed by penalty eligibility. |
| `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/` | Issued invoice source records, due dates, invoice status, and invoice open-amount input facts consumed by overdue and penalty workflows. |
| `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/` | Payment, allocation, credit, reversal, correction, and balance-impact source facts consumed by open amount, waiver, and delinquency evaluation. |

## Functional Design Scope

### In Scope

- Detect overdue issued invoices using UOW-04 due-date facts, UOW-03 grace-period metadata, and UOW-05 payment/allocation/credit/reversal/correction effects.
- Classify aging buckets for overdue balance facts.
- Create non-compounding recurring penalty source records.
- Prevent duplicate penalty application for the same invoice, charge type, and penalty period.
- Manage penalty waiver requests through UOW-01 approval workflow.
- Create waiver source records and balance-impact facts without deleting original penalty source records.
- Determine reminder eligibility and create reminder intent records through UOW-01 support contracts for later UOW-08 delivery.
- Provide staff and homeowner-safe frontend components for overdue review, aging classification, penalty run review, waiver request/approval status, and reminder intent status.
- Identify PBT candidates for overdue boundary dates, aging bucket classification, penalty duplicate prevention, non-compounding behavior, waiver balance effects, and reminder suppression windows.

### Out of Scope

- Invoice creation, invoice lines, invoice numbers, invoice issue workflow, and issued invoice snapshots owned by UOW-04.
- Payment posting, allocation, credit creation, receipt creation, reversals, and financial correction coordination owned by UOW-05.
- Statement of account output, dashboard output, formal reports, exports, and report reconciliation output owned by UOW-07.
- Concrete email delivery, retry jobs, rendered documents, stored files, and final portal composition owned by UOW-08.
- Mutable account-balance source-of-truth records. UOW-06 may create penalty-side and waiver-side balance-impact source facts only.

## Functional Design Checklist

- [x] Read UOW-06 unit definition.
- [x] Read UOW-06 assigned stories.
- [x] Read Functional Design rule details.
- [x] Confirm Security Baseline and Property-Based Testing extensions remain enabled.
- [x] Identify UOW-06 business logic risks and integration boundaries.
- [x] Create this Functional Design plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory.
- [x] Generate `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/functional-design/business-logic-model.md`.
- [x] Generate `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/functional-design/business-rules.md`.
- [x] Generate `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/functional-design/domain-entities.md`.
- [x] Generate `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/functional-design/frontend-components.md`.
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
How should UOW-06 determine whether an invoice is overdue for MVP?

A) An issued, non-voided invoice is overdue when the evaluation date is after `dueDate + resolvedGracePeriodDays`, and the invoice has positive open amount after UOW-05 payment, allocation, credit, reversal, and correction effects are applied (recommended)
B) An invoice is overdue immediately after `dueDate`, ignoring grace period metadata
C) Staff manually marks invoices overdue without system calculation
X) Other (please describe after [Answer]: tag below)

[Answer]: A. An issued, non-voided invoice is overdue when the evaluation date is after `dueDate + resolvedGracePeriodDays`, and the invoice has positive open amount after UOW-05 payment, allocation, credit, reversal, and correction effects are applied. Overdue status must be derived from source facts, not manually toggled.

### Question 2
Which date should UOW-06 use as the penalty and aging evaluation date?

A) Use an explicit `evaluationDate` supplied by the penalty, aging, or reminder workflow; scheduled jobs pass the job business date, and manual staff reviews pass the selected review date (recommended)
B) Always use the server clock at execution time
C) Always use the invoice issue date
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Use an explicit `evaluationDate` supplied by the penalty, aging, or reminder workflow. Scheduled jobs pass the job business date, and manual staff reviews pass the selected review date. Do not use the server clock as the financial control date.

### Question 3
How should aging buckets be defined for MVP?

A) Use configured day ranges measured from the first overdue date, with default buckets `Current`, `1-30`, `31-60`, `61-90`, and `90+`; bucket definitions are effective-dated configuration consumed from UOW-03 or defaulted by UOW-06 only until configured (recommended)
B) Hard-code buckets directly in UOW-06 with no configuration reference
C) Do not classify aging until UOW-07 reporting
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Use configured day ranges measured from the first overdue date, with default buckets `Current`, `1-30`, `31-60`, `61-90`, and `90+`. Bucket definitions should be effective-dated configuration consumed from UOW-03 or defaulted by UOW-06 only until configured.

### Question 4
How should recurring monthly penalty periods be identified?

A) Use a normalized penalty period key such as `YYYY-MM` based on the evaluation date in the HOA business timezone; one penalty source record is allowed per invoice, charge type, and penalty period (recommended)
B) Use the exact timestamp of the penalty run as the period key
C) Allow multiple penalties per month as long as staff approves each run
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Use a normalized penalty period key such as `YYYY-MM` based on the evaluation date in the HOA business timezone. Only one non-voided penalty source record is allowed per invoice, charge type, and penalty period.

### Question 5
How should penalty amount calculation work for MVP?

A) Resolve the configured penalty charge rule for the evaluation date and calculate the penalty against eligible unpaid regular invoice balance only; penalty records must snapshot inputs, rule references, basis amount, rounding rule, and output amount (recommended)
B) Calculate penalties against the full account balance, including previous penalties
C) Allow staff to enter any penalty amount without a configured rule
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Resolve the configured penalty charge rule for the evaluation date and calculate the penalty against eligible unpaid regular invoice balance only. Penalty records must snapshot inputs, rule references, basis amount, rounding rule, and output amount.

### Question 6
How should UOW-06 enforce non-compounding penalties?

A) Penalty calculation excludes prior penalty source records, penalty waivers, reminder fees, and penalty-on-penalty amounts from the penalty basis; only eligible unpaid principal or configured charge categories can form the basis (recommended)
B) Penalties compound on all unpaid amounts including prior penalties
C) Staff chooses whether each run compounds
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Penalty calculation excludes prior penalty source records, penalty waivers, reminder fees, and penalty-on-penalty amounts from the penalty basis. Only eligible unpaid principal or configured charge categories can form the basis.

### Question 7
What should happen when an invoice is partially paid before penalty evaluation?

A) Calculate penalty eligibility and basis from the remaining eligible open amount after posted payments, allocations, credits, reversals, and approved corrections effective as of the evaluation date (recommended)
B) Calculate penalties from the original invoice amount regardless of payment history
C) Skip penalties for any partially paid invoice
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Calculate penalty eligibility and basis from the remaining eligible open amount after posted payments, allocations, credits, reversals, and approved corrections effective as of the evaluation date. Do not calculate penalties from the original invoice amount when partial payments have reduced the eligible basis.

### Question 8
How should duplicate penalty prevention work?

A) Prevent more than one non-voided penalty source record for the same invoice, responsible billing account, penalty charge type, and penalty period; replacement requires an explicit correction or reissue workflow with audit and linkage (recommended)
B) Rely on staff review only with no system duplicate key
C) Allow duplicate penalties and let UOW-07 reports detect them
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Prevent more than one non-voided penalty source record for the same invoice, responsible billing account, penalty charge type, and penalty period. Replacement requires an explicit correction or reissue workflow with audit and linkage.

### Question 9
What penalty source record lifecycle should UOW-06 use?

A) Use `Draft`, `Applied`, `Voided`, and `Reissued`; applied financial history is immutable, terminal statuses require reason and audit, and replacements create linked source records rather than editing in place (recommended)
B) Use only `Open` and `Closed`
C) Allow applied penalties to be edited until month-end close
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Use `Draft`, `Applied`, `Voided`, and `Reissued`. Applied financial history is immutable. Terminal statuses require reason and audit. Replacements must create linked source records rather than editing applied penalty records in place.

### Question 10
How should penalty waiver approval work?

A) Waiver requests require penalty source record, waiver amount or full-waiver flag, reason, actor, approval reference, and audit; approval creates a linked waiver source record and balance-impact fact without deleting or mutating the original penalty (recommended)
B) Staff can directly delete penalty records when waived
C) Waivers are comments only and do not affect balance facts
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Waiver requests require penalty source record, waiver amount or full-waiver flag, reason, actor, approval reference, and audit. Approval creates a linked waiver source record and balance-impact fact without deleting or mutating the original penalty.

### Question 11
Can a waiver exceed the remaining unpaid penalty amount?

A) No. A waiver cannot exceed the current available unpaid amount of the target penalty after prior waivers, payments, credits, reversals, and corrections effective as of the waiver date (recommended)
B) Yes, excess waiver amount becomes a credit automatically
C) Yes, as long as Treasurer approves
X) Other (please describe after [Answer]: tag below)

[Answer]: A. No. A waiver cannot exceed the current available unpaid amount of the target penalty after prior waivers, payments, credits, reversals, and corrections effective as of the waiver date. Excess waiver amount must not automatically become a credit.

### Question 12
How should delinquency classification relate to waiver state?

A) Delinquency and aging use remaining unpaid open amount after approved waivers and payment effects; a waived penalty no longer contributes to delinquent amount, but the original penalty remains visible in history (recommended)
B) Waived penalties still count as delinquent until paid
C) Waivers remove penalty history entirely
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Delinquency and aging use remaining unpaid open amount after approved waivers and payment effects. A waived penalty no longer contributes to delinquent amount, but the original penalty remains visible in history.

### Question 13
How should reminder eligibility be determined?

A) A reminder is eligible when an invoice or account has positive overdue open amount after grace period and suppression rules, the homeowner has an authorized notification contact path, and no duplicate reminder intent exists for the same scope and reminder period (recommended)
B) Send reminders for every invoice after due date regardless of balance or suppression
C) Staff manually sends reminders with no eligibility record
X) Other (please describe after [Answer]: tag below)

[Answer]: A. A reminder is eligible when an invoice or account has positive overdue open amount after grace period and suppression rules, the homeowner has an authorized notification contact path, and no duplicate reminder intent exists for the same scope and reminder period.

### Question 14
What should UOW-06 own for reminder delivery?

A) UOW-06 creates reminder eligibility and reminder intent records only; UOW-08 later renders content, sends emails, retries failures, stores documents, and enforces download behavior (recommended)
B) UOW-06 sends SMTP emails directly
C) UOW-06 renders and stores reminder PDFs
X) Other (please describe after [Answer]: tag below)

[Answer]: A. UOW-06 creates reminder eligibility and reminder intent records only. UOW-08 later renders content, sends emails, retries failures, stores documents, and enforces download behavior. UOW-06 must not send SMTP emails directly or render/store reminder documents.

### Question 15
How should UOW-06 expose homeowner and Board Member access?

A) Staff roles may manage penalties, waivers, aging, and reminder eligibility according to permissions; Board Member access is read-only and PII-minimized; homeowners may read only penalty, waiver, delinquency, and reminder status tied to their authorized billing accounts/properties (recommended)
B) Board Members can waive penalties directly
C) Homeowners can see all delinquent owners for governance transparency
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Staff roles may manage penalties, waivers, aging, and reminder eligibility according to permissions. Board Member access is read-only and PII-minimized. Homeowners may read only penalty, waiver, delinquency, and reminder status tied to their authorized billing accounts or properties.

### Question 16
Which UOW-06 properties should be mandatory PBT candidates?

A) Overdue boundary dates, aging bucket classification, penalty duplicate prevention, non-compounding basis exclusion, partial-payment penalty basis, waiver amount limit, waiver idempotency, reminder duplicate suppression, and balance-impact conservation for penalties and waivers (recommended)
B) Only example-based tests are needed for penalties
C) PBT should be deferred until UOW-07 reporting
X) Other (please describe after [Answer]: tag below)

[Answer]: A. Mandatory PBT candidates are overdue boundary dates, aging bucket classification, penalty duplicate prevention, non-compounding basis exclusion, partial-payment penalty basis, waiver amount limit, waiver idempotency, reminder duplicate suppression, and balance-impact conservation for penalties and waivers.

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant for planning | The plan requires server authorization, homeowner isolation, Board Member PII minimization, approval-backed waivers, audit for financial mutations, support-intent boundaries, and no client-side authorization reliance. |
| Property-Based Testing | Compliant for planning | The plan identifies UOW-06 PBT candidates for date boundaries, aging buckets, duplicate prevention, non-compounding penalties, waiver limits, reminder suppression, and balance-impact conservation. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
