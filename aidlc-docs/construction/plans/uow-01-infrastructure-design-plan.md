# UOW-01 Infrastructure Design Plan

## Unit

- **Unit ID**: UOW-01
- **Unit Name**: Platform Foundation, Access, Settings, Audit, and Approval Core
- **Stage**: Infrastructure Design, Part 1 - Planning
- **Current Gate**: Waiting for answers in this file

## Purpose

Map the approved UOW-01 functional and NFR design to concrete deployment infrastructure before Code Generation. This plan must resolve local or single-server deployment choices for compute, PostgreSQL, TLS, storage encryption, logging, backups, monitoring, alerting, network exposure, and shared infrastructure boundaries.

Financial and security ambiguity is not acceptable here. Any choice that leaves audit records mutable, backups unverified, secrets committed, production storage unencrypted, or authenticated endpoints publicly overexposed will block Infrastructure Design completion.

## Source Context

- Functional Design:
  - `aidlc-docs/construction/uow-01-platform-foundation/functional-design/`
- NFR Requirements:
  - `aidlc-docs/construction/uow-01-platform-foundation/nfr-requirements/`
- NFR Design:
  - `aidlc-docs/construction/uow-01-platform-foundation/nfr-design/nfr-design-patterns.md`
  - `aidlc-docs/construction/uow-01-platform-foundation/nfr-design/logical-components.md`
- Unit Context:
  - `aidlc-docs/inception/application-design/unit-of-work.md`
  - `aidlc-docs/inception/plans/execution-plan.md`

## Infrastructure Design Scope

### In Scope

- Local and production deployment environment boundaries.
- Docker or equivalent single-host compute mapping.
- Reverse proxy, TLS termination, firewall exposure, and Docker network layout.
- PostgreSQL persistence, encryption at rest, TLS, runtime grants, backups, and restore verification.
- Application-managed persistent file storage placeholder and backup expectations.
- Secrets storage and application encryption key handling.
- Structured log collection, retention, dashboards, and security alerting path.
- Health checks, monitoring, and production readiness gates.
- Support intent infrastructure boundary before UOW-08.
- Shared infrastructure treatment across all eight units.

### Out of Scope

- Application source code, Prisma schema, Dockerfile contents, and package versions. These belong to Code Generation.
- Concrete SMTP, PDF generation, filesystem adapter, and job-dispatch adapter implementation. These belong to UOW-08.
- Cloud-specific managed resources unless approved in this plan.
- Multi-HOA, multi-region, autoscaling, and zero-downtime failover. These require reopened requirements.

## Infrastructure Design Checklist

- [x] Read UOW-01 Functional Design artifacts.
- [x] Read UOW-01 NFR Requirements artifacts.
- [x] Read UOW-01 NFR Design artifacts.
- [x] Read Infrastructure Design rule details.
- [x] Confirm Security Baseline and Property-Based Testing extensions are enabled.
- [x] Identify infrastructure decisions that affect security, auditability, backups, and operability.
- [x] Create this Infrastructure Design plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, contradictory, or unsafe.
- [x] Generate `aidlc-docs/construction/uow-01-platform-foundation/infrastructure-design/infrastructure-design.md`.
- [x] Generate `aidlc-docs/construction/uow-01-platform-foundation/infrastructure-design/deployment-architecture.md`.
- [x] Generate `aidlc-docs/construction/shared-infrastructure.md` if shared infrastructure is confirmed.
- [x] Verify Security Baseline compliance summary.
- [x] Verify Property-Based Testing extension applicability.
- [x] Verify content validation before artifact creation.
- [x] Present the standardized Infrastructure Design completion message.

## Required Infrastructure Design Artifacts

After this plan is answered and validated, the following artifacts must be generated:

- `infrastructure-design.md`: Concrete infrastructure decisions, service mappings, security controls, backup and restore design, monitoring, and compliance summary.
- `deployment-architecture.md`: Environment topology, container/service layout, network exposure, deployment flow, and operational readiness gates.
- `shared-infrastructure.md`: Shared infrastructure boundaries across all units, if confirmed by answers.

## Infrastructure Design Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

### Question 1
What production deployment target should Infrastructure Design use for first implementation?

A) Single Linux host or VPS running Docker Compose, with local development using the same Compose topology at smaller scale (recommended)
B) Managed cloud platform from first implementation, such as ECS, App Runner, Cloud Run, or Kubernetes
C) Developer workstation only, with no production deployment target yet
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What environment separation should be designed before real financial records are used?

A) Local development plus separate staging and production Compose projects, with staging required for restore and upgrade rehearsals before production use (recommended)
B) Local development plus production only
C) One shared environment for all testing and production use
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
What compute/container mapping should be used?

A) Separate containers for reverse proxy, web, API, worker, PostgreSQL, log/monitoring stack, and backup job, all on private Docker networks except the reverse proxy (recommended)
B) One container running web, API, worker, database, and proxy together
C) No containers; run processes directly on the host
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
How should public exposure, firewalling, and DNS be handled?

A) Production exposes only ports 80 and 443 through the reverse proxy, keeps PostgreSQL and app containers private, restricts SSH administration, and requires approved DNS before public homeowner access (recommended)
B) Expose app and database ports directly for easier administration
C) Keep production LAN-only forever with no reverse proxy or DNS plan
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
What reverse proxy and TLS termination pattern should be used?

A) Caddy reverse proxy for TLS termination, automatic certificate management where public DNS exists, HSTS in production, and explicit local-development exceptions (recommended)
B) Nginx reverse proxy with manually provisioned certificates
C) Application containers terminate TLS directly with no reverse proxy
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
What PostgreSQL deployment pattern should be used?

A) PostgreSQL 16 or later container with encrypted host volume, private Docker network access only, health checks, separate migration/admin and runtime app roles, and explicit backup hooks (recommended)
B) PostgreSQL installed directly on the host without containerization
C) SQLite or file database for first implementation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
How should database encryption in transit be handled?

A) Enforce TLS for production PostgreSQL connections, even on the private Docker network, with local development allowed to use a documented non-TLS exception (recommended)
B) Do not use PostgreSQL TLS because Docker network traffic is private
C) Defer database TLS until after production launch
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
How should encryption at rest be handled for database and persistent files?

A) Require encrypted host disk or encrypted cloud volume for PostgreSQL data, application-managed files, logs, and backups; production cannot run on unencrypted storage (recommended)
B) Encrypt only database backups, not live data volumes
C) Defer encryption at rest to a future operations phase
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
What infrastructure control should protect audit immutability?

A) Use separate migration/admin and runtime database roles, runtime app role has no audit update/delete privilege, and database triggers or policies reject audit update/delete outside controlled migration contexts (recommended)
B) Rely only on application code not to update or delete audit records
C) Store audit records only in log files
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
What backup and restore pattern should be designed?

A) Daily encrypted logical PostgreSQL backup plus encrypted persistent-file backup, 35 daily and 12 monthly retention, restore rehearsal before production, and audit hash-chain verification after restore (recommended)
B) Weekly manual backups with no restore rehearsal
C) No backup process until after the system is in use
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 11
What logging infrastructure should first production use?

A) Structured container logs shipped to a self-hosted local Loki or equivalent log store with at least 90-day retention, restricted access, and redaction enforced by the app (recommended)
B) Docker default logs only, inspected manually
C) No persistent logs beyond application audit tables
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 12
What monitoring and dashboard pattern should first production use?

A) Self-hosted Prometheus/Grafana or equivalent local stack with container health, API health, database health, disk usage, backup status, and security-event dashboard (recommended)
B) Basic Docker health checks only
C) No monitoring dashboard until Operations phase
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 13
What alerting pattern should Infrastructure Design require?

A) Alert rules for repeated auth failures, authorization failures, privilege changes, backup failures, disk pressure, and service health; production must configure at least one notification contact before real financial data is used (recommended)
B) Dashboard-only review with no alert notifications
C) Defer alerting entirely to UOW-08 support services
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 14
How should secrets be provided to production containers?

A) Docker Compose secrets or root-owned files outside the repo, strict file permissions, no committed real `.env`, and a documented future secrets-manager migration path (recommended)
B) Commit production `.env` for repeatability
C) Enter secrets manually into shell sessions before every start
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 15
How should support-intent infrastructure be handled before UOW-08?

A) Persist support intents in PostgreSQL and run no real SMTP, PDF, filesystem adapter, or job dispatch before UOW-08; worker container may run cleanup/internal jobs only (recommended)
B) Implement SMTP and PDF infrastructure now
C) Skip support intent persistence until UOW-08
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 16
What shared infrastructure scope should be documented?

A) One shared single-host infrastructure stack for all eight units, with UOW-01 establishing base services and later units adding modules without new deployable services unless approved (recommended)
B) Each unit gets separate infrastructure and deployment services
C) Do not document shared infrastructure until all units are coded
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 17
What production readiness gate should Infrastructure Design require?

A) Production use is blocked until TLS, encrypted storage, backups, restore rehearsal, log retention, alert contact, non-default secrets, and audit immutability controls are verified (recommended)
B) Production use is allowed after app build succeeds
C) Production use is allowed after manual smoke testing only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 18
What capacity and scaling posture should infrastructure document?

A) Size for the approved first scope only, avoid Redis/Kubernetes/autoscaling, monitor capacity, and reopen requirements before multi-HOA or materially higher concurrency (recommended)
B) Add Redis and autoscaling now
C) Ignore capacity assumptions until performance issues occur
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Post-Answer Processing

After all `[Answer]:` tags are complete:

- Answers will be checked for blanks, invalid choices, contradictions, and unsafe choices.
- Follow-up questions will be added if any answer is ambiguous, mixed, or weakens security/audit/backup guarantees.
- If answers are clear, Infrastructure Design artifacts will be generated directly from this plan and approved source context.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant for planning | Questions cover encryption at rest and in transit, network exposure, logs, headers/TLS, access controls, audit immutability, backups, monitoring, alerting, secrets, and supply-chain readiness. |
| Property-Based Testing | N/A for planning | Infrastructure Design does not add PBT properties or implementation tests; PBT execution remains carried forward to Code Generation and Build/Test. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown uses standard headings, lists, tables, and code spans only.
- All questions include a final `X) Other` option and `[Answer]:` tag.
