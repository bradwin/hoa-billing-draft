# UOW-06 Business Rules

## Unit

- **Unit ID**: UOW-06
- **Unit Name**: Penalties, Delinquency, Waivers, and Reminders
- **Stage**: Functional Design

## Boundary Rules

| Rule ID | Rule |
|---|---|
| UOW06-BOUNDARY-001 | UOW-06 owns overdue evaluation, aging classification, penalty source records, waiver source records, delinquency facts, reminder eligibility records, reminder intent records, and penalty-side or waiver-side balance-impact facts. |
| UOW06-BOUNDARY-002 | UOW-06 must not create invoices, invoice lines, invoice numbers, payments, allocations, credits, receipts, statements, reports, exports, rendered documents, emails, stored files, import batches, retry jobs, or mutable account-balance source-of-truth records. |
| UOW06-BOUNDARY-003 | UOW-06 consumes UOW-03 grace-period and charge-rule metadata, UOW-04 issued invoice and due-date facts, and UOW-05 payment, allocation, credit, reversal, correction, and balance-impact facts. |
| UOW06-BOUNDARY-004 | UOW-06 records reminder intents through UOW-01 support contracts. UOW-08 owns rendering, storage, SMTP delivery, retries, and document download behavior. |

## Overdue and Aging Rules

| Rule ID | Rule |
|---|---|
| UOW06-OVERDUE-001 | UOW-06 evaluates overdue status using an explicit `evaluationDate` supplied by the penalty, aging, or reminder workflow. |
| UOW06-OVERDUE-002 | Scheduled workflows pass the job business date as `evaluationDate`; manual staff reviews pass the selected review date. |
| UOW06-OVERDUE-003 | The server clock must not be used as the financial control date for overdue, aging, penalty, waiver, or reminder evaluation. |
| UOW06-OVERDUE-004 | An issued, non-voided invoice is overdue only when `evaluationDate` is after `dueDate + resolvedGracePeriodDays` and the invoice has positive open amount after UOW-05 payment, allocation, credit, reversal, and correction effects are applied. |
| UOW06-OVERDUE-005 | Overdue status must be derived from source facts and must not be manually toggled. |
| UOW06-AGING-001 | Aging buckets are measured from the first overdue date. |
| UOW06-AGING-002 | MVP default aging buckets are `Current`, `1-30`, `31-60`, `61-90`, and `90+`. |
| UOW06-AGING-003 | Aging bucket definitions should be effective-dated configuration consumed from UOW-03. UOW-06 may use MVP defaults only until configured bucket metadata exists. |
| UOW06-AGING-004 | Delinquency and aging use remaining unpaid open amount after approved waivers and payment effects. |
| UOW06-AGING-005 | The first overdue date is the first calendar date after `dueDate + resolvedGracePeriodDays`. Aging day count is `evaluationDate - firstOverdueDate + 1` for overdue invoices, measured in whole HOA business-calendar days; non-overdue invoices remain `Current`. |

## Penalty Rules

| Rule ID | Rule |
|---|---|
| UOW06-PENALTY-001 | Recurring monthly penalties use a normalized penalty period key such as `YYYY-MM`, based on the evaluation date in the HOA business timezone. |
| UOW06-PENALTY-002 | UOW-06 resolves the configured penalty charge rule for the evaluation date before calculating a penalty. |
| UOW06-PENALTY-003 | Penalty amount is calculated against eligible unpaid regular invoice balance only. |
| UOW06-PENALTY-004 | Penalty calculation excludes prior penalty source records, penalty waivers, reminder fees, and penalty-on-penalty amounts from the penalty basis. |
| UOW06-PENALTY-005 | Only eligible unpaid principal or configured charge categories can form the penalty basis. |
| UOW06-PENALTY-006 | When an invoice is partially paid before penalty evaluation, penalty eligibility and basis use the remaining eligible open amount after posted payments, allocations, credits, reversals, and approved corrections effective as of `evaluationDate`. |
| UOW06-PENALTY-007 | UOW-06 must not calculate penalties from the original invoice amount when partial payments have reduced the eligible basis. |
| UOW06-PENALTY-008 | Penalty records must snapshot inputs, rule references, basis amount, excluded amount details, rounding rule, charge type, and output amount. |
| UOW06-PENALTY-009 | Penalty source record statuses are `Draft`, `Applied`, `Voided`, and `Reissued`. |
| UOW06-PENALTY-010 | Applied penalty financial history is immutable and must not be edited in place. |
| UOW06-PENALTY-011 | Terminal penalty statuses require reason and audit. |
| UOW06-PENALTY-012 | Replacements must create linked source records rather than editing applied penalty records in place. |
| UOW06-PENALTY-013 | UOW-03 supplies configuration primitives such as grace-period metadata, charge type, penalty charge rule references, and rounding rule references. UOW-06 owns penalty eligibility, calculation logic, duplicate prevention, penalty source records, and penalty balance-impact facts. |

## Duplicate Penalty Rules

| Rule ID | Rule |
|---|---|
| UOW06-DUPLICATE-001 | UOW-06 must prevent more than one non-voided penalty source record for the same invoice, responsible billing account, penalty charge type, and penalty period. |
| UOW06-DUPLICATE-002 | Duplicate penalty replacement requires an explicit correction or reissue workflow with audit and linkage. |
| UOW06-DUPLICATE-003 | Duplicate override, correction, or reissue actions must record actor, timestamp, reason, prior source record, replacement source record where applicable, and correlation ID. |
| UOW06-DUPLICATE-004 | Duplicate checks are blocked by penalty source records in `Draft`, `Applied`, or `Reissued` status. `Voided` records remain in history but do not block a linked correction or reissue workflow. |

## Waiver Rules

| Rule ID | Rule |
|---|---|
| UOW06-WAIVER-001 | Waiver requests require penalty source record, waiver amount or full-waiver flag, reason, actor, approval reference, audit, and correlation ID. |
| UOW06-WAIVER-002 | Approval creates a linked waiver source record and balance-impact fact. |
| UOW06-WAIVER-003 | A waiver must not delete or mutate the original penalty source record. |
| UOW06-WAIVER-004 | A waiver cannot exceed the current available unpaid amount of the target penalty after prior waivers, payments, credits, reversals, and corrections effective as of the waiver date. |
| UOW06-WAIVER-005 | Excess waiver amount must not automatically become a credit. |
| UOW06-WAIVER-006 | A waived penalty no longer contributes to delinquent amount, but the original penalty remains visible in history. |
| UOW06-WAIVER-007 | Waiver approval processing must be idempotent by approval request and target penalty source record. Reprocessing the same approved waiver command must return or reference the existing waiver source record and must not create duplicate waiver balance-impact facts. |

## Reminder Rules

| Rule ID | Rule |
|---|---|
| UOW06-REMINDER-001 | A reminder is eligible only when an invoice or account has positive overdue open amount after grace period and suppression rules. |
| UOW06-REMINDER-002 | Reminder eligibility requires an authorized homeowner notification contact path. |
| UOW06-REMINDER-003 | UOW-06 must prevent duplicate reminder intents for the same reminder scope and reminder period. |
| UOW06-REMINDER-004 | UOW-06 creates reminder eligibility and reminder intent records only. |
| UOW06-REMINDER-005 | UOW-06 must not send SMTP emails directly or render or store reminder documents. |
| UOW06-REMINDER-006 | Reminder suppression uses configured suppression rules when available. MVP default behavior suppresses duplicate reminders for the same scope and reminder period and suppresses reminders when no authorized notification contact path exists. |

## Access Rules

| Rule ID | Rule |
|---|---|
| UOW06-ACCESS-001 | Staff roles may manage penalties, waivers, aging, and reminder eligibility only according to permissions and object authorization. |
| UOW06-ACCESS-002 | Board Member access is read-only and PII-minimized. |
| UOW06-ACCESS-003 | Homeowners may read only penalty, waiver, delinquency, and reminder status tied to their authorized billing accounts, properties, or homeowner profile. |
| UOW06-ACCESS-004 | All reads and mutations must be server-authorized. Frontend filtering is not an authorization control. |
| UOW06-ACCESS-005 | Sensitive financial mutations must write audit entries with actor, timestamp, action, target, reason where applicable, and correlation ID. |

## PBT Rules

| Rule ID | Rule |
|---|---|
| UOW06-PBT-001 | Property-based tests must cover overdue boundary dates. |
| UOW06-PBT-002 | Property-based tests must cover aging bucket classification. |
| UOW06-PBT-003 | Property-based tests must cover penalty duplicate prevention. |
| UOW06-PBT-004 | Property-based tests must cover non-compounding basis exclusion. |
| UOW06-PBT-005 | Property-based tests must cover partial-payment penalty basis. |
| UOW06-PBT-006 | Property-based tests must cover waiver amount limits and waiver idempotency. |
| UOW06-PBT-007 | Property-based tests must cover reminder duplicate suppression. |
| UOW06-PBT-008 | Property-based tests must cover balance-impact conservation for penalties and waivers. |

## Compliance Summary

| Extension | Status | Rationale |
|---|---|
| Security Baseline | Compliant | Rules require server authorization, homeowner isolation, Board Member PII minimization, approval-backed waivers, audit, and support-intent boundaries. |
| Property-Based Testing | Compliant | Rules explicitly identify mandatory PBT properties for date, amount, duplicate, waiver, reminder, and balance-impact invariants. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
