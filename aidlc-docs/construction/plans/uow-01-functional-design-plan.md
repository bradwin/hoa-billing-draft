# UOW-01 Functional Design Plan

## Unit

- **Unit ID**: UOW-01
- **Unit Name**: Platform Foundation, Access, Settings, Audit, and Approval Core
- **Stage**: Functional Design, Part 1 - Planning
- **Current Gate**: Functional Design artifacts generated; waiting for review approval

## Purpose

Define the technology-agnostic business behavior for the foundation unit before any NFR design or code generation. This unit is security-critical because it owns authentication, role enforcement, object authorization conventions, audit, approval workflow core, shared kernel contracts, and the settings shell used by later financial units.

## Source Context

- Unit definitions: `aidlc-docs/inception/application-design/unit-of-work.md`
- Unit dependencies: `aidlc-docs/inception/application-design/unit-of-work-dependency.md`
- Story map: `aidlc-docs/inception/application-design/unit-of-work-story-map.md`
- Application design: `aidlc-docs/inception/application-design/application-design.md`
- Component methods: `aidlc-docs/inception/application-design/component-methods.md`
- Stories: `US-001`, `US-002`, `US-003`

## Functional Design Scope

### In Scope

- User invitations, activation, login, logout, session lifecycle, password reset, and administrative MFA support.
- Fixed roles and permission matrix behavior for System Administrator, Treasurer, Billing Staff, Board Member, and Homeowner.
- Deny-by-default route and command authorization conventions.
- Object-level authorization contract used by later homeowner, property, invoice, payment, receipt, SOA, report, import, and document workflows.
- Audit entry model and append-only audit rules.
- Approval request core for sensitive financial actions, without implementing domain financial effects.
- Shared kernel value objects, error model, correlation identifiers, and transaction context contracts.
- Settings shell for HOA profile and cross-cutting setting categories.
- Support-service contracts for document, storage, notification, and job intents.
- Foundation frontend components for sign-in, activation, password reset, protected shell, role-aware navigation, settings shell, audit query shell, and approval queue shell.

### Out of Scope

- Billing rate rules, invoice numbering algorithms, payment allocation, penalties, SOA generation, report calculations, concrete SMTP delivery, PDF rendering, local file persistence, and worker job execution.
- Any mutation of invoice, payment, receipt, penalty, credit, adjustment, or account balance source records.

## Functional Design Checklist

- [x] Read UOW-01 definition and boundaries.
- [x] Read UOW-01 story assignments and supporting dependencies.
- [x] Read Application Design and component contracts.
- [x] Confirm Functional Design is required for UOW-01 because it includes new domain models, security rules, audit rules, approval state, and frontend workflows.
- [x] Create this Functional Design plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory.
- [x] Generate `aidlc-docs/construction/uow-01-platform-foundation/functional-design/business-logic-model.md`.
- [x] Generate `aidlc-docs/construction/uow-01-platform-foundation/functional-design/business-rules.md`.
- [x] Generate `aidlc-docs/construction/uow-01-platform-foundation/functional-design/domain-entities.md`.
- [x] Generate `aidlc-docs/construction/uow-01-platform-foundation/functional-design/frontend-components.md`.
- [x] Include PBT-01 testable property identification in Functional Design artifacts.
- [x] Verify Security Baseline compliance for applicable functional design rules.
- [x] Verify content validation before artifact creation.
- [x] Present the standardized Functional Design completion message.

## Required Functional Artifacts

After this plan is answered and validated, the following artifacts must be generated:

- `business-logic-model.md`: Workflows, state transitions, authorization flow, audit recording flow, approval core flow, settings shell behavior, support contract behavior, and testable properties.
- `business-rules.md`: Detailed rules, validations, constraints, denial conditions, approval constraints, audit immutability rules, and security-sensitive misuse cases.
- `domain-entities.md`: Technology-agnostic entity definitions and relationships for user, role, permission, invitation, session, MFA enrollment marker, password reset request, settings category, audit entry, approval request, and shared kernel objects.
- `frontend-components.md`: Foundation UI component hierarchy, role-aware navigation behavior, forms, validation states, protected route behavior, audit query shell, approval queue shell, and API integration points.

## Functional Design Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

### Question 1
What authentication and session model should UOW-01 design at the business-rule level?

A) Email/password authentication with secure, server-managed sessions and httpOnly sameSite cookies; session invalidation occurs on logout and password reset (recommended)
B) Stateless JWT access tokens with refresh tokens, where refresh rotation and revocation lists are part of UOW-01
C) Hybrid model: server-managed session for web users and JWT only for future API clients
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
How strict should the fixed role model be?

A) Fixed roles only: System Administrator, Treasurer, Billing Staff, Board Member, and Homeowner, with deny-by-default permissions and no custom roles in first implementation (recommended)
B) Fixed roles plus custom permission overrides per user
C) Fully configurable roles and permissions from the first implementation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
How should homeowner object-level authorization be modeled for later units?

A) Homeowner access is granted only through explicit ownership links to billing accounts/properties; every resource ID check must resolve to an owned account/property or an authorized operational role (recommended)
B) Homeowner access is inferred only from matching email address on records
C) Homeowner access is granted broadly to all records associated with the homeowner profile, without property/account-level checks
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
How should invitations and account activation behave?

A) Invitations are single-use, expire, bind to a fixed role, and activation must establish verified identity before login; expired or used invitations cannot be reused (recommended)
B) Invitations do not expire but are single-use
C) Administrators directly create active users without invitation activation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
What MFA policy should Functional Design assume?

A) MFA is required for System Administrator and Treasurer accounts and optional for Billing Staff, Board Member, and Homeowner accounts when supported (recommended)
B) MFA is only supported, not required, for all roles
C) MFA is deferred entirely from first implementation
X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 6
How should failed login and password reset abuse be handled at the functional-rule level?

A) Track repeated failures, apply progressive delays or temporary lockout, audit security events, and keep password reset responses non-enumerating (recommended)
B) Only audit failures, with no lockout or delay rule
C) Defer brute-force and reset-abuse behavior to NFR Design only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
What audit model should UOW-01 own?

A) Append-only audit entries with actor, timestamp, action, resource reference, correlation ID, reason where applicable, old value, new value, and security/financial/system category; no application path can edit or delete audit entries (recommended)
B) Basic activity log with actor, timestamp, and message only
C) Domain-specific audit tables owned independently by each later unit
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
What retention and visibility policy should Functional Design assume for audit records?

A) Financial and security audit records are retained indefinitely by application behavior, with role-restricted query/export; infrastructure retention details are deferred to NFR/Infrastructure Design (recommended)
B) Audit records are retained for 90 days only
C) Audit visibility is unrestricted for all operational users
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
How should approval workflow core execute approved financial actions?

A) Approval Workflow stores request, target, requested action, reason, payload snapshot, requester, decision, and status, then delegates approved execution to the owning domain service; UOW-01 never mutates financial source records directly (recommended)
B) Approval Workflow directly mutates any target records after approval
C) Each financial unit owns a separate approval model and UOW-01 only provides UI links
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
Should users be allowed to approve their own sensitive requests?

A) No. The requester cannot approve or reject their own sensitive financial request, even if they have Treasurer permissions; a different authorized Treasurer must decide (recommended)
B) Yes. Any Treasurer can approve, including the requester
C) Allow self-approval only for non-financial administrative requests
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 11
What should UOW-01 settings shell own versus defer?

A) UOW-01 owns HOA profile shell and settings category framework; domain-specific billing rules, numbering formats, SMTP details, and storage adapters are delegated to later units through typed setting categories (recommended)
B) UOW-01 owns all settings including billing rates, invoice numbering, SMTP, storage, and payment methods
C) Settings are implemented separately inside each domain unit without a shared shell
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 12
How should support-service contracts be modeled before UOW-08 implements adapters?

A) UOW-01 defines interfaces and intent records for document, storage, notification, and job requests, with null/test implementations only; concrete adapters are prohibited until UOW-08 (recommended)
B) UOW-01 implements simple SMTP, PDF, filesystem, and worker adapters immediately
C) Later units can each create their own support-service contracts
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 13
What frontend foundation behavior should be designed in UOW-01?

A) Sign-in, activation, password reset, protected app shell, role-aware navigation, settings shell, audit query shell, and approval queue shell with stable test identifiers (recommended)
B) Only sign-in and password reset screens
C) No frontend foundation in UOW-01; defer all UI to later domain units
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 14
How should domain errors and authorization denials be represented?

A) Use structured domain errors with stable codes, safe user-facing messages, correlation IDs, and separate audit/security detail; do not expose internal details to users (recommended)
B) Use free-form error strings from each service
C) Expose detailed internal errors to authenticated operational users for easier troubleshooting
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 15
Which UOW-01 behaviors should be treated as PBT candidates in Functional Design?

A) Permission resolution invariants, approval state transitions, audit append immutability, value-object parsing/formatting round trips, and idempotent logout/password-reset consumption where applicable (recommended)
B) Only value-object parsing and formatting
C) No PBT candidates in UOW-01
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Post-Answer Processing

After all `[Answer]:` tags are complete:

- Answers will be checked for blanks, invalid choices, contradictions, and vague wording.
- Follow-up questions will be added if any answer is ambiguous.
- If answers are clear, Functional Design artifacts will be generated directly from this plan and approved source context.

## Answer Validation Summary

Validated at `2026-05-09T03:42:04Z`.

- Completion: all 15 `[Answer]:` tags are populated.
- Validity: all answers use valid option letters.
- Blocking finding: Question 5 selected `C`, which defers MFA entirely.
- Security impact: SECURITY-12 requires MFA support for administrative accounts, and US-001 requires MFA support for administrative access.
- Resolution: Clarification answer selected `A`, requiring MFA for System Administrator and Treasurer accounts and making MFA optional for other roles when supported.
- Result: Functional Design artifact generation is unblocked and complete.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant for planning | Questions directly cover authentication, session handling, MFA, authorization, object-level access, audit, approval controls, error handling, support contracts, and abuse scenarios. Infrastructure-specific security rules remain for later NFR and Infrastructure stages. |
| Property-Based Testing | Compliant for planning | Question 15 explicitly requires PBT candidate selection so Functional Design can satisfy PBT-01. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown uses standard headings, lists, tables, and code spans only.
- All questions include a final `X) Other` option and `[Answer]:` tag.
