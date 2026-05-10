# UOW-03 NFR Design Plan

## Unit

- **Unit ID**: UOW-03
- **Unit Name**: Billing Configuration and Charge Rules
- **Stage**: NFR Design, Planning
- **Current Gate**: Waiting for answers in this file

## Purpose

Translate approved UOW-03 NFR Requirements into concrete non-functional patterns and logical components before Infrastructure Design and Code Generation. UOW-03 is financially sensitive configuration infrastructure for later units, so the design must make fail-closed resolution, immutable effective-dated versions, approval/audit coupling, decimal safety, safe observability, and downstream snapshot contracts explicit.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/nfr-requirements/nfr-requirements.md` | Approved UOW-03 NFR requirements. |
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/nfr-requirements/tech-stack-decisions.md` | Approved UOW-03 stack decisions. |
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/functional-design/` | UOW-03 business logic, rules, entities, and frontend components. |
| `aidlc-docs/construction/uow-01-platform-foundation/` | Foundation patterns for auth, authorization, approval, audit, logging, validation, safe errors, and testing. |
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/` | Prior unit patterns for effective-date validation, fail-closed validation, role-filtered read models, and PBT. |

## NFR Design Scope

### In Scope

- Fail-closed configuration resolution patterns.
- Effective-date non-overlap and half-open interval enforcement patterns.
- Transaction and concurrency patterns for draft submission, approval, activation, and audit coupling.
- Decimal-safety and deterministic rounding metadata patterns.
- Typed resolution DTO/snapshot patterns for downstream units.
- Backend authorization, object/scope authorization, approval, and safe error patterns.
- Structured logging, metrics/event patterns, and sensitive payload redaction.
- Staff frontend accessibility and safe validation-summary patterns.
- PBT generator, state-model, seed, shrinking, and regression-capture patterns.
- Logical components needed to implement the above.

### Out of Scope

- Concrete database migrations, code, DTO implementations, generated tests, and API handlers. These belong to Code Generation.
- Concrete infrastructure resource definitions, TLS, backup commands, network policy, and deployment topology. These belong to Infrastructure Design.
- Invoice creation, invoice-line creation, balances, payments, penalties, credits, adjustments, statements, reports, documents, emails, support jobs, and import batches. These belong to later units.

## NFR Design Checklist

- [x] Read UOW-03 NFR Requirements artifacts.
- [x] Read UOW-03 Functional Design artifacts.
- [x] Read NFR Design rule details.
- [x] Confirm Security Baseline and Property-Based Testing extensions are enabled.
- [x] Identify UOW-03 NFR design patterns and logical component decisions.
- [x] Create this NFR Design plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory.
- [x] Generate `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/nfr-design/nfr-design-patterns.md`.
- [x] Generate `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/nfr-design/logical-components.md`.
- [x] Verify Security Baseline compliance summary.
- [x] Verify Property-Based Testing compliance summary.
- [x] Verify content validation before artifact creation.
- [x] Present the standardized NFR Design completion message.

## Required NFR Design Artifacts

After this plan is answered and validated, generate:

- `nfr-design-patterns.md`: Resolution, effective-date, activation, transaction, validation, authorization, audit, logging, observability, frontend, and PBT patterns.
- `logical-components.md`: Logical components, responsibilities, dependencies, request flows, data responsibilities, and NFR responsibility mapping.

## NFR Design Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

### Question 1
What fail-closed resolution pattern should UOW-03 use?

A) Pure resolution services that query active approved versions by configuration identity, scope, rule type, and effective date; return typed success snapshots or reason-coded missing/ambiguous/draft-only failures with no side effects (recommended)
B) Resolution services may fall back to newest draft or nearest historical configuration when active config is missing
C) Downstream units should query raw tables and implement their own fallback rules
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What effective-date enforcement pattern should UOW-03 use?

A) Shared half-open interval validator plus PostgreSQL-backed non-overlap guard where practical for the same configuration identity, scope, and rule type; distinct identities may overlap (recommended)
B) Service-only validation without persistence-level conflict guard
C) UI-only validation because configuration writes are low frequency
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
What activation and approval transaction pattern should UOW-03 use?

A) Transactional activation command that verifies Treasurer approval where required, supersedes or closes affected prior versions, creates the new immutable active version, and writes audit in one transaction where practical (recommended)
B) Activate first, then asynchronously attach approval and audit references
C) Allow staff activation without approval when they have administrator privileges
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
What concurrency pattern should protect UOW-03 activation?

A) Lock or conflict-check the affected configuration identity/scope/rule-type version set during activation, reject races with stable conflict errors, and keep draft preview separate from active resolution (recommended)
B) Last writer wins because configuration changes are rare
C) Rely only on frontend refresh before submit
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
What resolution snapshot contract pattern should UOW-03 expose?

A) Typed DTOs that include rule payload, version ID, effective interval, approval reference where applicable, source rule metadata, and correlation/context metadata needed by downstream snapshotting (recommended)
B) Return raw database rows so downstream units can choose fields
C) Return only display labels and current values
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
What decimal and rounding design pattern should UOW-03 use?

A) Central decimal-safe value objects/helpers for validation and metadata resolution, preserving 4-place area/rate, 2-place money, and half-up rounding metadata while avoiding JavaScript floating-point behavior (recommended)
B) Use JavaScript numbers internally and format values at API boundaries
C) Store all decimal fields as unvalidated strings and let UOW-04 interpret them
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
What security and authorization pattern should UOW-03 use?

A) UOW-01 actor context, backend route guards, object/scope policies, Treasurer approval checks, safe authorization denials, and audit/security events for denied or risky configuration operations (recommended)
B) Frontend role hiding plus API authentication is sufficient
C) Any authenticated staff user can edit and activate all configuration
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
What observability and sensitive logging pattern should UOW-03 use?

A) Structured events/metrics for failed/missing/ambiguous resolution, denied access, draft submission, approval activation, immutable violation attempts, and manual tax-like charge config changes, with safe identifiers and redacted sensitive payloads (recommended)
B) Full before/after payload logging for every configuration operation
C) Generic HTTP request logs only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
What frontend NFR pattern should UOW-03 use?

A) Server-authorized data loading, accessible forms/tables, keyboard-safe approval/version workflows, stable `data-testid` values, safe validation summaries, resolution preview, and no JSON-only editor for normal staff workflows (recommended)
B) Basic forms with accessibility deferred to later portal units
C) JSON editor for all configuration because it is faster to implement
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
What PBT design pattern should UOW-03 use?

A) Centralized `fast-check` domain generators and state models for effective versions, resolution determinism, due/grace rules, decimal/rounding metadata, manual tax-like charge eligibility, numbering resolution, and immutable version transitions (recommended)
B) Ad hoc primitive generators in each test file
C) PBT only for rounding because configuration is staff managed
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 11
What logical component decomposition should UOW-03 use?

A) Separate logical components for ConfigurationDraft, ApprovalActivation, VersionTimeline, ResolutionService, DecimalPolicy, ChargeTypeCatalog, NumberingTemplatePaymentCatalog, AuthorizationPolicy, AuditAdapter, ObservabilityAdapter, FrontendInteraction, and PBTGenerators (recommended)
B) One large BillingConfiguration service containing all behavior
C) Defer logical component decomposition to Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 12
What downstream batch-use pattern should UOW-03 design for?

A) Downstream units resolve once per identical context where practical, snapshot returned DTO metadata on their own source records, and never mutate UOW-03 versions or rely on mutable current config after source-record creation (recommended)
B) Downstream units should resolve fresh for every invoice line/payment/penalty/report row even when context is identical
C) UOW-03 should create and persist downstream source records so later units do less work
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Post-Answer Processing

After all `[Answer]:` tags are complete:

- Answers will be checked for blanks, invalid choices, contradictions, and vague wording.
- Follow-up questions will be added if any answer is ambiguous.
- If answers are clear, NFR Design artifacts will be generated directly from this plan and approved source context.

## Answer Validation Summary

Validated at `2026-05-09T13:55:57Z`.

- Completion: all 12 `[Answer]:` tags are populated.
- Validity: all answers use valid option A choices.
- Ambiguity: none detected.
- Contradictions: none detected.
- Security Baseline: compliant at NFR Design level.
- Property-Based Testing: compliant; `fast-check` design carries forward UOW-03 PBT properties, domain generators, state models, shrinking, and seed reproducibility.
- Result: NFR Design artifacts generated.

## Generated Artifacts

- `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/nfr-design/nfr-design-patterns.md`
- `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/nfr-design/logical-components.md`

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Selected answers require backend authorization, approval checks, safe denials, audit, redacted logs, safe errors, and no client-side security reliance. |
| Property-Based Testing | Compliant | Selected answers carry forward `fast-check`, domain generators, stateful models, immutable transitions, shrinking, and seed reproducibility expectations from Functional Design and NFR Requirements. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
