# UOW-01 Deployment Summary

## Generated Artifacts

| Area | Paths |
|---|---|
| API image | `docker/api/Dockerfile` |
| Web image | `docker/web/Dockerfile` |
| Worker image | `docker/worker/Dockerfile` |
| Compose | `docker/docker-compose.local.yml`, `docker/docker-compose.staging.yml`, `docker/docker-compose.production.yml` |
| Reverse proxy | `docker/caddy/Caddyfile` |
| Observability | `docker/observability/prometheus.yml` |
| Environment placeholders | `docker/env/staging.env.example`, `docker/env/production.env.example` |
| Operations | `ops/backup/`, `ops/restore/`, `ops/audit/`, `ops/readiness/` |
| CI | `.github/workflows/ci.yml` |

## Production Readiness Controls

- TLS termination through Caddy.
- Only ports 80 and 443 exposed publicly in production Compose.
- PostgreSQL is private to Docker networks.
- Production storage must be encrypted.
- Production PostgreSQL TLS is required by configuration validation.
- Secrets are placeholders only and must be mounted externally before production.
- Daily backup and restore rehearsal scripts are present as operational hooks.
- Audit immutability trigger/policy is included in migration SQL.
- Monitoring and alerting placeholders are present and must be completed before real financial records.

## Supply Chain

- Docker base image tags are pinned.
- CI uses Node `20.17.0`.
- CI runs Prisma Client generation, typecheck, build, tests, PBT, dependency audit, and SBOM placeholder.
- Root scripts include dependency audit and SBOM placeholders.
- `package-lock.json` has been generated.
- `npm audit` passed with zero known vulnerabilities after upgrading vulnerable direct dependencies and adding a `postcss` override required by the current Next.js dependency tree.
