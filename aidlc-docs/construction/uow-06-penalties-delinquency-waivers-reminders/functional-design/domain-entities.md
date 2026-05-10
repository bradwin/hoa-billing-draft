# UOW-06 Domain Entities

## Unit

- **Unit ID**: UOW-06
- **Unit Name**: Penalties, Delinquency, Waivers, and Reminders
- **Stage**: Functional Design

## Entity Summary

| Entity | Purpose |
|---|---|
| OverdueEvaluation | Derived evaluation result for invoice overdue state at a supplied evaluation date. |
| AgingClassification | Derived aging bucket and delinquency amount for invoice or account scope. |
| PenaltySourceRecord | Immutable financial source record for an applied or draft penalty. |
| PenaltyRun | Batch or manual review context that evaluates penalty candidates. |
| PenaltyWaiverRequest | Approval-backed request to waive all or part of a penalty. |
| PenaltyWaiver | Linked waiver source record created after approval. |
| PenaltyBalanceImpactFact | Penalty-side or waiver-side input fact for later account balance derivation. |
| ReminderEligibility | Derived reminder eligibility result for invoice or account scope. |
| ReminderIntent | Durable reminder intent record for later UOW-08 delivery. |

## OverdueEvaluation

| Field | Description |
|---|---|
| `overdueEvaluationId` | Stable evaluation identifier where persisted. |
| `invoiceId` | UOW-04 issued invoice being evaluated. |
| `billingAccountId` | Responsible billing account. |
| `propertyId` | Property associated with the invoice where applicable. |
| `evaluationDate` | Explicit workflow-supplied financial control date. |
| `dueDate` | UOW-04 invoice due date. |
| `resolvedGracePeriodDays` | UOW-03 grace-period metadata used for evaluation. |
| `firstOverdueDate` | First date after due date plus grace period. |
| `agingDayCount` | Whole HOA business-calendar day count from first overdue date through evaluation date for overdue invoices. |
| `openAmount` | Positive derived open amount after UOW-05 effects as of evaluation date. |
| `isOverdue` | Derived overdue result. |
| `sourceFactRefs` | Source invoice, payment, allocation, credit, reversal, correction, and waiver references used. |
| `correlationId` | Cross-record trace ID. |

## AgingClassification

| Field | Description |
|---|---|
| `agingClassificationId` | Stable classification identifier where persisted. |
| `scopeType` | `Invoice` or `BillingAccount`. |
| `scopeId` | Invoice ID or billing account ID. |
| `evaluationDate` | Explicit workflow-supplied evaluation date. |
| `firstOverdueDate` | First overdue date used for bucket calculation. |
| `bucketKey` | `Current`, `1-30`, `31-60`, `61-90`, `90+`, or configured bucket key. |
| `bucketDefinitionRef` | Effective-dated aging bucket configuration reference where available. |
| `agingDayCount` | `evaluationDate - firstOverdueDate + 1` for overdue invoices, or zero for non-overdue current invoices. |
| `delinquentAmount` | Remaining unpaid open amount after approved waivers and payment effects. |
| `sourceFactRefs` | Source facts used for classification. |
| `correlationId` | Cross-record trace ID. |

## PenaltyRun

| Field | Description |
|---|---|
| `penaltyRunId` | Stable run identifier. |
| `runType` | `Scheduled` or `Manual`. |
| `evaluationDate` | Business date used for eligibility and calculation. |
| `penaltyPeriodKey` | Normalized period key such as `YYYY-MM`. |
| `runStatus` | `Draft`, `Applied`, `Cancelled`, or `Failed`. |
| `candidateCount` | Number of evaluated candidates. |
| `appliedCount` | Number of applied penalties. |
| `exceptionCount` | Number of skipped or exceptioned candidates. |
| `createdByActorId` | Actor or system context that created the run. |
| `correlationId` | Cross-record trace ID. |

## PenaltySourceRecord

| Field | Description |
|---|---|
| `penaltySourceRecordId` | Stable penalty source record identifier. |
| `penaltyStatus` | `Draft`, `Applied`, `Voided`, or `Reissued`. |
| `penaltyRunId` | Source run where applicable. |
| `invoiceId` | Target UOW-04 issued invoice. |
| `billingAccountId` | Responsible billing account. |
| `propertyId` | Property associated with the penalty where applicable. |
| `penaltyChargeTypeKey` | UOW-03 configured penalty charge type. |
| `penaltyPeriodKey` | Normalized period key such as `YYYY-MM`. |
| `evaluationDate` | Date used to evaluate eligibility and calculate amount. |
| `basisAmount` | Eligible unpaid regular invoice balance used as calculation basis. |
| `excludedAmountSnapshot` | Prior penalties, waivers, reminder fees, and other excluded amounts. |
| `calculatedAmount` | Penalty amount after rule and rounding application. |
| `chargeRuleVersionId` | UOW-03 penalty charge rule reference. |
| `roundingRuleVersionId` | UOW-03 rounding rule reference. |
| `replacesPenaltySourceRecordId` | Prior source record when reissued. |
| `duplicateBlockingStatus` | Whether current status blocks duplicate penalty creation for the same invoice, billing account, charge type, and period. |
| `reason` | Void, reissue, or manual reason where applicable. |
| `createdByActorId` | Actor or system context that created the penalty. |
| `correlationId` | Cross-record trace ID. |

## PenaltyWaiverRequest

| Field | Description |
|---|---|
| `penaltyWaiverRequestId` | Stable waiver request identifier. |
| `penaltySourceRecordId` | Target penalty source record. |
| `requestedAmount` | Requested waiver amount when partial. |
| `fullWaiverRequested` | Whether request waives all available unpaid penalty amount. |
| `waiverDate` | Date used to evaluate available unpaid penalty amount. |
| `reason` | Required waiver reason. |
| `requestStatus` | `Pending`, `Approved`, `Rejected`, or `Cancelled`. |
| `approvalRequestId` | UOW-01 approval request reference. |
| `idempotencyKey` | Stable key based on approval request and target penalty source record. |
| `requestedByActorId` | Actor requesting waiver. |
| `correlationId` | Cross-record trace ID. |

## PenaltyWaiver

| Field | Description |
|---|---|
| `penaltyWaiverId` | Stable waiver source record identifier. |
| `penaltyWaiverRequestId` | Approved waiver request. |
| `penaltySourceRecordId` | Target penalty source record. |
| `waiverAmount` | Approved waiver amount. |
| `waiverDate` | Effective waiver date. |
| `availablePenaltyAmountSnapshot` | Available unpaid penalty amount at approval. |
| `approvalRequestId` | UOW-01 approval reference. |
| `idempotencyKey` | Stable key used to prevent duplicate waiver source records and duplicate waiver balance-impact facts. |
| `reason` | Approved waiver reason. |
| `approvedByActorId` | Actor completing approved waiver. |
| `correlationId` | Cross-record trace ID. |

## PenaltyBalanceImpactFact

| Field | Description |
|---|---|
| `penaltyBalanceImpactFactId` | Stable fact identifier. |
| `sourceRecordType` | `PenaltySourceRecord` or `PenaltyWaiver`. |
| `sourceRecordId` | Linked source record. |
| `billingAccountId` | Billing account affected. |
| `propertyId` | Property affected where applicable. |
| `invoiceId` | Invoice affected. |
| `amount` | Signed amount of impact. |
| `effectiveDate` | Date used by Account Balance derivation. |
| `correlationId` | Cross-record trace ID. |

PenaltyBalanceImpactFact is not a mutable balance. Later units derive balances from source facts.

## ReminderEligibility

| Field | Description |
|---|---|
| `reminderEligibilityId` | Stable eligibility identifier where persisted. |
| `scopeType` | `Invoice` or `BillingAccount`. |
| `scopeId` | Invoice ID or billing account ID. |
| `homeownerId` | Homeowner associated with reminder. |
| `billingAccountId` | Billing account associated with reminder. |
| `propertyId` | Property associated with reminder where applicable. |
| `evaluationDate` | Explicit workflow-supplied evaluation date. |
| `reminderPeriodKey` | Normalized reminder period key. |
| `overdueAmount` | Positive overdue open amount after suppression rules. |
| `contactPathRef` | Authorized notification contact path reference. |
| `suppressionRuleRef` | Configured suppression rule reference where available. |
| `suppressionReason` | Duplicate period, missing authorized contact path, or configured suppression reason when ineligible. |
| `isEligible` | Derived eligibility result. |
| `ineligibilityReason` | Reason when not eligible. |
| `correlationId` | Cross-record trace ID. |

## ReminderIntent

| Field | Description |
|---|---|
| `reminderIntentId` | Stable reminder intent identifier. |
| `scopeType` | `Invoice` or `BillingAccount`. |
| `scopeId` | Invoice ID or billing account ID. |
| `homeownerId` | Homeowner recipient. |
| `billingAccountId` | Billing account reference. |
| `propertyId` | Property reference where applicable. |
| `reminderPeriodKey` | Normalized reminder period key. |
| `suppressionRuleSnapshot` | Suppression rules and default suppression checks evaluated before intent creation. |
| `intentStatus` | `Queued`, `Accepted`, `Failed`, or `Cancelled`. |
| `supportIntentRef` | UOW-01 support contract reference for later UOW-08 handling. |
| `eligibilitySnapshot` | Eligibility facts used when intent was created. |
| `createdByActorId` | Actor or system context that created the intent. |
| `correlationId` | Cross-record trace ID. |

ReminderIntent does not send emails, render documents, store files, or run retries.

## Entity Relationships

| Relationship | Rule |
|---|---|
| Invoice to OverdueEvaluation | An issued invoice can be evaluated for overdue status at multiple evaluation dates. |
| OverdueEvaluation to AgingClassification | Aging classification uses overdue date and open amount facts from evaluation. |
| PenaltyRun to PenaltySourceRecord | A penalty run may create zero or more penalty source records. |
| PenaltySourceRecord to PenaltyWaiverRequest | A penalty may have zero or more waiver requests. |
| PenaltyWaiverRequest to PenaltyWaiver | An approved waiver request creates one linked waiver source record. |
| PenaltySourceRecord to PenaltyBalanceImpactFact | An applied penalty creates linked balance-impact facts. |
| PenaltyWaiver to PenaltyBalanceImpactFact | An approved waiver creates linked balance-impact facts. |
| ReminderEligibility to ReminderIntent | Eligible reminder evaluations may create durable reminder intent records. |

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Entities include actor, authorization scope, approval reference, reason, audit correlation, and support-intent boundaries. |
| Property-Based Testing | Compliant | Entity relationships support duplicate prevention, waiver limits, reminder suppression, and balance-impact conservation checks. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
