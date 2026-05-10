CREATE TYPE "InvoiceStatus" AS ENUM ('Draft', 'Issued', 'Cancelled', 'Voided', 'Reissued');
CREATE TYPE "InvoiceOrigin" AS ENUM ('Recurring', 'Manual', 'Reissue');
CREATE TYPE "BillingExceptionStatus" AS ENUM ('Open', 'Resolved', 'Superseded');
CREATE TYPE "InvoiceIntentStatus" AS ENUM ('Queued', 'Accepted', 'Failed', 'Cancelled');

CREATE TABLE "InvoiceBatch" (
  "id" TEXT NOT NULL,
  "billingPeriodKey" TEXT NOT NULL,
  "billingPeriodStart" TIMESTAMP(3) NOT NULL,
  "billingPeriodEnd" TIMESTAMP(3) NOT NULL,
  "chargeTypeKey" TEXT NOT NULL,
  "scope" JSONB NOT NULL,
  "validationDate" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Open',
  "createdByUserId" TEXT NOT NULL,
  "correlationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InvoiceBatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BillingException" (
  "id" TEXT NOT NULL,
  "invoiceBatchId" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "homeownerId" TEXT,
  "billingAccountId" TEXT,
  "validationDate" TIMESTAMP(3) NOT NULL,
  "failureCode" TEXT NOT NULL,
  "failureDetails" JSONB NOT NULL,
  "status" "BillingExceptionStatus" NOT NULL DEFAULT 'Open',
  "correlationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  CONSTRAINT "BillingException_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Invoice" (
  "id" TEXT NOT NULL,
  "invoiceNumber" TEXT,
  "origin" "InvoiceOrigin" NOT NULL,
  "status" "InvoiceStatus" NOT NULL DEFAULT 'Draft',
  "invoiceBatchId" TEXT,
  "propertyId" TEXT NOT NULL,
  "billingAccountId" TEXT NOT NULL,
  "responsibleHomeownerId" TEXT NOT NULL,
  "billingPeriodKey" TEXT,
  "billingPeriodStart" TIMESTAMP(3),
  "billingPeriodEnd" TIMESTAMP(3),
  "issueDate" TIMESTAMP(3),
  "dueDate" TIMESTAMP(3) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'PHP',
  "subtotalAmount" DECIMAL(14,2) NOT NULL,
  "totalAmount" DECIMAL(14,2) NOT NULL,
  "reason" TEXT,
  "supersedesInvoiceId" TEXT,
  "supersededByInvoiceId" TEXT,
  "approvalRequestId" TEXT,
  "replacementOfInvoiceId" TEXT,
  "createdByUserId" TEXT NOT NULL,
  "correlationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "issuedAt" TIMESTAMP(3),
  CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InvoiceLine" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "lineNumber" INTEGER NOT NULL,
  "chargeTypeKey" TEXT NOT NULL,
  "chargeCategory" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "quantity" DECIMAL(14,4),
  "lotArea" DECIMAL(14,4),
  "rate" DECIMAL(14,4),
  "roundingRuleKey" TEXT,
  "amount" DECIMAL(14,2) NOT NULL,
  "isManual" BOOLEAN NOT NULL DEFAULT false,
  "isManualTaxLike" BOOLEAN NOT NULL DEFAULT false,
  "manualReason" TEXT,
  "configurationVersionIds" JSONB NOT NULL,
  CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IssuedInvoiceSnapshot" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "statusAtIssue" "InvoiceStatus" NOT NULL,
  "propertySnapshot" JSONB NOT NULL,
  "billingAccountSnapshot" JSONB NOT NULL,
  "homeownerSnapshot" JSONB NOT NULL,
  "billingPeriodSnapshot" JSONB,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "totalAmount" DECIMAL(14,2) NOT NULL,
  "configurationReferences" JSONB NOT NULL,
  "sourceReferences" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IssuedInvoiceSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IssuedInvoiceLineSnapshot" (
  "id" TEXT NOT NULL,
  "issuedInvoiceSnapshotId" TEXT NOT NULL,
  "lineNumber" INTEGER NOT NULL,
  "chargeTypeSnapshot" JSONB NOT NULL,
  "lotArea" DECIMAL(14,4),
  "rate" DECIMAL(14,4),
  "quantityOrBasis" TEXT,
  "roundingRuleSnapshot" JSONB,
  "lineAmount" DECIMAL(14,2) NOT NULL,
  "manualMetadata" JSONB,
  "taxLikeMetadata" JSONB,
  "calculationInputs" JSONB NOT NULL,
  CONSTRAINT "IssuedInvoiceLineSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InvoiceNumberAssignment" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "numberingRuleVersionId" TEXT,
  "numberingScope" TEXT NOT NULL,
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "assignedByUserId" TEXT NOT NULL,
  "correlationId" TEXT NOT NULL,
  CONSTRAINT "InvoiceNumberAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InvoiceOpenAmountInput" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "sourceAmount" DECIMAL(14,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'PHP',
  "effectiveDate" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InvoiceOpenAmountInput_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InvoiceLifecycleAction" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "actionType" TEXT NOT NULL,
  "fromStatus" "InvoiceStatus" NOT NULL,
  "toStatus" "InvoiceStatus" NOT NULL,
  "reason" TEXT NOT NULL,
  "approvalRequestId" TEXT,
  "actorUserId" TEXT NOT NULL,
  "actionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "correlationId" TEXT NOT NULL,
  CONSTRAINT "InvoiceLifecycleAction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InvoiceDocumentIntent" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "issuedInvoiceSnapshotId" TEXT NOT NULL,
  "templateReferenceVersionId" TEXT,
  "status" "InvoiceIntentStatus" NOT NULL DEFAULT 'Queued',
  "requestedByUserId" TEXT NOT NULL,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "correlationId" TEXT NOT NULL,
  CONSTRAINT "InvoiceDocumentIntent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InvoiceEmailIntent" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "issuedInvoiceSnapshotId" TEXT NOT NULL,
  "recipientHomeownerId" TEXT,
  "templateReferenceVersionId" TEXT,
  "status" "InvoiceIntentStatus" NOT NULL DEFAULT 'Queued',
  "requestedByUserId" TEXT NOT NULL,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "correlationId" TEXT NOT NULL,
  CONSTRAINT "InvoiceEmailIntent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE UNIQUE INDEX "InvoiceLine_invoiceId_lineNumber_key" ON "InvoiceLine"("invoiceId", "lineNumber");
CREATE UNIQUE INDEX "IssuedInvoiceSnapshot_invoiceId_key" ON "IssuedInvoiceSnapshot"("invoiceId");
CREATE UNIQUE INDEX "IssuedInvoiceLineSnapshot_snapshot_line_key" ON "IssuedInvoiceLineSnapshot"("issuedInvoiceSnapshotId", "lineNumber");
CREATE UNIQUE INDEX "InvoiceNumberAssignment_invoiceId_key" ON "InvoiceNumberAssignment"("invoiceId");
CREATE UNIQUE INDEX "InvoiceNumberAssignment_invoiceNumber_key" ON "InvoiceNumberAssignment"("invoiceNumber");
CREATE UNIQUE INDEX "Invoice_recurring_duplicate_open_idx" ON "Invoice"("propertyId", "billingAccountId", "billingPeriodKey") WHERE "origin" = 'Recurring' AND "status" <> 'Voided';

CREATE INDEX "InvoiceBatch_period_charge_idx" ON "InvoiceBatch"("billingPeriodKey", "chargeTypeKey");
CREATE INDEX "InvoiceBatch_createdAt_idx" ON "InvoiceBatch"("createdAt");
CREATE INDEX "InvoiceBatch_correlationId_idx" ON "InvoiceBatch"("correlationId");
CREATE INDEX "BillingException_batch_status_idx" ON "BillingException"("invoiceBatchId", "status");
CREATE INDEX "BillingException_property_status_idx" ON "BillingException"("propertyId", "status");
CREATE INDEX "BillingException_billingAccountId_idx" ON "BillingException"("billingAccountId");
CREATE INDEX "BillingException_failureCode_idx" ON "BillingException"("failureCode");
CREATE INDEX "BillingException_correlationId_idx" ON "BillingException"("correlationId");
CREATE INDEX "Invoice_status_origin_idx" ON "Invoice"("status", "origin");
CREATE INDEX "Invoice_property_status_idx" ON "Invoice"("propertyId", "status");
CREATE INDEX "Invoice_billingAccount_status_idx" ON "Invoice"("billingAccountId", "status");
CREATE INDEX "Invoice_homeowner_status_idx" ON "Invoice"("responsibleHomeownerId", "status");
CREATE INDEX "Invoice_period_status_idx" ON "Invoice"("billingPeriodKey", "status");
CREATE INDEX "Invoice_approvalRequestId_idx" ON "Invoice"("approvalRequestId");
CREATE INDEX "Invoice_correlationId_idx" ON "Invoice"("correlationId");
CREATE INDEX "InvoiceLine_chargeTypeKey_idx" ON "InvoiceLine"("chargeTypeKey");
CREATE INDEX "InvoiceLine_isManualTaxLike_idx" ON "InvoiceLine"("isManualTaxLike");
CREATE INDEX "InvoiceNumberAssignment_numberingScope_idx" ON "InvoiceNumberAssignment"("numberingScope");
CREATE INDEX "InvoiceNumberAssignment_correlationId_idx" ON "InvoiceNumberAssignment"("correlationId");
CREATE INDEX "InvoiceOpenAmountInput_invoice_status_idx" ON "InvoiceOpenAmountInput"("invoiceId", "status");
CREATE INDEX "InvoiceOpenAmountInput_effectiveDate_idx" ON "InvoiceOpenAmountInput"("effectiveDate");
CREATE INDEX "InvoiceLifecycleAction_invoice_actionAt_idx" ON "InvoiceLifecycleAction"("invoiceId", "actionAt");
CREATE INDEX "InvoiceLifecycleAction_approvalRequestId_idx" ON "InvoiceLifecycleAction"("approvalRequestId");
CREATE INDEX "InvoiceLifecycleAction_correlationId_idx" ON "InvoiceLifecycleAction"("correlationId");
CREATE INDEX "InvoiceDocumentIntent_invoice_status_idx" ON "InvoiceDocumentIntent"("invoiceId", "status");
CREATE INDEX "InvoiceDocumentIntent_correlationId_idx" ON "InvoiceDocumentIntent"("correlationId");
CREATE INDEX "InvoiceEmailIntent_invoice_status_idx" ON "InvoiceEmailIntent"("invoiceId", "status");
CREATE INDEX "InvoiceEmailIntent_recipientHomeownerId_idx" ON "InvoiceEmailIntent"("recipientHomeownerId");
CREATE INDEX "InvoiceEmailIntent_correlationId_idx" ON "InvoiceEmailIntent"("correlationId");

ALTER TABLE "BillingException" ADD CONSTRAINT "BillingException_invoiceBatchId_fkey" FOREIGN KEY ("invoiceBatchId") REFERENCES "InvoiceBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_invoiceBatchId_fkey" FOREIGN KEY ("invoiceBatchId") REFERENCES "InvoiceBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IssuedInvoiceSnapshot" ADD CONSTRAINT "IssuedInvoiceSnapshot_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IssuedInvoiceLineSnapshot" ADD CONSTRAINT "IssuedInvoiceLineSnapshot_snapshot_fkey" FOREIGN KEY ("issuedInvoiceSnapshotId") REFERENCES "IssuedInvoiceSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InvoiceNumberAssignment" ADD CONSTRAINT "InvoiceNumberAssignment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InvoiceOpenAmountInput" ADD CONSTRAINT "InvoiceOpenAmountInput_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InvoiceLifecycleAction" ADD CONSTRAINT "InvoiceLifecycleAction_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InvoiceDocumentIntent" ADD CONSTRAINT "InvoiceDocumentIntent_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InvoiceDocumentIntent" ADD CONSTRAINT "InvoiceDocumentIntent_snapshot_fkey" FOREIGN KEY ("issuedInvoiceSnapshotId") REFERENCES "IssuedInvoiceSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InvoiceEmailIntent" ADD CONSTRAINT "InvoiceEmailIntent_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InvoiceEmailIntent" ADD CONSTRAINT "InvoiceEmailIntent_snapshot_fkey" FOREIGN KEY ("issuedInvoiceSnapshotId") REFERENCES "IssuedInvoiceSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
