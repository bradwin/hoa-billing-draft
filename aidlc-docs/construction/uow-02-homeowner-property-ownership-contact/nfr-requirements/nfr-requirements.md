# UOW-02 NFR Requirements

## Unit

- **Unit ID**: UOW-02
- **Unit Name**: Homeowner, Property, Ownership, and Contact Requests
- **Stage**: NFR Requirements

## Summary

UOW-02 is the master-data and responsibility-fact source for later financial units. The non-functional requirements prioritize deterministic validation, concurrency-safe ownership and billing-account period changes, PII minimization, auditability, and fast single-HOA search without adding new infrastructure.

## Capacity Requirements

| NFR ID | Requirement |
|---|---|
| UOW02-NFR-CAP-001 | First implementation targets one HOA/subdivision. |
| UOW02-NFR-CAP-002 | Support up to 1,000 property records. |
| UOW02-NFR-CAP-003 | Support up to 2,000 homeowner master records, including historical, inactive, deceased, and archived records. |
| UOW02-NFR-CAP-004 | Support up to 10,000 combined ownership period, billing account period, property alias, contact change, and duplicate-review support records. |
| UOW02-NFR-CAP-005 | Multi-HOA scale is out of scope and requires revisiting UOW-02 indexing, authorization, reporting, and deployment assumptions. |

## Performance Requirements

| NFR ID | Requirement |
|---|---|
| UOW02-NFR-PERF-001 | Staff homeowner/property searches should target p95 <= 1 second for paged and filtered results under normal single-HOA load. |
| UOW02-NFR-PERF-002 | Homeowner/property detail reads should target p95 <= 500 ms under normal single-HOA load. |
| UOW02-NFR-PERF-003 | Billable-property validation for one property and `validationDate` should target p95 <= 500 ms. |
| UOW02-NFR-PERF-004 | Duplicate candidate checks during homeowner/property create or update should target p95 <= 500 ms with bounded candidate lists. |
| UOW02-NFR-PERF-005 | Contact change decisions should target p95 <= 500 ms, excluding user notification delivery owned by later units. |
| UOW02-NFR-PERF-006 | Search, list, and audit-facing views must use pagination and bounded page sizes. |

## Search and Indexing Requirements

| NFR ID | Requirement |
|---|---|
| UOW02-NFR-SEARCH-001 | Search uses PostgreSQL-backed indexed search for first implementation. |
| UOW02-NFR-SEARCH-002 | No external search service is introduced by UOW-02. |
| UOW02-NFR-SEARCH-003 | Normalized indexes are required for homeowner code, normalized names, email, mobile, property code, canonical property identity, aliases, status fields, and billing status where applicable. |
| UOW02-NFR-SEARCH-004 | Alias searches resolve to canonical property records. |
| UOW02-NFR-SEARCH-005 | Search responses must be role-filtered before returning PII or ownership-sensitive data. |

## Duplicate Detection Requirements

| NFR ID | Requirement |
|---|---|
| UOW02-NFR-DUP-001 | Duplicate checks must be deterministic for normalized homeowner and property identity inputs. |
| UOW02-NFR-DUP-002 | Duplicate candidate lists must be bounded for staff workflows. |
| UOW02-NFR-DUP-003 | Duplicate candidate responses must expose safe match signals, not unrestricted PII. |
| UOW02-NFR-DUP-004 | Duplicate override confirmation must be audited with actor, timestamp, candidate IDs, reason or remarks, and correlation ID. |

## Transaction and Concurrency Requirements

| NFR ID | Requirement |
|---|---|
| UOW02-NFR-TXN-001 | Ownership transfer, billing-account period changes, non-overlap validation, and audit persistence must occur in one transaction where possible. |
| UOW02-NFR-TXN-002 | Concurrent edits to ownership periods or billing-account periods must detect conflicts and fail safely rather than producing overlapping primary ownership or duplicate effective billing account periods. |
| UOW02-NFR-TXN-003 | Property code uniqueness and canonical property identity uniqueness must be enforced at persistence and service layers. |
| UOW02-NFR-TXN-004 | Half-open interval semantics must be preserved for ownership and billing-account periods. |
| UOW02-NFR-TXN-005 | UOW-02 must not mutate historical financial source records when ownership or billing responsibility changes. |

## Billable Validation Requirements

| NFR ID | Requirement |
|---|---|
| UOW02-NFR-BILLABLE-001 | Billable-property validation must be deterministic for the supplied `validationDate`. |
| UOW02-NFR-BILLABLE-002 | Validation fails closed on missing, ambiguous, or conflicting ownership, homeowner, property, or billing-account period data. |
| UOW02-NFR-BILLABLE-003 | Validation requires exactly one effective primary ownership period for the `validationDate`. |
| UOW02-NFR-BILLABLE-004 | Validation requires exactly one effective billing account period for the responsible homeowner and property. |
| UOW02-NFR-BILLABLE-005 | Validation requires responsible primary homeowner eligibility according to approved Functional Design rules. |
| UOW02-NFR-BILLABLE-006 | UOW-02 does not decide proration, transfer-period billing, or invoice inclusion policy beyond returning validation results and reason codes. |

## Privacy and Access Requirements

| NFR ID | Requirement |
|---|---|
| UOW02-NFR-PRIV-001 | Field-level response shaping is required by role and resource relationship. |
| UOW02-NFR-PRIV-002 | Homeowners may access only their own linked homeowner, property, ownership, billing-account, and contact request records. |
| UOW02-NFR-PRIV-003 | Board Member read-only access must minimize PII and include only fields required for authorized governance and oversight unless explicitly permitted. |
| UOW02-NFR-PRIV-004 | Application logs must not include PII except safe identifiers or redacted references needed for diagnostics and audit correlation. |
| UOW02-NFR-PRIV-005 | UOW-02 contact email changes do not automatically change UOW-01 login email or credentials. |

## Audit, Logging, and Monitoring Requirements

| NFR ID | Requirement |
|---|---|
| UOW02-NFR-AUD-001 | Duplicate override, property alias creation/update/removal, billable-impacting property changes, ownership transfers, billing-account period changes, contact decisions, and authorization denials must be auditable. |
| UOW02-NFR-AUD-002 | Audit records must include actor, timestamp, action, resource reference, safe before/after values where applicable, reason or remarks where required, and correlation ID. |
| UOW02-NFR-AUD-003 | Structured logs must include timestamp, level, correlation ID, safe message, and category. |
| UOW02-NFR-AUD-004 | Logs must redact PII, contact data, credentials, tokens, and secret values. |
| UOW02-NFR-AUD-005 | Repeated authorization denials and unusual search/contact-change access patterns must be alertable security events. |

## Abuse Protection Requirements

| NFR ID | Requirement |
|---|---|
| UOW02-NFR-ABUSE-001 | Contact-change submissions require authentication and object authorization. |
| UOW02-NFR-ABUSE-002 | Contact-change submissions and staff/portal searches must support rate or volume controls appropriate to single-HOA usage. |
| UOW02-NFR-ABUSE-003 | Repeated denied access attempts must be audited and alertable. |
| UOW02-NFR-ABUSE-004 | Search endpoints must require bounded filters, pagination, and role checks to prevent broad unauthorized data harvesting. |

## API Validation and Error Requirements

| NFR ID | Requirement |
|---|---|
| UOW02-NFR-API-001 | Every UOW-02 endpoint must use schema validation. |
| UOW02-NFR-API-002 | String, date, decimal, enum, array, payload size, and pagination bounds must be explicit. |
| UOW02-NFR-API-003 | Duplicate, ownership-overlap, stale-write, and validation-date conflicts must return safe structured errors. |
| UOW02-NFR-API-004 | Authorization and validation failures must fail closed. |
| UOW02-NFR-API-005 | Global error handling from UOW-01 must be used for safe responses and correlation IDs. |

## Availability and Recovery Requirements

| NFR ID | Requirement |
|---|---|
| UOW02-NFR-AVAIL-001 | UOW-02 follows the UOW-01 local or single-server Docker deployment assumption. |
| UOW02-NFR-AVAIL-002 | Automated failover is not required in first implementation. |
| UOW02-NFR-AVAIL-003 | UOW-02 data must be included in the database backup and manual restore expectations established for the system. |
| UOW02-NFR-AVAIL-004 | Recovery must preserve ownership history, billing-account periods, contact request decisions, and audit records. |

## Frontend Usability and Accessibility Requirements

| NFR ID | Requirement |
|---|---|
| UOW02-NFR-A11Y-001 | UOW-02 forms and tables target a WCAG 2.2 AA-oriented baseline. |
| UOW02-NFR-A11Y-002 | Search, create, update, ownership transfer, alias, and contact-change workflows must support keyboard navigation, labels, focus states, and validation summaries. |
| UOW02-NFR-A11Y-003 | Error displays must show safe messages and correlation IDs where available. |
| UOW02-NFR-A11Y-004 | Frontend components must keep stable `data-testid` values for automation. |
| UOW02-NFR-A11Y-005 | PII-masked fields must be visually distinct enough for authorized users to understand that data is intentionally withheld. |

## Testing Requirements

| NFR ID | Requirement |
|---|---|
| UOW02-NFR-TEST-001 | Backend tests use the Jest-compatible stack established by UOW-01. |
| UOW02-NFR-TEST-002 | Frontend tests use React Testing Library. |
| UOW02-NFR-TEST-003 | Integration tests are required for persistence, authorization, ownership transfer, billing-account period creation, and contact decision boundaries. |
| UOW02-NFR-TEST-004 | Property-based tests use `fast-check`. |
| UOW02-NFR-TEST-005 | UOW-02 PBT must use custom generators for property identities, homeowner identities, ownership periods, billing account periods, billable validation inputs, and contact request states. |
| UOW02-NFR-TEST-006 | PBT must keep shrinking enabled and seed reproducibility available. |
| UOW02-NFR-TEST-007 | Critical UOW-02 workflows require example-based tests in addition to PBT. |

## Maintainability Requirements

| NFR ID | Requirement |
|---|---|
| UOW02-NFR-MAINT-001 | UOW-02 must reuse UOW-01 actor context, authorization, audit, safe error, transaction, logging, and validation conventions. |
| UOW02-NFR-MAINT-002 | Homeowner, property, ownership, billable validation, contact change, and read model logic must remain isolated from UI code. |
| UOW02-NFR-MAINT-003 | Later invoice, payment, reporting, import, document, email, and portal units must consume UOW-02 read models and service contracts instead of duplicating raw interpretation rules. |
| UOW02-NFR-MAINT-004 | No new database, search, cache, or queue technology is introduced by UOW-02. |

## Security Baseline Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-01 | N/A for NFR Requirements | Encryption configuration is finalized in Infrastructure Design, but UOW-02 data must be included in protected database storage. |
| SECURITY-02 | N/A for NFR Requirements | Network intermediary logging is an Infrastructure Design concern. |
| SECURITY-03 | Compliant | Structured logging with correlation IDs and redaction is required. |
| SECURITY-04 | Compliant by inheritance | UOW-02 web surfaces use the UOW-01 web security header baseline. |
| SECURITY-05 | Compliant | Schema validation, size bounds, safe errors, and fail-closed validation are required for every endpoint. |
| SECURITY-06 | N/A for NFR Requirements | IAM/resource policies are Infrastructure Design concerns. |
| SECURITY-07 | N/A for NFR Requirements | Network controls are Infrastructure Design concerns. |
| SECURITY-08 | Compliant | Server-side role and object authorization, homeowner own-resource isolation, and field-level response shaping are required. |
| SECURITY-09 | Compliant | Safe errors and no default credential assumptions are required. |
| SECURITY-10 | Compliant by inheritance | UOW-02 reuses the existing TypeScript stack and dependency controls. |
| SECURITY-11 | Compliant | Misuse-prone workflows include duplicate overrides, search, ownership transfer, and contact-change abuse controls. |
| SECURITY-12 | N/A for UOW-02 | Authentication mechanics are owned by UOW-01; UOW-02 consumes authenticated actor context. |
| SECURITY-13 | Compliant | Critical master-data and responsibility changes are auditable with before/after values where safe. |
| SECURITY-14 | Compliant | Authorization denials and unusual access patterns are alertable requirements. |
| SECURITY-15 | Compliant | Safe structured errors, global error handling, and fail-closed behavior are required. |

## Property-Based Testing Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| PBT-09 | Compliant | TypeScript PBT framework is confirmed as `fast-check`, with custom generators, shrinking, seed reproducibility, and Jest-compatible integration required. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
