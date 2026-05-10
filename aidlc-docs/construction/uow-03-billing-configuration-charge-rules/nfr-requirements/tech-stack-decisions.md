# UOW-03 Tech Stack Decisions

## Unit

- **Unit ID**: UOW-03
- **Unit Name**: Billing Configuration and Charge Rules
- **Stage**: NFR Requirements

## Summary

UOW-03 reuses the approved TypeScript modular monolith stack from UOW-01 and the established documentation and testing posture from UOW-02. No rule engine, workflow engine, external cache, external search service, or new database technology is introduced for billing configuration and charge rules.

## Core Stack

| Area | Decision | Rationale |
|---|---|---|
| Language | TypeScript | Matches approved architecture and supports shared contracts across API, web, worker, and shared packages. |
| Backend framework | NestJS | Reuses UOW-01 module, guard, validation, approval, audit, and service patterns. |
| Frontend framework | Next.js with React | Reuses the approved operational staff shell and React component testing posture. |
| Database | PostgreSQL | Supports transactional activation, effective-date indexes, immutable version history, and first-scope resolution performance. |
| ORM/data access | Prisma | Reuses approved persistence approach and transaction boundaries. |
| Validation | Shared TypeScript domain validators plus Zod request schemas | Keeps validation reusable across API, shared contracts, and tests while enforcing request shape at boundaries. |
| Property-based testing | `fast-check` | Required for TypeScript PBT with custom generators, shrinking, and seed reproducibility. |
| Deployment target | Local or single-server Docker for first implementation | Matches approved first implementation scope. |

## Persistence and Query Decisions

| Area | Decision | Notes |
|---|---|---|
| Effective-date lookup | PostgreSQL indexed lookup | Index by configuration identity, scope, rule type, status, and effective interval. |
| Non-overlap scope | Same configuration identity, scope, and rule type | Distinct charge types, payment methods, and template references may coexist for the same date range when identities differ. |
| Configuration storage | Typed tables or typed persistence models through Prisma | Avoid unindexed JSON-only settings rows for financially sensitive lookup paths. |
| Resolution output | Typed DTOs and snapshots | Downstream units consume service contracts and snapshot exact version IDs and rule metadata. |
| Batch consumption | Same-context snapshot reuse within a transaction or batch run | Avoid repeated identical resolution without introducing a cross-process cache. |

## Validation and Error Decisions

| Area | Decision | Notes |
|---|---|---|
| Request validation | Zod-style request schemas | Every endpoint requires explicit string, date, enum, decimal, array, payload size, and pagination bounds. |
| Domain validation | Shared TypeScript validators | Covers effective-date non-overlap, approval requirement, decimal precision, charge type eligibility, and immutable state transitions. |
| Decimal behavior | Decimal-safe helpers and decimal-safe persistence types | JavaScript floating point is invalid for financial decimal behavior. |
| Error handling | UOW-01 safe error and correlation ID conventions | Missing/ambiguous config, validation, authorization, and approval failures return safe reason-coded errors. |
| Fail-closed behavior | Required | Downstream generation must block on missing, ambiguous, draft-only, rejected, or unauthorized configuration. |

## Authorization, Approval, and Audit Decisions

| Area | Decision | Notes |
|---|---|---|
| Actor context | Reuse UOW-01 `ActorContext` | Required for every protected UOW-03 endpoint. |
| Route authorization | Reuse UOW-01 guards/policies | Protected configuration endpoints require backend authorization. |
| Object/scope authorization | UOW-03 resource checks using UOW-01 contracts | Required for drafts, versions, approval state, resolution preview, and history views. |
| Approval workflow | Reuse UOW-01 Approval Workflow | Financial-impacting activation requires Treasurer approval; no new workflow engine is introduced. |
| Audit implementation | Reuse UOW-01 audit service contract | Activation, immutable violation attempts, risky changes, and denials are auditable. |
| Sensitive logging | Structured logs with redaction | Logs include safe identifiers and correlation IDs, not full sensitive payloads. |

## Frontend Decisions

| Area | Decision | Notes |
|---|---|---|
| Component testing | React Testing Library | Reuses UOW-01/UOW-02 frontend test strategy. |
| Accessibility | WCAG 2.2 AA-oriented baseline | Applies to UOW-03 forms, tables, history, approval panels, and resolution preview. |
| Automation hooks | Stable `data-testid` values | Required by Functional Design components. |
| Normal editing model | Form/table workflows, not JSON-only editor | JSON-only configuration is not acceptable for normal staff MVP workflows. |
| Safe errors | Correlation-ID capable safe error displays | No stack traces, raw database errors, or hidden authorization facts. |

## Testing Stack Decisions

| Area | Decision | Rationale |
|---|---|---|
| Backend test runner | Jest-compatible stack | Aligns with UOW-01 and NestJS. |
| Frontend test runner | React Testing Library | Tests staff-visible configuration behavior and safe error states. |
| Integration tests | Required | Persistence-backed effective-date lookup, activation, approval linkage, audit, authorization, and resolution failure modes require database coverage. |
| Property-based testing | `fast-check` | Required by PBT-09 and selected for TypeScript. |
| PBT generators | Domain-specific custom generators | Required for effective versions, rate rules, cycles, due/grace rules, rounding rules, manual charges, numbering formats, template references, payment methods, and state transitions. |
| Example tests | Required for critical workflows | PBT complements but does not replace concrete approval, activation, fail-closed, and resolution examples. |

## Rejected Stack Additions

| Technology | Decision | Rationale |
|---|---|---|
| Rule engine | Rejected for UOW-03 first implementation | Current rules are explicit, typed, effective-dated configuration records; a rule engine would add audit and validation risk without a proven need. |
| Workflow engine | Rejected for UOW-03 first implementation | UOW-01 Approval Workflow covers Treasurer approval; adding another workflow engine would duplicate responsibility. |
| Redis or external cache | Rejected for UOW-03 first implementation | Indexed PostgreSQL and same-context snapshot reuse are sufficient for first-scope targets. |
| External search service | Rejected for UOW-03 first implementation | Staff configuration list/history queries fit PostgreSQL indexed and paginated access. |
| New database technology | Rejected | PostgreSQL remains the transactional source of truth. |
| JSON-only settings store | Rejected | Financially sensitive effective-date resolution needs typed validation and indexed lookup paths. |

## PBT-09 Compliance

| Requirement | Decision |
|---|---|
| Framework selected | `fast-check` |
| Language | TypeScript |
| Custom generators | Required for UOW-03 domain objects and state machines |
| Shrinking | Must remain enabled |
| Seed reproducibility | Required; seed must be logged on failure |
| Test runner integration | Jest-compatible backend and frontend setup |
| Project dependency | Already present from UOW-01 Code Generation dependency baseline |

## Deferred Decisions for NFR Design

| Deferred Item | Reason |
|---|---|
| Exact index definitions | Requires schema-level NFR Design and Code Generation. |
| Exact transaction isolation/concurrency mechanism | Requires Prisma/PostgreSQL implementation design. |
| Exact DTO shapes | Requires NFR Design alignment with downstream snapshot contracts. |
| Exact metric names and alert thresholds | Requires NFR Design, Infrastructure Design, or Operations planning. |
| Exact decimal helper implementation | Requires Code Generation alignment with Prisma/PostgreSQL decimal support. |
| Exact integration test database setup | Code Generation and Build/Test concern. |

## Security Baseline Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-03 | Compliant | Structured logging with redaction is selected. |
| SECURITY-05 | Compliant | Zod request schemas and shared domain validators are selected. |
| SECURITY-08 | Compliant | Backend route, object/scope authorization, and Treasurer approval are selected. |
| SECURITY-09 | Compliant | Safe errors and no new default credential surface are selected. |
| SECURITY-10 | Compliant | No new dependency family or external service is introduced. |
| SECURITY-11 | Compliant | Approval, authorization, audit, decimal validation, and fail-closed resolution remain layered controls. |
| SECURITY-13 | Compliant | Critical configuration changes remain auditable and immutable after activation. |
| SECURITY-14 | Compliant | Denied access, failed resolution, and risky configuration changes require observability. |
| SECURITY-15 | Compliant | Fail-closed behavior and safe structured errors are selected. |

## Property-Based Testing Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| PBT-07 | Compliant | Domain-specific generators are selected for UOW-03 PBT. |
| PBT-08 | Compliant | Shrinking and seed reproducibility are required. |
| PBT-09 | Compliant | `fast-check` is selected and already fits the TypeScript stack. |
| PBT-10 | Compliant | Example-based tests remain required alongside PBT. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
- No application code is generated.
