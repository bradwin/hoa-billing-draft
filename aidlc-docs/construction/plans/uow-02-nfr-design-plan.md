# UOW-02 NFR Design Plan

## Unit

- **Unit ID**: UOW-02
- **Unit Name**: Homeowner, Property, Ownership, and Contact Requests
- **Stage**: NFR Design, Planning
- **Current Gate**: Waiting for answers in this file

## Purpose

Translate approved UOW-02 NFR Requirements into concrete non-functional patterns and logical components before Infrastructure Design and Code Generation. This stage must decide how UOW-02 satisfies indexed search, deterministic duplicate checks, ownership concurrency, billable validation consistency, PII minimization, audit/logging, abuse protection, accessibility, and PBT requirements at design level.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/nfr-requirements/nfr-requirements.md` | Approved UOW-02 NFR requirements. |
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/nfr-requirements/tech-stack-decisions.md` | Approved UOW-02 stack decisions. |
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/functional-design/` | UOW-02 business logic, rules, entities, and frontend components. |
| `aidlc-docs/construction/uow-01-platform-foundation/nfr-design/` | Foundation patterns for auth, audit, validation, logging, PBT, and support intents. |

## NFR Design Scope

### In Scope

- PostgreSQL indexed search and normalized key design patterns.
- Deterministic duplicate candidate query patterns.
- Transaction and concurrency patterns for ownership and billing-account periods.
- Billable validation consistency and fail-closed error patterns.
- Field-level PII response shaping and Board Member minimization patterns.
- Audit/logging/security event patterns for UOW-02 mutations and denials.
- Abuse protection patterns for contact change submissions and search endpoints.
- Accessibility and frontend safe-error design patterns.
- PBT generator, state-model, seed, and integration patterns for UOW-02.
- Logical components needed to implement the above.

### Out of Scope

- Concrete database migrations, code, DTOs, generated tests, and API handlers. These belong to Code Generation.
- Concrete infrastructure resource definitions, TLS, backup commands, network policy, and deployment topology. These belong to Infrastructure Design.
- Invoice generation, dues calculation, payments, penalties, credits, adjustments, statements, reports, documents, emails, and import batch execution. These belong to later units.

## NFR Design Checklist

- [x] Read UOW-02 NFR Requirements artifacts.
- [x] Read UOW-02 Functional Design artifacts.
- [x] Read NFR Design rule details.
- [x] Confirm Security Baseline and Property-Based Testing extensions are enabled.
- [x] Identify UOW-02 NFR design patterns and logical component decisions.
- [x] Create this NFR Design plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory.
- [x] Generate `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/nfr-design/nfr-design-patterns.md`.
- [x] Generate `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/nfr-design/logical-components.md`.
- [x] Verify Security Baseline compliance summary.
- [x] Verify PBT design carries forward PBT-01 and PBT-09 decisions.
- [x] Verify content validation before artifact creation.
- [x] Present the standardized NFR Design completion message.

## Required NFR Design Artifacts

After this plan is answered and validated, generate:

- `nfr-design-patterns.md`: Search, indexing, transaction, concurrency, validation, authorization, privacy, audit, logging, abuse protection, accessibility, and PBT patterns.
- `logical-components.md`: Logical components, responsibilities, dependencies, data flow, and NFR responsibility mapping.

## NFR Design Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

### Question 1
What indexed search pattern should UOW-02 use?

A) PostgreSQL B-tree indexes for exact/status/date fields plus normalized text columns for homeowner/property/alias search; no external search service or cache in UOW-02 (recommended)
B) PostgreSQL full-text search vectors for all search fields from first implementation
C) External search service despite NFR Requirements rejecting new search infrastructure
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What duplicate candidate pattern should UOW-02 use?

A) Deterministic normalized candidate queries with ranked safe match signals, bounded results, and explicit staff confirmation audit for overrides (recommended)
B) Fuzzy matching with manual score thresholds but no deterministic normalized keys
C) Background-only duplicate review after creation
X) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 3
What ownership and billing-account concurrency pattern should UOW-02 use?

A) Transactional command handler with row-level locking or equivalent conflict detection around property ownership periods and billing-account periods, plus database constraints where practical (recommended)
B) Optimistic client-side checks only, relying on staff to resolve conflicts later
C) No explicit concurrency pattern because first deployment is small
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
How should UOW-02 enforce half-open interval overlap rules?

A) Shared date-range validator plus persistence-level non-overlap guard where practical; service rejects overlap before commit and handles race conflicts safely (recommended)
B) Service-only validation with no persistence-level guard
C) UI-only validation because staff controls ownership changes
X) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 5
What billable validation component pattern should UOW-02 use?

A) Pure deterministic domain service that takes property ID and `validationDate`, reads effective ownership/account facts, returns reason-coded validation, and has no side effects (recommended)
B) Validation service may cache results and update stored billability state automatically
C) Billing unit should implement validation directly from UOW-02 tables
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
What field-level PII shaping pattern should UOW-02 use?

A) Backend read-model projectors apply role/resource field policies before response serialization; frontend renders only returned fields (recommended)
B) Backend returns full records and frontend hides restricted fields
C) PII shaping deferred to reports and portal units
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
What audit and structured logging pattern should UOW-02 use?

A) UOW-02 command handlers create audit entries through UOW-01 audit contracts in the same transaction where possible, while structured logs carry only safe correlation and diagnostic fields (recommended)
B) Write application logs only and derive audits later
C) Audit only successful final mutations, not denials or validation failures
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
What abuse-protection pattern should UOW-02 use for search and contact changes?

A) Reuse UOW-01 actor/security event contracts with bounded pagination, minimum filter rules for sensitive searches, per-actor rate or volume counters, and alertable repeated denials/unusual access (recommended)
B) Depend only on authentication and object authorization
C) Defer abuse protection to infrastructure rate limits only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
What safe error pattern should UOW-02 use for duplicate, overlap, authorization, and validation failures?

A) Stable domain error codes with safe user messages, correlation IDs, and non-enumerating authorization failures; internal details only in redacted logs/audit (recommended)
B) Return detailed database and matching diagnostics to help staff fix data
C) Use generic one-message errors for every failure
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
What frontend NFR pattern should UOW-02 use?

A) Server-authorized data loading, accessible filter/table/form components, stable `data-testid` values, validation summary panels, PII-mask indicators, and safe error banners (recommended)
B) Basic forms and tables with accessibility deferred
C) Frontend design deferred entirely to Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 11
What PBT design pattern should UOW-02 use?

A) Centralized `fast-check` domain generators and state models for property normalization, property uniqueness, ownership periods, billing-account periods, billable validation, and contact request transitions (recommended)
B) Separate ad hoc generators inside each test file
C) PBT only for property normalization
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 12
What logical component decomposition should UOW-02 use?

A) Separate logical components for HomeownerProfile, PropertyRegistry, OwnershipTimeline, BillingAccountPeriod, BillableValidation, ContactChange, SearchReadModel, AuthorizationPolicy, AuditAdapter, and PBTGenerators (recommended)
B) One large HomeownerProperty service containing all behavior
C) Defer component decomposition to Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Post-Answer Processing

After all `[Answer]:` tags are complete:

- Answers will be checked for blanks, invalid choices, contradictions, and vague wording.
- Follow-up questions will be added if any answer is ambiguous.
- If answers are clear, NFR Design artifacts will be generated directly from this plan and approved source context.

## Answer Validation Summary

Validated at `2026-05-09T12:13:34Z`.

- Completion: all 12 `[Answer]:` tags are populated.
- Validity: all answers use valid option A choices.
- Ambiguity: none detected.
- Contradictions: none detected.
- Security Baseline: compliant at NFR Design level.
- Property-Based Testing: compliant; `fast-check` design carries forward UOW-02 PBT properties, domain generators, state models, shrinking, and seed reproducibility.
- Result: NFR Design artifacts generated.

## Generated Artifacts

- `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/nfr-design/nfr-design-patterns.md`
- `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/nfr-design/logical-components.md`

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant for planning | Questions cover backend authorization, field-level PII shaping, safe errors, audit, structured logging, abuse controls, transaction safety, and no client-side security reliance. |
| Property-Based Testing | Compliant for planning | Questions carry forward `fast-check`, domain generators, stateful models, shrinking, and seed reproducibility expectations from Functional Design and NFR Requirements. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
