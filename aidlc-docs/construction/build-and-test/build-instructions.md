# Build Instructions

## Prerequisites

| Item | Requirement |
|---|---|
| Runtime | Node.js `>=20.11.0` |
| Package manager | npm `>=10.0.0` |
| Build system | npm workspaces |
| Database tooling | Prisma `5.18.0` |
| Database | PostgreSQL for runtime and migration validation |

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string used by Prisma migrations and runtime services. |
| Auth/session secrets | Required by deployment configuration before production use. |
| SMTP/file-storage variables | Not used by UOW-06 directly; later UOW-08 delivery services own concrete delivery configuration. |

## Build Steps

### 1. Install Dependencies

```bash
npm ci
```

### 2. Generate Prisma Client

```bash
npm run prisma:generate
```

### 3. Build All Workspaces

```bash
npm run build
```

### 4. Verify Build Success

Expected results:

| Area | Expected Output |
|---|---|
| `@hoa/shared` | TypeScript compilation succeeds and emits `dist/`. |
| `@hoa/api` | TypeScript compilation succeeds. |
| `@hoa/web` | Next.js production build completes and lists generated routes, including `/uow06/penalties` and `/portal/delinquency`. |
| `@hoa/worker` | TypeScript compilation succeeds. |

## Troubleshooting

| Failure | Likely Cause | Resolution |
|---|---|---|
| Dependency install fails | Stale lockfile, unsupported Node/npm version, or registry access failure. | Use Node `>=20.11.0`, npm `>=10.0.0`, then rerun `npm ci`. |
| Prisma generation fails | Invalid `DATABASE_URL` or schema syntax issue. | Validate `.env`, run `npm run prisma:generate`, and inspect `prisma/schema.prisma`. |
| TypeScript build fails | Interface drift across shared/API/web packages. | Run `npm run typecheck`, fix the first compile error, then rerun `npm run build`. |
| Next.js build fails | Route or component compile error. | Run `npm test -w @hoa/web`, fix frontend typing/rendering errors, then rerun `npm run build`. |
