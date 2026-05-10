# UOW-06 Deployment Architecture

## Unit

- **Unit ID**: UOW-06
- **Unit Name**: Penalties, Delinquency, Waivers, and Reminders
- **Stage**: Infrastructure Design

## Deployment Model

UOW-06 deploys inside the existing TypeScript modular monolith and shared single-host Docker Compose architecture. It adds application modules, web routes, API routes, database structures, monitoring categories, and alert rules. It does not add a new deployable service.

## Runtime Mapping

| Runtime Service | UOW-06 Use |
|---|---|
| Caddy reverse proxy | Routes existing web and API traffic; no new public port. |
| Web container | Serves UOW-06 staff and homeowner penalty/waiver/delinquency/reminder frontend routes. |
| API container | Hosts UOW-06 overdue, aging, penalty, waiver, reminder, and support-intent APIs. |
| Worker container | No UOW-06 worker added. Existing worker remains available for later approved shared jobs and UOW-08 job orchestration. |
| PostgreSQL | Stores UOW-06 financial source records, reminder intents, balance-impact facts, approval references, and audit references. |
| Log storage | Stores redacted UOW-06 structured logs. |
| Metrics/dashboard | Displays UOW-06 metrics, dashboards, and alerts. |
| Backup service | Includes UOW-06 PostgreSQL records in encrypted backup and restore rehearsal. |

## Network Mapping

| Network | UOW-06 Traffic |
|---|---|
| `edge` | Public HTTPS traffic to Caddy only. |
| `app_private` | Caddy to web/API and internal app communication. |
| `data_private` | API to PostgreSQL for UOW-06 financial source records and reminder intents. |
| `observability_private` | Logs, metrics, dashboards, exporters, and health checks. |

UOW-06 does not expose PostgreSQL, collections staff tooling, or module-specific APIs directly to the public network.

## Data Deployment Mapping

| Data Group | Deployment Handling |
|---|---|
| Penalty runs | PostgreSQL migration-managed tables and indexes. |
| Penalty source records | PostgreSQL source-record tables with duplicate-blocking constraints. |
| Waiver requests and waivers | PostgreSQL source-record tables with approval references and idempotency constraints. |
| Reminder eligibility and intents | PostgreSQL records through UOW-01 support contracts. |
| Aging/delinquency query support | PostgreSQL indexes and query structures over source facts. |
| Balance-impact facts | PostgreSQL tables consumed by later derived balance/reporting units. |
| Audit references | PostgreSQL references to UOW-01 audit records. |

## Migration And Release Requirements

| Requirement | Decision |
|---|---|
| Migration path | Existing PostgreSQL migration path. |
| Staging rehearsal | Required before production deployment. |
| Rollback planning | Required before production deployment. |
| Runtime table creation | Prohibited. |
| Direct data patching | Prohibited unless separately approved as an operations action. |

## Operational Boundaries

| Capability | Deployment Owner |
|---|---|
| Overdue and aging evaluation | UOW-06 application module. |
| Penalty source records | UOW-06 application module. |
| Waiver requests and waiver records | UOW-06 application module. |
| Reminder eligibility and reminder intents | UOW-06 application module through UOW-01 support contracts. |
| Reminder rendering | UOW-08 future support adapter. |
| Reminder email delivery | UOW-08 future support adapter. |
| Reminder retry jobs | UOW-08 future support adapter. |
| Statement/report/export output | UOW-07 and UOW-08, not UOW-06. |
| Import processing | UOW-08, not UOW-06. |

## Production Readiness Additions

UOW-06 production readiness requires:

- migration rehearsal for UOW-06 tables, indexes, idempotency keys, and constraints;
- backup inclusion for all UOW-06 PostgreSQL records;
- restore rehearsal verification for UOW-06 source records and audit references;
- alert coverage for overdue evaluation, penalty candidate generation, duplicate conflicts, penalty application, waiver execution, reminder suppression/contact-path anomalies, support intent, authorization, database health, backup, and restore failures;
- safe logging review to confirm no full PII, reminder payloads, recipient payloads, sensitive contact data, or complete delinquency payloads are logged;
- verification that no UOW-06 route bypasses Caddy or exposes PostgreSQL;
- confirmation that UOW-06 adds no SMTP, document rendering, file storage, retry worker, import, or report/export infrastructure.

## Security Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-01 through SECURITY-15 | Compliant | Deployment uses existing private network, reverse proxy, encrypted storage, backup/restore, safe logging, secrets, and production readiness baseline. |

## PBT Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| PBT-01 through PBT-10 | N/A for Deployment Architecture | PBT enforcement applies to code/test generation, not deployment architecture. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
