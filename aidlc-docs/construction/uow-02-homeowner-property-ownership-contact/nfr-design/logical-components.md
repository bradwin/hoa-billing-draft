# UOW-02 Logical Components

## Unit

- **Unit ID**: UOW-02
- **Unit Name**: Homeowner, Property, Ownership, and Contact Requests
- **Stage**: NFR Design

## Summary

This artifact defines the logical components needed to implement the approved UOW-02 functional and non-functional design. Component names are logical, not final package or class names. Code Generation will map them into the TypeScript modular monolith structure.

## Component Inventory

| Component | Responsibility | Primary NFR Responsibilities |
|---|---|---|
| Homeowner Profile Component | Manage homeowner master records, lifecycle status, duplicate candidate review, and approved contact values. | SECURITY-05, SECURITY-08, SECURITY-13 |
| Property Registry Component | Manage canonical property records, permanent property codes, lot area, billing status, lifecycle status, and property aliases. | SECURITY-05, SECURITY-08, SECURITY-13 |
| Ownership Timeline Component | Manage half-open ownership periods and primary owner non-overlap. | SECURITY-05, SECURITY-13, SECURITY-15 |
| Billing Account Period Component | Manage billing-responsible homeowner/property effective periods. | SECURITY-05, SECURITY-13, SECURITY-15 |
| Billable Validation Component | Return pure reason-coded validation for property ID and `validationDate`. | SECURITY-05, SECURITY-15, PBT-03 |
| Contact Change Component | Manage Pending/Approved/Rejected contact change requests and decisions. | SECURITY-05, SECURITY-08, SECURITY-13 |
| Search Read Model Component | Provide paged, indexed, role-filtered homeowner/property search and read models. | SECURITY-05, SECURITY-08 |
| Authorization Policy Component | Apply UOW-02 object authorization and field-level PII shaping using UOW-01 actor context. | SECURITY-08, SECURITY-11 |
| Audit Adapter Component | Create UOW-01 audit entries for UOW-02 mutations and denials. | SECURITY-03, SECURITY-13, SECURITY-14 |
| Abuse Protection Adapter Component | Use UOW-01 security event/rate-control conventions for search and contact-change abuse signals. | SECURITY-11, SECURITY-14 |
| Error Mapping Component | Map duplicate, overlap, authorization, validation, and unexpected failures to safe domain errors. | SECURITY-09, SECURITY-15 |
| Frontend Interaction Component | Render accessible search, forms, validation summaries, safe errors, and PII-mask indicators. | SECURITY-08, SECURITY-15 |
| PBT Generator Component | Provide `fast-check` generators and state models for UOW-02 invariants. | PBT-01, PBT-06, PBT-07, PBT-08, PBT-09, PBT-10 |

## Request Processing Chain

Protected UOW-02 commands and queries use this logical chain:

1. UOW-01 Correlation Component assigns or validates a correlation ID.
2. UOW-01 Authentication resolves the actor context.
3. UOW-02 request validation checks shape, bounds, enum values, decimal values, dates, and pagination.
4. UOW-02 Authorization Policy Component enforces role, object, and field-level policy.
5. Domain component executes the command or query.
6. Audit Adapter Component appends required audit entries for sensitive mutations and denials.
7. Search Read Model or domain component returns role-filtered data.
8. Error Mapping Component converts failures to safe structured errors.
9. UOW-01 Logging emits redacted structured logs.

Authorization and validation failures deny access by default. UOW-02 does not rely on frontend hiding for authorization or PII protection.

## Logical Data Responsibilities

| Logical Data | Owner Component | Key NFR Design Notes |
|---|---|---|
| Homeowner | Homeowner Profile Component | Permanent code, lifecycle status, duplicate candidate signals, no physical deletion when linked. |
| HomeownerContact | Homeowner Profile Component | PII-shaped by backend read models; contact email does not mutate login email automatically. |
| HomeownerDuplicateCandidate | Homeowner Profile Component | Bounded candidate output with safe match signals and audited override. |
| Property | Property Registry Component | Permanent property code, canonical normalized identity, indexed search fields. |
| PropertyAlias | Property Registry Component | Alias create/update/removal audited; aliases resolve to canonical property. |
| OwnershipPeriod | Ownership Timeline Component | Half-open intervals and primary ownership non-overlap. |
| BillingAccountPeriod | Billing Account Period Component | Created only for billing-responsible homeowner; effective period supports historical responsibility. |
| BillablePropertyValidation | Billable Validation Component | Pure validation for property ID and `validationDate`; no side effects. |
| ContactChangeRequest | Contact Change Component | Pending/Approved/Rejected only; terminal decisions cannot transition. |
| HomeownerSummary | Search Read Model Component | Role-filtered PII fields. |
| PropertySummary | Search Read Model Component | Canonical and alias search support. |
| OwnerVisibilityView | Authorization Policy Component | Own-resource visibility for homeowner portal and object authorization. |

## Component Dependencies

| Component | Depends On | Must Not Depend On |
|---|---|---|
| Homeowner Profile Component | Validation, Authorization Policy, Audit Adapter, Error Mapping | Direct invoice, payment, email, document, or import execution |
| Property Registry Component | Validation, Authorization Policy, Audit Adapter, Error Mapping | Invoice generation, dues calculation, external search service |
| Ownership Timeline Component | Validation, Billing Account Period, Authorization Policy, Audit Adapter | Financial source-record mutation |
| Billing Account Period Component | Ownership Timeline, Validation, Audit Adapter | Balance mutation or invoice reassignment |
| Billable Validation Component | Property Registry, Ownership Timeline, Billing Account Period, Homeowner Profile | Side-effecting billing, report, or exception generation |
| Contact Change Component | Homeowner Profile, Authorization Policy, Audit Adapter, Abuse Protection Adapter | UOW-01 login email mutation unless separate process is invoked |
| Search Read Model Component | Homeowner Profile, Property Registry, Ownership Timeline, Authorization Policy | Returning unfiltered PII |
| Authorization Policy Component | UOW-01 ActorContext and authorization contracts, OwnerVisibilityView | Frontend state as authority |
| Audit Adapter Component | UOW-01 Audit, Correlation | Raw PII or secret logging |
| Abuse Protection Adapter Component | UOW-01 security event/rate-control conventions | Infrastructure-only throttling as the sole control |
| Error Mapping Component | UOW-01 safe error conventions, Correlation | Database diagnostics in user-facing responses |
| Frontend Interaction Component | Server-authorized APIs, Safe error responses | Client-side authorization decisions |
| PBT Generator Component | Shared domain schemas and value objects | Production runtime dependencies |

## Component Details

### Homeowner Profile Component

Responsibilities:

- Create and update homeowner master records.
- Preserve permanent homeowner code.
- Maintain lifecycle status values: `Active`, `Inactive`, `Deceased`, and `Archived`.
- Run deterministic duplicate candidate checks.
- Audit distinct-homeowner duplicate overrides.
- Provide role-filtered homeowner read models.

### Property Registry Component

Responsibilities:

- Create and update canonical property records.
- Preserve permanent property code.
- Maintain canonical normalized identity.
- Manage aliases that resolve to canonical property records.
- Validate lot area and billing status fields.
- Audit alias and billable-impacting property changes.

Required index candidates for Code Generation:

- Property code.
- Canonical identity key.
- Phase or section, block, lot, and street search keys.
- Alias normalized key.
- Billing status and lifecycle status.

### Ownership Timeline Component

Responsibilities:

- Enforce half-open ownership periods.
- Reject overlapping primary ownership periods.
- Close prior primary ownership period at transfer effective date.
- Coordinate with Billing Account Period Component.
- Detect concurrent ownership edits safely.

### Billing Account Period Component

Responsibilities:

- Create effective billing-account periods only for billing-responsible homeowners.
- Close prior billing-account periods at transfer effective date.
- Preserve historical responsibility periods.
- Reject duplicate effective billing-account periods.

### Billable Validation Component

Responsibilities:

- Accept property ID and `validationDate`.
- Read effective property, homeowner, ownership, and billing-account period facts.
- Return `isValid`, reason codes, responsible homeowner, billing account period, and lot area.
- Never create invoices, balances, reports, exception rows, emails, documents, or import results.

### Contact Change Component

Responsibilities:

- Accept homeowner-submitted contact-only changes.
- Enforce own-resource authorization.
- Keep request states to `Pending`, `Approved`, and `Rejected`.
- Apply approved UOW-02 contact fields only.
- Avoid automatic UOW-01 login email mutation.
- Audit decisions with safe before/after values.

### Search Read Model Component

Responsibilities:

- Provide paged homeowner and property search.
- Resolve aliases to canonical property records.
- Apply role and field-level response policies before serialization.
- Enforce bounded filters for sensitive searches.

### Authorization Policy Component

Responsibilities:

- Use UOW-01 actor context and object authorization contracts.
- Enforce homeowner own-resource access.
- Enforce Board Member read-only, PII-minimized access.
- Deny missing ownership or ambiguous object links.

### PBT Generator Component

Required generators and state models:

| Asset | Component Coverage |
|---|---|
| Property identity generator | Property Registry, Search Read Model |
| Homeowner identity generator | Homeowner Profile, duplicate candidates |
| Ownership period generator | Ownership Timeline half-open interval and overlap rules |
| Billing account period generator | Billing Account Period effective responsibility rules |
| Billable validation input generator | Billable Validation reason-code invariants |
| Contact request state model | Contact Change state transitions and mutation rules |

## NFR Responsibility Mapping

| NFR Area | Owning Logical Components |
|---|---|
| Capacity and performance | Search Read Model, Property Registry, Homeowner Profile |
| Search and indexing | Search Read Model, Property Registry, Homeowner Profile |
| Duplicate detection | Homeowner Profile, Property Registry, Audit Adapter |
| Transaction and concurrency | Ownership Timeline, Billing Account Period, Audit Adapter |
| Billable validation | Billable Validation, Property Registry, Ownership Timeline, Billing Account Period |
| Privacy and access | Authorization Policy, Search Read Model, Frontend Interaction |
| Audit and logging | Audit Adapter, Error Mapping, UOW-01 Logging |
| Abuse protection | Abuse Protection Adapter, Authorization Policy, Search Read Model, Contact Change |
| API validation and safe errors | Error Mapping, all domain components |
| Accessibility | Frontend Interaction |
| PBT | PBT Generator plus all stateful/domain components |

## Deferred to Infrastructure Design

- Database encryption and connection TLS implementation.
- Backup commands, schedules, storage targets, and restore procedure details.
- Log transport and centralized log storage target.
- Alert routing for repeated denials and unusual access.
- Concrete Docker network and volume design.

## Deferred to Code Generation

- Actual Prisma schema, migrations, indexes, and constraints.
- Exact row-locking or conflict-detection implementation.
- Exact DTO and Zod schema definitions.
- Exact API routes, service classes, and frontend components.
- Generated example tests, integration tests, and `fast-check` PBT files.

## Security Baseline Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-03 | Compliant | Audit/logging adapter and redacted structured logging are defined. |
| SECURITY-05 | Compliant | Validation responsibilities are assigned to every UOW-02 component path. |
| SECURITY-08 | Compliant | Authorization Policy owns role, object, own-resource, and field-level access. |
| SECURITY-09 | Compliant | Error Mapping keeps user-facing errors safe. |
| SECURITY-10 | Compliant | No new dependency family or external service is introduced. |
| SECURITY-11 | Compliant | Security-sensitive logic is separated into authorization, audit, error, and abuse components. |
| SECURITY-13 | Compliant | Critical data modifications are routed through Audit Adapter. |
| SECURITY-14 | Compliant | Abuse Protection Adapter handles alertable denial and unusual-access events. |
| SECURITY-15 | Compliant | Fail-closed behavior and safe error mapping are assigned. |

## Property-Based Testing Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| PBT-01 | Compliant | Functional Design properties are mapped to logical components. |
| PBT-06 | Compliant | Stateful models are assigned for ownership, billing-account period, and contact state behavior. |
| PBT-07 | Compliant | Domain-specific generator assets are identified. |
| PBT-08 | Compliant | Seed and shrinking requirements are carried forward. |
| PBT-09 | Compliant | `fast-check` remains selected. |
| PBT-10 | Compliant | PBT is assigned as complement to example and integration tests. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
