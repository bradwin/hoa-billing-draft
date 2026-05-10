# UOW-03 Domain Entities

## Entity Overview

UOW-03 entities are technology-agnostic contracts for billing configuration, charge rules, effective-dated versions, resolution snapshots, and staff configuration views.

## BillingConfigurationDraft

| Field | Description |
|---|---|
| `id` | Stable draft identifier |
| `configurationType` | Rate, billing cycle, due date, grace period, rounding, charge type, numbering format, template reference, payment method, or related billing rule type |
| `payload` | Draft configuration payload |
| `status` | `Draft`, `PendingApproval`, `Rejected`, or `Activated` |
| `requiresTreasurerApproval` | Whether activation requires Treasurer approval |
| `approvalRequestId` | UOW-01 approval reference when required |
| `createdBy` | Actor who created the draft |
| `createdAt` | Draft creation timestamp |
| `updatedAt` | Last draft update timestamp |
| `remarks` | Staff remarks |
| `correlationId` | Request correlation identifier |

### Rules

- Drafts are not consumed by downstream source-record units.
- Financial-impacting drafts require Treasurer approval before activation.
- Rejected drafts do not become active.

## ConfigurationVersion

| Field | Description |
|---|---|
| `id` | Stable version identifier |
| `configurationType` | Type of configuration version |
| `scopeKey` | Configuration scope, such as HOA-wide first implementation |
| `effectiveFrom` | Inclusive effective start date |
| `effectiveTo` | Exclusive effective end date; `null` means open-ended |
| `status` | `Active`, `Superseded`, or `Retired` |
| `sourceDraftId` | Draft that produced the version |
| `approvalRequestId` | UOW-01 approval reference when required |
| `activatedBy` | Actor who activated the version |
| `activatedAt` | Activation timestamp |
| `auditCorrelationId` | Audit correlation identifier |

### Rules

- Activated versions are immutable.
- Active versions for the same type and scope cannot overlap.
- Corrections require new versions.

## DuesRateRule

| Field | Description |
|---|---|
| `id` | Stable rule identifier |
| `versionId` | Configuration version reference |
| `ratePerSqm` | Decimal rate per square meter, up to 4 fractional digits |
| `currency` | Currency code or HOA currency reference |
| `roundingRuleId` | Rounding rule reference |
| `chargeTypeId` | Associated recurring dues charge type |

### Rules

- Rate is resolved by billing period start date.
- Rate is not multiplied by lot area in UOW-03.

## BillingCycleRule

| Field | Description |
|---|---|
| `id` | Stable rule identifier |
| `versionId` | Configuration version reference |
| `cycleType` | `Monthly`, `Quarterly`, `SemiAnnual`, `Annual`, or `Custom` |
| `anchorDate` | Date used to generate deterministic periods |
| `customRule` | Explicit period generation metadata for custom cycles |
| `periodLabelFormat` | Format used by downstream units for display and identity |

### Rules

- Custom cycles require explicit period start/end generation rules.
- Billing period identity must be deterministic.

## DueDateRule

| Field | Description |
|---|---|
| `id` | Stable rule identifier |
| `versionId` | Configuration version reference |
| `baseDateType` | `BillingPeriodStart`, `BillingPeriodEnd`, or `InvoiceIssueDate` |
| `dayOffset` | Integer days added to base date |
| `weekendHolidayPolicy` | Deferred or configured policy reference |

### Rules

- Weekend and holiday movement is not applied unless configured.
- Due date output is consumed by UOW-04 invoice generation.

## GracePeriodRule

| Field | Description |
|---|---|
| `id` | Stable rule identifier |
| `versionId` | Configuration version reference |
| `graceDays` | Integer days after due date |

### Rules

- Grace period does not change due date.
- UOW-06 consumes grace metadata for penalty eligibility.

## RoundingRule

| Field | Description |
|---|---|
| `id` | Stable rule identifier |
| `versionId` | Configuration version reference |
| `roundingMode` | `HalfUp` |
| `moneyScale` | `2` for centavos |
| `lotAreaScale` | Up to `4` decimal places |
| `rateScale` | Up to `4` decimal places |
| `roundingTiming` | `LineLevel` or `InvoiceTotalLevel` |

### Rules

- Default rounding timing is `LineLevel`.
- Floating-point arithmetic is invalid for financial calculations.

## ChargeType

| Field | Description |
|---|---|
| `id` | Stable charge type identifier |
| `versionId` | Configuration version reference |
| `code` | Unique charge type code |
| `name` | Display name |
| `category` | Dues, Assessment, ManualTaxLike, Fee, Discount, PenaltyConfig, or configured category |
| `isRecurringEligible` | Whether recurring generation may use this charge type |
| `isManualEntryEligible` | Whether manual invoice entry may use this charge type |
| `isAutomaticGenerationEligible` | Whether later units may generate this charge type automatically |
| `active` | Whether available for resolution |

### Rules

- Manual tax-like charges must be manual-entry eligible.
- UOW-03 does not compute tax-like charges automatically.

## NumberingFormatRule

| Field | Description |
|---|---|
| `id` | Stable numbering format identifier |
| `versionId` | Configuration version reference |
| `documentType` | Invoice, Receipt, Statement, ReportExport, or configured document type |
| `prefixTemplate` | Prefix or full pattern template |
| `sequenceScope` | Global, fiscal year, calendar year, document type, or configured scope |
| `padding` | Number sequence padding length |
| `resetPolicy` | Never, calendar year, fiscal year, monthly, or configured reset |

### Rules

- UOW-03 stores format rules only.
- Later owning units allocate actual numbers atomically.

## TemplateReference

| Field | Description |
|---|---|
| `id` | Stable template reference identifier |
| `versionId` | Configuration version reference |
| `templateType` | Invoice, Receipt, Statement, Reminder, Report, or configured type |
| `templateKey` | Reference key used by UOW-08 |
| `versionLabel` | Template version label |
| `active` | Whether this reference is available for resolution |

### Rules

- UOW-03 stores metadata only.
- UOW-08 owns rendering and storage.

## PaymentMethodDefinition

| Field | Description |
|---|---|
| `id` | Stable payment method identifier |
| `versionId` | Configuration version reference |
| `code` | Unique payment method code |
| `displayName` | User-facing label |
| `instructions` | Payment instructions |
| `referenceRequired` | Whether a reference number is required |
| `sortOrder` | Display order |
| `active` | Whether available for UOW-05 |

### Rules

- UOW-05 consumes active payment method definitions.
- UOW-03 does not create payment records.

## ConfigurationResolutionSnapshot

| Field | Description |
|---|---|
| `resolutionDate` | Date used for effective-date resolution |
| `rateRule` | Applicable rate rule snapshot |
| `billingCycleRule` | Applicable billing cycle snapshot |
| `dueDateRule` | Applicable due date snapshot |
| `gracePeriodRule` | Applicable grace period snapshot |
| `roundingRule` | Applicable rounding snapshot |
| `chargeTypes` | Applicable charge type snapshots |
| `numberingFormats` | Applicable numbering format snapshots |
| `templateReferences` | Applicable template reference snapshots |
| `paymentMethods` | Applicable payment method snapshots |
| `sourceVersionIds` | Version IDs included in the snapshot |

### Rules

- Snapshot is read-only and side-effect free.
- Downstream units snapshot the resolved configuration they use.

## Domain Generators Required Later

| Generator | Purpose |
|---|---|
| `effectiveConfigurationVersionGenerator` | Generate overlapping, adjacent, open-ended, and valid effective-dated versions. |
| `rateResolutionGenerator` | Generate rate versions and billing period start dates. |
| `billingCycleGenerator` | Generate predefined and custom cycle rules. |
| `dueDateRuleGenerator` | Generate base date, offset, and date inputs. |
| `roundingRuleGenerator` | Generate decimal values, rate/area precision, and rounding timing. |
| `manualChargeGenerator` | Generate valid and invalid manual tax-like charge payloads. |
| `numberingFormatGenerator` | Generate document type/date/format resolution cases. |

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Financial-impacting entities include approval, audit, immutable history, and safe downstream read-only snapshots. |
| Property-Based Testing | Compliant | Domain entities identify generators needed for effective-date, rounding, due date, manual charge, and numbering invariants. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
