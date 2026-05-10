# UOW-06 NFR Design Plan

## Unit

- **Unit ID**: UOW-06
- **Unit Name**: Penalties, Delinquency, Waivers, and Reminders
- **Stage**: NFR Design, Planning
- **Current Gate**: Waiting for NFR Design approval

## Purpose

Translate approved UOW-06 NFR Requirements into concrete non-functional patterns and logical components before Infrastructure Design and Code Generation. UOW-06 creates financially material penalty, waiver, aging, delinquency, reminder, and balance-impact facts, so the design must make date determinism, transaction boundaries, duplicate prevention, waiver idempotency, reminder suppression, fail-closed validation, authorization, audit, observability, support-intent isolation, and PBT explicit.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/nfr-requirements/nfr-requirements.md` | Approved UOW-06 NFR requirements. |
| `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/nfr-requirements/tech-stack-decisions.md` | Approved UOW-06 stack decisions. |
| `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/functional-design/` | UOW-06 business logic, rules, entities, and frontend components. |
| `aidlc-docs/construction/uow-01-platform-foundation/` | Foundation patterns for auth, authorization, approval, audit, safe errors, support intents, logging, validation, and testing. |
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/` | Grace-period, penalty charge, rounding, charge type, and suppression configuration primitives. |
| `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/` | Issued invoice records, due dates, invoice status, and invoice/open-amount facts. |
| `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/` | Payment, allocation, credit, reversal, correction, and balance-impact facts. |

## NFR Design Scope

### In Scope

- Date control and HOA business-calendar normalization patterns.
- Overdue and aging query and classification patterns.
- Penalty candidate generation, reviewed run, and application transaction patterns.
- PostgreSQL-backed duplicate penalty, waiver idempotency, reminder duplicate suppression, and reissue safety patterns.
- Fail-closed validation and safe error patterns for UOW-03, UOW-04, and UOW-05 source facts.
- Decimal-safe amount policy and deterministic penalty/waiver/balance-impact calculation patterns.
- Backend authorization, object/scope authorization, approval, PII minimization, and audit/security event patterns.
- Durable reminder intent patterns without concrete rendering, storage, SMTP, or retry ownership.
- Structured logging, metrics/event, redaction, and observability patterns.
- Staff and homeowner-safe frontend accessibility and workflow patterns.
- PBT generator, state model, seed replay, shrinking, and regression-capture patterns.
- Logical components needed to implement the above.

### Out of Scope

- Concrete database migrations, code, DTO implementations, generated tests, and API handlers. These belong to Code Generation.
- Concrete infrastructure resource definitions, TLS, backup commands, network policy, and deployment topology. These belong to Infrastructure Design.
- Invoice creation, payment posting, receipt creation, statement/report/export generation, PDF rendering, SMTP delivery, file storage, retry jobs, and import processing.

## NFR Design Checklist

- [x] Read UOW-06 NFR Requirements artifacts.
- [x] Read UOW-06 Functional Design artifacts.
- [x] Read NFR Design rule details.
- [x] Confirm Security Baseline and Property-Based Testing extensions are enabled.
- [x] Identify UOW-06 NFR design patterns and logical component decisions.
- [x] Create this NFR Design plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory.
- [x] Generate `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/nfr-design/nfr-design-patterns.md`.
- [x] Generate `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/nfr-design/logical-components.md`.
- [x] Verify Security Baseline compliance summary.
- [x] Verify Property-Based Testing compliance summary.
- [x] Verify content validation before artifact creation.
- [x] Present the standardized NFR Design completion message.

## Required NFR Design Artifacts

After this plan is answered and validated, generate:

- `nfr-design-patterns.md`: Date control, overdue/aging, penalty run, duplicate prevention, waiver idempotency, reminder suppression, fail-closed validation, precision, authorization, audit, support-intent, observability, frontend, and PBT patterns.
- `logical-components.md`: Logical components, responsibilities, dependencies, request flows, data responsibilities, and NFR responsibility mapping.

## NFR Design Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

### Question 1
What date-control pattern should UOW-06 use?

A) Central DateControlPolicy that requires explicit `evaluationDate` or waiver effective date, normalizes using HOA business timezone, computes first overdue date and aging day count, and rejects server-clock financial decisions (recommended)
B) Let each service compute dates independently
C) Use server time as the default financial decision date
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What overdue and aging query pattern should UOW-06 use?

A) Server-side paginated query model that resolves source facts, indexed evaluation fields, first overdue date, aging day count, bucket key, and delinquent amount, with no full-table browser loads (recommended)
B) Load invoice and payment data into the browser and calculate aging there
C) Persist one mutable delinquency flag and skip derived source-fact evaluation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
What penalty candidate generation pattern should UOW-06 use?

A) Reviewed PenaltyRun pattern that generates deterministic candidates from source facts, snapshots rule references and basis details, records per-candidate success/error detail, and supports background-capable execution without applying financial records until approved action (recommended)
B) Apply penalties immediately as candidates are discovered
C) Generate candidates only in the frontend
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
What penalty application transaction pattern should UOW-06 use?

A) Per-penalty transaction that revalidates eligibility, duplicate-blocking statuses, rule references, basis amount, balance-impact facts, and audit before commit; batch apply returns per-candidate results (recommended)
B) One all-or-nothing transaction for every candidate in a monthly run
C) Split penalty source record, balance impact, and audit into independent commits
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
What duplicate penalty guard pattern should UOW-06 use?

A) Service guard plus database-backed partial unique/indexed constraint over invoice, billing account, penalty charge type, penalty period, and duplicate-blocking statuses `Draft`, `Applied`, and `Reissued`; `Voided` remains historical only (recommended)
B) Service-only duplicate search without persistence support
C) No duplicate guard because reissue can fix any duplicate
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
What waiver idempotency pattern should UOW-06 use?

A) Approval-backed waiver command with stable idempotency key from approval request and target penalty source record, unique persistence constraint, existing-result replay, and no duplicate waiver balance-impact facts (recommended)
B) Retry waiver approval until it succeeds and clean duplicates manually
C) Directly update the penalty source record with waived amount
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
What reminder suppression and intent pattern should UOW-06 use?

A) ReminderEligibility service that evaluates configured suppression rules where available, applies MVP duplicate-period and missing-contact defaults, persists eligibility snapshot and reminder intent through UOW-01 support contracts, and never sends email directly (recommended)
B) Send reminder emails directly from UOW-06 after eligibility
C) Defer reminder intent persistence to UOW-08
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
What fail-closed validation pattern should UOW-06 use?

A) Validation gateway that resolves UOW-03 configuration primitives, UOW-04 invoice facts, and UOW-05 balance-impact facts, returning typed success or safe failure codes that block financial mutations on unresolved facts (recommended)
B) Best-effort validation that fills missing facts from recent records
C) Staff override directly in penalty forms
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
What decimal and amount pattern should UOW-06 use?

A) Central penalty calculation policy using shared decimal-safe helpers, integer minor units or validated decimals, and deterministic penalty, waiver, delinquency, and balance-impact calculations (recommended)
B) JavaScript floating point internally with formatting at the UI
C) Store all amounts as text and avoid calculation helpers
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
What security and authorization pattern should UOW-06 use?

A) UOW-01 actor context, backend route guards, object/scope policies for penalty/waiver/delinquency/reminder access, Treasurer approval checks, safe denials, PII minimization, and audit/security events (recommended)
B) Frontend route protection plus authenticated API calls
C) Broad staff access to all penalty and delinquency reads and mutations
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 11
What observability and logging pattern should UOW-06 use?

A) Structured metrics/events for overdue evaluation, aging classification, penalty candidate generation, applied/voided/reissued penalties, duplicate blocks, waiver lifecycle and idempotent replay, reminder eligibility/suppression/intents, denied access, and support intents with redacted PII/payloads (recommended)
B) Full homeowner, delinquency, and reminder payload logs for debugging
C) Generic HTTP logs only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 12
What frontend NFR pattern should UOW-06 use?

A) Server-authorized data loading, paginated tables, keyboard-accessible overdue/aging/penalty/waiver/reminder flows, safe validation summaries, stable `data-testid` values, and clear separation of penalty, waiver, aging, delinquency, and reminder states (recommended)
B) Single JSON editor for penalty records
C) Accessibility deferred to UOW-08 portal integration
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 13
What PBT design pattern should UOW-06 use?

A) Centralized `fast-check` generators and state models for evaluation dates, aging buckets, penalty basis, duplicate keys, waiver commands, reminder scopes, and balance-impact facts with seed replay and shrinking capture (recommended)
B) Ad hoc primitive generators in individual tests only
C) PBT only for aging buckets
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 14
What logical component decomposition should UOW-06 use?

A) Separate logical components for DateControlPolicy, OverdueEvaluationService, AgingClassifier, PenaltyRuleResolver, PenaltyRunCoordinator, DuplicatePenaltyGuard, PenaltyApplicationCoordinator, WaiverCoordinator, ReminderEligibilityService, ReminderIntentAdapter, ValidationGateway, AmountCalculationPolicy, BalanceImpactPublisher, AuthorizationPolicy, AuditAdapter, ObservabilityAdapter, FrontendInteraction, and PBTGenerators (recommended)
B) One large PenaltyService containing all behavior
C) Defer decomposition to Code Generation
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
| Security Baseline | Compliant for planning | Plan includes backend authorization, object/scope policies, Treasurer approval checks, safe denials, PII minimization, audit/security events, safe logging, and support-intent boundaries. |
| Property-Based Testing | Compliant for planning | Plan includes `fast-check` generators and state models for date boundaries, aging buckets, duplicate penalties, non-compounding basis, waiver idempotency, reminder suppression, and balance-impact facts. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
