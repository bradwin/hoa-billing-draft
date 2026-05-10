# UOW-03 NFR Design Patterns

## Unit

- **Unit ID**: UOW-03
- **Unit Name**: Billing Configuration and Charge Rules
- **Stage**: NFR Design

## Summary

UOW-03 uses fail-closed, PostgreSQL-backed, transaction-aware design patterns for billing configuration and charge rules. The design favors immutable effective-dated versions, typed resolution snapshots, server-side authorization, approval/audit coupling, decimal-safe metadata, and reusable `fast-check` property tests over fallback guessing, raw table contracts, or new infrastructure.

UOW-03 remains a configuration and resolution unit only. It does not create invoices, invoice lines, balances, payments, penalties, credits, adjustments, statements, reports, documents, emails, support jobs, or import batches.

## Approved Planning Answers

| Question Area | Approved Decision |
|---|---|
| Fail-closed resolution | Pure resolution services query active approved versions and return typed snapshots or reason-coded failures with no side effects. |
| Effective-date enforcement | Shared half-open interval validator plus PostgreSQL-backed non-overlap guard where practical for the same configuration identity, scope, and rule type. |
| Activation transaction | Transactional activation verifies Treasurer approval where required, closes affected prior versions, creates immutable active version, and writes audit where practical. |
| Activation concurrency | Lock or conflict-check affected configuration identity/scope/rule-type version set and reject races with stable conflict errors. |
| Snapshot contract | Typed DTOs include rule payload, version ID, effective interval, approval reference where applicable, rule metadata, and correlation/context metadata. |
| Decimal and rounding | Central decimal-safe value objects/helpers preserve 4-place area/rate, 2-place money, and half-up rounding metadata without JavaScript floating point. |
| Security | UOW-01 actor context, backend guards, object/scope policies, Treasurer approval checks, safe denials, and audit/security events. |
| Observability | Structured events/metrics for failed resolution, ambiguous config, denied access, activation, immutable violations, and risky charge-type changes with redaction. |
| Frontend NFRs | Server-authorized loading, accessible forms/tables, keyboard-safe workflows, stable test IDs, safe validation summaries, preview, and no JSON-only editor. |
| PBT design | Centralized `fast-check` domain generators and state models for effective versions, resolution, due/grace, decimal, charge, numbering, and immutable transitions. |
| Logical decomposition | Separate logical components for draft, activation, version timeline, resolution, decimal policy, catalogs, authorization, audit, observability, frontend, and PBT. |
| Downstream batch use | Downstream units resolve once per identical context where practical and snapshot returned DTO metadata on their own source records. |

## Fail-Closed Resolution Pattern

### Pattern

Resolution services are pure query services. They accept a resolution context, select active approved versions for the requested effective date, and return either a typed success snapshot or a reason-coded failure.

### Design Rules

| Area | Design |
|---|---|
| Inputs | Effective date, configuration identity, scope, rule type, and rule-specific context. |
| Source data | Active approved versions only, except authorized staff preview. |
| Success | Exactly one matching version for single-version resolution, or a bounded intended list for catalog-list resolution such as payment methods. |
| Failure | Missing, ambiguous, draft-only, rejected, unauthorized, or invalid context returns safe reason-coded failure. |
| Side effects | None. Resolution never mutates configuration, invoices, payments, penalties, documents, emails, jobs, or imports. |
| Downstream contract | Downstream units snapshot returned DTO metadata on their own source records. |

Resolution must not guess from nearest historical configuration and must not use a draft as a fallback for downstream source-record units.

## Effective-Date Enforcement Pattern

UOW-03 effective-dated versions use half-open intervals:

- `effectiveFrom` is inclusive.
- `effectiveTo` is exclusive.
- `effectiveTo = null` means open-ended.

### Design Rules

| Area | Design |
|---|---|
| Validator | Shared interval validator rejects invalid ranges and overlap for the same configuration identity, scope, and rule type. |
| Persistence guard | PostgreSQL-backed non-overlap guard where practical, implemented during Code Generation. |
| Distinct identities | Different charge types, payment methods, or template references may be active during the same date range when their identities differ. |
| Adjacent versions | Adjacent periods are valid because intervals are half-open. |
| Race handling | Concurrent overlap attempts fail with stable conflict errors. |

Example:

- Old version: `2025-01-01` to `2025-06-01`
- New version: `2025-06-01` to `null`

The new version is effective starting `2025-06-01` with no overlap.

## Activation and Approval Transaction Pattern

### Pattern

Financial-impacting activation is a transactional command. It verifies approval, validates the final effective interval, coordinates version changes, writes audit, and exposes the new version only after the transaction succeeds.

### Design Rules

| Step | Design |
|---|---|
| Load draft | Load draft with actor, scope, configuration identity, rule type, and status. |
| Authorize | Enforce backend role and object/scope authorization. |
| Verify approval | Require completed Treasurer approval for financial-impacting configuration. |
| Lock or conflict-check | Protect affected version set for the same configuration identity, scope, and rule type. |
| Validate | Re-run schema, domain, decimal, and effective-date validation at activation time. |
| Close prior version | Supersede or set `effectiveTo` on affected prior version where required by the configuration model. |
| Activate new version | Create immutable active version with approval and source draft references. |
| Audit | Write actor, timestamp, approval reference, effective dates, old/new version references, reason or remarks, and correlation ID. |

Activation without required approval is invalid even for administrators.

## Concurrency Pattern

UOW-03 activation and version changes must reject conflicting concurrent writes instead of using last-writer-wins.

| Area | Design |
|---|---|
| Conflict scope | Configuration identity, scope, and rule type. |
| Draft preview | Staff preview never mutates active configuration and never changes downstream consumability. |
| Race failure | Conflicting activation returns stable conflict error with correlation ID. |
| Audit | Failed risky activation attempts are observable and may be audited as security or integrity events. |

Exact locking, isolation, and database constraints are finalized in Code Generation, but the design requires conflict detection at persistence and service boundaries where practical.

## Resolution Snapshot Contract Pattern

Resolution outputs are typed DTOs, not raw database rows.

| Field Group | Required Content |
|---|---|
| Rule payload | Rule-specific values needed by downstream units. |
| Version reference | Resolved configuration version ID and source draft where useful. |
| Effective interval | `effectiveFrom`, `effectiveTo`, and resolution date. |
| Approval reference | Approval request ID where applicable. |
| Rule metadata | Rounding timing, decimal scale, eligibility flags, document type, sequence scope, payment reference requirements, or template metadata as applicable. |
| Trace metadata | Correlation ID or resolution context identifiers safe for audit and diagnostics. |

Downstream units snapshot these references on their own source records. Later UOW-03 changes never rewrite downstream snapshots.

## Decimal and Rounding Pattern

### Pattern

UOW-03 uses central decimal-safe value objects or helpers for validation and metadata resolution.

### Design Rules

| Area | Design |
|---|---|
| Rate precision | Rate per sqm supports up to 4 decimal places. |
| Lot area precision | Lot area metadata supports up to 4 decimal places. |
| Money precision | Money outputs use 2 decimal places where UOW-03 exposes monetary metadata. |
| Rounding mode | Half-up rounding metadata is explicit. |
| Rounding timing | Line-level default, total-level only when configured. |
| JavaScript number | Not allowed for financial decimal behavior. |

UOW-03 stores and resolves rounding metadata. UOW-04 applies it when creating invoice source records.

## Security and Authorization Pattern

### Pattern

UOW-03 reuses UOW-01 actor context, route guards, approval workflow, audit, safe error, and structured logging contracts.

| Area | Design |
|---|---|
| Authentication | Required for every UOW-03 endpoint. |
| Route authorization | Backend role checks for staff configuration and preview actions. |
| Object/scope authorization | Verify actor access to configuration scope and draft/version resources. |
| Approval | Treasurer approval required for financial-impacting activation. |
| Denials | Safe non-enumerating authorization failures with correlation IDs. |
| Client controls | Frontend role-aware controls are usability only. |

Authorization failures must not reveal whether hidden drafts or versions exist.

## Observability and Sensitive Logging Pattern

### Pattern

UOW-03 emits structured logs and metrics/events with safe identifiers only.

| Signal | Required Handling |
|---|---|
| Missing resolution | Emit safe missing-configuration event with rule type/scope and correlation ID. |
| Ambiguous resolution | Emit safe ambiguous-configuration event with rule type/scope and correlation ID. |
| Denied access | Emit audit/security event with actor, action, safe resource reference, and correlation ID. |
| Draft submission | Emit structured event with draft ID, rule type, scope, actor, and result. |
| Approval activation | Emit structured event and audit with version references and approval reference. |
| Immutable violation attempt | Emit integrity/security event with safe identifiers. |
| Manual tax-like charge config change | Emit audit-sensitive event because later invoice units may use this configuration. |

Logs must not contain full payment instructions, bank details, tokens, credentials, or full sensitive draft payloads.

## Frontend NFR Pattern

UOW-03 frontend components load data from server-authorized APIs and render only returned, authorized content.

| Area | Design |
|---|---|
| Accessibility | WCAG 2.2 AA-oriented forms, tables, filters, focus states, labels, and validation summaries. |
| Approval workflow | Keyboard-safe draft submission, status display, approval result display, and read-only activated version views. |
| Version history | Paged history with active, pending, rejected, superseded, retired, and draft states where authorized. |
| Resolution preview | Staff-only preview returns side-effect-free snapshots or safe reason-coded errors. |
| Editing model | Normal staff workflows use structured forms/tables, not JSON-only editing. |
| Automation | Stable `data-testid` values from Functional Design are preserved. |
| Error display | Safe error banners include correlation IDs where available. |

UI text must not imply that UOW-03 creates invoices, payments, penalties, reports, documents, emails, jobs, or imports.

## PBT Design Pattern

### Pattern

UOW-03 uses centralized `fast-check` domain generators and state models. PBT complements, but does not replace, example-based tests for critical financial configuration workflows.

### Required Generators and Models

| PBT Asset | Purpose |
|---|---|
| Effective configuration version generator | Generate overlapping, adjacent, open-ended, and valid half-open intervals. |
| Rate resolution generator | Generate rate versions and billing period start dates for deterministic resolution. |
| Billing cycle generator | Generate predefined and custom cycle definitions. |
| Due/grace rule generator | Generate base date, offset, due date, and grace day cases. |
| Decimal policy generator | Generate decimal strings, rates, area precision, money metadata, and invalid precision. |
| Manual tax-like charge generator | Generate valid and invalid charge type eligibility and required manual-entry metadata. |
| Numbering format generator | Generate document type, effective date, format, reset, and sequence scope cases. |
| Template/payment catalog generator | Generate distinct active identities that may coexist during the same date range. |
| Version lifecycle state model | Generate valid and invalid draft, pending approval, rejected, activated, superseded, and retired transitions. |

PBT failures must preserve shrinking and seed reproducibility. Shrunk failures that expose defects should become permanent example-based regression tests.

## Downstream Batch-Use Pattern

Downstream units may resolve once per identical context where practical, then snapshot the returned DTO metadata on their own source records.

| Rule | Design |
|---|---|
| Snapshot ownership | Downstream source-record unit owns its snapshot once created. |
| UOW-03 immutability | Later UOW-03 corrections create new versions and do not rewrite downstream snapshots. |
| Batch optimization | Reuse a resolved snapshot only when the resolution context is identical. |
| Raw tables | Downstream units must not query raw UOW-03 tables or reimplement interpretation rules. |
| Side effects | UOW-03 does not create downstream source records. |

## Security Baseline Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-01 | N/A for NFR Design | Encryption implementation is deferred to Infrastructure Design. |
| SECURITY-02 | N/A for NFR Design | Network intermediary logging is Infrastructure Design. |
| SECURITY-03 | Compliant | Structured logging with redaction and correlation IDs is designed. |
| SECURITY-04 | Compliant by inheritance | UOW-03 uses UOW-01 web/API security middleware. |
| SECURITY-05 | Compliant | Schema validation, bounds, decimal checks, and safe errors are designed for all endpoints. |
| SECURITY-06 | N/A for NFR Design | IAM/resource policies are Infrastructure Design concerns. |
| SECURITY-07 | N/A for NFR Design | Network controls are Infrastructure Design concerns. |
| SECURITY-08 | Compliant | Backend route, object/scope authorization, approval checks, and non-enumerating denials are designed. |
| SECURITY-09 | Compliant | Safe errors and no default credential assumptions are preserved. |
| SECURITY-10 | Compliant | No new dependency family or external service is introduced. |
| SECURITY-11 | Compliant | Approval, authorization, audit, decimal validation, and fail-closed resolution are layered controls. |
| SECURITY-12 | N/A for UOW-03 | Authentication mechanics are owned by UOW-01; UOW-03 consumes authenticated actor context. |
| SECURITY-13 | Compliant | Critical configuration changes are auditable and immutable after activation. |
| SECURITY-14 | Compliant | Denied access, failed resolution, and risky configuration changes are observable. |
| SECURITY-15 | Compliant | Fail-closed validation and safe structured errors are designed. |

## Property-Based Testing Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| PBT-01 | Compliant by inheritance | Functional Design identifies UOW-03 testable properties and required generators. |
| PBT-02 | N/A for NFR Design | No reversible serialization/formatting pair is designed here. |
| PBT-03 | Compliant | Effective-date, resolution, rounding, due/grace, manual charge, and state invariants are designed. |
| PBT-04 | Compliant | Immutable activated versions and repeat-state behavior are covered. |
| PBT-05 | N/A for NFR Design | No independent reference implementation is selected in this stage. |
| PBT-06 | Compliant | Version lifecycle state models are required. |
| PBT-07 | Compliant | Domain-specific generators are required. |
| PBT-08 | Compliant | Shrinking and seed reproducibility are required. |
| PBT-09 | Compliant | `fast-check` is selected for TypeScript. |
| PBT-10 | Compliant | Example-based tests remain required alongside PBT. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
- No application code is generated.
