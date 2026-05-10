# UOW-01 Business Logic Model

## Unit Scope

UOW-01 defines the foundation business behavior for access, settings, audit, approval core, shared kernel contracts, and support-service intent contracts. It does not implement financial source-record mutations or concrete document, storage, notification, or job adapters.

## Decisions Used

| Area | Decision |
|---|---|
| Session model | Email/password with server-managed sessions and secure httpOnly sameSite cookies |
| Roles | Fixed roles only, deny by default |
| Homeowner authorization | Explicit ownership links to billing accounts/properties |
| Invitations | Single-use, expiring, role-bound invitations |
| MFA | Required for System Administrator and Treasurer accounts; optional for other roles when supported |
| Abuse handling | Repeated failures produce progressive delay or temporary lockout and audit events |
| Audit | Append-only audit entries with actor, timestamp, action, resource, reason, old/new values, category, and correlation ID |
| Audit retention | Financial and security audit records are retained indefinitely by application behavior |
| Approval execution | UOW-01 delegates approved financial effects to owning domain services |
| Self-approval | Prohibited for sensitive financial requests |
| Settings | UOW-01 owns settings shell and HOA profile shell; domain settings are delegated |
| Support services | UOW-01 owns interfaces and intent records only; concrete adapters belong to UOW-08 |
| Errors | Structured safe domain errors with stable codes and correlation IDs |

## Core Actors

| Actor | Functional Role |
|---|---|
| System Administrator | Manages users, role assignments, foundation settings shell, and security/audit administration |
| Treasurer | Approves sensitive financial requests, reviews audit/reporting views, and has elevated financial governance permissions |
| Billing Staff | Performs operational billing workflows in later units and submits approval requests for sensitive changes |
| Board Member | Reads dashboards and reports without mutation permissions |
| Homeowner | Accesses only owned accounts, properties, documents, payments, statements, and profile requests |

## Authentication Flow

1. User submits email and password.
2. The system normalizes the email for lookup without exposing whether the account exists.
3. If the account is missing, inactive, locked, or the password is invalid, the response is a generic authentication failure.
4. Failed attempts are recorded against the account when known and against a source fingerprint when account identity is unknown.
5. Repeated failures apply progressive delay or temporary lockout according to the configured failure policy.
6. If credentials are valid and the role requires MFA, the session remains incomplete until MFA is satisfied.
7. If MFA is required and not enrolled, the user is routed into MFA enrollment before receiving full privileged access.
8. After all required factors are satisfied, the system creates a server-managed session, issues the secure session cookie, and records a successful authentication audit event.
9. Logout invalidates the server-side session and expires the client cookie.

## Invitation and Activation Flow

1. System Administrator creates an invitation with email, fixed role, optional target references, expiration, and reason.
2. The invitation is recorded as `Pending` and a notification intent is created for later delivery.
3. Activation validates that the invitation exists, is pending, is not expired, and has not been consumed.
4. The recipient establishes credentials and verified identity.
5. The invitation becomes `Accepted`, the user becomes active, and a login session may be created if MFA policy is satisfied.
6. Expired invitations transition to `Expired` and cannot be reused.
7. Used invitations cannot be reused even if the user activation later fails after commit.

## Password Reset Flow

1. A password reset request always returns a non-enumerating response.
2. If the account exists and is eligible, a single-use expiring reset request is created.
3. A notification intent is created for later delivery.
4. Reset consumption validates token existence, status, expiration, and account eligibility.
5. Successful password reset invalidates all active sessions for the user.
6. Consuming the same reset token again has no additional effect and returns a safe failure.
7. Password reset request and consumption events are audited without storing the token value.

## Authorization Flow

1. Every protected route or command requires an authenticated session unless explicitly marked public.
2. The backend resolves `ActorContext` from the server-side session.
3. Route-level permission checks compare the actor's fixed role against the permission matrix.
4. If a request references a resource ID, the owning domain must call the object authorization contract.
5. Operational roles are authorized by permission and domain rule.
6. Homeowner access is authorized only through explicit ownership links to billing accounts or properties.
7. Authorization errors fail closed, return structured safe errors, and record security audit events.
8. Client-side role-aware navigation is convenience only; it is never authoritative.

## Permission Model

Permissions are named capabilities, not editable user-specific grants. The role matrix is fixed for first implementation.

| Capability Area | System Administrator | Treasurer | Billing Staff | Board Member | Homeowner |
|---|---|---|---|---|---|
| User invitations and role assignment | Yes | No | No | No | No |
| Foundation settings shell | Yes | Read | No | No | No |
| Security and access audit query | Yes | Read | No | No | No |
| Operational audit query | Yes | Yes | Limited read | Read | Own records only when exposed |
| Approval queue view | No | Yes | Own requests | Read-only where allowed | No |
| Approval decision | No | Yes | No | No | No |
| Board dashboards and reports | Yes | Yes | Limited operational | Read | No |
| Homeowner self-service | No | No | Support read where authorized | No | Own records only |

Later domain units may add finer capability names, but they must map back to these fixed roles without custom user-level overrides.

## Audit Recording Flow

1. A mutating or security-sensitive action creates an audit context from the actor, correlation ID, request metadata, and optional reason.
2. The domain action supplies action name, resource reference, category, old value, new value, and result.
3. UOW-01 appends the audit entry.
4. Application code has no edit or delete operation for audit entries.
5. Financial and security audit records are retained indefinitely by application behavior.
6. Query and export access is role-restricted and filtered by category and resource scope.
7. Secrets, passwords, MFA codes, session IDs, raw tokens, and full credential values must not be written into audit details.

For financial mutations in later units, source-record changes and audit entries must commit in the same transaction wherever possible.

## Approval Core Flow

1. A later domain unit submits a sensitive request with target resource, action type, reason, and payload snapshot.
2. UOW-01 validates that the requester may request the action.
3. The request is recorded as `Pending`.
4. An authorized Treasurer views pending requests.
5. The requester cannot approve or reject their own sensitive financial request.
6. Approval records decision actor, timestamp, decision reason, and status.
7. UOW-01 delegates approved execution to the owning domain service through a registered action handler.
8. UOW-01 does not mutate invoice, payment, receipt, penalty, credit, adjustment, or account balance source records directly.
9. Rejected requests do not affect financial source records.
10. Applied or failed execution results remain linked to the approval request and audit trail.

## Approval State Model

| Current State | Allowed Next State | Rule |
|---|---|---|
| Pending | ApprovedPendingApply | Authorized Treasurer approves and is not requester |
| Pending | Rejected | Authorized Treasurer rejects and is not requester |
| Pending | Cancelled | Requester or authorized operational role cancels before decision |
| ApprovedPendingApply | Applied | Owning domain service applies effect successfully |
| ApprovedPendingApply | ApplyFailed | Owning domain service fails safely without partial financial state |
| ApplyFailed | ApprovedPendingApply | Authorized retry is allowed if owning domain service declares retry safe |

Terminal states are `Rejected`, `Cancelled`, and `Applied`.

## Settings Shell Flow

1. UOW-01 defines settings categories, setting keys, value schemas, visibility, and owning unit.
2. UOW-01 owns HOA profile shell fields and general foundation settings.
3. Billing configuration, numbering, SMTP details, storage adapters, document templates, and payment methods are delegated to later units through typed categories.
4. Settings changes require permission checks and audit entries with old and new values.
5. Unknown setting keys fail closed.
6. Domain-owned settings must be validated by the owning unit before being saved.

## Support-Service Intent Flow

UOW-01 defines contracts and intent records for later support services:

- Document generation requests.
- Storage requests and file references.
- Notification requests.
- Job scheduling and execution requests.

In UOW-01 through UOW-07, only interfaces and null/test implementations are allowed. Concrete SMTP, PDF, filesystem, and worker adapters belong to UOW-08. Domain units must create intents through the shared contracts instead of implementing ad hoc support logic.

## Shared Kernel Model

Shared kernel objects are simple, deterministic, and technology-agnostic:

- `ActorContext`
- `AuditContext`
- `ResourceRef`
- `DomainError`
- `CorrelationId`
- `Money`
- `DateRange`
- `BillingPeriod`
- `PageRequest`
- `PageResult`
- `TransactionContext`

`Money` must be constrained to PHP for this project. Amount parsing must reject invalid decimal strings rather than silently rounding. Rounding rules for billing amounts are owned later by UOW-03.

## Frontend Interaction Model

UOW-01 frontend screens are foundation screens only:

- Sign-in.
- Activation.
- Password reset request.
- Password reset completion.
- MFA enrollment/challenge for roles requiring MFA.
- Protected app shell.
- Role-aware navigation.
- Settings shell.
- Audit query shell.
- Approval queue shell.

All protected views depend on server-side authorization results. Hidden UI controls do not replace backend permission checks.

## Testable Properties

| Property | PBT Category | Description |
|---|---|---|
| Deny-by-default permission resolution | Invariant | Any undefined role/capability pair must resolve to denied. |
| Permission monotonicity does not exist by accident | Invariant | No role receives capabilities outside the explicit fixed matrix. |
| Homeowner resource isolation | Invariant | A homeowner actor may access only resources whose ownership graph includes that homeowner. |
| Approval state transitions | Stateful | Random valid and invalid decision sequences must never bypass allowed transitions. |
| Self-approval prohibition | Invariant | A requester cannot become the decision actor for the same sensitive request. |
| Audit append-only behavior | Stateful / Invariant | Appending entries increases the log; no command can mutate or remove existing entries. |
| Value object parse/format | Round-trip | Valid `DateRange`, `BillingPeriod`, `ResourceRef`, and `Money` values parse and format consistently where formatting is lossless. |
| Logout idempotency | Idempotence | Logging out an already invalidated session remains safe and does not recreate access. |
| Password reset token consumption | Idempotence | A consumed token cannot be consumed again to produce a second credential change. |

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Functional logic enforces deny-by-default authorization, object-level checks, MFA for administrative roles, abuse controls, safe errors, audit immutability, and approval separation. Infrastructure-specific encryption, network, and logging deployment details remain for later stages. |
| Property-Based Testing | Compliant | PBT-01 is satisfied by explicit testable properties for permissions, authorization, approval state, audit append behavior, value objects, logout, and password reset token consumption. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
