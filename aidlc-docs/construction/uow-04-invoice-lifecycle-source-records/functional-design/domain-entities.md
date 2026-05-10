# UOW-04 Domain Entities

## Unit

- **Unit ID**: UOW-04
- **Unit Name**: Invoice Lifecycle and Invoice Source Records
- **Stage**: Functional Design

## Entity Summary

| Entity | Purpose |
|---|---|
| InvoiceBatch | Tracks a recurring invoice generation run and its selected scope. |
| BillingException | Records why a candidate property did not receive a recurring invoice. |
| Invoice | Owns the invoice source record and lifecycle status. |
| InvoiceLine | Owns invoice line source amounts and charge metadata. |
| IssuedInvoiceSnapshot | Owns immutable issued invoice header facts. |
| IssuedInvoiceLineSnapshot | Owns immutable issued line facts and calculation inputs. |
| InvoiceNumberAssignment | Records immutable issued invoice number assignment and numbering-rule reference. |
| InvoiceOpenAmountInput | Supplies UOW-04 invoice amount facts for later balance derivation. |
| InvoiceLifecycleAction | Records lifecycle action metadata for cancellation, void, and reissue workflows. |
| InvoiceDocumentIntent | Records a request for later document generation against an issued snapshot. |
| InvoiceEmailIntent | Records a request for later email delivery against an issued snapshot. |

## Enumerations

### InvoiceStatus

| Value | Meaning |
|---|---|
| `Draft` | Invoice has internal ID only and can be changed within draft rules. |
| `Issued` | Invoice has immutable invoice number and issued snapshot. |
| `Cancelled` | Invoice was cancelled with reason and audit. |
| `Voided` | Issued invoice was voided through approval and audit. |
| `Reissued` | Issued invoice was superseded by a linked new invoice source record. |

Payment-derived states such as `Paid`, `PartiallyPaid`, and `Overdue` are not UOW-04 lifecycle states. Later units derive those views from payment, allocation, and penalty facts.

### InvoiceOrigin

| Value | Meaning |
|---|---|
| `Recurring` | Invoice was created by recurring generation from billable property and configuration facts. |
| `Manual` | Invoice was created manually by staff with configured charge types and reason. |
| `Reissue` | Invoice was created as a replacement for a superseded issued invoice. |

### BillingExceptionStatus

| Value | Meaning |
|---|---|
| `Open` | Exception requires staff review or source data correction. |
| `Resolved` | Exception no longer applies after source correction or regeneration. |
| `Superseded` | Exception was replaced by a newer generation result for the same candidate. |

### IntentStatus

| Value | Meaning |
|---|---|
| `Queued` | Intent was recorded for later support processing. |
| `Accepted` | Later support unit accepted the intent. |
| `Failed` | Later support unit reported failure. |
| `Cancelled` | Intent was cancelled before completion. |

UOW-04 records intent state only to the extent provided by UOW-01 support contracts. UOW-08 owns delivery and retry behavior.

## InvoiceBatch

| Field | Description |
|---|---|
| `invoiceBatchId` | Stable system-generated identifier. |
| `billingPeriodKey` | Stable billing period identity from UOW-03 cycle resolution. |
| `billingPeriodStart` | Billing period start date. |
| `billingPeriodEnd` | Billing period end date. |
| `chargeTypeKey` | UOW-03 charge type used for recurring generation. |
| `scope` | Generation scope such as all billable properties or filtered subset. |
| `validationDate` | Date passed to UOW-02 billable validation; MVP value is billing period start date. |
| `status` | Batch review state such as open, completed, or superseded. |
| `createdBy` | Actor that started generation. |
| `createdAt` | Creation timestamp. |
| `correlationId` | Correlation ID for generation and audit. |

## BillingException

| Field | Description |
|---|---|
| `billingExceptionId` | Stable system-generated identifier. |
| `invoiceBatchId` | Generation batch that produced the exception. |
| `propertyId` | Candidate property that failed validation. |
| `homeownerId` | Responsible homeowner if known. |
| `billingAccountId` | Billing account if known. |
| `validationDate` | Date used for validation. |
| `failureCode` | Safe failure code from UOW-02, UOW-03, or UOW-04 validation. |
| `failureDetails` | Structured source validation details safe for staff review. |
| `status` | Exception status. |
| `correlationId` | Correlation ID for traceability. |
| `createdAt` | Creation timestamp. |
| `resolvedAt` | Resolution timestamp when applicable. |

## Invoice

| Field | Description |
|---|---|
| `invoiceId` | Stable internal invoice identifier. |
| `invoiceNumber` | Issued invoice number; null while draft. |
| `origin` | `Recurring`, `Manual`, or `Reissue`. |
| `status` | UOW-04 lifecycle status. |
| `invoiceBatchId` | Recurring batch when applicable. |
| `propertyId` | UOW-02 property reference. |
| `billingAccountId` | UOW-02 billing account reference. |
| `responsibleHomeownerId` | UOW-02 responsible homeowner reference. |
| `billingPeriodKey` | Billing period identity when applicable. |
| `billingPeriodStart` | Billing period start date when applicable. |
| `billingPeriodEnd` | Billing period end date when applicable. |
| `issueDate` | Date issued, null while draft. |
| `dueDate` | Due date calculated or entered for the invoice. |
| `currency` | Currency code. |
| `subtotalAmount` | Sum of line amounts before invoice-level totals if applicable. |
| `totalAmount` | Total invoice source amount. |
| `reason` | Manual creation, cancellation, void, or reissue reason when applicable. |
| `supersedesInvoiceId` | Prior invoice replaced by this invoice when reissued. |
| `supersededByInvoiceId` | Replacement invoice when this invoice is reissued. |
| `approvalRequestId` | UOW-01 approval request for issued void or reissue when applicable. |
| `createdBy` | Actor that created the invoice. |
| `createdAt` | Creation timestamp. |
| `updatedAt` | Last update timestamp for mutable draft metadata. |
| `issuedAt` | Issuance timestamp. |
| `correlationId` | Correlation ID for audit. |

## InvoiceLine

| Field | Description |
|---|---|
| `invoiceLineId` | Stable line identifier. |
| `invoiceId` | Parent invoice. |
| `lineNumber` | Stable ordering within invoice. |
| `chargeTypeKey` | UOW-03 configured charge type key. |
| `chargeCategory` | Resolved charge category. |
| `description` | Staff-visible line description. |
| `quantity` | Quantity or basis value. |
| `lotArea` | UOW-02 lot area for recurring dues when applicable. |
| `rate` | UOW-03 resolved rate for recurring dues when applicable. |
| `roundingRuleKey` | UOW-03 rounding rule reference. |
| `amount` | Line amount in currency minor units or decimal money representation. |
| `isManual` | Whether line was manually entered. |
| `isManualTaxLike` | Whether line is an explicit manual tax-like amount. |
| `manualReason` | Required reason for manual line when applicable. |
| `configurationVersionIds` | UOW-03 versions used for line validation or calculation. |

## IssuedInvoiceSnapshot

| Field | Description |
|---|---|
| `issuedInvoiceSnapshotId` | Stable snapshot identifier. |
| `invoiceId` | Source invoice. |
| `invoiceNumber` | Immutable issued invoice number. |
| `statusAtIssue` | Status at issuance. |
| `propertySnapshot` | Property identity facts needed for reproduction. |
| `billingAccountSnapshot` | Billing account identity facts at issuance. |
| `responsibleHomeownerSnapshot` | Homeowner identity facts required for invoice reproduction. |
| `billingPeriodSnapshot` | Billing period facts. |
| `dueDate` | Due date stored on issued invoice. |
| `totalAmount` | Issued total amount. |
| `configurationReferences` | UOW-03 configuration version references used. |
| `sourceReferences` | UOW-02 and UOW-03 source references used. |
| `createdAt` | Snapshot timestamp. |

## IssuedInvoiceLineSnapshot

| Field | Description |
|---|---|
| `issuedInvoiceLineSnapshotId` | Stable line snapshot identifier. |
| `issuedInvoiceSnapshotId` | Parent issued invoice snapshot. |
| `lineNumber` | Line order at issuance. |
| `chargeTypeSnapshot` | Charge type facts at issuance. |
| `lotArea` | Lot area used. |
| `rate` | Rate used. |
| `quantityOrBasis` | Quantity or calculation basis. |
| `roundingRuleSnapshot` | Rounding rule facts used. |
| `lineAmount` | Issued line amount. |
| `manualMetadata` | Manual charge metadata when applicable. |
| `taxLikeMetadata` | Manual tax-like metadata when applicable. |
| `calculationInputs` | Structured inputs used to calculate or validate the line. |

## InvoiceNumberAssignment

| Field | Description |
|---|---|
| `invoiceNumberAssignmentId` | Stable assignment identifier. |
| `invoiceId` | Issued invoice. |
| `invoiceNumber` | Immutable issued number. |
| `numberingRuleVersionId` | UOW-03 numbering metadata version used. |
| `assignedAt` | Assignment timestamp. |
| `assignedBy` | Actor or system context. |
| `correlationId` | Correlation ID for issuance. |

## InvoiceOpenAmountInput

| Field | Description |
|---|---|
| `invoiceOpenAmountInputId` | Stable identifier. |
| `invoiceId` | Issued invoice source record. |
| `sourceAmount` | Original invoice amount. |
| `currency` | Currency code. |
| `effectiveDate` | Issue date or source effective date for balance derivation. |
| `status` | Active, voided, or superseded input status. |
| `createdAt` | Creation timestamp. |

This entity is a source input for later balance derivation. It is not a mutable account-balance record.

## InvoiceLifecycleAction

| Field | Description |
|---|---|
| `invoiceLifecycleActionId` | Stable action identifier. |
| `invoiceId` | Affected invoice. |
| `actionType` | Cancel, void request, void approval, reissue request, or reissue completion. |
| `fromStatus` | Prior status. |
| `toStatus` | Resulting status. |
| `reason` | Required reason. |
| `approvalRequestId` | Approval reference when applicable. |
| `actorId` | Actor who performed the action. |
| `actionAt` | Action timestamp. |
| `correlationId` | Correlation ID for audit. |

## InvoiceDocumentIntent

| Field | Description |
|---|---|
| `invoiceDocumentIntentId` | Stable intent identifier. |
| `invoiceId` | Issued invoice. |
| `issuedInvoiceSnapshotId` | Snapshot to render later. |
| `templateReferenceVersionId` | UOW-03 template reference metadata if resolved. |
| `status` | Intent status. |
| `requestedBy` | Actor that requested the intent. |
| `requestedAt` | Request timestamp. |
| `correlationId` | Correlation ID for support workflow. |

## InvoiceEmailIntent

| Field | Description |
|---|---|
| `invoiceEmailIntentId` | Stable intent identifier. |
| `invoiceId` | Issued invoice. |
| `issuedInvoiceSnapshotId` | Snapshot to email later. |
| `recipientHomeownerId` | Intended recipient homeowner. |
| `templateReferenceVersionId` | UOW-03 template reference metadata if resolved. |
| `status` | Intent status. |
| `requestedBy` | Actor that requested the intent. |
| `requestedAt` | Request timestamp. |
| `correlationId` | Correlation ID for support workflow. |

## Entity Relationship Notes

- One `InvoiceBatch` may create many `Invoice` records and many `BillingException` records.
- One `Invoice` has one or more `InvoiceLine` records.
- An issued `Invoice` has one `IssuedInvoiceSnapshot` and one or more `IssuedInvoiceLineSnapshot` records.
- One issued `Invoice` has one `InvoiceNumberAssignment`.
- One issued `Invoice` creates invoice open-amount input facts for later balance derivation.
- A reissued `Invoice` links to the superseded invoice source record.
- Document and email intents reference issued invoice snapshots only.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Entities preserve audit, approval, authorization references, snapshot integrity, and support-service boundary references. |
| Property-Based Testing | Compliant | Entity design supports duplicate, numbering, total, snapshot, rounding, and state-transition properties. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
