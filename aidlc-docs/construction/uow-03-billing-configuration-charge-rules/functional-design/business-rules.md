# UOW-03 Business Rules

## Unit

- **Unit ID**: UOW-03
- **Unit Name**: Billing Configuration and Charge Rules
- **Stage**: Functional Design

## Scope Rules

| Rule ID | Rule |
|---|---|
| UOW03-SCOPE-001 | UOW-03 owns billing configuration, charge rules, effective-dated configuration versions, and pure configuration resolution services. |
| UOW03-SCOPE-002 | UOW-03 must not create invoices, invoice lines, balances, payments, penalties, credits, adjustments, statements, reports, documents, emails, support jobs, or import batches. |
| UOW03-SCOPE-003 | UOW-03 must not calculate actual invoice amounts for a property. UOW-04 applies UOW-03 rules to UOW-02 property facts and snapshots the result. |
| UOW03-SCOPE-004 | UOW-03 must not automatically calculate tax-like charges. Manual tax-like charges remain explicit manual line items only. |

## Configuration Lifecycle Rules

| Rule ID | Rule |
|---|---|
| UOW03-CONFIG-001 | Financial-impacting configuration changes may be drafted by authorized staff but require Treasurer approval before activation. |
| UOW03-CONFIG-002 | Financial-impacting configuration includes rate, due date, grace-period rules consumed by later penalty units, rounding, charge type, numbering, and payment method rules. |
| UOW03-CONFIG-003 | Every activated configuration version must be audited with actor, timestamp, approval reference where required, effective dates, old version reference, new version reference, reason or remarks, and correlation ID. |
| UOW03-CONFIG-004 | Activated configuration versions are immutable. Corrections require a new version with its own effective date and audit trail. |
| UOW03-CONFIG-005 | Rejected drafts do not become active and must not be consumed by downstream units. |
| UOW03-CONFIG-006 | Resolution services return only active approved versions unless explicitly used by staff preview screens. |
| UOW03-CONFIG-007 | Configuration resolution results must include the resolved configuration version ID, effective interval, approval reference where applicable, and enough rule metadata for downstream units to snapshot the configuration used. |

## Effective-Date Rules

| Rule ID | Rule |
|---|---|
| UOW03-EFFECTIVE-001 | Effective-dated configuration versions use half-open intervals: `effectiveFrom` is inclusive and `effectiveTo` is exclusive. `effectiveTo = null` means open-ended. |
| UOW03-EFFECTIVE-002 | Active versions for the same configuration identity, scope, and rule type must not overlap. Multiple distinct charge types, payment methods, or template references may be active during the same date range when they have different identities. |
| UOW03-EFFECTIVE-003 | Resolution fails closed when no active version covers the requested date. |
| UOW03-EFFECTIVE-004 | Resolution fails closed when more than one active version covers the requested date. |
| UOW03-EFFECTIVE-005 | Later changes never mutate prior snapshots created by downstream units. |

## Rate Rules

| Rule ID | Rule |
|---|---|
| UOW03-RATE-001 | The active dues rate per sqm is resolved by billing period start date. |
| UOW03-RATE-002 | Dues rate versions must be effective-dated and non-overlapping for the same scope. |
| UOW03-RATE-003 | Rate per sqm supports up to 4 decimal places. |
| UOW03-RATE-004 | Rate values must be greater than or equal to zero. Negative dues rates are invalid. |
| UOW03-RATE-005 | UOW-03 returns rate snapshots but does not multiply rate by lot area for a property. |

## Billing Cycle Rules

| Rule ID | Rule |
|---|---|
| UOW03-CYCLE-001 | Supported cycle types are Monthly, Quarterly, SemiAnnual, Annual, and Custom. |
| UOW03-CYCLE-002 | Custom cycles require explicit period start/end generation rules. |
| UOW03-CYCLE-003 | Billing cycle rules must produce deterministic billing period identities. |
| UOW03-CYCLE-004 | Free-form ad hoc billing periods without a configured rule are invalid for recurring generation. |

## Due Date And Grace Rules

| Rule ID | Rule |
|---|---|
| UOW03-DUE-001 | Due date rules may use billing period start date, billing period end date, or invoice issue date as base date. |
| UOW03-DUE-002 | Due date rules use an integer day offset from the selected base date. |
| UOW03-DUE-003 | Weekend and holiday movement is not applied unless a later approved configuration rule explicitly defines it. |
| UOW03-GRACE-001 | Grace periods are integer days after due date. |
| UOW03-GRACE-002 | Grace periods do not change the due date. |
| UOW03-GRACE-003 | UOW-06 consumes grace period metadata for penalty eligibility. UOW-03 does not apply penalties. |

## Rounding And Precision Rules

| Rule ID | Rule |
|---|---|
| UOW03-ROUND-001 | Decimal arithmetic uses half-up rounding to centavos. |
| UOW03-ROUND-002 | Monetary outputs round to 2 decimal places. |
| UOW03-ROUND-003 | Lot area supports up to 4 decimal places. |
| UOW03-ROUND-004 | Rate per sqm supports up to 4 decimal places. |
| UOW03-ROUND-005 | Default rounding timing is line-level rounding, where each line rounds before invoice totals are summed. |
| UOW03-ROUND-006 | Total-level rounding may be configured explicitly through rule metadata. |
| UOW03-ROUND-007 | JavaScript floating-point arithmetic must not be used for financial decimal calculations. |

## Charge Type Rules

| Rule ID | Rule |
|---|---|
| UOW03-CHARGE-001 | Charge types are configured through a catalog, not hard-coded in invoice code. |
| UOW03-CHARGE-002 | A charge type has category, active status, effective dates, recurrence eligibility, manual-entry eligibility, and automatic-generation eligibility. |
| UOW03-CHARGE-003 | Later units may automatically generate only charge types marked automatic-generation eligible. |
| UOW03-CHARGE-004 | Manual invoice entry may use only charge types marked manual-entry eligible. |
| UOW03-CHARGE-005 | Manual tax-like charge types require manual-entry eligibility and must not be generated automatically from dues. |
| UOW03-CHARGE-006 | Later units that create manual tax-like line items must require a configured manual-entry eligible charge type, description, amount, reason, actor, and audit. UOW-03 defines the configuration and validation rules but does not create invoice lines. |

## Numbering Format Rules

| Rule ID | Rule |
|---|---|
| UOW03-NUMBER-001 | Numbering format rules are configured by document type. |
| UOW03-NUMBER-002 | A numbering format includes prefix or template, sequence scope, padding, reset policy, active status, and effective dates. |
| UOW03-NUMBER-003 | UOW-03 does not allocate actual invoice, receipt, statement, report, or document numbers. |
| UOW03-NUMBER-004 | Later owning units allocate numbers atomically and snapshot the numbering format rule version used. |

## Template Reference Rules

| Rule ID | Rule |
|---|---|
| UOW03-TEMPLATE-001 | UOW-03 stores template metadata only: type, key or reference, version label, active status, and effective dates. |
| UOW03-TEMPLATE-002 | UOW-03 does not render HTML, PDF, email bodies, statements, reports, or documents. |
| UOW03-TEMPLATE-003 | UOW-08 owns rendering, storage, and concrete delivery implementations. |

## Payment Method Rules

| Rule ID | Rule |
|---|---|
| UOW03-PAYMETHOD-001 | Payment method definitions include display name, instructions, reference requirements, sort order, active status, and effective dates. |
| UOW03-PAYMETHOD-002 | UOW-05 consumes active payment method definitions when accepting and posting payments. |
| UOW03-PAYMETHOD-003 | UOW-03 does not create payment, proof, allocation, credit, receipt, or reversal records. |

## Frontend Rules

| Rule ID | Rule |
|---|---|
| UOW03-FE-001 | UOW-03 configuration screens must be protected and server-authorized. |
| UOW03-FE-002 | Financial-impacting drafts must display approval status before activation. |
| UOW03-FE-003 | Effective-version history must be visible to authorized staff. |
| UOW03-FE-004 | Frontend validation is usability only; backend validation remains authoritative. |
| UOW03-FE-005 | UI must not imply that UOW-03 creates invoices, payments, penalties, reports, documents, emails, jobs, or imports. |

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Authorization, Treasurer approval, audit, immutable history, and no downstream side effects are explicit business rules. |
| Property-Based Testing | Compliant | Rules expose testable invariants for effective dates, rate resolution, due/grace dates, rounding, manual charges, and version immutability. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
