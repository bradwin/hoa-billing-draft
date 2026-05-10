# UOW-04 Deployment Architecture

## Unit

- **Unit ID**: UOW-04
- **Unit Name**: Invoice Lifecycle and Invoice Source Records
- **Stage**: Infrastructure Design

## Deployment Summary

UOW-04 deploys inside the existing shared application stack. It adds API routes, web routes, Prisma/PostgreSQL schema changes, logs, metrics, dashboards, and alerts. It does not add new runtime containers or public network paths.

## Runtime Mapping

| Runtime | UOW-04 Responsibilities |
|---|---|
| Web container | Staff invoice pages, homeowner-safe invoice detail pages, protected-shell integration. |
| API container | Invoice generation, manual draft, issuance, lifecycle, exception, support-intent, authorization, audit, and read APIs. |
| Worker container | No UOW-04-specific worker execution for first scope. |
| PostgreSQL | Invoice source records, lines, snapshots, number assignments, exceptions, lifecycle actions, open-amount input facts, and support intents. |
| Reverse proxy | Existing Caddy route exposure for web/API paths. |
| Observability services | Shared logs, metrics, dashboards, and alerts. |
| Backup service | Existing encrypted PostgreSQL backup and restore process. |

## Network Mapping

| Network | UOW-04 Use |
|---|---|
| `edge` | Public access reaches UOW-04 only through the reverse proxy. |
| `app_private` | Web/API internal communication. |
| `data_private` | API/PostgreSQL/backup communication for invoice source records. |
| `observability_private` | Log and metric shipping for UOW-04 signals. |

UOW-04 does not expose PostgreSQL, does not open a separate invoice API port, and does not provide direct database tooling for staff.

## Data Deployment

| Data Group | Deployment Requirement |
|---|---|
| Invoice tables | Deployed through PostgreSQL migrations. |
| Duplicate keys | Deployed as indexes or constraints before invoice generation is enabled. |
| Numbering constraints | Deployed as unique constraints and lock-support structures before issuance is enabled. |
| Snapshot tables | Deployed with issued invoice schema. |
| Support intent persistence | Deployed through existing support-contract persistence approach. |
| Audit references | Integrated with UOW-01 audit persistence. |

Staging migration rehearsal and rollback planning are required before production.

## Request Paths

### Staff Recurring Generation

1. Staff browser uses existing web container route.
2. Web route calls UOW-04 API route through reverse proxy/API path.
3. API authorizes actor through UOW-01.
4. API reads UOW-02 and UOW-03 facts.
5. API writes UOW-04 drafts and exceptions to PostgreSQL.
6. API emits audit and observability events.

### Staff Issuance

1. Staff selects draft invoices in web route.
2. API authorizes issuance.
3. API revalidates each draft.
4. API locks numbering scope in PostgreSQL.
5. API persists invoice number, issued snapshots, open-amount input facts, lifecycle update, and audit.
6. API records support intents when requested.
7. API returns per-invoice result to web route.

### Homeowner Invoice Detail

1. Homeowner accesses authorized route through web container.
2. API enforces homeowner object authorization.
3. API returns homeowner-safe invoice read model.
4. No direct document download is provided by UOW-04; UOW-08 owns concrete document access later.

## Scaling Posture

| Area | Decision |
|---|---|
| First-scope recurring generation | Existing API container and PostgreSQL support 2,000-candidate batches. |
| Horizontal scaling | Not introduced for UOW-04 first scope. |
| Queue/worker scaling | Not introduced for UOW-04 first scope. |
| Search scaling | PostgreSQL indexes are sufficient for first-scope list/detail views. |
| Future scaling trigger | Revisit infrastructure if candidate volume, generation duration, or issuance contention exceeds approved targets. |

## Observability Deployment

UOW-04 adds dashboard panels or metric/log categories for:

- recurring generation counts and duration;
- billing exception counts;
- duplicate block counts;
- issuance success and failure counts;
- numbering conflicts;
- authorization denials;
- void/reissue approval application failures;
- snapshot creation failures;
- support-intent request and failure counts.

## Alert Deployment

UOW-04 alert rules use the shared alerting path. Required alert categories:

- repeated authorization denials;
- generation failure spikes;
- exception spikes;
- duplicate block spikes;
- numbering conflicts;
- issuance failure spikes;
- failed void/reissue approval application;
- support-intent failure spikes;
- database health;
- backup failure;
- restore verification failure.

## Security Deployment

| Control | Deployment Requirement |
|---|---|
| Reverse proxy | UOW-04 routes use existing proxy path. |
| API authorization | Enforced in API container through UOW-01 contracts. |
| Database access | Private network only, least-privileged runtime role. |
| Secrets | No UOW-04 secrets by default; any future secrets use approved external secret mechanism. |
| Logs | Redacted structured logs only. |
| Backups | Encrypted database backup includes UOW-04 financial source records. |

## Deployment Boundaries

UOW-04 does not deploy:

- PDF rendering service;
- SMTP delivery service;
- file storage adapter;
- retry worker;
- queue service;
- import processor;
- payment posting service;
- penalty processor;
- report/export service.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Deployment architecture keeps public exposure behind the reverse proxy, PostgreSQL private, secrets external, logs redacted, backups encrypted, and support adapters deferred to UOW-08. |
| Property-Based Testing | N/A for Infrastructure Design | Deployment architecture does not create test code. PBT requirements remain carried by UOW-04 NFR Design and Code Generation. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
