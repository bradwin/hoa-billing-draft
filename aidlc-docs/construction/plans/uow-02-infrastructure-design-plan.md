# UOW-02 Infrastructure Design Plan

## Unit

- **Unit ID**: UOW-02
- **Unit Name**: Homeowner, Property, Ownership, and Contact Requests
- **Stage**: Infrastructure Design, Planning
- **Current Gate**: Waiting for answers in this file

## Purpose

Map approved UOW-02 Functional Design, NFR Requirements, and NFR Design decisions onto the existing shared infrastructure baseline. UOW-02 owns homeowner records, property records, ownership periods, billing-account periods, billable validation facts, contact change requests, authorization rules, audit events, and read models. This planning stage decides how those responsibilities use the existing Docker Compose, PostgreSQL, logging, monitoring, backup, and deployment controls without adding infrastructure that the unit does not need.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/functional-design/` | Approved UOW-02 domain behavior, business rules, entities, frontend components, validation semantics, and authorization boundaries. |
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/nfr-requirements/` | Approved performance, security, privacy, audit, reliability, accessibility, and PBT requirements. |
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/nfr-design/` | Approved logical components and non-functional design patterns for search, concurrency, validation, PII shaping, audit, and testing. |
| `aidlc-docs/construction/uow-01-platform-foundation/infrastructure-design/` | Existing approved shared infrastructure baseline: single-host Docker Compose, PostgreSQL, Caddy, logs, monitoring, alerts, secrets, and backups. |
| `aidlc-docs/construction/shared-infrastructure.md` | Cross-unit deployment boundary and rules for later units using shared infrastructure. |

## Infrastructure Design Scope

### In Scope

- Reuse or refinement of the shared UOW-01 deployment baseline for UOW-02.
- PostgreSQL infrastructure mapping for UOW-02 tables, indexes, constraints, transactional integrity, and migration readiness.
- Backup and restore coverage for UOW-02 master data, audit data, read-model data, and database constraints.
- Logging, monitoring, dashboard, and alert requirements for UOW-02 authorization denials, suspicious search activity, ownership conflicts, contact change activity, and validation failures.
- Network exposure confirmation for UOW-02 API and web routes through the existing reverse proxy.
- Secrets and configuration needs specific to UOW-02, if any.
- Shared infrastructure document updates if UOW-02 materially refines the shared baseline.

### Out of Scope

- Application code, database migrations, DTOs, tests, and API handlers. These belong to Code Generation.
- New deployable services unless explicitly approved in this plan.
- Invoice generation, balances, payments, penalties, credits, adjustments, statements, reports, documents, emails, or import batches.
- Dues calculation or billing proration decisions.
- Concrete operations runbooks beyond the design-level infrastructure requirements for this unit.

## Infrastructure Design Checklist

- [x] Read UOW-02 Functional Design artifacts.
- [x] Read UOW-02 NFR Requirements artifacts.
- [x] Read UOW-02 NFR Design artifacts.
- [x] Read Infrastructure Design rule details.
- [x] Review UOW-01 infrastructure and shared infrastructure baselines.
- [x] Confirm Security Baseline and Property-Based Testing extensions are enabled.
- [x] Identify UOW-02 infrastructure mapping decisions and risks.
- [x] Create this Infrastructure Design plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory.
- [x] Generate `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/infrastructure-design/infrastructure-design.md`.
- [x] Generate `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/infrastructure-design/deployment-architecture.md`.
- [x] Update `aidlc-docs/construction/shared-infrastructure.md` if approved answers require a shared baseline refinement.
- [x] Verify Security Baseline compliance summary.
- [x] Verify PBT infrastructure relevance is marked correctly.
- [x] Verify content validation before artifact creation.
- [x] Present the standardized Infrastructure Design completion message.

## Required Infrastructure Design Artifacts

After this plan is answered and validated, generate:

- `infrastructure-design.md`: UOW-02 infrastructure mapping, storage, database, network, monitoring, alerting, backup, restore, security, and production readiness requirements.
- `deployment-architecture.md`: How UOW-02 is deployed through the existing web/API/worker/PostgreSQL/logging/monitoring stack.

If approved answers require a shared baseline refinement, update:

- `aidlc-docs/construction/shared-infrastructure.md`

## Infrastructure Design Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

### Question 1
What deployment model should UOW-02 use?

A) Reuse the UOW-01 shared single-host Docker Compose deployment with no new UOW-02 deployable services (recommended)
B) Add a separate UOW-02 API or worker service boundary
C) Defer deployment mapping to Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
How should UOW-02 database changes be deployed?

A) Apply UOW-02 tables, indexes, constraints, and grants through the existing PostgreSQL migration path, with staging migration rehearsal and rollback planning before production (recommended)
B) Allow runtime table creation during first use
C) Defer database infrastructure planning to Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
What search infrastructure should UOW-02 use?

A) Use PostgreSQL normalized columns, B-tree indexes, and bounded queries only; no external search service or cache for UOW-02 (recommended)
B) Add an external search service for homeowner/property lookup
C) Add a cache layer for search results before measuring PostgreSQL performance
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
What concurrency infrastructure should support ownership and billing-account periods?

A) Use existing PostgreSQL transactions, row-level locking or equivalent conflict detection, and persistence-level non-overlap guards where practical; no distributed lock service (recommended)
B) Add a distributed lock or queue service now
C) Rely on UI sequencing only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
How should UOW-02 data be covered by backup and restore?

A) Include all UOW-02 tables, indexes, constraints, audit entries, and read-model data in the existing encrypted PostgreSQL backup and staging restore rehearsal; no separate file storage for UOW-02 (recommended)
B) Create a UOW-02-specific backup process separate from the shared database backup
C) Defer backup coverage until billing units create financial records
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
What logging and monitoring infrastructure should UOW-02 use?

A) Use existing structured logs, Loki-equivalent storage, Prometheus/Grafana-equivalent metrics, and dashboards with UOW-02-specific categories and metrics (recommended)
B) Add a separate observability stack for UOW-02
C) Keep only generic API health metrics for UOW-02
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
Which UOW-02 alerts should be required?

A) Add alert coverage for repeated authorization denials, suspicious search patterns, contact-change volume spikes, ownership/billing-account conflict spikes, validation failure spikes, database health, backup failure, and restore verification failure (recommended)
B) Alert only on service downtime
C) Defer UOW-02 alerts until production incidents occur
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
How should UOW-02 routes be exposed?

A) Serve UOW-02 frontend and API routes through the existing web/API containers and Caddy reverse proxy, with no new public ports and no direct PostgreSQL exposure (recommended)
B) Expose UOW-02 API on a separate public port
C) Allow direct database access for staff tools
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
What secrets or configuration changes should UOW-02 introduce?

A) Use the existing typed configuration and secrets pattern; add only non-secret UOW-02 thresholds or flags unless a later implementation proves a secret is required (recommended)
B) Add UOW-02-specific secret files now
C) Store UOW-02 configuration in committed environment files
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
Should shared infrastructure documentation be updated for UOW-02?

A) Yes, update the shared infrastructure document only to note UOW-02's use of the shared stack, PostgreSQL/index/audit/read-model coverage, and UOW-02 monitoring/alert additions; do not add new services (recommended)
B) No, keep shared infrastructure unchanged even if UOW-02 adds monitoring and alert requirements
C) Replace the shared infrastructure baseline with a UOW-02-specific baseline
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Post-Answer Processing

After all `[Answer]:` tags are complete:

- Answers will be checked for blanks, invalid choices, contradictions, and vague wording.
- Follow-up questions will be added if any answer is ambiguous.
- If answers are clear, Infrastructure Design artifacts will be generated directly from this plan and approved source context.

## Answer Validation Summary

Validated at `2026-05-09T12:49:37Z`.

- Completion: all 10 `[Answer]:` tags are populated.
- Validity: all answers use valid option A choices.
- Ambiguity: none detected.
- Contradictions: none detected.
- Security Baseline: compliant at Infrastructure Design level.
- Property-Based Testing: N/A for Infrastructure Design; PBT requirements remain carried by UOW-02 NFR Design and Code Generation.
- Result: Infrastructure Design artifacts generated.

## Generated Artifacts

- `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/infrastructure-design/infrastructure-design.md`
- `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/infrastructure-design/deployment-architecture.md`
- `aidlc-docs/construction/shared-infrastructure.md` updated with UOW-02 infrastructure impact details.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant for planning | Questions cover private network exposure, database controls, logs, monitoring, alerting, backups, restore, secrets, and shared production readiness controls. |
| Property-Based Testing | N/A for Infrastructure Design planning | This stage does not create test code or PBT models. PBT design requirements remain carried by UOW-02 NFR Design and Code Generation. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
