# UOW-03 Deployment Architecture

## Unit

- **Unit ID**: UOW-03
- **Unit Name**: Billing Configuration and Charge Rules
- **Stage**: Infrastructure Design

## Deployment Summary

UOW-03 deploys as additional application routes, modules, database tables, indexes, constraints, version data, metrics, logs, alerts, and staff frontend features inside the shared HOA Billing System infrastructure. It does not add a separate service boundary. The existing web, API, PostgreSQL, logging, monitoring, dashboard, and backup services remain the deployment boundary.

## Runtime Placement

| Runtime Area | UOW-03 Placement |
|---|---|
| Browser-facing UI | Existing `web` container behind Caddy. |
| API commands and queries | Existing `api` container on the private app network. |
| Background processing | No UOW-03-specific worker processing required in this stage. Existing worker remains available for shared internal maintenance only. |
| Persistence | Existing PostgreSQL container on the private data network. |
| Approval references | Existing UOW-01 approval workflow data in PostgreSQL plus UOW-03 version references. |
| Audit | Existing UOW-01 audit tables and controls in PostgreSQL. |
| Logs | Existing structured log pipeline and Loki-equivalent store. |
| Metrics and dashboards | Existing Prometheus/Grafana-equivalent stack. |
| Backups | Existing encrypted PostgreSQL backup and staging restore rehearsal. |

## Request Flow

1. A user reaches the HOA Billing System through the existing Caddy reverse proxy on HTTPS.
2. Caddy routes frontend requests to the existing `web` container and API requests to the existing `api` container.
3. UOW-01 authentication resolves the actor context and correlation ID.
4. UOW-03 API logic validates request shape, bounds, object/scope access, decimal values, effective dates, and activation permissions.
5. UOW-03 domain components read or mutate PostgreSQL data inside transactions where required.
6. UOW-03 verifies UOW-01 approval references for financial-impacting activation.
7. UOW-03 writes required audit entries through UOW-01 audit contracts where possible in the same transaction.
8. UOW-03 returns typed resolution snapshots or safe reason-coded failures.
9. Structured logs and metrics flow to the shared observability stack.

Authorization and activation checks happen on the server. The frontend must not be treated as the enforcement boundary.

## Deployment Boundary

| Boundary | Decision |
|---|---|
| Public ingress | Caddy on ports 80 and 443 only. |
| API network | Private app network; no direct public API container binding. |
| Database network | Private data network; no direct staff or internet access. |
| Observability | Private observability network and restricted dashboard access. |
| Service count | No new UOW-03 containers. |
| Resolution lookup | PostgreSQL indexes only. |
| Rule engine | Not introduced. |
| Async messaging | No queue or message broker for UOW-03. |
| File storage | No UOW-03 file storage. |

## Database Deployment Architecture

UOW-03 database artifacts are deployed by the established migration path.

| Deployment Step | Required Control |
|---|---|
| Local migration development | Synthetic data only. |
| Staging migration | Rehearse UOW-03 tables, indexes, constraints, grants, immutable version controls, and rollback or forward-fix plan. |
| Production migration | Use migration/admin role only after staging evidence is accepted. |
| Runtime execution | Use least-privileged runtime API/worker roles. |
| Backup verification | Confirm UOW-03 data is present in encrypted backup and staging restore. |

Runtime application roles must not own schema migration permissions and must not be able to update or delete audit history.

## Data Access Architecture

| Access Path | Allowed? | Notes |
|---|---|---|
| User browser to Caddy | Yes | HTTPS only in production. |
| Caddy to web/API containers | Yes | Private app network. |
| API to PostgreSQL | Yes | Private data network and production TLS. |
| Worker to PostgreSQL | Yes, if shared maintenance requires it | No UOW-03-specific worker dependency is introduced. |
| Staff browser to PostgreSQL | No | Configuration staff access must go through application APIs. |
| Public internet to PostgreSQL | No | No public host binding. |
| UOW-03 to external cache/search/rule engine/queue | No | Not approved for UOW-03. |

## UOW-03 Route Families

Exact route names belong to Code Generation, but deployment must support these route families through the existing web/API boundary:

| Route Family | Deployment Host |
|---|---|
| Staff billing configuration dashboard | Existing web/API route path. |
| Staff rate rule management | Existing web/API route path. |
| Staff billing cycle management | Existing web/API route path. |
| Staff due/grace rule management | Existing web/API route path. |
| Staff rounding rule management | Existing web/API route path. |
| Staff charge type catalog management | Existing web/API route path. |
| Staff numbering format management | Existing web/API route path. |
| Staff template reference metadata management | Existing web/API route path. |
| Staff payment method metadata management | Existing web/API route path. |
| Configuration draft approval submission and activation | Existing web/API route path with UOW-01 approval integration. |
| Configuration version history | Existing web/API route path. |
| Configuration resolution preview | Existing web/API route path with staff-only authorization. |
| Downstream resolution APIs | Existing API route path, server-authorized, side-effect free. |

## Environment Architecture

| Environment | UOW-03 Requirement |
|---|---|
| Local | Synthetic configuration data, local PostgreSQL, generated migrations, no real financial configuration. |
| Staging | Production-like migration rehearsal, restore rehearsal, logging, monitoring, alert verification, and resolution smoke tests using synthetic or sanitized data only. |
| Production | Real billing configuration only after shared and UOW-03 production readiness gates pass. |

## Observability Architecture

UOW-03 observability uses existing shared services.

| Signal | Route |
|---|---|
| API logs | API structured logs to shared log store. |
| Access logs | Caddy access logs to shared log store. |
| Database health | PostgreSQL exporter or equivalent to metrics store. |
| UOW-03 counters | API metrics to shared metrics store. |
| Alerts | Shared alert rules and configured alert contact. |
| Dashboards | Shared dashboard service with UOW-03 panels. |

Required dashboards must make configuration health visible before later billing units depend on UOW-03 resolution results.

## Backup and Recovery Architecture

UOW-03 does not add a separate backup system. It is covered by the shared PostgreSQL backup and restore process.

Recovery verification must include:

- Configuration drafts restore with status and approval references intact.
- Activated configuration versions restore as immutable records.
- Effective intervals preserve half-open semantics.
- Non-overlap guards or validation checks remain effective after restore.
- Resolution can evaluate restored rate, cycle, due/grace, rounding, charge type, numbering, template, and payment method metadata.
- UOW-01 approval references still connect to activated financial-impacting versions where required.
- Audit entries and correlation IDs restore under shared audit verification.

## Deployment Constraints

- Do not add public ports for UOW-03.
- Do not add an external cache, search service, rule engine, queue, or distributed lock service for UOW-03.
- Do not create UOW-03 file storage, email delivery, document generation, report generation, support job, or import batch infrastructure.
- Do not bypass UOW-01 authentication, authorization, approval, audit, logging, settings, and safe-error contracts.
- Do not expose full sensitive configuration payloads in logs, metrics labels, dashboards, or alert payloads.
- Do not use committed secrets or runtime schema-owner credentials.
- Do not let downstream units query raw UOW-03 tables directly.

## Residual Infrastructure Risk

| Risk | Current Control | Remaining Boundary |
|---|---|---|
| Effective-version overlap under race conditions | PostgreSQL transactions plus persistence-level guards where practical. | Exact constraint/locking implementation is deferred to Code Generation and must be tested. |
| Resolution latency under later batch load | Indexed PostgreSQL lookup and same-context snapshot reuse. | Requirements must reopen before adding cache infrastructure. |
| Sensitive configuration leakage through observability | Redacted structured logging and safe metrics labels. | Code Generation must enforce field selection and log redaction. |
| Restore inconsistency in version timelines | Shared backup and staging restore rehearsal. | Build/Test must include restore-oriented smoke checks before production use. |

## Security Baseline Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-01 | Compliant | UOW-03 inherits encrypted production volumes and backups. |
| SECURITY-02 | Compliant | All UOW-03 ingress flows through Caddy access logging. |
| SECURITY-03 | Compliant | Logs, metrics, and alerts use the shared observability stack. |
| SECURITY-04 | Compliant by inheritance | Reverse proxy and application middleware remain shared controls. |
| SECURITY-05 | Compliant | Database validation, bounded queries, migration controls, and safe resolution failures are required. |
| SECURITY-06 | Compliant | Least-privileged database roles remain required. |
| SECURITY-07 | Compliant | Network exposure remains reverse-proxy-only. |
| SECURITY-08 | Compliant | Server-side route, object, scope, preview, and activation authorization remain required. |
| SECURITY-09 | Compliant | No committed secrets or new default credentials are introduced. |
| SECURITY-10 | Compliant | No new infrastructure dependency family is added. |
| SECURITY-11 | Compliant | Sensitive route families and misuse-prone behaviors are isolated through application policies. |
| SECURITY-12 | Compliant by inheritance | UOW-01 owns authentication/session/MFA infrastructure. |
| SECURITY-13 | Compliant | Audit and restore verification are deployment requirements. |
| SECURITY-14 | Compliant | UOW-03 alert and dashboard categories are defined. |
| SECURITY-15 | Compliant | Recovery and fail-closed resolution boundaries are defined. |

## Property-Based Testing Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| PBT-01 through PBT-10 | N/A for Deployment Architecture | This artifact maps deployment and infrastructure only. UOW-03 PBT enforcement resumes in Code Generation and Build/Test. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
- No application code is generated.
