CREATE TYPE "PenaltySourceStatus" AS ENUM ('Draft', 'Applied', 'Voided', 'Reissued');
CREATE TYPE "WaiverRequestStatus" AS ENUM ('Pending', 'Approved', 'Rejected', 'Cancelled');
CREATE TYPE "ReminderIntentStatus" AS ENUM ('Queued', 'Accepted', 'Suppressed', 'Failed', 'Cancelled');

CREATE TABLE "OverdueEvaluationSnapshot" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "billingAccountId" TEXT NOT NULL,
  "propertyId" TEXT,
  "responsibleHomeownerId" TEXT,
  "evaluationDate" TIMESTAMP(3) NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "resolvedGracePeriodDays" INTEGER NOT NULL,
  "openAmount" DECIMAL(14,2) NOT NULL,
  "overdue" BOOLEAN NOT NULL,
  "firstOverdueDate" TIMESTAMP(3),
  "agingDayCount" INTEGER NOT NULL,
  "agingBucket" TEXT NOT NULL,
  "sourceReferences" JSONB NOT NULL,
  "evaluatedByUserId" TEXT NOT NULL,
  "correlationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OverdueEvaluationSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PenaltySourceRecord" (
  "id" TEXT NOT NULL,
  "status" "PenaltySourceStatus" NOT NULL DEFAULT 'Draft',
  "invoiceId" TEXT NOT NULL,
  "responsibleBillingAccountId" TEXT NOT NULL,
  "propertyId" TEXT,
  "responsibleHomeownerId" TEXT,
  "penaltyChargeTypeId" TEXT NOT NULL,
  "penaltyPeriodKey" TEXT NOT NULL,
  "evaluationDate" TIMESTAMP(3) NOT NULL,
  "basisAmount" DECIMAL(14,2) NOT NULL,
  "excludedAmountDetails" JSONB NOT NULL,
  "rateBasisPoints" INTEGER NOT NULL,
  "roundingRuleVersionId" TEXT,
  "penaltyAmount" DECIMAL(14,2) NOT NULL,
  "configurationReferences" JSONB NOT NULL,
  "sourceReferences" JSONB NOT NULL,
  "replacementOfPenaltyId" TEXT,
  "reason" TEXT,
  "createdByUserId" TEXT NOT NULL,
  "appliedByUserId" TEXT,
  "correlationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "appliedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PenaltySourceRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PenaltyWaiverRequest" (
  "id" TEXT NOT NULL,
  "status" "WaiverRequestStatus" NOT NULL DEFAULT 'Pending',
  "penaltySourceRecordId" TEXT NOT NULL,
  "waiverAmount" DECIMAL(14,2),
  "fullWaiver" BOOLEAN NOT NULL DEFAULT false,
  "waiverEffectiveDate" TIMESTAMP(3) NOT NULL,
  "reason" TEXT NOT NULL,
  "approvalRequestId" TEXT,
  "requestedByUserId" TEXT NOT NULL,
  "decidedByUserId" TEXT,
  "decisionReason" TEXT,
  "correlationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "decidedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PenaltyWaiverRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PenaltyWaiverSourceRecord" (
  "id" TEXT NOT NULL,
  "waiverRequestId" TEXT NOT NULL,
  "penaltySourceRecordId" TEXT NOT NULL,
  "approvalRequestId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "waiverAmount" DECIMAL(14,2) NOT NULL,
  "availableBeforeWaiver" DECIMAL(14,2) NOT NULL,
  "waiverEffectiveDate" TIMESTAMP(3) NOT NULL,
  "reason" TEXT NOT NULL,
  "createdByUserId" TEXT NOT NULL,
  "correlationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PenaltyWaiverSourceRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReminderEligibilityRecord" (
  "id" TEXT NOT NULL,
  "reminderScopeType" TEXT NOT NULL,
  "reminderScopeId" TEXT NOT NULL,
  "reminderPeriodKey" TEXT NOT NULL,
  "evaluationDate" TIMESTAMP(3) NOT NULL,
  "billingAccountId" TEXT NOT NULL,
  "propertyId" TEXT,
  "homeownerId" TEXT,
  "overdueOpenAmount" DECIMAL(14,2) NOT NULL,
  "hasAuthorizedContactPath" BOOLEAN NOT NULL,
  "duplicateReminderExists" BOOLEAN NOT NULL,
  "suppressed" BOOLEAN NOT NULL,
  "suppressionReason" TEXT,
  "contactPathReference" JSONB,
  "sourceReferences" JSONB NOT NULL,
  "evaluatedByUserId" TEXT NOT NULL,
  "correlationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReminderEligibilityRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReminderIntentRecord" (
  "id" TEXT NOT NULL,
  "reminderEligibilityId" TEXT NOT NULL,
  "status" "ReminderIntentStatus" NOT NULL DEFAULT 'Queued',
  "supportIntentId" TEXT,
  "templateReferenceVersionId" TEXT,
  "requestedByUserId" TEXT NOT NULL,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "correlationId" TEXT NOT NULL,
  CONSTRAINT "ReminderIntentRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PenaltyBalanceImpactFact" (
  "id" TEXT NOT NULL,
  "sourceRecordType" TEXT NOT NULL,
  "sourceRecordId" TEXT NOT NULL,
  "penaltySourceRecordId" TEXT,
  "waiverSourceRecordId" TEXT,
  "billingAccountId" TEXT NOT NULL,
  "propertyId" TEXT,
  "invoiceId" TEXT,
  "amount" DECIMAL(14,2) NOT NULL,
  "effectiveDate" TIMESTAMP(3) NOT NULL,
  "correlationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PenaltyBalanceImpactFact_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OverdueEvaluationSnapshot_invoiceId_evaluationDate_idx" ON "OverdueEvaluationSnapshot"("invoiceId", "evaluationDate");
CREATE INDEX "OverdueEvaluationSnapshot_billingAccountId_evaluationDate_idx" ON "OverdueEvaluationSnapshot"("billingAccountId", "evaluationDate");
CREATE INDEX "OverdueEvaluationSnapshot_propertyId_evaluationDate_idx" ON "OverdueEvaluationSnapshot"("propertyId", "evaluationDate");
CREATE INDEX "OverdueEvaluationSnapshot_agingBucket_evaluationDate_idx" ON "OverdueEvaluationSnapshot"("agingBucket", "evaluationDate");
CREATE INDEX "OverdueEvaluationSnapshot_correlationId_idx" ON "OverdueEvaluationSnapshot"("correlationId");

CREATE UNIQUE INDEX "PenaltySourceRecord_invoiceId_responsibleBillingAccountId_penaltyChargeTypeId_penaltyPeriodKey_status_key" ON "PenaltySourceRecord"("invoiceId", "responsibleBillingAccountId", "penaltyChargeTypeId", "penaltyPeriodKey", "status");
CREATE INDEX "PenaltySourceRecord_status_evaluationDate_idx" ON "PenaltySourceRecord"("status", "evaluationDate");
CREATE INDEX "PenaltySourceRecord_responsibleBillingAccountId_status_idx" ON "PenaltySourceRecord"("responsibleBillingAccountId", "status");
CREATE INDEX "PenaltySourceRecord_propertyId_status_idx" ON "PenaltySourceRecord"("propertyId", "status");
CREATE INDEX "PenaltySourceRecord_responsibleHomeownerId_status_idx" ON "PenaltySourceRecord"("responsibleHomeownerId", "status");
CREATE INDEX "PenaltySourceRecord_replacementOfPenaltyId_idx" ON "PenaltySourceRecord"("replacementOfPenaltyId");
CREATE INDEX "PenaltySourceRecord_correlationId_idx" ON "PenaltySourceRecord"("correlationId");

CREATE INDEX "PenaltyWaiverRequest_status_createdAt_idx" ON "PenaltyWaiverRequest"("status", "createdAt");
CREATE INDEX "PenaltyWaiverRequest_penaltySourceRecordId_idx" ON "PenaltyWaiverRequest"("penaltySourceRecordId");
CREATE INDEX "PenaltyWaiverRequest_approvalRequestId_idx" ON "PenaltyWaiverRequest"("approvalRequestId");
CREATE INDEX "PenaltyWaiverRequest_correlationId_idx" ON "PenaltyWaiverRequest"("correlationId");

CREATE UNIQUE INDEX "PenaltyWaiverSourceRecord_waiverRequestId_key" ON "PenaltyWaiverSourceRecord"("waiverRequestId");
CREATE UNIQUE INDEX "PenaltyWaiverSourceRecord_idempotencyKey_key" ON "PenaltyWaiverSourceRecord"("idempotencyKey");
CREATE INDEX "PenaltyWaiverSourceRecord_penaltySourceRecordId_idx" ON "PenaltyWaiverSourceRecord"("penaltySourceRecordId");
CREATE INDEX "PenaltyWaiverSourceRecord_approvalRequestId_idx" ON "PenaltyWaiverSourceRecord"("approvalRequestId");
CREATE INDEX "PenaltyWaiverSourceRecord_correlationId_idx" ON "PenaltyWaiverSourceRecord"("correlationId");

CREATE UNIQUE INDEX "ReminderEligibilityRecord_reminderScopeType_reminderScopeId_reminderPeriodKey_key" ON "ReminderEligibilityRecord"("reminderScopeType", "reminderScopeId", "reminderPeriodKey");
CREATE INDEX "ReminderEligibilityRecord_billingAccountId_evaluationDate_idx" ON "ReminderEligibilityRecord"("billingAccountId", "evaluationDate");
CREATE INDEX "ReminderEligibilityRecord_propertyId_evaluationDate_idx" ON "ReminderEligibilityRecord"("propertyId", "evaluationDate");
CREATE INDEX "ReminderEligibilityRecord_homeownerId_evaluationDate_idx" ON "ReminderEligibilityRecord"("homeownerId", "evaluationDate");
CREATE INDEX "ReminderEligibilityRecord_suppressed_idx" ON "ReminderEligibilityRecord"("suppressed");
CREATE INDEX "ReminderEligibilityRecord_correlationId_idx" ON "ReminderEligibilityRecord"("correlationId");

CREATE INDEX "ReminderIntentRecord_reminderEligibilityId_status_idx" ON "ReminderIntentRecord"("reminderEligibilityId", "status");
CREATE INDEX "ReminderIntentRecord_supportIntentId_idx" ON "ReminderIntentRecord"("supportIntentId");
CREATE INDEX "ReminderIntentRecord_correlationId_idx" ON "ReminderIntentRecord"("correlationId");

CREATE INDEX "PenaltyBalanceImpactFact_sourceRecordType_sourceRecordId_idx" ON "PenaltyBalanceImpactFact"("sourceRecordType", "sourceRecordId");
CREATE INDEX "PenaltyBalanceImpactFact_penaltySourceRecordId_idx" ON "PenaltyBalanceImpactFact"("penaltySourceRecordId");
CREATE INDEX "PenaltyBalanceImpactFact_waiverSourceRecordId_idx" ON "PenaltyBalanceImpactFact"("waiverSourceRecordId");
CREATE INDEX "PenaltyBalanceImpactFact_billingAccountId_effectiveDate_idx" ON "PenaltyBalanceImpactFact"("billingAccountId", "effectiveDate");
CREATE INDEX "PenaltyBalanceImpactFact_propertyId_effectiveDate_idx" ON "PenaltyBalanceImpactFact"("propertyId", "effectiveDate");
CREATE INDEX "PenaltyBalanceImpactFact_invoiceId_idx" ON "PenaltyBalanceImpactFact"("invoiceId");
CREATE INDEX "PenaltyBalanceImpactFact_correlationId_idx" ON "PenaltyBalanceImpactFact"("correlationId");

ALTER TABLE "PenaltyWaiverSourceRecord" ADD CONSTRAINT "PenaltyWaiverSourceRecord_waiverRequestId_fkey" FOREIGN KEY ("waiverRequestId") REFERENCES "PenaltyWaiverRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PenaltyWaiverSourceRecord" ADD CONSTRAINT "PenaltyWaiverSourceRecord_penaltySourceRecordId_fkey" FOREIGN KEY ("penaltySourceRecordId") REFERENCES "PenaltySourceRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReminderIntentRecord" ADD CONSTRAINT "ReminderIntentRecord_reminderEligibilityId_fkey" FOREIGN KEY ("reminderEligibilityId") REFERENCES "ReminderEligibilityRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PenaltyBalanceImpactFact" ADD CONSTRAINT "PenaltyBalanceImpactFact_penaltySourceRecordId_fkey" FOREIGN KEY ("penaltySourceRecordId") REFERENCES "PenaltySourceRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PenaltyBalanceImpactFact" ADD CONSTRAINT "PenaltyBalanceImpactFact_waiverSourceRecordId_fkey" FOREIGN KEY ("waiverSourceRecordId") REFERENCES "PenaltyWaiverSourceRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
