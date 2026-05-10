# UOW-06 Business Logic Model

## Unit

- **Unit ID**: UOW-06
- **Unit Name**: Penalties, Delinquency, Waivers, and Reminders
- **Stage**: Functional Design

## Purpose

UOW-06 owns overdue detection, aging bucket classification, recurring non-compounding penalty source records, penalty waiver source records, delinquency facts, reminder eligibility, and reminder intent records. It consumes UOW-03 grace-period and charge-rule metadata, UOW-04 issued invoice and due-date facts, and UOW-05 payment, allocation, credit, reversal, correction, and balance-impact facts.

UOW-06 must not create invoices, invoice lines, invoice numbers, payments, allocations, credits, receipts, statements, reports, exports, rendered documents, sent emails, stored files, import batches, retry jobs, or mutable account-balance source-of-truth records.

## Business Logic Components

| Component | Responsibility |
|---|---|
| Overdue Evaluation | Determines overdue invoices from `evaluationDate`, due date, grace period, invoice status, and derived open amount. |
| Aging Classifier | Assigns aging buckets using configured or default day ranges measured from first overdue date. |
| Penalty Rule Resolver | Resolves UOW-03 penalty charge rule, grace-period metadata, rounding rule, and charge type for the evaluation date. |
| Penalty Engine | Creates draft and applied non-compounding penalty source records with snapshotted inputs. |
| Duplicate Penalty Guard | Prevents duplicate non-voided penalties for the same invoice, billing account, charge type, and penalty period. |
| Waiver Coordinator | Manages waiver request, approval, linked waiver source record creation, waiver limits, and balance-impact facts. |
| Delinquency Classifier | Derives delinquency amount and status from remaining unpaid open amount after payments, credits, reversals, corrections, and approved waivers. |
| Reminder Eligibility Engine | Determines reminder eligibility and duplicate suppression for invoice or account reminder scopes. |
| Reminder Intent Adapter | Creates reminder intent records through UOW-01 support contracts for later UOW-08 delivery. |
| Authorization Model | Enforces staff permissions, homeowner isolation, Board Member read-only access, and PII minimization. |

## Overdue Evaluation Flow

UOW-06 evaluates overdue status for an issued invoice using an explicit `evaluationDate`. Scheduled workflows pass the job business date. Manual staff reviews pass the selected review date. The server clock is not the financial control date.

An invoice is overdue when all conditions are true:

- the invoice is issued and non-voided;
- `evaluationDate` is after `dueDate + resolvedGracePeriodDays`;
- the invoice has positive open amount after UOW-05 payment, allocation, credit, reversal, and correction effects are applied as of the evaluation date.

Overdue status is derived from source facts and must not be manually toggled.

## Aging Classification Flow

Aging buckets are measured from the first overdue date. The first overdue date is the first calendar date after `dueDate + resolvedGracePeriodDays`. For overdue invoices, aging day count is `evaluationDate - firstOverdueDate + 1`, measured in whole HOA business-calendar days. Non-overdue invoices remain `Current`.

MVP default buckets are:

| Bucket | Meaning |
|---|---|
| `Current` | Not overdue as of the evaluation date. |
| `1-30` | 1 to 30 days since first overdue date. |
| `31-60` | 31 to 60 days since first overdue date. |
| `61-90` | 61 to 90 days since first overdue date. |
| `90+` | More than 90 days since first overdue date. |

Bucket definitions should be consumed as effective-dated configuration from UOW-03. UOW-06 may use the MVP defaults only until configured bucket metadata exists.

Delinquency and aging use remaining unpaid open amount after approved waivers and payment effects. A waived penalty no longer contributes to delinquent amount, but the original penalty remains visible in history.

## Penalty Period Flow

Recurring monthly penalties use a normalized penalty period key such as `YYYY-MM`, based on the evaluation date in the HOA business timezone.

Only one non-voided penalty source record is allowed for the same:

- invoice;
- responsible billing account;
- penalty charge type;
- penalty period.

Penalty source records in `Draft`, `Applied`, or `Reissued` status block duplicate creation for the same duplicate key. `Voided` records remain in history but do not block a linked correction or reissue workflow.

Replacement requires an explicit correction or reissue workflow with reason, actor, audit, and linkage to the prior penalty source record.

## Penalty Calculation Flow

UOW-03 supplies configuration primitives such as grace-period metadata, charge type, penalty charge rule references, and rounding rule references. UOW-06 owns penalty eligibility, calculation logic, duplicate prevention, penalty source records, and penalty balance-impact facts.

UOW-06 resolves the configured penalty charge rule for the evaluation date. The penalty is calculated against eligible unpaid regular invoice balance only.

Penalty source records snapshot:

- invoice ID;
- responsible billing account;
- evaluation date;
- penalty period key;
- first overdue date;
- basis amount;
- excluded amounts;
- resolved charge rule reference;
- rounding rule reference;
- charge type;
- calculated amount;
- calculation inputs and output.

Penalty calculation excludes prior penalty source records, penalty waivers, reminder fees, and penalty-on-penalty amounts from the basis. Only eligible unpaid principal or configured charge categories can form the penalty basis.

When an invoice is partially paid before evaluation, UOW-06 calculates eligibility and basis from the remaining eligible open amount after posted payments, allocations, credits, reversals, and approved corrections effective as of `evaluationDate`. UOW-06 must not calculate penalties from the original invoice amount when partial payments have reduced the eligible basis.

## Penalty Lifecycle Flow

Penalty source record statuses are:

- `Draft`;
- `Applied`;
- `Voided`;
- `Reissued`.

Applied financial history is immutable. Terminal statuses require reason and audit. Replacements create linked source records rather than editing applied penalty records in place.

Applied penalties create penalty-side balance-impact facts for later account balance derivation. UOW-06 does not maintain a mutable balance field.

## Waiver Flow

Penalty waiver requests require:

- target penalty source record;
- waiver amount or full-waiver flag;
- waiver date;
- reason;
- actor;
- approval reference;
- audit and correlation ID.

Approval creates a linked waiver source record and balance-impact fact. It must not delete or mutate the original penalty source record.

A waiver cannot exceed the current available unpaid amount of the target penalty after prior waivers, payments, credits, reversals, and corrections effective as of the waiver date. Excess waiver amount must not automatically become a credit.

Waiver approval processing is idempotent by approval request and target penalty source record. Reprocessing the same approved waiver command returns or references the existing waiver source record and must not create duplicate waiver balance-impact facts.

## Reminder Eligibility Flow

A reminder is eligible when:

- an invoice or account has positive overdue open amount after grace period and suppression rules;
- the homeowner has an authorized notification contact path;
- no duplicate reminder intent exists for the same scope and reminder period.

Reminder suppression uses configured suppression rules when available. MVP default behavior suppresses duplicate reminders for the same scope and reminder period and suppresses reminders when no authorized notification contact path exists.

UOW-06 creates reminder eligibility and reminder intent records only. UOW-08 later renders content, sends emails, retries failures, stores documents, and enforces download behavior. UOW-06 must not send SMTP emails directly or render or store reminder documents.

## Object Authorization Model

| Actor | Access |
|---|---|
| System Administrator | Administrative access according to permission matrix, with audit for sensitive actions. |
| Treasurer | Penalty oversight, waiver approval, delinquency review, reminder eligibility review, and read access according to permissions. |
| Billing Staff | Overdue review, penalty run preparation, waiver request submission, reminder intent preparation, and read access according to permissions. |
| Board Member | Read-only, PII-minimized access to authorized governance views. |
| Homeowner | Read only penalty, waiver, delinquency, and reminder status tied to their authorized billing accounts, properties, or homeowner profile. |

All reads and mutations are server-authorized. Frontend filtering is usability only.

## PBT Candidate Properties

| Property | Description |
|---|---|
| Overdue boundary dates | Evaluation exactly on due date plus grace is not overdue; dates after the boundary are overdue when open amount is positive. |
| Aging bucket classification | Each valid day count maps to exactly one configured bucket. |
| Duplicate penalty prevention | At most one non-voided penalty exists per invoice, billing account, charge type, and penalty period. |
| Non-compounding basis exclusion | Prior penalties, waivers, reminder fees, and penalty-on-penalty amounts never enter the penalty basis. |
| Partial-payment basis | Penalty basis decreases when eligible payments, credits, and corrections reduce open amount before evaluation. |
| Waiver amount limit | Approved waiver amount never exceeds available unpaid penalty amount. |
| Waiver idempotency | Reprocessing the same approved waiver command does not create duplicate waiver impact. |
| Reminder duplicate suppression | At most one reminder intent exists for the same reminder scope and reminder period. |
| Balance-impact conservation | Penalty impacts and waiver impacts reconcile to the expected signed balance-impact facts. |

## Boundary Summary

UOW-06 owns penalty, waiver, delinquency, aging, and reminder eligibility source facts. It does not own invoice generation, payment posting, report output, concrete document rendering, email delivery, file storage, import execution, retry jobs, or mutable account-balance source-of-truth records.

## Compliance Summary

| Extension | Status | Rationale |
|---|---|
| Security Baseline | Compliant | Object authorization, homeowner isolation, PII minimization, approval-backed waivers, audit, and support-intent boundaries are explicit. |
| Property-Based Testing | Compliant | Financial date, duplicate, non-compounding, waiver, reminder, and balance-impact properties are identified for PBT in later code generation. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
