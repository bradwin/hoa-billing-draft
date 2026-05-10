# UOW-01 Tech Stack Decisions

## Unit

- **Unit ID**: UOW-01
- **Unit Name**: Platform Foundation, Access, Settings, Audit, and Approval Core
- **Stage**: NFR Requirements

## Summary

UOW-01 uses the approved TypeScript modular monolith stack and selects the foundation security, validation, testing, logging, and PBT technologies needed for later design and code generation.

## Core Stack

| Area | Decision | Rationale |
|---|---|---|
| Language | TypeScript | Matches approved application architecture and supports shared types across API, web, worker, and shared packages. |
| Backend framework | NestJS | Matches approved backend architecture and supports guards, modules, validation, and structured application layering. |
| Frontend framework | Next.js with React | Matches approved frontend architecture with one app and role-aware portal shell. |
| Database | PostgreSQL | Approved database for transactional audit, sessions, approvals, settings, and later financial source records. |
| ORM/data access | Prisma | Approved data access layer; detailed schema and transaction design occur later. |
| Worker process | Shared TypeScript worker process | UOW-01 defines job contracts only; concrete job execution belongs later. |
| Deployment target | Local or single-server Docker | Matches first implementation scope. |

## Authentication and Session Decisions

| Area | Decision | Notes |
|---|---|---|
| Auth model | Email/password with server-managed sessions | Avoids broad stateless token revocation complexity for the first implementation. |
| Session cookie | secure, httpOnly, sameSite | Exact sameSite mode and cookie names are finalized during NFR Design/Code Generation. |
| Session lifecycle | Idle timeout for privileged sessions, absolute expiration for all sessions, server-side revocation | Exact timeout values are NFR Design details. |
| Password reset | Single-use expiring reset request with session revocation | Responses must be non-enumerating. |

## Credential and MFA Decisions

| Area | Decision | Notes |
|---|---|---|
| Password hashing | Argon2id preferred; bcrypt acceptable fallback if runtime constraints require it | Code Generation must choose one and pin dependencies. |
| Password policy | Minimum 8 characters and breached-password checking where feasible | SECURITY-12 compliance requirement. |
| MFA method | TOTP for System Administrator and Treasurer accounts | Email-only and SMS-only MFA are rejected as first-choice methods. |
| Recovery | Recovery-code support planned for NFR Design | Required to avoid account lockout risk for administrative roles. |
| MFA enforcement | Required for System Administrator and Treasurer; optional for other roles when supported | Resolved from Functional Design clarification. |

## Authorization Decisions

| Area | Decision | Notes |
|---|---|---|
| Role model | Fixed roles only | No custom roles or per-user overrides in first implementation. |
| Permission model | Deny by default | Missing role/permission/resource mappings deny access. |
| Object authorization | Explicit ownership graph for homeowner resources | Matching email alone never grants access. |
| Backend enforcement | Required on every protected endpoint | Client navigation is not authorization. |
| CORS | Explicit allowlist for authenticated endpoints | Wildcard CORS is prohibited for authenticated APIs. |

## Validation and Error Decisions

| Area | Decision | Notes |
|---|---|---|
| Validation approach | Schema validation on every endpoint | Exact library selection occurs in Code Generation, with Zod or class-validator acceptable if consistently used. |
| Input limits | Explicit string length, payload size, and pagination bounds | Must be present in generated DTO/schema definitions. |
| Error model | Stable domain error codes, safe messages, correlation IDs | Internal details must be logged safely, not shown to users. |
| Global errors | Global error handler required | Must fail closed and redact sensitive details. |

## Audit, Logging, and Monitoring Decisions

| Area | Decision | Notes |
|---|---|---|
| Audit retention | Indefinite by application behavior for financial and security audit records | Infrastructure append/tamper controls are later design work. |
| Audit mutation | No application update/delete path | Append-only model is required. |
| Structured logging | Required | Logs include timestamp, level, correlation ID, safe message, and security-event categories. |
| Alertable events | Repeated auth failures, authorization failures, and privilege changes | Alert transport is later design work. |
| Sensitive data | Redacted from logs and audit | Passwords, tokens, session IDs, MFA codes, and secrets must not be logged. |

## Browser Security Decisions

| Area | Decision | Notes |
|---|---|---|
| CSP | Start with `default-src 'self'` | Exceptions require documentation during NFR Design/Code Generation. |
| Required headers | CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy | SECURITY-04 compliance requirement. |
| Secure cookies | Required | Tied to server-managed sessions. |
| Frontend data handling | No sensitive token or MFA code logging | Applies to client diagnostics and test helpers. |

## Accessibility and UI Decisions

| Area | Decision | Notes |
|---|---|---|
| Accessibility target | WCAG 2.2 AA-oriented baseline | Applies to foundation forms and shell. |
| UI testing support | Stable `data-testid` values | Required by frontend guidance and functional design. |
| Form UX | Labels, keyboard navigation, focus states, contrast, and safe error messaging | Must be validated during frontend code generation. |

## Testing Stack Decisions

| Area | Decision | Rationale |
|---|---|---|
| Backend test runner | Jest-compatible stack for NestJS | Aligns with NestJS defaults and supports integration with fast-check. |
| Frontend component testing | React Testing Library | Standard React/Next.js component testing approach focused on user-visible behavior. |
| Property-based testing | `fast-check` | Required by PBT-09 for TypeScript; supports custom generators, shrinking, seed reproducibility, and Jest/Vitest-style integration. |
| PBT seed handling | Seed logging required | Exact configuration belongs to Code Generation and Build/Test instructions. |
| Test strategy | Example tests plus PBT where properties were identified | PBT complements example tests and cannot be the only coverage for critical paths. |

## Supply Chain Decisions

| Area | Decision | Notes |
|---|---|---|
| Dependency pinning | Lockfile required | Package manager choice is finalized during code generation. |
| Source of dependencies | Official registries or approved private registries only | No unvetted third-party sources. |
| Vulnerability scanning | Required | Exact scanner can be npm audit, pnpm audit, or another approved scanner during Code Generation/Build-Test. |
| Container tags | No production `latest` image tags | Production Docker images and CI tool images must be pinned. |
| SBOM | Required for production builds | Exact SBOM tooling is later. |

## Configuration and Secrets Decisions

| Area | Decision | Notes |
|---|---|---|
| Configuration source | Environment-based configuration with schema validation | Applies to API, web, worker, and shared runtime settings. |
| Secrets | No secrets in source code or committed config | `.env` examples must use placeholders only. |
| Redaction | Required in logs and audit | Applies to secrets, passwords, tokens, session IDs, and MFA material. |
| Secrets-manager readiness | Required abstraction even for local deployment | Local deployment may use environment variables, but design must not prevent later secrets manager adoption. |

## Deferred Decisions for NFR Design

| Deferred Item | Reason |
|---|---|
| Exact session idle and absolute timeout values | Need detailed security/usability tradeoff in NFR Design. |
| Exact MFA recovery-code lifecycle | Requires detailed design of generation, display, storage, rotation, and reset. |
| Exact validation library | Code-generation-level decision, but schema validation is mandatory. |
| Exact logging transport | Depends on single-server deployment and Infrastructure Design. |
| Exact backup tooling and schedule implementation | Infrastructure Design owns implementation. |
| Exact SBOM and vulnerability scanner commands | Code Generation and Build/Test own implementation. |

## PBT-09 Compliance

| Requirement | Decision |
|---|---|
| Framework selected | `fast-check` |
| Language | TypeScript |
| Custom generators | Required for UOW-01 domain objects such as roles, permissions, approval states, audit entries, sessions, and value objects |
| Shrinking | Must remain enabled |
| Seed reproducibility | Required; seed must be logged on failure |
| Test runner integration | Jest-compatible backend and frontend test setup |
| Project dependency | Must be included during Code Generation |

## Security Baseline Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-03 | Compliant | Structured logging is selected. |
| SECURITY-04 | Compliant | Required HTTP security headers are selected. |
| SECURITY-05 | Compliant | Schema validation and input bounds are selected. |
| SECURITY-08 | Compliant | Deny-by-default authorization, object checks, server sessions, and strict CORS are selected. |
| SECURITY-09 | Compliant | Safe error handling and no hardcoded credentials are required. |
| SECURITY-10 | Compliant | Lockfile, vulnerability scanning, official registries, pinned images, and SBOM are required. |
| SECURITY-11 | Compliant | Security-critical logic remains isolated in UOW-01. |
| SECURITY-12 | Compliant | Adaptive hashing, administrative MFA, session expiration/revocation, brute-force controls, and no hardcoded credentials are selected. |
| SECURITY-13 | Compliant | Critical changes remain auditable and configuration/secrets integrity is required. |
| SECURITY-14 | Compliant | Alertable security events are required. |
| SECURITY-15 | Compliant | Global error handler, safe errors, and fail-closed behavior are required. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
