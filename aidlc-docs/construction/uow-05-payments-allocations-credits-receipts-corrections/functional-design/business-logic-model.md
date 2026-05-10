# UOW-05 Business Logic Model

## Unit

- **Unit ID**: UOW-05
- **Unit Name**: Payments, Allocations, Credits, Receipts, and Financial Corrections
- **Stage**: Functional Design

## Purpose

UOW-05 owns payment proof intake, staff verification, payment posting, allocation, credits, receipts, payment reversals, approved financial corrections, and payment-side Account Balance impact facts. It consumes issued invoice source records from UOW-04 and configuration metadata from UOW-03. It supplies immutable payment, allocation, credit, receipt, reversal, correction, and balance-impact source facts to UOW-06, UOW-07, and UOW-08.

UOW-05 must not create invoices, invoice lines, penalties, penalty waivers, delinquency classifications, statements, reports, exports, rendered documents, emails, stored files, import batches, or mutable account-balance source-of-truth records.

## Business Logic Components

| Component | Responsibility |
|---|---|
| Payment Proof Intake | Captures homeowner-submitted payment proof against authorized billing accounts, properties, homeowners, and optional target invoices. |
| Payment Verification | Supports staff review, rejection, cancellation, duplicate review, and posting readiness validation. |
| Payment Posting | Creates immutable posted payment records transactionally with allocations, credits where applicable, receipt source records, receipt number assignment, balance-impact facts, and audit. |
| Allocation Engine | Applies payments to eligible issued invoice source records using automatic or manual allocation rules. |
| Credit Ledger | Creates immutable credit source records for overpayments and linked credit-application records when credits are applied. |
| Receipt Engine | Creates receipt records and immutable receipt numbers after successful payment posting. |
| Reversal Coordinator | Coordinates approved reversals by creating linked reversal records, allocation reversal facts, receipt invalidation semantics, balance-impact reversal facts, and audit. |
| Financial Correction Coordinator | Creates approved adjustment or correction source records for payment, allocation, credit, receipt, and opening-balance correction impacts without overwriting original records. |
| Support Intent Adapter | Records receipt document and email intents through UOW-01 support contracts for later UOW-08 processing. |
| Authorization Model | Enforces role permission, homeowner ownership, Board Member read-only access, and PII minimization. |

## Payment Proof Flow

1. A homeowner or authorized staff actor submits payment proof.
2. The proof identifies:
   - authorized billing account;
   - property where applicable;
   - homeowner;
   - amount;
   - payment date;
   - configured payment method;
   - external reference number when required by the resolved payment-method or proof-channel configuration;
   - optional target invoice references;
   - attachment intent or placeholder reference owned later by UOW-08.
3. New proof starts in `Submitted`.
4. Staff may move `Submitted` proof to `UnderReview`.
5. Only `Submitted` or `UnderReview` proof can be rejected, cancelled, or posted.
6. `Rejected`, `Cancelled`, and `Posted` proof states are terminal for the proof record.
7. `Posted` proof is corrected only through linked reversal or correction records.

Rejected and cancelled proofs do not create posted payments, allocations, credits, receipts, or balance-impact facts.

## Payment Posting Flow

Before posting, UOW-05 revalidates:

- actor authority;
- proof state when posting from proof;
- homeowner, property, and billing account authorization;
- configured payment method;
- positive payment amount;
- duplicate payment risk;
- target invoice eligibility;
- allocation totals;
- credit remainder;
- audit and correlation context.

Posting creates, in one transaction:

1. immutable posted payment record with state `Posted`;
2. allocation records against eligible invoice source records;
3. credit source record for unapplied overpayment remainder, if any;
4. receipt record and immutable receipt number;
5. receipt snapshot;
6. balance-impact facts;
7. audit entries.

If any required record cannot be created, posting fails and none of the financial source records are committed.

## Duplicate Payment Review Flow

UOW-05 checks duplicate risk using billing account, payment method, external reference, amount, and payment date against:

- active payment proofs; and
- non-reversed posted payments.

For duplicate checks, active payment proofs are proofs in `Submitted` or `UnderReview` status. `Rejected`, `Cancelled`, and `Posted` proofs are not active proofs. Posted proofs are evaluated through their linked posted payment records.

When a duplicate candidate exists, posting is blocked or requires elevated override review. Override review must record reviewed candidate IDs, actor, timestamp, reason, and correlation ID.

This guard is not a global unique reference rule because identical reference values can appear across institutions, accounts, or manual payment methods.

## Automatic Allocation Flow

Automatic allocation applies payment amount to oldest eligible issued invoices first:

1. due date ascending;
2. issue date ascending;
3. invoice number ascending.

Eligible invoice records must be:

- issued;
- non-voided;
- tied to the payment billing account or authorized target scope;
- positive open amount according to source facts and prior allocations, credits, reversals, and corrections.

Within an invoice, allocation applies to eligible components in this order:

1. penalties and fees when supplied by UOW-06 source records;
2. dues or regular invoice charges;
3. other manual charges.

For MVP before UOW-06 exists, penalty component allocation is supported as a component category but has no UOW-06 source records to consume.

## Manual Allocation Flow

Manual allocation requires:

- staff actor;
- reason;
- exact allocation targets;
- eligible invoices;
- nonnegative line or component open amounts;
- allocation totals equal payment amount minus explicit credit remainder;
- audit and correlation ID.

Manual allocation cannot allocate to voided invoices, over-allocate an invoice or component, or hide a remaining unapplied amount without creating an explicit credit source record.

## Credit Flow

Overpayments create immutable credit source records tied to billing account and property where applicable. Credit source records are not mutable balance fields.

Credit application is staff-managed with reason and audit unless a later approved rule enables automatic application. Each application creates a linked credit-application record. The original credit source amount is preserved; available credit is derived from source credit minus linked applications and reversals.

## Receipt Flow

UOW-05 creates receipt records and assigns receipt numbers only after payment posting succeeds. Rejected proofs, cancelled proofs, and unposted drafts never consume receipt numbers.

Receipt numbers are immutable and are not reused after reversal. A receipt snapshot includes payment ID, receipt number, payer, billing account, property if applicable, amount, payment date, posting date, payment method, external reference, allocation summary, credit remainder, actor, configuration references, and source proof reference where applicable.

Receipt PDF rendering, file storage, SMTP delivery, retry behavior, and document download are owned by UOW-08. UOW-05 records document and email intent requests only.

## Payment Reversal Flow

Payment reversal requires approval, reason, actor, linked posted payment, linked allocations, linked receipt, reversal effective date, immutable reversal records, balance-impact reversal facts, and audit.

Reversal does not delete posted payments, allocations, credits, or receipts. `Reversed` is derived from an approved linked reversal record and related reversal facts; it is not an in-place overwrite of the posted payment source record. The original records remain visible. Receipt history remains visible with reversal or invalidation status; receipt numbers are not reused.

## Financial Correction Flow

UOW-05 owns approved correction source records for payment, allocation, credit, receipt, and opening-balance correction impacts. Opening-balance or import-sourced corrections supplied by the approved import/opening-balance owner must apply through UOW-05 correction services. Corrections are:

- linked to the original source record or approved import/opening-balance request;
- reasoned;
- approved where required;
- audited;
- represented as new source records;
- included in balance-impact derivation.

Corrections must not overwrite or delete original financial source records.

## Object Authorization Model

| Actor | Access |
|---|---|
| System Administrator | Administrative access according to permission matrix, with audit for sensitive actions. |
| Treasurer | Payment posting, reversal approval, correction approval, receipt oversight, and read access according to permissions. |
| Billing Staff | Proof review, manual payment entry, allocation, credit application, receipt operations, and read access according to permissions. |
| Board Member | Read-only, PII-minimized access to authorized governance views. |
| Homeowner | Read only records tied to their authorized billing accounts, properties, homeowner profile, or submitted proofs. |

All reads and mutations are server-authorized. Frontend filtering is usability only.

## PBT Candidate Properties

| Property | Description |
|---|---|
| Allocation conservation | Sum of allocations plus credit remainder equals posted payment amount. |
| Nonnegative open amounts | Allocations and credit applications never exceed eligible open amounts. |
| Credit remainder correctness | Credit source amount equals unapplied overpayment remainder. |
| Reversal restoration | Reversal creates equal-and-opposite balance-impact facts and restores observable open amounts. |
| Receipt number uniqueness | Receipt numbers are unique and never reused after reversal. |
| Source immutability | Posted payments, receipts, credits, allocations, and corrections are not edited in place. |

## Boundary Summary

UOW-05 owns payment-side financial source records and balance-impact facts. It does not own invoice generation, penalty creation, report output, concrete document rendering, email delivery, file storage, import execution, or mutable account-balance source-of-truth records.

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Object authorization, PII minimization, approval, audit, duplicate override audit, and support-intent boundaries are explicit. |
| Property-Based Testing | Compliant | Financial conservation and immutability properties are identified for PBT in later code generation. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
