# UOW-01 Domain Entities

## Entity Overview

UOW-01 owns foundational entities and value objects used by later units. These entities are technology-agnostic and intentionally avoid persistence annotations.

## User

| Field | Description |
|---|---|
| `id` | Stable user identifier |
| `email` | Normalized login email |
| `displayName` | User-facing name |
| `role` | One fixed role |
| `status` | `Invited`, `Active`, `Inactive`, `Locked` |
| `homeownerRef` | Optional link to homeowner profile created by later units |
| `mfaRequired` | Derived from role; true for System Administrator and Treasurer |
| `mfaEnrollmentStatus` | `NotRequired`, `RequiredNotEnrolled`, `Enrolled` |
| `createdAt` | Creation timestamp |
| `updatedAt` | Last update timestamp |

### Rules

- A user has exactly one fixed role.
- A Homeowner user must not gain access to homeowner resources unless later ownership links authorize the resource.
- Inactive or locked users cannot create full sessions.

## Role

Roles are fixed values:

- `SystemAdministrator`
- `Treasurer`
- `BillingStaff`
- `BoardMember`
- `Homeowner`

Custom roles are out of scope.

## Permission

| Field | Description |
|---|---|
| `code` | Stable permission code |
| `description` | Human-readable purpose |
| `resourceType` | Resource category the permission applies to |
| `action` | Read, create, update, delete, approve, export, or execute |

Permissions are not granted directly to users. They are resolved through the fixed role matrix.

## RolePermission

| Field | Description |
|---|---|
| `role` | Fixed role |
| `permissionCode` | Permission code |
| `scope` | Global, operational, own-resource, or read-only scope |

### Rules

- Missing role-permission combinations deny access.
- Permission resolution is deterministic and side-effect free.

## UserInvitation

| Field | Description |
|---|---|
| `id` | Invitation identifier |
| `email` | Invited email |
| `role` | Fixed role assigned by invitation |
| `status` | `Pending`, `Accepted`, `Expired`, `Cancelled` |
| `tokenDigest` | Non-reversible token verifier |
| `expiresAt` | Expiration timestamp |
| `invitedBy` | System Administrator user ID |
| `targetRef` | Optional target reference for later homeowner/account linking |
| `reason` | Optional administrative reason |
| `createdAt` | Creation timestamp |
| `acceptedAt` | Acceptance timestamp if used |

### Rules

- Token values are not stored directly.
- Only `Pending` and unexpired invitations can be accepted.
- Role cannot be changed during activation.

## UserSession

| Field | Description |
|---|---|
| `id` | Session identifier |
| `userId` | User identifier |
| `status` | `Active`, `MfaPending`, `Expired`, `Revoked` |
| `createdAt` | Creation timestamp |
| `expiresAt` | Expiration timestamp |
| `lastSeenAt` | Last activity timestamp |
| `revokedAt` | Revocation timestamp |
| `correlationId` | Current request correlation identifier when resolved |

### Rules

- `MfaPending` cannot access protected privileged functions.
- Logout changes active sessions to `Revoked`.
- Password reset revokes all sessions for the user.

## MfaEnrollment

| Field | Description |
|---|---|
| `id` | Enrollment identifier |
| `userId` | User identifier |
| `status` | `Pending`, `Active`, `Disabled` |
| `method` | Method type selected during NFR/implementation |
| `createdAt` | Creation timestamp |
| `activatedAt` | Activation timestamp |
| `disabledAt` | Disablement timestamp |

### Rules

- System Administrator and Treasurer accounts require active MFA enrollment for full access.
- MFA secret material is never exposed through audit or frontend state.

## LoginFailureRecord

| Field | Description |
|---|---|
| `id` | Failure record identifier |
| `userId` | User identifier when known |
| `sourceFingerprint` | Safe source fingerprint for unknown account attempts |
| `failureCount` | Count within the active failure window |
| `firstFailedAt` | First failure timestamp in window |
| `lastFailedAt` | Most recent failure timestamp |
| `lockedUntil` | Temporary lockout end timestamp if applied |

## PasswordResetRequest

| Field | Description |
|---|---|
| `id` | Reset request identifier |
| `userId` | User identifier |
| `status` | `Pending`, `Consumed`, `Expired`, `Cancelled` |
| `tokenDigest` | Non-reversible token verifier |
| `expiresAt` | Expiration timestamp |
| `createdAt` | Creation timestamp |
| `consumedAt` | Consumption timestamp |

### Rules

- Reset requests are single-use.
- Token values are not stored directly.
- Consumption invalidates active sessions.

## ActorContext

| Field | Description |
|---|---|
| `userId` | Authenticated user identifier |
| `roles` | Fixed role list, expected to contain one role in first implementation |
| `homeownerId` | Optional homeowner profile identifier |
| `correlationId` | Request correlation identifier |
| `sessionId` | Server-managed session identifier |

## ResourceRef

| Field | Description |
|---|---|
| `resourceType` | Stable resource type |
| `resourceId` | Stable resource identifier |
| `ownerScope` | Optional owner scope, such as billing account or property |

## AuditEntry

| Field | Description |
|---|---|
| `id` | Audit entry identifier |
| `occurredAt` | Timestamp |
| `actorUserId` | Acting user or system actor |
| `category` | `Security`, `Financial`, `System`, `Configuration`, `Import`, `Workflow` |
| `action` | Stable action code |
| `resourceRef` | Target resource reference |
| `correlationId` | Request correlation identifier |
| `reason` | Required for approval and financial-sensitive actions where applicable |
| `oldValue` | Safe snapshot before change |
| `newValue` | Safe snapshot after change |
| `result` | Success, denied, failed, or informational |
| `metadata` | Safe structured detail |

### Rules

- No update or delete operation exists in the application model.
- Sensitive values are redacted or omitted.

## ApprovalRequest

| Field | Description |
|---|---|
| `id` | Approval request identifier |
| `requesterUserId` | User requesting action |
| `targetRef` | Resource to be affected |
| `actionType` | Stable action type |
| `status` | `Pending`, `ApprovedPendingApply`, `Rejected`, `Cancelled`, `Applied`, `ApplyFailed` |
| `reason` | Request reason |
| `payloadSnapshot` | Safe requested action payload |
| `decisionUserId` | Treasurer deciding request |
| `decisionReason` | Approval or rejection reason |
| `createdAt` | Request timestamp |
| `decidedAt` | Decision timestamp |
| `appliedAt` | Application timestamp |
| `correlationId` | Request correlation identifier |

### Rules

- Requester cannot be decision user for sensitive financial requests.
- UOW-01 stores request state and delegates approved effects to owning domain services.

## SettingCategory

| Field | Description |
|---|---|
| `key` | Stable category key |
| `ownerUnit` | Owning unit |
| `visibility` | Admin-only, treasurer-read, operational-read, or public-safe |
| `schemaRef` | Validation schema reference |

## SettingValue

| Field | Description |
|---|---|
| `categoryKey` | Setting category |
| `settingKey` | Setting key |
| `value` | Safe structured value |
| `version` | Version number |
| `updatedBy` | User ID |
| `updatedAt` | Timestamp |

## Support Intents

### DocumentIntent

| Field | Description |
|---|---|
| `id` | Intent identifier |
| `documentType` | Invoice, receipt, SOA, report, or other later domain type |
| `sourceRef` | Source record reference |
| `status` | Pending, completed, failed, or cancelled |
| `requestedBy` | Actor user ID |
| `correlationId` | Correlation identifier |

### NotificationIntent

| Field | Description |
|---|---|
| `id` | Intent identifier |
| `notificationType` | Invitation, password reset, invoice, receipt, SOA, reminder, or other later type |
| `recipientRef` | User or contact target |
| `templateRef` | Template reference |
| `payload` | Safe structured placeholder data |
| `status` | Pending, completed, failed, or cancelled |

### StorageIntent

| Field | Description |
|---|---|
| `id` | Intent identifier |
| `purpose` | Upload, generated document, export, or temporary file |
| `ownerRef` | Owning resource reference |
| `status` | Pending, completed, failed, or cancelled |

### JobIntent

| Field | Description |
|---|---|
| `id` | Intent identifier |
| `jobType` | Billing batch, penalty run, reminder, email retry, import, report export, or SOA batch |
| `payload` | Safe structured job request |
| `status` | Pending, scheduled, running, completed, failed, or cancelled |

## Shared Value Objects

| Value Object | Rules |
|---|---|
| `Money` | PHP only; valid decimal string; no silent acceptance of invalid values |
| `DateRange` | Start is required; end is required; start must be less than or equal to end |
| `BillingPeriod` | Valid period identifier and date range; detailed billing rules belong to UOW-03 |
| `PageRequest` | Positive page and page size; page size bounded |
| `DomainError` | Stable code, safe message, category, correlation ID, and optional safe details |
| `AuditContext` | Actor, correlation ID, reason, and request metadata |
| `TransactionContext` | Unit of work boundary used by later domain services |

## Entity Relationship Summary

- User has one Role.
- User may have many UserSessions.
- User may have zero or one active MfaEnrollment.
- UserInvitation creates or activates one User.
- PasswordResetRequest belongs to one User.
- AuditEntry references ActorContext and ResourceRef.
- ApprovalRequest references requester User, optional decision User, target ResourceRef, and action handler contract.
- SettingValue belongs to a SettingCategory.
- Support intents reference ResourceRef and are implemented by UOW-08.

## Testable Properties

| Entity Area | PBT Category | Property |
|---|---|---|
| RolePermission | Invariant | Permission resolution denies unknown roles, unknown permissions, and missing matrix entries. |
| UserSession | Idempotence | Revoking an already revoked or expired session does not restore or duplicate access. |
| UserInvitation | Stateful | Invitation status cannot move from terminal states back to pending. |
| PasswordResetRequest | Idempotence | Consuming a token twice never changes credentials twice. |
| AuditEntry | Stateful | Append-only audit history preserves all previous entries unchanged. |
| ApprovalRequest | Stateful | Only documented state transitions are accepted. |
| Money and DateRange | Round-trip | Valid values parse and format consistently where formatting is lossless. |

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Entities model administrative MFA, deny-by-default role resolution, object authorization, safe sessions, audit immutability, and approval separation. |
| Property-Based Testing | Compliant | PBT-01 properties are identified for stateful and value-object entities. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
