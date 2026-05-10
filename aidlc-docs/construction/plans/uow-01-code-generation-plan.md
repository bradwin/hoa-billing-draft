# UOW-01 Code Generation Plan

## Unit

- **Unit ID**: UOW-01
- **Unit Name**: Platform Foundation, Access, Settings, Audit, and Approval Core
- **Stage**: Code Generation, Part 1 - Planning
- **Current Gate**: Waiting for approval of this plan before application code is generated

## Purpose

Generate the first implementation slice for UOW-01 in the workspace root. This unit establishes the TypeScript monorepo, shared kernel, database schema, API shell, access control, sessions, MFA, audit, settings shell, approval core, support intent contracts, frontend foundation screens, tests, PBT generators, and deployment artifacts needed by later units.

This plan is the single source of truth for UOW-01 Code Generation. Part 2 must follow the step sequence below exactly and mark each checkbox immediately after the step is completed.

## Workspace and Code Location

| Area | Location |
|---|---|
| Workspace root | `/Users/bradwin/Development/codex/hoa-billing` |
| Application code | Workspace root only |
| AIDLC documentation | `aidlc-docs/` only |
| Code summaries | `aidlc-docs/construction/uow-01-platform-foundation/code/` |
| Root package manager | npm workspaces with `package-lock.json` |
| Application shape | TypeScript modular monolith with `apps/api`, `apps/web`, `apps/worker`, `packages/shared`, `prisma`, `docker`, and `ops` |

## Planning Checklist

- [x] Read UOW-01 Functional Design artifacts.
- [x] Read UOW-01 NFR Requirements artifacts.
- [x] Read UOW-01 NFR Design artifacts.
- [x] Read UOW-01 Infrastructure Design artifacts.
- [x] Read unit story map and dependencies.
- [x] Read Code Generation rule details.
- [x] Confirm application code must be generated in workspace root, never `aidlc-docs/`.
- [x] Identify exact generation path families.
- [x] Create this code generation plan.
- [x] Receive explicit approval for this code generation plan.
- [x] Execute Part 2 generation steps in order.
- [x] Present standardized Code Generation completion message.

## Story Traceability

| Story | UOW-01 Implementation Coverage |
|---|---|
| US-001 Invite and activate users | User invitation, activation, login, password reset, server-managed sessions, administrative MFA support, fixed role binding, generic auth failures, notification intent records for invitation/reset delivery. |
| US-002 Manage HOA and system settings | HOA profile shell, settings category/value contracts, delegated setting category placeholders, setting validation, setting authorization, audit on setting changes, support intent contracts for later email/storage implementations. |
| US-003 Enforce permission matrix | Fixed role/permission matrix, backend guards, deny-by-default helper, object authorization contract, safe authorization errors, security-event audit on denials, frontend role-aware navigation that is not authoritative. |

## Unit Dependencies and Boundaries

| Dependency Area | Decision |
|---|---|
| Direct prerequisites | None. UOW-01 is the first construction unit. |
| Provides to later units | Actor context, session/auth guards, permission checks, object authorization helpers, audit API, approval API, shared value objects, transaction context, support intent contracts. |
| Must not implement | Invoice, payment, receipt, penalty, credit, adjustment, account balance source records, SMTP adapter, PDF generation, concrete file storage adapter, real job dispatch. |
| Support integration | UOW-01 persists support intents and may provide null/test adapters only. UOW-08 implements real adapters. |
| Financial boundary | Approval core stores requests and delegates approved effects; it must not mutate financial source records. |

## Owned Data Model Scope

UOW-01 owns the first Prisma schema for:

- Users, roles, permission matrix, invitations, sessions, login failures, password reset requests.
- MFA enrollments and recovery code hashes.
- Audit entries with hash-chain fields and security event categorization.
- Approval requests and approval decision metadata.
- Setting categories and setting values.
- Support intents for notification, document, storage, and job requests.
- Shared references such as `ResourceRef`, correlation IDs, and safe JSON metadata fields.

## Exact Path Families

| Path | Purpose |
|---|---|
| `package.json` | Root npm workspace scripts and dependency declarations. |
| `package-lock.json` | npm dependency lockfile generated or updated during dependency install if available. |
| `tsconfig.base.json` | Shared TypeScript configuration. |
| `apps/api/` | NestJS API shell, modules, controllers, services, guards, Prisma integration, and API tests. |
| `apps/web/` | Next.js frontend foundation screens and React tests. |
| `apps/worker/` | Worker entrypoint and internal cleanup/support-intent job stubs. |
| `packages/shared/` | Shared kernel, schemas, domain types, permissions, errors, PBT generators, and shared tests. |
| `prisma/` | Prisma schema and migration SQL for UOW-01. |
| `docker/` | Dockerfiles, Caddy configuration, and observability/backup placeholders. |
| `ops/` | Backup, restore, audit verification, and production readiness scripts/placeholders. |
| `.github/workflows/` | CI workflow with build/test/audit placeholders if repository CI is appropriate. |
| `aidlc-docs/construction/uow-01-platform-foundation/code/` | Markdown code generation summaries only. |

## Generation Steps

### Step 1: Project Structure Setup

- [x] Create root npm workspace files: `package.json`, `tsconfig.base.json`, `.gitignore`, `.env.example`, and workspace README.
- [x] Create directory skeletons for `apps/api`, `apps/web`, `apps/worker`, `packages/shared`, `prisma`, `docker`, `ops`, and UOW-01 code summaries.
- [x] Configure scripts for typecheck, lint placeholder, test, PBT replay, Prisma generate/migrate, and Docker Compose commands.
- [x] Ensure `.env.example` contains placeholders only and no real secrets.

### Step 2: Shared Kernel Generation

- [x] Generate `packages/shared/src/kernel/` with `ActorContext`, `AuditContext`, `ResourceRef`, `DomainError`, `CorrelationId`, `Money`, `DateRange`, `BillingPeriod`, pagination, transaction contracts, and command result types.
- [x] Enforce PHP-only `Money` currency and reject invalid decimal strings.
- [x] Add stable domain error codes and safe message helpers.
- [x] Export shared kernel through `packages/shared/src/index.ts`.

### Step 3: Shared Validation and Schema Generation

- [x] Generate `packages/shared/src/schemas/` with Zod schemas for auth, settings, audit query, approval requests, support intents, resource refs, pagination, and safe metadata.
- [x] Add explicit string length, payload, enum, ID, and pagination bounds.
- [x] Ensure schemas reject unknown setting keys and invalid resource references.
- [x] Add shared schema tests.

### Step 4: Permission Matrix and Authorization Contracts

- [x] Generate `packages/shared/src/permissions/` with fixed roles, permission codes, role matrix, deny-by-default resolver, and object authorization contracts.
- [x] Include explicit role rules for System Administrator, Treasurer, Billing Staff, Board Member, and Homeowner.
- [x] Add tests proving unknown roles, unknown permissions, and missing matrix entries deny.

### Step 5: Prisma Schema and Migration Scripts

- [x] Generate `prisma/schema.prisma` for UOW-01 entities and indexes.
- [x] Generate an initial SQL migration under `prisma/migrations/`.
- [x] Include database constraints for unique tokens/digests, session lookups, audit query filters, approval state, settings keys, and support intent status.
- [x] Include audit immutability database controls as migration SQL comments or executable trigger/policy scripts where practical.
- [x] Generate Prisma client integration placeholders.

### Step 6: Backend API Shell Setup

- [x] Generate `apps/api` NestJS project files, module bootstrap, config module, global validation pipe, global error filter, correlation middleware, logging provider, and health endpoints.
- [x] Configure secure defaults for CORS allowlist, request size limits, safe errors, and structured logs.
- [x] Ensure no endpoint trusts frontend navigation state for authorization.

### Step 7: Backend Persistence and Transaction Layer

- [x] Generate Prisma service, transaction helper, repository base contracts, and repository implementations for UOW-01 entities.
- [x] Separate runtime app behavior from migration/admin responsibilities in code comments and documentation.
- [x] Ensure audit repository exposes append/query only and no update/delete methods.

### Step 8: Audit and Security Event Backend Generation

- [x] Generate Audit module with append-only audit service, hash-chain computation, security-event recording, safe metadata redaction, filtered/paginated audit query, and hash verification service.
- [x] Add unit tests for append-only behavior, redaction, hash-chain verification, and filtered pagination.
- [x] Add PBT for audit append preserving existing entries and hash-chain consistency.

### Step 9: Authentication, Sessions, and Abuse Protection Backend Generation

- [x] Generate Auth module for invitations, activation, login, logout, password reset request/complete, session resolution, session revocation, login failure counters, and generic failure responses.
- [x] Use Argon2id as primary password hash dependency in `package.json` with documented bcrypt fallback only if runtime support blocks Argon2id.
- [x] Store only token/session digests, never raw tokens.
- [x] Add unit tests for generic failures, expired invitations, session revocation, reset token single-use, and lockout/progressive delay behavior.
- [x] Add PBT for logout idempotence and reset-token single-use.

### Step 10: MFA Backend Generation

- [x] Generate MFA module for TOTP enrollment, enrollment verification, challenge verification, encrypted secret abstraction, recovery-code generation/hashing, recovery-code consumption, MFA reset, and audit events.
- [x] Ensure administrative MFA cannot be disabled through self-service.
- [x] Add tests for required MFA roles, pending sessions, recovery code single-use, and secret redaction.

### Step 11: Authorization Backend Generation

- [x] Generate guards/decorators/services for authenticated routes, permission checks, object authorization contracts, route-public markers, and authorization-denial audit.
- [x] Add unit tests and PBT for deny-by-default permission resolution and homeowner resource isolation contracts.

### Step 12: Settings Backend Generation

- [x] Generate Settings module for setting categories, HOA profile shell, delegated category placeholders, settings get/update APIs, schema validation, versioning, and audit entries.
- [x] Add tests for unknown key rejection, permission checks, value validation, and audit on updates.

### Step 13: Approval Core Backend Generation

- [x] Generate Approval module for request creation, pending queue, approve, reject, cancel, apply status placeholders, self-approval prohibition, reason capture, and audit events.
- [x] Ensure approval core delegates approved financial effects through registered handler contracts only.
- [x] Add example tests and stateful PBT for allowed approval transitions and self-approval prohibition.

### Step 14: Support Intent Backend Generation

- [x] Generate Support Intent module for notification, document, storage, and job intents.
- [x] Persist intent records in PostgreSQL and provide null/test adapter contracts only.
- [x] Add tests that UOW-01 does not call real SMTP, PDF, filesystem storage, or external job dispatch.

### Step 15: API Controllers Generation

- [x] Generate REST controllers for auth, MFA, sessions/logout, settings, audit, approvals, support intents, actor context, and health.
- [x] Apply validation, authorization guards, correlation IDs, safe errors, and stable response DTOs to every endpoint.
- [x] Add controller unit tests for validation failures, authorization failures, safe error shape, and successful command/query paths.

### Step 16: Worker Foundation Generation

- [x] Generate `apps/worker` entrypoint, config loading, logging, Prisma access, and internal cleanup job stubs for expired sessions, expired invitations, expired reset requests, and support intent status checks.
- [x] Ensure real support dispatch remains disabled until UOW-08.
- [x] Add worker unit tests for cleanup selection logic where practical.

### Step 17: Frontend App Shell Setup

- [x] Generate Next.js app foundation with auth layout, protected app shell, role-aware navigation, safe error banner, API client, session/actor context loader, and base styling.
- [x] Add required `data-testid` values for automation-friendly UI.
- [x] Ensure frontend role-aware navigation is usability only and never framed as authorization.

### Step 18: Frontend Access Flow Components

- [x] Generate sign-in, activation, password reset request, password reset completion, MFA enrollment, and MFA challenge screens/components.
- [x] Add client-side validation that complements backend validation.
- [x] Ensure sensitive fields are cleared after submit or route change and are never logged.
- [x] Add React Testing Library tests for forms, safe errors, generic auth failures, and MFA states.

### Step 19: Frontend Settings, Audit, and Approval Components

- [x] Generate settings shell, HOA profile form, audit query shell, approval queue shell, and approval decision panel.
- [x] Include stable `data-testid` values documented in Functional Design.
- [x] Add tests for navigation visibility, safe error rendering, required fields, and self-approval UI disablement.

### Step 20: PBT Test Support Generation

- [x] Generate centralized `fast-check` generators under `packages/shared/test/generators/`.
- [x] Include generators for roles, permissions, actor contexts, resource refs, sessions, reset requests, audit entries, approval states, settings, support intents, and shared value objects.
- [x] Add PBT setup with shrinking enabled, failure seed logging, and `PBT_SEED` replay support.
- [x] Ensure PBT tests are clearly named and complement example tests.

### Step 21: Integration Test Skeletons

- [x] Generate backend integration test skeletons for auth/session flow, audit write with protected mutation, settings update, approval decision, and support intent creation.
- [x] Generate frontend integration/component test skeletons for protected shell and foundation workflows.
- [x] Keep tests runnable after dependency installation and database test setup.

### Step 22: Deployment Artifacts Generation

- [x] Generate Dockerfiles for API, web, and worker with pinned base image tags.
- [x] Generate Docker Compose files for local/staging/production skeletons, Caddy config, PostgreSQL service, logging/monitoring placeholders, and backup service placeholder.
- [x] Generate `.dockerignore` and production environment placeholder files with no real secrets.

### Step 23: Operations Script Generation

- [x] Generate `ops/backup/`, `ops/restore/`, `ops/audit/`, and `ops/readiness/` scripts or documented placeholders for database backup, file backup hook, restore rehearsal, audit hash verification, and production readiness checks.
- [x] Ensure scripts never embed real credentials and read secret paths from environment/config.

### Step 24: CI and Supply Chain Generation

- [x] Generate CI workflow or documented CI scripts for install, typecheck, tests, PBT replay, dependency audit, and SBOM command placeholder.
- [x] Ensure production Docker and CI images avoid unpinned `latest` tags.
- [x] Add dependency audit and SBOM scripts to root `package.json`.

### Step 25: Documentation and Code Summaries

- [x] Generate root README with setup, environment, security, test, and Docker instructions.
- [x] Generate `aidlc-docs/construction/uow-01-platform-foundation/code/code-generation-summary.md`.
- [x] Generate `aidlc-docs/construction/uow-01-platform-foundation/code/api-summary.md`.
- [x] Generate `aidlc-docs/construction/uow-01-platform-foundation/code/test-summary.md`.
- [x] Generate `aidlc-docs/construction/uow-01-platform-foundation/code/deployment-summary.md`.

### Step 26: Verification and Cleanup

- [x] Run available local checks that do not require unavailable network dependencies.
- [x] If dependencies are not installed, document the blocked checks and exact commands for Build and Test. Dependencies are installed; no checks are blocked.
- [x] Verify no application code was placed under `aidlc-docs/`.
- [x] Verify no real secrets, raw token examples, or production `.env` values were generated.
- [x] Verify all completed generation checkboxes are marked `[x]`.

Verification executed during Step 26:

- `npm run typecheck`
- `npm test`
- `npm run test:pbt`
- `npm run build`
- `npm run lint`
- `npm audit`

All verification commands passed. Secret scan findings are placeholder file paths or `CHANGE_ME` values only.

## Security Requirements Carried Into Code Generation

- No hardcoded credentials, API keys, session secrets, MFA secrets, backup keys, or real `.env` values.
- Every protected endpoint uses server-side authentication and authorization.
- Authorization is deny by default.
- Object authorization contracts deny missing ownership data.
- CORS uses explicit allowlist configuration.
- Session cookies are secure, httpOnly, and sameSite.
- Passwords use Argon2id primary hashing.
- MFA is required for System Administrator and Treasurer.
- Audit records are append-only by application design and guarded by database grants/triggers.
- Security-sensitive events are audit records and alertable event candidates.
- API validation uses schemas with size and length bounds.
- Errors are safe, stable, and include correlation IDs.
- Structured logs use redaction and must not include secrets, tokens, passwords, MFA codes, or raw session IDs.
- Production deployment artifacts require TLS, encrypted storage, backups, log retention, monitoring, alerting, and readiness gates.

## PBT Requirements Carried Into Code Generation

| PBT Rule | Code Generation Obligation |
|---|---|
| PBT-01 | Carry forward all UOW-01 testable properties from Functional Design. |
| PBT-02 | Add round-trip PBT for value objects such as `Money`, `DateRange`, `BillingPeriod`, and `ResourceRef` where formatting is lossless. |
| PBT-03 | Add invariant PBT for permission resolution, object authorization, safe errors, navigation visibility, and audit append behavior. |
| PBT-04 | Add idempotence PBT for logout and password reset token consumption. |
| PBT-05 | Mark N/A where no separate oracle exists; do not invent weak oracle tests. |
| PBT-06 | Add stateful/model PBT for approval transitions, sessions, password reset, and audit append sequences. |
| PBT-07 | Use centralized domain-specific generators, not primitive-only generators. |
| PBT-08 | Keep shrinking enabled and log seeds; support `PBT_SEED` replay. |
| PBT-09 | Use `fast-check` for TypeScript and include it as a dependency. |
| PBT-10 | Provide example tests for critical paths alongside PBT. |

## Completion Criteria

- The root TypeScript monorepo foundation exists.
- UOW-01 backend, frontend, worker, shared package, Prisma schema, tests, PBT support, deployment artifacts, and documentation summaries are generated.
- US-001, US-002, and US-003 have traceable implementation coverage.
- No financial source-record mutation is implemented in UOW-01.
- No real support adapters are implemented before UOW-08.
- No application code is generated under `aidlc-docs/`.
- Security Baseline and Property-Based Testing extension requirements are represented in code, tests, and summaries.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant for planning | The plan includes encryption/TLS-ready deployment artifacts, structured logging, HTTP security, validation, least-privilege database roles, restrictive networking, access control, hardening, supply-chain controls, secure design, credential management, audit integrity, monitoring/alerting, and fail-safe defaults. |
| Property-Based Testing | Compliant for planning | The plan explicitly includes PBT-01 through PBT-10 obligations, central `fast-check` generators, seed replay, shrinking, stateful properties, and example-test complement coverage. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
- No code blocks are included in this plan.
