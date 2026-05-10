# UOW-01 Logical Components

## Unit

- **Unit ID**: UOW-01
- **Unit Name**: Platform Foundation, Access, Settings, Audit, and Approval Core
- **Stage**: NFR Design

## Summary

This artifact defines the logical components needed to implement the approved UOW-01 functional and non-functional design. Component names are logical, not final package or class names. Code Generation will map them into the TypeScript modular monolith structure.

## Component Inventory

| Component | Responsibility | Primary NFR Responsibilities |
|---|---|---|
| Configuration Component | Validate runtime configuration, expose typed settings, redact secrets, and support future secrets manager integration. | SECURITY-09, SECURITY-10, SECURITY-12, SECURITY-15 |
| Correlation Component | Create, propagate, and expose request correlation IDs across API, logs, audit, and support intents. | SECURITY-03, SECURITY-13, SECURITY-15 |
| HTTP Security Component | Apply security headers, CSP, CORS, cookie policy, and CSRF controls. | SECURITY-04, SECURITY-08, SECURITY-12 |
| Validation Component | Own shared Zod schemas, request validation adapters, response boundary schemas where practical, and size/length bounds. | SECURITY-05, SECURITY-15 |
| Error Handling Component | Own domain error catalog, global exception filter, safe responses, and error logging integration. | SECURITY-09, SECURITY-15 |
| Logging Component | Emit structured logs with redaction, levels, correlation IDs, and security categories. | SECURITY-03, SECURITY-14 |
| Authentication Component | Own credential login, password hashing, password reset, invitation activation, session creation, and MFA flow orchestration. | SECURITY-11, SECURITY-12 |
| Session Store Component | Persist hashed session identifiers, statuses, idle/absolute expiration, revocation, and cleanup intent. | SECURITY-08, SECURITY-12 |
| MFA Component | Own TOTP enrollment/challenge, encrypted secret access, hashed recovery codes, reset, and MFA audit events. | SECURITY-12, SECURITY-13 |
| Abuse Protection Component | Track authentication failures, progressive delay/temporary lockout, and alertable security events. | SECURITY-11, SECURITY-12, SECURITY-14 |
| Authorization Component | Resolve permissions, enforce deny-by-default role checks, and expose object authorization contracts. | SECURITY-08, SECURITY-11, SECURITY-15 |
| Audit Component | Append audit entries, compute hash-chain values, query filtered/paginated records, and verify audit integrity. | SECURITY-03, SECURITY-13, SECURITY-14 |
| Security Event Component | Normalize alertable events and persist/query event records for later dashboard or notification integration. | SECURITY-03, SECURITY-14 |
| Approval Component | Own approval request metadata, state transitions, Treasurer decision validation, self-approval prohibition, and audit integration. | SECURITY-08, SECURITY-13, SECURITY-15 |
| Settings Component | Own setting categories, HOA profile shell, typed settings validation, authorization, and audit integration. | SECURITY-05, SECURITY-08, SECURITY-13 |
| Support Intent Component | Persist notification, document, storage, and job intents with null/test adapters until UOW-08. | SECURITY-13, SECURITY-15 |
| Backup and Integrity Component | Define backup expectations, restore verification hooks, and audit hash verification contracts. | SECURITY-13, SECURITY-14 |
| PBT Test Support Component | Provide reusable `fast-check` generators, model helpers, seed handling, and PBT naming conventions. | PBT-01 through PBT-10 |

## Request Processing Chain

The logical request chain for protected API calls is:

1. Correlation Component assigns or validates a correlation ID.
2. HTTP Security Component applies headers, CORS, cookie, and CSRF policy.
3. Validation Component validates request shape, size, and format.
4. Authentication Component resolves the session through the Session Store Component.
5. Authorization Component enforces role and object authorization.
6. Domain component executes the command or query.
7. Audit Component appends required audit entries for security, financial, configuration, and workflow actions.
8. Logging Component emits structured safe logs.
9. Error Handling Component catches failures and returns safe responses.

Any failure before authorization denies access by default. Any financial or security-sensitive mutation that cannot write its required audit entry must fail.

## Logical Data Responsibilities

| Logical Data | Owner Component | Key NFR Design Notes |
|---|---|---|
| User | Authentication Component | Fixed role, account status, MFA requirement, and safe activation state. |
| UserInvitation | Authentication Component | Single-use, expiring, token digest only, emits notification intent. |
| UserSession | Session Store Component | Hashed session token, status, idle timeout, absolute expiration, revocation timestamps. |
| PasswordResetRequest | Authentication Component | Single-use, expiring, token digest only, consumes atomically and revokes sessions. |
| MfaEnrollment | MFA Component | TOTP secret encrypted through key abstraction; recovery codes stored separately as hashes. |
| LoginFailureRecord | Abuse Protection Component | Account/source keyed counters, failure window, progressive delay, lockout timestamp. |
| Permission Matrix | Authorization Component | Fixed role matrix, deny by default, no custom role overrides. |
| Object Authorization Contract | Authorization Component | Delegates resource-specific checks to owning domain units while enforcing UOW-01 actor/resource contracts. |
| AuditEntry | Audit Component | Append-only, safe structured details, hash-chain fields, role-restricted query. |
| SecurityEvent | Security Event Component | Alertable event data for auth failures, authorization denials, MFA changes, and privilege changes. |
| ApprovalRequest | Approval Component | Sensitive financial request metadata, state transitions, self-approval prohibition, audit link. |
| SettingCategory and SettingValue | Settings Component | Typed settings, owner unit, visibility, schema validation, versioning, audit on changes. |
| Support Intents | Support Intent Component | Notification, document, storage, and job intents persisted for later UOW-08 dispatch. |
| PBT Generators | PBT Test Support Component | Reusable generators for domain objects and stateful models. |

## Component Dependencies

| Component | Depends On | Must Not Depend On |
|---|---|---|
| Configuration Component | None at runtime startup except environment source | Domain services, database connection side effects before validation |
| Correlation Component | Configuration Component | Domain services |
| HTTP Security Component | Configuration Component, Correlation Component | Domain services |
| Validation Component | Shared schemas, Configuration Component | Database access for structural validation |
| Error Handling Component | Correlation Component, Logging Component | Domain-specific persistence writes |
| Logging Component | Configuration Component, Correlation Component | Raw unredacted request bodies |
| Authentication Component | Session Store, MFA, Abuse Protection, Audit, Support Intent, Configuration | Direct SMTP/PDF/storage adapters |
| Session Store Component | Configuration Component, Audit where required | Frontend state, client-local tokens as authority |
| MFA Component | Configuration, Audit, Session Store | Plaintext secret storage, direct logging of factor material |
| Abuse Protection Component | Audit, Security Event, Configuration | CAPTCHA-only primary control |
| Authorization Component | Session Store, Audit, domain object authorization ports | Client navigation state as authority |
| Audit Component | Correlation, Configuration, Logging | Application update/delete paths for audit entries |
| Security Event Component | Audit, Logging, Support Intent where later notification is needed | External alert transport in UOW-01 |
| Approval Component | Authorization, Audit, Support Intent | Direct mutation of financial source records |
| Settings Component | Validation, Authorization, Audit | Untyped setting key/value writes |
| Support Intent Component | Audit, Correlation, Configuration | Concrete SMTP, PDF, filesystem, or worker adapters before UOW-08 |
| Backup and Integrity Component | Audit, Configuration | Live production restore execution from application user flows |
| PBT Test Support Component | Shared domain schemas and value objects | Production runtime dependencies |

## Authentication Component Detail

### Subcomponents

| Subcomponent | Responsibility |
|---|---|
| Credential Service | Verify email/password credentials with generic failure responses and Argon2id password hashing. |
| Password Policy Service | Enforce minimum length and breached-password checking where feasible. |
| Invitation Service | Create, validate, consume, expire, and cancel invitations. |
| Password Reset Service | Create and consume reset requests, rotate credentials, revoke sessions, and audit results. |
| Auth Flow Orchestrator | Decide whether login produces `MfaPending` or full active session. |

### Required Contracts

- No login response may enumerate account existence or account status.
- Password reset request always returns a non-enumerating response.
- Raw passwords, reset tokens, session tokens, MFA codes, and recovery codes cannot cross component boundaries except as short-lived inputs to verification methods.

## Session Store Component Detail

### Responsibilities

- Create server-side session records.
- Store session token digest only.
- Resolve active sessions on each protected request.
- Enforce idle and absolute expiration.
- Revoke individual sessions on logout.
- Revoke all sessions for a user on password reset and sensitive MFA/security changes.
- Expose cleanup job intent for expired/revoked sessions.

### Required Indexes for Code Generation

- Session digest unique index.
- User/status index.
- Expiration index for cleanup.
- Last-seen or idle-expiration index if represented separately.

## MFA Component Detail

### Responsibilities

- Generate TOTP enrollment secret.
- Encrypt TOTP secret through key abstraction before persistence.
- Verify enrollment challenge before activation.
- Verify login challenge before converting `MfaPending` to full session.
- Generate recovery codes, hash them, display them once, and consume them atomically.
- Force re-enrollment after authorized reset.
- Audit MFA enrollment, success, failure, reset, and disablement.

### Prohibited Behaviors

- Plaintext TOTP secret persistence.
- Plaintext recovery-code persistence.
- MFA disablement for administrative roles through self-service.
- Logging or auditing MFA codes or secrets.

## Authorization Component Detail

### Responsibilities

- Resolve fixed role permissions.
- Deny unknown roles, permissions, and resource types.
- Enforce server-side authorization on every protected endpoint.
- Expose object authorization ports for later domain units.
- Audit authorization failures as security events.

### Object Authorization Contract

Object authorization inputs must include actor context, resource reference, action, and correlation ID. The result must be explicit allow or deny with safe reason codes. Missing ownership data denies access.

## Audit Component Detail

### Responsibilities

- Append audit entries.
- Redact or omit sensitive details.
- Compute stream sequence and hash-chain fields.
- Reject update/delete application operations.
- Enforce role-restricted filtered query.
- Provide hash-chain verification hooks for backup/restore checks.

### Hash-Chain Write Rule

Hash-chain write must occur inside the same transaction as the audit insert. Concurrent writes to the same stream require deterministic sequence allocation and locking so `previousHash` cannot race.

## Approval Component Detail

### Responsibilities

- Create pending approval requests.
- Enforce authorized decision actor.
- Prevent requester self-approval for sensitive financial actions.
- Keep approval metadata separate from financial source-record mutation.
- Delegate approved effects to owning domain services.
- Audit request creation, decision, application success, and application failure.

### Financial Boundary

UOW-01 must not directly mutate invoice, payment, receipt, penalty, credit, adjustment, account balance, or ledger source records. This boundary is non-negotiable for financial correctness.

## Support Intent Component Detail

### Intent Types

| Intent | First Implementation Responsibility |
|---|---|
| NotificationIntent | Record requested notifications such as invitation and password reset notices. |
| DocumentIntent | Record requested document generation without concrete PDF generation. |
| StorageIntent | Record storage needs without concrete file adapter implementation before UOW-08. |
| JobIntent | Record job scheduling/execution requests without concrete worker execution before UOW-08. |

### Resilience Rule

Where an intent is required by a source action, it is created in the same transaction as that action. Dispatch failure is not modeled in UOW-01 because dispatch is owned by UOW-08.

## PBT Test Support Component Detail

### Required Generators

| Generator | Purpose |
|---|---|
| Role and permission generators | Verify deny-by-default and fixed matrix invariants. |
| ActorContext generator | Verify authorization and safe error behavior across roles and resource scopes. |
| ResourceRef generator | Verify object authorization contracts and safe resource IDs. |
| Session generator | Verify expiration, revocation, and logout idempotence. |
| Password reset generator | Verify single-use token state and session revocation properties. |
| Audit entry generator | Verify append-only and hash-chain behavior. |
| Approval state generator | Verify allowed state transitions and self-approval prohibition. |
| Value object generators | Verify `Money`, `DateRange`, `BillingPeriod`, `PageRequest`, and `ResourceRef` parse/format behavior. |
| Frontend permission/navigation generator | Verify navigation never displays commands absent from server permissions. |

### Required Execution Support

- Keep `fast-check` shrinking enabled.
- Log seed and shrunk counterexample on failure.
- Support `PBT_SEED` replay.
- Separate PBT naming from example tests.
- Turn shrunk failures into permanent example-based regression tests when they represent business-critical bugs.

## NFR Responsibility Mapping

| NFR Area | Owning Logical Components |
|---|---|
| Capacity and performance | Session Store, Audit, Validation, Configuration |
| Authentication and sessions | Authentication, Session Store, MFA, Abuse Protection |
| MFA | MFA, Authentication, Session Store, Audit |
| Credential protection | Authentication, Configuration, Logging |
| Abuse protection | Abuse Protection, Audit, Security Event |
| Authorization | Authorization, Session Store, Audit |
| Audit integrity | Audit, Backup and Integrity, Configuration |
| Logging and monitoring | Logging, Security Event, Correlation |
| Browser/API security | HTTP Security, Validation, Error Handling |
| Accessibility and frontend testability | Validation, Error Handling, PBT Test Support, frontend components during Code Generation |
| Supply chain | Configuration, Build/Test later, Code Generation later |
| Secrets and configuration | Configuration, Logging, MFA |
| Support service resilience | Support Intent, Audit, Correlation |
| PBT | PBT Test Support plus all stateful/domain components |

## Deferred to Infrastructure Design

- Concrete Docker network layout.
- TLS termination and certificate handling.
- Database encryption and connection TLS implementation.
- Log transport and centralized log storage target.
- Backup commands, schedules, storage locations, and restore command details.
- Volume paths and persistent file backup implementation.
- Security-event dashboard or alert transport configuration.

## Deferred to Code Generation

- Final package and folder names.
- Prisma schema and migration files.
- Exact Argon2id parameters and dependency versions.
- Zod schema implementations.
- NestJS middleware, guards, pipes, filters, and modules.
- Next.js middleware and frontend components.
- Test files, PBT generator code, and seed logging implementation.
- Dockerfiles, lockfile, audit scripts, and SBOM command placeholder.

## Security Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-01 | N/A for NFR Design | Infrastructure resource encryption is deferred; logical components require encryption abstractions for MFA secrets and backup verification hooks. |
| SECURITY-02 | N/A for NFR Design | No network intermediary is defined in logical components. |
| SECURITY-03 | Compliant | Logging Component requires structured logs, correlation IDs, redaction, and safe security categories. |
| SECURITY-04 | Compliant | HTTP Security Component owns required security headers and CSP. |
| SECURITY-05 | Compliant | Validation Component owns schema validation, size bounds, and format checks. |
| SECURITY-06 | N/A for NFR Design | IAM policies are not defined in this stage. |
| SECURITY-07 | N/A for NFR Design | Network configuration is not defined in this stage. |
| SECURITY-08 | Compliant | Authorization Component, Session Store, and HTTP Security Component enforce server-side access control and strict CORS. |
| SECURITY-09 | Compliant | Configuration and Error Handling components prevent default secrets, unsafe production errors, and misconfiguration. |
| SECURITY-10 | Compliant | Supply-chain requirements are carried into Code Generation and Build/Test responsibilities. |
| SECURITY-11 | Compliant | Security-critical logic is isolated in dedicated authentication, authorization, audit, and abuse protection components. |
| SECURITY-12 | Compliant | Authentication, Session Store, MFA, and Abuse Protection components cover adaptive hashing, MFA, secure sessions, and brute-force controls. |
| SECURITY-13 | Compliant | Audit, Validation, and Backup/Integrity components provide critical data integrity and auditability. |
| SECURITY-14 | Compliant | Security Event and Audit components provide alertable events and tamper-evident records. |
| SECURITY-15 | Compliant | Error Handling, Validation, Authorization, and transaction boundaries enforce fail-safe behavior. |

## PBT Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| PBT-01 | Compliant | Functional properties are carried into PBT Test Support responsibilities. |
| PBT-02 | Compliant for design | Value object round-trip generators are required. |
| PBT-03 | Compliant for design | Permission, authorization, audit, navigation, and validation invariants are required. |
| PBT-04 | Compliant for design | Logout and reset-token idempotence are required. |
| PBT-05 | N/A for NFR Design | No separate oracle-backed algorithm is introduced. |
| PBT-06 | Compliant for design | Stateful model tests are required for sessions, approvals, password reset, and audit append behavior. |
| PBT-07 | Compliant for design | Reusable domain-specific generators are required. |
| PBT-08 | Compliant for design | Shrinking, seed logging, and replay are component responsibilities. |
| PBT-09 | Compliant | `fast-check` remains the selected TypeScript PBT framework. |
| PBT-10 | Compliant for design | Example tests remain mandatory for critical paths alongside PBT. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
- Code spans are limited to component names, identifiers, and environment variable names.
