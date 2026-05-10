# UOW-04 Infrastructure Design Plan

## Unit

- **Unit ID**: UOW-04
- **Unit Name**: Invoice Lifecycle and Invoice Source Records
- **Stage**: Infrastructure Design, Planning
- **Current Gate**: Waiting for answers in this file

## Purpose

Map approved UOW-04 Functional Design, NFR Requirements, and NFR Design decisions onto the existing shared infrastructure baseline. UOW-04 owns invoice source records, issued invoice numbers, issued snapshots, invoice open-amount input facts, billing exceptions, lifecycle actions, and durable support intents. This planning stage decides how those responsibilities use the existing Docker Compose, PostgreSQL, logging, monitoring, backup, and deployment controls without adding infrastructure that the unit does not need.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/functional-design/` | Approved UOW-04 domain behavior, business rules, entities, frontend components, validation semantics, and boundaries. |
| `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/nfr-requirements/` | Approved performance, security, durability, observability, accessibility, and PBT requirements. |
| `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/nfr-design/` | Approved logical components and non-functional design patterns. |
| `aidlc-docs/construction/uow-01-platform-foundation/infrastructure-design/` | Existing approved shared infrastructure baseline. |
| `aidlc-docs/construction/shared-infrastructure.md` | Cross-unit deployment boundary and rules for shared infrastructure. |

## Infrastructure Design Scope

### In Scope

- Reuse or refinement of the shared UOW-01 deployment baseline for UOW-04.
- PostgreSQL infrastructure mapping for invoice tables, indexes, uniqueness constraints, lifecycle records, issued snapshots, support intents, and transactional locking.
- Backup and restore coverage for invoice source records, issued snapshots, number assignments, open-amount input facts, lifecycle actions, exceptions, intents, and audit references.
- Logging, monitoring, dashboards, and alerts for generation, exceptions, duplicates, issuance, numbering conflicts, denied access, lifecycle actions, snapshot creation, and support intents.
- Network exposure confirmation for UOW-04 API and web routes through the existing reverse proxy.
- Secrets and configuration needs specific to UOW-04, if any.
- Shared infrastructure document updates if UOW-04 materially refines the shared baseline.

### Out of Scope

- Application code, database migrations, DTOs, tests, and API handlers. These belong to Code Generation.
- New deployable services unless explicitly approved in this plan.
- Payment posting, receipt generation, penalty application, statements, reports, exports, PDF rendering, SMTP delivery, file storage, and import processing.
- Concrete operations runbooks beyond design-level infrastructure requirements for this unit.

## Infrastructure Design Checklist

- [x] Read UOW-04 Functional Design artifacts.
- [x] Read UOW-04 NFR Requirements artifacts.
- [x] Read UOW-04 NFR Design artifacts.
- [x] Read Infrastructure Design rule details.
- [x] Review UOW-01 infrastructure and shared infrastructure baselines.
- [x] Confirm Security Baseline and Property-Based Testing extensions are enabled.
- [x] Identify UOW-04 infrastructure mapping decisions and risks.
- [x] Create this Infrastructure Design plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory.
- [x] Generate `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/infrastructure-design/infrastructure-design.md`.
- [x] Generate `aidlc-docs/construction/uow-04-invoice-lifecycle-source-records/infrastructure-design/deployment-architecture.md`.
- [x] Update `aidlc-docs/construction/shared-infrastructure.md` if approved answers require a shared baseline refinement.
- [x] Verify Security Baseline compliance summary.
- [x] Verify Property-Based Testing infrastructure relevance is marked correctly.
- [x] Verify content validation before artifact creation.
- [x] Present the standardized Infrastructure Design completion message.

## Required Infrastructure Design Artifacts

After this plan is answered and validated, generate:

- `infrastructure-design.md`
- `deployment-architecture.md`

If approved answers require a shared baseline refinement, update:

- `aidlc-docs/construction/shared-infrastructure.md`

## Infrastructure Design Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

### Question 1
What deployment model should UOW-04 use?

A) Reuse the UOW-01 shared single-host Docker Compose deployment with no new UOW-04 deployable services (recommended)
B) Add a separate UOW-04 invoice API service boundary
C) Defer deployment mapping to Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
How should UOW-04 database changes be deployed?

A) Apply invoice tables, indexes, uniqueness constraints, lock-support structures, grants, snapshots, support intents, and audit references through the existing PostgreSQL migration path, with staging migration rehearsal and rollback planning before production (recommended)
B) Allow runtime table creation during first invoice generation
C) Defer database infrastructure planning to Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
What infrastructure should protect duplicate prevention and issued numbering?

A) Use PostgreSQL transactions, unique constraints/indexes, and row-level or advisory locking for invoice duplicate keys and numbering scopes; no distributed lock service (recommended)
B) Add a distributed lock service now
C) Rely on frontend sequencing and staff procedures
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
What recurring generation infrastructure should UOW-04 use?

A) Synchronous API/database workflow in existing API container for first-scope 2,000-candidate batches, with internal chunking where useful and no new queue/worker for UOW-04 generation (recommended)
B) Add a queue and worker for recurring invoice generation now
C) Run recurring generation from the browser
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
How should UOW-04 data be covered by backup and restore?

A) Include invoices, lines, issued snapshots, number assignments, open-amount input facts, exceptions, lifecycle actions, support intents, approval references, and audit references in the existing encrypted PostgreSQL backup and staging restore rehearsal; no UOW-04 file storage (recommended)
B) Create a separate UOW-04 backup process
C) Defer invoice backup coverage until UOW-05 payment posting exists
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
What logging and monitoring infrastructure should UOW-04 use?

A) Use existing structured logs, Loki-equivalent storage, Prometheus/Grafana-equivalent metrics, and dashboards with UOW-04-specific invoice generation, exception, issuance, numbering, authorization, lifecycle, snapshot, and support-intent categories (recommended)
B) Add a separate observability stack for UOW-04
C) Keep only generic API health metrics for UOW-04
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
Which UOW-04 alerts should be required?

A) Add alert coverage for repeated authorization denials, generation failure spikes, exception spikes, duplicate block spikes, numbering conflicts, issuance failure spikes, failed void/reissue approval application, support-intent failure spikes, database health, backup failure, and restore verification failure (recommended)
B) Alert only on service downtime
C) Defer UOW-04 alerts until production incidents occur
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
How should UOW-04 routes be exposed?

A) Serve UOW-04 frontend and API routes through existing web/API containers and Caddy reverse proxy, with no new public ports and no direct PostgreSQL exposure (recommended)
B) Expose UOW-04 API on a separate public port
C) Allow direct database access for invoice staff tools
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
What secrets or configuration changes should UOW-04 introduce?

A) Use the existing typed configuration and secrets pattern; add only non-secret UOW-04 thresholds or flags such as batch size and timeout unless a later implementation proves a secret is required (recommended)
B) Add UOW-04-specific secret files now
C) Store UOW-04 configuration in committed environment files
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
How should document/email support intents map to infrastructure?

A) Persist UOW-04 support intents in PostgreSQL through existing UOW-01 support contracts; do not add PDF rendering, SMTP, storage, retry workers, or queues in UOW-04 (recommended)
B) Add PDF rendering and SMTP infrastructure to UOW-04 now
C) Do not persist support intents until UOW-08
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 11
Should shared infrastructure documentation be updated for UOW-04?

A) Yes, update shared infrastructure only to note UOW-04's use of the shared stack, PostgreSQL invoice data coverage, locking/constraint reliance, monitoring/alert additions, and support-intent boundaries; do not add new services (recommended)
B) No, keep shared infrastructure unchanged even if UOW-04 adds monitoring and alert requirements
C) Replace the shared infrastructure baseline with a UOW-04-specific baseline
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Post-Answer Processing

After all `[Answer]:` tags are complete:

- Answers will be checked for blanks, invalid choices, contradictions, and vague wording.
- Follow-up questions will be added if any answer is ambiguous.
- If answers are clear, Infrastructure Design artifacts will be generated directly from this plan and approved source context.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Selected answers require private route exposure, no direct database access, database constraints/locking, safe monitoring, alerts, backups, restore, secrets discipline, and support-service boundaries. |
| Property-Based Testing | N/A for Infrastructure Design | This stage does not create test code or PBT models. PBT design requirements remain carried by UOW-04 NFR Design and Code Generation. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
- All answers are valid `A` choices.
- No contradictory or ambiguous answers were detected.
- No follow-up questions are required.
