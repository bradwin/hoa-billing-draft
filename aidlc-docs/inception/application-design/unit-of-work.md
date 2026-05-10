# Unit of Work Definitions

## Summary

The HOA Billing System will be decomposed into eight sequential units of work inside one TypeScript modular monolith. This follows the approved unit plan choices:

- Domain-oriented units inside one deployable application boundary.
- Seven to eight balanced units aligned to business capabilities and financial dependencies.
- Strict dependency sequence from foundation through financial source records, derived outputs, imports, and support integration.
- Each domain unit owns its backend APIs, frontend screens, and tests, with a final portal and support integration pass.
- Financial ambiguity blocks generation or later construction until ownership is explicit.

## Unit Catalog

| Order | Unit ID | Unit Name | Primary Story IDs | Primary Components |
|---|---|---|---|---|
| 1 | UOW-01 | Platform Foundation, Access, Settings, Audit, and Approval Core | US-001, US-002, US-003 | C-02, C-03, C-17, C-18, C-20 |
| 2 | UOW-02 | Homeowner, Property, Ownership, and Contact Requests | US-004, US-005, US-006, US-007 | C-04 |
| 3 | UOW-03 | Billing Configuration and Charge Rules | US-008, US-009, US-010 | C-05 |
| 4 | UOW-04 | Invoice Lifecycle and Invoice Source Records | US-011, US-012, US-013, US-014 | C-06, C-07 partial |
| 5 | UOW-05 | Payments, Allocations, Credits, Receipts, and Financial Corrections | US-015, US-016, US-017, US-018, US-019, US-044, US-045 | C-07, C-08, C-09 |
| 6 | UOW-06 | Penalties, Delinquency, Waivers, and Reminders | US-020, US-021, US-022, US-023 | C-10 |
| 7 | UOW-07 | Statements, Reports, Dashboards, and Exports | US-024 through US-041 | C-11, C-12 |
| 8 | UOW-08 | Imports, Opening Balances, Support Services, Jobs, and Portal Integration | US-042, US-043, US-046, US-047, US-048 | C-01, C-13, C-14, C-15, C-16, C-19 |

## Financial Ownership Rules

Financial source records have one owning unit:

- Invoice source records are owned by UOW-04.
- Payments, allocations, credits, receipts, reversals, and generic financial correction behavior are owned by UOW-05.
- Penalties, waivers, delinquency classifications, and reminder eligibility are owned by UOW-06.
- Statements, reports, dashboards, and exports are read/output units in UOW-07 and must not own source financial records.
- Imports and opening balances in UOW-08 apply through domain services and approved adjustment flows; they must not write directly to source tables.
- Audit and approval core are owned by UOW-01, but approved financial effects are applied by the relevant financial source-record unit.

Account Balance is a derived ledger-style component. UOW-04 establishes invoice balance inputs, UOW-05 completes payment/allocation/credit/receipt balance impact, UOW-06 adds penalty/waiver impact, and UOW-07 consumes the complete balance model for SOAs and reports. No unit may implement a mutable balance-only source of truth.

## Code Organization Strategy

Application code will be generated in the workspace root, never under `aidlc-docs/`.

The target greenfield structure is a TypeScript monorepo:

```text
apps/
  api/
    src/modules/{domain}/
    test/{domain}/
  web/
    src/features/{domain}/
    src/app/
    test/{domain}/
  worker/
    src/jobs/{domain}/
    test/{domain}/
packages/
  shared/
    src/{domain}/
    test/{domain}/
prisma/
  schema.prisma
  migrations/
docker/
```

Unit names map to domain folders, not independently deployable service folders. For example, UOW-04 is expected to generate invoice-related code under paths such as:

- `apps/api/src/modules/invoices/`
- `apps/web/src/features/invoices/`
- `apps/worker/src/jobs/invoices/`
- `packages/shared/src/invoices/`
- `apps/api/test/invoices/`
- `apps/web/test/invoices/`

Support service interfaces used by earlier units must be defined as contracts before implementation. UOW-08 provides concrete document generation, storage, notification, job, and portal integration implementations. Earlier units must not create ad hoc PDF, SMTP, or filesystem logic.

## UOW-01: Platform Foundation, Access, Settings, Audit, and Approval Core

### Purpose

Create the application foundation needed by every later unit: API shell, actor context, role checks, object authorization conventions, settings shell, audit recording, approval request core, shared value objects, transaction boundaries, and support-service contracts.

### Responsibilities

- Establish monorepo project structure during code generation.
- Define shared types such as `ActorContext`, `Money`, `DateRange`, `BillingPeriod`, `AuditContext`, pagination, errors, and command result shapes.
- Implement authentication, invitation, session, password reset, role enforcement, and homeowner object isolation foundations.
- Provide central route guards and domain-owned authorization helper conventions.
- Provide audit append interfaces and immutable audit persistence rules.
- Provide approval request lifecycle primitives for Treasurer-only decisions.
- Provide support-service contracts for documents, storage, notifications, and jobs so earlier units can integrate safely without owning implementations.
- Provide system settings shell for HOA profile and cross-cutting configuration categories.

### Out of Scope

- Detailed billing rate rules, invoice numbering behavior, SMTP adapters, PDF rendering, file persistence, and financial source-record mutations belong to later units.

### Construction Notes

- Security Baseline enforcement begins here for authentication, authorization, session management, audit, validation, rate limiting design, logging, and secure defaults.
- Approval Workflow must not apply financial effects directly; it coordinates requests and delegates approved effects to domain services.

## UOW-02: Homeowner, Property, Ownership, and Contact Requests

### Purpose

Own homeowner profiles, property records, billing account identity, ownership history, billable property prerequisites, and homeowner contact change request workflows.

### Responsibilities

- Create and update homeowner records.
- Create and update property records with duplicate prevention.
- Preserve ownership history and enforce one active primary homeowner for each billable property.
- Validate billable property prerequisites, including positive lot area.
- Implement homeowner contact change request submission, approval, and rejection.
- Build domain-owned object authorization for homeowner and property access.
- Provide read models needed by billing, payments, reports, imports, and homeowner portal integration.

### Out of Scope

- Financial balances, invoices, payments, penalties, and reports are not owned by this unit.

### Construction Notes

- Property uniqueness and billable status are high-risk rules and must receive example tests and later property analysis where applicable.
- Homeowner PII access must be role-restricted and audited.

## UOW-03: Billing Configuration and Charge Rules

### Purpose

Own configurable billing rules and charge definitions that feed invoice generation, receipts, penalties, SOAs, reports, notifications, and document output.

### Responsibilities

- Configure dues rate per square meter with effective dates.
- Configure billing cycles, due date rules, grace periods, charge types, rounding, payment methods, numbering formats, and template references.
- Support manual tax-like line items as explicit manual charges only; no automatic tax calculation.
- Provide active configuration resolution by billing period start date.
- Audit all configuration changes.

### Out of Scope

- Creating invoice source records belongs to UOW-04.
- SMTP delivery and PDF template rendering implementations belong to UOW-08.

### Construction Notes

- Rate selection, due date calculation, manual charge validation, and rounding are financial-risk rules and must receive precise functional design before code generation.

## UOW-04: Invoice Lifecycle and Invoice Source Records

### Purpose

Own the invoice lifecycle from draft generation through issuance, cancellation, voiding, and reissue. This unit creates invoice source records and establishes invoice balance inputs for the derived Account Balance model.

### Responsibilities

- Generate recurring draft invoice batches from billable properties and billing configuration.
- Generate billing exception output for invalid properties and duplicates.
- Create manual draft invoices with validated charge lines.
- Issue invoices with immutable invoice numbers and source snapshots.
- Prevent duplicate invoices by property, charge type, and billing period.
- Support controlled cancel, void, and reissue request flows through Approval Workflow.
- Queue document and email intents through contracts, without implementing PDF or SMTP adapters.
- Provide invoice query models for payments, SOA, reporting, and homeowner portal integration.

### Out of Scope

- Payment allocation, receipt generation, penalties, SOAs, reports, and document/email implementation are owned by later units.

### Construction Notes

- Issued invoice snapshots must not be recalculated after rate or rule changes.
- Invoice generation must not consume issued invoice numbers until issuance.
- Financial transaction boundaries must include invoice source records, audit, and approval coordination where applicable.

## UOW-05: Payments, Allocations, Credits, Receipts, and Financial Corrections

### Purpose

Own payment proof intake, payment verification, transactional posting, allocation, credit creation, receipt records, reversals, and core financial correction behavior.

### Responsibilities

- Accept pending homeowner payment proof records against authorized accounts.
- Verify and post payments transactionally.
- Allocate payments to oldest unpaid invoices by default, with validation for manual allocation.
- Apply penalties and fees before dues within invoice allocation when applicable.
- Create property or billing-account specific credits for overpayments.
- Generate receipt records and receipt numbers after verified posting.
- Reverse posted payments with approval, reason capture, immutable history, and audit.
- Enforce immutable history for issued invoices, posted payments, receipts, penalties, credits, and adjustments by correction records rather than deletion.
- Complete Account Balance impact for payments, allocations, credits, receipts, and generic adjustments.

### Out of Scope

- Penalty creation and waiver rules belong to UOW-06.
- Report output belongs to UOW-07.
- Physical storage of proof files and receipt PDFs belongs to UOW-08.

### Construction Notes

- Payment posting, allocation, credit creation, invoice status effects, receipt record creation, and audit must succeed or fail together.
- Allocation totals, nonnegative open balances, and balance reconciliation are mandatory property-based testing candidates during Functional Design.

## UOW-06: Penalties, Delinquency, Waivers, and Reminders

### Purpose

Own overdue detection, aging bucket classification, recurring non-compounding penalties, penalty waivers, reminder eligibility, and reminder queue intents.

### Responsibilities

- Identify overdue invoices after due date plus grace period.
- Classify aging buckets.
- Apply recurring monthly non-compounding penalties.
- Prevent duplicate penalty application for the same invoice and penalty period.
- Manage penalty waiver requests through Approval Workflow.
- Queue overdue reminder intents through Notification contracts.
- Add penalty and waiver impact to Account Balance derivation.

### Out of Scope

- Dashboard and formal report output belong to UOW-07.
- Concrete email delivery belongs to UOW-08.

### Construction Notes

- Penalties must never compound on penalties or interest.
- Penalty eligibility date, duplicate prevention, and waiver effects require precise property and example tests.

## UOW-07: Statements, Reports, Dashboards, and Exports

### Purpose

Own derived read/output workflows: SOAs, dashboards, Section 5.11 reports, audit trail report output, and export models. This unit consumes financial source records and Account Balance; it does not own source financial records.

### Responsibilities

- Generate homeowner/property SOAs by date range with opening balance, activity, running balance, ending balance, and aging summary.
- Generate batch SOA output and exception summaries.
- Generate operational dashboard metrics.
- Generate all required reports and exports, including billing, collection, aging, delinquency, registers, adjustments, penalties, master lists, monthly summaries, year-to-date summaries, and audit trail reports.
- Enforce report-level access controls and PII restrictions.
- Queue PDF, Excel, and CSV export intents through document/storage contracts.

### Out of Scope

- Mutating financial source records is prohibited in this unit.
- Concrete document rendering and file persistence belong to UOW-08.

### Construction Notes

- Report totals must reconcile with source records.
- SOA running balance and opening plus activity equals ending balance are mandatory property-based testing candidates during Functional Design.

## UOW-08: Imports, Opening Balances, Support Services, Jobs, and Portal Integration

### Purpose

Own CSV import workflows, opening balance application through approved adjustments, document generation, storage, notification delivery, job orchestration, and final cross-domain homeowner portal integration.

### Responsibilities

- Upload, validate, preview, approve, and apply homeowner/property imports.
- Import opening balances as auditable adjustment entries through approved domain services.
- Produce import exception reports.
- Implement concrete local storage abstraction for PDFs, exports, payment proofs, import files, and attachments.
- Implement PDF and export rendering for invoices, receipts, SOAs, and reports.
- Implement queued SMTP notifications, templates, retry behavior, resend controls, and email logs.
- Implement worker jobs for billing batches, penalties, reminders, email retries, imports, report exports, and batch SOAs.
- Complete homeowner portal account overview, document downloads, payment instructions, pending proof views, and cross-domain navigation.
- Verify that financial transactions remain valid when document or email delivery fails.

### Out of Scope

- Direct writes to homeowner, property, invoice, payment, penalty, or balance source records outside domain services are prohibited.

### Construction Notes

- Import application must be reviewable and auditable. Invalid rows must not be partially applied.
- Storage access must enforce ownership, type, size, path safety, and authorization checks.
- Job execution must be idempotent or duplicate-protected.

## Unit Boundary Validation

| Validation Area | Result |
|---|---|
| Every story assigned to a primary unit | Passed; see `unit-of-work-story-map.md` |
| Financial source-record ownership explicit | Passed |
| Derived output units prevented from owning source records | Passed |
| Security-sensitive workflows owned | Passed; UOW-01 owns foundation, UOW-02 through UOW-08 enforce domain object controls |
| Import direct table writes prohibited | Passed |
| Support service ownership explicit | Passed; UOW-08 owns implementations, UOW-01 owns contracts |
| Greenfield code organization documented | Passed |

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Unit boundaries isolate security-critical logic, route authorization, object authorization, audit, approvals, upload/storage controls, notification controls, and report PII restrictions. Implementation-specific rules remain enforceable in NFR, Infrastructure, Code Generation, and Build/Test stages. |
| Property-Based Testing | Compliant for Units Generation | Units identify later PBT candidates for invoice generation, rate/rule resolution, payment allocation, balance reconciliation, penalties, SOA running balances, import validation, and idempotent jobs. Detailed properties must be generated during Functional Design per PBT-01. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown uses standard headings, lists, tables, and code fences.
