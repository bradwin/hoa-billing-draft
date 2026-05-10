# UOW-05 Infrastructure Design Plan

## Unit

- **Unit ID**: UOW-05
- **Unit Name**: Payments, Allocations, Credits, Receipts, and Financial Corrections
- **Stage**: Infrastructure Design, Planning
- **Current Gate**: Waiting for Infrastructure Design approval

## Purpose

Map approved UOW-05 Functional Design, NFR Requirements, and NFR Design decisions onto the existing shared infrastructure baseline. UOW-05 owns payment proof metadata, posted payments, allocations, credits, receipts, receipt numbers, reversals, corrections, balance-impact facts, and support intents. This planning stage decides how those responsibilities use the existing Docker Compose, PostgreSQL, logging, monitoring, backup, and deployment controls without adding infrastructure that the unit does not need.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/functional-design/` | Approved UOW-05 domain behavior, business rules, entities, frontend components, validation semantics, and boundaries. |
| `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/nfr-requirements/` | Approved performance, security, durability, observability, accessibility, and PBT requirements. |
| `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/nfr-design/` | Approved logical components and non-functional design patterns. |
| `aidlc-docs/construction/uow-01-platform-foundation/infrastructure-design/` | Existing approved shared infrastructure baseline. |
| `aidlc-docs/construction/shared-infrastructure.md` | Cross-unit deployment boundary and rules for shared infrastructure. |

## Infrastructure Design Scope

### In Scope

- Reuse or refinement of the shared UOW-01 deployment baseline for UOW-05.
- PostgreSQL infrastructure mapping for payment proof, payment, allocation, credit, receipt, reversal, correction, balance-impact, support-intent, and audit-reference tables.
- PostgreSQL transactions, constraints, indexes, and lock-support structures for duplicate payment risk, over-allocation prevention, credit application, reversal uniqueness, and receipt numbering.
- Backup and restore coverage for UOW-05 financial source records, snapshots, support intents, approval references, and audit references.
- Logging, monitoring, dashboards, and alerts for proof lifecycle, posting, allocation, duplicate review, credits, receipt numbering, reversals, corrections, denied access, and support intents.
- Network exposure confirmation for UOW-05 API and web routes through the existing reverse proxy.
- Secrets and configuration needs specific to UOW-05, if any.
- Shared infrastructure document updates if UOW-05 materially refines the shared baseline.

### Out of Scope

- Application code, database migrations, DTOs, tests, and API handlers. These belong to Code Generation.
- New deployable services unless explicitly approved in this plan.
- Invoice creation, penalty creation, statements, reports, exports, PDF rendering, SMTP delivery, file storage, retry workers, and import processing.
- Concrete operations runbooks beyond design-level infrastructure requirements for this unit.

## Infrastructure Design Checklist

- [x] Read UOW-05 Functional Design artifacts.
- [x] Read UOW-05 NFR Requirements artifacts.
- [x] Read UOW-05 NFR Design artifacts.
- [x] Read Infrastructure Design rule details.
- [x] Review UOW-01 infrastructure and shared infrastructure baselines.
- [x] Confirm Security Baseline and Property-Based Testing extensions are enabled.
- [x] Identify UOW-05 infrastructure mapping decisions and risks.
- [x] Create this Infrastructure Design plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory.
- [x] Generate `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/infrastructure-design/infrastructure-design.md`.
- [x] Generate `aidlc-docs/construction/uow-05-payments-allocations-credits-receipts-corrections/infrastructure-design/deployment-architecture.md`.
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
What deployment model should UOW-05 use?

A) Reuse the UOW-01 shared single-host Docker Compose deployment with no new UOW-05 deployable services (recommended)
B) Add a separate UOW-05 payment API service boundary
C) Defer deployment mapping to Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
How should UOW-05 database changes be deployed?

A) Apply payment proof, payment, allocation, credit, receipt, reversal, correction, balance-impact, support-intent, index, constraint, lock-support, approval-reference, and audit-reference structures through the existing PostgreSQL migration path, with staging migration rehearsal and rollback planning before production (recommended)
B) Allow runtime table creation during first payment posting
C) Defer database infrastructure planning to Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
What infrastructure should protect duplicate payment review, allocation, credits, reversals, and receipt numbering?

A) Use PostgreSQL transactions, unique constraints/indexes, and row-level or advisory locking for duplicate-risk lookups, allocation targets, credit applications, reversal uniqueness, and receipt numbering scopes; no distributed lock service (recommended)
B) Add a distributed lock service now
C) Rely on frontend sequencing and staff procedures
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
What posting infrastructure should UOW-05 use?

A) Synchronous API/database workflow in existing API container for first-scope payment posting, with per-payment transactional commits and per-payment batch results; no new queue/worker for UOW-05 posting (recommended)
B) Add a queue and worker for payment posting now
C) Run posting logic from the browser
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
How should UOW-05 data be covered by backup and restore?

A) Include payment proofs, payments, allocations, credits, credit applications, receipts, receipt snapshots, reversals, corrections, balance-impact facts, support intents, approval references, and audit references in the existing encrypted PostgreSQL backup and staging restore rehearsal; no UOW-05 file storage (recommended)
B) Create a separate UOW-05 backup process
C) Defer payment backup coverage until UOW-07 reporting exists
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
What logging and monitoring infrastructure should UOW-05 use?

A) Use existing structured logs, Loki-equivalent storage, Prometheus/Grafana-equivalent metrics, and dashboards with UOW-05-specific proof lifecycle, duplicate review, posting, allocation, credit, receipt numbering, reversal, correction, authorization, and support-intent categories (recommended)
B) Add a separate observability stack for UOW-05
C) Keep only generic API health metrics for UOW-05
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
Which UOW-05 alerts should be required?

A) Add alert coverage for repeated authorization denials, proof submission failures, duplicate override spikes, posting failure spikes, allocation conflict spikes, credit application failures, receipt numbering conflicts, reversal/correction failure spikes, support-intent failure spikes, database health, backup failure, and restore verification failure (recommended)
B) Alert only on service downtime
C) Defer UOW-05 alerts until production incidents occur
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
How should UOW-05 routes be exposed?

A) Serve UOW-05 frontend and API routes through existing web/API containers and Caddy reverse proxy, with no new public ports and no direct PostgreSQL exposure (recommended)
B) Expose UOW-05 API on a separate public port
C) Allow direct database access for payment staff tools
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
What secrets or configuration changes should UOW-05 introduce?

A) Use the existing typed configuration and secrets pattern; add only non-secret UOW-05 thresholds or flags such as posting batch size, duplicate review window, and timeout unless a later implementation proves a secret is required (recommended)
B) Add UOW-05-specific secret files now
C) Store UOW-05 configuration in committed environment files
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
How should proof attachment and receipt document/email support intents map to infrastructure?

A) Persist UOW-05 support intents and attachment references in PostgreSQL through existing UOW-01 support contracts; do not add file storage, PDF rendering, SMTP, retry workers, or queues in UOW-05 (recommended)
B) Add proof file storage, receipt PDF rendering, and SMTP infrastructure to UOW-05 now
C) Do not persist support intents until UOW-08
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 11
Should shared infrastructure documentation be updated for UOW-05?

A) Yes, update shared infrastructure only to note UOW-05's use of the shared stack, PostgreSQL payment data coverage, locking/constraint reliance, monitoring/alert additions, backup/restore coverage, and support-intent boundaries; do not add new services (recommended)
B) No, keep shared infrastructure unchanged even if UOW-05 adds monitoring and alert requirements
C) Replace the shared infrastructure baseline with a UOW-05-specific baseline
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
| Security Baseline | Compliant for Infrastructure Design | Infrastructure artifacts require private route exposure, no direct database access, database constraints/locking, safe monitoring, alerts, backups, restore, secrets discipline, and support-service boundaries. |
| Property-Based Testing | N/A for Infrastructure Design | This stage does not create test code or PBT models. PBT design requirements remain carried by UOW-05 NFR Design and Code Generation. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
- All answers are valid `A` choices.
- No contradictory or ambiguous answers were detected.
- No follow-up questions are required.
