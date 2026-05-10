# UOW-06 Infrastructure Design

## Unit

- **Unit ID**: UOW-06
- **Unit Name**: Penalties, Delinquency, Waivers, and Reminders
- **Stage**: Infrastructure Design

## Infrastructure Decision Summary

UOW-06 uses the existing single-host Docker Compose deployment established by UOW-01. No new deployable service, public port, distributed lock service, queue, worker, file storage, PDF renderer, SMTP service, retry worker, or import processor is added for UOW-06.

UOW-06 relies on PostgreSQL for penalty, waiver, reminder, aging/delinquency support, balance-impact source records, transaction boundaries, uniqueness constraints, indexes, and lock-supported operations. Reminder rendering, SMTP delivery, retry workers, file storage, and downloads remain UOW-08 responsibilities.

## Service Mapping

| Logical Area | Infrastructure Mapping |
|---|---|
| Overdue and aging APIs | Existing API container. |
| Penalty candidate generation | Existing API container for first-scope manual generation; background-capable for later UOW-08 job orchestration. |
| Penalty application APIs | Existing API container with PostgreSQL transactions. |
| Waiver request and approval APIs | Existing API container with PostgreSQL transactions and UOW-01 approval contracts. |
| Reminder eligibility and intent APIs | Existing API container with PostgreSQL support-intent persistence. |
| Staff and homeowner UOW-06 views | Existing web container. |
| PostgreSQL data | Existing PostgreSQL service and encrypted database volume. |
| Logs | Existing structured logging and shared log storage. |
| Metrics and dashboards | Existing Prometheus/Grafana-equivalent monitoring stack. |
| Reminder intents | Existing UOW-01 support contract persistence in PostgreSQL. |
| Backups and restore | Existing encrypted PostgreSQL backup and staging restore rehearsal process. |

## Database Infrastructure

UOW-06 database changes must be deployed through the existing migration path. Runtime table creation during first penalty run is prohibited.

| Data Area | PostgreSQL Structures |
|---|---|
| Penalty runs | Run table, evaluation date index, run status index, actor/correlation references. |
| Penalty source records | Penalty table, invoice/billing account/property indexes, penalty period index, duplicate-blocking status support, rule snapshot fields. |
| Waiver requests | Request table, target penalty index, approval reference index, request status index, idempotency key support. |
| Waiver source records | Waiver table, target penalty index, idempotency unique constraint, approval reference, balance-impact linkage. |
| Reminder eligibility | Eligibility table or persisted snapshot support, scope index, evaluation date index, suppression reason fields. |
| Reminder intents | Intent table, reminder scope/period uniqueness support, support-intent reference, status index. |
| Aging and delinquency support | Indexed evaluation fields, billing account/property/invoice links, aging bucket and delinquent amount query support. |
| Balance-impact facts | Source-record, billing account, property, invoice, effective date, and correlation indexes. |
| Audit references | Correlation IDs and audit references connected to UOW-01 audit records. |

## Transaction And Locking Infrastructure

| Risk | Infrastructure Control |
|---|---|
| Duplicate penalty records | Partial unique or indexed constraint over invoice, billing account, penalty charge type, penalty period, and duplicate-blocking statuses. |
| Concurrent penalty application | Transaction-time revalidation and row-level/advisory locks for affected invoice, penalty run, or penalty source records where needed. |
| Duplicate waiver impact | Unique idempotency key based on approval request and target penalty source record. |
| Reissue race | Transaction-time prior source record status revalidation and linkage checks. |
| Duplicate reminder intent | Unique or indexed constraint over reminder scope and reminder period. |
| Partial financial commit | Per-record transaction boundary for penalty/waiver source record, balance-impact facts, and audit references where practical. |

No distributed lock service is introduced for UOW-06. PostgreSQL is the locking and consistency boundary for MVP.

## Candidate Generation Infrastructure

Penalty candidate generation uses the existing API container for first-scope manual generation. Candidate generation is designed to be background-capable for later scheduling through existing worker or job infrastructure when UOW-08 owns job orchestration.

No dedicated UOW-06 worker is added now. Candidate generation must return per-candidate success, warning, or error detail and must not create applied penalty financial records until staff performs an approved apply action.

## Financial Mutation Infrastructure

Penalty application and waiver approval execution run synchronously in the existing API container for first-scope load. Each penalty or waiver is committed in its own transaction. Batch actions may process selected records and return per-record results.

No UOW-06 queue or worker is added for financial mutation. If future volume exceeds first-scope limits, a later approved infrastructure design can introduce asynchronous processing.

## Backup And Restore

UOW-06 data must be included in the existing encrypted PostgreSQL backup and staging restore rehearsal:

- penalty runs;
- penalty source records;
- waiver requests;
- waiver source records;
- reminder eligibility records and snapshots;
- reminder intents;
- penalty-side and waiver-side balance-impact facts;
- approval references;
- audit references.

UOW-06 has no file storage infrastructure. Reminder document rendering, file storage, email delivery, and retry artifacts are UOW-08 responsibilities once concrete support adapters exist.

## Logging And Monitoring

UOW-06 uses existing structured logs, shared log storage, metrics, and dashboards.

| Category | Signals |
|---|---|
| Overdue evaluation | Evaluation count, duration, failure code, source-fact failure categories. |
| Aging classification | Classification count, bucket distribution, failure code. |
| Penalty run | Candidate generation started/completed, duration, candidate count, blocked count. |
| Duplicate penalty guard | Duplicate block count, duplicate key category, reissue/correction conflict count. |
| Penalty application | Applied count, failure count, transaction duration, per-record batch results. |
| Waiver lifecycle | Request, approval, rejection, idempotent replay, failure code. |
| Reminder suppression | Eligible count, suppressed count, suppression reason, missing contact path count. |
| Authorization | Denied access and suspicious attempts. |
| Support intents | Reminder intent creation and support failure counts. |

Logs must use safe identifiers and redacted payloads. Full PII, reminder payloads, email recipient payloads, sensitive contact data, and complete delinquency payloads must not be logged.

## Alert Requirements

| Alert | Purpose |
|---|---|
| Repeated authorization denials | Detect potential access abuse or misconfiguration. |
| Overdue evaluation failure spike | Detect source-fact, configuration, or query regressions. |
| Penalty candidate generation failure spike | Detect candidate generation or dependency failures. |
| Duplicate penalty conflict spike | Detect duplicate run attempts or uniqueness/locking issues. |
| Penalty application failure spike | Detect transaction, validation, or source-fact failures. |
| Waiver approval/idempotency failure spike | Detect approval replay or waiver persistence defects. |
| Reminder suppression/contact-path anomaly | Detect missing contact path or suppression configuration problems. |
| Support-intent failure spike | Detect support adapter contract or persistence issues. |
| Database health | Protect financial source-record persistence. |
| Backup failure | Protect recovery posture. |
| Restore verification failure | Protect production readiness evidence. |

## Network And Route Exposure

| Area | Decision |
|---|---|
| Public entry | Existing Caddy reverse proxy only. |
| Public ports | No new UOW-06 public ports. |
| API routes | Exposed through existing API container behind reverse proxy. |
| Frontend routes | Exposed through existing web container behind reverse proxy. |
| Database | PostgreSQL remains private and is never directly exposed. |
| Staff tools | Must use authorized application routes, not direct database access. |

## Secrets And Configuration

UOW-06 uses the existing typed configuration and secrets pattern. No UOW-06-specific secret files are introduced now.

Allowed non-secret configuration examples:

- penalty run batch size;
- candidate generation timeout;
- duplicate/reissue window;
- reminder suppression default window;
- HOA business timezone setting;
- penalty review page size.

Committed environment files must not contain secrets.

## Reminder Support Boundary

| Capability | UOW-06 Infrastructure Decision |
|---|---|
| Reminder eligibility | Persist eligibility snapshot or source facts in PostgreSQL. |
| Reminder intent | Persist intent in PostgreSQL through UOW-01 support contracts. |
| Reminder rendering | UOW-08, not UOW-06. |
| Reminder email delivery | UOW-08, not UOW-06. |
| Reminder file storage | UOW-08, not UOW-06. |
| Retry workers | UOW-08, not UOW-06. |
| Queues for reminder processing | Not introduced in UOW-06. |

## Security Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-01 | Compliant | UOW-06 uses shared encrypted storage and PostgreSQL backup/restore controls. |
| SECURITY-02 | Compliant | UOW-06 routes remain behind shared reverse proxy access logging. |
| SECURITY-03 | Compliant | UOW-06 uses shared structured logging and log storage. |
| SECURITY-04 | Compliant | UOW-06 does not add separate public endpoint infrastructure. |
| SECURITY-05 | Compliant | UOW-06 relies on API validation and private database access. |
| SECURITY-06 | Compliant | Database access remains through least-privileged runtime roles. |
| SECURITY-07 | Compliant | No direct PostgreSQL or new public port exposure. |
| SECURITY-08 | Compliant | UOW-06 uses backend authorization and object/scope controls. |
| SECURITY-09 | Compliant | UOW-06 uses shared secrets and production readiness gates. |
| SECURITY-10 | Compliant | No new supply-chain surface beyond existing stack. |
| SECURITY-11 | Compliant | UOW-06 security-critical behavior remains in domain/API components. |
| SECURITY-12 | Compliant | UOW-06 uses UOW-01 auth/session/approval/audit infrastructure. |
| SECURITY-13 | Compliant | UOW-06 source records are covered by backup, restore, and audit controls. |
| SECURITY-14 | Compliant | UOW-06 adds monitoring and alert categories. |
| SECURITY-15 | Compliant | UOW-06 fail-closed behavior is supported by API and database controls. |

## PBT Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| PBT-01 through PBT-10 | N/A for Infrastructure Design | This stage does not create PBT code. UOW-06 PBT requirements remain enforced in NFR Design and Code Generation. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
