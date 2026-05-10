# UOW-03 Frontend Components

## Frontend Scope

UOW-03 frontend behavior covers protected staff configuration management for billing rules and charge definitions. The UI must make effective versions, approval state, audit-sensitive changes, and downstream impact clear without implying that UOW-03 creates invoices, payments, penalties, reports, documents, emails, jobs, or imports.

## Component Hierarchy

| Component | Purpose | Primary API Integration |
|---|---|---|
| `BillingConfigurationDashboard` | Landing page for current active billing configuration and pending drafts | `GET /billing-configuration/summary` |
| `RateRulePage` | Manage dues rate per sqm versions | `GET /billing-configuration/rates`, `POST /billing-configuration/rates/drafts` |
| `RateRuleForm` | Draft a new effective-dated rate rule | `POST /billing-configuration/rates/drafts` |
| `BillingCyclePage` | Manage monthly, quarterly, semi-annual, annual, and custom cycle rules | `GET /billing-configuration/cycles` |
| `BillingCycleForm` | Draft billing cycle rule definitions | `POST /billing-configuration/cycles/drafts` |
| `DueGraceRulePage` | Manage due date base/offset and grace days | `GET /billing-configuration/due-grace-rules` |
| `DueGraceRuleForm` | Draft due date and grace period rules | `POST /billing-configuration/due-grace-rules/drafts` |
| `RoundingRulePage` | Manage rounding mode, timing, and precision metadata | `GET /billing-configuration/rounding-rules` |
| `RoundingRuleForm` | Draft rounding rule changes | `POST /billing-configuration/rounding-rules/drafts` |
| `ChargeTypeCatalogPage` | Manage charge types and manual tax-like eligibility | `GET /billing-configuration/charge-types` |
| `ChargeTypeForm` | Draft charge type additions or corrections | `POST /billing-configuration/charge-types/drafts` |
| `NumberingFormatPage` | Manage numbering format definitions by document type | `GET /billing-configuration/numbering-formats` |
| `TemplateReferencePage` | Manage template metadata references | `GET /billing-configuration/template-references` |
| `PaymentMethodPage` | Manage payment method definitions | `GET /billing-configuration/payment-methods` |
| `ConfigurationVersionHistory` | Show active, superseded, retired, draft, and rejected versions | `GET /billing-configuration/history` |
| `ConfigurationApprovalPanel` | Show approval status and submit draft for Treasurer approval | `POST /billing-configuration/drafts/{id}/submit-approval` |
| `ConfigurationResolutionPreview` | Preview resolved config for a billing period start date or document/payment context | `GET /billing-configuration/resolve` |
| `SafeConfigurationError` | Render safe validation and authorization errors | All command/query responses |

## Interaction Rules

| Rule ID | Rule |
|---|---|
| UOW03-FE-001 | Protected UOW-03 screens must load server-resolved actor context before rendering protected configuration data. |
| UOW03-FE-002 | Role-aware controls are usability only; backend authorization remains authoritative. |
| UOW03-FE-003 | Financial-impacting drafts must display approval requirement and current approval state. |
| UOW03-FE-004 | Effective date forms must show overlap and gap warnings returned by backend validation. |
| UOW03-FE-005 | Rate, precision, and rounding forms must not use floating-point preview text without backend-validated decimal behavior. |
| UOW03-FE-006 | Manual tax-like charge configuration must clearly state that tax-like amounts are manual explicit line items only. |
| UOW03-FE-007 | Numbering format screens must state that later units allocate actual numbers atomically. |
| UOW03-FE-008 | Template reference screens must not expose rendering or storage controls. |
| UOW03-FE-009 | Payment method screens configure definitions only and must not post payments. |
| UOW03-FE-010 | Error displays use stable safe messages and correlation IDs where available. |
| UOW03-FE-011 | Forms must expose stable `data-testid` values for automation. |

## Form Validation

| Form | Client Validation | Backend Authority |
|---|---|---|
| `RateRuleForm` | Rate present, decimal shape up to 4 places, effective date present | Backend validates non-overlap, approval requirement, decimal precision, and audit. |
| `BillingCycleForm` | Cycle type selected, custom metadata present when custom | Backend validates deterministic period generation. |
| `DueGraceRuleForm` | Base date type selected, integer offset, non-negative grace days | Backend validates rule consistency and approval requirement. |
| `RoundingRuleForm` | Half-up mode, timing selected, scale values within allowed set | Backend validates decimal safety and rule metadata. |
| `ChargeTypeForm` | Code/name/category present, eligibility flags selected | Backend validates uniqueness, manual tax-like restrictions, and activation rules. |
| `NumberingFormatForm` | Document type, prefix/template, scope, padding, reset policy present | Backend validates non-overlap and format safety. |
| `TemplateReferenceForm` | Template type/key/version present | Backend validates metadata only, not rendering. |
| `PaymentMethodForm` | Code, display name, instructions, sort order, reference requirement | Backend validates active/effective status and audit. |

## UI States

| Area | State | UI Behavior |
|---|---|---|
| Draft configuration | Draft | Editable by authorized staff before approval submission. |
| Draft configuration | Pending approval | Read-only except cancellation where allowed. |
| Draft configuration | Rejected | Terminal for activation; can be copied into a new draft. |
| Configuration version | Active | Immutable and shown as current for matching effective date. |
| Configuration version | Superseded | Read-only historical version. |
| Resolution preview | Missing version | Show safe missing configuration reason. |
| Resolution preview | Ambiguous version | Show safe ambiguous configuration reason and block downstream readiness. |
| Manual tax-like charge | Configured | Show manual-entry-only indicator. |

## Stable Test IDs

| Element | `data-testid` |
|---|---|
| Billing configuration dashboard | `billing-config-dashboard` |
| Rate rule page | `billing-config-rate-rule-page` |
| Rate rule form | `billing-config-rate-rule-form` |
| Billing cycle page | `billing-config-cycle-page` |
| Billing cycle form | `billing-config-cycle-form` |
| Due/grace rule page | `billing-config-due-grace-page` |
| Due/grace rule form | `billing-config-due-grace-form` |
| Rounding rule page | `billing-config-rounding-page` |
| Rounding rule form | `billing-config-rounding-form` |
| Charge type catalog page | `billing-config-charge-type-page` |
| Charge type form | `billing-config-charge-type-form` |
| Numbering format page | `billing-config-numbering-page` |
| Template reference page | `billing-config-template-reference-page` |
| Payment method page | `billing-config-payment-method-page` |
| Configuration version history | `billing-config-version-history` |
| Configuration approval panel | `billing-config-approval-panel` |
| Configuration resolution preview | `billing-config-resolution-preview` |
| Safe configuration error | `billing-config-safe-error` |

## API Contract Expectations

| API Area | Frontend Expectation |
|---|---|
| Configuration search/list | Responses include active, draft, pending approval, rejected, superseded, and retired state where authorized. |
| Draft creation | Backend validates decimal precision, effective-date overlap, and approval requirement. |
| Approval submission | Backend creates UOW-01 approval request where required. |
| Resolution preview | Backend returns a side-effect-free configuration snapshot or reason-coded failure. |
| Errors | Errors use stable code, safe message, and correlation ID. |

## Testable Properties

| Area | PBT Category | Property |
|---|---|---|
| Effective dates | Stateful/invariant | Generated active versions cannot overlap for the same rule scope. |
| Rate forms | Invariant | Generated rate input preserves up to 4 decimal places and rejects invalid precision. |
| Due/grace forms | Invariant | Grace period display never changes due date display. |
| Manual tax-like charges | Invariant | Generated manual charge payloads require description, amount, reason, and configured charge type. |
| Safe errors | Invariant | Rendered error content uses safe message and correlation ID, not internal diagnostics. |

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Frontend relies on backend authorization, displays approval state for financial changes, and avoids downstream side-effect controls. |
| Property-Based Testing | Compliant | Frontend-relevant PBT candidates are identified for effective-date, decimal, grace period, manual charge, and safe error behavior. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
