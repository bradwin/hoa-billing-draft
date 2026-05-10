# UOW-02 NFR Requirements Plan

## Unit

- **Unit ID**: UOW-02
- **Unit Name**: Homeowner, Property, Ownership, and Contact Requests
- **Stage**: NFR Requirements, Planning
- **Current Gate**: Waiting for answers to all questions before NFR Requirements artifacts are generated

## Purpose

Define UOW-02 non-functional requirements and technology stack decisions before NFR Design and Code Generation. UOW-02 is the source of property, homeowner, ownership, and billing-account responsibility facts consumed by later financial units, so vague defaults around validation, search, authorization, audit, concurrency, and test strategy are unsafe.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/functional-design/business-logic-model.md` | Defines UOW-02 workflows and boundaries. |
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/functional-design/business-rules.md` | Defines UOW-02 validation, access, audit, and state rules. |
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/functional-design/domain-entities.md` | Defines UOW-02 entity and read model contracts. |
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/functional-design/frontend-components.md` | Defines UOW-02 frontend workflows and API expectations. |
| `aidlc-docs/construction/uow-01-platform-foundation/nfr-requirements/` | Establishes foundation stack, security, logging, test, and PBT decisions to reuse. |
| `aidlc-docs/inception/requirements/requirements.md` | Defines system-wide scale, security, PBT, usability, and deployment requirements. |

## NFR Assessment Scope

### In Scope

- Capacity assumptions for homeowner, property, ownership, contact-change, alias, and billing-account period records.
- Performance targets for staff search, detail reads, billable validation, duplicate checks, ownership transfers, and contact-change decisions.
- Search and indexing requirements for normalized property identities, aliases, homeowner contact fields, and status filters.
- Transaction, concurrency, and consistency requirements for ownership periods and billing-account periods.
- PII minimization and field-level response requirements for staff, Board Member, and homeowner views.
- Audit and structured logging requirements for duplicate overrides, alias changes, ownership transfers, billable-impacting changes, and contact decisions.
- Abuse protection for contact-change submission and search access.
- Frontend accessibility, automation, and safe error display requirements.
- PBT-09 framework confirmation and UOW-02 domain generator requirements.

### Out of Scope

- Infrastructure resource sizing, network topology, encryption configuration, and backup implementation. These belong to Infrastructure Design.
- Application code, database schema, API DTOs, and exact indexes. These belong to Code Generation, but NFR Requirements must define the requirements those designs satisfy.
- Invoice generation, dues calculation, payments, penalties, credits, adjustments, statements, reports, documents, emails, and import batch execution. These belong to later units.

## NFR Requirements Checklist

- [x] Read UOW-02 Functional Design artifacts.
- [x] Read NFR Requirements rule details.
- [x] Confirm Security Baseline and Property-Based Testing extensions are enabled.
- [x] Identify UOW-02 NFR categories and decision points.
- [x] Create this NFR Requirements plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory.
- [x] Generate `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/nfr-requirements/nfr-requirements.md`.
- [x] Generate `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/nfr-requirements/tech-stack-decisions.md`.
- [x] Verify PBT-09 framework selection is included.
- [x] Verify Security Baseline compliance summary.
- [x] Verify content validation before artifact creation.
- [x] Present the standardized NFR Requirements completion message.

## Required NFR Artifacts

After this plan is answered and validated, generate:

- `nfr-requirements.md`: Capacity, performance, availability, security, privacy, audit, logging, testing, usability, accessibility, and maintainability requirements.
- `tech-stack-decisions.md`: UOW-02 technology choices and rationale for validation, persistence/search strategy, authorization integration, auditing, frontend testing, and PBT.

## NFR Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

### Question 1
What capacity target should UOW-02 use for first implementation?

A) One HOA/subdivision: up to 1,000 properties, up to 2,000 homeowner master records including historical/inactive records, and up to 10,000 ownership/contact/alias support records (recommended)
B) One HOA/subdivision only, but no explicit master-data record limits
C) Multi-HOA capacity from first implementation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What response-time targets should UOW-02 use under normal load?

A) Staff searches p95 <= 1 second for paged/filterable results; detail reads, billable validation, duplicate checks, and contact decisions p95 <= 500 ms under normal single-HOA load (recommended)
B) All UOW-02 requests p95 <= 200 ms
C) Best effort only; no explicit response-time target
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
What search and indexing approach should UOW-02 target?

A) PostgreSQL-backed indexed search on normalized homeowner, property, alias, status, and billing fields; no external search service in first implementation (recommended)
B) External search service from first implementation
C) Free-text database search only, with no explicit normalized indexes
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
What duplicate-detection performance and behavior should UOW-02 require?

A) Deterministic normalized duplicate checks must be fast enough for staff create/update workflows and must return bounded candidate lists with safe match signals (recommended)
B) Duplicate checks may run as background review after record creation
C) Duplicate checks are manual staff review only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
What transaction and concurrency requirement should apply to ownership transfer and billing-account period changes?

A) Ownership transfer, billing-account period changes, validation of non-overlap, and audit persistence must occur in one transaction with conflict detection for concurrent edits (recommended)
B) Transactional persistence is required, but concurrent edit conflicts can be handled manually after the fact
C) No explicit concurrency requirement
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
What billable-property validation consistency should later billing units rely on?

A) UOW-02 validation is deterministic for a supplied `validationDate` and fails closed on missing, ambiguous, or conflicting ownership/account data (recommended)
B) UOW-02 may return warnings and let billing decide whether to include the property
C) UOW-02 validation consistency is deferred to UOW-04
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
What PII minimization posture should UOW-02 require?

A) Field-level response shaping by role, Board Member PII minimization, homeowner own-resource isolation, and no PII in application logs except safe audit references (recommended)
B) Role-based page access is enough; field-level response shaping is not required
C) PII minimization deferred to reporting and portal units
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
What audit and logging baseline should UOW-02 target?

A) Structured logs with correlation IDs and redaction, plus audit records for duplicate override, alias changes, billable-impacting property changes, ownership transfers, billing-account period changes, contact decisions, and authorization denials (recommended)
B) Audit only final successful mutations; failed validation and authorization denials are not auditable
C) Logging and audit details deferred to Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
What abuse protection should apply to UOW-02 contact-change and search workflows?

A) Authenticated contact-change submissions and staff/portal searches use UOW-01 authorization plus rate or volume controls appropriate to single-HOA usage; repeated denials or unusual access patterns are alertable (recommended)
B) No rate or volume controls are needed because the app is authenticated
C) Abuse protection deferred to infrastructure only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
What API validation and safe error posture should UOW-02 target?

A) Schema validation on every UOW-02 endpoint, explicit string/date/decimal/page bounds, safe duplicate/conflict errors, global error handling, and fail-closed authorization/validation behavior (recommended)
B) Validate only create/update commands, not search or read endpoints
C) Defer validation details to Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 11
What frontend usability and accessibility baseline should UOW-02 use?

A) WCAG 2.2 AA-oriented forms/tables, keyboard navigation, focus states, clear validation summaries, stable `data-testid` values, and safe correlation-ID error display (recommended)
B) Basic browser defaults only
C) Accessibility deferred until after MVP
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 12
What TypeScript testing strategy should UOW-02 target?

A) Jest-compatible backend tests, React Testing Library frontend tests, integration tests for persistence/authorization boundaries, and `fast-check` PBT for identified UOW-02 properties (recommended)
B) Backend unit tests only
C) Manual testing only for UOW-02
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 13
Which property-based testing framework should UOW-02 confirm for PBT-09?

A) Reuse `fast-check` with custom generators for property identities, homeowner identities, ownership periods, billing account periods, billable validation inputs, and contact request states (recommended)
B) No PBT framework for UOW-02
C) Custom random helpers instead of a PBT framework
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 14
What technology-stack posture should UOW-02 use?

A) Reuse UOW-01 approved stack: TypeScript, NestJS, Next.js, PostgreSQL, Prisma, Zod-style schema validation, Jest-compatible tests, React Testing Library, and `fast-check`; no new database/search/cache technology in this unit (recommended)
B) Add a separate search/cache service for UOW-02
C) Defer stack choices to Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Post-Answer Processing

After all `[Answer]:` tags are complete:

- Answers will be checked for blanks, invalid choices, contradictions, and vague wording.
- Follow-up questions will be added if any answer is ambiguous.
- If answers are clear, NFR Requirements artifacts will be generated directly from this plan and approved source context.

## Answer Validation Summary

Validated at `2026-05-09T12:06:35Z`.

- Completion: all 14 `[Answer]:` tags are populated.
- Validity: all answers use valid option A choices.
- Ambiguity: none detected.
- Contradictions: none detected.
- Security Baseline: compliant at NFR Requirements level.
- Property-Based Testing: compliant; `fast-check` is confirmed for TypeScript PBT per PBT-09.
- Result: NFR Requirements artifacts generated.

## Generated Artifacts

- `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/nfr-requirements/nfr-requirements.md`
- `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/nfr-requirements/tech-stack-decisions.md`

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant for planning | Questions cover authorization, field-level PII minimization, safe validation, audit, logging, abuse protection, safe errors, transaction boundaries, and no new infrastructure assumptions. |
| Property-Based Testing | Compliant for planning | Questions confirm `fast-check` for PBT-09 and carry forward UOW-02 domain generators from Functional Design. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
