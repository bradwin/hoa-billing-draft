# UOW-01 Deployment Architecture

## Unit

- **Unit ID**: UOW-01
- **Unit Name**: Platform Foundation, Access, Settings, Audit, and Approval Core
- **Stage**: Infrastructure Design

## Architecture Summary

The first production deployment is a single-host Docker Compose stack. The reverse proxy is the only public entry point. Application, database, observability, and backup services run on private Docker networks. Production storage is encrypted, database connections use TLS, logs are persisted centrally, and backups are encrypted and rehearsed in staging before real financial data is used.

## Environment Topology

| Environment | Compose Project | Primary Use | Required Controls |
|---|---|---|---|
| Local | `hoa-local` | Developer workflow and automated tests | Synthetic data, local secrets, documented PostgreSQL non-TLS exception allowed. |
| Staging | `hoa-staging` | Production rehearsal, restore tests, migration rehearsals, smoke testing | TLS, encrypted storage, backups, monitoring, logging, and no real financial data unless separately approved. |
| Production | `hoa-production` | Real HOA billing system | Full production readiness gate required before use. |

Local, staging, and production must not share databases, volumes, secrets, or backup destinations.

## Container Layout

| Container | Network Membership | Persistent Data | Health Check |
|---|---|---|---|
| `caddy` | `edge`, `app_private`, `observability_private` | Caddy config and certificate storage | HTTP/HTTPS readiness and upstream reachability. |
| `web` | `app_private`, `observability_private` | None by default | Web health endpoint. |
| `api` | `app_private`, `data_private`, `observability_private` | None by default | API health endpoint including database reachability. |
| `worker` | `data_private`, `observability_private` | None by default | Worker heartbeat or internal health endpoint. |
| `postgres` | `data_private`, `observability_private` | Encrypted PostgreSQL data volume | PostgreSQL readiness. |
| `loki` or equivalent | `observability_private` | Encrypted log volume | Log ingestion readiness. |
| `prometheus` or equivalent | `observability_private` | Encrypted metrics volume | Metrics scrape readiness. |
| `grafana` or equivalent | `observability_private` plus optional restricted admin route | Encrypted dashboard config volume | Dashboard health endpoint. |
| `backup` | `data_private`, `observability_private` | Encrypted backup staging/output mount | Last backup status and verification status. |

## Network Exposure

| Exposure Point | Production Rule |
|---|---|
| Public HTTP | Port 80 exposed only by Caddy for redirect or ACME challenge. |
| Public HTTPS | Port 443 exposed only by Caddy. |
| API | No public host binding; routed through Caddy. |
| Web | No public host binding; routed through Caddy. |
| PostgreSQL | No public host binding. |
| Grafana | Private by default; if exposed, it must route through Caddy with TLS and authentication. |
| Loki/Prometheus | No public host binding. |
| Backup service | No public host binding. |
| SSH | Restricted administrative access only; source restriction, VPN, or equivalent required. |

## Request Flow

1. Browser requests reach Caddy on port 443.
2. Caddy terminates TLS, emits access logs, and forwards to the web or API container over the private app network.
3. Web requests for protected data call API routes through approved internal/public API paths.
4. API validates input, resolves server-side session, authorizes the actor, executes domain logic, writes audit records, and emits structured logs.
5. API and worker reach PostgreSQL only through the private data network.
6. Logs from Caddy, API, web, worker, PostgreSQL, and backup jobs flow to the log store.
7. Metrics are scraped by the monitoring service and shown in dashboards.

## Data Flow Boundaries

| Data | Allowed Flow | Blocked Flow |
|---|---|---|
| Session cookies | Browser to Caddy to API over HTTPS | Raw session tokens in logs, audit, or database plaintext. |
| Database traffic | API/worker/backup to PostgreSQL over private network and production TLS | Public database access. |
| Audit records | API/worker append to PostgreSQL through runtime roles | Runtime update/delete of audit records. |
| Support intents | API/worker persist intents to PostgreSQL | Real SMTP/PDF/storage/job dispatch before UOW-08. |
| Logs | Containers to log store | Application credentials that can delete log history. |
| Backups | Backup job to encrypted backup target | Unencrypted backup files or keys stored in repo. |
| Secrets | Mounted secrets files to specific containers | Committed production `.env` or broad secret exposure to all containers. |

## Deployment Flow

1. Build pinned production images from approved source.
2. Run dependency vulnerability scan and SBOM generation command.
3. Deploy to staging Compose project.
4. Run migrations using the migration/admin database role.
5. Run smoke tests for sign-in, MFA flow, audit query, settings, approvals, and support intent persistence.
6. Run backup and restore rehearsal in staging.
7. Verify audit hash chain after restore.
8. Confirm monitoring, log retention, and alerts.
9. Promote the same image versions to production.
10. Run production migrations with the migration/admin database role.
11. Run production smoke tests without mutating real financial records beyond approved setup actions.

No deployment step may use the runtime database role for migrations.

## Database Deployment Architecture

| Concern | Design |
|---|---|
| Version | PostgreSQL 16 or later. |
| Runtime access | API and worker use runtime roles with no superuser or audit update/delete privileges. |
| Migration access | Migration/admin role is used only by controlled migration process. |
| Backup access | Backup role can perform logical backups without broad mutation privileges. |
| TLS | Production client connections require TLS. |
| Storage | PostgreSQL data volume resides on encrypted storage. |
| Audit immutability | Database grants and triggers/policies prevent audit update/delete by runtime roles. |
| Health | Readiness check plus dashboard metrics for availability, connections, disk, locks, and latency. |

## Persistent Volumes

| Volume | Environment | Protection |
|---|---|---|
| PostgreSQL data | Staging and production | Encrypted host disk or encrypted cloud volume. |
| Caddy certificate storage | Staging and production | Encrypted host disk or encrypted cloud volume. |
| Log store data | Staging and production | Encrypted host disk or encrypted cloud volume; app cannot delete. |
| Metrics/dashboard data | Staging and production | Encrypted host disk or encrypted cloud volume. |
| Backup output | Staging and production | Encrypted target with controlled access. |
| Application-managed files | Reserved for UOW-08 and later | Encrypted volume and backup hook reserved now. |

## Backup Architecture

Daily backup jobs produce:

- Encrypted PostgreSQL logical backup.
- Encrypted application-managed file backup once files exist.
- Backup manifest including timestamp, source environment, backup type, and verification result.
- Backup job log entry shipped to log store.
- Backup status metric scraped by monitoring.

Retention is 35 daily backups and 12 monthly backups. Backup failures must alert.

## Restore Architecture

Restore is rehearsed in staging before production use and after material backup or migration changes.

Restore verification includes:

- Database restore succeeds.
- Application starts against restored database.
- Migrations are compatible.
- Audit hash-chain verification passes.
- Sign-in, audit query, settings, approvals, and support intent smoke tests pass.
- Backup and restore evidence is recorded.

## Observability Architecture

| Capability | Source | Destination |
|---|---|---|
| Access logs | Caddy | Log store and dashboard. |
| Application logs | API, web, worker | Log store and dashboard. |
| Database logs | PostgreSQL | Log store where safe. |
| Backup logs | Backup job | Log store and backup dashboard. |
| Service health | Containers and health endpoints | Monitoring dashboard and alerts. |
| Security events | Application audit/security records plus metrics exporter or query job | Security dashboard and alerts. |
| Disk usage | Host/container exporter | Operations dashboard and alerts. |

Log retention is at least 90 days. Alert rules must exist before production use.

## Secrets Architecture

Secrets are mounted only into containers that need them.

| Secret | Consumers |
|---|---|
| Runtime database password | API and worker. |
| Migration database password | Migration job only. |
| Backup database password | Backup job only. |
| Backup encryption key | Backup job only. |
| Session/cookie secret | API. |
| MFA encryption key | API and worker only if worker performs related maintenance. |
| Dashboard admin credential | Grafana or equivalent only. |
| Future SMTP/storage/document secrets | UOW-08 support services only. |

Secret files are outside the repository and have strict host permissions. Real secret values must not appear in source, audit, logs, generated examples, or committed configuration.

## Production Readiness Checklist

- [ ] Production DNS approved.
- [ ] TLS certificate active.
- [ ] HTTP redirects to HTTPS.
- [ ] HSTS enabled for production.
- [ ] Host firewall exposes only 80 and 443 publicly.
- [ ] SSH administration restricted.
- [ ] PostgreSQL has no public host binding.
- [ ] Production PostgreSQL TLS enforced.
- [ ] Production storage encrypted for database, logs, files, and backups.
- [ ] Runtime database roles lack audit update/delete privileges.
- [ ] Audit update/delete trigger or policy active.
- [ ] Production secrets stored outside the repo.
- [ ] No real `.env` committed.
- [ ] Daily encrypted PostgreSQL backup configured.
- [ ] Persistent-file backup hook configured or explicitly pending until files exist.
- [ ] Staging restore rehearsal passed.
- [ ] Audit hash-chain verification passed after restore.
- [ ] Log retention is at least 90 days.
- [ ] Monitoring dashboards are configured.
- [ ] Alert notification contact configured.
- [ ] Production images pinned.
- [ ] Vulnerability scan command available.
- [ ] SBOM command available.

This checklist is a hard gate. Real financial records must not be entered before it passes.

## Failure Modes

| Failure | Expected Behavior |
|---|---|
| API unavailable | Caddy returns safe upstream failure; monitoring alerts. |
| PostgreSQL unavailable | API denies protected operations safely; monitoring alerts. |
| Log store unavailable | Application continues if safe, logs local/container output, monitoring alerts; security events still persist to database audit where applicable. |
| Backup job failure | Monitoring alerts and production readiness remains failed until corrected. |
| Disk pressure | Monitoring alerts before service failure thresholds. |
| TLS certificate failure | Public access should fail closed rather than serving credentials over plain HTTP. |
| Audit immutability control failure | Production readiness fails; financial/security mutations must not proceed in production. |

## Security Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-01 | Compliant | Architecture requires encrypted storage and TLS for public and database traffic. |
| SECURITY-02 | Compliant | Caddy access logs are required and persisted. |
| SECURITY-03 | Compliant | Application logs are structured and centralized in local log storage. |
| SECURITY-04 | Compliant | TLS/HSTS are deployed at Caddy; application headers remain required. |
| SECURITY-05 | Compliant | Infrastructure supports app validation by keeping app/database paths controlled and private. |
| SECURITY-06 | Compliant | Database roles are separated and least-privileged. |
| SECURITY-07 | Compliant | Network exposure is limited to required public ports and private Docker networks. |
| SECURITY-08 | Compliant | Direct app/database exposure is blocked; server-side auth and strict CORS remain required. |
| SECURITY-09 | Compliant | Secrets, patching, no default credentials, and safe production exposure are required. |
| SECURITY-10 | Compliant | Pinned images, scans, lockfile, and SBOM are deployment prerequisites. |
| SECURITY-11 | Compliant | Security-critical services are isolated and protected with layered controls. |
| SECURITY-12 | Compliant | Secrets, TLS, private database, and monitoring support authentication and session requirements. |
| SECURITY-13 | Compliant | Audit integrity, backup verification, and controlled deployments are required. |
| SECURITY-14 | Compliant | Logs, dashboards, alerts, and retention are required. |
| SECURITY-15 | Compliant | Health checks, fail-closed TLS, monitoring, backups, and safe restore procedures are required. |

## PBT Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| PBT-01 through PBT-10 | N/A for Infrastructure Design | No application test implementation is produced in this artifact; PBT requirements remain active for Code Generation and Build/Test. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
- Checklist items are production readiness items, not workflow progress markers.
