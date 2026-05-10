# Build Instructions

## Scope

These instructions build the HOA Billing System TypeScript modular monorepo after UOW-01 and UOW-02 generation.

## Prerequisites

| Requirement | Value |
|---|---|
| Node.js | `>=20.11.0` |
| npm | `>=10.0.0` |
| Package manager | npm workspaces with `package-lock.json` |
| Database engine | PostgreSQL 16 for runtime and migration validation |
| Docker | Required for Compose-based local, staging, and production validation |
| Prisma Client | Generated with `npm run prisma:generate` |

## Environment Variables

Use `.env.example` as the local placeholder reference. Do not copy real secrets into the repository.

Required for API and worker runtime:

- `DATABASE_URL`
- `NODE_ENV`
- `API_PORT`
- `WEB_ORIGIN_ALLOWLIST`
- `SESSION_SECRET_FILE`
- `CSRF_SECRET_FILE`
- `MFA_SECRET_ENCRYPTION_KEY_FILE`

Required for production readiness checks:

- `POSTGRES_TLS_REQUIRED=true`
- `STORAGE_ENCRYPTION_REQUIRED=true`
- `BACKUP_ENCRYPTION_REQUIRED=true`
- `LOG_RETENTION_DAYS`
- `SECURITY_ALERT_CONTACT`

## Build Steps

### 1. Install Dependencies

```bash
npm ci
```

Use `npm install` only when intentionally updating `package-lock.json`.

### 2. Generate Prisma Client

```bash
npm run prisma:generate
```

This must run after schema changes and before TypeScript build/typecheck on fresh machines, CI runners, and Docker build stages.

### 3. Typecheck All Source and Test Files

```bash
npm run typecheck
```

Expected result: TypeScript exits with status `0`.

### 4. Build All Workspaces

```bash
npm run build
```

Expected result: shared package, API, web, and worker builds exit with status `0`.

### 5. Optional Docker Build Validation

```bash
docker compose -f docker/docker-compose.local.yml build
```

Production images use pinned Node base image tags. The API image runs Prisma Client generation during build.

## Build Artifacts

| Area | Artifact Path |
|---|---|
| API | `apps/api/dist/` |
| Web | `apps/web/.next/` |
| Worker | `apps/worker/dist/` |
| Shared package | `packages/shared/dist/` |
| Prisma Client | `node_modules/@prisma/client/` |

Build artifacts are ignored by git and should be regenerated in CI or deployment builds.

## Current Verified Build Commands

These commands passed after UOW-02 generation:

```bash
npm run prisma:generate
npm run typecheck
npm run build
npm run lint
npm audit --audit-level=moderate
```

## Troubleshooting

### Dependency Installation Fails

Cause: npm registry or network access unavailable.

Fix:

```bash
npm ci
```

Run again after network access is restored. Do not manually edit `node_modules`.

### Prisma Client Types Are Missing

Cause: `npm run prisma:generate` was not executed after install or after `prisma/schema.prisma` changed.

Fix:

```bash
npm run prisma:generate
npm run typecheck
```

### Build Resolves `@hoa/shared` Incorrectly

Cause: the app workspace build is running before `packages/shared/dist/` exists.

Fix:

```bash
npm run build --workspace @hoa/shared
npm run build
```

### Next.js Build Fails During Prerender

Cause: runtime imports from `@hoa/shared` are not available or web build configuration changed.

Fix:

```bash
npm run build --workspace @hoa/shared
npm run build --workspace @hoa/web
```

Then inspect the prerender error and verify `apps/web/tsconfig.json` maps `@hoa/shared` to `packages/shared/dist/index`.
