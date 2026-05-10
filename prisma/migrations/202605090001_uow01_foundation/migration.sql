-- UOW-01 foundation schema.
-- Production deployment must run migrations with the migration/admin database role only.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE "RoleCode" AS ENUM ('SystemAdministrator', 'Treasurer', 'BillingStaff', 'BoardMember', 'Homeowner');
CREATE TYPE "UserStatus" AS ENUM ('Invited', 'Active', 'Inactive', 'Locked');
CREATE TYPE "SessionStatus" AS ENUM ('Active', 'MfaPending', 'Expired', 'Revoked');
CREATE TYPE "InvitationStatus" AS ENUM ('Pending', 'Accepted', 'Expired', 'Cancelled');
CREATE TYPE "MfaEnrollmentStatus" AS ENUM ('Pending', 'Active', 'Disabled');
CREATE TYPE "ResetStatus" AS ENUM ('Pending', 'Consumed', 'Expired', 'Cancelled');
CREATE TYPE "AuditCategory" AS ENUM ('Security', 'Financial', 'System', 'Configuration', 'Import', 'Workflow');
CREATE TYPE "AuditResult" AS ENUM ('Success', 'Denied', 'Failed', 'Info');
CREATE TYPE "ApprovalStatus" AS ENUM ('Pending', 'ApprovedPendingApply', 'Rejected', 'Cancelled', 'Applied', 'ApplyFailed');
CREATE TYPE "SupportIntentType" AS ENUM ('Notification', 'Document', 'Storage', 'Job');
CREATE TYPE "SupportIntentStatus" AS ENUM ('Pending', 'Scheduled', 'Running', 'Completed', 'Failed', 'Cancelled');

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "email" TEXT NOT NULL UNIQUE,
  "displayName" TEXT NOT NULL,
  "role" "RoleCode" NOT NULL,
  "status" "UserStatus" NOT NULL DEFAULT 'Invited',
  "homeownerRef" TEXT,
  "mfaRequired" BOOLEAN NOT NULL DEFAULT false,
  "mfaEnrollmentStatus" "MfaEnrollmentStatus" NOT NULL DEFAULT 'Pending',
  "passwordHash" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "User_role_status_idx" ON "User" ("role", "status");

CREATE TABLE "UserInvitation" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "email" TEXT NOT NULL,
  "role" "RoleCode" NOT NULL,
  "status" "InvitationStatus" NOT NULL DEFAULT 'Pending',
  "tokenDigest" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "invitedById" TEXT NOT NULL REFERENCES "User"("id"),
  "targetRef" TEXT,
  "reason" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "acceptedAt" TIMESTAMPTZ
);
CREATE INDEX "UserInvitation_email_status_idx" ON "UserInvitation" ("email", "status");
CREATE INDEX "UserInvitation_expiresAt_idx" ON "UserInvitation" ("expiresAt");

CREATE TABLE "UserSession" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL REFERENCES "User"("id"),
  "sessionDigest" TEXT NOT NULL UNIQUE,
  "status" "SessionStatus" NOT NULL DEFAULT 'Active',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "idleExpiresAt" TIMESTAMPTZ NOT NULL,
  "lastSeenAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "revokedAt" TIMESTAMPTZ,
  "correlationId" TEXT
);
CREATE INDEX "UserSession_user_status_idx" ON "UserSession" ("userId", "status");
CREATE INDEX "UserSession_expires_idx" ON "UserSession" ("expiresAt");
CREATE INDEX "UserSession_idle_expires_idx" ON "UserSession" ("idleExpiresAt");

CREATE TABLE "PasswordResetRequest" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL REFERENCES "User"("id"),
  "status" "ResetStatus" NOT NULL DEFAULT 'Pending',
  "tokenDigest" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "consumedAt" TIMESTAMPTZ
);
CREATE INDEX "PasswordReset_user_status_idx" ON "PasswordResetRequest" ("userId", "status");
CREATE INDEX "PasswordReset_expires_idx" ON "PasswordResetRequest" ("expiresAt");

CREATE TABLE "MfaEnrollment" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL REFERENCES "User"("id"),
  "status" "MfaEnrollmentStatus" NOT NULL DEFAULT 'Pending',
  "method" TEXT NOT NULL DEFAULT 'totp',
  "encryptedSecret" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "activatedAt" TIMESTAMPTZ,
  "disabledAt" TIMESTAMPTZ
);
CREATE INDEX "MfaEnrollment_user_status_idx" ON "MfaEnrollment" ("userId", "status");

CREATE TABLE "MfaRecoveryCode" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "enrollmentId" TEXT NOT NULL REFERENCES "MfaEnrollment"("id"),
  "codeHash" TEXT NOT NULL UNIQUE,
  "consumedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "MfaRecovery_enrollment_consumed_idx" ON "MfaRecoveryCode" ("enrollmentId", "consumedAt");

CREATE TABLE "LoginFailureRecord" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT,
  "normalizedEmailHash" TEXT,
  "sourceFingerprint" TEXT NOT NULL,
  "failureCount" INTEGER NOT NULL DEFAULT 0,
  "firstFailedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "lastFailedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "lockedUntil" TIMESTAMPTZ
);
CREATE INDEX "LoginFailure_user_source_idx" ON "LoginFailureRecord" ("userId", "sourceFingerprint");
CREATE INDEX "LoginFailure_email_source_idx" ON "LoginFailureRecord" ("normalizedEmailHash", "sourceFingerprint");
CREATE INDEX "LoginFailure_locked_until_idx" ON "LoginFailureRecord" ("lockedUntil");

CREATE TABLE "AuditEntry" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "occurredAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "actorUserId" TEXT,
  "category" "AuditCategory" NOT NULL,
  "action" TEXT NOT NULL,
  "resourceType" TEXT,
  "resourceId" TEXT,
  "correlationId" TEXT NOT NULL,
  "reason" TEXT,
  "oldValue" JSONB,
  "newValue" JSONB,
  "result" "AuditResult" NOT NULL,
  "metadata" JSONB,
  "streamKey" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL,
  "previousHash" TEXT,
  "recordHash" TEXT NOT NULL,
  "hashAlgorithm" TEXT NOT NULL DEFAULT 'sha256-v1',
  UNIQUE ("streamKey", "sequence")
);
CREATE INDEX "AuditEntry_occurred_idx" ON "AuditEntry" ("occurredAt");
CREATE INDEX "AuditEntry_actor_idx" ON "AuditEntry" ("actorUserId");
CREATE INDEX "AuditEntry_category_action_idx" ON "AuditEntry" ("category", "action");
CREATE INDEX "AuditEntry_resource_idx" ON "AuditEntry" ("resourceType", "resourceId");
CREATE INDEX "AuditEntry_correlation_idx" ON "AuditEntry" ("correlationId");

CREATE OR REPLACE FUNCTION reject_audit_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'AuditEntry rows are append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "AuditEntry_no_update"
BEFORE UPDATE ON "AuditEntry"
FOR EACH ROW EXECUTE FUNCTION reject_audit_mutation();

CREATE TRIGGER "AuditEntry_no_delete"
BEFORE DELETE ON "AuditEntry"
FOR EACH ROW EXECUTE FUNCTION reject_audit_mutation();

CREATE TABLE "SecurityEvent" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "auditEntryId" TEXT,
  "eventType" TEXT NOT NULL,
  "actorUserId" TEXT,
  "sourceFingerprint" TEXT,
  "correlationId" TEXT NOT NULL,
  "occurredAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "alertable" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB
);
CREATE INDEX "SecurityEvent_type_occurred_idx" ON "SecurityEvent" ("eventType", "occurredAt");
CREATE INDEX "SecurityEvent_actor_idx" ON "SecurityEvent" ("actorUserId");
CREATE INDEX "SecurityEvent_correlation_idx" ON "SecurityEvent" ("correlationId");

CREATE TABLE "ApprovalRequest" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "requesterUserId" TEXT NOT NULL REFERENCES "User"("id"),
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "actionType" TEXT NOT NULL,
  "status" "ApprovalStatus" NOT NULL DEFAULT 'Pending',
  "reason" TEXT NOT NULL,
  "payloadSnapshot" JSONB NOT NULL,
  "decisionUserId" TEXT REFERENCES "User"("id"),
  "decisionReason" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "decidedAt" TIMESTAMPTZ,
  "appliedAt" TIMESTAMPTZ,
  "correlationId" TEXT NOT NULL
);
CREATE INDEX "Approval_status_created_idx" ON "ApprovalRequest" ("status", "createdAt");
CREATE INDEX "Approval_requester_idx" ON "ApprovalRequest" ("requesterUserId");
CREATE INDEX "Approval_target_idx" ON "ApprovalRequest" ("targetType", "targetId");
CREATE INDEX "Approval_correlation_idx" ON "ApprovalRequest" ("correlationId");

CREATE TABLE "SettingCategory" (
  "key" TEXT PRIMARY KEY,
  "ownerUnit" TEXT NOT NULL,
  "visibility" TEXT NOT NULL,
  "schemaRef" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "SettingValue" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "categoryKey" TEXT NOT NULL REFERENCES "SettingCategory"("key"),
  "settingKey" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "updatedBy" TEXT NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("categoryKey", "settingKey")
);
CREATE INDEX "SettingValue_updated_by_idx" ON "SettingValue" ("updatedBy");

CREATE TABLE "SupportIntent" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "type" "SupportIntentType" NOT NULL,
  "purpose" TEXT NOT NULL,
  "sourceType" TEXT,
  "sourceId" TEXT,
  "recipientType" TEXT,
  "recipientId" TEXT,
  "status" "SupportIntentStatus" NOT NULL DEFAULT 'Pending',
  "payload" JSONB NOT NULL,
  "requestedBy" TEXT,
  "correlationId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "SupportIntent_type_status_idx" ON "SupportIntent" ("type", "status");
CREATE INDEX "SupportIntent_source_idx" ON "SupportIntent" ("sourceType", "sourceId");
CREATE INDEX "SupportIntent_correlation_idx" ON "SupportIntent" ("correlationId");

-- Deployment note:
-- Grant runtime app roles only the specific table privileges needed by generated repositories.
-- Runtime roles must not receive UPDATE or DELETE on "AuditEntry".
