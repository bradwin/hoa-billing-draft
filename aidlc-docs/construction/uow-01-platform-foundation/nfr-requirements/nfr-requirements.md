# UOW-01 NFR Requirements

## Unit

- **Unit ID**: UOW-01
- **Unit Name**: Platform Foundation, Access, Settings, Audit, and Approval Core
- **Stage**: NFR Requirements

## Summary

UOW-01 is the security and audit foundation for all later units. The non-functional requirements prioritize access control correctness, audit integrity, safe failure behavior, and maintainable local/single-server deployment over horizontal scale.

## Capacity Requirements

| NFR ID | Requirement |
|---|---|
| UOW01-NFR-CAP-001 | First implementation targets one HOA/subdivision. |
| UOW01-NFR-CAP-002 | Support up to 1,000 homeowner users. |
| UOW01-NFR-CAP-003 | Support up to 25 operational users across System Administrator, Treasurer, Billing Staff, and Board Member roles. |
| UOW01-NFR-CAP-004 | Support up to 50 concurrent authenticated sessions. |
| UOW01-NFR-CAP-005 | Capacity assumptions must remain explicit in later Infrastructure Design; no multi-HOA scaling assumptions are allowed without revisiting unit requirements. |

## Performance Requirements

| NFR ID | Requirement |
|---|---|
| UOW01-NFR-PERF-001 | Authentication requests should target p95 <= 500 ms under normal load, excluding external email delivery. |
| UOW01-NFR-PERF-002 | Permission checks and object authorization helper calls should target p95 <= 500 ms under normal load. |
| UOW01-NFR-PERF-003 | Settings reads and approval queue reads should target p95 <= 500 ms under normal load for paged results. |
| UOW01-NFR-PERF-004 | Filtered audit queries should target p95 <= 2 seconds for paged results. |
| UOW01-NFR-PERF-005 | Audit queries must require filters or pagination; unrestricted full audit scans are not acceptable in application workflows. |

## Availability and Recovery Requirements

| NFR ID | Requirement |
|---|---|
| UOW01-NFR-AVAIL-001 | First implementation targets local or single-server Docker deployment. |
| UOW01-NFR-AVAIL-002 | Automated failover is not required in first implementation. |
| UOW01-NFR-AVAIL-003 | Daily backup expectations must be documented for the database and application-managed persistent files. |
| UOW01-NFR-AVAIL-004 | Manual restore procedure must be documented before production use. |
| UOW01-NFR-AVAIL-005 | Recovery expectations are manual restore from backup, not zero-downtime continuity. |

## Authentication and Session Requirements

| NFR ID | Requirement |
|---|---|
| UOW01-NFR-AUTH-001 | Authentication uses email/password credentials with server-managed sessions. |
| UOW01-NFR-AUTH-002 | Privileged sessions must have a short idle timeout. Exact timeout values are finalized in NFR Design. |
| UOW01-NFR-AUTH-003 | All sessions must have an absolute expiration. Exact expiration values are finalized in NFR Design. |
| UOW01-NFR-AUTH-004 | Logout revokes the server-side session. |
| UOW01-NFR-AUTH-005 | Password reset revokes active sessions for the user. |
| UOW01-NFR-AUTH-006 | Session cookies must use secure, httpOnly, and sameSite attributes. |
| UOW01-NFR-AUTH-007 | Authentication, activation, MFA, and reset flows must use non-enumerating failure responses. |

## MFA Requirements

| NFR ID | Requirement |
|---|---|
| UOW01-NFR-MFA-001 | System Administrator and Treasurer accounts require MFA. |
| UOW01-NFR-MFA-002 | MFA target method is time-based one-time password. |
| UOW01-NFR-MFA-003 | Recovery-code support must be planned in NFR Design. |
| UOW01-NFR-MFA-004 | Email-only MFA and SMS-only MFA are not the target method for first implementation. |
| UOW01-NFR-MFA-005 | MFA enrollment, challenge success, challenge failure, reset, and disablement must be auditable security events. |

## Credential Requirements

| NFR ID | Requirement |
|---|---|
| UOW01-NFR-CRED-001 | Passwords must be hashed with an adaptive password hashing algorithm such as Argon2id or bcrypt. |
| UOW01-NFR-CRED-002 | Weak SHA-family password hashing is prohibited. |
| UOW01-NFR-CRED-003 | Minimum password length is 8 characters. |
| UOW01-NFR-CRED-004 | Breached-password checking should be included where feasible. |
| UOW01-NFR-CRED-005 | No hardcoded credentials, passwords, API keys, or secrets may appear in source code, IaC, logs, or audit records. |

## Abuse Protection Requirements

| NFR ID | Requirement |
|---|---|
| UOW01-NFR-ABUSE-001 | Repeated authentication failures must trigger progressive delay or temporary lockout. |
| UOW01-NFR-ABUSE-002 | Password reset responses must not disclose account existence. |
| UOW01-NFR-ABUSE-003 | Authentication failures, lockouts, authorization failures, and privilege changes must be audit events. |
| UOW01-NFR-ABUSE-004 | Repeated authentication failures, authorization failures, and privilege changes must be alertable security events. |
| UOW01-NFR-ABUSE-005 | CAPTCHA-only protection is insufficient as the primary abuse control. |

## Audit Requirements

| NFR ID | Requirement |
|---|---|
| UOW01-NFR-AUD-001 | Financial and security audit records must be retained indefinitely by application behavior. |
| UOW01-NFR-AUD-002 | Application code must expose no update or delete path for audit records. |
| UOW01-NFR-AUD-003 | Audit queries must be role-restricted and filterable by actor, category, resource, action, and date range. |
| UOW01-NFR-AUD-004 | Infrastructure-level append-only or tamper-evident controls must be addressed later in NFR Design and Infrastructure Design. |
| UOW01-NFR-AUD-005 | Audit entries must include correlation IDs and safe structured details. |
| UOW01-NFR-AUD-006 | Secrets, tokens, passwords, MFA codes, session IDs, and sensitive credential values must not appear in audit details. |

## Logging and Monitoring Requirements

| NFR ID | Requirement |
|---|---|
| UOW01-NFR-LOG-001 | Logs must be structured. |
| UOW01-NFR-LOG-002 | Logs must include timestamp, level, correlation ID, safe message, and security-event category where applicable. |
| UOW01-NFR-LOG-003 | Sensitive values must be redacted from logs. |
| UOW01-NFR-LOG-004 | Repeated authentication failures, authorization failures, and privilege changes must be alertable. |
| UOW01-NFR-LOG-005 | Monitoring and alert transport details are finalized in NFR Design and Infrastructure Design. |

## Browser and API Security Requirements

| NFR ID | Requirement |
|---|---|
| UOW01-NFR-WEB-001 | HTML-serving endpoints must set required security headers. |
| UOW01-NFR-WEB-002 | Content Security Policy must start from `default-src 'self'`. |
| UOW01-NFR-WEB-003 | Authenticated API CORS must use an explicit allowlist and must not use wildcard origins. |
| UOW01-NFR-WEB-004 | Every endpoint must use schema validation. |
| UOW01-NFR-WEB-005 | Request size and string length bounds must be explicit. |
| UOW01-NFR-WEB-006 | Error responses must use safe structured codes and correlation IDs. |
| UOW01-NFR-WEB-007 | Authorization and validation errors must fail closed. |
| UOW01-NFR-WEB-008 | A global error handler is required. |

## Accessibility and Usability Requirements

| NFR ID | Requirement |
|---|---|
| UOW01-NFR-A11Y-001 | Foundation screens target a WCAG 2.2 AA-oriented baseline. |
| UOW01-NFR-A11Y-002 | Forms must support labels, validation messages, focus states, and keyboard navigation. |
| UOW01-NFR-A11Y-003 | Color contrast must meet AA-oriented expectations. |
| UOW01-NFR-A11Y-004 | Error messages must be clear without exposing sensitive internal detail. |
| UOW01-NFR-A11Y-005 | Interactive elements must have stable `data-testid` values during code generation. |

## Testing Requirements

| NFR ID | Requirement |
|---|---|
| UOW01-NFR-TEST-001 | Backend tests use a Jest-compatible stack for NestJS. |
| UOW01-NFR-TEST-002 | Frontend tests use React Testing Library for Next.js foundation components. |
| UOW01-NFR-TEST-003 | Property-based tests use `fast-check`. |
| UOW01-NFR-TEST-004 | PBT must integrate with the chosen TypeScript test runner. |
| UOW01-NFR-TEST-005 | PBT must support custom generators, shrinking, and seed-based reproducibility. |
| UOW01-NFR-TEST-006 | PBT seed logging must be included in later Code Generation and Build/Test instructions. |
| UOW01-NFR-TEST-007 | Critical security paths require example-based tests and PBT where applicable; PBT does not replace example tests. |

## Supply Chain Requirements

| NFR ID | Requirement |
|---|---|
| UOW01-NFR-SC-001 | Dependency lockfile is required. |
| UOW01-NFR-SC-002 | Dependencies must come from official registries or approved private registries. |
| UOW01-NFR-SC-003 | Dependency vulnerability scanning is required. |
| UOW01-NFR-SC-004 | Production Docker and CI artifacts must not use unpinned `latest` images. |
| UOW01-NFR-SC-005 | SBOM generation is required for production builds. |

## Secrets and Configuration Requirements

| NFR ID | Requirement |
|---|---|
| UOW01-NFR-CONF-001 | Configuration comes from environment-based sources with schema validation. |
| UOW01-NFR-CONF-002 | Secrets must not be committed to source. |
| UOW01-NFR-CONF-003 | Logs and audit records must redact configuration secrets. |
| UOW01-NFR-CONF-004 | Configuration should be secrets-manager-ready even for local deployment. |
| UOW01-NFR-CONF-005 | Committed `.env` files containing real secrets are prohibited. |

## Security Baseline Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-01 | N/A for NFR Requirements | Encryption configuration is finalized in Infrastructure Design, but the requirement is acknowledged. |
| SECURITY-02 | N/A for NFR Requirements | Network intermediaries are not selected for this local/single-server target yet. |
| SECURITY-03 | Compliant | Structured application logging with correlation IDs and sensitive data redaction is required. |
| SECURITY-04 | Compliant | Required security headers and restrictive CSP are required. |
| SECURITY-05 | Compliant | Schema validation, size bounds, safe errors, and fail-closed behavior are required for every endpoint. |
| SECURITY-06 | N/A for NFR Requirements | IAM/resource policy details are Infrastructure Design concerns. |
| SECURITY-07 | N/A for NFR Requirements | Network controls are Infrastructure Design concerns. |
| SECURITY-08 | Compliant | Deny-by-default authorization, object checks, strict CORS, and server-side session validation are required. |
| SECURITY-09 | Compliant | Safe errors, no hardcoded credentials, and supported runtime expectations are required. |
| SECURITY-10 | Compliant | Lockfile, vulnerability scanning, official registries, pinned images, and SBOM are required. |
| SECURITY-11 | Compliant | Security-critical UOW-01 concerns remain isolated and abuse scenarios are required. |
| SECURITY-12 | Compliant | Adaptive password hashing, administrative MFA, session expiration/revocation, brute-force protection, and no hardcoded credentials are required. |
| SECURITY-13 | Compliant | Critical changes are auditable and configuration/secrets integrity constraints are required. |
| SECURITY-14 | Compliant | Alertable security events and audit tamper-resistance requirements are documented for later design. |
| SECURITY-15 | Compliant | Safe structured errors, global error handling, and fail-closed behavior are required. |

## Property-Based Testing Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| PBT-09 | Compliant | TypeScript PBT framework is selected as `fast-check`, with custom generators, shrinking, seed reproducibility, and test runner integration required. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
