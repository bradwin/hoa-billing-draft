# UOW-04 Infrastructure Design

## Unit

- **Unit ID**: UOW-04
- **Unit Name**: Invoice Lifecycle and Invoice Source Records
- **Stage**: Infrastructure Design

## Infrastructure Boundary

UOW-04 reuses the shared single-host Docker Compose deployment baseline established by UOW-01. It adds invoice lifecycle APIs, frontend routes, PostgreSQL invoice data, locking and uniqueness requirements, monitoring categories, and alert coverage. It does not add a new deployable service, public port, distributed lock service, queue, worker, PDF renderer, SMTP service, file storage service, or import processor.

UOW-04 persists document/email support intents only. UOW-08 owns concrete PDF rendering, file storage, SMTP delivery, retry workers, and document download enforcement.

## Deployment Model

| Area | Decision |
|---|---|
| Deployment baseline | Reuse UOW-01 shared single-host Docker Compose deployment. |
| Web runtime | Existing web container serves UOW-04 frontend routes. |
| API runtime | Existing API container serves UOW-04 API routes. |
| Worker runtime | No new UOW-04 worker behavior for first scope. |
| Database | Existing PostgreSQL instance stores UOW-04 invoice data. |
| Reverse proxy | Existing Caddy reverse proxy exposes UOW-04 web/API routes. |
| Public ports | No new public ports. |

## Database Infrastructure

UOW-04 database changes are deployed through the existing PostgreSQL migration path. Production deployment requires staging migration rehearsal and rollback planning before applying migrations to production.

| Data Area | Infrastructure Mapping |
|---|---|
| Invoice batches | PostgreSQL tables and indexes. |
| Billing exceptions | PostgreSQL tables with indexed batch, property, status, and safe failure code. |
| Invoices | PostgreSQL typed tables with indexes for status, origin, billing period, property, billing account, homeowner, and issued number. |
| Invoice lines | PostgreSQL typed tables linked to invoice source records. |
| Issued snapshots | PostgreSQL typed tables with bounded metadata JSON only where justified. |
| Number assignments | PostgreSQL table with unique issued-number constraint per numbering scope. |
| Open-amount input facts | PostgreSQL table linked to issued invoice source records. |
| Lifecycle actions | PostgreSQL table linked to invoices and approval references. |
| Support intents | PostgreSQL records through UOW-01 support contracts. |
| Audit references | UOW-01 audit tables and references. |

## Locking and Constraint Infrastructure

| Risk | Infrastructure Control |
|---|---|
| Duplicate recurring invoices | PostgreSQL unique constraints or indexes for recurring duplicate keys plus service guard. |
| Cancelled draft replacement ambiguity | Linked replacement action record with reason, actor, and audit. |
| Concurrent issued numbering | PostgreSQL row-level or advisory locking per numbering scope. |
| Duplicate issued invoice numbers | Unique issued-number constraint per applicable scope. |
| Race during issuance | Transactional revalidation and conflict handling. |

No distributed lock service is required for first scope.

## Recurring Generation Infrastructure

Recurring generation runs as a synchronous API/database workflow in the existing API container for first-scope batches of up to 2,000 candidates.

| Area | Decision |
|---|---|
| Execution | API command using database transactions and internal chunking where useful. |
| Queue | No UOW-04 queue or worker for recurring generation. |
| Browser role | Submit criteria and display result; no browser-side invoice generation. |
| Retry safety | Database duplicate controls and persisted exceptions. |
| Result visibility | Summary counts and persisted exception records. |

If later batch volume exceeds the approved first-scope target, infrastructure must be revisited before adding queues or workers.

## Backup and Restore

UOW-04 data is included in the existing encrypted PostgreSQL backup and staging restore rehearsal.

| Data Included | Backup Requirement |
|---|---|
| Invoices and invoice lines | Included in database backup. |
| Issued snapshots | Included in database backup. |
| Number assignments | Included in database backup. |
| Open-amount input facts | Included in database backup. |
| Billing exceptions | Included in database backup. |
| Lifecycle actions | Included in database backup. |
| Support intents | Included in database backup. |
| Approval references | Included in database backup. |
| Audit references | Included through UOW-01 audit backup coverage. |

UOW-04 does not add file storage. PDF files, email attachments, and document download storage are UOW-08 infrastructure concerns.

## Logging and Monitoring

UOW-04 uses the existing structured logging, Loki-equivalent log storage, Prometheus/Grafana-equivalent metrics, and dashboards.

| Category | Signals |
|---|---|
| Generation | Started, completed, duration, candidate count, draft count, exception count. |
| Exceptions | Count by safe failure code and batch. |
| Duplicates | Duplicate block count and safe conflict code. |
| Issuance | Success count, failure count, duration, per-invoice result status. |
| Numbering | Number assignment success, conflict, lock wait where available. |
| Authorization | Denials by safe action category. |
| Lifecycle | Void/reissue requests, decisions, approval application failures. |
| Snapshots | Snapshot creation count and failures. |
| Support intents | Document/email intent requested, accepted, failed where available. |

Logs must use safe identifiers and redacted payloads. Full homeowner PII, full invoice payloads, payment-like details, and email recipient payloads must not be logged.

## Alerting

| Alert | Purpose |
|---|---|
| Repeated authorization denials | Detect possible misuse or access probing. |
| Generation failure spike | Detect recurring generation degradation. |
| Exception spike | Detect upstream UOW-02 or UOW-03 data/configuration quality problems. |
| Duplicate block spike | Detect repeated generation retry or duplicate-risk behavior. |
| Numbering conflict | Detect concurrency or numbering-scope defects. |
| Issuance failure spike | Detect validation, transaction, or persistence degradation. |
| Failed void/reissue approval application | Detect approval workflow integration failures. |
| Support-intent failure spike | Detect support contract or persistence issues. |
| Database health | Preserve invoice source-record availability. |
| Backup failure | Preserve recoverability. |
| Restore verification failure | Preserve production readiness. |

## Route Exposure

UOW-04 web and API routes are served through existing web/API containers and the existing Caddy reverse proxy.

| Rule | Decision |
|---|---|
| Public API port | No separate public UOW-04 API port. |
| Direct database access | Not allowed. |
| Staff tooling | Must use authorized API routes, not direct PostgreSQL access. |
| Homeowner access | Served through authorized web/API read models. |

## Secrets and Configuration

UOW-04 uses the existing typed configuration and secrets pattern. It introduces no new secret by default.

Potential non-secret configuration:

- recurring generation candidate limit;
- recurring generation timeout;
- internal chunk size;
- issuance selection limit;
- alert thresholds for generation failures, exceptions, duplicate blocks, numbering conflicts, and support-intent failures.

No UOW-04 secret may be committed to repository files.

## Support Intent Infrastructure

UOW-04 persists document and email support intents in PostgreSQL through existing UOW-01 support contracts.

| Area | Decision |
|---|---|
| PDF rendering | Not in UOW-04. |
| SMTP delivery | Not in UOW-04. |
| File storage | Not in UOW-04. |
| Retry workers | Not in UOW-04. |
| Queues | Not added for UOW-04. |
| Intent persistence | PostgreSQL through support contracts. |

## Production Readiness Impact

UOW-04 adds financial source-record tables. Production readiness must verify:

- UOW-04 migrations rehearsed in staging.
- Invoice source records included in encrypted database backups.
- Restore rehearsal includes issued invoice snapshots and number assignments.
- Duplicate and numbering constraints exist before production invoice generation.
- Runtime database role remains least-privileged.
- No direct PostgreSQL exposure exists.
- UOW-04 logs are redacted.
- UOW-04 alerts are configured.
- Support intent failures do not invalidate issued invoices.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Infrastructure design preserves private database access, reverse-proxy-only exposure, no committed secrets, backup/restore coverage, monitoring, alerts, least-privilege database use, and support-service boundaries. |
| Property-Based Testing | N/A for Infrastructure Design | This artifact does not create test code. PBT requirements remain carried by UOW-04 NFR Design and Code Generation. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
