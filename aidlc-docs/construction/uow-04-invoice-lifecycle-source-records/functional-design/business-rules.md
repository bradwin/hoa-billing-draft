# UOW-04 Business Rules

## Unit

- **Unit ID**: UOW-04
- **Unit Name**: Invoice Lifecycle and Invoice Source Records
- **Stage**: Functional Design

## Boundary Rules

| Rule ID | Rule |
|---|---|
| UOW04-BOUNDARY-001 | UOW-04 owns invoice source records, invoice line source records, billing exception records, issued invoice snapshots, invoice status, issued invoice numbers, and invoice open-amount input facts. |
| UOW04-BOUNDARY-002 | UOW-04 must not create payments, allocations, credits, receipts, penalties, penalty waivers, adjustments, statements, reports, exports, rendered documents, sent emails, stored files, import batches, or mutable account-balance source-of-truth records. |
| UOW04-BOUNDARY-003 | UOW-04 records document and email intent requests against issued invoice snapshots through UOW-01 support contracts only. UOW-08 owns PDF rendering, file storage, SMTP delivery, retry workers, and document download enforcement. |
| UOW04-BOUNDARY-004 | Payment-related invoice views such as paid, partially paid, overdue, and outstanding display states are derived later from UOW-05 and UOW-06 facts. They are not UOW-04 lifecycle statuses. |

## Recurring Draft Generation Rules

| Rule ID | Rule |
|---|---|
| UOW04-RECURRING-001 | Recurring draft generation uses the billing period start date as the UOW-02 billable-property `validationDate`. |
| UOW04-RECURRING-002 | UOW-04 treats the billing period start date as the recurring responsibility control date for MVP. Proration, mid-period ownership transfer billing, or alternate responsibility-date logic requires approved future scope. |
| UOW04-RECURRING-003 | UOW-04 may generate recurring drafts only for properties that pass UOW-02 billable-property validation for the supplied `validationDate`. |
| UOW04-RECURRING-004 | Rate, rounding, and recurring charge configuration are resolved from UOW-03 by billing period start date. |
| UOW04-RECURRING-005 | Due dates are computed from the resolved UOW-03 due-date rule and then snapshotted on the invoice source record. |
| UOW04-RECURRING-006 | Draft generation must not resolve or consume an issued invoice number. Numbering metadata is resolved only during issuance. |
| UOW04-RECURRING-007 | Draft generation must be repeat-safe: rerunning generation for the same scope cannot create duplicate non-voided recurring invoices. |

## Duplicate Prevention Rules

| Rule ID | Rule |
|---|---|
| UOW04-DUPLICATE-001 | UOW-04 prevents more than one non-voided recurring invoice for the same property, responsible billing account, charge type, and billing period. |
| UOW04-DUPLICATE-002 | Authorized correction or replacement of a recurring invoice must use an explicit correction or reissue workflow and must preserve audit and linkage to the prior invoice source record. |
| UOW04-DUPLICATE-003 | Duplicate prevention must consider `Draft`, `Issued`, `Cancelled`, and `Reissued` invoices as blocking unless the approved workflow explicitly supersedes them. |
| UOW04-DUPLICATE-004 | `Voided` invoices do not permit silent reuse of the same invoice number or deletion of the prior source record. |
| UOW04-DUPLICATE-005 | A cancelled recurring draft remains part of duplicate history. A replacement recurring draft for the same property, responsible billing account, charge type, and billing period may be created only through an explicit replacement action that links to the cancelled draft, records reason, actor, and audit. |

## Billing Exception Rules

| Rule ID | Rule |
|---|---|
| UOW04-EXCEPTION-001 | If a property fails billable validation, UOW-04 must not create an invoice for that property. |
| UOW04-EXCEPTION-002 | Each failed recurring generation candidate creates or updates a billing exception record with property, `validationDate`, failure reason, correlation ID, and source validation details. |
| UOW04-EXCEPTION-003 | UOW-04 must not silently skip invalid billable properties. |
| UOW04-EXCEPTION-004 | Billing exception records support staff review and later UOW-07 reporting, but UOW-04 does not generate formal reports. |

## Invoice Lifecycle Rules

| Rule ID | Rule |
|---|---|
| UOW04-LIFECYCLE-001 | MVP invoice lifecycle statuses are `Draft`, `Issued`, `Cancelled`, `Voided`, and `Reissued`. |
| UOW04-LIFECYCLE-002 | Only `Draft` invoices may be issued. |
| UOW04-LIFECYCLE-003 | Draft cancellation can be staff-managed with reason and audit. |
| UOW04-LIFECYCLE-004 | Issued invoices must not be edited in place. |
| UOW04-LIFECYCLE-005 | Issued void and reissue actions require approval, reason capture, immutable reversal or supersession linkage, and audit. |
| UOW04-LIFECYCLE-006 | Reissue creates a new invoice source record linked to the superseded invoice. |
| UOW04-LIFECYCLE-007 | Terminal statuses require reason and audit. |
| UOW04-LIFECYCLE-008 | Issued financial history remains immutable even when later configuration, rate, lot area, ownership, or billing-account data changes. |

## Issuance and Numbering Rules

| Rule ID | Rule |
|---|---|
| UOW04-ISSUE-001 | Staff may issue selected valid draft invoices from a reviewed batch. |
| UOW04-ISSUE-002 | Each selected draft must be revalidated before issuance. |
| UOW04-ISSUE-003 | Issuance assigns immutable invoice numbers only inside the issuance transaction. |
| UOW04-ISSUE-004 | Draft invoices use internal IDs and must never consume issued invoice numbers. |
| UOW04-ISSUE-005 | Voided or cancelled issued invoice numbers must not be reused. |
| UOW04-ISSUE-006 | Invalid selected drafts remain draft or become exceptioned according to the validation result. |
| UOW04-ISSUE-007 | Issuance snapshots all required invoice and line inputs before the transaction commits. |

## Invoice Snapshot and Calculation Rules

| Rule ID | Rule |
|---|---|
| UOW04-SNAPSHOT-001 | Issued invoice lines must snapshot property, billing account, responsible homeowner, billing period, charge type, lot area, rate, quantity or basis, rounding rule, due date, line amount, manual metadata, tax-like metadata, configuration version references, and calculation inputs used. |
| UOW04-SNAPSHOT-002 | Issued invoices must remain reproducible even if UOW-02 or UOW-03 data changes later. |
| UOW04-CALC-001 | Recurring dues line amounts are calculated from UOW-02 lot area facts and UOW-03 resolved rate and rounding configuration. |
| UOW04-CALC-002 | UOW-04 must use decimal-safe arithmetic for invoice calculations. JavaScript floating-point arithmetic is not acceptable for financial amount calculation. |
| UOW04-CALC-003 | Invoice totals equal the sum of invoice line amounts after the configured rounding rule is applied. |
| UOW04-CALC-004 | Issued invoice amounts are never recalculated or mutated after later configuration, rate, lot area, ownership, or billing-account changes. |

## Manual Invoice Rules

| Rule ID | Rule |
|---|---|
| UOW04-MANUAL-001 | Manual invoices require property or billing account, responsible homeowner, due date, at least one configured charge type, description, amount, reason, actor, and audit. |
| UOW04-MANUAL-002 | Manual invoice lines must use configured UOW-03 charge types. Free-form charge type text is not allowed. |
| UOW04-MANUAL-003 | Manual tax-like lines are allowed only when the UOW-03 charge type is tax-like and manual-entry eligible. |
| UOW04-MANUAL-004 | UOW-04 does not automatically calculate tax-like charges. Manual tax-like amounts are entered explicitly and audited. |
| UOW04-MANUAL-005 | Manual invoice issuance follows the same numbering, snapshot, audit, and immutability rules as recurring invoice issuance. |

## Balance Input Rules

| Rule ID | Rule |
|---|---|
| UOW04-BALANCE-001 | UOW-04 creates invoice open-amount input facts for later balance derivation. |
| UOW04-BALANCE-002 | UOW-04 does not reduce invoice balances for payments, create credits, create penalties, create adjustments, or maintain a mutable account balance. |
| UOW04-BALANCE-003 | Later balance consumers must derive payment, credit, penalty, and adjustment effects from UOW-05 and UOW-06 source records. |

## Authorization and Audit Rules

| Rule ID | Rule |
|---|---|
| UOW04-ACCESS-001 | All invoice reads and mutations must be server-authorized. |
| UOW04-ACCESS-002 | Staff roles may read and mutate invoices only according to assigned permissions. |
| UOW04-ACCESS-003 | Board Member invoice access is read-only and PII-minimized. |
| UOW04-ACCESS-004 | Homeowners may read only invoices tied to their authorized billing accounts, properties, or homeowner profile. |
| UOW04-AUDIT-001 | Recurring generation, manual draft creation, draft cancellation, issuance, void requests, void decisions, reissue requests, reissue completion, document intents, and email intents are audited. |
| UOW04-AUDIT-002 | Audit entries must include actor, timestamp, action, affected invoice IDs, correlation ID, reason where applicable, and source references needed for traceability. |

## Property-Based Testing Rules

| Rule ID | Rule |
|---|---|
| UOW04-PBT-001 | PBT must cover duplicate prevention for recurring invoices. |
| UOW04-PBT-002 | PBT must cover issued numbering uniqueness and non-reuse. |
| UOW04-PBT-003 | PBT must cover invoice total equals line totals. |
| UOW04-PBT-004 | PBT must cover issued snapshot immutability after source data changes. |
| UOW04-PBT-005 | PBT must cover decimal rounding stability. |
| UOW04-PBT-006 | PBT must cover valid and invalid void/reissue state transitions. |

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Rules require server authorization, homeowner object isolation, Board Member PII minimization, audit, approval for issued void/reissue actions, and support-service boundaries. |
| Property-Based Testing | Compliant | Financial invariants and invoice lifecycle state transitions are explicitly assigned PBT coverage. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
