# UOW-03 Infrastructure Design Plan

## Unit

- **Unit ID**: UOW-03
- **Unit Name**: Billing Configuration and Charge Rules
- **Stage**: Infrastructure Design, Planning
- **Current Gate**: Waiting for answers in this file

## Purpose

Map approved UOW-03 Functional Design, NFR Requirements, and NFR Design decisions onto the existing shared infrastructure baseline. UOW-03 owns billing configuration versions, charge rule metadata, pure configuration resolution, approval/audit-sensitive activation, and staff configuration screens. This planning stage decides how those responsibilities use the existing Docker Compose, PostgreSQL, logging, monitoring, backup, and deployment controls without adding infrastructure that the unit does not need.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/functional-design/` | Approved UOW-03 domain behavior, business rules, entities, frontend components, validation semantics, and boundaries. |
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/nfr-requirements/` | Approved performance, security, durability, observability, accessibility, and PBT requirements. |
| `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/nfr-design/` | Approved logical components and non-functional design patterns for fail-closed resolution, activation, version timelines, audit, observability, and PBT. |
| `aidlc-docs/construction/uow-01-platform-foundation/infrastructure-design/` | Existing approved shared infrastructure baseline: single-host Docker Compose, PostgreSQL, Caddy, logs, monitoring, alerts, secrets, and backups. |
| `aidlc-docs/construction/shared-infrastructure.md` | Cross-unit deployment boundary and rules for later units using shared infrastructure. |

## Infrastructure Design Scope

### In Scope

- Reuse or refinement of the shared UOW-01 deployment baseline for UOW-03.
- PostgreSQL infrastructure mapping for UOW-03 configuration tables, indexes, constraints, immutable version history, approval references, and resolution lookup paths.
- Backup and restore coverage for UOW-03 configuration, version, approval-reference, audit, and read-model data.
- Logging, monitoring, dashboard, and alert requirements for missing/ambiguous resolution, denied access, draft submission, approval activation, immutable violation attempts, and manual tax-like charge configuration changes.
- Network exposure confirmation for UOW-03 API and web routes through the existing reverse proxy.
- Secrets and configuration needs specific to UOW-03, if any.
- Shared infrastructure document updates if UOW-03 materially refines the shared baseline.

### Out of Scope

- Application code, database migrations, DTOs, tests, and API handlers. These belong to Code Generation.
- New deployable services unless explicitly approved in this plan.
- Invoices, invoice lines, balances, payments, penalties, credits, adjustments, statements, reports, documents, emails, support jobs, or import batches.
- Penalty application, penalty records, penalty waivers, delinquency classification, or invoice amount calculation.
- Concrete operations runbooks beyond design-level infrastructure requirements for this unit.

## Infrastructure Design Checklist

- [x] Read UOW-03 Functional Design artifacts.
- [x] Read UOW-03 NFR Requirements artifacts.
- [x] Read UOW-03 NFR Design artifacts.
- [x] Read Infrastructure Design rule details.
- [x] Review UOW-01 infrastructure and shared infrastructure baselines.
- [x] Confirm Security Baseline and Property-Based Testing extensions are enabled.
- [x] Identify UOW-03 infrastructure mapping decisions and risks.
- [x] Create this Infrastructure Design plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory.
- [x] Generate `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/infrastructure-design/infrastructure-design.md`.
- [x] Generate `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/infrastructure-design/deployment-architecture.md`.
- [x] Update `aidlc-docs/construction/shared-infrastructure.md` if approved answers require a shared baseline refinement.
- [x] Verify Security Baseline compliance summary.
- [x] Verify Property-Based Testing infrastructure relevance is marked correctly.
- [x] Verify content validation before artifact creation.
- [x] Present the standardized Infrastructure Design completion message.

## Required Infrastructure Design Artifacts

After this plan is answered and validated, generate:

- `infrastructure-design.md`: UOW-03 infrastructure mapping, storage, database, network, monitoring, alerting, backup, restore, security, and production readiness requirements.
- `deployment-architecture.md`: How UOW-03 is deployed through the existing web/API/worker/PostgreSQL/logging/monitoring stack.

If approved answers require a shared baseline refinement, update:

- `aidlc-docs/construction/shared-infrastructure.md`

## Infrastructure Design Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

### Question 1
What deployment model should UOW-03 use?

A) Reuse the UOW-01 shared single-host Docker Compose deployment with no new UOW-03 deployable services (recommended)
B) Add a separate UOW-03 configuration API service boundary
C) Defer deployment mapping to Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
How should UOW-03 database changes be deployed?

A) Apply UOW-03 tables, indexes, constraints, grants, and immutable version/audit support through the existing PostgreSQL migration path, with staging migration rehearsal and rollback planning before production (recommended)
B) Allow runtime table creation during first configuration setup
C) Defer database infrastructure planning to Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
What resolution lookup infrastructure should UOW-03 use?

A) Use PostgreSQL indexed effective-date lookups by configuration identity, scope, rule type, status, and effective interval; no external cache, search service, or rule engine for UOW-03 (recommended)
B) Add Redis for active configuration immediately
C) Add a rule-engine service for all configuration resolution
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
What concurrency infrastructure should protect activation and version timelines?

A) Use existing PostgreSQL transactions, row-level locking or equivalent conflict detection, and persistence-level non-overlap guards where practical; no distributed lock service (recommended)
B) Add a distributed lock or queue service now
C) Rely on UI sequencing only because configuration writes are low frequency
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
How should UOW-03 data be covered by backup and restore?

A) Include all UOW-03 configuration, version, approval-reference, audit, and read-model data in the existing encrypted PostgreSQL backup and staging restore rehearsal; no separate file storage for UOW-03 (recommended)
B) Create a UOW-03-specific backup process separate from the shared database backup
C) Defer backup coverage until invoices are generated by UOW-04
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
What logging and monitoring infrastructure should UOW-03 use?

A) Use existing structured logs, Loki-equivalent storage, Prometheus/Grafana-equivalent metrics, and dashboards with UOW-03-specific categories and metrics (recommended)
B) Add a separate observability stack for UOW-03
C) Keep only generic API health metrics for UOW-03
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
Which UOW-03 alerts should be required?

A) Add alert coverage for repeated authorization denials, missing/ambiguous resolution spikes, activation conflict spikes, immutable violation attempts, failed approval activation, risky manual tax-like charge config changes, database health, backup failure, and restore verification failure (recommended)
B) Alert only on service downtime
C) Defer UOW-03 alerts until production incidents occur
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
How should UOW-03 routes be exposed?

A) Serve UOW-03 frontend and API routes through the existing web/API containers and Caddy reverse proxy, with no new public ports and no direct PostgreSQL exposure (recommended)
B) Expose UOW-03 API on a separate public port
C) Allow direct database access for configuration staff tools
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
What secrets or configuration changes should UOW-03 introduce?

A) Use the existing typed configuration and secrets pattern; add only non-secret UOW-03 thresholds or flags unless a later implementation proves a secret is required (recommended)
B) Add UOW-03-specific secret files now
C) Store UOW-03 configuration in committed environment files
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
Should UOW-03 use background jobs or messaging infrastructure?

A) No new queue, worker job, or messaging infrastructure for UOW-03; activation and resolution remain synchronous API/database workflows, while later units own downstream source-record creation and jobs (recommended)
B) Add a queue for configuration activation and downstream invalidation events now
C) Add a background worker to precompute invoice configuration for later units
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 11
Should shared infrastructure documentation be updated for UOW-03?

A) Yes, update the shared infrastructure document only to note UOW-03's use of the shared stack, PostgreSQL/index/audit/version coverage, and UOW-03 monitoring/alert additions; do not add new services (recommended)
B) No, keep shared infrastructure unchanged even if UOW-03 adds monitoring and alert requirements
C) Replace the shared infrastructure baseline with a UOW-03-specific baseline
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Post-Answer Processing

After all `[Answer]:` tags are complete:

- Answers will be checked for blanks, invalid choices, contradictions, and vague wording.
- Follow-up questions will be added if any answer is ambiguous.
- If answers are clear, Infrastructure Design artifacts will be generated directly from this plan and approved source context.

## Answer Validation Summary

Validated at `2026-05-09T14:03:40Z`.

- Completion: all 11 `[Answer]:` tags are populated.
- Validity: all answers use valid option A choices.
- Ambiguity: none detected.
- Contradictions: none detected.
- Security Baseline: compliant at Infrastructure Design level.
- Property-Based Testing: N/A for Infrastructure Design; PBT requirements remain carried by UOW-03 NFR Design and Code Generation.
- Result: Infrastructure Design artifacts generated.

## Generated Artifacts

- `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/infrastructure-design/infrastructure-design.md`
- `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/infrastructure-design/deployment-architecture.md`
- `aidlc-docs/construction/shared-infrastructure.md` updated with UOW-03 infrastructure impact details.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Selected answers require private network exposure, database controls, logs, monitoring, alerting, backups, restore, secrets, route exposure, no direct database access, and shared production readiness controls. |
| Property-Based Testing | N/A for Infrastructure Design | This stage does not create test code or PBT models. PBT design requirements remain carried by UOW-03 NFR Design and Code Generation. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
