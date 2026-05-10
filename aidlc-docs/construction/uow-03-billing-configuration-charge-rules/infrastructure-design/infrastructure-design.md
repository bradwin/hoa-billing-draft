# UOW-03 Infrastructure Design

## Unit

- **Unit ID**: UOW-03
- **Unit Name**: Billing Configuration and Charge Rules
- **Stage**: Infrastructure Design

## Summary

UOW-03 uses the shared UOW-01 single-host Docker Compose infrastructure. It adds billing configuration, charge rule, effective-dated version, approval-reference, audit, resolution-read, and staff configuration UI persistence inside the existing PostgreSQL database and exposes UOW-03 features through the existing web and API containers. No new deployable service, public port, cache, search service, rule engine, queue, file storage, email service, document service, support job infrastructure, import service, or separate backup process is introduced for UOW-03.

UOW-03 supplies immutable configuration versions and side-effect-free resolution snapshots. It does not create invoices, invoice lines, balances, payments, penalties, credits, adjustments, statements, reports, documents, emails, support jobs, or import batches. It does not calculate actual invoice amounts for a property and does not automatically calculate tax-like charges.

## Approved Infrastructure Decisions

| Area | Approved Decision |
|---|---|
| Deployment model | Reuse the UOW-01 shared single-host Docker Compose deployment with no new UOW-03 deployable services. |
| Database deployment | Apply UOW-03 tables, indexes, constraints, grants, and immutable version/audit support through the existing PostgreSQL migration path, with staging migration rehearsal and rollback planning before production. |
| Resolution lookup infrastructure | Use PostgreSQL indexed effective-date lookups by configuration identity, scope, rule type, status, and effective interval; no external cache, search service, or rule engine. |
| Concurrency infrastructure | Use PostgreSQL transactions, row-level locking or equivalent conflict detection, and persistence-level non-overlap guards where practical; no distributed lock service. |
| Backup and restore | Include all UOW-03 configuration, version, approval-reference, audit, and read-model data in the existing encrypted PostgreSQL backup and staging restore rehearsal; no separate file storage. |
| Logging and monitoring | Use existing structured logs, Loki-equivalent storage, Prometheus/Grafana-equivalent metrics, and dashboards with UOW-03-specific categories and metrics. |
| Alerts | Add coverage for repeated authorization denials, missing/ambiguous resolution spikes, activation conflict spikes, immutable violation attempts, failed approval activation, risky manual tax-like charge config changes, database health, backup failure, and restore verification failure. |
| Route exposure | Serve UOW-03 frontend and API routes through the existing web/API containers and Caddy reverse proxy, with no new public ports and no direct PostgreSQL exposure. |
| Secrets and config | Use the existing typed configuration and secrets pattern; add only non-secret UOW-03 thresholds or flags unless a later implementation proves a secret is required. |
| Background jobs and messaging | No new queue, worker job, or messaging infrastructure for UOW-03; activation and resolution remain synchronous API/database workflows. |
| Shared infrastructure | Update shared infrastructure only to record UOW-03 use of the shared stack, PostgreSQL/index/audit/version coverage, and UOW-03 monitoring/alert additions. |

## Service Mapping

| UOW-03 Capability | Infrastructure Mapping | Notes |
|---|---|---|
| Configuration draft APIs | Existing `api` container | Uses UOW-01 authentication, authorization, correlation, validation, logging, audit, and approval contracts. |
| Approval activation APIs | Existing `api` container and PostgreSQL | Uses PostgreSQL transactions and UOW-01 Approval Workflow references. |
| Version timeline management | Existing `api` container and PostgreSQL | Uses indexed effective intervals, immutable active versions, and non-overlap guards where practical. |
| Resolution services | Existing `api` container and PostgreSQL | Side-effect-free typed DTO resolution for downstream units. |
| Staff configuration UI | Existing `web` container | Server-authorized staff screens, version history, approval state, and resolution preview. |
| UOW-03 audit entries | UOW-01 audit store in PostgreSQL | Audit entries remain append-only under UOW-01 audit controls and database role restrictions. |
| UOW-03 observability | Existing log and metrics stack | Adds UOW-03 event categories, counters, dashboards, and alerts. |

## Database Infrastructure

UOW-03 uses the existing PostgreSQL 16 or later container on the private data network. Production PostgreSQL remains inaccessible from public interfaces and uses the shared production TLS, encryption, role, backup, and monitoring controls.

### Schema and Migration Requirements

| Requirement | Infrastructure Design |
|---|---|
| Migration path | UOW-03 schema changes are deployed through the established migration/admin role, not runtime table creation. |
| Staging rehearsal | UOW-03 migrations must be rehearsed in staging before production. |
| Rollback planning | Migration plans must identify reversible steps or explicit forward-fix strategy for indexes, constraints, immutable version data, and approval/audit references. |
| Runtime least privilege | Runtime API/worker roles receive only required grants and must not receive broad schema ownership or audit update/delete privileges. |
| Audit immutability | UOW-03 audit entries inherit UOW-01 append-only controls and backup verification expectations. |

### Required Index and Constraint Areas

Exact DDL belongs to Code Generation, but infrastructure capacity and migration design must account for these areas:

| Area | Required PostgreSQL Support |
|---|---|
| Configuration drafts | Indexes for draft status, configuration type, scope, creator, approval request ID, and updated timestamp. |
| Configuration versions | Indexes for configuration identity, scope key, rule type, status, effective interval, source draft ID, and approval request ID. |
| Effective-date lookup | Indexed lookup by configuration identity, scope, rule type, status, and effective interval. |
| Non-overlap | Persistence-level non-overlap guard where practical for active versions with the same configuration identity, scope, and rule type. |
| Rate rules | Version-linked rate metadata with decimal precision support. |
| Due/grace and cycle rules | Version-linked deterministic period and date metadata. |
| Charge type catalog | Indexed charge type identity, category, eligibility flags, active status, and effective period. |
| Numbering/template/payment catalogs | Indexed document/template/payment identity, active status, and effective period. |
| Audit correlation | Audit and security-event queries by correlation ID, actor, event type, resource reference, and timestamp. |

### Concurrency and Transaction Controls

Activation and version timeline changes must use PostgreSQL transactions and conflict detection. Where practical, the design should use row-level locking, exclusion constraints, unique constraints, or equivalent persistence-level guards to protect half-open interval semantics and immutable active versions.

Activation must reject last-writer-wins behavior. A conflicting activation for the same configuration identity, scope, and rule type fails safely with a stable conflict error and correlation ID.

## Resolution Lookup Infrastructure

UOW-03 resolution remains PostgreSQL-backed:

- Effective-dated configuration records are stored in typed tables or typed persistence models.
- Exact identity/scope/rule-type/status filters use indexed lookup paths.
- Resolution services return typed DTOs or reason-coded failures.
- Batch consumers may reuse a resolved snapshot only for identical resolution context within their transaction or run.
- External caches, Redis, search services, rule engines, and downstream raw-table access are out of scope for UOW-03.

This is a deliberate correctness decision. Configuration ambiguity is financially dangerous; adding cache invalidation or a rule engine before there is evidence of need increases audit and consistency risk.

## Network and Exposure

| Network Area | UOW-03 Requirement |
|---|---|
| Public ingress | Existing Caddy reverse proxy on ports 80 and 443 only. |
| Web routes | Existing `web` container behind Caddy. |
| API routes | Existing `api` container behind Caddy. |
| PostgreSQL | Private data network only; no public host binding. |
| Observability | Existing private observability network and restricted dashboard access. |
| Staff tools | No direct database access for configuration staff tools. Staff access must go through authorized application APIs. |

UOW-03 must not introduce a public port, direct database access path, separate API edge, rule-engine service, cache service, queue service, or ad hoc administrative interface.

## Logging and Monitoring

UOW-03 uses the shared structured logging and metrics stack. Logs must contain correlation ID, actor reference where safe, component, action, result, version/rule identifiers where safe, and safe diagnostic fields. Full sensitive payloads, bank/payment instructions, secrets, tokens, and unrestricted configuration data must not be logged.

### Required UOW-03 Log Categories

| Category | Examples |
|---|---|
| Draft lifecycle | Draft create/update, submit for approval, reject, copy from rejected draft. |
| Approval activation | Approval verified, activation success, activation rejected, missing approval. |
| Version timeline | Effective-date conflict, non-overlap rejection, supersession, immutable violation attempt. |
| Resolution | Missing configuration, ambiguous configuration, draft-only requested by downstream unit, successful resolution. |
| Charge type catalog | Manual tax-like charge type configuration change, automatic/manual eligibility change. |
| Numbering/template/payment metadata | Metadata change and activation events. |
| Authorization | Denied staff access, denied preview, denied activation, denied history access. |
| Validation | Decimal precision failure, invalid effective date, unsupported automatic tax-like computation. |

### Required Metrics and Dashboards

| Metric Area | Purpose |
|---|---|
| Resolution latency and failure count | Detect missing or ambiguous configuration before later financial units depend on it. |
| Draft volume and activation latency | Detect stuck drafts, approval bottlenecks, and unusual change volume. |
| Activation conflict count | Detect race conditions or broken non-overlap assumptions. |
| Immutable violation attempts | Detect suspicious or buggy attempts to mutate active versions. |
| Manual tax-like charge config changes | Highlight risky configuration that affects later invoice line behavior. |
| Authorization denial count | Detect suspicious access patterns and policy regressions. |
| Database locks and slow queries | Detect concurrency and index problems in effective-dated configuration tables. |
| Backup and restore status | Confirm UOW-03 data remains covered by shared recovery controls. |

## Alerts

UOW-03 adds alert coverage through the shared monitoring stack.

| Alert | Minimum Trigger Intent |
|---|---|
| Repeated authorization denials | Abnormal rate by actor, role, endpoint, scope, or configuration type. |
| Missing/ambiguous resolution spike | Abnormal count of fail-closed resolution results for required configuration. |
| Activation conflict spike | Abnormal non-overlap, lock, or conflict errors during activation. |
| Immutable violation attempt | Any attempt to update activated configuration in place. |
| Failed approval activation | Repeated activation attempts without valid approval or with mismatched approval reference. |
| Risky manual tax-like charge config change | Any activation or eligibility change for manual tax-like charge types. |
| Database health | Slow queries, lock contention, connection pressure, or disk pressure affecting UOW-03 tables. |
| Backup failure | Any failed scheduled PostgreSQL backup or missed backup window. |
| Restore verification failure | Any failed staging restore rehearsal or audit/configuration verification. |

Threshold values belong to Code Generation and Build/Test configuration, but the alert categories are required design outputs.

## Backup and Restore

UOW-03 data is PostgreSQL-resident and must be included in the existing encrypted database backup process.

| Data Area | Backup Requirement | Restore Requirement |
|---|---|---|
| Configuration drafts | Included in daily encrypted PostgreSQL logical backup. | Restored with status, actor, approval request, remarks, and correlation data intact. |
| Configuration versions | Included in daily encrypted PostgreSQL logical backup. | Restored with immutable active versions, half-open effective intervals, and source draft references intact. |
| Rule tables/catalogs | Included in daily encrypted PostgreSQL logical backup. | Restored with rate, cycle, due/grace, rounding, charge type, numbering, template, and payment metadata intact. |
| Approval references | Included through UOW-01 approval data and UOW-03 version references. | Restore verifies activation records still link to approval references where required. |
| Audit entries | Included through shared audit backup controls. | Restore rehearsal includes audit hash-chain verification and UOW-03 activation audit sampling. |
| Resolution read models | Included if persisted in PostgreSQL; rebuild instructions required if derived. | Restored or rebuilt consistently before production cutover. |

UOW-03 does not require separate file storage. If a later unit renders documents, sends emails, imports batches, or stores exported files, that later unit must define file storage and backup requirements.

## Secrets and Configuration

UOW-03 should not introduce new production secrets by default.

Allowed configuration includes:

- Resolution latency SLO thresholds.
- Maximum page size for version history and catalog lists.
- Alert thresholds for UOW-03 event categories.
- Feature flags for future approved configuration behavior, disabled by default.
- Optional preview-only toggles for staff screens, if safe and server-authorized.

Configuration must use the existing typed configuration mechanism. Real secrets remain mounted through Compose secrets or root-owned files outside the repository.

## Background Jobs and Messaging

UOW-03 does not require queue, worker, or messaging infrastructure.

| Area | Decision |
|---|---|
| Activation | Synchronous API/database transaction. |
| Resolution | Synchronous side-effect-free API/domain query. |
| Cache invalidation | Not applicable because no external cache is introduced. |
| Downstream source records | Owned by later units, not UOW-03. |
| Notifications/documents/jobs | Out of scope until later support units. |

If later units require job dispatch or support adapters, they must use the shared support intent or UOW-08-owned infrastructure rather than adding UOW-03-owned messaging.

## Production Readiness Requirements

UOW-03 cannot be used with real billing configuration until the shared production readiness gate remains satisfied and these UOW-03 checks pass:

- UOW-03 migrations rehearsed in staging.
- PostgreSQL indexes and query plans verified for expected resolution lookup paths.
- Effective-date non-overlap constraints or conflict guards verified against overlapping, adjacent, and open-ended intervals.
- Runtime database grants verified as least privilege.
- UOW-03 audit entries verified as append-only under runtime roles.
- UOW-03 data included in encrypted backup and staging restore rehearsal.
- UOW-03 alerts configured in the shared monitoring stack.
- UOW-03 logs verified for sensitive payload redaction.
- API routes exposed only through the existing reverse proxy.
- No new public ports, rule engine, external cache, search service, queue, file store, email service, document service, support job infrastructure, or import service introduced by UOW-03.

## Deferred to Code Generation

- Exact Prisma schema, migrations, indexes, and constraints.
- Exact PostgreSQL locking, exclusion constraint, or conflict-detection implementation.
- Exact API route names and frontend route wiring.
- Exact resolution DTO shapes and persistence mapping.
- Exact dashboard panels, metrics names, and alert thresholds.
- Exact backup verification scripts and smoke tests.

## Security Baseline Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-01 | Compliant | UOW-03 inherits encrypted PostgreSQL volumes, logs, and backup storage from the shared infrastructure baseline. |
| SECURITY-02 | Compliant | UOW-03 routes are exposed only through the existing reverse proxy with access logging. |
| SECURITY-03 | Compliant | Structured logs, correlation IDs, redaction, and shared log storage are required. |
| SECURITY-04 | Compliant by inheritance | UOW-03 uses the existing web/API security middleware and reverse proxy controls. |
| SECURITY-05 | Compliant | Database-backed validation, bounded queries, migration rehearsal, and persistence-level guards are required. |
| SECURITY-06 | Compliant | Runtime database roles remain least-privileged and cannot mutate audit history. |
| SECURITY-07 | Compliant | UOW-03 introduces no new public ports and keeps PostgreSQL private. |
| SECURITY-08 | Compliant | Staff access remains through authorized application APIs with backend route and object/scope authorization. |
| SECURITY-09 | Compliant | No default credentials or committed secrets are introduced. |
| SECURITY-10 | Compliant | UOW-03 introduces no new infrastructure dependency family. |
| SECURITY-11 | Compliant | Activation, resolution, manual tax-like charge configuration, and authorization denials are treated as security-sensitive paths. |
| SECURITY-12 | Compliant by inheritance | Authentication, sessions, and MFA remain owned by UOW-01. |
| SECURITY-13 | Compliant | UOW-03 version activation, audit, backup, and restore verification are required. |
| SECURITY-14 | Compliant | UOW-03 alert and dashboard categories are defined. |
| SECURITY-15 | Compliant | Fail-closed resolution, recovery requirements, and safe failure boundaries are defined. |

## Property-Based Testing Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| PBT-01 through PBT-10 | N/A for Infrastructure Design | This artifact maps deployment and infrastructure only. UOW-03 PBT enforcement resumes in Code Generation and Build/Test. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
- No application code is generated.
