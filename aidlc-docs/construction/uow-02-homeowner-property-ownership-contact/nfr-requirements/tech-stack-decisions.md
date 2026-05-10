# UOW-02 Tech Stack Decisions

## Unit

- **Unit ID**: UOW-02
- **Unit Name**: Homeowner, Property, Ownership, and Contact Requests
- **Stage**: NFR Requirements

## Summary

UOW-02 reuses the approved TypeScript modular monolith stack from UOW-01. No new database, search, cache, queue, document, email, or import technology is introduced for homeowner/property master data.

## Core Stack

| Area | Decision | Rationale |
|---|---|---|
| Language | TypeScript | Matches approved architecture and supports shared UOW-02 contracts across API, web, worker, and shared packages. |
| Backend framework | NestJS | Reuses UOW-01 module, guard, validation, and service patterns. |
| Frontend framework | Next.js with React | Reuses the approved operational and homeowner portal shell. |
| Database | PostgreSQL | Supports transactional ownership changes, unique constraints, normalized indexes, and single-HOA search needs. |
| ORM/data access | Prisma | Reuses approved persistence approach and transaction boundaries. |
| Search | PostgreSQL indexed search | Satisfies first-implementation scale without introducing external search infrastructure. |
| Deployment target | Local or single-server Docker | Matches approved first implementation scope. |

## Validation and Error Decisions

| Area | Decision | Notes |
|---|---|---|
| Schema validation | Reuse UOW-01 Zod-style schema validation posture | Exact implementation belongs to Code Generation; every endpoint requires validation. |
| Decimal validation | Decimal string validation for lot area | Must enforce square meters with up to four fractional digits and billable greater-than-zero rules. |
| Date validation | Half-open interval validation for ownership and billing-account periods | `effectiveFrom` inclusive, `effectiveTo` exclusive, `null` open-ended. |
| Conflict errors | Safe structured conflict errors | Covers duplicate identity, ownership overlap, stale concurrent edits, and billing-account period conflicts. |
| Error handling | UOW-01 global error and correlation ID conventions | UOW-02 must not expose internal details. |

## Persistence and Search Decisions

| Area | Decision | Notes |
|---|---|---|
| Property uniqueness | PostgreSQL-backed unique constraints plus service validation | Applies to property code and canonical normalized property identity. |
| Homeowner duplicate checks | Deterministic normalized candidate queries | Uses bounded candidate lists and safe match signals. |
| Alias search | Indexed alias records resolving to canonical property | Aliases do not create separate billable property identities. |
| PII search | Role-authorized and field-filtered | PII search and display require server-side authorization. |
| Pagination | Required for search/list endpoints | Page and page size bounds required. |

## Transaction and Concurrency Decisions

| Area | Decision | Notes |
|---|---|---|
| Ownership transfer transaction | Single transaction where possible | Includes non-overlap validation, ownership period update, billing-account period update, and audit. |
| Conflict detection | Required for concurrent edits | Code Generation must prevent overlapping primary ownership and duplicate effective billing account periods. |
| Audit persistence | Transactionally coupled where possible | Sensitive master-data mutations must not silently commit without audit. |
| Historical records | Immutable financial references | UOW-02 must not move past financial records to new owners. |

## Authorization and Privacy Decisions

| Area | Decision | Notes |
|---|---|---|
| Actor context | Reuse UOW-01 `ActorContext` | Required for every protected UOW-02 endpoint. |
| Route authorization | Reuse UOW-01 guards/policies | Every protected endpoint requires role authorization. |
| Object authorization | UOW-02 owned resource checks using UOW-01 contracts | Required for homeowner, property, ownership, billing account, and contact request IDs. |
| Field-level shaping | Required | PII fields are omitted or masked by role and resource relationship. |
| Board Member access | Read-only and PII-minimized | Governance fields only unless explicitly permitted. |
| Homeowner access | Own linked resources only | Matching email alone never grants access. |

## Audit, Logging, and Monitoring Decisions

| Area | Decision | Notes |
|---|---|---|
| Audit implementation | Reuse UOW-01 audit service contract | Applies to duplicate overrides, alias changes, billable-impacting changes, ownership transfers, billing-account periods, contact decisions, and denials. |
| Structured logging | Reuse UOW-01 logging posture | Timestamp, level, correlation ID, safe message, and category. |
| Redaction | Required | Contact values, PII, tokens, credentials, and secrets are redacted from logs. |
| Alertable events | Authorization denials and unusual search/contact patterns | Alert transport is finalized in later design/infrastructure work. |

## Frontend Decisions

| Area | Decision | Notes |
|---|---|---|
| Component testing | React Testing Library | Reuses UOW-01 frontend test strategy. |
| Accessibility | WCAG 2.2 AA-oriented baseline | Applies to UOW-02 forms, tables, filters, validation summaries, and decision panels. |
| Automation hooks | Stable `data-testid` values | Required by Functional Design components. |
| Safe errors | Correlation-ID capable safe error displays | No internal error details or hidden authorization facts. |

## Testing Stack Decisions

| Area | Decision | Rationale |
|---|---|---|
| Backend test runner | Jest-compatible stack | Aligns with UOW-01 and NestJS. |
| Frontend test runner | React Testing Library | Tests user-visible behavior and role-filtered UI states. |
| Integration tests | Required | Persistence, authorization, ownership transfer, billing-account period, and contact decision boundaries require database-backed integration coverage. |
| Property-based testing | `fast-check` | Required by PBT-09 and already selected for TypeScript. |
| PBT generators | Domain-specific custom generators | Required for property identities, homeowner identities, ownership periods, billing account periods, billable validation inputs, and contact request states. |
| Example tests | Required for critical workflows | PBT complements but does not replace concrete examples. |

## Rejected Stack Additions

| Technology | Decision | Rationale |
|---|---|---|
| External search service | Rejected for UOW-02 first implementation | Single-HOA scale and normalized PostgreSQL indexes are sufficient. |
| Separate cache service | Rejected for UOW-02 first implementation | Adds consistency risk around ownership and billability without a demonstrated need. |
| Separate document/email/import tooling | Out of scope | Later units own documents, emails, and imports. |
| New database technology | Rejected | PostgreSQL remains the transactional source of truth. |

## PBT-09 Compliance

| Requirement | Decision |
|---|---|
| Framework selected | `fast-check` |
| Language | TypeScript |
| Custom generators | Required for UOW-02 domain objects and state machines |
| Shrinking | Must remain enabled |
| Seed reproducibility | Required; seed must be logged on failure |
| Test runner integration | Jest-compatible backend and frontend setup |
| Project dependency | Already present from UOW-01 Code Generation dependency baseline |

## Deferred Decisions for NFR Design

| Deferred Item | Reason |
|---|---|
| Exact index definitions | Requires schema-level NFR Design and Code Generation. |
| Exact transaction isolation/concurrency mechanism | Requires Prisma/PostgreSQL implementation design. |
| Exact rate/volume thresholds | Requires NFR Design balancing small-HOA usability and abuse protection. |
| Exact alert routing | Infrastructure and operations design concern. |
| Exact integration test database setup | Code Generation and Build/Test concern. |

## Security Baseline Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-03 | Compliant | Structured logging with redaction is selected. |
| SECURITY-05 | Compliant | Schema validation, bounds, and safe conflict errors are selected. |
| SECURITY-08 | Compliant | Route, object, and field-level authorization are selected. |
| SECURITY-09 | Compliant | Safe errors and no new default credential surface are selected. |
| SECURITY-10 | Compliant | No new dependency family or external service is introduced. |
| SECURITY-11 | Compliant | Master-data, ownership, authorization, and privacy concerns remain isolated in UOW-02 services. |
| SECURITY-13 | Compliant | Critical data changes remain auditable. |
| SECURITY-14 | Compliant | Alertable access-denial and unusual-use events are required. |
| SECURITY-15 | Compliant | Fail-closed validation and global error handling are selected. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
