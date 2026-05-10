-- UOW-05 Payments, Allocations, Credits, Receipts, and Financial Corrections

CREATE TYPE "PaymentProofStatus" AS ENUM ('Submitted', 'UnderReview', 'Rejected', 'Posted', 'Cancelled');
CREATE TYPE "PaymentStatus" AS ENUM ('Posted', 'Reversed');
CREATE TYPE "CreditStatus" AS ENUM ('Available', 'PartiallyApplied', 'Applied', 'Reversed');
CREATE TYPE "ReceiptStatus" AS ENUM ('Issued', 'Reversed');
CREATE TYPE "PaymentIntentStatus" AS ENUM ('Queued', 'Accepted', 'Failed', 'Cancelled');

CREATE TABLE "PaymentProof" (
  "id" TEXT NOT NULL,
  "status" "PaymentProofStatus" NOT NULL DEFAULT 'Submitted',
  "homeownerId" TEXT NOT NULL,
  "billingAccountId" TEXT NOT NULL,
  "propertyId" TEXT,
  "amount" DECIMAL(14,2) NOT NULL,
  "paymentDate" TIMESTAMP(3) NOT NULL,
  "paymentMethodKey" TEXT NOT NULL,
  "externalReference" TEXT,
  "targetInvoiceIds" JSONB NOT NULL,
  "attachmentIntentRef" TEXT,
  "submittedByUserId" TEXT NOT NULL,
  "reviewedByUserId" TEXT,
  "reason" TEXT,
  "correlationId" TEXT NOT NULL,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PaymentProof_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'Posted',
  "paymentProofId" TEXT,
  "homeownerId" TEXT NOT NULL,
  "billingAccountId" TEXT NOT NULL,
  "propertyId" TEXT,
  "amount" DECIMAL(14,2) NOT NULL,
  "paymentDate" TIMESTAMP(3) NOT NULL,
  "postingDate" TIMESTAMP(3) NOT NULL,
  "paymentMethodKey" TEXT NOT NULL,
  "externalReference" TEXT,
  "duplicateOverrideReason" TEXT,
  "postedByUserId" TEXT NOT NULL,
  "correlationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentAllocation" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "invoiceLineId" TEXT,
  "componentType" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "allocationMode" TEXT NOT NULL,
  "allocationOrder" INTEGER NOT NULL DEFAULT 0,
  "reason" TEXT,
  "createdByUserId" TEXT NOT NULL,
  "correlationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentAllocation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Credit" (
  "id" TEXT NOT NULL,
  "status" "CreditStatus" NOT NULL DEFAULT 'Available',
  "sourceType" TEXT NOT NULL,
  "sourcePaymentId" TEXT,
  "billingAccountId" TEXT NOT NULL,
  "propertyId" TEXT,
  "originalAmount" DECIMAL(14,2) NOT NULL,
  "reason" TEXT NOT NULL,
  "createdByUserId" TEXT NOT NULL,
  "correlationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Credit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CreditApplication" (
  "id" TEXT NOT NULL,
  "creditId" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "invoiceLineId" TEXT,
  "componentType" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "reason" TEXT NOT NULL,
  "createdByUserId" TEXT NOT NULL,
  "correlationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CreditApplication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Receipt" (
  "id" TEXT NOT NULL,
  "receiptNumber" TEXT NOT NULL,
  "status" "ReceiptStatus" NOT NULL DEFAULT 'Issued',
  "paymentId" TEXT NOT NULL,
  "receiptDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "numberingRuleVersionId" TEXT,
  "createdByUserId" TEXT NOT NULL,
  "correlationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReceiptSnapshot" (
  "id" TEXT NOT NULL,
  "receiptId" TEXT NOT NULL,
  "paymentSnapshot" JSONB NOT NULL,
  "payerSnapshot" JSONB NOT NULL,
  "billingAccountSnapshot" JSONB NOT NULL,
  "propertySnapshot" JSONB,
  "allocationSummary" JSONB NOT NULL,
  "creditRemainder" DECIMAL(14,2) NOT NULL,
  "configurationReferences" JSONB NOT NULL,
  "sourceProofReference" JSONB,
  "actorSnapshot" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReceiptSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentReversal" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "approvalRequestId" TEXT,
  "reversalEffectiveDate" TIMESTAMP(3) NOT NULL,
  "reason" TEXT NOT NULL,
  "reversedByUserId" TEXT NOT NULL,
  "allocationReversalRefs" JSONB NOT NULL,
  "receiptReversalRef" JSONB,
  "creditReversalRefs" JSONB,
  "correlationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentReversal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FinancialCorrection" (
  "id" TEXT NOT NULL,
  "correctionType" TEXT NOT NULL,
  "sourceRecordType" TEXT NOT NULL,
  "sourceRecordId" TEXT NOT NULL,
  "approvalRequestId" TEXT,
  "amount" DECIMAL(14,2) NOT NULL,
  "effectiveDate" TIMESTAMP(3) NOT NULL,
  "reason" TEXT NOT NULL,
  "createdByUserId" TEXT NOT NULL,
  "correlationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FinancialCorrection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentBalanceImpactFact" (
  "id" TEXT NOT NULL,
  "sourceRecordType" TEXT NOT NULL,
  "sourceRecordId" TEXT NOT NULL,
  "paymentId" TEXT,
  "billingAccountId" TEXT NOT NULL,
  "propertyId" TEXT,
  "invoiceId" TEXT,
  "amount" DECIMAL(14,2) NOT NULL,
  "effectiveDate" TIMESTAMP(3) NOT NULL,
  "correlationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentBalanceImpactFact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReceiptDocumentIntent" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "receiptId" TEXT NOT NULL,
  "templateReferenceVersionId" TEXT,
  "status" "PaymentIntentStatus" NOT NULL DEFAULT 'Queued',
  "requestedByUserId" TEXT NOT NULL,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "correlationId" TEXT NOT NULL,
  CONSTRAINT "ReceiptDocumentIntent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReceiptEmailIntent" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "receiptId" TEXT NOT NULL,
  "recipientHomeownerId" TEXT,
  "templateReferenceVersionId" TEXT,
  "status" "PaymentIntentStatus" NOT NULL DEFAULT 'Queued',
  "requestedByUserId" TEXT NOT NULL,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "correlationId" TEXT NOT NULL,
  CONSTRAINT "ReceiptEmailIntent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Receipt_receiptNumber_key" ON "Receipt"("receiptNumber");
CREATE UNIQUE INDEX "Receipt_paymentId_key" ON "Receipt"("paymentId");
CREATE UNIQUE INDEX "ReceiptSnapshot_receiptId_key" ON "ReceiptSnapshot"("receiptId");
CREATE UNIQUE INDEX "PaymentReversal_paymentId_key" ON "PaymentReversal"("paymentId");

CREATE INDEX "PaymentProof_status_submittedAt_idx" ON "PaymentProof"("status", "submittedAt");
CREATE INDEX "PaymentProof_duplicate_risk_idx" ON "PaymentProof"("billingAccountId", "paymentMethodKey", "externalReference", "paymentDate");
CREATE INDEX "Payment_duplicate_risk_idx" ON "Payment"("billingAccountId", "paymentMethodKey", "externalReference", "paymentDate");
CREATE INDEX "Payment_status_postingDate_idx" ON "Payment"("status", "postingDate");
CREATE INDEX "PaymentAllocation_invoiceId_idx" ON "PaymentAllocation"("invoiceId");
CREATE INDEX "Credit_billingAccountId_status_idx" ON "Credit"("billingAccountId", "status");
CREATE INDEX "CreditApplication_creditId_idx" ON "CreditApplication"("creditId");
CREATE INDEX "PaymentBalanceImpactFact_billingAccountId_effectiveDate_idx" ON "PaymentBalanceImpactFact"("billingAccountId", "effectiveDate");
CREATE INDEX "ReceiptDocumentIntent_receiptId_status_idx" ON "ReceiptDocumentIntent"("receiptId", "status");
CREATE INDEX "ReceiptEmailIntent_receiptId_status_idx" ON "ReceiptEmailIntent"("receiptId", "status");

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentProofId_fkey" FOREIGN KEY ("paymentProofId") REFERENCES "PaymentProof"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Credit" ADD CONSTRAINT "Credit_sourcePaymentId_fkey" FOREIGN KEY ("sourcePaymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CreditApplication" ADD CONSTRAINT "CreditApplication_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "Credit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReceiptSnapshot" ADD CONSTRAINT "ReceiptSnapshot_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentReversal" ADD CONSTRAINT "PaymentReversal_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentBalanceImpactFact" ADD CONSTRAINT "PaymentBalanceImpactFact_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReceiptDocumentIntent" ADD CONSTRAINT "ReceiptDocumentIntent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReceiptDocumentIntent" ADD CONSTRAINT "ReceiptDocumentIntent_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReceiptEmailIntent" ADD CONSTRAINT "ReceiptEmailIntent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReceiptEmailIntent" ADD CONSTRAINT "ReceiptEmailIntent_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
