# Application Components

## Architecture Style

The HOA Billing System shall use a TypeScript modular monolith:

- One Next.js frontend application with two logical portals.
- One NestJS backend API with strongly separated modules.
- One PostgreSQL database accessed through Prisma.
- One worker process sharing backend domain modules for scheduled and asynchronous jobs.
- Local filesystem storage through a storage abstraction.

The design intentionally keeps financial operations inside one backend and one database boundary so invoice, payment, credit, penalty, receipt, approval, and audit changes can be transactional.

## Component Catalog

### C-01 Web Frontend

**Purpose**: Provide the browser UI for operational users and homeowners.

**Responsibilities**
- Host two logical portals in one Next.js app:
  - Admin/Treasurer/Board operations.
  - Homeowner self-service.
- Render role-aware navigation and workflows.
- Submit authenticated API requests.
- Provide document downloads and upload forms.
- Use stable automation-friendly UI identifiers later during code generation.

**Interfaces**
- Calls Backend API REST endpoints.
- Receives authenticated session state from Identity and Access Control.
- Uploads payment proof/import files through Backend API.

### C-02 Backend API Shell

**Purpose**: Expose authenticated REST endpoints and command-style financial actions.

**Responsibilities**
- Provide resource-oriented controllers for domain records.
- Provide command endpoints for actions such as issue, post, reverse, approve, waive, generate, resend, import, and export.
- Apply request validation, authentication, authorization guards, and correlation IDs.
- Route calls to application services.

**Interfaces**
- Receives HTTP requests from Web Frontend.
- Calls domain components and orchestration services.
- Emits logs and audit context.

### C-03 Identity and Access Control

**Purpose**: Own authentication, sessions, role policy, MFA support, invitations, and central authorization helpers.

**Responsibilities**
- Manage users, fixed roles, invitations, account activation, password reset, and session lifecycle.
- Provide guards and policies for route-level authorization.
- Provide object-level authorization helpers for domain components.
- Support MFA for administrative accounts.
- Deny by default unless a route is explicitly public.

**Interfaces**
- Used by Backend API Shell and all protected domain components.
- Calls Audit for authentication, authorization, and role-management events.

### C-04 Homeowner and Property

**Purpose**: Own homeowner, property, ownership, billing-account identity, and contact change records.

**Responsibilities**
- Manage homeowner profiles.
- Manage property and lot records with duplicate prevention.
- Preserve ownership history.
- Maintain active billing-account references.
- Validate billable property prerequisites such as positive lot area.
- Manage homeowner contact change requests.

**Interfaces**
- Provides property and homeowner references to Billing, Invoice, Payment, Reporting, SOA, Import, and Portal workflows.
- Uses Identity and Access Control for owner visibility checks.
- Uses Audit for master data changes.

### C-05 Billing Configuration

**Purpose**: Own configurable billing rules and numbering settings.

**Responsibilities**
- Manage HOA profile, billing cycles, due date rules, grace periods, charge types, rate per sqm, effective dates, rounding rules, payment methods, and numbering formats.
- Resolve active rate by billing period start date.
- Provide invoice, receipt, and statement numbering rules.
- Provide template and payment instruction references.

**Interfaces**
- Used by Invoice, Penalty, Receipt, SOA, Reporting, Notification, and Job Orchestration.
- Uses Audit for configuration changes.

### C-06 Invoice

**Purpose**: Own invoice lifecycle from draft generation through issuance, cancellation, voiding, and reissue.

**Responsibilities**
- Generate draft recurring invoices.
- Create manual invoice drafts.
- Prevent duplicate invoices by property, charge type, and billing period.
- Snapshot lot area, rates, rounding rule, charge rule, due date, and line item amounts at issuance.
- Assign immutable invoice numbers on issuance.
- Maintain invoice status.
- Coordinate invoice PDF and email requests through Document Generation and Notification.

**Interfaces**
- Reads Billing Configuration and Homeowner and Property data.
- Publishes source records for Account Balance, Payment Allocation, SOA, Reporting, Document Generation, and Audit.
- Uses Approval Workflow for void, cancel, reissue, and override actions where required.

### C-07 Account Balance

**Purpose**: Derive billing-account balances from financial source records.

**Responsibilities**
- Calculate account balance, invoice balance, credits, outstanding amount, and aging totals from invoices, payments, allocations, penalties, credits, and adjustments.
- Provide balance snapshots for dashboards, portal views, SOAs, reports, and posting validations.
- Keep balance calculations ledger-style and derivable, avoiding mutable balance-only source of truth.

**Interfaces**
- Reads Invoice, Payment, Penalty, Credit, Adjustment, and Approval-approved records.
- Serves Invoice, Payment, SOA, Reporting, Dashboard, and Portal workflows.

### C-08 Payment

**Purpose**: Own payment proof intake, payment verification, payment posting, allocation, credits, and reversals.

**Responsibilities**
- Accept homeowner payment proofs as pending records.
- Verify and post payments.
- Allocate payments to oldest unpaid invoices by default, penalties and fees before dues.
- Support manual allocation with validation.
- Create property or billing-account specific credits for overpayments.
- Reverse posted payments with approval and audit trail.

**Interfaces**
- Reads Account Balance and Invoice data for allocation.
- Calls Receipt after successful posting.
- Uses Storage for proof attachments.
- Uses Approval Workflow for reversals and sensitive corrections.
- Uses Audit for all financial changes.

### C-09 Receipt

**Purpose**: Own official/provisional receipt records and receipt document generation.

**Responsibilities**
- Generate receipt records after verified payment posting.
- Assign receipt numbers from Billing Configuration.
- Preserve receipt reproducibility.
- Coordinate receipt PDF generation.
- Support receipt cancellation or reversal through Approval Workflow.

**Interfaces**
- Reads Payment, Allocation, and Billing Configuration data.
- Calls Document Generation and Storage.
- Publishes data to Reporting, SOA, Portal, and Audit.

### C-10 Penalty and Delinquency

**Purpose**: Own overdue detection, aging bucket classification, recurring penalties, waivers, and reminder levels.

**Responsibilities**
- Identify overdue invoices after due date plus grace period.
- Classify aging buckets.
- Apply recurring non-compounding monthly penalties.
- Prevent duplicate penalty application for the same invoice and penalty period.
- Manage penalty waiver requests through Approval Workflow.
- Provide reminder-level data to Notification and Reporting.

**Interfaces**
- Reads Invoice, Billing Configuration, Account Balance, and Payment status.
- Uses Approval Workflow for waivers.
- Uses Notification for overdue reminders.
- Uses Audit for penalty and waiver events.

### C-11 Statement of Account

**Purpose**: Generate homeowner or property statements with reconciled activity and running balances.

**Responsibilities**
- Build SOAs for a date range.
- Include opening balance, invoices, payments, adjustments, penalties, credits, running balance, total due, and aging summary.
- Coordinate SOA PDF generation and email delivery.
- Support batch SOA generation through Job Orchestration.

**Interfaces**
- Reads Account Balance, Invoice, Payment, Receipt, Penalty, Credit, Adjustment, and Homeowner and Property data.
- Calls Document Generation and Notification.
- Serves Portal, Reporting, and Dashboard workflows.

### C-12 Reporting and Dashboard

**Purpose**: Produce dashboards, required reports, and exports without owning source financial records.

**Responsibilities**
- Generate all Section 5.11 reports.
- Produce dashboard metrics.
- Support PDF, Excel, and CSV exports.
- Read normalized domain data through query services.
- Respect role permissions and PII constraints.

**Interfaces**
- Reads Account Balance, Invoice, Payment, Receipt, Penalty, SOA, Audit, Homeowner, Property, and Approval data.
- Calls Document Generation for PDF output.
- Calls Storage for generated export persistence when needed.

### C-13 Import

**Purpose**: Validate, stage, review, and apply CSV imports.

**Responsibilities**
- Parse homeowner, property, and opening balance CSV files.
- Validate required fields, duplicate properties, valid lot area, references, and amount formats.
- Produce import exception reports.
- Stage rows for review.
- Apply approved rows through domain services, not direct table writes.

**Interfaces**
- Uses Storage for uploaded import files.
- Calls Homeowner and Property services for master data.
- Calls Approval Workflow and financial adjustment services for opening balances.
- Uses Audit for import activity.

### C-14 Notification

**Purpose**: Own queued email delivery, templates, retries, and email logs.

**Responsibilities**
- Manage email templates and placeholders.
- Queue and send account activation, invoices, receipts, SOAs, reminders, penalties, and password reset emails.
- Track pending, sent, and failed delivery attempts.
- Support authorized resend.

**Interfaces**
- Reads templates and delivery settings from Billing Configuration/System Settings.
- Receives send requests from Invoice, Receipt, SOA, Penalty, Identity, and Job Orchestration.
- Uses Audit for resend and template changes.

### C-15 Document Generation

**Purpose**: Generate PDFs and export files from stable domain snapshots.

**Responsibilities**
- Generate invoice PDFs from issued invoice snapshots.
- Generate receipt PDFs from receipt/payment/allocation records.
- Generate SOA PDFs from SOA snapshots.
- Generate report exports for PDF, Excel, and CSV.
- Avoid mutating source financial records.

**Interfaces**
- Reads source data from Invoice, Receipt, SOA, and Reporting.
- Stores outputs through Storage.
- Provides document references to Portal and Notification.

### C-16 Storage

**Purpose**: Persist generated documents and uploaded files through a local filesystem abstraction.

**Responsibilities**
- Store PDFs, exports, payment proofs, import files, and attachments.
- Enforce file metadata, ownership, path safety, size, and type validation.
- Provide migration-friendly abstraction for future S3-compatible storage.

**Interfaces**
- Used by Payment, Import, Document Generation, Reporting, SOA, Receipt, Invoice, and Web Frontend upload/download flows.
- Uses Identity and Access Control for access checks at API boundary.

### C-17 Audit

**Purpose**: Provide append-only audit recording for financial, security, configuration, import, and system changes.

**Responsibilities**
- Record actor, timestamp, action, old value, new value, reason, and related record IDs where applicable.
- Provide audit query APIs for authorized users and reports.
- Prevent application-level editing or deletion of audit entries.

**Interfaces**
- Used by every domain component that mutates data.
- Read by Reporting and Dashboard for audit trail output.

### C-18 Approval Workflow

**Purpose**: Coordinate pending financial approval requests and Treasurer decisions.

**Responsibilities**
- Create approval requests for voids, reversals, waivers, write-offs, adjustments, and opening balance approval.
- Track pending, approved, and rejected decisions.
- Apply approved commands through domain services.
- Require reasons and audit every decision.

**Interfaces**
- Used by Invoice, Payment, Receipt, Penalty, Import, Account Balance, and Audit.
- Uses Identity and Access Control for Treasurer-only approval actions.

### C-19 Job Orchestration

**Purpose**: Schedule and execute background work through domain services.

**Responsibilities**
- Schedule recurring billing batches, penalty runs, reminder emails, email retries, imports, report exports, and batch SOAs.
- Ensure jobs are idempotent or duplicate-protected.
- Track job status, failures, retries, and exception summaries.

**Interfaces**
- Invokes Invoice, Penalty, Notification, Import, SOA, Reporting, Document Generation, Storage, Audit, and Account Balance services.

### C-20 Shared Kernel

**Purpose**: Provide common contracts and cross-cutting primitives without owning business workflows.

**Responsibilities**
- Define common value objects such as Money, DateRange, BillingPeriod, FileReference, Pagination, ActorContext, and AuditContext.
- Provide shared validation helpers and error result shapes.
- Provide transaction context interfaces.

**Interfaces**
- Used by all backend domain components.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Components isolate authentication, authorization, audit, storage, validation, and approval responsibilities. SECURITY-08 and SECURITY-11 are directly addressed at design level. Infrastructure-specific checks remain for later stages. |
| Property-Based Testing | N/A | This artifact identifies component boundaries. Detailed testable properties are required during Functional Design. |

