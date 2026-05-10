# HOA Billing System

TypeScript modular monolith for the HOA billing system.

## Workspace

- `apps/api`: NestJS API.
- `apps/web`: Next.js web app.
- `apps/worker`: internal worker process.
- `packages/shared`: shared kernel, schemas, permissions, and test generators.
- `prisma`: PostgreSQL schema and migrations.
- `docker`: local, staging, and production Docker Compose artifacts.
- `ops`: backup, restore, audit verification, and readiness scripts.

## Security Baseline

This repository must not contain real secrets. Use `.env.example` as a placeholder reference only. Production secrets must be mounted through Docker Compose secrets or root-owned files outside the repository.

Production use with real financial records is blocked until TLS, encrypted storage, backups, restore rehearsal, log retention, alerting, non-default secrets, and audit immutability controls are verified.

## Development Commands

Install dependencies after network access is available:

`npm install`

Common commands:

- `npm run typecheck`
- `npm run build`
- `npm test`
- `npm run test:pbt`
- `npm audit`
- `npm run prisma:generate`
- `npm run docker:local`

## AIDLC Boundary

Application code belongs in the workspace root. AIDLC documentation belongs under `aidlc-docs/`.
