# UOW-01 NFR Design Plan

## Unit

- **Unit ID**: UOW-01
- **Unit Name**: Platform Foundation, Access, Settings, Audit, and Approval Core
- **Stage**: NFR Design, Part 1 - Planning
- **Current Gate**: Waiting for answers in this file

## Purpose

Translate the approved UOW-01 NFR Requirements into concrete non-functional patterns and logical components before Infrastructure Design and Code Generation. This stage must decide how UOW-01 will satisfy authentication, session, MFA, authorization, audit, validation, logging, security headers, rate limiting, supply-chain, and PBT requirements at design level.

## Source Context

- NFR Requirements:
  - `aidlc-docs/construction/uow-01-platform-foundation/nfr-requirements/nfr-requirements.md`
  - `aidlc-docs/construction/uow-01-platform-foundation/nfr-requirements/tech-stack-decisions.md`
- Functional Design:
  - `aidlc-docs/construction/uow-01-platform-foundation/functional-design/business-logic-model.md`
  - `aidlc-docs/construction/uow-01-platform-foundation/functional-design/business-rules.md`
  - `aidlc-docs/construction/uow-01-platform-foundation/functional-design/domain-entities.md`
  - `aidlc-docs/construction/uow-01-platform-foundation/functional-design/frontend-components.md`

## NFR Design Scope

### In Scope

- Session persistence, invalidation, timeout, and cleanup patterns.
- MFA TOTP secret and recovery-code storage patterns.
- Password hashing pattern.
- Login failure, reset abuse, rate limiting, and alertable event patterns.
- Audit append-only, tamper-evidence, query, and retention patterns.
- Structured logging and security event patterns.
- API validation and shared schema patterns.
- HTTP security header and CORS enforcement patterns.
- Configuration/secrets validation and redaction patterns.
- PBT execution, generator, and seed-reproducibility patterns.
- Support-service intent/outbox pattern for UOW-01 through UOW-08 integration.
- Logical components needed to implement the above.

### Out of Scope

- Concrete infrastructure resource definitions, network ports, volume paths, TLS certificate provisioning, backup command schedules, and deployment topology. These belong to Infrastructure Design.
- Actual application code, package versions, migrations, tests, and Dockerfiles. These belong to Code Generation.

## NFR Design Checklist

- [x] Read UOW-01 NFR Requirements artifacts.
- [x] Read UOW-01 Functional Design artifacts.
- [x] Read NFR Design rule details.
- [x] Confirm Security Baseline and Property-Based Testing extensions are enabled.
- [x] Identify UOW-01 NFR design patterns and logical component decisions.
- [x] Create this NFR Design plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory.
- [x] Generate `aidlc-docs/construction/uow-01-platform-foundation/nfr-design/nfr-design-patterns.md`.
- [x] Generate `aidlc-docs/construction/uow-01-platform-foundation/nfr-design/logical-components.md`.
- [x] Verify Security Baseline compliance summary.
- [x] Verify PBT design carries forward PBT-01 and PBT-09 decisions.
- [x] Verify content validation before artifact creation.
- [x] Present the standardized NFR Design completion message.

## Required NFR Design Artifacts

After this plan is answered and validated, the following artifacts must be generated:

- `nfr-design-patterns.md`: Security, resilience, performance, logging, audit, validation, PBT, and support-intent patterns.
- `logical-components.md`: Logical components, responsibilities, data flow, dependencies, and NFR responsibility mapping.

## NFR Design Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

### Question 1
What session persistence pattern should UOW-01 use?

A) PostgreSQL-backed session table with hashed session identifiers, server-side revocation, expiration indexes, and cleanup job intent (recommended)
B) Redis-backed session store from first implementation
C) In-memory sessions only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What session timeout pattern should NFR Design use?

A) Privileged roles: 15-minute idle timeout and 8-hour absolute timeout; Homeowner/Board roles: 60-minute idle timeout and 24-hour absolute timeout (recommended)
B) Same 60-minute idle timeout and 24-hour absolute timeout for all roles
C) No fixed values; leave exact timeouts to Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
What password hashing pattern should UOW-01 use?

A) Argon2id as primary password hashing algorithm, with parameters finalized in Code Generation and documented bcrypt fallback only if runtime support blocks Argon2id (recommended)
B) bcrypt as the primary password hashing algorithm
C) Defer exact password hashing algorithm to Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
How should TOTP MFA secrets and recovery codes be protected?

A) Encrypt TOTP secrets at rest through a key abstraction, store recovery codes only as hashes, display recovery codes once, and audit enrollment/reset events (recommended)
B) Store TOTP secrets and recovery codes as plaintext because database access is restricted
C) Store TOTP secrets as plaintext but hash recovery codes
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
What login failure and rate-limit pattern should UOW-01 use?

A) PostgreSQL-backed counters keyed by account and safe source fingerprint, progressive delay/temporary lockout, reset on successful login, and security-event audit records (recommended)
B) In-memory counters only
C) Global IP-only throttling with no account-level counters
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
What audit tamper-evidence pattern should UOW-01 use?

A) Append-only audit table plus record hash and previous-record hash chain per audit stream, with no application update/delete paths and backup/export support later (recommended)
B) Append-only table only, no hash-chain fields
C) Audit trail stored only in application log files
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
What audit query performance pattern should UOW-01 use?

A) Required filtered, paginated queries with indexes on timestamp, actor, category, action, resource type/resource ID, and correlation ID; unrestricted full scans rejected (recommended)
B) Allow unrestricted full scans because the first deployment is small
C) Cache all audit query results in memory
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
What structured logging and security event pattern should UOW-01 use?

A) Structured application logger emits safe JSON logs; security-sensitive events are also written to audit/security event records for alerting and later dashboard/email integration (recommended)
B) Structured logs only, no security event records
C) Plain text logs only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
What HTTP security header and CSP enforcement pattern should UOW-01 use?

A) Central web middleware applies required headers and CSP; API middleware applies safe API headers; CSP starts with `default-src 'self'` and documented exceptions only (recommended)
B) Configure headers individually in each route or page
C) Defer all headers to reverse proxy configuration only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
What CORS pattern should UOW-01 use?

A) Environment-validated explicit origin allowlist, credentials enabled only for allowed origins, no wildcard origins on authenticated endpoints, and fail-closed startup if production origin is missing (recommended)
B) Allow all origins during first implementation
C) Defer CORS entirely to deployment
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 11
What API validation pattern should UOW-01 use?

A) Shared Zod schemas for request/response validation across API and web where practical, with NestJS pipes/adapters and explicit size/length bounds (recommended)
B) NestJS class-validator DTOs only, without shared frontend schemas
C) Manual validation inside service methods
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 12
What configuration and secrets pattern should UOW-01 use?

A) Central typed configuration module validates environment variables at startup, redacts secret values, supports local env values, and exposes a secrets-manager-ready abstraction (recommended)
B) Direct `process.env` reads throughout modules
C) Static committed config files for first implementation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 13
What support-intent resilience pattern should UOW-01 define?

A) Transactional outbox-style intent records for notification, document, storage, and job requests, created in the same transaction as source actions where applicable; UOW-08 implements dispatch (recommended)
B) Direct synchronous calls to support services from each domain unit
C) Leave support intents as TypeScript interfaces only, with no persisted intent records
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 14
What PBT execution pattern should UOW-01 use?

A) `fast-check` tests use centralized domain generators, shrinking enabled, seed logged on failure, optional `PBT_SEED` replay env var, and separate PBT test naming (recommended)
B) `fast-check` with default settings only
C) PBT execution details deferred until Build and Test
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 15
What backup/recovery design pattern should UOW-01 assume before Infrastructure Design?

A) Logical database backup requirement plus application-managed file backup hooks, restore runbook, and backup verification checklist; exact tools/schedule finalized in Infrastructure Design (recommended)
B) Rely on manual file copying with no verification checklist
C) Defer all backup design to Operations
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 16
What supply-chain design pattern should UOW-01 carry into Code Generation?

A) Package-manager lockfile, pinned base images, dependency audit command, SBOM command placeholder, and no production `latest` tags in generated Docker/CI artifacts (recommended)
B) Lockfile only
C) Defer all supply-chain controls until after application code is generated
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Post-Answer Processing

After all `[Answer]:` tags are complete:

- Answers will be checked for blanks, invalid choices, contradictions, and vague wording.
- Follow-up questions will be added if any answer is ambiguous.
- If answers are clear, NFR Design artifacts will be generated directly from this plan and approved source context.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant for planning | Questions cover session revocation, MFA secret protection, rate limiting, audit tamper-evidence, structured logging, security headers, CORS, validation, config/secrets, support intents, backups, and supply chain controls. |
| Property-Based Testing | Compliant for planning | Question 14 carries forward `fast-check`, custom generators, shrinking, and seed reproducibility from PBT-09 and prior PBT-01 property identification. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown uses standard headings, lists, tables, and code spans only.
- All questions include a final `X) Other` option and `[Answer]:` tag.
