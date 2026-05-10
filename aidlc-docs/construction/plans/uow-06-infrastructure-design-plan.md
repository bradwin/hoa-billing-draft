# UOW-06 Infrastructure Design Plan

## Unit

- **Unit ID**: UOW-06
- **Unit Name**: Penalties, Delinquency, Waivers, and Reminders
- **Stage**: Infrastructure Design, Planning
- **Current Gate**: Waiting for Infrastructure Design planning answers

## Purpose

Map approved UOW-06 Functional Design, NFR Requirements, and NFR Design decisions onto the existing shared infrastructure baseline. UOW-06 owns penalty source records, waiver records, reminder eligibility and intents, aging/delinquency read models, and penalty-side or waiver-side balance-impact facts. This planning stage decides how those responsibilities use the existing Docker Compose, PostgreSQL, logging, monitoring, backup, and deployment controls without adding infrastructure that the unit does not need.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/functional-design/` | Approved UOW-06 domain behavior, business rules, entities, frontend components, validation semantics, and boundaries. |
| `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/nfr-requirements/` | Approved performance, security, durability, observability, accessibility, and PBT requirements. |
| `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/nfr-design/` | Approved logical components and non-functional design patterns. |
| `aidlc-docs/construction/uow-01-platform-foundation/infrastructure-design/` | Existing approved shared infrastructure baseline. |
| `aidlc-docs/construction/shared-infrastructure.md` | Cross-unit deployment boundary and rules for shared infrastructure. |

## Infrastructure Design Scope

### In Scope

- Reuse or refinement of the shared UOW-01 deployment baseline for UOW-06.
- PostgreSQL infrastructure mapping for penalty runs, penalty source records, waiver requests, waiver records, reminder eligibility, reminder intents, aging/delinquency read support, balance-impact facts, approval references, and audit references.
- PostgreSQL transactions, constraints, indexes, and lock-support structures for duplicate penalty blocking, waiver idempotency, reissue safety, and reminder duplicate suppression.
- Candidate-generation execution posture for first-scope monthly runs.
- Backup and restore coverage for UOW-06 financial source records, reminder intents, approval references, and audit references.
- Logging, monitoring, dashboards, and alerts for overdue evaluation, aging classification, penalty runs, duplicate blocks, waiver lifecycle, reminder suppression/intents, denied access, and support intents.
- Network exposure confirmation for UOW-06 API and web routes through the existing reverse proxy.
- Secrets and configuration needs specific to UOW-06, if any.
- Shared infrastructure document updates if UOW-06 materially refines the shared baseline.

### Out of Scope

- Application code, database migrations, DTOs, tests, and API handlers. These belong to Code Generation.
- New deployable services unless explicitly approved in this plan.
- Invoice creation, payment posting, receipt creation, statement/report/export generation, PDF rendering, SMTP delivery, file storage, retry workers, and import processing.
- Concrete operations runbooks beyond design-level infrastructure requirements for this unit.

## Infrastructure Design Checklist

- [x] Read UOW-06 Functional Design artifacts.
- [x] Read UOW-06 NFR Requirements artifacts.
- [x] Read UOW-06 NFR Design artifacts.
- [x] Read Infrastructure Design rule details.
- [x] Review UOW-01 infrastructure and shared infrastructure baselines.
- [x] Confirm Security Baseline and Property-Based Testing extensions are enabled.
- [x] Identify UOW-06 infrastructure mapping decisions and risks.
- [x] Create this Infrastructure Design plan with targeted questions.
- [ ] Collect answers for every `[Answer]:` tag.
- [ ] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [ ] Add follow-up questions if any answer is vague, mixed, or contradictory.
- [ ] Generate `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/infrastructure-design/infrastructure-design.md`.
- [ ] Generate `aidlc-docs/construction/uow-06-penalties-delinquency-waivers-reminders/infrastructure-design/deployment-architecture.md`.
- [ ] Update `aidlc-docs/construction/shared-infrastructure.md` if approved answers require a shared baseline refinement.
- [ ] Verify Security Baseline compliance summary.
- [ ] Verify Property-Based Testing infrastructure relevance is marked correctly.
- [ ] Verify content validation before artifact creation.
- [ ] Present the standardized Infrastructure Design completion message.

## Required Infrastructure Design Artifacts

After this plan is answered and validated, generate:

- `infrastructure-design.md`
- `deployment-architecture.md`

If approved answers require a shared baseline refinement, update:

- `aidlc-docs/construction/shared-infrastructure.md`

## Infrastructure Design Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

### Question 1
What deployment model should UOW-06 use?

A) Reuse the UOW-01 shared single-host Docker Compose deployment with no new UOW-06 deployable services (recommended)
B) Add a separate UOW-06 collections API service boundary
C) Defer deployment mapping to Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: 

### Question 2
How should UOW-06 database changes be deployed?

A) Apply penalty run, penalty source record, waiver request, waiver source record, reminder eligibility, reminder intent, balance-impact, index, constraint, idempotency, approval-reference, and audit-reference structures through the existing PostgreSQL migration path, with staging migration rehearsal and rollback planning before production (recommended)
B) Allow runtime table creation during first penalty run
C) Defer database infrastructure planning to Code Generation
X) Other (please describe after [Answer]: tag below)

[Answer]: 

### Question 3
What infrastructure should protect duplicate penalties, waiver idempotency, reissues, and reminder suppression?

A) Use PostgreSQL transactions, unique constraints/indexes, partial indexes where appropriate, and row-level or advisory locking for duplicate penalty keys, waiver idempotency keys, reissue validation, and reminder scope/period keys; no distributed lock service (recommended)
B) Add a distributed lock service now
C) Rely on frontend sequencing and staff procedures
X) Other (please describe after [Answer]: tag below)

[Answer]: 

### Question 4
What execution infrastructure should UOW-06 use for penalty candidate generation?

A) Use the existing API container for manual first-scope candidate generation and keep the design background-capable for later scheduling through existing worker/job infrastructure when UOW-08 owns job orchestration; do not add a new UOW-06 worker now (recommended)
B) Add a dedicated UOW-06 worker service now
C) Generate candidates only in the browser
X) Other (please describe after [Answer]: tag below)

[Answer]: 

### Question 5
What application infrastructure should UOW-06 use for applying penalties and waivers?

A) Synchronous API/database workflow in the existing API container for first-scope penalty application and waiver approval execution, with per-record transactional commits and per-record batch results; no new queue/worker for UOW-06 financial mutation (recommended)
B) Add a queue and worker for penalty application and waiver execution now
C) Run penalty application from the browser
X) Other (please describe after [Answer]: tag below)

[Answer]: 

### Question 6
How should UOW-06 data be covered by backup and restore?

A) Include penalty runs, penalty source records, waiver requests, waiver records, reminder eligibility, reminder intents, balance-impact facts, approval references, and audit references in the existing encrypted PostgreSQL backup and staging restore rehearsal; no UOW-06 file storage (recommended)
B) Create a separate UOW-06 backup process
C) Defer penalty/waiver backup coverage until UOW-07 reporting exists
X) Other (please describe after [Answer]: tag below)

[Answer]: 

### Question 7
What logging and monitoring infrastructure should UOW-06 use?

A) Use existing structured logs, Loki-equivalent storage, Prometheus/Grafana-equivalent metrics, and dashboards with UOW-06-specific overdue evaluation, aging, penalty run, duplicate block, waiver, reminder suppression, authorization, and support-intent categories (recommended)
B) Add a separate observability stack for UOW-06
C) Keep only generic API health metrics for UOW-06
X) Other (please describe after [Answer]: tag below)

[Answer]: 

### Question 8
Which UOW-06 alerts should be required?

A) Add alert coverage for repeated authorization denials, overdue evaluation failure spikes, penalty candidate generation failures, duplicate penalty conflict spikes, penalty application failure spikes, waiver approval/idempotency failures, reminder suppression/contact-path anomalies, support-intent failure spikes, database health, backup failure, and restore verification failure (recommended)
B) Alert only on service downtime
C) Defer UOW-06 alerts until production incidents occur
X) Other (please describe after [Answer]: tag below)

[Answer]: 

### Question 9
How should UOW-06 routes be exposed?

A) Serve UOW-06 frontend and API routes through existing web/API containers and Caddy reverse proxy, with no new public ports and no direct PostgreSQL exposure (recommended)
B) Expose UOW-06 API on a separate public port
C) Allow direct database access for collections staff tools
X) Other (please describe after [Answer]: tag below)

[Answer]: 

### Question 10
What secrets or configuration changes should UOW-06 introduce?

A) Use the existing typed configuration and secrets pattern; add only non-secret UOW-06 thresholds or flags such as penalty run batch size, candidate generation timeout, duplicate/reissue window, reminder suppression default window, and timezone setting unless a later implementation proves a secret is required (recommended)
B) Add UOW-06-specific secret files now
C) Store UOW-06 configuration in committed environment files
X) Other (please describe after [Answer]: tag below)

[Answer]: 

### Question 11
How should reminder intents map to infrastructure?

A) Persist UOW-06 reminder intents and eligibility snapshots in PostgreSQL through existing UOW-01 support contracts; do not add file storage, PDF rendering, SMTP, retry workers, or queues in UOW-06 (recommended)
B) Add reminder rendering, SMTP, and retry infrastructure to UOW-06 now
C) Do not persist reminder intents until UOW-08
X) Other (please describe after [Answer]: tag below)

[Answer]: 

### Question 12
Should shared infrastructure documentation be updated for UOW-06?

A) Yes, update shared infrastructure only to note UOW-06's use of the shared stack, PostgreSQL penalty/waiver/reminder data coverage, locking/constraint reliance, monitoring/alert additions, backup/restore coverage, candidate-generation posture, and reminder-intent boundaries; do not add new services (recommended)
B) No, keep shared infrastructure unchanged even if UOW-06 adds monitoring and alert requirements
C) Replace the shared infrastructure baseline with a UOW-06-specific baseline
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Post-Answer Processing

After all `[Answer]:` tags are complete:

- Answers will be checked for blanks, invalid choices, contradictions, and vague wording.
- Follow-up questions will be added if any answer is ambiguous.
- If answers are clear, Infrastructure Design artifacts will be generated directly from this plan and approved source context.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant for Infrastructure Design | Infrastructure artifacts require private route exposure, no direct database access, database constraints/locking, safe monitoring, alerts, backups, restore, secrets discipline, and support-service boundaries. |
| Property-Based Testing | N/A for Infrastructure Design | This stage does not create test code or PBT models. PBT design requirements remain carried by UOW-06 NFR Design and Code Generation. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
