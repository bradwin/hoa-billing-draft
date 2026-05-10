# UOW-02 Domain Entities

## Entity Overview

UOW-02 entities are technology-agnostic domain contracts for homeowner, property, ownership, billing-account reference, contact change, billable validation, and read model behavior.

## Homeowner

| Field | Description |
|---|---|
| `id` | Stable system identifier |
| `homeownerCode` | Permanent system-generated homeowner code |
| `legalName` | Staff-managed legal or billing display name |
| `normalizedNameKey` | Normalized name used for duplicate candidate checks |
| `status` | `Active`, `Inactive`, `Deceased`, or `Archived` |
| `contact` | Current approved communication fields |
| `mailingAddress` | Current approved mailing address |
| `communicationPreference` | Preferred communication channel |
| `notes` | Staff notes, role-restricted |
| `portalAccountRef` | Optional reference to UOW-01 user account |
| `createdAt` | Creation timestamp |
| `updatedAt` | Last update timestamp |

### Rules

- `homeownerCode` is unique and permanent.
- Homeowner lifecycle status is not portal account status.
- Linked homeowner records are not physically deleted by application behavior.
- Duplicate candidate detection uses contact, name, and property-link context but does not replace the permanent homeowner code.

## HomeownerStatus

Allowed lifecycle values:

- `Active`
- `Inactive`
- `Deceased`
- `Archived`

Optional lifecycle values such as Blacklisted or Suspended are out of scope for UOW-02. Portal account status remains separate.

## PortalAccountStatusView

| Field | Description |
|---|---|
| `homeownerId` | Linked homeowner identifier |
| `userId` | UOW-01 user identifier |
| `status` | `NotInvited`, `PendingActivation`, `Active`, `Suspended`, `Locked`, or `Disabled` |
| `lastSyncedAt` | Timestamp of the read model refresh or query |

### Rules

- UOW-02 may expose portal account status for display and search.
- Portal status does not determine homeowner lifecycle status.
- UOW-01 remains the owner of user authentication and account state.

## HomeownerContact

| Field | Description |
|---|---|
| `primaryEmail` | Approved email contact |
| `primaryPhone` | Approved mobile or phone number |
| `alternatePhone` | Optional alternate number |
| `mailingAddress` | Approved mailing address |
| `communicationPreference` | Email, phone, mail, portal, or configured preference |
| `emergencyContactName` | Optional emergency or secondary contact |
| `emergencyContactPhone` | Optional emergency or secondary phone |

### Rules

- Contact fields can be updated by approved contact change requests.
- Contact data is PII and must be role-filtered in read models.

## HomeownerDuplicateCandidate

| Field | Description |
|---|---|
| `candidateHomeownerId` | Existing homeowner that may match the submitted record |
| `matchSignals` | Matched normalized email, mobile, name, or property context |
| `confidence` | Domain-level match strength such as exact, strong, or weak |
| `reviewRequired` | Whether staff review is required before creation proceeds |

### Rules

- Duplicate candidates are advisory for identity resolution but blocking for unattended creation.
- Staff confirmation of a distinct record is audited.

## Property

| Field | Description |
|---|---|
| `id` | Stable system identifier |
| `propertyCode` | Permanent HOA-generated property code |
| `phaseOrSection` | Canonical phase or section |
| `block` | Canonical block |
| `lot` | Canonical lot |
| `street` | Canonical street |
| `houseNumber` | Display and search field |
| `canonicalIdentityKey` | Normalized phase, block, lot, and street key |
| `lotAreaSqm` | Decimal square meter lot area, up to four fractional digits |
| `propertyType` | HOA-defined property type |
| `occupancyStatus` | Occupancy state for staff and reporting |
| `billingStatus` | Billing eligibility category |
| `lifecycleStatus` | `Active` or `Archived` |
| `notes` | Staff notes |
| `createdAt` | Creation timestamp |
| `updatedAt` | Last update timestamp |

### Rules

- `propertyCode` is unique and permanent.
- `canonicalIdentityKey` is unique.
- Billable properties require `lotAreaSqm` greater than zero.

## PropertyAlias

| Field | Description |
|---|---|
| `id` | Stable alias identifier |
| `propertyId` | Canonical property reference |
| `aliasType` | Old lot number, renamed street, map reference, tax declaration reference, merged-lot note, or configured type |
| `aliasValue` | Alias text |
| `normalizedAliasKey` | Normalized searchable alias key |
| `createdAt` | Creation timestamp |

### Rules

- Aliases do not create billable property records.
- Alias changes are audited when they affect search or duplicate review.

## PropertyBillingStatus

Allowed values:

- `Billable`
- `NonBillable`
- `Exempt`
- `CommonArea`

Archived is modeled as property lifecycle state, not billing status.

## OwnershipPeriod

| Field | Description |
|---|---|
| `id` | Stable ownership period identifier |
| `propertyId` | Property reference |
| `homeownerId` | Homeowner reference |
| `role` | `PrimaryOwner`, `SecondaryOwner`, or `AuthorizedRepresentative` |
| `effectiveFrom` | Start date |
| `effectiveTo` | Optional exclusive end date; `null` means open-ended |
| `isBillingResponsible` | Whether this period is responsible for billing |
| `createdBy` | Actor who created the period |
| `createdAt` | Creation timestamp |
| `closedAt` | Timestamp when period was closed, if any |

### Rules

- Primary ownership periods for the same property cannot overlap.
- A billable property must have exactly one effective primary ownership period for the `validationDate` being checked.
- Secondary owners or authorized representatives do not satisfy primary billing responsibility unless promoted through staff-managed workflow.

## BillingAccountPeriod

| Field | Description |
|---|---|
| `id` | Stable billing account identifier for the responsibility period |
| `propertyId` | Property reference |
| `homeownerId` | Responsible homeowner reference |
| `ownershipPeriodId` | Owning period reference |
| `effectiveFrom` | Responsibility start date |
| `effectiveTo` | Optional exclusive responsibility end date; `null` means open-ended |
| `status` | `Active` or `Closed` |
| `createdAt` | Creation timestamp |
| `closedAt` | Timestamp when account period was closed, if any |

### Rules

- A billing account period belongs to one property and one responsible homeowner.
- Ownership transfer creates a new billing account period and does not mutate historical financial records.
- Later invoices, payments, receipts, penalties, credits, and statements reference the billing account period under which they are created.

## ContactChangeRequest

| Field | Description |
|---|---|
| `id` | Stable request identifier |
| `homeownerId` | Homeowner profile being changed |
| `requesterUserId` | Homeowner user who submitted the request |
| `status` | `Pending`, `Approved`, or `Rejected` |
| `requestedChanges` | Contact field changes only |
| `oldValues` | Safe snapshot of existing contact values |
| `newValues` | Requested contact values |
| `remarks` | Optional requester or decision remarks |
| `decisionUserId` | System Administrator or Billing Staff decision actor |
| `submittedAt` | Request timestamp |
| `decidedAt` | Decision timestamp |
| `correlationId` | Request correlation identifier |

### Rules

- Only `Pending` requests can be approved or rejected.
- Approval updates homeowner contact fields.
- Rejection does not change homeowner contact fields.
- Legal, ownership, lifecycle, billing responsibility, and financial changes are invalid request content.

## BillablePropertyValidation

| Field | Description |
|---|---|
| `propertyId` | Property being validated |
| `validationDate` | Date supplied by the consuming billing unit for ownership and responsibility checks |
| `isValid` | Whether all prerequisites pass |
| `reasonCodes` | Failed prerequisite codes |
| `primaryHomeownerId` | Responsible homeowner if exactly one exists |
| `billingAccountId` | Effective billing account period if valid |
| `lotAreaSqm` | Validated lot area |

### Reason Codes

- `PROPERTY_NOT_BILLABLE`
- `PROPERTY_ARCHIVED`
- `LOT_AREA_MISSING`
- `LOT_AREA_ZERO_OR_NEGATIVE`
- `PRIMARY_OWNER_MISSING`
- `PRIMARY_OWNER_MULTIPLE`
- `PRIMARY_OWNER_ARCHIVED`
- `BILLING_ACCOUNT_PERIOD_MISSING`
- `HOMEOWNER_NOT_ACTIVE`

## Read Models

| Read Model | Purpose |
|---|---|
| `HomeownerSummary` | Staff and report summary with role-filtered PII. |
| `PropertySummary` | Staff and report property summary with canonical and alias search support. |
| `OwnershipTimeline` | Effective-dated ownership and billing responsibility history. |
| `BillingAccountReference` | Stable reference for later financial units. |
| `BillablePropertyValidationResult` | Fail-closed validation consumed by billing and reports. |
| `OwnerVisibilityView` | Authorized homeowner/property/account links for object authorization and portal views. |

## Domain Generators Required Later

| Generator | Purpose |
|---|---|
| `homeownerIdentityGenerator` | Generate legal names, normalized names, emails, mobile numbers, and duplicate candidate combinations. |
| `propertyIdentityGenerator` | Generate canonical phase, block, lot, street, house number, property code, and alias variants. |
| `ownershipPeriodGenerator` | Generate non-overlapping, overlapping, open-ended, and boundary date ownership periods. |
| `billablePropertyGenerator` | Generate valid and invalid combinations of billing status, lifecycle, lot area, owner count, and billing account state. |
| `contactChangeStateGenerator` | Generate valid and invalid request states and decision sequences. |

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | PII entities are identified, authorization-scoped read models are explicit, and critical entity changes require audit. |
| Property-Based Testing | Compliant | Domain entities identify generators needed to test UOW-02 invariants during Code Generation. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
