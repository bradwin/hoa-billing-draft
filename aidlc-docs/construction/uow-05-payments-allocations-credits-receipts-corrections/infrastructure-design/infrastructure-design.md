# UOW-05 Infrastructure Design

## Unit

- **Unit ID**: UOW-05
- **Unit Name**: Payments, Allocations, Credits, Receipts, and Financial Corrections
- **Stage**: Infrastructure Design

## Infrastructure Decision Summary

UOW-05 uses the existing single-host Docker Compose deployment established by UOW-01. No new deployable service, public port, distributed lock service, queue, worker, file storage, PDF renderer, SMTP service, or import processor is added for UOW-05.

UOW-05 relies on PostgreSQL for financial source records, transaction boundaries, uniqueness constraints, indexes, and lock-supported operations. Proof file storage, receipt PDF rendering, SMTP delivery, retry workers, and downloads remain UOW-08 responsibilities.

## Service Mapping

| Logical Area | Infrastructure Mapping |
|---|---|
| Payment proof APIs | Existing API container. |
| Payment posting APIs | Existing API container with PostgreSQL transactions. |
| Allocation, credit, receipt, reversal, and correction APIs | Existing API container with PostgreSQL transactions and constraints. |
| Staff and homeowner UOW-05 views | Existing web container. |
| PostgreSQL data | Existing PostgreSQL service and encrypted database volume. |
| Logs | Existing structured logging and shared log storage. |
| Metrics and dashboards | Existing Prometheus/Grafana-equivalent monitoring stack. |
| Support intents | Existing UOW-01 support contract persistence in PostgreSQL. |
| Backups and restore | Existing encrypted PostgreSQL backup and staging restore rehearsal process. |

## Database Infrastructure

UOW-05 database changes must be deployed through the existing migration path. Runtime table creation during first payment posting is prohibited.

| Data Area | PostgreSQL Structures |
|---|---|
| Payment proofs | Proof table, status index, billing account/property/homeowner indexes, duplicate-risk indexes. |
| Posted payments | Payment table, status/lifecycle facts, duplicate-risk indexes, proof reference, billing account/property/homeowner indexes. |
| Allocations | Allocation table, invoice/component/payment indexes, open-amount validation support. |
| Credits | Credit source table, credit application table, billing account/property indexes, credit availability query support. |
| Receipts | Receipt table, unique receipt number constraint, receipt snapshot table, payment and billing account indexes. |
| Reversals | Reversal table, unique reversal-per-payment constraint, approval reference, balance-impact reversal facts. |
| Corrections | Correction source table, source-record indexes, approval reference, balance-impact facts. |
| Balance-impact facts | Source-record, billing account, property, invoice, effective date, and correlation indexes. |
| Support intents | Proof attachment reference/intent and receipt document/email intent records. |
| Audit references | Correlation IDs and audit references connected to UOW-01 audit records. |

## Transaction And Locking Infrastructure

| Risk | Infrastructure Control |
|---|---|
| Duplicate payment posting | Indexed duplicate-risk lookup and transaction-time revalidation. |
| Over-allocation | Transaction-time recomputation and row-level/advisory locks for affected invoice/component/payment records where needed. |
| Duplicate credit application | Transaction-time credit availability validation and locks for affected credit records. |
| Duplicate reversal | Unique reversal-per-payment constraint and idempotent command handling. |
| Duplicate receipt number | Receipt numbering scope lock and unique receipt-number constraint. |
| Partial financial commit | Per-payment transaction boundary for payment, allocations, credits, receipt, balance-impact facts, and audit references where practical. |

No distributed lock service is introduced for UOW-05. PostgreSQL is the locking and consistency boundary for MVP.

## Posting Infrastructure

Payment posting runs synchronously in the existing API container for first-scope load. Each payment is committed in its own transaction. Batch posting may process selected payments and return per-payment results.

No UOW-05 queue or worker is added for payment posting. If future volume exceeds first-scope limits, a later approved infrastructure design can introduce asynchronous processing.

## Backup And Restore

UOW-05 data must be included in the existing encrypted PostgreSQL backup and staging restore rehearsal:

- payment proofs;
- posted payments;
- allocations;
- credits;
- credit applications;
- receipts;
- receipt snapshots;
- reversals;
- corrections;
- balance-impact facts;
- support intents and attachment references;
- approval references;
- audit references.

UOW-05 has no file storage infrastructure. Proof attachment binary storage and receipt PDF files are UOW-08 responsibilities once concrete support adapters exist.

## Logging And Monitoring

UOW-05 uses existing structured logs, shared log storage, metrics, and dashboards.

| Category | Signals |
|---|---|
| Proof lifecycle | Submitted, reviewed, rejected, cancelled, posted, validation failures. |
| Duplicate review | Candidate counts, override requests, override decisions, safe failure codes. |
| Posting | Posting started/completed, posting duration, failure code, per-payment batch results. |
| Allocation | Allocation conflict counts, open-amount validation failures, manual allocation failures. |
| Credits | Credit creation, application, availability validation failures. |
| Receipts | Receipt creation, receipt numbering conflicts, snapshot creation. |
| Reversals and corrections | Request, approval, denial, execution success/failure. |
| Authorization | Denied access and suspicious attempts. |
| Support intents | Proof attachment references, receipt document intents, receipt email intents, support failure counts. |

Logs must use safe identifiers and redacted payloads. Full PII, proof payloads, attachment contents, payment account details, and recipient payloads must not be logged.

## Alert Requirements

| Alert | Purpose |
|---|---|
| Repeated authorization denials | Detect potential access abuse or misconfiguration. |
| Proof submission failure spike | Detect validation or API health regressions. |
| Duplicate override spike | Detect duplicate payment risk or staff process issues. |
| Posting failure spike | Detect posting transaction or dependency failures. |
| Allocation conflict spike | Detect concurrency or open-amount calculation issues. |
| Credit application failure spike | Detect credit availability or concurrency issues. |
| Receipt numbering conflict | Detect receipt scope locking or uniqueness problems. |
| Reversal/correction failure spike | Detect approval or source-record correction failures. |
| Support-intent failure spike | Detect support adapter contract or persistence issues. |
| Database health | Protect financial source-record persistence. |
| Backup failure | Protect recovery posture. |
| Restore verification failure | Protect production readiness evidence. |

## Network And Route Exposure

| Area | Decision |
|---|---|
| Public entry | Existing Caddy reverse proxy only. |
| Public ports | No new UOW-05 public ports. |
| API routes | Exposed through existing API container behind reverse proxy. |
| Frontend routes | Exposed through existing web container behind reverse proxy. |
| Database | PostgreSQL remains private and is never directly exposed. |
| Staff tools | Must use authorized application routes, not direct database access. |

## Secrets And Configuration

UOW-05 uses the existing typed configuration and secrets pattern. No UOW-05-specific secret files are introduced now.

Allowed non-secret configuration examples:

- posting batch size;
- duplicate review window;
- posting timeout;
- proof review page size;
- receipt numbering conflict retry limit.

Committed environment files must not contain secrets.

## Support Service Boundary

| Capability | UOW-05 Infrastructure Decision |
|---|---|
| Proof attachment reference/intent | Persist metadata or intent in PostgreSQL through UOW-01 support contracts. |
| Proof file storage | UOW-08, not UOW-05. |
| Receipt PDF rendering | UOW-08, not UOW-05. |
| Receipt file storage | UOW-08, not UOW-05. |
| Receipt email delivery | UOW-08, not UOW-05. |
| Retry workers | UOW-08, not UOW-05. |
| Queues for support processing | Not introduced in UOW-05. |

## Security Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-01 | Compliant | UOW-05 uses shared encrypted storage and PostgreSQL backup/restore controls. |
| SECURITY-02 | Compliant | UOW-05 routes remain behind shared reverse proxy access logging. |
| SECURITY-03 | Compliant | UOW-05 uses shared structured logging and log storage. |
| SECURITY-04 | Compliant | UOW-05 does not add separate public endpoint infrastructure. |
| SECURITY-05 | Compliant | UOW-05 relies on API validation and private database access. |
| SECURITY-06 | Compliant | Database access remains through least-privileged runtime roles. |
| SECURITY-07 | Compliant | No direct PostgreSQL or new public port exposure. |
| SECURITY-08 | Compliant | UOW-05 uses backend authorization and object/scope controls. |
| SECURITY-09 | Compliant | UOW-05 uses shared secrets and production readiness gates. |
| SECURITY-10 | Compliant | No new supply-chain surface beyond existing stack. |
| SECURITY-11 | Compliant | UOW-05 security-critical behavior remains in domain/API components. |
| SECURITY-12 | Compliant | UOW-05 uses UOW-01 auth/session/approval/audit infrastructure. |
| SECURITY-13 | Compliant | UOW-05 source records are covered by backup, restore, and audit controls. |
| SECURITY-14 | Compliant | UOW-05 adds monitoring and alert categories. |
| SECURITY-15 | Compliant | UOW-05 fail-closed behavior is supported by API and database controls. |

## PBT Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| PBT-01 through PBT-10 | N/A for Infrastructure Design | This stage does not create PBT code. UOW-05 PBT requirements remain enforced in NFR Design and Code Generation. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
