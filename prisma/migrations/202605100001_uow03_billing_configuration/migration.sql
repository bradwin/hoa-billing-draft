CREATE TYPE "ConfigurationType" AS ENUM ('DuesRate', 'BillingCycle', 'DueDate', 'GracePeriod', 'Rounding', 'ChargeType', 'NumberingFormat', 'TemplateReference', 'PaymentMethod');
CREATE TYPE "ConfigurationDraftStatus" AS ENUM ('Draft', 'PendingApproval', 'Rejected', 'Activated');
CREATE TYPE "ConfigurationVersionStatus" AS ENUM ('Active', 'Superseded', 'Retired');
CREATE TYPE "BillingCycleType" AS ENUM ('Monthly', 'Quarterly', 'SemiAnnual', 'Annual', 'Custom');
CREATE TYPE "DueDateBaseType" AS ENUM ('BillingPeriodStart', 'BillingPeriodEnd', 'InvoiceIssueDate');
CREATE TYPE "RoundingTiming" AS ENUM ('LineLevel', 'InvoiceTotalLevel');
CREATE TYPE "ChargeCategory" AS ENUM ('Dues', 'Assessment', 'ManualTaxLike', 'Fee', 'Discount', 'PenaltyConfig', 'Other');

CREATE TABLE "BillingConfigurationDraft" (
  "id" TEXT NOT NULL,
  "configurationType" "ConfigurationType" NOT NULL,
  "identityKey" TEXT NOT NULL,
  "scopeKey" TEXT NOT NULL DEFAULT 'hoa-default',
  "ruleType" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "status" "ConfigurationDraftStatus" NOT NULL DEFAULT 'Draft',
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "requiresTreasurerApproval" BOOLEAN NOT NULL DEFAULT true,
  "approvalRequestId" TEXT,
  "createdByUserId" TEXT NOT NULL,
  "remarks" TEXT,
  "correlationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BillingConfigurationDraft_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ConfigurationVersion" (
  "id" TEXT NOT NULL,
  "configurationType" "ConfigurationType" NOT NULL,
  "identityKey" TEXT NOT NULL,
  "scopeKey" TEXT NOT NULL DEFAULT 'hoa-default',
  "ruleType" TEXT NOT NULL,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "status" "ConfigurationVersionStatus" NOT NULL DEFAULT 'Active',
  "sourceDraftId" TEXT NOT NULL,
  "approvalRequestId" TEXT,
  "activatedByUserId" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "ruleMetadata" JSONB,
  "auditCorrelationId" TEXT NOT NULL,
  "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ConfigurationVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DuesRateRule" (
  "id" TEXT NOT NULL,
  "versionId" TEXT NOT NULL,
  "ratePerSqm" DECIMAL(14,4) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'PHP',
  "roundingRuleKey" TEXT NOT NULL,
  "chargeTypeKey" TEXT NOT NULL,
  CONSTRAINT "DuesRateRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BillingCycleRule" (
  "id" TEXT NOT NULL,
  "versionId" TEXT NOT NULL,
  "cycleType" "BillingCycleType" NOT NULL,
  "anchorDate" TIMESTAMP(3) NOT NULL,
  "customRule" JSONB,
  "periodLabelFormat" TEXT NOT NULL,
  CONSTRAINT "BillingCycleRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DueDateRule" (
  "id" TEXT NOT NULL,
  "versionId" TEXT NOT NULL,
  "baseDateType" "DueDateBaseType" NOT NULL,
  "dayOffset" INTEGER NOT NULL,
  CONSTRAINT "DueDateRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GracePeriodRule" (
  "id" TEXT NOT NULL,
  "versionId" TEXT NOT NULL,
  "graceDays" INTEGER NOT NULL,
  CONSTRAINT "GracePeriodRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RoundingRule" (
  "id" TEXT NOT NULL,
  "versionId" TEXT NOT NULL,
  "roundingMode" TEXT NOT NULL DEFAULT 'HalfUp',
  "moneyScale" INTEGER NOT NULL DEFAULT 2,
  "lotAreaScale" INTEGER NOT NULL DEFAULT 4,
  "rateScale" INTEGER NOT NULL DEFAULT 4,
  "roundingTiming" "RoundingTiming" NOT NULL DEFAULT 'LineLevel',
  CONSTRAINT "RoundingRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChargeType" (
  "id" TEXT NOT NULL,
  "versionId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" "ChargeCategory" NOT NULL,
  "isRecurringEligible" BOOLEAN NOT NULL DEFAULT false,
  "isManualEntryEligible" BOOLEAN NOT NULL DEFAULT false,
  "isAutomaticGenerationEligible" BOOLEAN NOT NULL DEFAULT false,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "ChargeType_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NumberingFormatRule" (
  "id" TEXT NOT NULL,
  "versionId" TEXT NOT NULL,
  "documentType" TEXT NOT NULL,
  "prefixTemplate" TEXT NOT NULL,
  "sequenceScope" TEXT NOT NULL,
  "padding" INTEGER NOT NULL,
  "resetPolicy" TEXT NOT NULL DEFAULT 'Never',
  CONSTRAINT "NumberingFormatRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TemplateReference" (
  "id" TEXT NOT NULL,
  "versionId" TEXT NOT NULL,
  "templateType" TEXT NOT NULL,
  "templateKey" TEXT NOT NULL,
  "versionLabel" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "TemplateReference_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentMethodDefinition" (
  "id" TEXT NOT NULL,
  "versionId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "instructions" TEXT,
  "referenceRequired" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "PaymentMethodDefinition_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BillingConfigurationDraft_configurationType_scopeKey_status_idx" ON "BillingConfigurationDraft"("configurationType", "scopeKey", "status");
CREATE INDEX "BillingConfigurationDraft_identityKey_scopeKey_ruleType_idx" ON "BillingConfigurationDraft"("identityKey", "scopeKey", "ruleType");
CREATE INDEX "BillingConfigurationDraft_approvalRequestId_idx" ON "BillingConfigurationDraft"("approvalRequestId");
CREATE INDEX "BillingConfigurationDraft_correlationId_idx" ON "BillingConfigurationDraft"("correlationId");
CREATE INDEX "ConfigurationVersion_configurationType_identityKey_scopeKey_ruleType_status_idx" ON "ConfigurationVersion"("configurationType", "identityKey", "scopeKey", "ruleType", "status");
CREATE INDEX "ConfigurationVersion_effectiveFrom_effectiveTo_idx" ON "ConfigurationVersion"("effectiveFrom", "effectiveTo");
CREATE INDEX "ConfigurationVersion_sourceDraftId_idx" ON "ConfigurationVersion"("sourceDraftId");
CREATE INDEX "ConfigurationVersion_approvalRequestId_idx" ON "ConfigurationVersion"("approvalRequestId");
CREATE INDEX "ConfigurationVersion_auditCorrelationId_idx" ON "ConfigurationVersion"("auditCorrelationId");
CREATE UNIQUE INDEX "DuesRateRule_versionId_key" ON "DuesRateRule"("versionId");
CREATE UNIQUE INDEX "BillingCycleRule_versionId_key" ON "BillingCycleRule"("versionId");
CREATE UNIQUE INDEX "DueDateRule_versionId_key" ON "DueDateRule"("versionId");
CREATE UNIQUE INDEX "GracePeriodRule_versionId_key" ON "GracePeriodRule"("versionId");
CREATE UNIQUE INDEX "RoundingRule_versionId_key" ON "RoundingRule"("versionId");
CREATE UNIQUE INDEX "ChargeType_versionId_key" ON "ChargeType"("versionId");
CREATE INDEX "ChargeType_code_category_active_idx" ON "ChargeType"("code", "category", "active");
CREATE UNIQUE INDEX "NumberingFormatRule_versionId_key" ON "NumberingFormatRule"("versionId");
CREATE INDEX "NumberingFormatRule_documentType_idx" ON "NumberingFormatRule"("documentType");
CREATE UNIQUE INDEX "TemplateReference_versionId_key" ON "TemplateReference"("versionId");
CREATE INDEX "TemplateReference_templateType_active_idx" ON "TemplateReference"("templateType", "active");
CREATE UNIQUE INDEX "PaymentMethodDefinition_versionId_key" ON "PaymentMethodDefinition"("versionId");
CREATE INDEX "PaymentMethodDefinition_code_active_idx" ON "PaymentMethodDefinition"("code", "active");
CREATE INDEX "PaymentMethodDefinition_sortOrder_idx" ON "PaymentMethodDefinition"("sortOrder");

ALTER TABLE "ConfigurationVersion" ADD CONSTRAINT "ConfigurationVersion_sourceDraftId_fkey" FOREIGN KEY ("sourceDraftId") REFERENCES "BillingConfigurationDraft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DuesRateRule" ADD CONSTRAINT "DuesRateRule_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ConfigurationVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BillingCycleRule" ADD CONSTRAINT "BillingCycleRule_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ConfigurationVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DueDateRule" ADD CONSTRAINT "DueDateRule_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ConfigurationVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GracePeriodRule" ADD CONSTRAINT "GracePeriodRule_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ConfigurationVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RoundingRule" ADD CONSTRAINT "RoundingRule_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ConfigurationVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChargeType" ADD CONSTRAINT "ChargeType_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ConfigurationVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "NumberingFormatRule" ADD CONSTRAINT "NumberingFormatRule_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ConfigurationVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TemplateReference" ADD CONSTRAINT "TemplateReference_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ConfigurationVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentMethodDefinition" ADD CONSTRAINT "PaymentMethodDefinition_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ConfigurationVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
