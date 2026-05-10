# UOW-05 Business Rules

## Unit

- **Unit ID**: UOW-05
- **Unit Name**: Payments, Allocations, Credits, Receipts, and Financial Corrections
- **Stage**: Functional Design

## Boundary Rules

| Rule ID | Rule |
|---|---|
| UOW05-BOUNDARY-001 | UOW-05 owns payment proof records, posted payment records, allocation records, credit source records, credit application records, receipt source records, reversal records, correction records, and payment-side balance-impact facts. |
| UOW05-BOUNDARY-002 | UOW-05 must not create invoices, invoice lines, invoice numbers, penalties, penalty waivers, delinquency classifications, statements, reports, exports, rendered documents, emails, stored files, import batches, or mutable account-balance source-of-truth records. |
| UOW05-BOUNDARY-003 | UOW-05 consumes UOW-04 issued invoice source records and invoice open-amount input facts; it does not mutate issued invoice snapshots. |
| UOW05-BOUNDARY-004 | UOW-05 records receipt document and email intents through UOW-01 support contracts. UOW-08 owns rendering, storage, SMTP delivery, retries, and document download behavior. |

## Payment Proof Rules

| Rule ID | Rule |
|---|---|
| UOW05-PROOF-001 | Payment proof statuses are `Submitted`, `UnderReview`, `Rejected`, `Posted`, and `Cancelled`. |
| UOW05-PROOF-002 | Only `Submitted` or `UnderReview` payment proofs can be rejected, cancelled, or posted. |
| UOW05-PROOF-003 | `Rejected`, `Cancelled`, and `Posted` are terminal proof states. |
| UOW05-PROOF-004 | Rejected and cancelled proofs must not create posted payments, allocations, credits, receipts, or balance-impact facts. |
| UOW05-PROOF-005 | Payment proof submission requires an authorized billing account, property where applicable, homeowner, positive amount, payment date, configured payment method, and actor context. |
| UOW05-PROOF-006 | Payment reference number requirements are configuration-driven by payment method and proof channel. When the resolved configuration requires a reference, the proof or posting workflow must capture and validate it. |
| UOW05-PROOF-007 | Payment proof may include optional target invoice references, but target references do not bypass posting validation. |
| UOW05-PROOF-008 | Physical proof attachment storage is out of UOW-05 scope and is owned by UOW-08. |

## Payment Posting Rules

| Rule ID | Rule |
|---|---|
| UOW05-POSTING-001 | Posted payment lifecycle states are `Posted` and `Reversed`. |
| UOW05-POSTING-002 | Posted payment records are immutable financial source records and must not be edited in place. |
| UOW05-POSTING-003 | Payment reversal creates linked reversal and balance-impact records rather than deleting or rewriting the posted payment. |
| UOW05-POSTING-004 | Posting from proof must revalidate proof state, actor authority, homeowner/property/billing-account authorization, configured payment method, positive amount, duplicate risk, invoice eligibility, allocation totals, and audit context. |
| UOW05-POSTING-005 | Payment posting, allocations, credit creation, receipt creation, receipt number assignment, balance-impact facts, and audit must succeed or fail together. |
| UOW05-POSTING-006 | Staff direct payment entry must meet the same validation, allocation, receipt, and audit requirements as proof-based posting. |
| UOW05-POSTING-007 | UOW-05 must use decimal-safe arithmetic for payment, allocation, credit, and receipt amounts. |
| UOW05-POSTING-008 | `Reversed` payment status is derived from an approved linked reversal record and related reversal facts. Reversal must not be implemented as an in-place mutation that overwrites the posted payment source record. |

## Duplicate Payment Rules

| Rule ID | Rule |
|---|---|
| UOW05-DUPLICATE-001 | Duplicate payment risk is evaluated using billing account, payment method, external reference, amount, and payment date. |
| UOW05-DUPLICATE-002 | A non-reversed posted payment or active proof with the same duplicate-risk key blocks posting or requires elevated override review. |
| UOW05-DUPLICATE-003 | Duplicate override review must be audited with actor, timestamp, reviewed candidate IDs, reason, and correlation ID. |
| UOW05-DUPLICATE-004 | UOW-05 must not enforce a global unique external payment reference across all accounts because reference formats can repeat across methods or institutions. |
| UOW05-DUPLICATE-005 | For duplicate checks, active proofs are proofs in `Submitted` or `UnderReview` status. `Rejected`, `Cancelled`, and `Posted` proofs do not count as active proofs, although posted proofs are evaluated through their linked posted payment records. |

## Allocation Rules

| Rule ID | Rule |
|---|---|
| UOW05-ALLOCATION-001 | Automatic allocation applies to oldest eligible issued invoices first by due date, then issue date, then invoice number. |
| UOW05-ALLOCATION-002 | Eligible invoices must be issued, non-voided, tied to the authorized billing scope, and have positive open amount. |
| UOW05-ALLOCATION-003 | Allocation must not exceed the eligible open amount of an invoice, line, or component. |
| UOW05-ALLOCATION-004 | Within an invoice, allocation applies to eligible penalties and fees first, then dues or regular invoice charges, then other manual charges. |
| UOW05-ALLOCATION-005 | Before UOW-06 exists, penalty component allocation is supported as a category but has no penalty source records to consume. |
| UOW05-ALLOCATION-006 | Manual allocation requires staff actor, reason, exact allocation targets, invoice eligibility, nonnegative open amounts, matching totals, audit, and correlation ID. |
| UOW05-ALLOCATION-007 | Sum of allocation amounts plus explicit credit remainder must equal posted payment amount. |
| UOW05-ALLOCATION-008 | UOW-05 must not silently leave unapplied payment amount without creating an explicit credit source record. |

## Credit Rules

| Rule ID | Rule |
|---|---|
| UOW05-CREDIT-001 | Overpayment remainder creates an immutable credit source record tied to the billing account and property where applicable. |
| UOW05-CREDIT-002 | Credit source records are financial source records, not mutable account-balance fields. |
| UOW05-CREDIT-003 | Credit applications create linked credit-application records and must not mutate the original credit amount in place. |
| UOW05-CREDIT-004 | Staff-managed credit application requires reason, actor, audit, eligible target invoice or component, and sufficient available credit. |
| UOW05-CREDIT-005 | Automatic credit application is out of MVP unless a later approved rule enables it. |

## Receipt Rules

| Rule ID | Rule |
|---|---|
| UOW05-RECEIPT-001 | Receipt records and receipt numbers are created only after payment posting succeeds. |
| UOW05-RECEIPT-002 | Rejected proofs, cancelled proofs, and unposted drafts must not consume receipt numbers. |
| UOW05-RECEIPT-003 | Receipt numbers are immutable and must not be reused after reversal. |
| UOW05-RECEIPT-004 | Receipt snapshots must include payment ID, receipt number, payer, billing account, property if applicable, amount, payment date, posting date, payment method, external reference, allocation summary, credit remainder, actor, configuration references, and source proof reference where applicable. |
| UOW05-RECEIPT-005 | Receipt reversal or invalidation preserves the original receipt record and number. |
| UOW05-RECEIPT-006 | Receipt PDF rendering, file storage, email delivery, retries, and document downloads are owned by UOW-08. |

## Reversal Rules

| Rule ID | Rule |
|---|---|
| UOW05-REVERSAL-001 | Payment reversal requires approval, reason, actor, linked posted payment, reversal effective date, audit, and correlation ID. |
| UOW05-REVERSAL-002 | Payment reversal creates linked reversal records for payment, allocations, receipt, credit effects where applicable, and balance-impact facts. |
| UOW05-REVERSAL-003 | Reversal must not delete posted payment, allocation, credit, or receipt history. |
| UOW05-REVERSAL-004 | A reversed payment cannot be reversed again. |
| UOW05-REVERSAL-005 | Reversal must restore observable open amount impact through linked source facts rather than direct mutation of balances. |

## Financial Correction Rules

| Rule ID | Rule |
|---|---|
| UOW05-CORRECTION-001 | UOW-05 owns approved adjustment and correction source records for payment, allocation, credit, receipt, and opening-balance correction impacts. |
| UOW05-CORRECTION-002 | Corrections must be linked to original source records or approved opening-balance/import requests, reasoned, audited, and represented as new source records. |
| UOW05-CORRECTION-003 | Corrections must not overwrite, delete, or directly edit original financial source records. |
| UOW05-CORRECTION-004 | Opening-balance or import-sourced corrections supplied by the approved import/opening-balance owner must apply through UOW-05 approved correction services and not direct table writes. |

## Access Rules

| Rule ID | Rule |
|---|---|
| UOW05-ACCESS-001 | Staff roles may read and mutate payment records only according to permissions and object authorization. |
| UOW05-ACCESS-002 | Board Member access is read-only and PII-minimized. Sensitive payment proof details may be masked or omitted unless explicitly permitted. |
| UOW05-ACCESS-003 | Homeowners may read only payment proofs, payments, credits, and receipts tied to their authorized billing accounts, properties, homeowner profile, or submitted proofs. |
| UOW05-ACCESS-004 | All reads and mutations must be server-authorized. Frontend filtering is not an authorization control. |
| UOW05-ACCESS-005 | Sensitive financial mutations must write audit entries with actor, timestamp, action, target, reason where applicable, and correlation ID. |

## PBT Rules

| Rule ID | Rule |
|---|---|
| UOW05-PBT-001 | Property-based tests must verify allocation totals equal posted payment amount minus credit remainder. |
| UOW05-PBT-002 | Property-based tests must verify allocations and credit applications never exceed eligible open amounts. |
| UOW05-PBT-003 | Property-based tests must verify credit remainder equals unapplied overpayment. |
| UOW05-PBT-004 | Property-based tests must verify reversal restores observable balance impact through equal-and-opposite facts. |
| UOW05-PBT-005 | Property-based tests must verify receipt numbers are unique and not reused. |
| UOW05-PBT-006 | Property-based tests must verify immutable source records are not edited in place. |

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Rules define object authorization, PII minimization, approval, audit, duplicate override audit, and support-intent boundaries. |
| Property-Based Testing | Compliant | Rules explicitly require PBT for core financial invariants. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
