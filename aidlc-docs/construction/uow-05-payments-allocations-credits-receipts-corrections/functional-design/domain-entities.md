# UOW-05 Domain Entities

## Unit

- **Unit ID**: UOW-05
- **Unit Name**: Payments, Allocations, Credits, Receipts, and Financial Corrections
- **Stage**: Functional Design

## Entity Summary

| Entity | Purpose |
|---|---|
| PaymentProof | Homeowner or staff-submitted evidence of payment before posting. |
| Payment | Immutable posted payment source record. |
| PaymentAllocation | Linked allocation from a posted payment or credit application to an invoice, line, or component. |
| Credit | Immutable credit source record created from unapplied overpayment or approved correction. |
| CreditApplication | Linked source record applying available credit to an eligible invoice or component. |
| Receipt | Receipt source record and immutable receipt number assigned after posting. |
| ReceiptSnapshot | Reproducible receipt facts captured at receipt creation. |
| PaymentReversal | Approved linked reversal record for a posted payment and its effects. |
| FinancialCorrection | Approved adjustment or correction source record for payment-side financial impacts. |
| BalanceImpactFact | Derived-ledger input fact created by UOW-05 for later Account Balance views. |
| ReceiptDocumentIntent | Durable intent to render/store a receipt document in UOW-08. |
| ReceiptEmailIntent | Durable intent to email a receipt in UOW-08. |

## PaymentProof

| Field | Description |
|---|---|
| `paymentProofId` | Stable proof identifier. |
| `proofStatus` | `Submitted`, `UnderReview`, `Rejected`, `Posted`, or `Cancelled`. |
| `homeownerId` | Homeowner submitting or associated with the proof. |
| `billingAccountId` | Billing account associated with the payment. |
| `propertyId` | Property associated with the payment where applicable. |
| `amount` | Positive payment amount. |
| `paymentDate` | Date the payment was made by the payer. |
| `paymentMethodKey` | UOW-03 configured payment method. |
| `externalReference` | Payment reference number when required by the resolved payment-method or proof-channel configuration, or when voluntarily supplied. |
| `targetInvoiceIds` | Optional issued invoice targets. |
| `attachmentIntentRef` | Optional support/file intent placeholder; concrete storage is UOW-08. |
| `submittedByActorId` | Actor who submitted the proof. |
| `reviewedByActorId` | Actor who reviewed the proof, when applicable. |
| `reason` | Rejection or cancellation reason when applicable. |
| `correlationId` | Cross-record trace ID. |

## Payment

| Field | Description |
|---|---|
| `paymentId` | Stable posted payment identifier. |
| `paymentStatus` | `Posted`, with `Reversed` derived from an approved linked reversal record and related reversal facts. |
| `paymentProofId` | Source proof reference when posted from proof. |
| `homeownerId` | Payer or responsible homeowner reference. |
| `billingAccountId` | Billing account receiving payment. |
| `propertyId` | Property reference where applicable. |
| `amount` | Posted payment amount. |
| `paymentDate` | Payer payment date. |
| `postingDate` | System posting date. |
| `paymentMethodKey` | UOW-03 payment method key. |
| `externalReference` | External payment reference captured from the proof or staff posting flow when required by resolved configuration or voluntarily supplied. |
| `duplicateOverrideRef` | Override audit reference when duplicate risk was approved. |
| `postedByActorId` | Actor who posted the payment. |
| `correlationId` | Cross-record trace ID. |

## PaymentAllocation

| Field | Description |
|---|---|
| `paymentAllocationId` | Stable allocation identifier. |
| `paymentId` | Posted payment source. |
| `invoiceId` | UOW-04 issued invoice target. |
| `invoiceLineId` | UOW-04 invoice line target where applicable. |
| `componentType` | `Penalty`, `Fee`, `Dues`, `RegularCharge`, or `ManualCharge`. |
| `amount` | Allocated amount. |
| `allocationMode` | `Automatic` or `Manual`. |
| `allocationOrder` | Ordering value used by allocation engine. |
| `reason` | Manual allocation reason where applicable. |
| `createdByActorId` | Actor or system context that created allocation. |
| `correlationId` | Cross-record trace ID. |

## Credit

| Field | Description |
|---|---|
| `creditId` | Stable credit source identifier. |
| `creditStatus` | `Available`, `Applied`, `PartiallyApplied`, or `Reversed`. |
| `sourceType` | `Overpayment`, `Correction`, or `OpeningBalanceCorrection`. |
| `sourcePaymentId` | Payment that produced the credit where applicable. |
| `billingAccountId` | Account that owns the credit. |
| `propertyId` | Property tied to the credit where applicable. |
| `originalAmount` | Immutable original credit amount. |
| `reason` | Reason or source explanation. |
| `createdByActorId` | Actor creating the credit. |
| `correlationId` | Cross-record trace ID. |

Available credit is derived from original credit amount minus linked applications and reversals. The original amount is not mutated.

## CreditApplication

| Field | Description |
|---|---|
| `creditApplicationId` | Stable application identifier. |
| `creditId` | Credit source record. |
| `invoiceId` | Target invoice. |
| `invoiceLineId` | Target line where applicable. |
| `componentType` | Target component category. |
| `amount` | Applied credit amount. |
| `applicationMode` | `StaffManaged` or future approved automatic mode. |
| `reason` | Required staff reason. |
| `createdByActorId` | Actor applying credit. |
| `correlationId` | Cross-record trace ID. |

## Receipt

| Field | Description |
|---|---|
| `receiptId` | Stable receipt identifier. |
| `receiptNumber` | Immutable receipt number assigned after posting succeeds. |
| `receiptStatus` | `Issued` or `Reversed`. |
| `paymentId` | Posted payment represented by receipt. |
| `receiptDate` | Date receipt was created. |
| `numberingRuleVersionId` | UOW-03 numbering metadata reference. |
| `createdByActorId` | Actor or system context that created receipt. |
| `correlationId` | Cross-record trace ID. |

## ReceiptSnapshot

| Field | Description |
|---|---|
| `receiptSnapshotId` | Stable snapshot identifier. |
| `receiptId` | Receipt source record. |
| `paymentSnapshot` | Payment ID, amount, payment date, posting date, method, and reference. |
| `payerSnapshot` | Homeowner or payer facts used when issued. |
| `billingAccountSnapshot` | Billing account facts used when issued. |
| `propertySnapshot` | Property facts where applicable. |
| `allocationSummary` | Allocation targets and amounts. |
| `creditRemainder` | Credit created from overpayment where applicable. |
| `configurationReferences` | UOW-03 payment method, numbering, and template reference versions. |
| `sourceProofReference` | Payment proof reference where applicable. |
| `actorSnapshot` | Actor who posted or created the receipt. |

## PaymentReversal

| Field | Description |
|---|---|
| `paymentReversalId` | Stable reversal identifier. |
| `paymentId` | Posted payment being reversed. |
| `approvalRequestId` | UOW-01 approval request. |
| `reversalEffectiveDate` | Date used for reversal impact. |
| `reason` | Required reversal reason. |
| `reversedByActorId` | Actor executing approved reversal. |
| `allocationReversalRefs` | Linked allocation reversal facts. |
| `receiptReversalRef` | Linked receipt reversal or invalidation fact. |
| `creditReversalRefs` | Linked credit reversal facts where applicable. |
| `correlationId` | Cross-record trace ID. |

## FinancialCorrection

| Field | Description |
|---|---|
| `financialCorrectionId` | Stable correction identifier. |
| `correctionType` | `Payment`, `Allocation`, `Credit`, `Receipt`, or `OpeningBalance`. |
| `sourceRecordType` | Type of source record being corrected. |
| `sourceRecordId` | Source record being corrected. |
| `approvalRequestId` | Approval request where required. |
| `amount` | Correction amount where applicable. |
| `effectiveDate` | Date used for balance impact. |
| `reason` | Required reason. |
| `createdByActorId` | Actor creating correction. |
| `correlationId` | Cross-record trace ID. |

## BalanceImpactFact

| Field | Description |
|---|---|
| `balanceImpactFactId` | Stable fact identifier. |
| `sourceRecordType` | `Payment`, `Allocation`, `Credit`, `CreditApplication`, `Receipt`, `PaymentReversal`, or `FinancialCorrection`. |
| `sourceRecordId` | Linked source record. |
| `billingAccountId` | Billing account affected. |
| `propertyId` | Property affected where applicable. |
| `invoiceId` | Invoice affected where applicable. |
| `amount` | Signed amount of impact. |
| `effectiveDate` | Date used by Account Balance derivation. |
| `correlationId` | Cross-record trace ID. |

BalanceImpactFact is not a mutable balance. Later units derive balances from source facts.

## Support Intent Entities

| Entity | Purpose |
|---|---|
| ReceiptDocumentIntent | Records request to render/store receipt PDF later in UOW-08. |
| ReceiptEmailIntent | Records request to send receipt email later in UOW-08. |

Both intent entities reference receipt snapshots and UOW-01 support contracts. They do not send emails, render PDFs, or store files.

## Entity Relationships

| Relationship | Rule |
|---|---|
| PaymentProof to Payment | A posted proof may produce one posted payment. |
| Payment to PaymentAllocation | A posted payment may have zero or more allocations. |
| Payment to Credit | A posted payment may create one credit for unapplied overpayment remainder. |
| Payment to Receipt | A posted payment must create one receipt source record after posting succeeds. |
| Receipt to ReceiptSnapshot | A receipt must have one reproducible snapshot. |
| Payment to PaymentReversal | A posted payment may have at most one reversal. |
| Credit to CreditApplication | A credit may have zero or more applications. |
| Source records to BalanceImpactFact | Financial source records create linked balance-impact facts. |

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Entities include actor, authorization scope, reason, audit correlation, and support-intent boundaries. |
| Property-Based Testing | Compliant | Entity relationships support allocation conservation, open amount limits, reversal restoration, and immutability checks. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
