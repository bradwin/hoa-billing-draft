# Shared Infrastructure

## Scope

This document records the shared infrastructure baseline for the HOA Billing System across all eight units of work. UOW-01 establishes the single-host Docker Compose stack. Later units add application modules, database schema, worker jobs, support adapters, reports, imports, and portal integration inside this same deployment boundary unless a later approved design explicitly changes the infrastructure model.

## Shared Deployment Boundary

| Area | Shared Decision |
|---|---|
| Deployment model | One TypeScript modular monolith deployed on one Linux host or VPS through Docker Compose. |
| Public entry point | Caddy reverse proxy on ports 80 and 443 only. |
| Runtime services | Web, API, worker, PostgreSQL, log storage, monitoring, dashboard, and backup services. |
| Database | One PostgreSQL instance for first implementation, with schemas/modules owned by application domains. |
| Storage | Encrypted production volumes for database, logs, backups, certificates, and application-managed files. |
| Observability | Shared log store and metrics/dashboard stack for all units. |
| Backups | Shared encrypted database and file backup process with restore rehearsal. |
| Secrets | Shared external secret provisioning pattern through Compose secrets or root-owned files outside the repository. |

## Unit Impact

| Unit | Infrastructure Impact |
|---|---|
| UOW-01 | Establishes base stack, authentication/session/audit/settings/approval infrastructure, logging, monitoring, backups, and readiness gates. |
| UOW-02 | Adds homeowner/property APIs, frontend features, PostgreSQL tables, normalized indexes, effective-dated ownership and billing-account period constraints, audit/read-model data, and UOW-02 monitoring and alert categories; no new deployable service, public port, search service, cache, queue, file storage, email service, document service, or import service. |
| UOW-03 | Adds billing configuration APIs, frontend features, PostgreSQL tables, effective-dated configuration version indexes/guards, approval-reference/audit/version data, and UOW-03 monitoring and alert categories; no new deployable service, public port, cache, search service, rule engine, queue, file storage, email service, document service, support job infrastructure, or import service. |
| UOW-04 | Adds invoice lifecycle APIs, frontend routes, PostgreSQL invoice source-record tables, issued snapshot and number-assignment data, duplicate-prevention indexes/constraints, numbering-scope locking requirements, billing exception data, lifecycle action data, open-amount input facts, durable support intents, and UOW-04 monitoring and alert categories; no new deployable service, public port, distributed lock service, queue, worker, PDF renderer, SMTP service, file storage service, report/export service, payment processor, penalty processor, or import processor. |
| UOW-05 | Adds payment proof, payment, allocation, receipt, credit, reversal, correction, balance-impact, support-intent, approval-reference, and audit-reference APIs/tables; adds PostgreSQL duplicate-risk, allocation, credit application, reversal, and receipt-numbering constraint/locking reliance; adds UOW-05 monitoring and alert categories; no new deployable service, public port, distributed lock service, queue, worker, file storage service, PDF renderer, SMTP service, report/export service, penalty processor, or import processor. |
| UOW-06 | Adds penalty run, penalty source record, waiver request, waiver source record, reminder eligibility, reminder intent, aging/delinquency support, balance-impact, approval-reference, and audit-reference APIs/tables; adds PostgreSQL duplicate penalty, waiver idempotency, reissue validation, and reminder suppression constraint/locking reliance; adds UOW-06 monitoring and alert categories; no new deployable service, public port, distributed lock service, queue, worker, file storage service, document renderer, SMTP service, report/export service, payment processor, or import processor. |
| UOW-07 | Adds statements, reports, dashboards, exports, and read models; export delivery/storage uses support intents until UOW-08. |
| UOW-08 | Adds concrete support service adapters for imports, opening balances, storage, documents, notifications, jobs, and portal integration. |

## Shared Infrastructure Rules

- Application code remains in the workspace root, never under `aidlc-docs/`.
- Later units must not introduce new deployable services unless the unit design explicitly justifies and approves them.
- Later units must use UOW-01 audit, authorization, settings, support intent, logging, config, and error-handling infrastructure.
- Financial source-record units must commit source records and required audit entries transactionally wherever possible.
- UOW-02 master data, ownership periods, billing-account periods, contact requests, audit entries, and read models must stay inside the shared PostgreSQL, backup, restore, observability, and production readiness controls.
- UOW-03 billing configuration drafts, activated versions, approval references, audit entries, catalogs, and resolution read models must stay inside the shared PostgreSQL, backup, restore, observability, and production readiness controls.
- UOW-04 invoice source records, invoice lines, issued snapshots, number assignments, open-amount input facts, billing exceptions, lifecycle actions, support intents, approval references, and audit references must stay inside the shared PostgreSQL, backup, restore, observability, and production readiness controls.
- UOW-05 payment proofs, posted payments, allocations, credits, credit applications, receipts, receipt snapshots, reversals, corrections, balance-impact facts, support intents, approval references, and audit references must stay inside the shared PostgreSQL, backup, restore, observability, and production readiness controls.
- UOW-06 penalty runs, penalty source records, waiver requests, waiver source records, reminder eligibility, reminder intents, aging/delinquency support records, balance-impact facts, approval references, and audit references must stay inside the shared PostgreSQL, backup, restore, observability, and production readiness controls.
- No unit may bypass the shared backup, restore, audit immutability, and production readiness gates.
- No unit may store real secrets in committed files.
- No production service may use unpinned `latest` image tags.
- No authenticated API endpoint may be exposed outside the reverse proxy path.
- No unit may directly expose PostgreSQL publicly.

## Shared Network Baseline

| Network | Shared Use |
|---|---|
| `edge` | Public reverse proxy access only. |
| `app_private` | Web, API, worker, and reverse proxy internal communication. |
| `data_private` | API, worker, PostgreSQL, and backup communication. |
| `observability_private` | Log, metrics, dashboard, exporters, and service health communication. |

## Shared Data Baseline

| Data Area | Shared Control |
|---|---|
| Financial source records | Owned by their domain units, protected by transaction and audit requirements. |
| Audit records | Owned by UOW-01 audit component, append-only by app behavior and database controls. |
| Support intents | Persisted in PostgreSQL and implemented by UOW-08 adapters. |
| Application-managed files | Stored on encrypted volume after UOW-08 adapter implementation and included in file backups. |
| Logs | Shipped to shared log storage with at least 90-day retention. |
| Backups | Shared encrypted backup and restore procedure. |
| Secrets | Mounted from approved external secret files or Compose secrets only. |

## Shared Production Readiness Gate

The production readiness gate applies to the whole system, not just UOW-01. Any later unit that changes deployment, persistence, secrets, network exposure, financial source records, support adapters, or backup scope must update this gate.

Minimum gate:

- TLS active and HTTP redirects to HTTPS.
- Production storage encrypted.
- PostgreSQL private and using TLS.
- Runtime roles least-privileged.
- Audit update/delete blocked for runtime roles.
- Daily encrypted database backup configured.
- File backup configured once file storage exists.
- Staging restore rehearsal completed.
- Audit hash-chain verification completed after restore.
- Persistent log retention at least 90 days.
- Security and operations alerts configured.
- Secrets outside the repository.
- Production images pinned.
- Vulnerability scan and SBOM generation paths documented.

## Deferred Shared Decisions

| Deferred Decision | Owning Stage or Unit |
|---|---|
| Exact Compose files and Dockerfiles | Code Generation |
| Exact backup scripts and restore scripts | Code Generation and Build/Test |
| Exact monitoring dashboards and alert rule files | Code Generation and Build/Test |
| Concrete SMTP adapter | UOW-08 |
| Concrete PDF/document renderer | UOW-08 |
| Concrete filesystem/storage adapter | UOW-08 |
| Concrete job dispatch implementation | UOW-08 |
| Any Redis, queue service, Kubernetes, or managed cloud migration | Future approved requirements and infrastructure design |

## Security Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-01 | Compliant | Shared baseline requires encrypted storage and TLS. |
| SECURITY-02 | Compliant | Shared reverse proxy access logging is required. |
| SECURITY-03 | Compliant | Shared structured logging and centralized log storage are required. |
| SECURITY-04 | Compliant | Shared reverse proxy and app middleware responsibilities cover TLS, HSTS, CSP, and required headers. |
| SECURITY-05 | Compliant | Shared API validation and private database access remain mandatory for every unit. |
| SECURITY-06 | Compliant | Shared database roles follow least privilege. |
| SECURITY-07 | Compliant | Shared network baseline restricts public exposure to the reverse proxy. |
| SECURITY-08 | Compliant | Shared authorization, object access, CORS, and session controls apply to every unit. |
| SECURITY-09 | Compliant | Shared hardening, secrets, and production readiness gates apply to every unit. |
| SECURITY-10 | Compliant | Shared supply-chain controls apply to generated app and deployment artifacts. |
| SECURITY-11 | Compliant | Shared architecture keeps security-critical logic in dedicated components. |
| SECURITY-12 | Compliant | Shared authentication/session/MFA/secrets infrastructure applies across units. |
| SECURITY-13 | Compliant | Shared audit, backup, restore, and deployment controls preserve data integrity. |
| SECURITY-14 | Compliant | Shared logs, retention, dashboards, and alerts are required. |
| SECURITY-15 | Compliant | Shared health checks, fail-closed controls, and recovery gates are required. |

## PBT Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| PBT-01 through PBT-10 | N/A for Shared Infrastructure | PBT enforcement applies to functional design, code generation, and build/test. The shared infrastructure document does not create application test code. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
