# UOW-03 Logical Components

## Unit

- **Unit ID**: UOW-03
- **Unit Name**: Billing Configuration and Charge Rules
- **Stage**: NFR Design

## Summary

This artifact defines the logical components needed to implement the approved UOW-03 functional and non-functional design. Component names are logical, not final package or class names. Code Generation will map them into the TypeScript modular monolith structure.

## Component Inventory

| Component | Responsibility | Primary NFR Responsibilities |
|---|---|---|
| Configuration Draft Component | Create, validate, update, submit, reject, and list configuration drafts. | SECURITY-05, SECURITY-08, SECURITY-13 |
| Approval Activation Component | Verify approval, activate immutable versions, close affected prior versions, and audit activation. | SECURITY-08, SECURITY-13, SECURITY-15 |
| Version Timeline Component | Enforce half-open intervals, non-overlap, immutable active versions, and historical version lookup. | SECURITY-05, SECURITY-13, PBT-03 |
| Resolution Service Component | Resolve active approved configuration snapshots and fail closed on missing or ambiguous configuration. | SECURITY-05, SECURITY-15, PBT-03 |
| Decimal Policy Component | Validate and expose decimal scale, rounding mode, and rounding timing metadata. | SECURITY-05, PBT-03 |
| Rate Rule Component | Manage dues rate configuration versions and rate resolution metadata. | SECURITY-05, PBT-03 |
| Billing Cycle Component | Manage deterministic billing cycle definitions and custom cycle metadata. | SECURITY-05, PBT-03 |
| Due Grace Rule Component | Manage due date and grace-period metadata consumed by later units. | SECURITY-05, PBT-03 |
| Charge Type Catalog Component | Manage charge type catalog, recurrence/manual/automatic eligibility, and manual tax-like configuration. | SECURITY-05, SECURITY-13, PBT-03 |
| Numbering Template Payment Catalog Component | Manage numbering format, template reference, and payment method metadata. | SECURITY-05, PBT-03 |
| Authorization Policy Component | Apply UOW-03 route, role, object/scope, preview, and activation policies using UOW-01 actor context. | SECURITY-08, SECURITY-11 |
| Audit Adapter Component | Create UOW-01 audit entries for activation, risky changes, denials, and immutable violation attempts. | SECURITY-03, SECURITY-13, SECURITY-14 |
| Observability Adapter Component | Emit safe structured logs, metrics, and security/integrity events. | SECURITY-03, SECURITY-14 |
| Error Mapping Component | Map missing, ambiguous, validation, conflict, approval, and authorization failures to safe errors. | SECURITY-09, SECURITY-15 |
| Frontend Interaction Component | Render accessible staff configuration, approval, history, and resolution preview workflows. | SECURITY-08, SECURITY-15 |
| PBT Generator Component | Provide `fast-check` generators and state models for UOW-03 invariants. | PBT-01, PBT-06, PBT-07, PBT-08, PBT-09, PBT-10 |

## Request Processing Chain

Protected UOW-03 commands and queries use this logical chain:

1. UOW-01 Correlation Component assigns or validates a correlation ID.
2. UOW-01 Authentication resolves the actor context.
3. UOW-03 request validation checks shape, bounds, enum values, dates, decimal values, payload size, and pagination.
4. UOW-03 Authorization Policy Component enforces role, object, scope, preview, and activation policy.
5. Domain component executes the command or query.
6. Approval Activation Component verifies Treasurer approval where required before activation.
7. Version Timeline Component enforces half-open intervals, non-overlap, and immutability.
8. Audit Adapter Component appends required audit entries for sensitive mutations and denials.
9. Resolution Service Component returns typed snapshots or reason-coded failures.
10. Error Mapping Component converts failures to safe structured errors.
11. Observability Adapter Component emits redacted structured logs, metrics, and events.

Authorization and validation failures deny access by default. UOW-03 does not rely on frontend hiding for authorization.

## Logical Data Responsibilities

| Logical Data | Owner Component | Key NFR Design Notes |
|---|---|---|
| BillingConfigurationDraft | Configuration Draft Component | Drafts are not consumed by downstream units; financial-impacting drafts require approval before activation. |
| ConfigurationVersion | Version Timeline Component | Immutable once activated; half-open effective interval; non-overlap by same configuration identity, scope, and rule type. |
| DuesRateRule | Rate Rule Component | Stores rate metadata only; UOW-03 does not multiply by lot area. |
| BillingCycleRule | Billing Cycle Component | Produces deterministic billing period definitions. |
| DueDateRule | Due Grace Rule Component | Stores base date and offset metadata. |
| GracePeriodRule | Due Grace Rule Component | Stores grace-period metadata for UOW-06 consumption; UOW-03 does not apply penalties. |
| RoundingRule | Decimal Policy Component | Stores half-up rounding, scale, and timing metadata. |
| ChargeType | Charge Type Catalog Component | Defines manual/automatic/recurrence eligibility; manual tax-like configuration only. |
| NumberingFormatRule | Numbering Template Payment Catalog Component | Defines format metadata only; later units allocate actual numbers. |
| TemplateReference | Numbering Template Payment Catalog Component | Stores template metadata only; UOW-08 owns rendering/storage. |
| PaymentMethodDefinition | Numbering Template Payment Catalog Component | Stores payment method definition metadata only; UOW-05 owns payment records. |
| ConfigurationResolutionSnapshot | Resolution Service Component | Typed side-effect-free output for downstream snapshotting. |
| AuditRecordReference | Audit Adapter Component | UOW-01 audit reference attached to activation and sensitive actions. |

## Component Dependencies

| Component | Depends On | Must Not Depend On |
|---|---|---|
| Configuration Draft Component | Validation, Authorization Policy, Error Mapping, Audit Adapter | Invoice, payment, penalty, document, email, job, or import execution |
| Approval Activation Component | UOW-01 Approval Workflow, Version Timeline, Audit Adapter, Authorization Policy | Frontend approval state as authority |
| Version Timeline Component | Validation, Decimal Policy, Error Mapping | Downstream invoice, payment, penalty, report, or document source records |
| Resolution Service Component | Version Timeline, Rate Rule, Billing Cycle, Due Grace Rule, Decimal Policy, Charge Type Catalog, Numbering Template Payment Catalog | Raw downstream table access or side-effecting generation |
| Decimal Policy Component | Shared validation/value-object utilities | JavaScript floating-point financial behavior |
| Rate Rule Component | Decimal Policy, Version Timeline | Property lot-area multiplication |
| Billing Cycle Component | Version Timeline, Validation | Ad hoc unconfigured recurring period generation |
| Due Grace Rule Component | Version Timeline, Validation | Penalty application, waiver, record creation, or delinquency classification |
| Charge Type Catalog Component | Version Timeline, Decimal Policy, Audit Adapter | Invoice-line creation |
| Numbering Template Payment Catalog Component | Version Timeline, Validation | Number allocation, template rendering, payment posting |
| Authorization Policy Component | UOW-01 ActorContext and authorization contracts | Frontend state as authority |
| Audit Adapter Component | UOW-01 Audit, Correlation | Raw sensitive payload logging |
| Observability Adapter Component | UOW-01 logging/security-event conventions | Full before/after sensitive payload logging |
| Error Mapping Component | UOW-01 safe error conventions, Correlation | Database diagnostics in user-facing responses |
| Frontend Interaction Component | Server-authorized APIs, Safe error responses | Client-side authorization decisions or JSON-only normal editing |
| PBT Generator Component | Shared domain schemas and value objects | Production runtime dependencies |

## Component Details

### Configuration Draft Component

Responsibilities:

- Create and update billing configuration drafts.
- Validate schema, decimal shape, effective dates, and required fields.
- Track draft states such as draft, pending approval, rejected, and activated.
- Submit financial-impacting drafts to UOW-01 Approval Workflow.
- Prevent draft-only or rejected versions from downstream consumption.

### Approval Activation Component

Responsibilities:

- Verify actor authorization and approval state.
- Require Treasurer approval for financial-impacting configuration.
- Activate immutable configuration versions.
- Coordinate version closure or supersession with Version Timeline Component.
- Write activation audit through Audit Adapter Component.
- Reject activation when approval, validation, or conflict checks fail.

### Version Timeline Component

Responsibilities:

- Enforce half-open intervals.
- Reject overlap for the same configuration identity, scope, and rule type.
- Permit overlapping date ranges for distinct charge type, payment method, or template identities.
- Preserve immutable activated versions.
- Provide historical lookup for audit, history, and resolution services.

Required index candidates for Code Generation:

- Configuration identity.
- Scope key.
- Rule type.
- Status.
- Effective interval fields.
- Source draft ID.
- Approval request ID.

### Resolution Service Component

Responsibilities:

- Resolve rate, billing cycle, due/grace, rounding, charge type, numbering, template, and payment method configuration.
- Return active approved configuration only for downstream consumers.
- Return safe missing or ambiguous reason codes.
- Include version IDs, effective intervals, approval references, and rule metadata in snapshots.
- Avoid side effects and downstream source-record creation.

### Decimal Policy Component

Responsibilities:

- Validate decimal strings or decimal-safe persistence values.
- Preserve up to 4 decimal places for rate and lot-area metadata.
- Preserve 2-place money metadata.
- Expose half-up rounding and timing metadata.
- Reject JavaScript floating-point financial behavior.

### Charge Type Catalog Component

Responsibilities:

- Manage configured charge type identities and eligibility flags.
- Distinguish recurring, manual-entry, and automatic-generation eligibility.
- Enforce manual tax-like charge configuration as manual-entry eligible only.
- Audit risky manual tax-like charge configuration changes.
- Avoid invoice-line creation.

### Numbering Template Payment Catalog Component

Responsibilities:

- Manage numbering format metadata by document type.
- Manage template reference metadata only.
- Manage payment method definition metadata only.
- Permit distinct active identities to coexist in the same date range.
- Avoid number allocation, rendering, storage, delivery, payment posting, or receipt creation.

### Authorization Policy Component

Responsibilities:

- Use UOW-01 actor context.
- Enforce route, role, object, scope, preview, and activation policies.
- Require backend authorization for all protected operations.
- Deny by default.
- Produce safe non-enumerating denial results.

### Audit Adapter Component

Responsibilities:

- Create UOW-01 audit records for activation, rejection, risky configuration changes, immutable violation attempts, and denials.
- Include actor, timestamp, approval reference where required, old/new version references, reason or remarks, and correlation ID.
- Avoid raw sensitive payloads.

### Observability Adapter Component

Responsibilities:

- Emit structured logs with timestamp, level, correlation ID, safe message, action, result, and safe resource/version identifiers.
- Emit metrics or events for failed resolution, ambiguous configuration, missing configuration, denied access, draft submission, approval activation, immutable violation attempts, and manual tax-like charge configuration changes.
- Redact sensitive values and full payloads.

### Frontend Interaction Component

Responsibilities:

- Render server-authorized staff configuration screens.
- Provide accessible forms, tables, approval panels, version history, validation summaries, and resolution preview.
- Preserve stable `data-testid` values.
- Display safe errors and correlation IDs where available.
- Avoid JSON-only editing for normal staff workflows.
- Avoid UI wording that implies UOW-03 creates downstream financial records.

### PBT Generator Component

Required generators and state models:

| Asset | Component Coverage |
|---|---|
| Effective configuration version generator | Version Timeline half-open interval and non-overlap rules. |
| Rate resolution generator | Rate Rule and Resolution Service deterministic resolution. |
| Billing cycle generator | Billing Cycle deterministic period metadata. |
| Due/grace rule generator | Due Grace Rule base date, offset, and grace metadata. |
| Decimal policy generator | Decimal Policy precision, invalid precision, and rounding metadata. |
| Manual tax-like charge generator | Charge Type Catalog eligibility and required metadata. |
| Numbering format generator | Numbering metadata and effective-date resolution. |
| Template/payment catalog generator | Distinct active identity coexistence. |
| Version lifecycle state model | Draft, pending approval, rejected, activated, superseded, retired, and immutable transition behavior. |

## NFR Responsibility Mapping

| NFR Area | Primary Components |
|---|---|
| Fail-closed resolution | Resolution Service, Error Mapping, Observability Adapter |
| Effective-date integrity | Version Timeline, Configuration Draft, Approval Activation |
| Approval and audit | Approval Activation, Audit Adapter, Authorization Policy |
| Decimal safety | Decimal Policy, Rate Rule, Charge Type Catalog |
| Security and authorization | Authorization Policy, Error Mapping, Audit Adapter |
| Observability | Observability Adapter, Resolution Service, Approval Activation |
| Frontend accessibility | Frontend Interaction |
| Downstream contracts | Resolution Service, Version Timeline |
| PBT | PBT Generator, Version Timeline, Resolution Service, Decimal Policy |

## Boundary Enforcement

| Boundary | Enforced By |
|---|---|
| No invoice or invoice-line creation | Resolution Service, Charge Type Catalog, Frontend Interaction |
| No payment, balance, credit, adjustment, receipt, or reversal creation | Numbering Template Payment Catalog, Resolution Service |
| No penalty application, penalty records, waivers, or delinquency classification | Due Grace Rule, Resolution Service |
| No statement, report, document, email, support job, or import batch creation | Numbering Template Payment Catalog, Frontend Interaction |
| No raw table interpretation by downstream units | Resolution Service typed DTO contracts |
| No JavaScript floating-point financial behavior | Decimal Policy |

## Security Baseline Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-03 | Compliant | Observability Adapter requires structured redacted logs. |
| SECURITY-05 | Compliant | Validation is explicit before domain commands and queries. |
| SECURITY-08 | Compliant | Authorization Policy enforces backend route and object/scope checks. |
| SECURITY-09 | Compliant | Error Mapping prevents unsafe diagnostics in user-facing responses. |
| SECURITY-10 | Compliant | No new dependency family or external service is introduced. |
| SECURITY-11 | Compliant | Security-critical authorization, approval, audit, and error behavior is isolated. |
| SECURITY-13 | Compliant | Critical configuration changes are auditable and immutable. |
| SECURITY-14 | Compliant | Risky changes and denials produce observable events. |
| SECURITY-15 | Compliant | Fail-closed resolution and safe errors are explicit. |

## Property-Based Testing Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| PBT-01 | Compliant | Component-level testable properties are identified. |
| PBT-03 | Compliant | Invariants are assigned to Version Timeline, Resolution Service, Decimal Policy, and catalogs. |
| PBT-04 | Compliant | Immutable state-transition behavior is assigned to Version Timeline and lifecycle state model. |
| PBT-06 | Compliant | Version lifecycle state model is required. |
| PBT-07 | Compliant | Domain-specific generators are required. |
| PBT-08 | Compliant | Shrinking and seed reproducibility carry forward from NFR Requirements. |
| PBT-09 | Compliant | `fast-check` remains the selected framework. |
| PBT-10 | Compliant | PBT complements example-based tests. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
- No application code is generated.
