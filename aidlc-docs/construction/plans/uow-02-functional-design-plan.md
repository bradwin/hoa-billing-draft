# UOW-02 Functional Design Plan

## Unit

- **Unit ID**: UOW-02
- **Unit Name**: Homeowner, Property, Ownership, and Contact Requests
- **Stage**: Functional Design, Awaiting Approval
- **Current Gate**: Waiting for explicit approval before UOW-02 Functional Design is marked complete

## Purpose

Design UOW-02 business logic before implementation. This unit owns homeowner master records, property master records, billing-account identity, ownership history, billable-property validation, contact change requests, object authorization rules, and read models consumed by later billing, payment, reporting, import, and portal units.

Financial ambiguity is blocked here: later invoice and payment units depend on UOW-02 property and ownership records. A billable property with unclear ownership, duplicate identity, or invalid lot area can create incorrect invoices and balances.

## Source Context

| Source | Relevance |
|---|---|
| `aidlc-docs/inception/application-design/unit-of-work.md` | Defines UOW-02 scope, responsibilities, and out-of-scope financial behavior. |
| `aidlc-docs/inception/application-design/unit-of-work-story-map.md` | Maps US-004 through US-007 to UOW-02. |
| `aidlc-docs/inception/application-design/unit-of-work-dependency.md` | Establishes UOW-02 as prerequisite for invoices, payments, reports, imports, and portal. |
| `aidlc-docs/inception/application-design/components.md` | Defines C-04 Homeowner and Property component. |
| `aidlc-docs/inception/application-design/component-methods.md` | Defines high-level C-04 method contracts. |
| `aidlc-docs/inception/requirements/requirements.md` | Defines homeowner, property, ownership, authorization, and PBT requirements. |
| UOW-01 generated foundation | Provides auth, actor context, permissions, audit, approvals, settings shell, support intents, and shared kernel. |

## Planning Checklist

- [x] Read UOW-02 unit definition.
- [x] Read UOW-02 story map and dependencies.
- [x] Read application component and method context for C-04.
- [x] Read Functional Design rule details.
- [x] Read enabled Security Baseline rules.
- [x] Read enabled Property-Based Testing rules.
- [x] Identify UOW-02 business logic ambiguity.
- [x] Create this Functional Design plan with answer tags.
- [x] Receive complete answers for all questions.
- [x] Validate answers for blanks, invalid choices, contradictions, and unsafe financial assumptions.
- [x] Create clarification questions if any answer is ambiguous or contradictory.
- [x] Generate UOW-02 Functional Design artifacts after all ambiguity is resolved.
- [x] Present standardized Functional Design completion message.

## Story Traceability

| Story | Functional Design Coverage Required |
|---|---|
| US-004 Manage homeowner records | Homeowner identity, profile fields, statuses, search, deactivation without deletion, audit, and PII access rules. |
| US-005 Manage property records and uniqueness | Property identity, normalized duplicate checks, lot area, billing status, occupancy status, current owner reference, and billable validation. |
| US-006 Preserve ownership history | Ownership effective dates, one active primary homeowner per billable property, historical traceability, transfer rules, and future report visibility. |
| US-007 Approve homeowner contact change requests | Submitted changes, pending state, approval/rejection decisions, master-data update timing, audit, and portal visibility. |

## Unit Boundaries

| Area | Decision |
|---|---|
| Owns | Homeowners, properties, ownership history, billing-account identity, property billable validation, contact change requests, read models. |
| Consumes | UOW-01 actor context, authorization helpers, audit, approval primitives where selected, safe errors, validation patterns. |
| Provides | Homeowner/property/billing-account references to UOW-04, UOW-05, UOW-07, and UOW-08. |
| Must not implement | Invoice generation, dues calculation, payment posting, credits, penalties, SOAs, reports, imports, document storage, email delivery. |
| Financial boundary | UOW-02 creates master data and billability facts only; it must not create financial source records or balances. |

## Questions

Please answer every question by filling the letter after each `[Answer]:` tag. If none of the options match, choose the final `Other` option and describe the intended behavior after the tag.

## Question 1
What identity rule should prevent duplicate homeowner master records?

A) Use normalized primary email as the only unique homeowner identity.
B) Use normalized primary email plus mobile number when present; allow missing email only for non-portal homeowners.
C) Use a manually assigned homeowner code as the only unique identity; email and mobile are non-unique contact fields.
D) Use a duplicate-warning model only; staff may create duplicates after confirmation.
E) Other (please describe after [Answer]: tag below)

[Answer]: E. Each homeowner master record shall have one permanent system-generated Homeowner ID/Homeowner Code as the unique record identifier. The system shall also check for possible duplicate homeowners using normalized email, mobile number, full name, and linked property ownership details.

## Question 2
What homeowner status model should UOW-02 use?

A) `Active`, `Inactive`, `Deceased`, and `Archived`; records are never physically deleted.
B) `Active` and `Inactive` only; all other life-cycle states are notes.
C) `Active`, `PendingPortalActivation`, `Suspended`, and `Deleted`; deleted records are hidden from normal queries.
D) Status is not tracked in UOW-02 and is derived only from user-account status.
E) Other (please describe after [Answer]: tag below)

[Answer]: E. Track homeowner master-record lifecycle separately from portal/user-account status, using Active, Inactive, Deceased, Archived, and optionally Blacklisted/Suspended only if your HOA has a formal governance use case for it.
For UOW-02 Homeowner Management, I recommend this status model:
HomeownerStatus:
- Active
- Inactive
- Deceased
- Archived

And separately:
PortalAccountStatus:
- NotInvited
- PendingActivation
- Active
- Suspended
- Locked
- Disabled

This is better than tying homeowner status to login status because a homeowner master record represents a billing/legal/account relationship, while a portal account represents system access.

Recommended business rule: BR-017: Homeowner Status Rule

The system shall track homeowner master-record status independently from portal account status. Homeowner records shall never be physically deleted once linked to property ownership, invoices, payments, receipts, statements, or audit logs. Inactive, deceased, or archived homeowners shall be excluded from new billing unless they are linked to an active billable property ownership record.

## Question 3
Which homeowner fields can be changed through homeowner-submitted contact change requests?

A) Contact fields only: email, phone, mailing address, communication preference, and emergency/secondary contact details.
B) Contact fields plus legal display name, provided staff approval is recorded.
C) Any homeowner profile field except ownership and status.
D) All homeowner profile fields, including status and ownership, can be requested through the same workflow.
E) Other (please describe after [Answer]: tag below)

[Answer]: A
BR-018: Homeowner Contact Change Request Rule

The system shall allow homeowners to submit contact change requests only for communication-related fields, including email, phone number, mailing address, communication preference, and emergency or secondary contact details. Changes to legal name, ownership, membership status, billing responsibility, or homeowner lifecycle status shall require a separate staff-managed amendment or ownership-transfer process with supporting documentation and audit approval.

## Question 4
Who may decide homeowner contact change requests?

A) System Administrator and Billing Staff may approve or reject; decision is audited and does not require Treasurer approval.
B) System Administrator only may approve or reject.
C) Treasurer approval is required for all contact changes through UOW-01 Approval Workflow.
D) Contact changes are auto-approved if the homeowner is authenticated.
E) Other (please describe after [Answer]: tag below)

[Answer]: A — System Administrator and Billing Staff may approve or reject; decision is audited and does not require Treasurer approval.
BR-019: Contact Change Request Approval Rule

The system shall allow System Administrators and Billing Staff to approve or reject homeowner-submitted contact change requests. The Treasurer’s approval shall not be required for contact-only changes. Each approval or rejection must record the requester, approver, request date, decision date, old value, new value, decision status, and remarks. Legal name, ownership, billing responsibility, and homeowner lifecycle status changes must use a separate staff-managed amendment workflow.

## Question 5
What property uniqueness rule should UOW-02 enforce?

A) Normalized tuple of phase or section, block, lot, and street must be unique.
B) Block and lot must be unique across the entire HOA; phase and street are descriptive only.
C) House number and street must be unique; block, lot, and phase are descriptive only.
D) Duplicate checks are warnings only because historical subdivision data may be inconsistent.
E) Other (please describe after [Answer]: tag below)

[Answer]: A. I would also add an internal unique property code:
PropertyCode = HOA-generated permanent unique identifier
Example: PH1-BLK03-LOT012

## Question 6
How should UOW-02 handle ambiguous lot identifiers such as sub-lots, merged lots, or renamed streets?

A) Model canonical property identity plus alternate references/aliases; uniqueness applies to canonical normalized fields.
B) Store one free-text legal description only; staff manually prevents duplicates.
C) Create separate property records for every alias and link them later during reporting.
D) Defer aliases and merged-lot handling to import workflows in UOW-08.
E) Other (please describe after [Answer]: tag below)

[Answer]: A — Model canonical property identity plus alternate references/aliases; uniqueness applies to canonical normalized fields.
Suggested business rule: BR-021: Property Alias and Ambiguous Lot Identifier Rule

The system shall maintain a canonical property identity for each billable property. Canonical uniqueness shall be enforced using normalized phase or section, block, lot, and street fields. For ambiguous identifiers such as sub-lots, merged lots, renamed streets, old lot numbers, map references, or tax declaration references, the system shall store alternate references as aliases linked to the canonical property record. Aliases shall be searchable but shall not create separate billable property records unless the HOA formally recognizes them as separate billable properties.

## Question 7
What billable-property prerequisites must pass before later invoice generation may include a property?

A) Billing status is billable, lot area is greater than zero, property has exactly one active primary homeowner, and property is not archived.
B) Lot area greater than zero is sufficient; ownership can be missing and resolved later.
C) Active primary homeowner is sufficient; lot area can be zero if staff overrides during billing.
D) Billability is manually toggled and no other prerequisites are enforced in UOW-02.
E) Other (please describe after [Answer]: tag below)

[Answer]: A.

BR-022: Billable Property Prerequisite Rule

The system shall include a property in invoice generation only if the property is marked Billable, has a lot area greater than zero, has exactly one active primary homeowner for the billing period, is not archived, and has an active billing account. Properties that fail validation shall be excluded from invoice generation and listed in a billing exception report with the reason for exclusion.

## Question 8
What lot area unit and precision should UOW-02 use?

A) Square meters, decimal string with up to 4 fractional digits, strictly greater than zero for billable properties.
B) Square meters, integer only, strictly greater than zero for billable properties.
C) Any unit entered by staff; billing configuration later decides conversion.
D) Lot area is informational only and not validated by UOW-02.
E) Other (please describe after [Answer]: tag below)

[Answer]: A

BR-023: Lot Area Unit and Precision Rule

The system shall store lot area in square meters using a decimal value with up to four fractional digits. Lot area is required and must be greater than zero for properties marked as Billable. Non-billable, exempt, common-area, or archived properties may have a missing or zero lot area, subject to staff review. The system shall use the stored lot area when calculating association dues using the formula: Association Due = Lot Area × Rate per sqm.

## Question 9
How should billing-account identity be modeled?

A) One billing account per property; homeowner ownership changes attach the property account to the active owner over time.
B) One billing account per homeowner; all current properties roll into one account.
C) One billing account per homeowner-property ownership period.
D) Billing-account identity is deferred until invoice/payment units.
E) Other (please describe after [Answer]: tag below)

[Answer]: C

BR-024: Billing Account Identity Rule

The system shall create one billing account for each homeowner-property ownership or billing responsibility period. A billing account shall be linked to one property, one responsible homeowner, and an effective date range. When ownership or billing responsibility changes, the system shall close the previous billing account and create a new billing account for the new responsible homeowner. Historical invoices, payments, receipts, penalties, credits, and statements shall remain linked to the billing account under which they were created.

## Question 10
What ownership-history rule should UOW-02 enforce?

A) A property may have many historical ownership periods, but at most one active primary owner at any time; periods cannot overlap for primary ownership.
B) A property may have many active primary owners, and billing chooses one during invoice generation.
C) Ownership history is append-only notes; current owner is a mutable field without effective-date validation.
D) Ownership changes are not in UOW-02 and are deferred to imports.
E) Other (please describe after [Answer]: tag below)

[Answer]: A.

BR-025: Ownership History Rule

The system shall maintain effective-dated ownership history for each property. A property may have many historical ownership periods, but it shall have at most one active primary homeowner for any given date range. Primary ownership periods for the same property must not overlap. When ownership changes, the previous ownership period must be closed before or at the time a new primary ownership period becomes active.

## Question 11
How should ownership transfers affect financial responsibility boundaries?

A) UOW-02 records transfer effective dates only; later invoice/payment units decide responsibility by source-record dates and do not mutate past financial records.
B) UOW-02 updates all unpaid invoices to the new owner when ownership changes.
C) UOW-02 moves all historical balances to the new owner automatically.
D) Ownership transfer behavior is deferred and no effective date is required.
E) Other (please describe after [Answer]: tag below)

[Answer]: A

BR-026: Ownership Transfer Financial Boundary Rule

When property ownership or billing responsibility changes, the system shall close the previous ownership period and create a new ownership period using the transfer effective date. Historical financial records shall remain linked to the billing account, homeowner, and ownership period under which they were originally created. Later billing, invoice, payment, and statement modules shall determine financial responsibility using invoice dates, billing periods, payment dates, and ownership effective dates. UOW-02 shall not automatically transfer unpaid invoices or historical balances to the new owner.

## Question 12
What access model should apply to homeowner and property records?

A) Staff roles manage records; Board Members have read-only access; Homeowners can read only their own linked records; all access is server-authorized.
B) Staff and Board Members manage records; Homeowners can read all records.
C) All authenticated users can search homeowner/property records; UI hides restricted fields.
D) Homeowner and property records are public within the HOA portal.
E) Other (please describe after [Answer]: tag below)

[Answer]: A.

BR-027: Homeowner and Property Record Access Rule

The system shall enforce role-based and ownership-based access to homeowner and property records. Authorized staff roles may create, update, and manage records. Board Members may view records and reports but shall not modify master data or financial records unless separately granted permission. Homeowners may view only records linked to their own homeowner profile, property ownership, billing accounts, invoices, payments, receipts, and statements. UI-level hiding is not sufficient; all access must be validated by server-side authorization.

## Question 13
What search behavior should UOW-02 design for staff?

A) Search by name, email, mobile, property identifiers, status, and billing status with pagination and role-restricted PII fields.
B) Search by homeowner name only.
C) Search by property identifier only.
D) No search in UOW-02; search is deferred to reports.
E) Other (please describe after [Answer]: tag below)

[Answer]: A.

BR-028: Staff Homeowner and Property Search Rule

The system shall allow authorized staff users to search homeowner and property records by homeowner name, homeowner code, email, mobile number, property code, phase or section, block, lot, street, house number, homeowner status, property status, and billing status. Search results shall be paginated and sorted by relevance or configured default order. Personally identifiable information shall be displayed only to roles authorized to view it. All search requests must be server-authorized.

## Question 14
What read models should UOW-02 provide to later units?

A) Homeowner summary, property summary, ownership timeline, billing-account reference, billable-property validation result, and owner visibility view.
B) Only raw homeowner and property records; later units build their own read models.
C) Only billing-account references; reports and portal query UOW-02 tables directly.
D) Read models are deferred until UOW-07 reporting.
E) Other (please describe after [Answer]: tag below)

[Answer]: A.

BR-029: UOW-02 Read Model Rule

UOW-02 shall provide read models for homeowner summary, property summary, ownership timeline, billing-account reference, billable-property validation, and owner visibility. Later units shall consume these read models instead of directly interpreting raw homeowner, property, and ownership tables. Read models must enforce server-side authorization and return only fields appropriate to the requesting role.

## Question 15
Which UOW-02 behaviors must be treated as property-based testing candidates in Functional Design?

A) Property uniqueness normalization, non-overlapping primary ownership periods, billable-property validation, and contact-change state transitions.
B) Property uniqueness normalization only.
C) Contact-change workflow only.
D) No PBT candidates in UOW-02.
E) Other (please describe after [Answer]: tag below)

[Answer]: A.

BR-030: UOW-02 Property-Based Testing Rule

The Functional Design for UOW-02 shall include property-based testing candidates for property uniqueness normalization, non-overlapping primary ownership periods, billable-property validation, and contact-change request state transitions. These tests shall verify invariant business rules across generated combinations of valid, invalid, duplicate, incomplete, overlapping, and boundary-value inputs.

## Planned Functional Design Artifacts

After all answers are complete and validated, generate:

- `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/functional-design/business-logic-model.md`
- `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/functional-design/business-rules.md`
- `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/functional-design/domain-entities.md`
- `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/functional-design/frontend-components.md`

## Answer Validation Result

| Check | Result |
|---|---|
| Complete answers | Passed. All 15 questions have `[Answer]:` values. |
| Valid option choices | Passed. Every answer selects a listed option, with valid custom detail where option E was used. |
| Contradictions | Passed with design constraint. The concrete four-value `HomeownerStatus` model is authoritative for UOW-02. Optional extra values such as Blacklisted or Suspended are out of scope unless approved in a later change. Portal account status remains separate and is not used as homeowner lifecycle status. |
| Financial ambiguity | Passed with explicit defaults. Billing-account identity is one account per homeowner-property responsibility period, ownership transfers do not mutate historical financial records, and invalid billable-property prerequisites fail closed for later invoice generation. |
| Clarification required | No. No follow-up question file is required. |

## Generated Artifacts

- `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/functional-design/business-logic-model.md`
- `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/functional-design/business-rules.md`
- `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/functional-design/domain-entities.md`
- `aidlc-docs/construction/uow-02-homeowner-property-ownership-contact/functional-design/frontend-components.md`

## Security Requirements To Carry Into Functional Design

- PII access must be role-restricted and never rely on frontend hiding.
- Homeowners may only access their own linked homeowner/property records.
- Staff search must enforce server-side authorization and field-level PII restrictions.
- Contact change decisions must be audited.
- Ownership changes must be audited and must not rewrite historical financial source records.
- Billable-property validation must fail closed when ownership or lot area data is missing.
- No UOW-02 flow may create invoices, balances, payments, penalties, or adjustments.

## PBT Requirements To Carry Into Functional Design

- Identify UOW-02 testable properties in the generated Functional Design artifacts.
- Document domain-specific generators needed for homeowner identities, property identifiers, ownership periods, contact-change states, and billable-property inputs.
- Include example tests alongside any identified PBT requirements during later code generation.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant for planning | Questions cover PII access, server-side authorization, audit, fail-closed billability, no financial source-record mutation, and safe ownership transfer semantics. |
| Property-Based Testing | Compliant for planning | Question 15 explicitly identifies candidate property classes required by PBT-01 for UOW-02 Functional Design. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
