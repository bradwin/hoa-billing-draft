# UOW-02 Frontend Components

## Frontend Scope

UOW-02 frontend behavior covers operational homeowner/property management and homeowner contact-change self-service. All protected views depend on backend authorization and role-filtered API responses.

## Component Hierarchy

| Component | Purpose | Primary API Integration |
|---|---|---|
| `HomeownerSearchPage` | Staff search, filters, pagination, and result review | `GET /homeowners` |
| `HomeownerSearchFilters` | Filter by name, homeowner code, email, mobile, status, and property references | `GET /homeowners` |
| `HomeownerResultTable` | Role-filtered homeowner result rows | `GET /homeowners` |
| `HomeownerDetailPage` | Homeowner profile, linked properties, ownership, billing accounts, and contact requests | `GET /homeowners/{id}` |
| `HomeownerForm` | Staff create/update form for master data | `POST /homeowners`, `PUT /homeowners/{id}` |
| `DuplicateCandidatePanel` | Display duplicate candidates and capture staff confirmation | `POST /homeowners/duplicate-check` |
| `HomeownerStatusBadge` | Show lifecycle status independent of portal account status | `GET /homeowners/{id}` |
| `PortalAccountStatusPanel` | Display linked portal account status from access read model | `GET /homeowners/{id}/portal-account` |
| `PropertySearchPage` | Staff property search, filters, pagination, and result review | `GET /properties` |
| `PropertySearchFilters` | Filter by property code, phase, block, lot, street, house number, status, and billing status | `GET /properties` |
| `PropertyResultTable` | Role-filtered property result rows | `GET /properties` |
| `PropertyDetailPage` | Canonical property, aliases, lot area, ownership timeline, and billable validation | `GET /properties/{id}` |
| `PropertyForm` | Staff create/update form for canonical property fields | `POST /properties`, `PUT /properties/{id}` |
| `PropertyAliasEditor` | Add, edit, and remove searchable aliases | `POST /properties/{id}/aliases`, `PUT /properties/{id}/aliases/{aliasId}` |
| `BillableValidationPanel` | Show pass/fail prerequisites and reason codes | `GET /properties/{id}/billable-validation` |
| `OwnershipTimelinePanel` | Show effective-dated ownership and billing responsibility history | `GET /properties/{id}/ownership` |
| `OwnershipTransferForm` | Staff assignment or transfer of primary owner and billing responsibility | `POST /properties/{id}/ownership/primary` |
| `BillingAccountPeriodPanel` | Show responsibility-period billing account references | `GET /properties/{id}/billing-accounts` |
| `ContactChangeRequestForm` | Homeowner submission of contact-only changes | `POST /contact-change-requests` |
| `ContactChangeQueuePage` | Staff queue for pending contact changes | `GET /contact-change-requests` |
| `ContactChangeDecisionPanel` | Staff approval or rejection with remarks | `POST /contact-change-requests/{id}/approve`, `POST /contact-change-requests/{id}/reject` |
| `OwnerVisibilityPanel` | Homeowner portal view of own linked profile, property, and billing-account references | `GET /me/homeowner-profile` |
| `SafeValidationSummary` | Safe validation and authorization error display | All command/query responses |

## Interaction Rules

| Rule ID | Rule |
|---|---|
| UOW02-FE-001 | Protected UOW-02 screens must load server-resolved actor context before rendering protected data. |
| UOW02-FE-002 | Role-aware controls are usability only; backend authorization remains authoritative. |
| UOW02-FE-003 | PII fields render only when returned by the backend. The frontend must not infer hidden PII from cached state. |
| UOW02-FE-004 | Staff create/update forms must show duplicate candidate review before allowing confirmed creation of a possible duplicate homeowner. |
| UOW02-FE-005 | Property forms must display canonical identity and property code separately. |
| UOW02-FE-006 | Alias editing must clearly show that aliases are searchable references, not billable property records. |
| UOW02-FE-007 | Ownership transfer UI must show the prior primary owner, proposed effective date, and resulting billing account period before submit. |
| UOW02-FE-008 | Billable validation results must show every failed prerequisite reason returned by the backend. |
| UOW02-FE-009 | Contact change forms must offer only contact fields and must not expose legal name, ownership, billing responsibility, lifecycle status, or financial fields. |
| UOW02-FE-010 | Contact decision UI must require approval or rejection and decision remarks where backend validation requires them. |
| UOW02-FE-011 | Error displays use stable safe messages and correlation IDs where available. |
| UOW02-FE-012 | Forms must expose stable `data-testid` values for automation. |

## Form Validation

| Form | Client Validation | Backend Authority |
|---|---|---|
| `HomeownerForm` | Required display fields, email shape when present, phone length, status choice, max text lengths | Backend validates identity, duplicate candidates, status rules, PII authorization, and audit. |
| `PropertyForm` | Required canonical fields for billable records, lot area decimal shape, status choice | Backend validates canonical uniqueness, property code uniqueness, lot area precision, billing status, and audit. |
| `PropertyAliasEditor` | Alias type and value present, length bounded | Backend validates alias normalization, authorization, and audit requirements. |
| `OwnershipTransferForm` | Property, homeowner, role, and effective date present | Backend validates non-overlap, active billing responsibility, archived restrictions, billing account period creation, and audit. |
| `ContactChangeRequestForm` | Only allowed contact fields, email/phone/address length and format checks | Backend validates homeowner ownership, allowed fields, pending request creation, and safe errors. |
| `ContactChangeDecisionPanel` | Decision selected and remarks length bounded | Backend validates decision actor role, pending status, terminal state rules, and audit. |

## UI States

| Area | State | UI Behavior |
|---|---|---|
| Homeowner duplicate review | No candidates | Allow create after normal validation. |
| Homeowner duplicate review | Candidates found | Show candidates and require staff confirmation or existing-record selection. |
| Property validation | Duplicate canonical key | Block submit and show safe duplicate message. |
| Ownership transfer | Overlap detected | Block submit and show date-range conflict from backend. |
| Billable validation | Invalid | Show failed prerequisites and keep invoice-generation eligibility unavailable. |
| Contact request | Pending | Show pending status to homeowner and staff queue. |
| Contact request | Approved | Show applied contact values and terminal status. |
| Contact request | Rejected | Show rejection status and remarks; master data remains unchanged. |
| Authorization | Denied | Show safe error without revealing whether the target record exists. |

## Staff Search Behavior

| Filter | Notes |
|---|---|
| Homeowner name | Uses normalized name search. |
| Homeowner code | Exact or prefix search by permanent code. |
| Email and mobile | Staff-only PII filters subject to permission. |
| Property identifiers | Property code, phase or section, block, lot, street, house number, and alias values. |
| Status filters | Homeowner status, property lifecycle status, and billing status. |
| Pagination | Page and page size are bounded by backend validation. |

## Stable Test IDs

| Element | `data-testid` |
|---|---|
| Homeowner search page | `homeowner-search-page` |
| Homeowner search filters | `homeowner-search-filters` |
| Homeowner result table | `homeowner-result-table` |
| Homeowner form | `homeowner-form` |
| Duplicate candidate panel | `homeowner-duplicate-candidate-panel` |
| Homeowner status badge | `homeowner-status-badge` |
| Portal account status panel | `homeowner-portal-account-status-panel` |
| Property search page | `property-search-page` |
| Property search filters | `property-search-filters` |
| Property result table | `property-result-table` |
| Property form | `property-form` |
| Property alias editor | `property-alias-editor` |
| Billable validation panel | `property-billable-validation-panel` |
| Ownership timeline panel | `ownership-timeline-panel` |
| Ownership transfer form | `ownership-transfer-form` |
| Billing account period panel | `billing-account-period-panel` |
| Contact change request form | `contact-change-request-form` |
| Contact change queue page | `contact-change-queue-page` |
| Contact change decision panel | `contact-change-decision-panel` |
| Owner visibility panel | `owner-visibility-panel` |
| Safe validation summary | `safe-validation-summary` |

## API Contract Expectations

| API Area | Frontend Expectation |
|---|---|
| Homeowner search | Responses are already authorized and PII-filtered. |
| Duplicate checks | Candidate response includes safe match signals, not unrestricted PII. |
| Property search | Alias matches resolve to canonical property records. |
| Billable validation | Responses include pass/fail status and reason codes. |
| Ownership transfer | Responses include updated ownership timeline and billing account reference. |
| Contact changes | Pending, approved, and rejected states are explicit and terminal behavior is enforced by backend. |
| Errors | Errors use stable code, safe message, and correlation ID. |

## Testable Properties

| Area | PBT Category | Property |
|---|---|---|
| Search filters | Invariant | Generated filter state serializes to backend query parameters without dropping selected filters. |
| Contact form | Invariant | Generated form payloads cannot include disallowed legal, ownership, lifecycle, billing responsibility, or financial fields. |
| State rendering | Stateful | Contact request UI state never enables a decision action for terminal backend states. |
| Safe errors | Invariant | Rendered error content uses safe message and correlation ID, not internal details. |

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Frontend design relies on backend authorization, avoids client-side PII inference, scopes contact fields, uses safe errors, and keeps protected controls role-aware only for usability. |
| Property-Based Testing | Compliant | Frontend-relevant PBT candidates are identified for search filters, contact payload shape, terminal-state rendering, and safe errors. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
