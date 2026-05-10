# UOW-04 Business Logic Model

## Unit

- **Unit ID**: UOW-04
- **Unit Name**: Invoice Lifecycle and Invoice Source Records
- **Stage**: Functional Design

## Business Logic Boundary

UOW-04 owns invoice lifecycle behavior and invoice source records. It creates recurring and manual invoice drafts, billing exceptions, issued invoice snapshots, invoice line source records, immutable issued invoice numbers, and invoice open-amount input facts.

UOW-04 does not create payments, allocations, credits, receipts, penalties, penalty waivers, adjustments, statements, reports, exports, rendered documents, sent emails, stored files, import batches, or mutable account-balance source-of-truth records. It queues document and email intents through UOW-01 support contracts only; UOW-08 owns concrete rendering, storage, delivery, retries, and downloads.

Payment-related display states such as paid, partially paid, overdue, and outstanding are derived later from UOW-05 payment/allocation facts and UOW-06 penalty facts. They are not UOW-04 invoice lifecycle statuses.

## Core Concepts

| Concept | Description |
|---|---|
| Invoice Batch | A staff-controlled recurring generation run for a billing period, scope, charge type, and correlation ID. |
| Billing Exception | A record that explains why a property candidate did not receive a recurring invoice. |
| Invoice Source Record | The business source record for a draft, issued, cancelled, voided, or reissued invoice. |
| Invoice Line Source Record | A line-level charge record with amount, basis, charge type, and snapshot references. |
| Issued Snapshot | Immutable invoice and line facts captured at issuance so historical invoices remain reproducible. |
| Invoice Number | Immutable issued invoice number assigned only during issuance. Drafts use internal IDs. |
| Invoice Open-Amount Input Fact | UOW-04-owned amount input consumed by later balance derivation; it is not a mutable account balance. |
| Document Intent | Request for later UOW-08 document rendering against an issued invoice snapshot. |
| Email Intent | Request for later UOW-08 invoice email delivery against an issued invoice snapshot. |

## Recurring Draft Generation Flow

1. Staff selects billing period, recurring charge type, generation scope, and correlation context.
2. UOW-04 determines the billing period start date.
3. UOW-04 calls UOW-02 billable-property validation with `validationDate = billingPeriodStartDate`.
4. The billing period start date is the recurring responsibility control date for MVP.
5. Later proration, mid-period ownership transfer billing, or alternate responsibility-date logic is future approved scope.
6. For each valid property, UOW-04 resolves UOW-03 rate, rounding, and charge configuration by billing period start date.
7. UOW-04 computes due date from the resolved UOW-03 due-date rule.
8. UOW-04 checks duplicate prevention for property, responsible billing account, charge type, and billing period.
9. If no blocking invoice exists, UOW-04 creates a draft invoice source record and draft invoice line records.
10. Draft generation uses internal IDs only and does not resolve or consume issued invoice numbers.
11. UOW-04 audits the generation run and records the correlation ID.

Draft generation must be repeat-safe. Rerunning the same generation scope cannot create duplicate non-voided recurring invoices.

## Billing Exception Flow

When a property fails UOW-02 validation or required UOW-03 configuration cannot be resolved:

1. UOW-04 does not create an invoice for the failed candidate.
2. UOW-04 creates or updates a billing exception record.
3. The exception includes property, `validationDate`, failure reason, correlation ID, source validation details, and generation context.
4. Staff can review the exception in UOW-04.
5. UOW-07 may later report on exceptions.

UOW-04 must never silently skip invalid billable properties. A zero-amount invoice is not a valid substitute for an exception.

## Duplicate Prevention Flow

Before creating a recurring draft, UOW-04 searches for existing non-voided recurring invoices with the same:

- property;
- responsible billing account;
- charge type; and
- billing period.

`Draft`, `Issued`, `Cancelled`, and `Reissued` records block duplicate recurring generation unless an explicit correction, replacement, or reissue workflow supersedes the prior source record. A cancelled recurring draft remains part of duplicate history. A replacement recurring draft for the same property, responsible billing account, charge type, and billing period may be created only through an explicit replacement action that links to the cancelled draft and records reason, actor, and audit.

Authorized correction or replacement must preserve linkage to the prior invoice source record, actor, reason, approval reference where required, and audit trail.

## Recurring Calculation Flow

UOW-04 calculates recurring dues line amounts using:

- UOW-02 lot area facts;
- UOW-03 resolved rate configuration;
- UOW-03 resolved rounding rule;
- UOW-03 resolved charge type; and
- the selected billing period.

Calculation uses decimal-safe arithmetic. JavaScript floating-point arithmetic is not acceptable for financial amount calculation.

UOW-04 snapshots all calculation inputs and outputs on issuance. Issued invoice amounts are never recalculated or mutated after later configuration, rate, lot area, ownership, or billing-account changes.

## Manual Invoice Flow

1. Staff selects property or billing account and responsible homeowner.
2. Staff enters due date, line charge types, descriptions, amounts, and reason.
3. UOW-04 validates that each line uses a configured UOW-03 charge type.
4. UOW-04 validates manual tax-like lines only when the UOW-03 charge type is tax-like and manual-entry eligible.
5. UOW-04 creates a manual draft invoice source record and line records.
6. Manual drafts are reviewed and issued through the same issuance flow as recurring drafts.

Manual tax-like amounts are entered explicitly. UOW-04 does not automatically calculate tax-like charges.

## Draft Review and Issuance Flow

1. Staff reviews generated or manual draft invoices and billing exceptions.
2. Staff selects valid draft invoices for issuance.
3. UOW-04 revalidates each selected draft before issuance.
4. UOW-04 resolves numbering metadata from UOW-03 at issuance time.
5. UOW-04 assigns immutable issued invoice numbers inside the issuance transaction.
6. UOW-04 snapshots invoice header and line facts.
7. UOW-04 creates invoice open-amount input facts for later balance derivation.
8. UOW-04 changes the invoice lifecycle status to `Issued`.
9. UOW-04 audits issuance with actor, invoice IDs, invoice numbers, source references, and correlation ID.
10. UOW-04 may record document and email intents against the issued invoice snapshots.

Staff may issue selected valid drafts from a batch. The whole batch is not required to issue all-or-nothing. Invalid selected drafts remain draft or become exceptioned according to the validation result.

## Invoice Status Model

| Status | Meaning | Terminal |
|---|---|---|
| `Draft` | Invoice is editable within draft rules and has no issued invoice number. | No |
| `Issued` | Invoice has an immutable issued number and issued snapshot. | No |
| `Cancelled` | Draft or allowable invoice workflow was cancelled with reason and audit. | Yes |
| `Voided` | Issued invoice was voided through approval with immutable linkage and audit. | Yes |
| `Reissued` | Issued invoice was superseded by a new invoice source record. | Yes |

Payment-derived conditions such as paid, partially paid, overdue, and outstanding are not UOW-04 lifecycle statuses.

## Cancel, Void, and Reissue Flow

Draft cancellation:

1. Staff provides reason.
2. UOW-04 changes `Draft` to `Cancelled`.
3. UOW-04 audits the cancellation.

Issued void:

1. Staff requests void with reason.
2. UOW-04 creates or references a Treasurer approval request through UOW-01.
3. After approval, UOW-04 marks the invoice `Voided`.
4. UOW-04 preserves invoice number, issued snapshot, and immutable source record.
5. UOW-04 audits the decision and linkage.

Issued reissue:

1. Staff requests reissue with reason.
2. UOW-04 creates or references a Treasurer approval request through UOW-01.
3. After approval, UOW-04 marks the original invoice `Reissued`.
4. UOW-04 creates a new invoice source record linked to the superseded invoice.
5. The new invoice follows normal draft and issuance rules.

Issued invoices must not be edited in place.

## Snapshot Model

Issued invoice lines snapshot:

- property;
- billing account;
- responsible homeowner;
- billing period;
- charge type;
- lot area;
- rate;
- quantity or basis;
- rounding rule;
- due date;
- line amount;
- manual metadata;
- tax-like metadata;
- configuration version references; and
- calculation inputs used.

Issued invoice snapshots must remain reproducible even if UOW-02 or UOW-03 data changes later.

## Document and Email Intent Flow

UOW-04 may record document and email intent requests only for issued invoices. Each intent references the issued invoice snapshot and includes actor, intent type, target invoice, correlation ID, and status metadata needed by UOW-08.

UOW-04 does not render PDFs, store files, send SMTP emails, retry delivery, or enforce document downloads. Failed future email delivery must not alter the validity of an issued invoice.

## Authorization Model

All invoice reads and mutations are server-authorized.

| Actor | Access |
|---|---|
| System Administrator | Administrative access according to configured permissions. |
| Treasurer | Financial approval and invoice oversight according to permissions. |
| Billing Staff | Generate drafts, create manual drafts, review, issue where permitted, request void/reissue, and read invoice work queues according to permissions. |
| Board Member | Read-only, PII-minimized invoice access for authorized oversight. |
| Homeowner | Read-only access only to invoices tied to their authorized billing accounts, properties, or homeowner profile. |

Frontend controls are usability aids only; backend authorization is authoritative.

## Audit Model

UOW-04 audits:

- recurring generation;
- billing exception creation or update;
- manual draft creation;
- draft cancellation;
- issuance;
- void request and decision;
- reissue request and completion;
- document intent request; and
- email intent request.

Audit entries include actor, timestamp, action, affected invoice IDs, correlation ID, reason where applicable, approval reference where applicable, and source references needed for traceability.

## PBT Candidate Properties

| Property | Expected Invariant |
|---|---|
| Duplicate prevention | For any generated candidate set, no more than one non-voided recurring invoice exists for the same property, responsible billing account, charge type, and billing period. |
| Issued numbering uniqueness | Issued invoice numbers are unique and not reused after cancellation, void, or reissue. |
| Total correctness | Invoice total equals the sum of line amounts after configured rounding behavior. |
| Snapshot immutability | Issued snapshots do not change when source property, ownership, lot area, or configuration facts change later. |
| Decimal rounding stability | Decimal-safe calculation produces stable results for valid lot area, rate, and rounding metadata. |
| Void/reissue state transitions | Only valid lifecycle transitions occur, and issued records are not edited in place. |

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Business logic requires server authorization, audit, approval for issued financial actions, PII-minimized Board access, homeowner isolation, and support-service boundaries. |
| Property-Based Testing | Compliant | Financial correctness and lifecycle invariants are explicitly listed as PBT candidates. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
