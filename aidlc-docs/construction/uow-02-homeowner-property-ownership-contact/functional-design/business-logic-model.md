# UOW-02 Business Logic Model

## Unit Scope

UOW-02 owns homeowner master records, property master records, ownership history, billing-account identity, billable-property validation, contact change requests, and read models consumed by later billing, payment, report, import, and portal units.

UOW-02 does not create invoices, balances, payments, penalties, credits, adjustments, statements, reports, documents, emails, or import batches. It supplies validated master data and effective-dated responsibility facts only.

## Decisions Used

| Area | Decision |
|---|---|
| Homeowner identity | Each homeowner has a permanent system-generated homeowner ID/code. Duplicate candidates are detected from normalized email, mobile, full name, and linked property ownership context. |
| Homeowner lifecycle | `HomeownerStatus` is independent from portal account status. UOW-02 uses only `Active`, `Inactive`, `Deceased`, and `Archived`. Extra lifecycle statuses are out of scope unless later approved. |
| Portal status | Portal account status is separate from homeowner lifecycle and is sourced from the access/user model, not used as the master-record status. |
| Contact change scope | Homeowner-submitted contact change requests may change communication fields only. Legal name, ownership, billing responsibility, and lifecycle status require staff-managed workflows. |
| Contact change decision | System Administrator and Billing Staff may approve or reject contact-only requests. Treasurer approval is not required. |
| Property identity | A permanent `PropertyCode` and canonical normalized phase or section, block, lot, and street tuple are unique. |
| Property aliases | Ambiguous lot identifiers are aliases linked to one canonical property. Aliases are searchable and do not create billable records. |
| Billable prerequisites | Later invoice generation may include only properties that pass UOW-02 billable validation. |
| Lot area | Lot area is stored in square meters as a decimal value with up to four fractional digits. Billable properties require lot area greater than zero. |
| Billing account | One billing account period exists for the billing-responsible homeowner for each property and effective period. |
| Ownership history | Primary ownership periods for the same property cannot overlap. At most one primary ownership period is active for any date. |
| Transfer boundary | UOW-02 records transfer effective dates and creates/closes ownership and billing-account periods. It does not mutate historical financial records. |
| Access model | Server-side role and object authorization are authoritative. Frontend hiding is not authorization. |
| Search model | Staff search is authorized, paginated, and PII-filtered by role. |
| Read models | Later units consume UOW-02 read models instead of reinterpreting raw tables. |

## Core Actors

| Actor | UOW-02 Capability |
|---|---|
| System Administrator | Manage homeowner and property records, assign ownership, approve or reject contact changes, view audit-sensitive master data according to role policy. |
| Billing Staff | Manage homeowner and property records, assign ownership, approve or reject contact changes, run billable-property validation, and search operational records. |
| Treasurer | Read homeowner, property, ownership, and billing-account references needed for financial review. No contact-only approval is required. |
| Board Member | Read authorized summaries and reports; cannot mutate master data in UOW-02. |
| Homeowner | Read own linked records and submit own contact change requests. |

## Homeowner Master Data Flow

1. Staff submits homeowner master data.
2. The system validates required fields, length limits, formats, and allowed lifecycle status.
3. The system generates or preserves the permanent homeowner code.
4. The system normalizes email, mobile number, full name, and property-link hints for duplicate detection.
5. If duplicate candidates exist, unattended creation is blocked until staff reviews the candidates and explicitly confirms the intended separate record or links to an existing record.
6. The system persists the homeowner record and audit entry in the same transaction where possible.
7. The system exposes role-filtered homeowner summary and detail read models.

Explicit confirmation that a duplicate candidate is a separate homeowner is audited with the actor, timestamp, reviewed candidate IDs, reason or remarks, and correlation ID.

Homeowner records linked to ownership, billing accounts, invoices, payments, receipts, statements, or audit records are never physically deleted by application behavior.

## Property Master Data Flow

1. Staff submits canonical property fields and optional aliases.
2. The system normalizes phase or section, block, lot, and street to compute the canonical property identity key.
3. The permanent property code is generated on creation and remains stable.
4. Creation is rejected if the property code or canonical identity key already exists.
5. Aliases are normalized and linked to the canonical property.
6. Aliases are searchable but do not create billable property identities.
7. Lot area is validated according to billing status:
   - Billable properties require square meters greater than zero with up to four fractional digits.
   - Non-billable, exempt, common-area, or archived properties may have missing or zero lot area but must remain visible for staff review.
8. The system audits property creation, updates, billing status changes, lot area changes, and alias creation, update, and removal.

## Ownership and Billing Account Flow

1. Staff selects a property, responsible homeowner, ownership role, and effective date range.
2. For primary ownership, the system checks existing primary ownership periods for the same property.
3. If the proposed period overlaps an existing primary period, the command is rejected.
4. Ownership and billing-account periods use half-open date intervals: `effectiveFrom` is inclusive and `effectiveTo` is exclusive. An open-ended period has `effectiveTo = null`.
5. When ownership or billing responsibility changes, the previous primary ownership period and previous billing account period are closed by setting `effectiveTo` to the transfer effective date.
6. A new primary ownership period and billing account period start on that same effective date without overlap because intervals are half-open.
7. The new billing account period is created only for the billing-responsible homeowner for the property and effective period.
8. Secondary owners and authorized representatives do not receive billing account periods unless promoted through a staff-managed billing-responsibility workflow.
9. Historical billing account references remain attached to the responsibility period under which later financial records are created.
10. UOW-02 never moves unpaid invoices, historical balances, payments, receipts, penalties, credits, or statements to a new owner.

Example: old owner `2025-01-01` to `2025-06-01`; new owner `2025-06-01` to `null`. The new owner is responsible starting `2025-06-01`.

The billing account period is the stable reference later financial units use for a homeowner-property responsibility period. Future invoice/payment behavior is decided by source-record dates and effective dates, not by rewriting UOW-02 history.

## Billable-Property Validation Flow

UOW-02 provides a validation result for a property and `validationDate`. Consuming billing units decide which date to pass based on billing rules, including any later-approved proration or transfer-period billing policy. The result is consumed by UOW-04 invoice generation and later reporting.

Validation passes only when all required conditions are true:

- Property billing status is `Billable`.
- Property lifecycle is not `Archived`.
- Lot area in square meters is present and greater than zero.
- Exactly one effective primary ownership period covers the `validationDate`.
- The responsible primary homeowner is eligible for the billing responsibility period, meaning the homeowner has `HomeownerStatus = Active`, or a later approved exception workflow allows another responsible-party model.
- Exactly one effective billing account period covers the `validationDate` or billing responsibility period for the responsible homeowner and property.

UOW-02 does not implement estate, representative, special billing responsibility, proration, or transfer-period billing exception workflows. Those behaviors require later approved scope.

Validation fails closed. A failed validation returns reason codes such as missing lot area, zero lot area, archived property, non-billable status, missing primary owner, multiple primary owners, missing effective billing account period, or invalid owner status. UOW-02 does not create the billing exception report itself; UOW-04 and UOW-07 consume the reason codes for exception output.

## Contact Change Request Flow

1. A homeowner submits a request for communication-related fields only: email, phone, mailing address, communication preference, and emergency or secondary contact details.
2. The backend validates the actor owns the homeowner profile being changed.
3. The request is stored as `Pending` with old values, requested new values, requester, submission timestamp, and correlation ID.
4. System Administrator or Billing Staff reviews the pending request.
5. Approval applies the requested contact changes to the homeowner master record and records the decision audit entry.
6. Approval of a contact email change updates only the UOW-02 approved contact email. It does not mutate UOW-01 login credentials or authentication email unless a separate UOW-01 account-email-change process is invoked and completed.
7. If the requested primary email is used for portal notifications, the system may require verification before it becomes the active notification email.
8. Rejection leaves master data unchanged and records the decision audit entry and remarks.
9. Terminal request states are `Approved` and `Rejected`; terminal requests cannot be decided again.

Requests that attempt to change legal name, ownership, billing responsibility, lifecycle status, or financial records are rejected with safe validation errors.

## Search and Read Model Flow

1. The caller submits search filters and pagination.
2. The backend authenticates the actor and applies role and object authorization.
3. Staff search can use homeowner name, homeowner code, email, mobile, property code, phase or section, block, lot, street, house number, homeowner status, property lifecycle status, and billing status.
4. The query returns only fields the actor may see. PII fields are omitted or masked when the role lacks permission.
5. Homeowners can query only their own linked profile, property, ownership, billing-account, and contact request views.
6. Board Member read-only access is limited to fields required for authorized governance and oversight; sensitive PII may be masked or omitted unless explicitly permitted.
7. Later units consume read models for homeowner summary, property summary, ownership timeline, billing-account reference, billable-property validation, and owner visibility.

## Object Authorization Model

UOW-02 uses the UOW-01 actor context and object authorization contracts.

| Resource | Staff Rule | Board Rule | Homeowner Rule |
|---|---|---|---|
| Homeowner profile | Manage by role permission | Read summary/report fields only; sensitive PII minimized | Own linked profile only |
| Property | Manage by role permission | Read summary/report fields only; sensitive PII minimized | Own linked property only |
| Ownership period | Manage by role permission | Read summary/report fields only; sensitive PII minimized | Own linked periods only |
| Billing account reference | Manage by role permission | Read summary/report fields only; sensitive PII minimized | Own linked billing accounts only |
| Contact change request | Decide by System Administrator or Billing Staff | No decision access | Submit and view own requests only |

Authorization failures deny access, return safe errors, and are audited as security events.

## Testable Properties

| Component | PBT Category | Property |
|---|---|---|
| Property identity normalization | Invariant / Idempotence | Normalizing a canonical property identity twice yields the same key, and semantically equivalent phase, block, lot, and street inputs map to the same duplicate key. |
| Property identity uniqueness | Invariant | No valid command sequence can create two active canonical properties with the same normalized identity key or property code. |
| Ownership periods | Stateful / Invariant | Generated valid transfers preserve non-overlapping primary ownership periods for the same property. Invalid overlapping commands are rejected. |
| Billable validation | Invariant | A property missing any required prerequisite is never marked billable-valid for the tested `validationDate`; a property satisfying all prerequisites is marked valid for that date. |
| Contact change request | Stateful | Generated decision sequences cannot transition a terminal request to another state, and rejected requests do not mutate homeowner master data. |
| Billing account periods | Stateful / Invariant | Ownership or responsibility changes close the prior billing account period and create a new period without altering historical account identifiers. |

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Functional logic requires server-side authorization, object-level access checks, PII filtering, audit entries for critical data changes, safe errors, and fail-closed validation. Infrastructure-specific encryption, network, and monitoring details are deferred to NFR and infrastructure stages. |
| Property-Based Testing | Compliant | PBT-01 is satisfied by explicit property identification for normalization, uniqueness, ownership periods, billability, contact-change state transitions, and billing-account periods. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
