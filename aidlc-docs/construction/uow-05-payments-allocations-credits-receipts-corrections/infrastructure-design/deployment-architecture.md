# UOW-05 Deployment Architecture

## Unit

- **Unit ID**: UOW-05
- **Unit Name**: Payments, Allocations, Credits, Receipts, and Financial Corrections
- **Stage**: Infrastructure Design

## Deployment Model

UOW-05 deploys inside the existing TypeScript modular monolith and shared single-host Docker Compose architecture. It adds application modules, web routes, API routes, database structures, monitoring categories, and alert rules. It does not add a new deployable service.

## Runtime Mapping

| Runtime Service | UOW-05 Use |
|---|---|
| Caddy reverse proxy | Routes existing web and API traffic; no new public port. |
| Web container | Serves UOW-05 staff and homeowner payment/receipt frontend routes. |
| API container | Hosts UOW-05 proof, posting, allocation, credit, receipt, reversal, correction, and support-intent APIs. |
| Worker container | No UOW-05 posting worker added. Existing worker remains available for other approved shared jobs. |
| PostgreSQL | Stores UOW-05 financial source records, snapshots, support intents, approval references, and audit references. |
| Log storage | Stores redacted UOW-05 structured logs. |
| Metrics/dashboard | Displays UOW-05 metrics, dashboards, and alerts. |
| Backup service | Includes UOW-05 PostgreSQL records in encrypted backup and restore rehearsal. |

## Network Mapping

| Network | UOW-05 Traffic |
|---|---|
| `edge` | Public HTTPS traffic to Caddy only. |
| `app_private` | Caddy to web/API and internal app communication. |
| `data_private` | API to PostgreSQL for UOW-05 financial source records. |
| `observability_private` | Logs, metrics, dashboards, exporters, and health checks. |

UOW-05 does not expose PostgreSQL, payment staff tooling, or module-specific APIs directly to the public network.

## Data Deployment Mapping

| Data Group | Deployment Handling |
|---|---|
| Payment proof metadata | PostgreSQL migration-managed tables and indexes. |
| Posted payments and allocations | PostgreSQL source-record tables with transactional constraints. |
| Credits and credit applications | PostgreSQL source-record tables with availability derivation support. |
| Receipts and receipt snapshots | PostgreSQL tables with unique receipt number constraints. |
| Reversals and corrections | PostgreSQL linked source-record tables with approval references. |
| Balance-impact facts | PostgreSQL tables consumed by later derived balance/reporting units. |
| Support intents | PostgreSQL records through UOW-01 support contracts. |
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
| Payment proof metadata | UOW-05 application module. |
| Posted payment source records | UOW-05 application module. |
| Receipt source records and numbers | UOW-05 application module. |
| Proof file storage | UOW-08 future support adapter. |
| Receipt PDF rendering | UOW-08 future support adapter. |
| Receipt email delivery | UOW-08 future support adapter. |
| Report/export output | UOW-07 and UOW-08, not UOW-05. |
| Import processing | UOW-08, not UOW-05. |

## Production Readiness Additions

UOW-05 production readiness requires:

- migration rehearsal for UOW-05 tables, indexes, and constraints;
- backup inclusion for all UOW-05 PostgreSQL records;
- restore rehearsal verification for UOW-05 source records and audit references;
- alert coverage for posting, allocation, credit, receipt, reversal, correction, authorization, support intent, database health, backup, and restore failures;
- safe logging review to confirm no full PII, proof payloads, attachment contents, payment account details, or recipient payloads are logged;
- verification that no UOW-05 route bypasses Caddy or exposes PostgreSQL.

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
