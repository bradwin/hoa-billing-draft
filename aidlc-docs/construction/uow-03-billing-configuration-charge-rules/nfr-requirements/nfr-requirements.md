# UOW-03 NFR Requirements

## Unit

- **Unit ID**: UOW-03
- **Unit Name**: Billing Configuration and Charge Rules
- **Stage**: NFR Requirements

## Summary

UOW-03 is the financially sensitive configuration source for later billing, payment, penalty, statement, report, notification, document, and portal units. The non-functional requirements prioritize deterministic effective-date resolution, fail-closed behavior, auditability, precise decimal handling, server-side authorization, and typed downstream snapshots without adding unnecessary infrastructure.

UOW-03 creates immutable, effective-dated configuration versions and pure resolution results only. It must not create invoices, invoice lines, balances, payments, penalties, credits, adjustments, statements, reports, documents, emails, support jobs, or import batches.

## Approved NFR Decisions

| Area | Decision |
|---|---|
| First-scope load | Same first-scope HOA target as prior units: up to 25 operational users, low-frequency configuration writes, and later units reading configuration resolution during batch operations. |
| Resolution performance | Single-context resolution targets p95 under 100 ms from indexed PostgreSQL data in normal conditions. Batch consumers may cache a resolved snapshot within a transaction or batch run. |
| List/detail performance | Protected staff list/detail queries target p95 under 500 ms for first-scope data, with pagination for history and drafts. |
| Missing or ambiguous config | Required configuration fails closed with safe reason-coded errors and blocks downstream financial generation until corrected. |
| Durability | Activated configuration, approval references, and audit records must be transactionally coupled where practical and included in existing encrypted PostgreSQL backup/restore controls. |
| Security model | Backend route, role, object/scope authorization, Treasurer approval for financial-impacting activation, safe errors, and denial audit/security events through UOW-01 contracts. |
| Logging | Structured logs may include correlation ID, rule type, version ID, action, and result, but must not log full sensitive payloads. |
| Precision | Use decimal-safe validation and arithmetic helpers; never use JavaScript floating point for financial decimal behavior; preserve 4-place area/rate and 2-place money rules. |
| Database/query approach | PostgreSQL with indexed effective-date lookups by configuration identity, scope, rule type, and status. No external cache or search service for UOW-03. |
| Validation stack | Shared TypeScript domain validators plus Zod request schemas, aligned with existing shared-kernel patterns. |
| PBT | `fast-check` PBT for effective-date non-overlap, rate resolution determinism, due/grace date calculation, half-up rounding, manual charge validation, numbering resolution, and immutable version state transitions. |
| Accessibility/usability | WCAG 2.2 AA-oriented forms/tables, keyboard-accessible approval/version workflows, clear safe validation summaries, stable `data-testid` values, and no JSON-only editor for normal staff workflows. |
| Observability | Metrics/log events for failed resolution, ambiguous config, missing config, denied access, draft submission, approval activation, immutable-version violation attempts, and manual tax-like charge configuration changes. |
| Downstream contracts | Expose typed resolution DTOs/snapshots with version IDs and metadata so UOW-04 through UOW-08 can snapshot exact configuration without reading raw tables directly. |
| Stack posture | Continue the existing TypeScript/NestJS/Next.js/Prisma/PostgreSQL/fast-check stack with no new dependency family unless NFR Design proves a hard need. |

## Capacity Requirements

| NFR ID | Requirement |
|---|---|
| UOW03-NFR-CAP-001 | First implementation targets the same single-HOA scope as prior units. |
| UOW03-NFR-CAP-002 | Support up to 25 operational users with low-frequency configuration writes. |
| UOW03-NFR-CAP-003 | Support later unit read access during invoice, payment, penalty, statement, report, notification, document, and portal operations through service contracts. |
| UOW03-NFR-CAP-004 | Batch consumers may reuse a resolved configuration snapshot within a transaction or batch run when the resolution context is identical. |
| UOW03-NFR-CAP-005 | Multi-HOA or high-frequency public configuration writes are out of scope and require revisiting indexes, authorization scope, and infrastructure. |

## Performance Requirements

| NFR ID | Requirement |
|---|---|
| UOW03-NFR-PERF-001 | Single-context configuration resolution should target p95 under 100 ms from indexed PostgreSQL data in normal first-scope conditions. |
| UOW03-NFR-PERF-002 | Staff configuration list and detail queries should target p95 under 500 ms for first-scope data. |
| UOW03-NFR-PERF-003 | Draft, pending approval, active, superseded, retired, and rejected configuration views must use pagination or bounded result sets. |
| UOW03-NFR-PERF-004 | Resolution services must avoid N+1 query patterns for common downstream batch use cases. |
| UOW03-NFR-PERF-005 | UOW-03 must not make activation dependent on document rendering, email delivery, support jobs, import processing, invoice generation, or payment posting. |

## Availability and Reliability Requirements

| NFR ID | Requirement |
|---|---|
| UOW03-NFR-AVAIL-001 | Resolution must fail closed when no active approved version covers the requested date. |
| UOW03-NFR-AVAIL-002 | Resolution must fail closed when more than one active approved version covers the requested date for the same configuration identity, scope, and rule type. |
| UOW03-NFR-AVAIL-003 | Downstream financial generation must be blocked when required configuration is missing, ambiguous, draft-only, rejected, or unauthorized. |
| UOW03-NFR-AVAIL-004 | Activated configuration, approval references, and audit records must be committed transactionally where practical. |
| UOW03-NFR-AVAIL-005 | Configuration data and audit records must be included in encrypted PostgreSQL backup/restore controls established for the system. |
| UOW03-NFR-AVAIL-006 | Restore validation must preserve activated versions, effective intervals, approval references, and audit trails. |

## Security Requirements

| NFR ID | Requirement |
|---|---|
| UOW03-NFR-SEC-001 | Every UOW-03 endpoint must enforce backend authentication and authorization through UOW-01 contracts. |
| UOW03-NFR-SEC-002 | Financial-impacting activation requires Treasurer approval before activation. |
| UOW03-NFR-SEC-003 | Frontend role-aware controls are usability aids only; server-side authorization is authoritative. |
| UOW03-NFR-SEC-004 | Object and scope authorization must prevent unauthorized access to configuration drafts, versions, approval state, and resolution previews. |
| UOW03-NFR-SEC-005 | Authorization denials must be audited or logged as security events with safe identifiers and correlation IDs. |
| UOW03-NFR-SEC-006 | Safe error responses must not expose stack traces, database internals, approval bypass details, or sensitive payment instructions. |
| UOW03-NFR-SEC-007 | Logs must not include passwords, tokens, full bank/payment instructions, full draft payloads containing sensitive operational details, or other secret values. |

## Data Integrity and Audit Requirements

| NFR ID | Requirement |
|---|---|
| UOW03-NFR-DATA-001 | Activated configuration versions are immutable; corrections require a new version. |
| UOW03-NFR-DATA-002 | Active versions must not overlap for the same configuration identity, scope, and rule type. Distinct charge types, payment methods, and template references may coexist for the same date range when identities differ. |
| UOW03-NFR-DATA-003 | Effective intervals use half-open semantics: `effectiveFrom` is inclusive, `effectiveTo` is exclusive, and `effectiveTo = null` is open-ended. |
| UOW03-NFR-DATA-004 | Resolution outputs must include resolved version ID, effective interval, approval reference where applicable, and enough rule metadata for downstream snapshotting. |
| UOW03-NFR-DATA-005 | UOW-03 must not mutate snapshots or source records already created by downstream units. |
| UOW03-NFR-DATA-006 | Activation audit must include actor, timestamp, approval reference where required, effective dates, old version reference, new version reference, reason or remarks, and correlation ID. |
| UOW03-NFR-DATA-007 | Draft rejection must prevent downstream consumption of that draft. |

## Precision and Calculation Safety Requirements

| NFR ID | Requirement |
|---|---|
| UOW03-NFR-PREC-001 | Financial decimal behavior must use decimal-safe validation and arithmetic helpers. |
| UOW03-NFR-PREC-002 | JavaScript floating-point arithmetic must not be used for financial decimal behavior. |
| UOW03-NFR-PREC-003 | Lot area and rate per sqm values support up to 4 decimal places. |
| UOW03-NFR-PREC-004 | Money outputs round to 2 decimal places using half-up rounding. |
| UOW03-NFR-PREC-005 | UOW-03 stores and resolves rounding metadata only; UOW-04 applies it when creating invoice source records. |
| UOW03-NFR-PREC-006 | UOW-03 must not calculate actual invoice amounts for a property. |
| UOW03-NFR-PREC-007 | UOW-03 must not automatically calculate tax-like charges. |

## Resolution Service Requirements

| NFR ID | Requirement |
|---|---|
| UOW03-NFR-RES-001 | Resolution services must be side-effect free. |
| UOW03-NFR-RES-002 | Resolution services return active approved versions unless explicitly invoked by authorized staff preview screens. |
| UOW03-NFR-RES-003 | Resolution inputs must include the relevant effective date, configuration identity, scope, and rule type needed to avoid ambiguous lookup. |
| UOW03-NFR-RES-004 | Resolution outputs must be typed DTOs or snapshots, not raw persistence records. |
| UOW03-NFR-RES-005 | Later units must consume UOW-03 service contracts instead of reimplementing raw table interpretation. |

## Observability Requirements

| NFR ID | Requirement |
|---|---|
| UOW03-NFR-OBS-001 | Structured logs must include timestamp, level, correlation ID, safe message, action, result, and safe resource/version identifiers where applicable. |
| UOW03-NFR-OBS-002 | Metrics or log events are required for failed resolution, ambiguous configuration, missing configuration, denied access, draft submission, approval activation, immutable-version violation attempts, and manual tax-like charge configuration changes. |
| UOW03-NFR-OBS-003 | Observability must distinguish missing configuration from ambiguous configuration without exposing sensitive internals to the client. |
| UOW03-NFR-OBS-004 | Alert routing and thresholds are deferred to NFR Design, Infrastructure Design, or Operations planning. |

## API Validation and Error Requirements

| NFR ID | Requirement |
|---|---|
| UOW03-NFR-API-001 | Every UOW-03 API endpoint must use schema validation. |
| UOW03-NFR-API-002 | String, date, enum, decimal, array, payload size, pagination, and effective-date bounds must be explicit. |
| UOW03-NFR-API-003 | Validation must reject invalid decimal precision, overlapping effective intervals, unsupported automatic tax-like computation, missing approval, and unauthorized activation. |
| UOW03-NFR-API-004 | Validation failures, authorization failures, missing configuration, and ambiguous configuration must return safe structured errors with reason codes and correlation IDs where available. |
| UOW03-NFR-API-005 | Request validation must be duplicated on the backend even when frontend validation exists. |

## Frontend Usability and Accessibility Requirements

| NFR ID | Requirement |
|---|---|
| UOW03-NFR-A11Y-001 | Staff configuration forms and tables target a WCAG 2.2 AA-oriented baseline. |
| UOW03-NFR-A11Y-002 | Draft, approval, activation, version history, and resolution preview workflows must support keyboard navigation, labels, focus states, and validation summaries. |
| UOW03-NFR-A11Y-003 | Normal staff workflows must not rely on a JSON-only editor. |
| UOW03-NFR-A11Y-004 | Error displays must show safe messages and correlation IDs where available. |
| UOW03-NFR-A11Y-005 | Frontend components must keep stable `data-testid` values for automation. |
| UOW03-NFR-A11Y-006 | UI text must not imply that UOW-03 creates invoices, invoice lines, payments, penalties, statements, reports, documents, emails, support jobs, or imports. |

## Testing Requirements

| NFR ID | Requirement |
|---|---|
| UOW03-NFR-TEST-001 | Backend tests use the Jest-compatible stack established by UOW-01. |
| UOW03-NFR-TEST-002 | Frontend tests use React Testing Library where frontend behavior is implemented. |
| UOW03-NFR-TEST-003 | Integration tests are required for persistence-backed effective-date lookup, activation, approval linkage, authorization, audit coupling, and resolution failure modes. |
| UOW03-NFR-TEST-004 | Property-based tests use `fast-check`. |
| UOW03-NFR-TEST-005 | UOW-03 PBT must use custom generators for effective configuration versions, rate rules, billing cycle rules, due/grace rules, rounding rules, manual tax-like charge payloads, numbering formats, template references, payment methods, and state transitions. |
| UOW03-NFR-TEST-006 | PBT must keep shrinking enabled and seed reproducibility available in CI output. |
| UOW03-NFR-TEST-007 | Critical UOW-03 workflows require example-based tests in addition to PBT. |
| UOW03-NFR-TEST-008 | Shrunk PBT failures that expose defects should be added as permanent example-based regression tests. |

## Maintainability Requirements

| NFR ID | Requirement |
|---|---|
| UOW03-NFR-MAINT-001 | UOW-03 must reuse UOW-01 actor context, authorization, approval, audit, safe error, transaction, logging, and validation conventions. |
| UOW03-NFR-MAINT-002 | Configuration lifecycle, effective-date validation, resolution services, decimal behavior, and DTO mapping must remain isolated from UI code. |
| UOW03-NFR-MAINT-003 | Later units must consume typed UOW-03 resolution DTOs or snapshots and must not query raw UOW-03 tables directly. |
| UOW03-NFR-MAINT-004 | No rule engine, workflow engine, external cache, external search service, or new database technology is introduced by UOW-03 unless NFR Design proves a hard need. |

## Boundary Requirements

| NFR ID | Requirement |
|---|---|
| UOW03-NFR-BOUNDARY-001 | UOW-03 does not create invoices or invoice lines. |
| UOW03-NFR-BOUNDARY-002 | UOW-03 does not create balances, payments, credits, adjustments, receipts, or reversals. |
| UOW03-NFR-BOUNDARY-003 | UOW-03 stores grace-period metadata consumed by UOW-06 but does not apply penalties, create penalty records, waive penalties, or classify delinquency. |
| UOW03-NFR-BOUNDARY-004 | UOW-03 stores template metadata only and does not create statements, reports, documents, emails, or support jobs. |
| UOW03-NFR-BOUNDARY-005 | UOW-03 does not create import batches. |

## Production Readiness Blockers

| Blocker | Reason |
|---|---|
| Database-backed integration tests | Required to prove effective-date, non-overlap, approval, audit, authorization, and resolution behavior against PostgreSQL semantics. |
| Performance evidence | Required to confirm p95 resolution and staff screen targets under representative first-scope data. |
| Backup/restore evidence | Required to prove activated versions, approval references, and audit records survive restore. |
| Alerting design | Required before production operation of failed/ambiguous resolution and denied-access events. |
| Operations workflow | The AI-DLC Operations stage remains a placeholder; production deployment must wait for concrete operations planning. |

## Security Baseline Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-01 | N/A for NFR Requirements | Encryption configuration is finalized in Infrastructure Design, but UOW-03 data must be included in protected PostgreSQL storage and backups. |
| SECURITY-02 | N/A for NFR Requirements | Network intermediary logging is an Infrastructure Design concern. |
| SECURITY-03 | Compliant | Structured logging with correlation IDs and sensitive payload redaction is required. |
| SECURITY-04 | Compliant by inheritance | UOW-03 web surfaces use the UOW-01 web security header baseline. |
| SECURITY-05 | Compliant | Schema validation, bounds, safe errors, and fail-closed validation are required for every endpoint. |
| SECURITY-06 | N/A for NFR Requirements | IAM/resource policies are Infrastructure Design concerns. |
| SECURITY-07 | N/A for NFR Requirements | Network controls are Infrastructure Design concerns. |
| SECURITY-08 | Compliant | Backend route, role, object/scope authorization, Treasurer approval, and denial events are required. |
| SECURITY-09 | Compliant | Safe errors and no default credential assumptions are required. |
| SECURITY-10 | Compliant by inheritance | UOW-03 reuses the existing TypeScript stack and avoids new dependency families. |
| SECURITY-11 | Compliant | Misuse-prone workflows include approval bypass, invalid activation, ambiguous resolution, and sensitive configuration logging controls. |
| SECURITY-12 | N/A for UOW-03 | Authentication mechanics are owned by UOW-01; UOW-03 consumes authenticated actor context. |
| SECURITY-13 | Compliant | Critical configuration changes are auditable and immutable after activation. |
| SECURITY-14 | Compliant | Denied access and risky configuration changes are observable requirements. |
| SECURITY-15 | Compliant | Fail-closed validation and safe structured errors are required. |

## Property-Based Testing Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| PBT-01 | Compliant by inheritance | Functional Design identifies UOW-03 testable properties and required generators. |
| PBT-02 | N/A for NFR Requirements | Round-trip serialization details are not designed in this stage. |
| PBT-03 | Compliant | Effective-date, resolution, rounding, due/grace, manual charge, and state invariants are required. |
| PBT-04 | Compliant | Immutable activated versions and state-transition behavior require repeat-operation safety tests where applicable. |
| PBT-05 | N/A for NFR Requirements | No independent reference implementation is selected in this stage. |
| PBT-06 | Compliant | Configuration lifecycle state transitions require stateful PBT coverage. |
| PBT-07 | Compliant | Domain-specific generators are required for UOW-03 configuration objects. |
| PBT-08 | Compliant | Shrinking and seed reproducibility are required. |
| PBT-09 | Compliant | TypeScript PBT framework is confirmed as `fast-check`. |
| PBT-10 | Compliant | Example-based tests are required alongside PBT for critical workflows. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
- No application code is generated.
