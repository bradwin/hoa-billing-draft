CREATE TYPE "HomeownerStatus" AS ENUM ('Active', 'Inactive', 'Deceased', 'Archived');
CREATE TYPE "PropertyBillingStatus" AS ENUM ('Billable', 'NonBillable', 'Exempt', 'CommonArea');
CREATE TYPE "PropertyLifecycleStatus" AS ENUM ('Active', 'Archived');
CREATE TYPE "OwnershipRole" AS ENUM ('PrimaryOwner', 'SecondaryOwner', 'AuthorizedRepresentative');
CREATE TYPE "BillingAccountPeriodStatus" AS ENUM ('Active', 'Closed');
CREATE TYPE "ContactChangeRequestStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

CREATE TABLE "Homeowner" (
  "id" TEXT NOT NULL,
  "homeownerCode" TEXT NOT NULL,
  "legalName" TEXT NOT NULL,
  "normalizedNameKey" TEXT NOT NULL,
  "status" "HomeownerStatus" NOT NULL DEFAULT 'Active',
  "primaryEmail" TEXT,
  "normalizedEmailKey" TEXT,
  "primaryPhone" TEXT,
  "normalizedPhoneKey" TEXT,
  "alternatePhone" TEXT,
  "mailingAddress" TEXT,
  "communicationPreference" TEXT,
  "emergencyContactName" TEXT,
  "emergencyContactPhone" TEXT,
  "notes" TEXT,
  "portalAccountUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Homeowner_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HomeownerDuplicateReview" (
  "id" TEXT NOT NULL,
  "submittedHomeownerId" TEXT,
  "candidateHomeownerIds" JSONB NOT NULL,
  "matchSignals" JSONB NOT NULL,
  "confirmedDistinct" BOOLEAN NOT NULL DEFAULT false,
  "reviewedByUserId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "correlationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HomeownerDuplicateReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Property" (
  "id" TEXT NOT NULL,
  "propertyCode" TEXT NOT NULL,
  "phaseOrSection" TEXT NOT NULL,
  "block" TEXT NOT NULL,
  "lot" TEXT NOT NULL,
  "street" TEXT NOT NULL,
  "houseNumber" TEXT,
  "canonicalIdentityKey" TEXT NOT NULL,
  "lotAreaSqm" DECIMAL(14,4),
  "propertyType" TEXT NOT NULL,
  "occupancyStatus" TEXT NOT NULL,
  "billingStatus" "PropertyBillingStatus" NOT NULL DEFAULT 'Billable',
  "lifecycleStatus" "PropertyLifecycleStatus" NOT NULL DEFAULT 'Active',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PropertyAlias" (
  "id" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "aliasType" TEXT NOT NULL,
  "aliasValue" TEXT NOT NULL,
  "normalizedAliasKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PropertyAlias_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OwnershipPeriod" (
  "id" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "homeownerId" TEXT NOT NULL,
  "role" "OwnershipRole" NOT NULL,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "isBillingResponsible" BOOLEAN NOT NULL DEFAULT false,
  "createdByUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closedAt" TIMESTAMP(3),
  CONSTRAINT "OwnershipPeriod_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OwnershipPeriod_effective_order_chk" CHECK ("effectiveTo" IS NULL OR "effectiveFrom" < "effectiveTo")
);

CREATE TABLE "BillingAccountPeriod" (
  "id" TEXT NOT NULL,
  "billingAccountRef" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "homeownerId" TEXT NOT NULL,
  "ownershipPeriodId" TEXT NOT NULL,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "status" "BillingAccountPeriodStatus" NOT NULL DEFAULT 'Active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closedAt" TIMESTAMP(3),
  CONSTRAINT "BillingAccountPeriod_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BillingAccountPeriod_effective_order_chk" CHECK ("effectiveTo" IS NULL OR "effectiveFrom" < "effectiveTo")
);

CREATE TABLE "ContactChangeRequest" (
  "id" TEXT NOT NULL,
  "homeownerId" TEXT NOT NULL,
  "requesterUserId" TEXT NOT NULL,
  "status" "ContactChangeRequestStatus" NOT NULL DEFAULT 'Pending',
  "requestedChanges" JSONB NOT NULL,
  "oldValues" JSONB NOT NULL,
  "newValues" JSONB NOT NULL,
  "remarks" TEXT,
  "decisionUserId" TEXT,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "decidedAt" TIMESTAMP(3),
  "correlationId" TEXT NOT NULL,
  CONSTRAINT "ContactChangeRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Homeowner_homeownerCode_key" ON "Homeowner"("homeownerCode");
CREATE INDEX "Homeowner_status_idx" ON "Homeowner"("status");
CREATE INDEX "Homeowner_normalizedNameKey_idx" ON "Homeowner"("normalizedNameKey");
CREATE INDEX "Homeowner_normalizedEmailKey_idx" ON "Homeowner"("normalizedEmailKey");
CREATE INDEX "Homeowner_normalizedPhoneKey_idx" ON "Homeowner"("normalizedPhoneKey");
CREATE INDEX "Homeowner_portalAccountUserId_idx" ON "Homeowner"("portalAccountUserId");

CREATE INDEX "HomeownerDuplicateReview_submittedHomeownerId_idx" ON "HomeownerDuplicateReview"("submittedHomeownerId");
CREATE INDEX "HomeownerDuplicateReview_reviewedByUserId_idx" ON "HomeownerDuplicateReview"("reviewedByUserId");
CREATE INDEX "HomeownerDuplicateReview_correlationId_idx" ON "HomeownerDuplicateReview"("correlationId");

CREATE UNIQUE INDEX "Property_propertyCode_key" ON "Property"("propertyCode");
CREATE UNIQUE INDEX "Property_canonicalIdentityKey_key" ON "Property"("canonicalIdentityKey");
CREATE INDEX "Property_phaseOrSection_block_lot_idx" ON "Property"("phaseOrSection", "block", "lot");
CREATE INDEX "Property_street_idx" ON "Property"("street");
CREATE INDEX "Property_billingStatus_lifecycleStatus_idx" ON "Property"("billingStatus", "lifecycleStatus");

CREATE UNIQUE INDEX "PropertyAlias_propertyId_normalizedAliasKey_key" ON "PropertyAlias"("propertyId", "normalizedAliasKey");
CREATE INDEX "PropertyAlias_normalizedAliasKey_idx" ON "PropertyAlias"("normalizedAliasKey");

CREATE INDEX "OwnershipPeriod_propertyId_role_effectiveFrom_effectiveTo_idx" ON "OwnershipPeriod"("propertyId", "role", "effectiveFrom", "effectiveTo");
CREATE INDEX "OwnershipPeriod_homeownerId_effectiveFrom_idx" ON "OwnershipPeriod"("homeownerId", "effectiveFrom");
CREATE INDEX "OwnershipPeriod_isBillingResponsible_idx" ON "OwnershipPeriod"("isBillingResponsible");

CREATE UNIQUE INDEX "BillingAccountPeriod_billingAccountRef_key" ON "BillingAccountPeriod"("billingAccountRef");
CREATE INDEX "BillingAccountPeriod_propertyId_effectiveFrom_effectiveTo_idx" ON "BillingAccountPeriod"("propertyId", "effectiveFrom", "effectiveTo");
CREATE INDEX "BillingAccountPeriod_homeownerId_effectiveFrom_idx" ON "BillingAccountPeriod"("homeownerId", "effectiveFrom");
CREATE INDEX "BillingAccountPeriod_propertyId_homeownerId_effectiveFrom_effectiveTo_idx" ON "BillingAccountPeriod"("propertyId", "homeownerId", "effectiveFrom", "effectiveTo");

CREATE INDEX "ContactChangeRequest_homeownerId_status_idx" ON "ContactChangeRequest"("homeownerId", "status");
CREATE INDEX "ContactChangeRequest_requesterUserId_status_idx" ON "ContactChangeRequest"("requesterUserId", "status");
CREATE INDEX "ContactChangeRequest_decisionUserId_idx" ON "ContactChangeRequest"("decisionUserId");
CREATE INDEX "ContactChangeRequest_submittedAt_idx" ON "ContactChangeRequest"("submittedAt");
CREATE INDEX "ContactChangeRequest_correlationId_idx" ON "ContactChangeRequest"("correlationId");

ALTER TABLE "Homeowner" ADD CONSTRAINT "Homeowner_portalAccountUserId_fkey" FOREIGN KEY ("portalAccountUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HomeownerDuplicateReview" ADD CONSTRAINT "HomeownerDuplicateReview_submittedHomeownerId_fkey" FOREIGN KEY ("submittedHomeownerId") REFERENCES "Homeowner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PropertyAlias" ADD CONSTRAINT "PropertyAlias_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OwnershipPeriod" ADD CONSTRAINT "OwnershipPeriod_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OwnershipPeriod" ADD CONSTRAINT "OwnershipPeriod_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "Homeowner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BillingAccountPeriod" ADD CONSTRAINT "BillingAccountPeriod_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BillingAccountPeriod" ADD CONSTRAINT "BillingAccountPeriod_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "Homeowner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BillingAccountPeriod" ADD CONSTRAINT "BillingAccountPeriod_ownershipPeriodId_fkey" FOREIGN KEY ("ownershipPeriodId") REFERENCES "OwnershipPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContactChangeRequest" ADD CONSTRAINT "ContactChangeRequest_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "Homeowner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
