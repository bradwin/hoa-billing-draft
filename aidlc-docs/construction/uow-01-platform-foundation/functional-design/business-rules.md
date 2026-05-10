# UOW-01 Business Rules

## Authentication Rules

| Rule ID | Rule |
|---|---|
| UOW01-AUTH-001 | Authentication uses email/password credentials and server-managed sessions. |
| UOW01-AUTH-002 | Session cookies must be secure, httpOnly, and sameSite at implementation time. |
| UOW01-AUTH-003 | Sessions have server-side expiration and are invalidated on logout. |
| UOW01-AUTH-004 | Password reset invalidates all existing sessions for that user. |
| UOW01-AUTH-005 | Login responses must not reveal whether the email exists, the account is inactive, the account is locked, or the password is incorrect. |
| UOW01-AUTH-006 | Password reset request responses must not reveal whether the email exists. |
| UOW01-AUTH-007 | Repeated login failures trigger progressive delay or temporary lockout according to the failure policy. |
| UOW01-AUTH-008 | Authentication failures, lockouts, password reset requests, password reset completions, and session invalidations are audited as security events. |
| UOW01-AUTH-009 | Passwords, reset tokens, session IDs, MFA codes, and credential secrets must never appear in audit details or user-facing errors. |

## MFA Rules

| Rule ID | Rule |
|---|---|
| UOW01-MFA-001 | MFA is required for System Administrator and Treasurer accounts. |
| UOW01-MFA-002 | MFA is optional for Billing Staff, Board Member, and Homeowner accounts when supported. |
| UOW01-MFA-003 | A user whose role requires MFA cannot receive full privileged access until MFA is enrolled and satisfied. |
| UOW01-MFA-004 | MFA enrollment, challenge success, challenge failure, reset, and disablement are audited as security events. |
| UOW01-MFA-005 | MFA method details are finalized during NFR Design, but Functional Design requires a factor beyond password for administrative roles. |
| UOW01-MFA-006 | Disabling MFA for an administrative role is not allowed unless the account is first moved to a role that does not require MFA or a break-glass process is explicitly designed later. |

## Invitation and Activation Rules

| Rule ID | Rule |
|---|---|
| UOW01-INV-001 | Invitations are created only by System Administrator. |
| UOW01-INV-002 | An invitation is single-use and expires. |
| UOW01-INV-003 | An invitation binds the invited email to one fixed role. |
| UOW01-INV-004 | Activation cannot change the invited fixed role. |
| UOW01-INV-005 | Expired, cancelled, or accepted invitations cannot be used. |
| UOW01-INV-006 | Invitation token values are never stored in audit details or shown after creation. |
| UOW01-INV-007 | Invitation creation emits a notification intent but does not send email directly in UOW-01. |
| UOW01-INV-008 | Activation creates an active user only after credential setup and required identity checks succeed. |

## Role and Permission Rules

| Rule ID | Rule |
|---|---|
| UOW01-RBAC-001 | First implementation supports only fixed roles: System Administrator, Treasurer, Billing Staff, Board Member, and Homeowner. |
| UOW01-RBAC-002 | Custom roles and per-user permission overrides are out of scope. |
| UOW01-RBAC-003 | Permission checks are deny by default. |
| UOW01-RBAC-004 | Undefined roles, permissions, or resource types are denied. |
| UOW01-RBAC-005 | Client-side navigation state is not authorization. Backend checks remain authoritative. |
| UOW01-RBAC-006 | Board Member mutation permissions are denied unless a later approved design explicitly grants a specific command. |
| UOW01-RBAC-007 | Billing Staff cannot approve waivers, reversals, voids, write-offs, or adjustments. |
| UOW01-RBAC-008 | Treasurer approval permissions do not allow self-approval for sensitive financial requests. |

## Object Authorization Rules

| Rule ID | Rule |
|---|---|
| UOW01-OBJ-001 | Every request referencing a protected resource ID must perform object-level authorization. |
| UOW01-OBJ-002 | Homeowner access requires explicit ownership links to billing accounts or properties. |
| UOW01-OBJ-003 | Matching email address alone never grants homeowner access to a resource. |
| UOW01-OBJ-004 | Domain units own resource-specific authorization policies but must use UOW-01 actor and resource contracts. |
| UOW01-OBJ-005 | Authorization failures fail closed and are audited as security events. |
| UOW01-OBJ-006 | Missing ownership data denies homeowner access until the owning domain resolves the relationship. |

## Audit Rules

| Rule ID | Rule |
|---|---|
| UOW01-AUD-001 | Audit entries are append-only from the application perspective. |
| UOW01-AUD-002 | No application command may edit or delete an audit entry. |
| UOW01-AUD-003 | Audit entries include actor, timestamp, action, resource reference, category, correlation ID, result, and reason where applicable. |
| UOW01-AUD-004 | Financial and system changes include old value and new value where safe and applicable. |
| UOW01-AUD-005 | Sensitive values must be redacted or omitted from audit details. |
| UOW01-AUD-006 | Financial and security audit records are retained indefinitely by application behavior. |
| UOW01-AUD-007 | Audit query and export are role-restricted. |
| UOW01-AUD-008 | Audit entry creation failure on a financial or security-sensitive mutation must fail the mutation rather than silently continuing. |

## Approval Rules

| Rule ID | Rule |
|---|---|
| UOW01-APR-001 | Approval Workflow owns approval request metadata, not financial source-record mutation. |
| UOW01-APR-002 | Approval requests include target resource, action type, requester, reason, payload snapshot, status, and correlation ID. |
| UOW01-APR-003 | Sensitive financial requests start as `Pending`. |
| UOW01-APR-004 | Only authorized Treasurer users may approve or reject sensitive financial requests. |
| UOW01-APR-005 | The requester cannot approve or reject the same sensitive financial request. |
| UOW01-APR-006 | Rejected requests cannot affect financial source records. |
| UOW01-APR-007 | Approved financial actions are delegated to the owning domain service. |
| UOW01-APR-008 | UOW-01 cannot directly mutate invoice, payment, receipt, penalty, credit, adjustment, or account balance source records. |
| UOW01-APR-009 | All approval decisions are audited with requester, decision actor, decision, reason, and timestamp. |
| UOW01-APR-010 | Terminal approval states cannot transition to another state. |

## Settings Rules

| Rule ID | Rule |
|---|---|
| UOW01-SET-001 | UOW-01 owns the settings shell and HOA profile shell. |
| UOW01-SET-002 | Domain-specific billing, numbering, SMTP, storage, document, and payment method settings are delegated to owning units. |
| UOW01-SET-003 | Unknown setting keys are rejected. |
| UOW01-SET-004 | Every setting belongs to a typed category and owning unit. |
| UOW01-SET-005 | Setting changes require permission checks and audit entries. |
| UOW01-SET-006 | Setting values must pass schema validation before save. |

## Support Contract Rules

| Rule ID | Rule |
|---|---|
| UOW01-SUP-001 | UOW-01 defines document, storage, notification, and job interfaces and intent records. |
| UOW01-SUP-002 | UOW-01 may include null or test implementations only. |
| UOW01-SUP-003 | Concrete SMTP, PDF, filesystem, and worker adapters are prohibited until UOW-08. |
| UOW01-SUP-004 | Later domain units must use support contracts instead of ad hoc support logic. |
| UOW01-SUP-005 | Support side effects must not be modeled as prerequisites for committed financial source records. |

## Error Handling Rules

| Rule ID | Rule |
|---|---|
| UOW01-ERR-001 | Errors use stable codes and safe user-facing messages. |
| UOW01-ERR-002 | Error responses include correlation IDs where possible. |
| UOW01-ERR-003 | Internal exception details, stack traces, framework versions, paths, SQL details, and secrets are not shown to users. |
| UOW01-ERR-004 | Authorization, validation, and unexpected errors fail closed. |
| UOW01-ERR-005 | Security-sensitive denials are audited with safe detail. |

## Shared Kernel Rules

| Rule ID | Rule |
|---|---|
| UOW01-SHR-001 | `Money` is constrained to PHP for this project. |
| UOW01-SHR-002 | Invalid money, date range, billing period, resource reference, and pagination inputs are rejected. |
| UOW01-SHR-003 | `DateRange` start must be less than or equal to end. |
| UOW01-SHR-004 | Pagination page and page size must be positive and bounded by implementation limits. |
| UOW01-SHR-005 | Correlation IDs are propagated across command, query, audit, and support intent records. |

## Misuse Cases

| Misuse Case | Required Behavior |
|---|---|
| Homeowner guesses another invoice ID | Deny, return safe error, audit authorization failure |
| Billing Staff attempts to approve a waiver | Deny, return safe error, audit authorization failure |
| Treasurer requests and approves own payment reversal | Deny decision, keep request pending or require another Treasurer |
| Attacker repeatedly attempts login | Apply delay or lockout, audit failures, keep responses generic |
| User reuses activation or reset token | Reject safely and audit where appropriate |
| User attempts to query unrestricted audit data | Enforce role/category/resource scope and audit denial |
| Later unit tries to mutate financial records through approval core | Reject design or implementation; owning domain service must apply effects |

## Testable Properties

| Rule Area | PBT Category | Property |
|---|---|---|
| RBAC | Invariant | Undefined role or permission combinations deny access. |
| RBAC | Invariant | Fixed roles never receive permissions outside the matrix. |
| Object authorization | Invariant | Homeowner access is denied unless ownership graph contains the requested account or property. |
| Approval | Stateful | Approval request state transitions follow only allowed transitions. |
| Approval | Invariant | Requester is never a valid decision actor for the same sensitive request. |
| Audit | Stateful | Audit append never changes or removes existing entries. |
| Shared kernel | Round-trip | Valid parse/format pairs preserve value where formatting is lossless. |
| Session | Idempotence | Repeated logout leaves the session invalid without side effects that restore access. |
| Password reset | Idempotence | A reset token can produce at most one credential change. |

## Security Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-01 | N/A | Functional Design does not define storage infrastructure encryption. |
| SECURITY-02 | N/A | No network intermediary is designed in this artifact. |
| SECURITY-03 | Compliant for functional design | Security and audit events require structured correlation IDs and safe detail; concrete logging infrastructure is later. |
| SECURITY-04 | N/A | HTTP headers are implementation/NFR concerns. |
| SECURITY-05 | Compliant for functional design | All commands and settings require validation, type/category checks, and safe rejection. |
| SECURITY-06 | N/A | IAM policies are infrastructure concerns. |
| SECURITY-07 | N/A | Network rules are infrastructure concerns. |
| SECURITY-08 | Compliant | Deny-by-default, role checks, object authorization, and server-side enforcement are required. |
| SECURITY-09 | Compliant for functional design | Default credentials are not modeled; safe errors are required. |
| SECURITY-10 | N/A | Supply chain controls are code/build concerns. |
| SECURITY-11 | Compliant | Security-critical logic is isolated in UOW-01 with defense in depth and misuse cases. |
| SECURITY-12 | Compliant | MFA is required for System Administrator and Treasurer accounts; session and brute-force rules are defined. |
| SECURITY-13 | Compliant for functional design | Critical changes are auditable and unsafe token/secret disclosure is prohibited. |
| SECURITY-14 | Compliant for functional design | Security events are categorized for later alerting; infrastructure alerting remains later. |
| SECURITY-15 | Compliant | Fail-closed behavior and safe user-facing errors are required. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
