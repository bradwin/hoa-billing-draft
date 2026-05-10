# UOW-01 NFR Design Patterns

## Unit

- **Unit ID**: UOW-01
- **Unit Name**: Platform Foundation, Access, Settings, Audit, and Approval Core
- **Stage**: NFR Design

## Summary

UOW-01 uses database-backed security and audit patterns for the first local or single-server deployment. The design favors revocable server-side sessions, deny-by-default authorization, tamper-evident audit records, explicit validation, safe logging, and reproducible property-based tests over premature distributed infrastructure.

The target capacity remains one HOA/subdivision, up to 1,000 homeowner users, up to 25 operational users, and up to 50 concurrent authenticated sessions. Any future multi-HOA or high-concurrency design must reopen capacity, tenancy, authorization, audit, and infrastructure requirements.

## Approved Planning Answers

| Question Area | Approved Decision |
|---|---|
| Session persistence | PostgreSQL-backed session table with hashed identifiers, server-side revocation, expiration indexes, and cleanup job intent |
| Session timeouts | Privileged roles: 15-minute idle timeout and 8-hour absolute timeout; Homeowner and Board roles: 60-minute idle timeout and 24-hour absolute timeout |
| Password hashing | Argon2id primary; bcrypt fallback only if runtime support blocks Argon2id |
| MFA storage | TOTP secrets encrypted at rest through a key abstraction; recovery codes stored only as hashes and displayed once |
| Login failures and rate limits | PostgreSQL-backed account/source counters with progressive delay or temporary lockout |
| Audit tamper evidence | Append-only audit table with record hash and previous-record hash chain per audit stream |
| Audit query performance | Required filters, pagination, and indexes; unrestricted full scans rejected |
| Logging and security events | Safe structured JSON logs plus audit/security-event records for alerting |
| HTTP headers and CSP | Central middleware with required headers and CSP starting from `default-src 'self'` |
| CORS | Environment-validated explicit origin allowlist with fail-closed production startup |
| API validation | Shared Zod schemas with NestJS adapters and explicit size/length bounds |
| Configuration and secrets | Central typed config module, redaction registry, and secrets-manager-ready abstraction |
| Support intents | Transactional outbox-style intent records for later notification, document, storage, and job dispatch |
| PBT execution | `fast-check` with centralized generators, shrinking, seed logging, and `PBT_SEED` replay |
| Backup and recovery | Logical database backup, application-managed file backup hooks, restore runbook, and verification checklist |
| Supply chain | Lockfile, pinned images, dependency audit, SBOM command placeholder, and no production `latest` tags |

## Session Management Pattern

### Pattern

Sessions are opaque, server-managed records persisted in PostgreSQL. The browser receives only an opaque session token in a secure, httpOnly, sameSite cookie. The application stores a cryptographic digest of the token, not the raw token.

### Design Rules

| Area | Design |
|---|---|
| Session token storage | Store only a strong digest of the opaque session token. Raw session tokens must never be stored, logged, audited, or returned by API responses. |
| Session status | Use explicit statuses such as `Active`, `MfaPending`, `Expired`, and `Revoked`. |
| Revocation | Logout revokes the active session. Password reset revokes all active sessions for the user. Role-impacting security changes should revoke affected user sessions when permissions become narrower or MFA state changes. |
| Idle timeout | System Administrator, Treasurer, and Billing Staff use a 15-minute idle timeout. Board Member and Homeowner use a 60-minute idle timeout. |
| Absolute timeout | Privileged roles use an 8-hour absolute timeout. Board Member and Homeowner use a 24-hour absolute timeout. |
| MFA pending state | `MfaPending` sessions may access only MFA enrollment/challenge and logout endpoints. They cannot access privileged or homeowner data. |
| Cleanup | Expired and revoked sessions are removed by a cleanup job intent. Cleanup must not affect audit records. |
| Cookie attributes | Cookies must be `Secure`, `HttpOnly`, and `SameSite=Lax` for first implementation. If a future cross-site deployment requires `SameSite=None`, the change requires explicit security review and `Secure` must remain mandatory. |
| CSRF | State-changing browser requests must use a CSRF control such as a double-submit token or server-issued CSRF token. SameSite is not the only CSRF control. |

### Failure Behavior

- Missing, expired, revoked, malformed, or digest-mismatched session tokens are denied.
- Authorization and validation errors fail closed.
- Session validation failures use safe user-facing errors and structured logs with correlation IDs.
- Raw session identifiers must be redacted from logs and audit details.

## Authentication, Credentials, and Abuse Pattern

### Password Hashing

Passwords use Argon2id as the primary adaptive hashing algorithm. Code Generation must calibrate parameters for the deployment target and document the chosen memory, time, and parallelism settings. bcrypt is allowed only as a fallback if the runtime or deployment platform cannot support Argon2id reliably.

### Password Policy

- Minimum password length is 8 characters.
- Breached-password checking should be included where feasible.
- Passwords, reset tokens, MFA codes, recovery codes, and secrets must never appear in logs, audit records, user-facing errors, or source code.

### Login Failure and Rate Limiting

Login attempts are tracked in PostgreSQL using account-aware and source-fingerprint-aware counters.

| Control | Design |
|---|---|
| Known account attempts | Track by normalized account ID plus safe source fingerprint. |
| Unknown account attempts | Track by normalized submitted email digest plus safe source fingerprint without creating account enumeration behavior. |
| Progressive control | Apply progressive delay and temporary lockout after repeated failures. |
| Reset behavior | Successful authentication resets the active failure window for the account/source pair. |
| User response | Responses remain generic and must not disclose missing account, inactive account, locked account, wrong password, or MFA state except where the authenticated flow already permits it. |
| Audit/security event | Authentication failures, lockouts, reset requests, reset completions, and session revocations are security events. |

### Reset Token Pattern

Password reset requests create single-use, expiring token records with token digests only. Reset completion validates status and expiration, consumes the token atomically, updates the password hash, revokes active sessions, and audits the outcome without storing token values.

## MFA Pattern

### TOTP Enrollment

System Administrator and Treasurer accounts require TOTP MFA for full access. MFA enrollment begins in a pending state, activates only after successful verification, and is audited.

### Secret and Recovery-Code Handling

| Item | Design |
|---|---|
| TOTP secret | Encrypted at rest through a secrets key abstraction. |
| Recovery codes | Generated as high-entropy one-time codes, displayed once, stored only as adaptive or keyed hashes, and consumed atomically. |
| Reset | MFA reset requires an authorized System Administrator acting on another account, revokes sessions, audits the reset, and forces re-enrollment. |
| Self-service disablement | Administrative roles cannot disable their own MFA through normal self-service flows. |
| Single administrator risk | The first production rollout must retain recovery codes for administrative accounts. Any manual break-glass recovery is an operational exception and must be separately documented before production use. |

## Authorization and Access-Control Pattern

### Deny-by-Default Enforcement

Every protected endpoint resolves an authenticated `ActorContext` from the server-side session. Authorization is enforced by backend guards and domain services. Client navigation is never authoritative.

### Role and Permission Pattern

- Fixed roles only: System Administrator, Treasurer, Billing Staff, Board Member, and Homeowner.
- Missing role, permission, resource type, or ownership data denies access.
- Administrative and privileged operations require explicit role/permission checks.
- Board Member mutation permissions are denied unless a later approved design grants a specific command.
- Billing Staff cannot approve waivers, reversals, voids, write-offs, or adjustments.
- Treasurer approval cannot be self-approval for sensitive financial requests.

### Object Authorization Pattern

Requests referencing protected resource IDs must call an object authorization contract. Homeowner access requires explicit ownership links to billing accounts or properties. Matching email alone never grants access.

## Audit and Tamper-Evidence Pattern

### Append-Only Audit

The application exposes only append and query paths for audit records. There is no application update or delete command for audit entries. Financial and security audit records are retained indefinitely by application behavior.

### Tamper-Evident Hash Chain

Audit records include tamper-evidence fields:

| Field | Purpose |
|---|---|
| `streamKey` | Defines the audit stream, such as global, security, financial resource, or configuration category. |
| `sequence` | Monotonic sequence within the stream. |
| `previousHash` | Hash of the previous audit record in the stream. |
| `recordHash` | Hash of the canonical immutable audit fields plus `previousHash`. |
| `hashAlgorithm` | Versioned algorithm label for future migration. |

Audit writing must be transactional. For a financial or security-sensitive mutation, audit write failure fails the mutation instead of silently continuing. Later Infrastructure Design must address database permissions and backup/export controls so the application cannot tamper with its own audit history outside the append path.

### Audit Query Pattern

Audit query and export are role-restricted, filtered, and paginated.

| Query Control | Design |
|---|---|
| Required bounds | Require date range and pagination for application queries. |
| Filter fields | Actor, category, resource type, resource ID, action, result, and correlation ID. |
| Indexes | Include indexes for occurred timestamp, actor, category/action, resource reference, and correlation ID. |
| Full scans | Reject unrestricted full audit scans in application workflows. Administrative export must be separately permissioned and bounded. |
| Sensitive data | Audit details must omit or redact secrets, passwords, session IDs, raw tokens, MFA material, and credential values. |

## Structured Logging and Security Event Pattern

### Logging

Application logs are structured JSON records containing timestamp, level, correlation ID, safe message, component, and optional security-event category. Log output must pass through a redaction layer before emission.

### Security Events

Security-sensitive events are represented in audit/security-event records so they can be queried and later routed to dashboards or notifications.

Alertable event categories include:

- Repeated authentication failures.
- Temporary lockouts.
- Authorization failures.
- Privilege changes.
- MFA enrollment, challenge failure, reset, and disablement.
- Password reset completion.
- Audit query denials.

Alert transport belongs to Infrastructure Design and later support-service implementation. UOW-01 must preserve enough structured event data for alerting without leaking sensitive values.

## Browser and API Security Pattern

### HTTP Security Headers

HTML-serving endpoints use central middleware to set:

| Header | Required Design |
|---|---|
| `Content-Security-Policy` | Start with `default-src 'self'`; exceptions require explicit documentation. |
| `Strict-Transport-Security` | Production HTTPS responses set `max-age=31536000; includeSubDomains`. Local HTTP development may omit HSTS. |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` unless an approved framing requirement is added later. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |

### CORS

Authenticated API CORS uses an environment-validated explicit origin allowlist. Wildcard origins are prohibited for authenticated endpoints. Production startup fails closed if required production origins are missing or invalid.

### Validation

API validation uses shared Zod schemas where practical, adapted into NestJS request validation. Every endpoint validates:

- Types.
- Formats such as email, IDs, dates, and enum values.
- String length limits.
- Array and payload size limits.
- Pagination bounds.
- Structured request and response DTO boundaries where applicable.

Database access must use Prisma parameterization. Raw SQL, if unavoidable later, must use parameterized queries only.

### Error Handling

Errors use a central domain error catalog and global exception filter. Client responses contain stable error codes, safe messages, and correlation IDs. Internal details, stack traces, SQL details, file paths, framework versions, and secrets are logged safely but never returned to users.

## Configuration and Secrets Pattern

The runtime uses a central typed configuration module.

| Control | Design |
|---|---|
| Validation | Environment variables are validated at startup. Missing required production values fail startup. |
| Secret access | Runtime modules receive secrets through a provider abstraction, not ad hoc direct `process.env` reads. |
| Local development | `.env.example` may contain placeholders only. Real `.env` files must not be committed. |
| Redaction | Config keys classified as secret are redacted from logs, audit, diagnostics, and error payloads. |
| Secrets-manager readiness | Local deployment may use environment variables, but the interface must allow later replacement with a secrets manager. |

## Support-Intent and Outbox Pattern

UOW-01 defines transactional intent records for notification, document, storage, and job requests. Intent records are created in the same transaction as the source action where applicable. UOW-01 through UOW-07 may use null or test adapters only.

Concrete SMTP, PDF, filesystem, storage, and worker adapters are prohibited until UOW-08. Later units must use support intent contracts instead of ad hoc side-effect logic.

Support side effects are not prerequisites for committed financial source records unless a later approved unit explicitly defines that requirement.

## Backup, Restore, and Integrity Pattern

Before production use, Infrastructure Design and Build/Test must document:

- Logical PostgreSQL backup expectations.
- Application-managed persistent file backup hooks.
- Manual restore procedure.
- Restore verification checklist.
- Audit hash-chain verification after restore.
- Separation between application append paths and administrative restore capabilities.

First implementation targets manual restore from backup, not automated failover or zero-downtime continuity.

## Supply-Chain Pattern

Code Generation and Build/Test must carry forward these controls:

- Commit a package-manager lockfile.
- Use dependencies from official registries or approved private registries only.
- Configure a dependency audit command.
- Provide an SBOM generation command placeholder for production builds.
- Pin production Docker and CI image tags.
- Prohibit production `latest` tags.
- Avoid unused dependencies in generated package manifests.

## Property-Based Testing Pattern

The PBT framework is `fast-check`. UOW-01 tests use centralized domain generators for roles, permissions, actor contexts, resource references, sessions, approval states, audit entries, settings, support intents, and shared value objects.

PBT execution must:

- Keep shrinking enabled.
- Log the failing seed and minimal shrunk case.
- Support replay through `PBT_SEED`.
- Separate or clearly name PBT tests.
- Complement example-based tests for critical paths.
- Include stateful/model-based tests for approval transitions, session revocation, password reset consumption, and audit append behavior.

## Resilience and Safe-Failure Pattern

| Scenario | Required Behavior |
|---|---|
| Database unavailable | Deny protected actions safely and return safe errors. Do not grant access from stale client state. |
| Audit append failure | Fail financial and security-sensitive mutations. |
| Support intent dispatch unavailable | Persist intent where transactionally required and leave dispatch to later UOW-08 processing. |
| Config invalid | Fail startup in production. |
| Unknown permission or resource type | Deny access. |
| Unexpected exception | Global handler logs safely, returns safe error, and preserves correlation ID where possible. |

## Performance and Scalability Pattern

UOW-01 deliberately avoids adding Redis, a distributed queue, or external cache in first implementation. The approved database-backed patterns are acceptable for the target capacity.

Performance controls are:

- Indexed session lookup by session digest.
- Indexed login-failure lookup by account/source key and failure window.
- Indexed audit queries with required filters and pagination.
- Bounded page sizes for all list endpoints.
- Avoidance of unrestricted audit export through normal application workflows.
- P95 targets of <= 500 ms for authentication, permission checks, settings reads, and approval queue reads under normal load.
- P95 target of <= 2 seconds for filtered, paginated audit queries under normal load.

## Security Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-01 | N/A for NFR Design | Encryption resource blocks are Infrastructure Design concerns; this design requires encrypted TOTP secrets and backup/restore integrity. |
| SECURITY-02 | N/A for NFR Design | No network-facing intermediary is defined in this stage. |
| SECURITY-03 | Compliant | Structured logging, correlation IDs, redaction, and security-event categories are designed. Centralized log transport is deferred to Infrastructure Design. |
| SECURITY-04 | Compliant | Required HTTP security headers and restrictive CSP are designed for central middleware. |
| SECURITY-05 | Compliant | Shared schema validation, size bounds, format validation, and parameterized database access are required. |
| SECURITY-06 | N/A for NFR Design | IAM/resource policy details are Infrastructure Design concerns. |
| SECURITY-07 | N/A for NFR Design | Network configuration is not defined in this stage. |
| SECURITY-08 | Compliant | Deny-by-default authentication, object authorization, server-side checks, strict CORS, and session validation are designed. |
| SECURITY-09 | Compliant | Safe errors, no committed secrets, supported runtime expectations, and hardening constraints are designed. |
| SECURITY-10 | Compliant | Lockfile, vulnerability scanning, trusted registries, pinned images, SBOM placeholder, and no production `latest` tags are required. |
| SECURITY-11 | Compliant | Security-critical logic is isolated in logical components; rate limiting and misuse cases are addressed. |
| SECURITY-12 | Compliant | Adaptive password hashing, MFA for administrative roles, secure sessions, brute-force protection, no hardcoded credentials, and session expiration/revocation are designed. |
| SECURITY-13 | Compliant | Validation before deserialization, auditability of critical changes, and audit hash-chain integrity are designed. |
| SECURITY-14 | Compliant | Alertable security events and tamper-evident audit records are designed; dashboard/transport details are deferred. |
| SECURITY-15 | Compliant | Fail-closed authorization, global error handling, safe user messages, and transaction rollback expectations are designed. |

## PBT Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| PBT-01 | Compliant | Functional Design identified testable properties and this design carries them forward. |
| PBT-02 | Compliant for design | Round-trip properties are required for value object parse/format behavior. |
| PBT-03 | Compliant for design | Invariants are required for permissions, object authorization, navigation, errors, and audit append behavior. |
| PBT-04 | Compliant for design | Idempotence is required for logout and reset-token consumption. |
| PBT-05 | N/A for NFR Design | No optimized algorithm with a separate oracle is introduced in this stage. |
| PBT-06 | Compliant for design | Stateful PBT is required for sessions, approvals, password reset requests, and audit append sequences. |
| PBT-07 | Compliant for design | Centralized domain generators are required. |
| PBT-08 | Compliant for design | Shrinking, seed logging, and `PBT_SEED` replay are required. |
| PBT-09 | Compliant | `fast-check` is selected for TypeScript. |
| PBT-10 | Compliant for design | PBT must complement example-based tests and cannot be the only coverage for critical paths. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
- Code spans are limited to identifiers, header names, and configuration names.
