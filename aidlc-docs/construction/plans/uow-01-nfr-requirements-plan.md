# UOW-01 NFR Requirements Plan

## Unit

- **Unit ID**: UOW-01
- **Unit Name**: Platform Foundation, Access, Settings, Audit, and Approval Core
- **Stage**: NFR Requirements, Part 1 - Planning
- **Current Gate**: NFR Requirements artifacts generated; waiting for review approval

## Purpose

Define non-functional requirements and technology stack decisions for UOW-01 before NFR Design and Code Generation. UOW-01 is the security and audit foundation for every later unit, so vague defaults are not acceptable for authentication, session handling, logging, audit retention, rate limiting, accessibility, testing, and supply chain controls.

## Source Context

- Functional Design:
  - `aidlc-docs/construction/uow-01-platform-foundation/functional-design/business-logic-model.md`
  - `aidlc-docs/construction/uow-01-platform-foundation/functional-design/business-rules.md`
  - `aidlc-docs/construction/uow-01-platform-foundation/functional-design/domain-entities.md`
  - `aidlc-docs/construction/uow-01-platform-foundation/functional-design/frontend-components.md`
- Unit definitions: `aidlc-docs/inception/application-design/unit-of-work.md`
- Unit dependencies: `aidlc-docs/inception/application-design/unit-of-work-dependency.md`
- Application design: `aidlc-docs/inception/application-design/application-design.md`

## NFR Assessment Scope

### In Scope

- Capacity assumptions for one HOA/subdivision.
- Performance targets for authentication, authorization, settings, audit query, and approval queue interactions.
- Availability, backup, recovery, and operational continuity assumptions for local or single-server Docker deployment.
- Security requirements from Security Baseline rules applicable to UOW-01.
- Authentication, MFA, password storage, session, cookie, brute-force, and reset-abuse NFRs.
- Audit retention, tamper resistance, query restrictions, and alerting requirements.
- Structured logging and monitoring expectations.
- HTTP security headers, CORS, and frontend security posture.
- Accessibility and frontend usability baseline for foundation screens.
- TypeScript testing stack and PBT framework selection required by PBT-09.
- Supply chain and dependency scanning baseline.

### Out of Scope

- Detailed infrastructure topology, network rules, database encryption configuration, backup implementation, and deployment resource definitions. These belong to Infrastructure Design.
- Exact code packages and versions. These belong to Code Generation, but framework choices must be made here.
- Domain financial performance targets for invoices, payments, penalties, reports, imports, and jobs. Those belong to later unit NFR stages.

## NFR Requirements Checklist

- [x] Read UOW-01 Functional Design artifacts.
- [x] Read NFR Requirements rule details.
- [x] Confirm Security Baseline and Property-Based Testing extensions are enabled.
- [x] Identify UOW-01 NFR categories and decision points.
- [x] Create this NFR Requirements plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory. No follow-up questions required because all answers are valid option A choices and no contradictions were detected.
- [x] Generate `aidlc-docs/construction/uow-01-platform-foundation/nfr-requirements/nfr-requirements.md`.
- [x] Generate `aidlc-docs/construction/uow-01-platform-foundation/nfr-requirements/tech-stack-decisions.md`.
- [x] Verify PBT-09 framework selection is included.
- [x] Verify Security Baseline compliance summary.
- [x] Verify content validation before artifact creation.
- [x] Present the standardized NFR Requirements completion message.

## Required NFR Artifacts

After this plan is answered and validated, the following artifacts must be generated:

- `nfr-requirements.md`: Capacity, performance, availability, security, logging, monitoring, audit, usability, accessibility, testing, and maintainability requirements.
- `tech-stack-decisions.md`: Technology choices and rationale for UOW-01, including auth/session approach, password hashing, MFA method category, validation, testing, PBT, logging, dependency scanning, and relevant frontend tooling.

## NFR Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

### Question 1
What capacity target should UOW-01 use for first implementation?

A) One HOA/subdivision: up to 1,000 homeowner users, up to 25 operational users, and up to 50 concurrent authenticated sessions (recommended)
B) Larger multi-HOA deployment: up to 10,000 homeowner users and 500 concurrent sessions
C) Minimal pilot only: up to 100 homeowner users and 10 concurrent sessions
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What response-time targets should UOW-01 use under normal load?

A) Authentication, permission checks, settings reads, and approval queue reads should target p95 <= 500 ms; audit queries should target p95 <= 2 seconds for filtered pages (recommended)
B) All UOW-01 requests should target p95 <= 200 ms, including audit queries
C) Best effort only; no explicit response-time target
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
What availability and recovery assumption should UOW-01 use?

A) Single-server/local Docker deployment with documented daily backups, recovery procedure, and expected manual restore; no automated failover in first implementation (recommended)
B) High-availability deployment with automated failover from first implementation
C) Development-only deployment with no backup or recovery expectations
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
What session lifetime policy should NFR Requirements target?

A) Short-lived idle timeout for privileged sessions, absolute session expiration for all users, and server-side revocation on logout/password reset (recommended)
B) Long-lived sessions until explicit logout only
C) No explicit session lifetime until later implementation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
What MFA method category should UOW-01 target?

A) Time-based one-time password (TOTP) for System Administrator and Treasurer accounts, with recovery-code support planned for NFR Design (recommended)
B) Email one-time codes only
C) SMS one-time codes only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
What password hashing and credential policy should UOW-01 target?

A) Adaptive password hashing such as Argon2id or bcrypt, minimum 8 characters, breached-password check where feasible, and no hardcoded credentials (recommended)
B) SHA-family hashing with salt
C) Password policy deferred to implementation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
What brute-force and reset-abuse control should UOW-01 target?

A) Progressive delay or temporary lockout after repeated failures, non-enumerating reset responses, audit events, and alertable security events (recommended)
B) CAPTCHA only
C) Audit only with no throttling or lockout
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
What audit retention and tamper-resistance target should UOW-01 use?

A) Application-level indefinite retention for financial/security audit records, no application update/delete paths, role-restricted queries, and later infrastructure-level append/tamper controls (recommended)
B) 90-day retention for all audit records
C) Retention not specified until deployment
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
What logging and monitoring baseline should UOW-01 target?

A) Structured logs with timestamp, level, correlation ID, safe message, security-event categories, and alertable events for repeated auth failures, authorization failures, and privilege changes (recommended)
B) Plain text application logs only
C) Logging deferred until production deployment
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
What HTTP browser security posture should UOW-01 target?

A) Required security headers, restrictive CSP starting at `default-src 'self'`, strict CORS allowlist for authenticated endpoints, and secure cookie attributes (recommended)
B) Basic framework defaults only
C) Defer headers and CORS to infrastructure design only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 11
What API validation and error-handling posture should UOW-01 target?

A) Schema validation on every endpoint, explicit size/length bounds, safe structured error codes, global error handler, and fail-closed authorization errors (recommended)
B) Validate only write requests
C) Defer validation details to code generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 12
What frontend accessibility target should foundation screens use?

A) WCAG 2.2 AA-oriented baseline for forms, keyboard navigation, focus states, contrast, labels, and error messaging (recommended)
B) Basic browser-default accessibility only
C) Accessibility deferred until after MVP
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 13
What TypeScript test runner strategy should UOW-01 target?

A) Jest-compatible stack for NestJS backend and React Testing Library for Next.js frontend, with integration paths for fast-check PBT (recommended)
B) Vitest for all backend and frontend tests
C) Minimal example-based tests only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 14
Which property-based testing framework should UOW-01 select for TypeScript?

A) `fast-check`, integrated with the chosen TypeScript test runner, with domain generators and seed logging (recommended)
B) No PBT framework for UOW-01
C) A custom random test helper instead of a PBT framework
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 15
What dependency and supply-chain baseline should UOW-01 target?

A) Lockfile-required dependency pinning, official registries only, dependency vulnerability scanning, no production `latest` images, and SBOM generation for production builds (recommended)
B) Lockfile only
C) Defer supply-chain controls until deployment
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 16
What secrets and configuration posture should UOW-01 target?

A) Environment-based configuration with schema validation, no secrets in source, redaction in logs/audit, and secrets-manager-ready abstraction even for local deployment (recommended)
B) Local `.env` values committed for convenience
C) Configuration deferred until code generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Post-Answer Processing

After all `[Answer]:` tags are complete:

- Answers will be checked for blanks, invalid choices, contradictions, and vague wording.
- Follow-up questions will be added if any answer is ambiguous.
- If answers are clear, NFR Requirements artifacts will be generated directly from this plan and approved source context.

## Answer Validation Summary

Validated at `2026-05-09T03:56:37Z`.

- Completion: all 16 `[Answer]:` tags are populated.
- Validity: all answers use valid option A choices.
- Ambiguity: none detected.
- Contradictions: none detected.
- Security Baseline: compliant at NFR Requirements level.
- Property-Based Testing: compliant; `fast-check` is selected for TypeScript PBT per PBT-09.
- Result: NFR Requirements artifacts generated.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant for planning | Questions cover authentication, MFA, session lifecycle, brute-force controls, audit, structured logging, security headers, CORS, validation, safe errors, supply chain, and secrets. Infrastructure-specific details remain for NFR Design and Infrastructure Design. |
| Property-Based Testing | Compliant for planning | Question 14 selects the TypeScript PBT framework required by PBT-09, and Question 13 selects the compatible test runner strategy. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown uses standard headings, lists, tables, and code spans only.
- All questions include a final `X) Other` option and `[Answer]:` tag.
