# UOW-02 NFR Design Patterns

## Unit

- **Unit ID**: UOW-02
- **Unit Name**: Homeowner, Property, Ownership, and Contact Requests
- **Stage**: NFR Design

## Summary

UOW-02 uses PostgreSQL-backed, transaction-safe patterns for homeowner and property master data. The design favors deterministic normalized search, conflict-safe ownership period changes, backend-only PII shaping, fail-closed billable validation, auditable master-data mutations, and reusable `fast-check` property tests over new infrastructure.

## Approved Planning Answers

| Question Area | Approved Decision |
|---|---|
| Indexed search | PostgreSQL B-tree indexes for exact/status/date fields plus normalized text columns; no external search service or cache |
| Duplicate candidates | Deterministic normalized candidate queries with ranked safe match signals, bounded results, and audited staff override |
| Ownership concurrency | Transactional command handler with row-level locking or equivalent conflict detection and database constraints where practical |
| Half-open intervals | Shared date-range validator plus persistence-level non-overlap guard where practical |
| Billable validation | Pure deterministic domain service accepting property ID and `validationDate`, returning reason-coded validation with no side effects |
| PII shaping | Backend read-model projectors apply role/resource field policies before response serialization |
| Audit and logging | Command handlers write UOW-01 audit entries in the same transaction where possible; logs carry only safe diagnostic fields |
| Abuse protection | UOW-01 actor/security event contracts, bounded pagination, minimum filter rules, per-actor counters, and alertable repeated denials |
| Safe errors | Stable domain error codes, safe messages, correlation IDs, non-enumerating authorization failures |
| Frontend NFRs | Server-authorized loading, accessible controls, stable test IDs, validation summaries, PII-mask indicators, safe error banners |
| PBT design | Centralized `fast-check` domain generators and state models for UOW-02 invariants |
| Logical decomposition | Separate logical components for profile, registry, ownership, billing account period, validation, contact, search, authorization, audit, and PBT support |

## Indexed Search Pattern

### Pattern

UOW-02 search uses normalized columns and PostgreSQL B-tree indexes for the first implementation. The design supports one-HOA capacity without introducing external search or cache infrastructure.

### Design Rules

| Area | Design |
|---|---|
| Homeowner search | Index homeowner code, lifecycle status, normalized name, normalized email, and normalized mobile where stored. |
| Property search | Index property code, canonical identity key, phase or section, block, lot, street, billing status, and lifecycle status. |
| Alias search | Store normalized alias key and index it so alias matches resolve to canonical property records. |
| Status filters | Use indexed enum/status columns for homeowner status, property lifecycle, property billing status, and contact request status. |
| Pagination | Every list/search query requires bounded page and page size. |
| External services | No Elasticsearch, Redis, cache, or queue is introduced for UOW-02 search. |

### Failure Behavior

- Unbounded searches are rejected with safe validation errors.
- Unauthorized PII filters are denied or ignored according to role policy; they must not leak whether a hidden record exists.
- Search query failures return safe errors with correlation IDs.

## Duplicate Candidate Pattern

### Pattern

Duplicate detection is deterministic and based on normalized keys. It is not a probabilistic fuzzy-matching feature in the first implementation.

| Candidate Type | Signals |
|---|---|
| Homeowner | Normalized email, normalized mobile, normalized full name, and linked property ownership context. |
| Property | Permanent property code, canonical normalized property identity, and aliases. |

### Design Rules

- Candidate lists are bounded.
- Match signals are safe labels such as exact email, exact mobile, similar normalized name, or linked property context.
- Candidate responses must not expose unrestricted PII.
- Staff confirmation that a candidate is distinct is audited with actor, timestamp, candidate IDs, reason or remarks, and correlation ID.

## Ownership and Billing-Account Concurrency Pattern

### Pattern

Ownership transfer and billing-account period changes execute through transactional command handlers. The transaction validates effective periods, applies changes, writes audit entries where possible, and detects concurrent edits.

### Design Rules

| Area | Design |
|---|---|
| Lock scope | Lock or otherwise conflict-check the affected property ownership timeline and billing-account period set. |
| Non-overlap | Validate that no primary ownership period overlaps for the same property. |
| Billing account period | Create or close periods only for the billing-responsible homeowner. |
| Audit | Ownership and billing-account period audit entries are transactionally coupled where possible. |
| Race handling | Concurrent conflicting updates fail safely with a stable conflict error. |

## Half-Open Interval Pattern

Ownership and billing-account periods use half-open intervals:

- `effectiveFrom` is inclusive.
- `effectiveTo` is exclusive.
- `effectiveTo = null` means open-ended.

Transfer example:

- Old owner: `2025-01-01` to `2025-06-01`
- New owner: `2025-06-01` to `null`

The new owner is responsible starting `2025-06-01`. Shared validators and persistence-level guards must preserve this rule where practical.

## Billable Validation Pattern

### Pattern

Billable validation is a pure deterministic domain service. It reads effective property, ownership, homeowner, and billing-account period facts for a supplied `validationDate`, then returns a validation result with reason codes.

### Design Rules

| Area | Design |
|---|---|
| Inputs | Property ID and `validationDate`. |
| Side effects | None. Validation does not mutate stored billability, invoices, balances, reports, or exceptions. |
| Ownership | Exactly one effective primary ownership period must cover `validationDate`. |
| Billing account | Exactly one effective billing-account period must cover the responsible homeowner/property period. |
| Homeowner eligibility | Responsible primary homeowner must have `HomeownerStatus = Active` unless later approved exception workflow exists. |
| Failure | Missing, ambiguous, or conflicting facts fail closed with reason codes. |

UOW-02 does not decide proration, transfer-period billing, invoice inclusion policy, or exception report presentation.

## Field-Level PII Shaping Pattern

### Pattern

Backend read-model projectors apply field policies before response serialization. The frontend renders only returned fields and cannot be trusted to hide sensitive values.

| Actor | PII Behavior |
|---|---|
| System Administrator | May receive operational PII needed for master-data management. |
| Billing Staff | May receive operational PII needed for billing support and contact workflows. |
| Treasurer | Receives financial-review fields needed for approved workflows. |
| Board Member | Receives read-only governance fields with sensitive PII masked or omitted unless explicitly permitted. |
| Homeowner | Receives own linked records only. |

PII must be redacted from structured logs. Audit entries use safe references and safe before/after values where needed.

## Audit and Structured Logging Pattern

### Pattern

UOW-02 reuses UOW-01 audit, correlation, and structured logging contracts.

| Event | Required Handling |
|---|---|
| Duplicate override | Audit with candidate IDs, actor, reason or remarks, and correlation ID. |
| Property alias change | Audit create, update, and removal. |
| Billable-impacting property change | Audit billing status, lifecycle, lot area, and canonical identity changes. |
| Ownership transfer | Audit previous and new effective periods and responsible homeowner references. |
| Billing-account period change | Audit previous and new effective periods. |
| Contact decision | Audit requester, decision actor, old/new values, decision, remarks, and correlation ID. |
| Authorization denial | Audit or security-event record using safe detail. |

Structured logs include correlation ID, component, action, result, and safe diagnostic fields only.

## Abuse Protection Pattern

### Pattern

UOW-02 uses UOW-01 actor context, authorization, security event, and rate/volume-control conventions.

### Controls

- Contact-change submissions require authentication and own-resource authorization.
- Sensitive staff searches require role authorization, bounded filters, and pagination.
- Repeated denials, broad-search attempts, and unusual contact-change volume produce alertable security events.
- Per-actor rate or volume counters are required where practical; exact thresholds are finalized during Code Generation or Infrastructure Design.

## Safe Error Pattern

UOW-02 errors use stable domain error codes, safe messages, and correlation IDs.

| Error Class | Design |
|---|---|
| Duplicate identity | Safe duplicate/conflict message without unrestricted PII. |
| Ownership overlap | Safe conflict message with allowed date context. |
| Authorization failure | Non-enumerating denial; do not reveal whether hidden resource exists. |
| Validation failure | Reason-coded safe validation details. |
| Unexpected failure | Generic safe message and correlation ID. |

Internal details remain only in redacted logs and safe audit records.

## Frontend NFR Pattern

UOW-02 frontend components load data from server-authorized APIs and render only returned fields.

| Area | Design |
|---|---|
| Accessibility | WCAG 2.2 AA-oriented forms, filters, tables, focus states, labels, and validation summaries. |
| PII masking | Masked/omitted fields are presented intentionally, without exposing hidden values. |
| Validation summaries | Duplicate, overlap, contact-change, and billable-validation failures use clear safe messages. |
| Automation | Stable `data-testid` values from Functional Design are preserved. |
| Errors | Safe error banners include correlation IDs where available. |

## PBT Design Pattern

### Pattern

UOW-02 uses centralized `fast-check` domain generators and state models. PBT tests are separate from example tests and keep shrinking enabled.

### Required Generators and Models

| PBT Asset | Purpose |
|---|---|
| Property identity generator | Generate canonical and alias inputs for normalization and uniqueness. |
| Homeowner identity generator | Generate normalized email, mobile, name, status, and duplicate candidate combinations. |
| Ownership period generator | Generate valid, overlapping, adjacent, open-ended, and boundary half-open intervals. |
| Billing account period generator | Generate effective billing responsibility periods tied to property/homeowner pairs. |
| Billable validation input generator | Generate combinations of property status, lot area, owner count, homeowner eligibility, and account period state. |
| Contact request state model | Generate valid and invalid Pending/Approved/Rejected decision sequences. |

PBT failures must log the seed and shrunk counterexample. Business-critical shrunk failures become permanent example-based regression tests.

## Security Baseline Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-01 | N/A for NFR Design | Encryption implementation is deferred to Infrastructure Design. |
| SECURITY-02 | N/A for NFR Design | Network intermediary logging is Infrastructure Design. |
| SECURITY-03 | Compliant | Structured logging with redaction and correlation IDs is designed. |
| SECURITY-04 | Compliant by inheritance | UOW-02 uses UOW-01 web/API security middleware. |
| SECURITY-05 | Compliant | Validation, bounds, conflict errors, and parameterized persistence are design requirements. |
| SECURITY-06 | N/A for NFR Design | IAM policy details are Infrastructure Design. |
| SECURITY-07 | N/A for NFR Design | Network controls are Infrastructure Design. |
| SECURITY-08 | Compliant | Backend route, object, and field-level authorization patterns are defined. |
| SECURITY-09 | Compliant | Safe errors and no new default credential surface are defined. |
| SECURITY-10 | Compliant | No new external service or dependency family is introduced. |
| SECURITY-11 | Compliant | Misuse-prone search, duplicate, ownership, and contact-change patterns are addressed. |
| SECURITY-12 | N/A for UOW-02 | Authentication mechanics remain owned by UOW-01. |
| SECURITY-13 | Compliant | Critical master-data changes are auditable. |
| SECURITY-14 | Compliant | Repeated denials and unusual access patterns are alertable. |
| SECURITY-15 | Compliant | Fail-closed validation and safe error handling are designed. |

## Property-Based Testing Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| PBT-01 | Compliant | UOW-02 properties identified in Functional Design are carried forward. |
| PBT-06 | Compliant for design | Stateful models are required for ownership, billing-account periods, and contact request transitions. |
| PBT-07 | Compliant for design | Domain-specific generators are defined. |
| PBT-08 | Compliant for design | Shrinking and seed reproducibility are required. |
| PBT-09 | Compliant | `fast-check` remains the selected TypeScript PBT framework. |
| PBT-10 | Compliant for design | Example tests remain required for critical workflows alongside PBT. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
