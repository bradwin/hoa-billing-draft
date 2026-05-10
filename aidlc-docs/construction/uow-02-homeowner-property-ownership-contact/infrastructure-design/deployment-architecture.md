# UOW-02 Deployment Architecture

## Unit

- **Unit ID**: UOW-02
- **Unit Name**: Homeowner, Property, Ownership, and Contact Requests
- **Stage**: Infrastructure Design

## Deployment Summary

UOW-02 deploys as additional application routes, modules, database tables, indexes, constraints, read models, metrics, logs, and alerts inside the shared HOA Billing System infrastructure. It does not add a separate service boundary. The existing web, API, PostgreSQL, logging, monitoring, dashboard, and backup services remain the deployment boundary.

## Runtime Placement

| Runtime Area | UOW-02 Placement |
|---|---|
| Browser-facing UI | Existing `web` container behind Caddy. |
| API commands and queries | Existing `api` container on the private app network. |
| Background processing | No UOW-02-specific worker processing required in this stage. Existing worker remains available for shared internal maintenance only. |
| Persistence | Existing PostgreSQL container on the private data network. |
| Audit | Existing UOW-01 audit tables and controls in PostgreSQL. |
| Logs | Existing structured log pipeline and Loki-equivalent store. |
| Metrics and dashboards | Existing Prometheus/Grafana-equivalent stack. |
| Backups | Existing encrypted PostgreSQL backup and staging restore rehearsal. |

## Request Flow

1. A user reaches the HOA Billing System through the existing Caddy reverse proxy on HTTPS.
2. Caddy routes frontend requests to the existing `web` container and API requests to the existing `api` container.
3. UOW-01 authentication resolves the actor context and correlation ID.
4. UOW-02 API logic validates request shape, bounds, object access, and field-level permissions.
5. UOW-02 domain components read or mutate PostgreSQL data inside transactions where required.
6. UOW-02 writes required audit entries through UOW-01 audit contracts where possible in the same transaction.
7. UOW-02 returns role-filtered read models to the frontend.
8. Structured logs and metrics flow to the shared observability stack.

Authorization and PII filtering happen on the server. The frontend must not be treated as the enforcement boundary.

## Deployment Boundary

| Boundary | Decision |
|---|---|
| Public ingress | Caddy on ports 80 and 443 only. |
| API network | Private app network; no direct public API container binding. |
| Database network | Private data network; no direct staff or internet access. |
| Observability | Private observability network and restricted dashboard access. |
| Service count | No new UOW-02 containers. |
| Search | PostgreSQL indexes only. |
| Async messaging | No queue or message broker for UOW-02. |
| File storage | No UOW-02 file storage. |

## Database Deployment Architecture

UOW-02 database artifacts are deployed by the established migration path.

| Deployment Step | Required Control |
|---|---|
| Local migration development | Synthetic data only. |
| Staging migration | Rehearse UOW-02 tables, indexes, constraints, grants, and rollback or forward-fix plan. |
| Production migration | Use migration/admin role only after staging evidence is accepted. |
| Runtime execution | Use least-privileged runtime API/worker roles. |
| Backup verification | Confirm UOW-02 data is present in encrypted backup and staging restore. |

Runtime application roles must not own schema migration permissions and must not be able to update or delete audit history.

## Data Access Architecture

| Access Path | Allowed? | Notes |
|---|---|---|
| User browser to Caddy | Yes | HTTPS only in production. |
| Caddy to web/API containers | Yes | Private app network. |
| API to PostgreSQL | Yes | Private data network and production TLS. |
| Worker to PostgreSQL | Yes, if shared maintenance requires it | No UOW-02-specific worker dependency is introduced. |
| Staff browser to PostgreSQL | No | Staff access must go through application APIs. |
| Public internet to PostgreSQL | No | No public host binding. |
| UOW-02 to external search/cache/queue | No | Not approved for UOW-02. |

## UOW-02 Route Families

Exact route names belong to Code Generation, but deployment must support these route families through the existing web/API boundary:

| Route Family | Deployment Host |
|---|---|
| Staff homeowner master data | Existing web/API route path. |
| Staff property master data | Existing web/API route path. |
| Staff ownership transfer and billing-account period management | Existing web/API route path. |
| Staff billable-property validation | Existing web/API route path. |
| Staff duplicate review | Existing web/API route path. |
| Staff contact change decision | Existing web/API route path. |
| Homeowner own contact change request | Existing web/API route path. |
| Homeowner own property/contact read model | Existing web/API route path. |
| Board Member read-only governance view | Existing web/API route path with PII-minimized response shaping. |

## Environment Architecture

| Environment | UOW-02 Requirement |
|---|---|
| Local | Synthetic data, local PostgreSQL, generated migrations, no real homeowner PII. |
| Staging | Production-like migration rehearsal, restore rehearsal, logging, monitoring, and alert verification using synthetic or sanitized data only. |
| Production | Real homeowner and responsibility records only after shared and UOW-02 production readiness gates pass. |

## Observability Architecture

UOW-02 observability uses existing shared services.

| Signal | Route |
|---|---|
| API logs | API structured logs to shared log store. |
| Access logs | Caddy access logs to shared log store. |
| Database health | PostgreSQL exporter or equivalent to metrics store. |
| UOW-02 counters | API metrics to shared metrics store. |
| Alerts | Shared alert rules and configured alert contact. |
| Dashboards | Shared dashboard service with UOW-02 panels. |

Required dashboards must make UOW-02 master-data health visible before later billing units depend on these facts.

## Backup and Recovery Architecture

UOW-02 does not add a separate backup system. It is covered by the shared PostgreSQL backup and restore process.

Recovery verification must include:

- Homeowner and property records restore correctly.
- Property aliases restore and resolve to canonical properties.
- Ownership and billing-account periods preserve half-open effective-date semantics.
- Billable validation can evaluate restored effective ownership period, effective billing-account period, property status, lot area, and responsible homeowner eligibility.
- Contact request states remain limited to Pending, Approved, and Rejected with terminal-state behavior preserved.
- Audit entries and correlation IDs restore under shared audit verification.

## Deployment Constraints

- Do not add public ports for UOW-02.
- Do not add an external search service, cache, queue, or distributed lock service for UOW-02.
- Do not create UOW-02 file storage, email delivery, document generation, report generation, or import batch infrastructure.
- Do not bypass UOW-01 authentication, authorization, audit, logging, settings, and safe-error contracts.
- Do not expose raw PII in logs, metrics labels, dashboards, or alert payloads.
- Do not use committed secrets or runtime schema-owner credentials.

## Residual Infrastructure Risk

| Risk | Current Control | Remaining Boundary |
|---|---|---|
| Effective-period overlap under race conditions | PostgreSQL transactions plus persistence-level guards where practical. | Exact constraint/locking implementation is deferred to Code Generation and must be tested. |
| Search latency under broad staff queries | Bounded pagination, normalized indexes, dashboards, and alerts. | Requirements must reopen before adding search/cache infrastructure. |
| PII leakage through observability | Redacted structured logging and safe metrics labels. | Code Generation must enforce field selection and log redaction. |
| Master-data restore inconsistency | Shared backup and staging restore rehearsal. | Build/Test must include restore-oriented smoke checks before production use. |

## Security Baseline Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-01 | Compliant | UOW-02 inherits encrypted production volumes and backups. |
| SECURITY-02 | Compliant | All UOW-02 ingress flows through Caddy access logging. |
| SECURITY-03 | Compliant | Logs, metrics, and alerts use the shared observability stack. |
| SECURITY-04 | Compliant by inheritance | Reverse proxy and application middleware remain shared controls. |
| SECURITY-05 | Compliant | Database validation, bounded queries, and migration controls are required. |
| SECURITY-06 | Compliant | Least-privileged database roles remain required. |
| SECURITY-07 | Compliant | Network exposure remains reverse-proxy-only. |
| SECURITY-08 | Compliant | Server-side route, object, and field authorization remain required. |
| SECURITY-09 | Compliant | No committed secrets or new default credentials are introduced. |
| SECURITY-10 | Compliant | No new infrastructure dependency family is added. |
| SECURITY-11 | Compliant | Sensitive route families and misuse-prone behaviors are isolated through application policies. |
| SECURITY-12 | Compliant by inheritance | UOW-01 owns authentication/session/MFA infrastructure. |
| SECURITY-13 | Compliant | Audit and restore verification are deployment requirements. |
| SECURITY-14 | Compliant | UOW-02 alert and dashboard categories are defined. |
| SECURITY-15 | Compliant | Recovery and failure boundaries are defined. |

## Property-Based Testing Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| PBT-01 through PBT-10 | N/A for Deployment Architecture | This artifact maps deployment and infrastructure only. UOW-02 PBT enforcement resumes in Code Generation and Build/Test. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
