# UOW-02 Infrastructure Design

## Unit

- **Unit ID**: UOW-02
- **Unit Name**: Homeowner, Property, Ownership, and Contact Requests
- **Stage**: Infrastructure Design

## Summary

UOW-02 uses the shared UOW-01 single-host Docker Compose infrastructure. It adds homeowner, property, ownership, billing-account period, contact request, authorization, audit, and read-model persistence inside the existing PostgreSQL database and exposes UOW-02 features through the existing web and API containers. No new deployable service, public port, search service, cache, queue, file storage, email service, document service, import service, or separate backup process is introduced for UOW-02.

UOW-02 supplies validated master data and effective-dated responsibility facts. It does not create invoices, balances, payments, penalties, credits, adjustments, statements, reports, documents, emails, or import batches. It does not calculate dues, decide proration, or decide transfer-period billing policy.

## Approved Infrastructure Decisions

| Area | Approved Decision |
|---|---|
| Deployment model | Reuse the UOW-01 shared single-host Docker Compose deployment with no new UOW-02 deployable services. |
| Database deployment | Apply UOW-02 tables, indexes, constraints, and grants through the existing PostgreSQL migration path, with staging migration rehearsal and rollback planning before production. |
| Search infrastructure | Use PostgreSQL normalized columns, B-tree indexes, and bounded queries only; no external search service or cache. |
| Concurrency infrastructure | Use PostgreSQL transactions, row-level locking or equivalent conflict detection, and persistence-level non-overlap guards where practical; no distributed lock service. |
| Backup and restore | Include all UOW-02 tables, indexes, constraints, audit entries, and read-model data in the existing encrypted PostgreSQL backup and staging restore rehearsal. |
| Logging and monitoring | Use existing structured logs, Loki-equivalent storage, Prometheus/Grafana-equivalent metrics, and dashboards with UOW-02-specific categories and metrics. |
| Alerts | Add coverage for repeated authorization denials, suspicious search patterns, contact-change volume spikes, ownership/billing-account conflict spikes, validation failure spikes, database health, backup failure, and restore verification failure. |
| Route exposure | Serve UOW-02 frontend and API routes through the existing web/API containers and Caddy reverse proxy; no new public ports and no direct PostgreSQL exposure. |
| Secrets and config | Use the existing typed configuration and secrets pattern; add only non-secret UOW-02 thresholds or flags unless a later implementation proves a secret is required. |
| Shared infrastructure | Update shared infrastructure only to record UOW-02 use of the shared stack, PostgreSQL/index/audit/read-model coverage, and UOW-02 monitoring/alert additions. |

## Service Mapping

| UOW-02 Capability | Infrastructure Mapping | Notes |
|---|---|---|
| Homeowner master APIs | Existing `api` container | Uses UOW-01 authentication, authorization context, correlation, validation, logging, and audit contracts. |
| Property master APIs | Existing `api` container | Uses PostgreSQL-backed normalized identity and alias indexes. |
| Ownership timeline commands | Existing `api` container and PostgreSQL | Uses transactional command handlers with conflict detection and persistence-level non-overlap guards where practical. |
| Billing-account period commands | Existing `api` container and PostgreSQL | Creates periods only for the billing-responsible homeowner and preserves historical effective periods. |
| Billable-property validation | Existing `api` container and PostgreSQL | Pure read operation for property ID and `validationDate`; no side effects or billing-source mutation. |
| Contact change requests | Existing `api` container and PostgreSQL | Pending/Approved/Rejected workflow only; UOW-02 contact email changes do not mutate UOW-01 login email automatically. |
| Staff and homeowner UI | Existing `web` container | Server-authorized data loading and role-filtered response rendering. |
| Search and read models | PostgreSQL indexes and existing `api` container | No external search service, cache, or materialized search service in UOW-02. |
| UOW-02 audit entries | UOW-01 audit store in PostgreSQL | Audit entries remain append-only under UOW-01 audit controls and database role restrictions. |
| UOW-02 observability | Existing log and metrics stack | Adds UOW-02 event categories, counters, dashboards, and alerts. |

## Database Infrastructure

UOW-02 uses the existing PostgreSQL 16 or later container on the private data network. Production PostgreSQL remains inaccessible from public interfaces and uses the shared production TLS, encryption, role, backup, and monitoring controls.

### Schema and Migration Requirements

| Requirement | Infrastructure Design |
|---|---|
| Migration path | UOW-02 schema changes are deployed through the established migration/admin role, not runtime table creation. |
| Staging rehearsal | UOW-02 migrations must be rehearsed in staging before production. |
| Rollback planning | Migration plans must identify reversible steps or explicit forward-fix strategy for indexes, constraints, and data-shaping changes. |
| Runtime least privilege | Runtime API/worker roles receive only required grants and must not receive broad schema ownership or audit update/delete privileges. |
| Audit immutability | UOW-02 audit entries inherit UOW-01 append-only controls and backup verification expectations. |

### Required Index and Constraint Areas

Exact DDL belongs to Code Generation, but infrastructure capacity and migration design must account for these areas:

| Area | Required PostgreSQL Support |
|---|---|
| Homeowner search | Indexes for homeowner code, lifecycle status, normalized name, normalized email, and normalized mobile where stored. |
| Property search | Indexes for property code, canonical identity key, phase or section, block, lot, street, billing status, and lifecycle status. |
| Property aliases | Indexed normalized alias keys resolving to canonical property records. |
| Contact requests | Indexes for requester, target homeowner, request status, submitted timestamp, and decision timestamp. |
| Ownership periods | Constraints and indexes supporting effective-dated lookup and non-overlap validation for primary ownership. |
| Billing-account periods | Constraints and indexes supporting exactly-one effective billing-account period for the responsible homeowner/property period. |
| Billable validation | Indexed lookup by property ID and `validationDate` over effective ownership period, effective billing-account period, property billing status, and homeowner status. |
| Audit correlation | Audit and security-event queries by correlation ID, actor, event type, and timestamp. |

### Concurrency and Transaction Controls

Ownership transfers and billing-account period changes must use PostgreSQL transactions and conflict detection. Where practical, the design should use row-level locking, exclusion constraints, unique constraints, or equivalent persistence-level guards to protect half-open interval semantics.

Transfers close the previous period by setting `effectiveTo` to the transfer effective date and open the new period on that same date. Because periods are half-open, the old period excludes the transfer date and the new period includes it.

## Search Infrastructure

UOW-02 search remains PostgreSQL-backed:

- Normalized text/search keys are stored in PostgreSQL.
- Exact/status/date filters use B-tree indexes.
- Every search endpoint requires bounded pagination.
- Sensitive search filters require backend authorization and minimum filter rules.
- External search services, caches, Redis, and new queue services are out of scope for UOW-02.

This is a deliberate capacity decision for the approved first scope. If measured search latency fails approved SLOs after correct indexes and query plans are applied, requirements must be reopened before adding search or cache infrastructure.

## Network and Exposure

| Network Area | UOW-02 Requirement |
|---|---|
| Public ingress | Existing Caddy reverse proxy on ports 80 and 443 only. |
| Web routes | Existing `web` container behind Caddy. |
| API routes | Existing `api` container behind Caddy. |
| PostgreSQL | Private data network only; no public host binding. |
| Observability | Existing private observability network and restricted dashboard access. |
| Staff tools | No direct database access for staff tools. Staff access must go through authorized application APIs. |

UOW-02 must not introduce a public port, direct database access path, separate API edge, or ad hoc administrative interface.

## Logging and Monitoring

UOW-02 uses the shared structured logging and metrics stack. Logs must contain correlation ID, actor reference where safe, component, action, result, and safe diagnostic fields. Raw PII, secrets, session data, and unrestricted contact values must not be logged.

### Required UOW-02 Log Categories

| Category | Examples |
|---|---|
| Master data mutation | Homeowner create/update, property create/update, property alias change, billable-impacting field change. |
| Duplicate review | Candidate generated, candidate confirmed distinct, duplicate conflict rejected. |
| Ownership timeline | Transfer attempt, transfer success, overlap conflict, concurrent edit conflict. |
| Billing-account period | Period creation, period closure, duplicate effective period conflict. |
| Billable validation | Reason-coded validation failure, ambiguous responsibility, missing effective account period. |
| Contact change | Submission, approval, rejection, invalid transition attempt. |
| Authorization | Denied staff access, denied homeowner own-resource access, Board Member PII minimization enforcement. |
| Search abuse signal | Broad search denied, repeated sensitive search, unusual query volume. |

### Required Metrics and Dashboards

| Metric Area | Purpose |
|---|---|
| Search latency and result counts | Detect slow indexed searches, broad queries, and capacity pressure. |
| Duplicate candidate volume | Detect unusual duplicate review load and quality issues in normalized data. |
| Ownership conflict count | Detect overlap attempts, race conflicts, and risky transfer activity. |
| Billable validation failures | Detect master-data issues before later billing units create source records. |
| Contact request volume and decision latency | Detect abuse, support load, or stuck approvals. |
| Authorization denial count | Detect suspicious access patterns and policy regressions. |
| Database locks and slow queries | Detect concurrency and index problems in effective-dated tables. |
| Backup and restore status | Confirm UOW-02 data remains covered by shared recovery controls. |

## Alerts

UOW-02 adds alert coverage through the shared monitoring stack.

| Alert | Minimum Trigger Intent |
|---|---|
| Repeated authorization denials | Abnormal rate by actor, role, endpoint, or object type. |
| Suspicious search patterns | Repeated broad searches, sensitive filters, or high-volume enumeration-like access. |
| Contact-change volume spike | Abnormal submission or decision volume for one actor, homeowner, or time window. |
| Ownership/billing-account conflict spike | Abnormal overlap, duplicate period, or concurrency conflict rate. |
| Billable validation failure spike | Abnormal missing/ambiguous effective ownership or billing-account facts. |
| Database health | Slow queries, lock contention, connection pressure, or disk pressure affecting UOW-02 tables. |
| Backup failure | Any failed scheduled PostgreSQL backup or missed backup window. |
| Restore verification failure | Any failed staging restore rehearsal or audit verification. |

Threshold values belong to Code Generation and Build/Test configuration, but the alert categories are required design outputs.

## Backup and Restore

UOW-02 data is PostgreSQL-resident and must be included in the existing encrypted database backup process.

| Data Area | Backup Requirement | Restore Requirement |
|---|---|---|
| Homeowner master records | Included in daily encrypted PostgreSQL logical backup. | Restored in staging and covered by application smoke tests. |
| Property master records and aliases | Included in daily encrypted PostgreSQL logical backup. | Restored with indexes and alias relationships intact. |
| Ownership periods | Included in daily encrypted PostgreSQL logical backup. | Restored with half-open period semantics and non-overlap guards intact. |
| Billing-account periods | Included in daily encrypted PostgreSQL logical backup. | Restored with historical effective billing responsibility intact. |
| Contact change requests | Included in daily encrypted PostgreSQL logical backup. | Restored with Pending/Approved/Rejected terminal-state integrity intact. |
| Audit entries | Included through shared audit backup controls. | Restore rehearsal includes audit hash-chain verification. |
| Search/read-model data | Included if persisted in PostgreSQL; rebuild instructions required if derived. | Restored or rebuilt consistently before production cutover. |

UOW-02 does not require separate file storage. If a later unit attaches documents, emails, imports, exports, or generated statements, that unit must define file storage and backup requirements.

## Secrets and Configuration

UOW-02 should not introduce new production secrets by default.

Allowed configuration includes:

- Search page-size limits.
- Sensitive-search minimum filter thresholds.
- Contact-change submission rate or volume thresholds.
- Alert thresholds for UOW-02 event categories.
- Feature flags for future approved exception workflows, if disabled by default.

Configuration must use the existing typed configuration mechanism. Real secrets remain mounted through Compose secrets or root-owned files outside the repository.

## Production Readiness Requirements

UOW-02 cannot be used with real homeowner or billing-responsibility records until the shared production readiness gate remains satisfied and these UOW-02 checks pass:

- UOW-02 migrations rehearsed in staging.
- PostgreSQL indexes and query plans verified for expected search and validation paths.
- Ownership and billing-account period constraints verified against overlap and adjacent half-open interval cases.
- Runtime database grants verified as least privilege.
- UOW-02 audit entries verified as append-only under runtime roles.
- UOW-02 data included in encrypted backup and staging restore rehearsal.
- UOW-02 alerts configured in the shared monitoring stack.
- UOW-02 logs verified for PII redaction.
- API routes exposed only through the existing reverse proxy.
- No new public ports, external search service, cache, queue, file store, email service, document service, or import service introduced by UOW-02.

## Deferred to Code Generation

- Exact Prisma schema, migrations, indexes, and constraints.
- Exact PostgreSQL locking, exclusion constraint, or conflict-detection implementation.
- Exact API route names and frontend route wiring.
- Exact dashboard panels, metrics names, and alert thresholds.
- Exact backup verification scripts and smoke tests.

## Security Baseline Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-01 | Compliant | UOW-02 inherits encrypted PostgreSQL volumes, logs, and backup storage from the shared infrastructure baseline. |
| SECURITY-02 | Compliant | UOW-02 routes are exposed only through the existing reverse proxy with access logging. |
| SECURITY-03 | Compliant | Structured logs, correlation IDs, redaction, and shared log storage are required. |
| SECURITY-04 | Compliant by inheritance | UOW-02 uses the existing web/API security middleware and reverse proxy controls. |
| SECURITY-05 | Compliant | Database-backed validation, bounded queries, migration rehearsal, and persistence-level guards are required. |
| SECURITY-06 | Compliant | Runtime database roles remain least-privileged and cannot mutate audit history. |
| SECURITY-07 | Compliant | UOW-02 introduces no new public ports and keeps PostgreSQL private. |
| SECURITY-08 | Compliant | Staff and homeowner access remains through authorized application APIs with PII-minimized read models. |
| SECURITY-09 | Compliant | No default credentials or committed secrets are introduced. |
| SECURITY-10 | Compliant | UOW-02 introduces no new infrastructure dependency family. |
| SECURITY-11 | Compliant | Search, duplicate review, ownership transfer, contact changes, and authorization denials are treated as security-sensitive paths. |
| SECURITY-12 | Compliant by inheritance | Authentication, sessions, and MFA remain owned by UOW-01. |
| SECURITY-13 | Compliant | UOW-02 master-data mutations and responsibility changes are auditable and covered by backup/restore. |
| SECURITY-14 | Compliant | UOW-02 event categories, metrics, dashboards, and alerts are required. |
| SECURITY-15 | Compliant | Fail-closed validation, database health monitoring, backups, and restore verification are required. |

## Property-Based Testing Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| PBT-01 through PBT-10 | N/A for Infrastructure Design | This artifact does not create application test code. UOW-02 PBT requirements remain carried by NFR Design, Code Generation, and Build/Test. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
