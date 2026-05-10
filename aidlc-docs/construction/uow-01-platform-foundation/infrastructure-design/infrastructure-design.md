# UOW-01 Infrastructure Design

## Unit

- **Unit ID**: UOW-01
- **Unit Name**: Platform Foundation, Access, Settings, Audit, and Approval Core
- **Stage**: Infrastructure Design

## Summary

UOW-01 infrastructure uses a single Linux host or VPS running Docker Compose for first production, with the same topology used locally at smaller scale. The design is intentionally conservative: one host, one PostgreSQL database, private container networks, reverse-proxy-only public exposure, encrypted storage, PostgreSQL TLS in production, persistent logs, monitoring, alerting, daily encrypted backups, restore rehearsal, and explicit production readiness gates.

The approved capacity target remains one HOA/subdivision, up to 1,000 homeowner users, up to 25 operational users, and up to 50 concurrent authenticated sessions. Redis, Kubernetes, autoscaling, managed cloud platforms, and multi-HOA tenancy are out of scope until requirements are reopened.

## Approved Infrastructure Decisions

| Area | Approved Decision |
|---|---|
| Production target | Single Linux host or VPS running Docker Compose |
| Environment separation | Local development, staging, and production Compose projects |
| Compute mapping | Separate reverse proxy, web, API, worker, PostgreSQL, log/monitoring, and backup containers |
| Public exposure | Only ports 80 and 443 exposed through reverse proxy; PostgreSQL and app containers remain private |
| Reverse proxy and TLS | Caddy for TLS termination, automatic certificates where public DNS exists, HSTS in production |
| Database | PostgreSQL 16 or later container with encrypted host volume, private network, health checks, and separate roles |
| Database transit encryption | Production PostgreSQL connections use TLS, with documented local non-TLS exception |
| Encryption at rest | Production database, files, logs, and backups require encrypted host disk or encrypted cloud volume |
| Audit immutability | Runtime database role lacks audit update/delete grants; database triggers or policies reject audit update/delete |
| Backups | Daily encrypted logical PostgreSQL backup plus encrypted persistent-file backup, 35 daily and 12 monthly retention |
| Logging | Structured container logs shipped to self-hosted Loki or equivalent with at least 90-day retention |
| Monitoring | Prometheus/Grafana or equivalent local stack for health, database, disk, backup, and security dashboards |
| Alerting | Alerts for auth failures, authorization failures, privilege changes, backup failures, disk pressure, and service health |
| Secrets | Docker Compose secrets or root-owned files outside the repository |
| Support intents | Persist support intents in PostgreSQL; no real SMTP, PDF, filesystem adapter, or job dispatch before UOW-08 |
| Shared infrastructure | One shared single-host stack for all eight units |
| Production readiness | Production blocked until TLS, encrypted storage, backups, restore rehearsal, logs, alert contact, secrets, and audit controls are verified |
| Capacity posture | Size for approved first scope only and monitor capacity before adding scale services |

## Service Mapping

| Logical Component | Infrastructure Mapping | Notes |
|---|---|---|
| HTTP Security Component | Caddy reverse proxy plus app middleware | Caddy terminates TLS and emits access logs. App middleware still owns CSP, CORS, CSRF, and safe API headers. |
| Next.js Web Frontend | `web` container on private app network | No direct public port binding. Public access flows through Caddy. |
| NestJS API | `api` container on private app network | API is reachable only by Caddy and internal containers. |
| Worker Process | `worker` container on private app/data networks | UOW-01 worker may run cleanup/internal jobs only. UOW-08 owns concrete support dispatch. |
| PostgreSQL | `postgres` container on data-only private network | PostgreSQL 16 or later, encrypted host volume, TLS in production, health checks, separate roles. |
| Audit Store | PostgreSQL tables with database grants and triggers/policies | Runtime role can append/query allowed records but cannot update/delete audit entries. |
| Support Intent Store | PostgreSQL tables | Intents persist without external adapter execution before UOW-08. |
| Secrets Provider | Compose secrets or root-owned files outside repo | App reads mounted secret files through typed config abstraction. |
| Log Store | Loki or equivalent local log service | Receives structured container logs; app cannot delete logs. |
| Metrics Store | Prometheus or equivalent | Scrapes container, API, database, backup, and host metrics. |
| Dashboard | Grafana or equivalent | Restricted to admin users; contains operational and security views. |
| Backup Job | Dedicated backup container or host timer invoking Compose services | Produces encrypted database and persistent-file backups. |
| Persistent Files Placeholder | Encrypted host volume for application-managed files | Concrete storage adapter remains UOW-08, but volume and backup hooks are reserved. |

## Environment Strategy

| Environment | Purpose | Data Rules |
|---|---|---|
| Local | Developer execution and tests | Synthetic data only. Local database TLS may be disabled with explicit config. |
| Staging | Production-like rehearsal for deployments, backups, restores, and migrations | Synthetic or sanitized data only unless separately approved. Must run TLS, encryption, logging, and monitoring controls. |
| Production | Real HOA and financial records | Requires all production readiness gates before first real financial record. |

Staging is mandatory before production use because restore and upgrade rehearsals are not optional for a financial system. A build that passes tests is not enough.

## Compute and Container Design

First production uses Docker Compose with separate services:

| Service | Publicly Exposed | Main Responsibility |
|---|---|---|
| `caddy` | Yes, ports 80 and 443 only | TLS termination, HTTP to HTTPS redirect, access logs, reverse proxy to web/API. |
| `web` | No | Next.js frontend. |
| `api` | No | NestJS API and protected backend routes. |
| `worker` | No | Internal cleanup jobs and later job worker entrypoint. |
| `postgres` | No | PostgreSQL persistence. |
| `loki` or equivalent | No | Centralized log storage. |
| `prometheus` or equivalent | No | Metrics scraping and alert rule evaluation. |
| `grafana` or equivalent | No by default | Dashboards; if exposed, it must be behind authentication and TLS. |
| `backup` | No | Scheduled or manually invoked backup and verification jobs. |

The host operating system must be patched, minimal, and dedicated to the application stack where practical. Production container images must use pinned tags or immutable digests; `latest` is prohibited.

## Network Design

| Network | Members | Exposure |
|---|---|---|
| `edge` | Caddy only | Host ports 80 and 443. |
| `app_private` | Caddy, web, API, worker | Internal Docker network only. |
| `data_private` | API, worker, PostgreSQL, backup | Internal Docker network only. |
| `observability_private` | Caddy, web, API, worker, PostgreSQL exporters, Loki, Prometheus, Grafana | Internal Docker network only unless a restricted admin route is explicitly configured. |

Firewall rules must allow inbound 80 and 443 only for public traffic. SSH administration must be restricted by source IP, VPN, or equivalent administrative control. PostgreSQL, API, web, logs, metrics, dashboards, and backup services must not bind directly to public host interfaces.

## Reverse Proxy and TLS

Caddy is the first implementation reverse proxy. It provides:

- HTTP to HTTPS redirect in production.
- Automatic certificate management when approved DNS exists.
- Reverse proxy routing to web and API services.
- Access logs shipped to the log store.
- HSTS on production HTTPS responses.

Application middleware remains responsible for application-level headers and CORS. Infrastructure TLS does not replace `Secure`, `HttpOnly`, and `SameSite` cookies, CSRF controls, or backend authorization.

## Database Infrastructure

### PostgreSQL Runtime

PostgreSQL 16 or later runs as a container with:

- Private Docker network only.
- No public host port binding in production.
- Encrypted data volume.
- Production TLS enabled for client connections.
- Health check for readiness.
- Resource monitoring for disk, connections, locks, and query latency.

### Database Roles

| Role | Intended Use | Prohibited Capabilities |
|---|---|---|
| Migration/Admin role | Schema migrations and controlled operational maintenance | Must not be used by runtime app containers. |
| Runtime API role | Normal application API operations | No audit update/delete grants; no broad schema ownership; no superuser privileges. |
| Runtime worker role | Internal job operations | No audit update/delete grants; no superuser privileges. |
| Read-only/report role | Future reporting or admin diagnostics where needed | No mutation privileges. |
| Backup role | Logical backups | No application mutation privileges. |

### Audit Immutability Controls

Audit integrity uses both application design and infrastructure/database controls:

- Runtime roles do not receive update or delete grants on audit tables.
- Database trigger or policy rejects update/delete on audit tables except controlled migration/admin contexts.
- Audit hash-chain fields are persisted in PostgreSQL.
- Backup and restore verification includes audit hash-chain verification.
- Application containers do not receive credentials capable of deleting or rewriting audit history.

## Storage and Encryption

Production cannot run real financial records on unencrypted storage.

| Storage Area | Encryption Requirement | Backup Requirement |
|---|---|---|
| PostgreSQL data volume | Encrypted host disk or encrypted cloud volume | Daily encrypted logical backup. |
| Application-managed file volume | Encrypted host disk or encrypted cloud volume | Daily encrypted file backup once files exist. |
| Log volume | Encrypted host disk or encrypted cloud volume | Retention in log store; backup or export policy before production. |
| Backup destination | Encrypted volume or encrypted remote target | Retain 35 daily and 12 monthly backups. |
| Secrets files | Root-owned filesystem outside repo with strict permissions | Backed up only through approved secret rotation/recovery procedure. |

If cloud block storage is used for the VPS, provider-level volume encryption must be enabled. If the host is self-managed, full-disk encryption or equivalent encrypted volume controls are required.

## Secrets and Configuration

Production secrets are provided through Docker Compose secrets or root-owned files outside the repository. Real `.env` files must not be committed.

Required production secrets include at least:

- Database passwords for runtime, migration/admin, backup, and read-only roles.
- Session secret or cookie signing/encryption material as required by implementation.
- MFA TOTP encryption key material.
- CSRF secret if implementation uses signed CSRF tokens.
- Caddy or dashboard admin credentials if applicable.
- Backup encryption key.
- Future SMTP, storage, and document service secrets after UOW-08.

Secrets must have documented rotation steps before production. The application configuration layer must support a future migration to a managed secrets service without rewriting domain modules.

## Logging Infrastructure

Production logs are structured container logs shipped to Loki or equivalent local log storage.

| Log Source | Required Content | Notes |
|---|---|---|
| Caddy access logs | Timestamp, request method/path, status, duration, source metadata where safe | Must not log sensitive cookies or tokens. |
| API logs | Timestamp, level, correlation ID, safe message, component, security-event category where applicable | Application redaction is mandatory. |
| Worker logs | Timestamp, level, correlation ID where applicable, job/cleanup event category | No payload secrets. |
| PostgreSQL logs | Startup, connection errors, slow/error queries where safe | Avoid logging parameter values containing sensitive data. |
| Backup logs | Backup start/end, result, duration, destination label, verification result | No backup encryption keys. |

Log retention is at least 90 days. Application containers must not have credentials or mounts that allow deleting log history. Administrative log deletion is a controlled host operation, not an app capability.

## Monitoring and Alerting

Prometheus/Grafana or equivalent local stack is required for first production.

### Required Dashboards

- Service health and restart count.
- API health and latency.
- PostgreSQL availability, storage, connection count, and query latency.
- Disk usage for data, logs, backups, and file volumes.
- Backup success/failure and last successful backup timestamp.
- Security event summary for repeated authentication failures, authorization failures, privilege changes, and MFA events.

### Required Alerts

| Alert | Minimum Trigger Intent |
|---|---|
| Repeated authentication failures | Abnormal rate or threshold of failed login attempts. |
| Authorization failures | Abnormal rate of denied protected-resource access. |
| Privilege or MFA changes | Any administrative role, privilege, or MFA reset/change event. |
| Backup failure | Any failed scheduled backup or missed expected backup window. |
| Restore verification failure | Any failed staging restore rehearsal or audit verification. |
| Disk pressure | Data, log, or backup volume reaches operational threshold. |
| Service health | API, web, worker, database, reverse proxy, log store, or metrics service unhealthy. |

Production must configure at least one alert notification contact before real financial data is used. The alert transport can be email, webhook, or a monitored operations channel; exact adapter implementation belongs to deployment configuration and later support integration.

## Backup and Restore

### Backup Policy

| Backup Type | Frequency | Retention | Verification |
|---|---|---|---|
| PostgreSQL logical backup | Daily | 35 daily and 12 monthly | Backup command exits successfully and backup file decrypts. |
| Persistent file backup | Daily once files exist | 35 daily and 12 monthly | Backup manifest matches expected files. |
| Configuration/secrets recovery material | On change | Current plus prior approved rotation where feasible | Recovery process documented and access restricted. |

Backups must be encrypted before leaving the host or before being written to shared storage. Backup encryption keys must not be stored in the same repository or same unprotected location as backup files.

### Restore Policy

Before production:

1. Restore the latest backup into staging.
2. Run database migration compatibility checks.
3. Run audit hash-chain verification.
4. Run application smoke tests for sign-in, audit query, settings, approvals, and support intent persistence.
5. Record restore rehearsal evidence in operational notes.

Manual restore from backup is the approved recovery model. Automated failover and zero-downtime continuity are explicitly not part of first implementation.

## Support Intent Infrastructure

UOW-01 persists support intents in PostgreSQL. No real SMTP, PDF, filesystem adapter, external storage adapter, or job dispatch is enabled before UOW-08.

The worker container may run internal cleanup jobs, such as expired sessions, expired invitations, expired password reset requests, and retention-safe operational maintenance. Support intent dispatch remains disabled or null/test-only until UOW-08.

## Capacity and Scaling

First infrastructure is sized for the approved first scope:

- One HOA/subdivision.
- Up to 1,000 homeowner users.
- Up to 25 operational users.
- Up to 50 concurrent authenticated sessions.

Scaling posture:

- Use PostgreSQL indexes and pagination before adding cache layers.
- Do not add Redis in first implementation.
- Do not add Kubernetes or autoscaling in first implementation.
- Monitor CPU, memory, database latency, disk, and queue/intent growth.
- Reopen requirements before multi-HOA, material concurrency increase, or public high-traffic exposure.

## Production Readiness Gate

Production with real financial records is blocked until all of the following are verified:

- Public DNS approved for the production hostname.
- TLS certificate active and HTTP redirects to HTTPS.
- HSTS configured for production.
- Host firewall exposes only approved public ports.
- PostgreSQL is private, encrypted at rest, and using TLS for production connections.
- Runtime database roles lack audit update/delete privileges.
- Audit update/delete database trigger or policy is active.
- Production secrets are outside the repository with strict permissions.
- No real `.env` file is committed.
- Daily encrypted database backup is configured.
- Daily encrypted file backup hook is configured or explicitly marked pending until files exist.
- Staging restore rehearsal completed successfully.
- Audit hash-chain verification runs after restore.
- Log retention is at least 90 days.
- Monitoring dashboards are reachable by administrators.
- At least one alert notification contact is configured.
- Production images use pinned tags or immutable digests.
- Dependency lockfile, vulnerability scan command, and SBOM command are carried into Code Generation and Build/Test.

## Deferred to Code Generation

- Exact Docker Compose files.
- Dockerfiles and image tags.
- Caddy configuration.
- PostgreSQL TLS configuration files and certificate paths.
- Database migrations, grants, triggers, and policies.
- Backup scripts and verification scripts.
- Health check endpoints.
- Prometheus/Grafana/Loki configuration files.
- App configuration schema and secret file names.
- Dependency lockfile, vulnerability scan command, and SBOM command.

## Security Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-01 | Compliant | Production storage requires encrypted volumes for database, files, logs, and backups; TLS is required for HTTPS and production PostgreSQL connections. |
| SECURITY-02 | Compliant | Caddy is the network-facing intermediary and must emit access logs to persistent log storage. |
| SECURITY-03 | Compliant | Structured app logs are shipped to centralized local log storage with redaction and correlation IDs. |
| SECURITY-04 | Compliant | TLS/HSTS are infrastructure requirements and app middleware retains required header/CSP responsibility. |
| SECURITY-05 | Compliant | Request size and schema validation remain app responsibilities; infrastructure keeps database private and requires parameterized data access via approved stack. |
| SECURITY-06 | Compliant | Database roles are separated by runtime, migration/admin, backup, and read-only responsibilities with least privilege. |
| SECURITY-07 | Compliant | Only reverse proxy ports 80 and 443 are public; database and app services remain private. |
| SECURITY-08 | Compliant | Strict CORS, server-side sessions, and backend authorization remain required; infrastructure prevents direct database/app exposure. |
| SECURITY-09 | Compliant | Production requires non-default secrets, patched host/runtime, no committed real `.env`, safe errors, and no public storage. |
| SECURITY-10 | Compliant | Pinned images, lockfile, vulnerability scan, trusted registries, and SBOM are required before production. |
| SECURITY-11 | Compliant | Public endpoints are protected by reverse proxy, rate-limited app design, private networks, and separated security components. |
| SECURITY-12 | Compliant | Secure session, MFA, adaptive hashing, brute-force protection, and no hardcoded credentials are supported by secrets, TLS, and private database design. |
| SECURITY-13 | Compliant | Critical changes remain auditable; audit immutability uses database roles, triggers/policies, backups, and hash-chain verification. |
| SECURITY-14 | Compliant | Persistent logs, 90-day retention, dashboards, alert rules, and app-inaccessible log deletion are required. |
| SECURITY-15 | Compliant | Health checks, fail-closed production gates, backup/restore verification, and service isolation support safe failure behavior. |

## PBT Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| PBT-01 through PBT-10 | N/A for Infrastructure Design | Infrastructure Design does not create application test implementations. PBT requirements remain active for Code Generation and Build/Test, including `fast-check`, domain generators, shrinking, seed logging, and complementary example tests. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
- Code spans are limited to service names, environment labels, identifiers, and file names.
