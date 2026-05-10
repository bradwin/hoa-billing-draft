# UOW-03 NFR Requirements Plan

## Unit

- **Unit ID**: UOW-03
- **Unit Name**: Billing Configuration and Charge Rules
- **Stage**: NFR Requirements, Planning
- **Current Gate**: Waiting for answers in this file

## Purpose

Define the non-functional requirements and technology stack decisions for UOW-03 before NFR Design, Infrastructure Design, and Code Generation. UOW-03 is a financially sensitive configuration unit: later invoice, payment, penalty, statement, reporting, notification, document, and portal units depend on its effective-dated resolution results. Ambiguity in performance, auditability, authorization, precision, and testability is dangerous and must be resolved before implementation.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/functional-design/business-logic-model.md` | Approved UOW-03 flows, boundaries, resolution services, and PBT candidates. |
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/functional-design/business-rules.md` | Approved UOW-03 business rules and financial boundaries. |
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/functional-design/domain-entities.md` | UOW-03 draft/version/configuration entities and resolution snapshots. |
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/functional-design/frontend-components.md` | UOW-03 protected staff frontend scope and stable test IDs. |
| `aidlc-docs/construction/uow-01-platform-foundation/` | Existing audit, authorization, approval, safe-error, logging, and shared kernel foundations. |
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/` | Existing effective-date and validation patterns consumed by later billing. |

## NFR Assessment Scope

### In Scope

- Performance targets for configuration list, draft, activation, and resolution paths.
- Scalability assumptions for first HOA scope and later unit consumption.
- Availability and reliability expectations for configuration resolution.
- Security and authorization requirements for financial-impacting configuration.
- Audit, approval, and immutability requirements.
- Decimal precision and deterministic calculation support requirements.
- Maintainability and tech stack decisions for schema validation, persistence, and PBT.
- Accessibility and usability requirements for staff configuration screens.
- Observability expectations for failed resolutions, denied access, and risky configuration changes.

### Out of Scope

- Infrastructure topology changes. These belong to Infrastructure Design.
- NFR design patterns. These belong to NFR Design.
- Application code, tests, migrations, and API handlers. These belong to Code Generation.
- Invoice, payment, penalty, report, document, email, job, and import execution.

## NFR Requirements Checklist

- [x] Read UOW-03 Functional Design artifacts.
- [x] Read NFR Requirements rule details.
- [x] Confirm Security Baseline and Property-Based Testing extensions remain enabled.
- [x] Identify UOW-03 NFR risks and stack decisions.
- [x] Create this NFR Requirements plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory.
- [x] Generate `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/nfr-requirements/nfr-requirements.md`.
- [x] Generate `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/nfr-requirements/tech-stack-decisions.md`.
- [x] Verify Security Baseline compliance summary.
- [x] Verify Property-Based Testing compliance summary.
- [x] Verify content validation before artifact creation.
- [x] Present the standardized NFR Requirements completion message.

## Required NFR Requirements Artifacts

After this plan is answered and validated, generate:

- `nfr-requirements.md`
- `tech-stack-decisions.md`

## NFR Requirements Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

### Question 1
What first-scope load assumption should UOW-03 use for staff configuration management?

A) Same first-scope HOA target as prior units: up to 25 operational users, low-frequency configuration writes, and later units reading configuration resolution during batch operations (recommended)
B) Design for high-frequency public configuration writes
C) Defer load assumptions until Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What performance target should apply to UOW-03 configuration resolution?

A) Single-context resolution p95 under 100 ms from indexed PostgreSQL data in normal conditions; batch consumers may cache a resolved snapshot within a transaction or batch run (recommended)
B) No explicit target because configuration data is small
C) Resolution may be asynchronous and delayed
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
What performance target should apply to staff configuration list/detail screens?

A) Protected list/detail queries p95 under 500 ms for first-scope data, with pagination for history and drafts (recommended)
B) No target until there are many years of history
C) Load all configuration history into the browser
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
How should UOW-03 handle availability when required configuration is missing or ambiguous?

A) Fail closed with safe reason-coded errors and block downstream financial generation until configuration is corrected (recommended)
B) Use the newest draft configuration as fallback
C) Guess from the nearest prior configuration silently
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
What durability requirement should apply to activated configuration and audit records?

A) Activated configuration, approval references, and audit records must be transactionally coupled where practical and included in existing encrypted PostgreSQL backup/restore controls (recommended)
B) Audit may be written later from logs
C) Keep only current config and skip historical restore checks
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
What security model should UOW-03 use for configuration changes?

A) Backend route, role, object/scope authorization, Treasurer approval for financial-impacting activation, safe errors, and denial audit/security events through UOW-01 contracts (recommended)
B) Frontend role hiding is sufficient
C) Any authenticated staff user can activate configuration
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
How should sensitive financial configuration values be logged?

A) Structured logs may include correlation ID, rule type, version ID, action, and result, but must not log full payloads containing bank/payment instructions or sensitive operational details (recommended)
B) Log full before/after payloads for easier debugging
C) Do not log configuration operations at all
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
What precision and arithmetic implementation requirement should UOW-03 carry forward?

A) Use decimal-safe validation and arithmetic helpers; never use JavaScript floating point for financial decimal behavior; preserve 4-place area/rate and 2-place money rules (recommended)
B) Use JavaScript number and rely on formatting
C) Store numeric configuration as unvalidated strings
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
What database/query approach should UOW-03 use?

A) PostgreSQL with indexed effective-date lookups by configuration identity, scope, rule type, and status; no external cache or search service for UOW-03 (recommended)
B) Add Redis for active configuration immediately
C) Store configuration only in JSON settings rows with no typed indexes
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
What validation stack should UOW-03 use?

A) Shared TypeScript domain validators plus Zod request schemas, aligned with existing shared-kernel patterns (recommended)
B) Controller-only validation without shared domain helpers
C) Database constraints only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 11
What PBT requirement should UOW-03 implement later?

A) `fast-check` PBT for effective-date non-overlap, rate resolution determinism, due/grace date calculation, half-up rounding, manual charge validation, numbering resolution, and immutable version state transitions (recommended)
B) PBT only for rounding
C) No PBT because configuration is staff-managed
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 12
What accessibility/usability requirement should apply to UOW-03 frontend screens?

A) WCAG 2.2 AA-oriented forms/tables, keyboard-accessible approval/version workflows, clear safe validation summaries, stable `data-testid` values, and no JSON-only editor for normal staff workflows (recommended)
B) Accessibility deferred until later portal work
C) JSON editor is sufficient for MVP
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 13
What observability signals should UOW-03 produce?

A) Metrics/log events for failed resolution, ambiguous config, missing config, denied access, draft submission, approval activation, immutable-version violation attempts, and manual tax-like charge configuration changes (recommended)
B) Only generic API request metrics
C) No UOW-03-specific observability
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 14
What maintainability requirement should UOW-03 apply to downstream contracts?

A) Expose typed resolution DTOs/snapshots with version IDs and metadata so UOW-04 through UOW-08 can snapshot exact configuration without reading raw tables directly (recommended)
B) Let downstream units query raw configuration tables
C) Let each downstream unit reimplement config lookup
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 15
What tech stack posture should UOW-03 use?

A) Continue the existing TypeScript/NestJS/Next.js/Prisma/PostgreSQL/fast-check stack with no new dependency family unless NFR Design proves a hard need (recommended)
B) Add a rule-engine dependency now
C) Add a workflow engine for configuration activation now
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Post-Answer Processing

After all `[Answer]:` tags are complete:

- Answers will be checked for blanks, invalid choices, contradictions, and vague wording.
- Follow-up questions will be added if any answer is ambiguous.
- If answers are clear, NFR Requirements artifacts will be generated directly from this plan and approved source context.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Selected answers require backend authorization, Treasurer approval, audit, safe logs, fail-closed resolution, backups, observability, and no client-side security reliance. |
| Property-Based Testing | Compliant | Selected answers require `fast-check` PBT for effective-date, rate resolution, due/grace date, rounding, manual charge, numbering, and immutable state-transition invariants. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
- All answers are valid `A` choices.
- No contradictory or ambiguous answers were detected.
- No follow-up questions are required.
