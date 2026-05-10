# UOW-02 Business Rules

## Homeowner Rules

| Rule ID | Rule |
|---|---|
| UOW02-HOMEOWNER-001 | Every homeowner master record has one permanent system-generated homeowner ID/code that is the hard unique identifier. |
| UOW02-HOMEOWNER-002 | Normalized primary email, mobile number, full name, and linked property ownership context are used to find duplicate candidates before create and update. |
| UOW02-HOMEOWNER-003 | Duplicate candidate matches block unattended creation. Staff must review candidates and either use an existing homeowner or explicitly confirm that the new record is distinct. |
| UOW02-HOMEOWNER-004 | Homeowner lifecycle status is independent from portal account status. |
| UOW02-HOMEOWNER-005 | UOW-02 homeowner lifecycle values are `Active`, `Inactive`, `Deceased`, and `Archived`. Optional values such as Blacklisted or Suspended are not part of UOW-02 unless approved later. |
| UOW02-HOMEOWNER-006 | Homeowner records linked to ownership, billing accounts, invoices, payments, receipts, statements, or audit logs are never physically deleted by application behavior. |
| UOW02-HOMEOWNER-007 | `Archived` homeowner records cannot be assigned to new ownership or billing-account periods. Existing contradictory data must fail billable validation until corrected. |
| UOW02-HOMEOWNER-008 | `Inactive` or `Deceased` homeowners may remain visible in historical ownership and account records. Billing eligibility is determined by active billing responsibility and billable validation, not by rewriting historical records. |
| UOW02-HOMEOWNER-009 | Legal name, ownership, billing responsibility, and lifecycle status changes require staff-managed workflows with audit entries, not homeowner contact change requests. |
| UOW02-HOMEOWNER-010 | Staff confirmation that a duplicate candidate is a distinct homeowner must be audited with actor, timestamp, reviewed candidate IDs, reason or remarks, and correlation ID. |

## Contact Change Rules

| Rule ID | Rule |
|---|---|
| UOW02-CONTACT-001 | Homeowner-submitted contact change requests may include only email, phone, mailing address, communication preference, and emergency or secondary contact details. |
| UOW02-CONTACT-002 | Requests containing legal name, ownership, billing responsibility, lifecycle status, or financial changes are rejected. |
| UOW02-CONTACT-003 | A contact change request starts as `Pending`. |
| UOW02-CONTACT-004 | Only System Administrator and Billing Staff may approve or reject contact-only change requests. |
| UOW02-CONTACT-005 | Treasurer approval is not required for contact-only change requests. |
| UOW02-CONTACT-006 | Approval applies the requested contact fields to the homeowner master record. |
| UOW02-CONTACT-007 | Rejection leaves homeowner master data unchanged. |
| UOW02-CONTACT-008 | Approved and rejected requests are terminal and cannot be decided again. |
| UOW02-CONTACT-009 | Every request decision records requester, decision actor, request date, decision date, old values, new values, decision status, remarks, and correlation ID. |
| UOW02-CONTACT-010 | Approval of a homeowner contact email change updates only the UOW-02 approved contact email. It does not change the UOW-01 login email unless a separate UOW-01 account-email-change process is invoked and completed. |
| UOW02-CONTACT-011 | If the requested primary email is used for portal notifications, the system may require verification before it becomes the active notification email. |

## Property Rules

| Rule ID | Rule |
|---|---|
| UOW02-PROPERTY-001 | Every property has one permanent HOA-generated property code. |
| UOW02-PROPERTY-002 | The property code is unique and cannot be reused for another property. |
| UOW02-PROPERTY-003 | Canonical property identity is the normalized tuple of phase or section, block, lot, and street. |
| UOW02-PROPERTY-004 | The canonical property identity key is unique. Attempts to create or update a property to a duplicate canonical key are rejected. |
| UOW02-PROPERTY-005 | House number is searchable and displayable but is not the primary uniqueness key unless later approved. |
| UOW02-PROPERTY-006 | Ambiguous identifiers such as sub-lots, merged lots, renamed streets, old lot numbers, map references, and tax declaration references are stored as aliases linked to one canonical property. |
| UOW02-PROPERTY-007 | Aliases are searchable but cannot create separate billable property records unless the HOA formally recognizes a separate canonical property. |
| UOW02-PROPERTY-008 | Lot area is stored in square meters as a decimal value with up to four fractional digits. |
| UOW02-PROPERTY-009 | Billable properties require lot area greater than zero. |
| UOW02-PROPERTY-010 | Non-billable, exempt, common-area, or archived properties may have missing or zero lot area but must remain visible for staff review. |
| UOW02-PROPERTY-011 | Property billing status changes and lot area changes are audited because they affect later invoice eligibility. |
| UOW02-PROPERTY-012 | Property alias creation, update, and removal are audited because aliases affect search, duplicate review, and property identity interpretation. |

## Ownership and Billing Account Rules

| Rule ID | Rule |
|---|---|
| UOW02-OWNERSHIP-001 | A property may have many historical ownership periods. |
| UOW02-OWNERSHIP-002 | A property may have at most one primary ownership period active for any given date. |
| UOW02-OWNERSHIP-003 | Primary ownership periods for the same property must not overlap. |
| UOW02-OWNERSHIP-004 | Ownership transfer requires an effective date. |
| UOW02-OWNERSHIP-005 | A transfer closes the previous primary ownership period at the effective boundary before a new primary period becomes active. |
| UOW02-OWNERSHIP-006 | One billing account period is created for each homeowner-property billing-responsibility period. |
| UOW02-OWNERSHIP-007 | A billing account period links one property, one responsible homeowner, and one effective date range. |
| UOW02-OWNERSHIP-008 | When ownership or billing responsibility changes, UOW-02 closes the previous billing account period and creates a new billing account period. |
| UOW02-OWNERSHIP-009 | Historical invoices, payments, receipts, penalties, credits, adjustments, statements, and balances remain linked to the billing account under which they were created. |
| UOW02-OWNERSHIP-010 | UOW-02 must not automatically transfer unpaid invoices or historical balances to a new owner. |
| UOW02-OWNERSHIP-011 | Ownership, billing-account period, and transfer changes are audited with old and new effective dates and responsible homeowner references. |
| UOW02-OWNERSHIP-012 | Ownership and billing-account periods use half-open date intervals: `effectiveFrom` is inclusive and `effectiveTo` is exclusive. An open-ended period has `effectiveTo = null`. |
| UOW02-OWNERSHIP-013 | UOW-02 creates a billing account period only for the homeowner who is the billing-responsible party for the property and effective period. Secondary owners and authorized representatives do not receive billing account periods unless promoted through a staff-managed billing-responsibility workflow. |

## Billable Validation Rules

| Rule ID | Rule |
|---|---|
| UOW02-BILLABLE-001 | Billable-property validation fails closed when required data is missing, ambiguous, or contradictory. |
| UOW02-BILLABLE-002 | Validation passes only when property billing status is `Billable`. |
| UOW02-BILLABLE-003 | Validation fails when the property lifecycle is `Archived`. |
| UOW02-BILLABLE-004 | Validation passes only when lot area is present and greater than zero. |
| UOW02-BILLABLE-005 | Validation passes only when exactly one effective primary ownership period covers the `validationDate` supplied by the consuming billing unit. |
| UOW02-BILLABLE-006 | Validation passes only when exactly one effective billing account period covers the `validationDate` or billing responsibility period for the responsible homeowner and property. |
| UOW02-BILLABLE-007 | Validation returns reason codes for every failed prerequisite. |
| UOW02-BILLABLE-008 | UOW-02 provides validation results only. UOW-04 decides draft invoice generation behavior and UOW-07 decides report presentation. |
| UOW02-BILLABLE-009 | Validation passes only when the responsible primary homeowner has `HomeownerStatus = Active`, unless a later approved exception workflow allows estate, representative, or special billing responsibility handling. |
| UOW02-BILLABLE-010 | UOW-02 does not decide proration, transfer-period billing, or which billing-period date controls responsibility. The consuming billing unit supplies the `validationDate` used to evaluate ownership and billing responsibility. |

## Access and Search Rules

| Rule ID | Rule |
|---|---|
| UOW02-ACCESS-001 | All homeowner, property, ownership, billing-account, and contact-change endpoints require server-side authentication and authorization unless explicitly public. |
| UOW02-ACCESS-002 | Object authorization is required for every request that references a homeowner, property, ownership period, billing account, or contact request ID. |
| UOW02-ACCESS-003 | Homeowners may access only records linked to their own homeowner profile, property ownership, billing accounts, invoices, payments, receipts, and statements. |
| UOW02-ACCESS-004 | Board Members have read-only access to authorized summaries and reports and no UOW-02 master-data mutation permission. |
| UOW02-ACCESS-005 | UI hiding does not grant or enforce authorization. Backend checks are authoritative. |
| UOW02-ACCESS-006 | PII fields are returned only to roles authorized to view them. |
| UOW02-ACCESS-007 | Authorized staff search supports homeowner name, homeowner code, email, mobile, property code, phase or section, block, lot, street, house number, homeowner status, property status, and billing status. |
| UOW02-ACCESS-008 | Search results are paginated and sorted by relevance or a configured default order. |
| UOW02-ACCESS-009 | Authorization failures deny access, return safe errors, and are audited. |
| UOW02-ACCESS-010 | Board Member read-only access must be limited to fields required for authorized governance and oversight. Sensitive PII may be masked or omitted unless explicitly permitted. |

## Read Model Rules

| Rule ID | Rule |
|---|---|
| UOW02-READ-001 | UOW-02 provides homeowner summary read models. |
| UOW02-READ-002 | UOW-02 provides property summary read models. |
| UOW02-READ-003 | UOW-02 provides ownership timeline read models. |
| UOW02-READ-004 | UOW-02 provides billing-account reference read models. |
| UOW02-READ-005 | UOW-02 provides billable-property validation result read models. |
| UOW02-READ-006 | UOW-02 provides owner visibility read models for object authorization and portal composition. |
| UOW02-READ-007 | Later units must consume UOW-02 read models instead of directly interpreting raw homeowner, property, and ownership tables. |
| UOW02-READ-008 | Read models enforce server-side authorization and return only fields appropriate to the requesting role. |

## Misuse Cases

| Misuse Case | Required Behavior |
|---|---|
| Homeowner guesses another homeowner ID or property ID | Deny access, return safe error, audit authorization failure. |
| Staff attempts to create a duplicate canonical property | Reject command before persistence and return duplicate-safe validation error. |
| Staff attempts to create a second active primary owner for the same property/date | Reject command and preserve existing ownership history. |
| Homeowner submits legal name or ownership change through contact request | Reject request with safe validation error and no master-data mutation. |
| Billing later attempts to include a property with missing owner or zero lot area | Billable validation returns failed reason codes; no invoice eligibility is granted. |
| Unauthorized actor searches PII fields | Deny or return role-filtered fields only; audit security-sensitive denial where appropriate. |
| Ownership transfer command tries to move old unpaid invoices to the new owner | Reject as outside UOW-02 and preserve historical financial account references. |

## Testable Properties

| Rule Area | PBT Category | Property |
|---|---|---|
| Property normalization | Invariant / Idempotence | Normalization is deterministic and idempotent for generated property identifiers. |
| Property uniqueness | Invariant | Valid command sequences cannot create duplicate property codes or duplicate canonical identity keys. |
| Ownership periods | Stateful / Invariant | Valid ownership transfer sequences never produce overlapping primary ownership periods. |
| Billable validation | Invariant | Missing lot area, non-billable status, archived property, missing primary owner, multiple primary owners, ineligible responsible homeowner, or missing effective billing account period always produces an invalid result. |
| Contact request state | Stateful | Only `Pending` requests can be approved or rejected; terminal states do not transition further. |
| Contact request mutation | Invariant | Rejected requests never change homeowner master contact fields. |
| Billing account periods | Stateful / Invariant | Transfer commands create new billing account periods without changing historical billing account identifiers. |

## Security Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| SECURITY-01 | N/A | Functional Design does not define persistence infrastructure encryption. |
| SECURITY-02 | N/A | No network intermediary is designed in this artifact. |
| SECURITY-03 | Compliant for functional design | Audit and security-sensitive events require correlation IDs and safe structured detail; deployment logging is later. |
| SECURITY-04 | N/A | HTTP header middleware is an implementation/NFR concern. |
| SECURITY-05 | Compliant | All command inputs require type, format, length, duplicate, date-range, and domain validation before processing. |
| SECURITY-06 | N/A | IAM and cloud policies are infrastructure concerns. |
| SECURITY-07 | N/A | Network configuration is not defined in Functional Design. |
| SECURITY-08 | Compliant | Every protected resource requires server-side role and object authorization; homeowners are scoped to own linked records. |
| SECURITY-09 | Compliant for functional design | Safe errors are required and no default credentials or sample paths are introduced. |
| SECURITY-10 | N/A | Supply chain controls are handled in code generation, CI, and build stages. |
| SECURITY-11 | Compliant | Security-sensitive authorization and PII rules are explicit, and misuse cases are documented. |
| SECURITY-12 | N/A | Authentication mechanics are owned by UOW-01; UOW-02 consumes actor context. |
| SECURITY-13 | Compliant | Critical data changes are auditable with actor, timestamp, before/after values, and correlation ID. |
| SECURITY-14 | Compliant for functional design | Authorization denials and sensitive changes are categorized for alerting; concrete monitoring is later. |
| SECURITY-15 | Compliant | Validation and authorization fail closed; UOW-02 commands must not bypass safe error handling. |

## Property-Based Testing Compliance Summary

| Rule | Status | Rationale |
|---|---|---|
| PBT-01 | Compliant | Functional Design identifies UOW-02 properties for normalization, uniqueness, ownership state, billability, contact state, and billing-account periods. |
| PBT-02 | N/A | No round-trip serialization or parsing pair is defined in this Functional Design beyond standard value validation. |
| PBT-03 | N/A at this stage | Invariants are identified here and become enforced test requirements during Code Generation. |
| PBT-04 | N/A at this stage | Idempotence candidates are identified for normalization and become enforced during Code Generation. |
| PBT-05 | N/A | No independent oracle or optimized algorithm is defined. |
| PBT-06 | N/A at this stage | Stateful candidates are identified for later implementation and test design. |
| PBT-07 | N/A at this stage | Domain generators are required during Code Generation. |
| PBT-08 | N/A at this stage | Shrinking, seed logging, and CI execution are code/build concerns. |
| PBT-09 | N/A | Framework selection was established previously as `fast-check`; UOW-02 Functional Design does not change it. |
| PBT-10 | N/A at this stage | Example and property test balance is enforced during Code Generation. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
