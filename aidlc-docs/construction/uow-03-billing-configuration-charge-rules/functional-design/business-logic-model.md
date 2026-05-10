# UOW-03 Business Logic Model

## Unit

- **Unit ID**: UOW-03
- **Unit Name**: Billing Configuration and Charge Rules
- **Stage**: Functional Design

## Summary

UOW-03 owns billing configuration and charge rule definitions used by later financial units. It creates immutable, effective-dated configuration versions and pure resolution results. It does not create invoices, invoice lines, balances, payments, penalties, credits, adjustments, statements, reports, documents, emails, support jobs, or import batches.

UOW-03 is financially sensitive because invoice generation, payment posting, penalty eligibility, receipts, statements, reports, notifications, and documents consume these rules. Configuration ambiguity must fail closed rather than allowing later units to guess.

## Approved Planning Decisions

| Area | Approved Decision |
|---|---|
| Rate resolution | Active dues rate is selected by billing period start date using effective-dated, non-overlapping rate versions for the same configuration identity, scope, and rule type. |
| Activation | Financial-impacting configuration may be drafted by staff but activation requires Treasurer approval and audit. |
| Billing cycles | Monthly, quarterly, semi-annual, annual, and custom cycles are supported with explicit period start/end generation rules. |
| Due date rules | Due date base may be billing period start, billing period end, or invoice issue date, with day offset. Weekend/holiday behavior is deferred until configured. |
| Grace periods | Grace period is integer days after due date and is consumed by UOW-06 penalty eligibility; UOW-03 does not apply penalties, create penalty records, waive penalties, or classify delinquency. |
| Rounding | Decimal arithmetic uses half-up rounding to centavos. Default rounding timing is line-level, with rule metadata for total-level rounding. |
| Precision | Lot area and rate per sqm support up to 4 decimal places. Money outputs round to 2 decimal places. |
| Charge types | Charge type catalog includes category, recurrence/manual eligibility, active status, effective dates, and automatic-generation eligibility. |
| Manual tax-like charges | UOW-03 configures and resolves allowed manual tax-like charge types only; no automatic tax computation exists in UOW-03. |
| Numbering formats | Numbering rules store document type, prefix/template, sequence scope, padding, reset policy, and effective dates. Later units allocate actual numbers atomically. |
| Template references | UOW-03 stores template metadata only. UOW-08 owns rendering and storage. |
| Payment methods | UOW-03 stores payment method definitions consumed by UOW-05. |
| History | Activated configuration versions are immutable; corrections require new versions. |
| Downstream API | UOW-03 exposes pure resolution services/read models only. |
| Frontend | Staff configuration pages cover all UOW-03 rule areas, approval status, and effective-version history. |

## Configuration Lifecycle Flow

1. Authorized staff creates a draft billing configuration version.
2. The system validates required fields, decimal precision, effective dates, and non-overlap rules for the same configuration identity, scope, and rule type.
3. If the configuration affects financial outcomes, it remains inactive until Treasurer approval.
4. UOW-01 Approval Workflow records approval or rejection.
5. On approval, UOW-03 activates the configuration version and audits the activation.
6. Activated versions become immutable.
7. Corrections require a new version with its own effective date, approval reference where required, and audit trail.

Rejected drafts do not become active. Later invoice, payment, penalty, receipt, statement, report, document, notification, and portal units must not infer rules from rejected or draft-only versions.

## Rate Resolution Flow

Inputs:

- Charge type or dues rule reference.
- Billing period start date.
- Optional context such as subdivision/HOA scope if later requirements introduce more than one scope.

Rules:

1. Find active dues rate versions whose effective interval covers the billing period start date.
2. Exactly one active rate version must match.
3. If none match, resolution fails closed with a reason code.
4. If more than one active version matches, resolution fails closed with an ambiguity reason code.
5. The result includes rate per sqm, precision metadata, rounding rule reference, effective version ID, and approval/audit reference.

UOW-03 does not multiply lot area by rate for a property. UOW-04 performs invoice calculation using UOW-03 resolved configuration and UOW-02 lot area facts, then snapshots the applied inputs and configuration references on the invoice source record.

## Billing Cycle Flow

Billing cycle rules define how billing periods are generated.

Supported cycle types:

- Monthly.
- Quarterly.
- Semi-annual.
- Annual.
- Custom.

For predefined cycles, period generation must be deterministic from a configured anchor date or calendar basis. For custom cycles, explicit period start/end generation rules are required. Custom cycles cannot be free-form ad hoc periods without a rule because later invoice duplicate prevention depends on stable period identity.

## Due Date And Grace Period Flow

Due date rule inputs:

- Billing period start date.
- Billing period end date.
- Invoice issue date, when the selected rule uses issue date as base.

Due date rule outputs:

- Due date.
- Rule version ID.
- Base date type.
- Day offset.

Grace period rule outputs:

- Integer days after due date.
- Penalty eligibility date for UOW-06 consumption.

Grace period does not change the due date. UOW-03 stores grace-period metadata, and UOW-06 consumes grace-period metadata for penalty eligibility. UOW-03 does not apply penalties, create penalty records, waive penalties, or classify delinquency. Weekend and holiday movement are out of scope unless explicitly configured in a future approved rule.

## Rounding And Precision Flow

Numeric rules:

- Lot area supports up to 4 decimal places.
- Rate per sqm supports up to 4 decimal places.
- Money outputs round to 2 decimal places.
- Rounding mode is half-up to centavos.

Rounding timing:

- Default: round each line, then total lines.
- Optional metadata: total-level rounding if explicitly configured.

UOW-03 stores rounding rules and exposes them in resolved snapshots. UOW-04 applies the rule when generating invoice source records.

## Charge Type Flow

Charge type definitions classify billable and manual charges.

Each charge type determines:

- Category.
- Whether it is recurring eligible.
- Whether it is manual-entry eligible.
- Whether later units may generate it automatically.
- Active status and effective period.
- Whether approval is required for activation.

Manual tax-like charge types are allowed only as manual-entry eligible configured charge types. UOW-03 configures and resolves allowed manual tax-like charge types only. Later invoice-owning units create the actual manual line items and perform transaction-level audit. UOW-03 does not compute tax-like amounts automatically and does not create invoice lines.

## Numbering Format Flow

Numbering format rules define how later units should allocate document numbers.

UOW-03 stores:

- Document type.
- Prefix or template.
- Sequence scope.
- Padding.
- Reset policy.
- Effective period.

UOW-03 does not allocate invoice, receipt, statement, report, or document numbers. Later owning units allocate actual numbers atomically and snapshot the numbering rule version they used.

## Template Reference Flow

UOW-03 stores template metadata only:

- Template type.
- Template key or reference.
- Version label.
- Active status.
- Effective period.

UOW-03 does not render HTML, PDF, emails, statements, reports, or documents. UOW-08 owns concrete rendering and storage implementations.

## Payment Method Flow

Payment method definitions include:

- Display name.
- Instructions.
- Reference requirements.
- Sort order.
- Active status.
- Effective period.

UOW-05 consumes payment methods when accepting and posting payments. UOW-03 does not create payment records or validate a specific payment transaction.

## Resolution Services

UOW-03 exposes pure resolution services and read models:

| Service | Input | Output |
|---|---|---|
| Rate resolution | Billing period start date, charge context | Applicable rate configuration snapshot with version ID, effective interval, approval reference where applicable, and rule metadata needed for downstream snapshotting. |
| Billing cycle resolution | Cycle ID and anchor context | Deterministic billing period definitions. |
| Due/grace resolution | Period dates and optional issue date | Due date and grace metadata. |
| Charge type resolution | Charge type ID and date | Active charge type snapshot. |
| Numbering format resolution | Document type and date | Applicable numbering format snapshot. |
| Template reference resolution | Template type and date | Applicable template metadata. |
| Payment method list | Context date | Active payment method definitions. |

Resolution services have no side effects and do not create downstream source records. Resolution outputs include enough version and rule metadata for downstream units to snapshot the exact configuration used.

## Error Handling

| Scenario | Behavior |
|---|---|
| No active version covers requested date | Fail closed with safe missing configuration reason. |
| Multiple active versions cover requested date | Fail closed with safe ambiguous configuration reason. |
| Draft version requested by downstream source-record unit | Deny; only active approved versions are consumable. |
| Invalid precision | Reject during draft validation. |
| Overlapping effective dates | Reject activation and draft submission where practical. |
| Missing approval for financial-impacting activation | Reject activation. |
| Unsupported automatic tax computation | Reject; only manual explicit tax-like charges are allowed. |

## PBT Candidate Properties

| Property | Expected Invariant |
|---|---|
| Rate version non-overlap | Generated effective-dated rate versions cannot overlap when active for the same configuration identity, scope, and rule type. |
| Rate resolution determinism | For any date, resolution returns zero or one active version, never ambiguous in valid data. |
| Due date calculation | Day offsets from configured base date produce deterministic due dates. |
| Grace period calculation | Penalty eligibility date is due date plus grace days and does not alter due date. |
| Rounding stability | Decimal half-up rounding produces stable centavo results independent of input formatting. |
| Manual charge validation | Manual tax-like charges require configured charge type, amount, description, and reason. |
| Version immutability | Activated versions cannot be edited in place. |
| Numbering format uniqueness | Effective numbering format resolution by document type/date is non-ambiguous. |

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Financial-impacting activation requires approval and audit; downstream consumers receive safe resolution services; no side-effecting financial source records are created. |
| Property-Based Testing | Compliant | Financial and effective-date invariants are identified for later PBT implementation. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
