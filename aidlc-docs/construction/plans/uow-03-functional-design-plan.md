# UOW-03 Functional Design Plan

## Unit

- **Unit ID**: UOW-03
- **Unit Name**: Billing Configuration and Charge Rules
- **Stage**: Functional Design, Planning
- **Current Gate**: Waiting for answers in this file

## Purpose

Define the business logic, domain model, rules, validation behavior, and frontend design for billing configuration and charge rules before NFR Requirements, NFR Design, Infrastructure Design, and Code Generation. UOW-03 is financially sensitive because later invoice, payment, penalty, statement, report, document, notification, and portal units consume these rules.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/inception/application-design/unit-of-work.md` | UOW-03 purpose, responsibilities, out-of-scope boundaries, and construction notes. |
| `aidlc-docs/inception/application-design/unit-of-work-story-map.md` | UOW-03 owns US-008, US-009, and US-010. |
| `aidlc-docs/inception/requirements/requirements.md` | Billing configuration, tax-like charge, decimal, rounding, and invoice snapshot requirements. |
| `aidlc-docs/inception/application-design/component-dependency.md` | Billing Configuration is consumed by Invoice, Receipt, Penalty, Notification, SOA, and Reporting components. |
| `aidlc-docs/construction/uow-01-platform-foundation/` | UOW-01 audit, approval, settings, authorization, and shared kernel foundations. |
| `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/` | UOW-02 billable property facts consumed later by invoice generation. |

## Functional Design Scope

### In Scope

- Dues rate per square meter configuration with effective dates.
- Billing cycle and billing period rule definitions.
- Due date rules and grace period rules.
- Charge type catalog and manual charge validation.
- Manual tax-like charge configuration as explicit manual line items only.
- Rounding rules, decimal precision, and configuration resolution.
- Numbering format definitions for later invoice and receipt units.
- Template reference configuration for later document/notification units.
- Payment method configuration for later payment units.
- Audit and approval rules for financial-impacting configuration changes.
- Read models and frontend components for staff configuration management.
- PBT candidates for rate resolution, due dates, rounding, and effective-date behavior.

### Out of Scope

- Creating invoice source records; UOW-04 owns invoice creation.
- Calculating actual invoice line amounts for a property; UOW-04 consumes UOW-03 rules and UOW-02 facts.
- Posting payments, allocations, credits, receipts, and reversals; UOW-05 owns these.
- Applying penalties, waivers, delinquency classifications, or reminders; UOW-06 owns these.
- Generating statements, reports, dashboards, exports, documents, emails, or support jobs.
- Automatic tax calculation. Manual tax-like charges remain explicit manual line items only.

## Functional Design Checklist

- [x] Read UOW-03 unit definition.
- [x] Read UOW-03 assigned stories.
- [x] Read Functional Design rule details.
- [x] Confirm Security Baseline and Property-Based Testing extensions remain enabled.
- [x] Identify UOW-03 business logic risks and integration boundaries.
- [x] Create this Functional Design plan with targeted questions.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory.
- [x] Generate `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/functional-design/business-logic-model.md`.
- [x] Generate `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/functional-design/business-rules.md`.
- [x] Generate `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/functional-design/domain-entities.md`.
- [x] Generate `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/functional-design/frontend-components.md`.
- [x] Verify Security Baseline compliance summary.
- [x] Verify Property-Based Testing compliance summary and PBT candidate properties.
- [x] Verify content validation before artifact creation.
- [x] Present the standardized Functional Design completion message.

## Required Functional Design Artifacts

After this plan is answered and validated, generate:

- `business-logic-model.md`
- `business-rules.md`
- `domain-entities.md`
- `frontend-components.md`

## Functional Design Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

### Question 1
How should rate-per-sqm rules be resolved for invoice generation?

A) Resolve the active dues rate by billing period start date using effective-dated, non-overlapping rate versions; later configuration changes never mutate prior invoice snapshots (recommended)
B) Resolve the active dues rate by invoice creation date
C) Resolve the active dues rate by invoice due date
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
How should financial-impacting configuration changes become active?

A) Staff may draft changes, but activation of rate, due date, grace, rounding, charge type, penalty, numbering, and payment method rules requires Treasurer approval and audit (recommended)
B) Billing Staff can directly activate all billing configuration changes with audit only
C) System Administrator can directly activate all billing configuration changes without approval
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
How should billing cycles be modeled?

A) Support predefined monthly, quarterly, semi-annual, and annual cycles plus custom cycles with explicit period start/end generation rules (recommended)
B) Support monthly cycles only for MVP
C) Support arbitrary free-form periods without named cycle rules
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
Which date should due date rules use as their base?

A) Allow due date rules to specify base date as billing period start, billing period end, or invoice issue date, with an integer day offset and explicit weekend/holiday behavior deferred until configured (recommended)
B) Always use billing period start date plus a fixed number of days
C) Always use invoice issue date plus a fixed number of days
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
How should grace periods be defined?

A) Grace periods are integer days after due date and are consumed by UOW-06 penalty eligibility; UOW-03 only resolves and audits the rule (recommended)
B) Grace periods directly change due dates
C) Grace periods are out of scope for MVP
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
How should rounding be defined?

A) Decimal arithmetic uses half-up rounding to centavos, with rule metadata indicating whether UOW-04 rounds each line then totals lines or rounds only the invoice total; default is line-level rounding (recommended)
B) Use JavaScript floating point and round at display time
C) Defer rounding behavior to UOW-04 without storing a rule
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
What precision should lot area and rate configuration support?

A) Lot area supports up to 4 decimal places, rate per sqm supports up to 4 decimal places, and monetary outputs round to 2 decimal places (recommended)
B) Lot area and rate support 2 decimal places only
C) Store all numeric values as free-form text until invoice generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
How should charge types be modeled?

A) Maintain a configured charge type catalog with category, recurrence eligibility, manual-entry eligibility, active status, effective dates, and whether the charge can be generated automatically by later units (recommended)
B) Use hard-coded charge type strings in invoice code
C) Allow free-form charge type text on every invoice line
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
How should manual tax-like charges be handled?

A) Permit only explicit manual tax-like line items with configured charge type, description, amount, reason, and audit; no automatic tax computation exists in UOW-03 (recommended)
B) Automatically compute tax-like charges from dues
C) Exclude tax-like charges entirely from MVP
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
How should numbering formats be defined?

A) Store numbering format rules by document type with prefix/template, sequence scope, padding, reset policy, and effective dates; later units allocate actual numbers atomically (recommended)
B) Store one global text prefix only
C) Let each later unit define numbering independently
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 11
How should template references be configured?

A) Store template reference metadata only, with type, version, active status, and effective dates; UOW-08 owns rendering and storage implementation (recommended)
B) Store full rendered HTML/PDF templates and render them in UOW-03
C) Exclude template references from UOW-03
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 12
How should payment methods be configured?

A) Store active payment method definitions with display name, instructions, reference requirements, sort order, and active/effective status; UOW-05 consumes them when posting payments (recommended)
B) Hard-code payment methods in the payment unit
C) Allow free-form payment method text on each payment
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 13
How should configuration history work?

A) Every activated configuration version is immutable; correction requires a new version with its own effective date, approval reference where required, and audit trail (recommended)
B) Staff may edit active historical versions in place
C) Keep only the current configuration values
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 14
What should UOW-03 expose to later units?

A) Pure resolution services/read models that return the applicable config snapshot for a billing period start date or document/payment context; no invoice, payment, penalty, report, document, email, or job side effects (recommended)
B) UOW-03 should create draft invoice lines directly
C) Later units should read raw configuration tables directly
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 15
Which frontend surfaces should UOW-03 include?

A) Staff billing configuration pages for rates, cycles, due/grace rules, charge types, rounding, numbering formats, template references, payment methods, approval status, and effective-version history (recommended)
B) A single JSON editor for all billing configuration
C) No frontend; configure through database rows only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Post-Answer Processing

After all `[Answer]:` tags are complete:

- Answers will be checked for blanks, invalid choices, contradictions, and vague wording.
- Follow-up questions will be added if any answer is ambiguous.
- If answers are clear, Functional Design artifacts will be generated directly from this plan and approved source context.

## Answer Validation Summary

Validated at `2026-05-09T13:29:33Z`.

- Completion: all 15 `[Answer]:` tags are populated.
- Validity: all answers use valid option A choices.
- Ambiguity: none detected.
- Contradictions: none detected.
- Financial ambiguity: no unresolved financial ambiguity remains for Functional Design. Later Code Generation must still preserve these decisions precisely.
- Security Baseline: compliant at Functional Design level.
- Property-Based Testing: compliant; PBT candidates are identified for rate resolution, effective-date overlap, due date calculation, grace period behavior, rounding, manual charge validation, numbering formats, and immutable version history.
- Result: Functional Design artifacts generated.

## Generated Artifacts

- `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/functional-design/business-logic-model.md`
- `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/functional-design/business-rules.md`
- `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/functional-design/domain-entities.md`
- `aidlc-docs/construction/uow-03-billing-configuration-charge-rules/functional-design/frontend-components.md`

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant for planning | Questions include approval, audit, immutable history, authorization-sensitive configuration activation, and no side-effecting downstream financial behavior. |
| Property-Based Testing | Compliant for planning | Questions cover rate resolution, effective-date overlap, due date calculation, rounding, manual charge validation, and immutable versions as later PBT candidates. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
