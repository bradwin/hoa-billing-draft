# Application Services and Orchestration

## Service Layer Style

The backend shall expose REST controllers that call application services. Application services coordinate domain components inside explicit transaction boundaries for financial mutations. Asynchronous side effects such as email delivery, PDF generation, reminders, and batch output run through Job Orchestration where appropriate.

## Primary Services

### S-01 User Access Service

**Responsibilities**
- Invite users.
- Activate accounts.
- Authenticate sessions.
- Resolve role permissions.
- Enforce homeowner object ownership.

**Orchestrates**
- Identity and Access Control
- Audit
- Notification for invitations and password reset emails

### S-02 Homeowner Property Service

**Responsibilities**
- Manage homeowner and property records.
- Enforce property uniqueness.
- Manage ownership history.
- Process homeowner contact change requests.

**Orchestrates**
- Homeowner and Property
- Identity and Access Control
- Audit

### S-03 Billing Configuration Service

**Responsibilities**
- Manage billing settings, rate rules, due date rules, charge types, payment methods, numbering formats, and templates.
- Provide active configuration to financial services.

**Orchestrates**
- Billing Configuration
- Audit

### S-04 Billing Batch Service

**Responsibilities**
- Generate recurring draft invoice batches.
- Validate billable properties.
- Detect duplicate invoices.
- Produce billing exception reports.

**Orchestrates**
- Invoice
- Homeowner and Property
- Billing Configuration
- Account Balance
- Audit
- Reporting for exception output

### S-05 Invoice Issuance Service

**Responsibilities**
- Preview, issue, cancel, void, and reissue invoices.
- Assign immutable issued invoice numbers.
- Snapshot rates, lot area, rounding rules, and line items.
- Queue invoice PDF and email work.

**Orchestrates**
- Invoice
- Billing Configuration
- Account Balance
- Approval Workflow
- Document Generation
- Notification
- Audit

### S-06 Payment Proof Service

**Responsibilities**
- Accept homeowner payment proof uploads.
- Validate file ownership, type, and size.
- Keep proof records pending until verification.

**Orchestrates**
- Payment
- Storage
- Identity and Access Control
- Audit

### S-07 Payment Posting Service

**Responsibilities**
- Verify payment records.
- Post payments transactionally.
- Allocate payments.
- Create credits for overpayments.
- Generate receipts.
- Queue receipt PDFs and notifications.

**Orchestrates**
- Payment
- Invoice
- Account Balance
- Receipt
- Document Generation
- Notification
- Audit

**Transaction Boundary**
- Payment posting, allocations, credit creation, invoice status updates, receipt record creation, and audit entry creation must succeed or fail together.
- PDF and email work may be queued after the financial transaction commits.

### S-08 Financial Correction Service

**Responsibilities**
- Coordinate voids, reversals, waivers, write-offs, adjustments, and receipt cancellations.
- Ensure Treasurer approval before financial impact.
- Preserve original records.

**Orchestrates**
- Approval Workflow
- Invoice
- Payment
- Receipt
- Penalty and Delinquency
- Account Balance
- Audit

### S-09 Penalty and Delinquency Service

**Responsibilities**
- Detect overdue invoices.
- Classify aging buckets.
- Apply recurring non-compounding monthly penalties.
- Prevent duplicate penalty application.
- Queue reminder notifications.

**Orchestrates**
- Penalty and Delinquency
- Invoice
- Account Balance
- Billing Configuration
- Notification
- Audit

### S-10 Statement Service

**Responsibilities**
- Generate SOAs for homeowner/property/date range.
- Build opening balance, activity, running balance, and ending balance.
- Generate SOA PDFs.
- Queue SOA emails.

**Orchestrates**
- Statement of Account
- Account Balance
- Invoice
- Payment
- Receipt
- Penalty and Delinquency
- Document Generation
- Notification
- Audit

### S-11 Reporting Service

**Responsibilities**
- Produce dashboard metrics.
- Generate all required reports.
- Export report output to PDF, Excel, and CSV.
- Enforce report-level access and PII restrictions.

**Orchestrates**
- Reporting and Dashboard
- Account Balance
- Invoice
- Payment
- Receipt
- Penalty and Delinquency
- Statement of Account
- Homeowner and Property
- Audit
- Document Generation
- Storage

### S-12 Import Service

**Responsibilities**
- Upload, validate, preview, approve, and apply CSV imports.
- Produce exception reports.
- Apply approved imports through domain services.
- Import opening balances as auditable adjustments.

**Orchestrates**
- Import
- Storage
- Homeowner and Property
- Approval Workflow
- Account Balance
- Audit
- Reporting for exception output

### S-13 Notification Service

**Responsibilities**
- Render templates.
- Queue email sends.
- Retry failed sends.
- Track email logs.
- Support authorized resend.

**Orchestrates**
- Notification
- Billing Configuration
- Storage for attachments
- Audit

### S-14 Document Service

**Responsibilities**
- Generate invoice, receipt, SOA, and report documents from source snapshots.
- Persist generated files.
- Return document references to domain services.

**Orchestrates**
- Document Generation
- Storage
- Invoice
- Receipt
- Statement of Account
- Reporting and Dashboard

### S-15 Job Service

**Responsibilities**
- Schedule and run asynchronous or batch workflows.
- Track job status, failures, retries, and exception results.
- Ensure duplicate-safe execution.

**Orchestrates**
- Job Orchestration
- Billing Batch Service
- Penalty and Delinquency Service
- Notification Service
- Import Service
- Statement Service
- Reporting Service
- Audit

## Key Workflow Orchestrations

### Batch Recurring Billing

1. Billing Staff selects billing period.
2. Billing Batch Service validates billable properties through Homeowner and Property.
3. Billing Configuration resolves active rate and due date rules.
4. Invoice generates draft invoice snapshots.
5. Invalid properties and duplicate conflicts are written to an exception result.
6. Audit records the batch action.

### Invoice Issuance

1. Billing Staff reviews draft batch.
2. Invoice Issuance Service issues approved drafts inside a transaction.
3. Invoice numbers are assigned.
4. Account Balance derives updated balances.
5. Audit records issuance.
6. Document and email jobs are queued after commit.

### Payment Posting

1. Homeowner proof is pending and has no balance effect.
2. Billing Staff verifies the payment.
3. Payment Posting Service validates authorization and balance impact.
4. Payment, allocations, credit if any, invoice status updates, receipt record, and audit entry are committed together.
5. Receipt PDF and email are queued after commit.

### Penalty Processing

1. Job Service starts scheduled penalty run.
2. Penalty and Delinquency identifies overdue invoices.
3. Duplicate penalty periods are skipped.
4. Non-compounding recurring monthly penalties are recorded.
5. Audit and job result records are written.
6. Reminder candidates are passed to Notification.

### Statement Generation

1. User selects homeowner or property and date range.
2. Statement Service gathers activity from financial source records.
3. Running balance is computed.
4. SOA record or snapshot is created.
5. PDF generation and email delivery are optional follow-on operations.

### Import Application

1. CSV file is uploaded to Storage.
2. Import validates and stages rows.
3. User reviews import preview and exception report.
4. Approved rows are applied through domain services.
5. Opening balances become auditable adjustment entries.
6. Audit records import results.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Services preserve deny-by-default authorization, object-level checks, audit events, upload validation, and safe asynchronous side effects. |
| Property-Based Testing | N/A | Service orchestration identifies later PBT targets but does not define detailed properties; those are required during Functional Design. |

