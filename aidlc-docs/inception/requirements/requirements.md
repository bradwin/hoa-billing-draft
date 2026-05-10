# HOA Billing System Requirements

## Intent Analysis Summary

- **User Request**: Use AI-DLC with `hoa_billing_system_initial_requirements.v1..md` as the source requirements document.
- **Request Type**: New greenfield software project.
- **Scope Estimate**: System-wide application covering admin, treasurer, board, billing staff, and homeowner workflows.
- **Complexity Estimate**: Complex. This is a financial billing system with invoices, receipts, payments, credits, penalties, adjustments, SOAs, audit logs, role-based access, email, PDFs, imports, and reports.
- **Requirements Depth**: Comprehensive. Ambiguous financial behavior is dangerous and must be explicit before implementation.
- **Workspace Type**: Greenfield. No application code or build system exists yet.

## Resolved Project Decisions

| Area | Requirement |
|---|---|
| Initial scope | Full first implementation of all in-scope capabilities from the source requirements, not only the suggested MVP. |
| Reports | Implement every report listed in Section 5.11 of the source requirements. |
| Stack | TypeScript stack: Next.js frontend, NestJS backend API, PostgreSQL, Prisma, SMTP email, server-side PDF generation, and worker queue. |
| Deployment | Local or single-server Docker deployment suitable for one HOA/subdivision. |
| Scale | Up to 1,000 properties for one HOA/subdivision. |
| Currency | Philippine peso only. |
| Tax handling | No automatic tax calculation. Tax, withholding-related, government-fee, or tax-like amounts are added manually as separate invoice line items with clear description, amount, and reason. |
| Accounting boundary | Accounts receivable subledger only; no full general ledger in the first implementation. |
| Security extension | Enabled. Security Baseline rules are blocking constraints. |
| PBT extension | Enabled. Property-Based Testing rules are blocking constraints. |

## Functional Requirements

### User, Role, and Access Management

- The system shall support the roles: System Administrator, HOA Treasurer, Billing Staff or HOA Admin, HOA Board Member, and Homeowner.
- The system shall use fixed roles with a documented permission matrix for the first implementation.
- The system shall enforce role-based access control server-side for every protected endpoint and user workflow.
- The system shall support invite-based homeowner account activation with email/password login and password reset.
- The system shall allow administrators to manage users, roles, HOA profile, templates, email settings, and exports.
- Homeowners shall only access their own accounts and properties.
- Admin accounts shall support MFA.

### Homeowner and Property Management

- The system shall maintain homeowner profiles with identity, contact, address, status, communication preference, notes, created date, and updated date.
- A homeowner may own one or more properties.
- A property shall have one primary homeowner responsible for billing.
- Properties may have secondary contacts or authorized representatives.
- The system shall preserve historical ownership records, including move-in and move-out dates.
- The system shall maintain property records with block, lot, house number, street, phase, lot area, property type, occupancy status, billing status, owner, history, references, and notes.
- The system shall prevent duplicate property records using block, lot, phase/section, and street uniqueness.
- A billable property must have valid lot area greater than zero before recurring dues can be generated.
- Homeowner contact updates from the portal shall be submitted as change requests and require admin approval before master records change.

### Billing Configuration

- Authorized users shall configure HOA profile, billing cycles, due date rules, grace periods, rate per sqm, effective dates, penalties, discounts, charge types, numbering formats, payment methods, rounding rules, templates, and basic system settings.
- Supported billing frequencies shall include monthly, quarterly, semi-annual, annual, and custom billing periods.
- Regular association dues shall be calculated as `Lot Area x Rate per sqm`.
- The active rate per sqm shall be selected by billing period start date.
- Generated invoice line items shall snapshot lot area, rate per sqm, rounding rule, charge rule, and computed amount so historical invoices do not mutate when configuration changes.
- Money shall use decimal arithmetic and be rounded half-up to centavos.
- Lot area and rates shall use configurable decimal precision.

### Invoice Management

- The system shall generate recurring invoices automatically based on billing schedules.
- The system shall support manual invoice creation with multiple invoice line items.
- The system shall generate draft invoices for preview before issuance.
- Draft invoices shall use internal IDs; issued invoices shall receive immutable sequential invoice numbers.
- Voided invoice numbers shall never be reused.
- The system shall prevent duplicate invoices for the same property, charge type, and billing period unless an authorized override is performed.
- The system shall generate invoice PDFs and support email delivery with attachments.
- Issued invoice edits shall be restricted and audited.
- Issued invoices may be cancelled, voided, or reissued only through controlled workflows with reason capture and audit logging.
- Invoice status shall include Draft, Issued, Partially Paid, Paid, Overdue, Cancelled, and Voided.

### Tax-Like Charges

- The system shall not automatically calculate tax on association dues, penalties, assessments, or other HOA charges.
- Authorized users may add tax, withholding-related, government-fee, or other tax-like amounts manually as separate invoice line items.
- Manual tax-like line items shall require clear description, amount, and reason.
- Manual tax-like line items shall be included in invoice totals, balances, payments, SOAs, exports, and audit logs.

### Payment Management

- The system shall record payments with receipt number, homeowner, property, payment date, posting date, method, reference, amount, applied invoices, unapplied amount, status, receiver, notes, and attachment/proof.
- Payment proof uploads shall create pending payment records only.
- Pending payment proofs shall not affect balances until verified by an admin or treasurer.
- Verified payments shall post immediately, reduce invoice balances, update account balances, and generate receipts.
- Partial payments shall reduce the outstanding balance, keep the invoice Partially Paid, and generate a receipt for the amount paid.
- Default payment allocation shall apply payments to the oldest unpaid invoice first.
- Within an invoice, payments shall apply to penalties and fees before dues.
- Manual payment allocation shall be supported for authorized users.
- Overpayments shall become property or billing-account specific credits.
- Posted payments shall not be deleted; corrections use reversal with reason and audit trail.

### Receipts

- Homeowner proof shall create a pending payment record.
- Verified posting shall generate an official or provisional receipt based on payment method and configured receipt rules.
- Receipt numbers shall follow configured numbering rules.
- Receipt records and PDFs shall be reproducible.
- Receipt cancellation or reversal shall require treasurer approval, reason capture, and audit logging.

### Penalties, Interest, and Delinquency

- The system shall identify overdue invoices after the due date plus configured grace period.
- Late penalties shall become eligible at the start of the day after due date plus grace period.
- The first implementation shall support recurring monthly penalties until paid.
- Penalties and interest shall not compound; penalties and interest are not themselves penalized.
- Authorized users may waive penalties, but waivers require treasurer approval, reason capture, and audit logging.
- The system shall classify aging buckets as Current, 1-30 days overdue, 31-60 days overdue, 61-90 days overdue, and Over 90 days overdue.
- The system shall support reminder levels: Friendly Reminder, First Overdue Notice, Final Notice, Board Escalation, and Legal Endorsement as a future phase marker.

### Statement of Account

- The system shall generate statements of account by homeowner or property.
- SOAs shall include opening balance, invoice history, payment history, adjustments, penalties, credits, running balance, total due, aging summary, statement date, and statement period.
- SOAs shall support date range filters.
- SOAs shall clearly show unpaid, partially paid, paid, and overdue invoices.
- SOAs shall be downloadable as PDF and emailable to homeowners.

### Email Notifications

- The system shall send welcome/account activation, invoice issued, payment received, receipt, due date reminder, overdue reminder, SOA, penalty notice, and password reset emails.
- Email delivery shall use SMTP with queued sends, retry handling, and delivery logs.
- Email templates shall support placeholders for homeowner, invoice number, amount due, due date, and payment instructions.
- Admin users shall be able to resend failed or pending emails.
- Email logs shall track sent, failed, and pending statuses.

### Homeowner Portal

- Homeowners shall log in securely.
- Homeowners shall view property details, balances, invoices, payments, receipts, SOAs, and payment instructions.
- Homeowners shall download invoices, receipts, and SOAs.
- Homeowners shall submit payment proof uploads.
- Homeowners with multiple properties shall switch between their own properties.
- Homeowner-submitted payment proofs shall remain pending until verified.
- Homeowners shall submit contact change requests for admin approval.

### Admin Dashboard

- The dashboard shall show total billable properties, total homeowners, total billed amount, total collected amount, outstanding balance, collection rate, overdue accounts, aging buckets, recent payments, invoices due soon, failed email deliveries, and pending payment verifications.

### Reports and Exports

- The system shall implement every report listed in the source requirements:
  - Billing summary report
  - Collection report
  - Aging receivables report
  - Delinquent homeowners report
  - Invoice register
  - Payment register
  - Receipt register
  - Adjustment report
  - Penalty report
  - Homeowner master list
  - Property master list
  - Statement of account batch report
  - Monthly collection summary
  - Year-to-date billing and collection report
  - Audit trail report
- Reports shall support PDF, Excel, and CSV export as applicable.

### Data Import and Opening Balances

- The system shall support CSV import for homeowners, properties, and opening balances.
- Opening balances shall be imported as auditable adjustment entries per billing account.
- Imports shall validate required fields, duplicate properties, valid lot area, valid references, and amount formats.
- Imports shall produce exception reports for rejected rows.

### File Storage

- Generated PDFs and uploaded attachments shall be stored on the local filesystem for the first implementation.
- The storage implementation shall use an abstraction that can migrate later to S3-compatible object storage.
- Uploads shall be validated for file type, size, and association to authorized records.

### Audit Logging

- All financial changes shall be auditable with actor, timestamp, old value, new value, reason, and related record IDs where applicable.
- Voids, reversals, waivers, write-offs, and financial adjustments shall require treasurer approval.
- Audit logs and financial records shall be retained indefinitely.
- Application users shall not be able to physically delete posted financial records through the application.

## Non-Functional Requirements

### Security

- Security Baseline rules are blocking constraints for all relevant stages.
- Authentication shall use adaptive password hashing and secure session handling.
- Admin accounts shall support MFA.
- All protected endpoints shall require authentication and server-side authorization.
- Object-level authorization shall prevent homeowners from accessing other homeowners' records.
- CORS shall be restricted to explicitly allowed origins.
- All API inputs shall use schema validation with type, length, format, and size constraints.
- Sensitive data, tokens, passwords, and PII shall not be logged.
- Production error responses shall not expose stack traces, framework details, internal paths, or database details.

### Data Integrity and Financial Correctness

- Financial calculations shall use decimal arithmetic, not floating-point arithmetic.
- Invoice generation, payment posting, receipt generation, credit creation, reversal, adjustment, penalty calculation, and SOA generation shall be transactional.
- Failed email sending shall not corrupt or roll back valid billing transactions.
- Historical issued invoices shall be reproducible from stored snapshots.
- Account balances shall reconcile from invoices, payments, credits, penalties, and adjustments.

### Reliability

- Background jobs for billing, reminders, email, and penalty processing shall be idempotent or protected against duplicate execution.
- Batch billing shall produce exception reports rather than silently skipping invalid records.
- Failed batch steps shall be recoverable without duplicating financial records.

### Performance

- The system shall support up to 1,000 properties for one HOA/subdivision.
- Dashboard, list, report, invoice, SOA, and search pages shall support filtering and pagination where needed.
- Batch billing and report generation shall be designed for hundreds to 1,000 properties without manual spreadsheet processing.

### Usability and Accessibility

- Admin screens shall support search, filters, sorting, and clear status labels.
- Homeowner portal pages shall be mobile-friendly.
- Financial screens shall clearly distinguish Draft, Issued, Paid, Partially Paid, Overdue, Voided, Pending, Posted, Reversed, and Cancelled states.
- Common workflows shall minimize re-entry of data and make review steps explicit before issuance or posting.

### Maintainability

- Billing, payment allocation, penalty, credit, SOA, receipt, and audit logic shall be isolated from UI code.
- The system shall use modular architecture and explicit service boundaries.
- Business rules shall be centralized and tested.
- TypeScript types and Prisma schema shall be treated as core contracts.

### Testing

- Property-Based Testing rules are blocking constraints for applicable units.
- `fast-check` shall be used for TypeScript property-based tests.
- Billing, payment allocation, penalty calculation, credits, reversals, SOA balances, invoice snapshots, and imports shall have example-based tests and property-based tests where applicable.
- Critical business paths shall not rely only on PBT; concrete example tests shall document expected business behavior.

## Business Rule Requirements

- A property must have a unique block, lot, phase/section, and street combination.
- Each billable property must have one primary homeowner.
- A homeowner may own multiple properties; each property may generate separate charges.
- Duplicate invoices for the same property, charge type, and billing period are prohibited unless explicitly overridden by an authorized user.
- Billable properties with missing, zero, or invalid lot area shall be excluded from recurring dues billing and listed in a billing exception report.
- Rate changes shall apply by billing period start date and shall not automatically recalculate issued invoices.
- Payment allocations shall default to oldest unpaid invoice first, applying penalties and fees before dues within each invoice.
- Overpayments shall be recorded as property or billing-account specific credits.
- Issued invoices and posted payments shall not be deleted.
- SOAs shall reflect all invoices, payments, penalties, credits, and adjustments in the selected period.
- All financial modifications shall require audit logging and, for voids, reversals, waivers, write-offs, and adjustments, treasurer approval.

## Acceptance Criteria

- Authorized users can configure HOA billing settings, rates, due date rules, penalties, charge types, numbering formats, templates, and payment methods.
- Admin users can import homeowners, properties, and opening balances with validation and exception reporting.
- Admin users can generate draft recurring invoices using lot area and active rate per sqm, review them, issue them, email them, and generate PDFs.
- The system prevents duplicate invoices unless an authorized override is performed and audited.
- Homeowner proof uploads create pending payments and do not change balances before verification.
- Verified payments post transactionally, allocate by configured rules, update invoice/account balances, and generate receipts.
- Partial payments, overpayments, credits, payment reversals, penalty waivers, and adjustments all produce correct balances and audit records.
- Recurring monthly penalties are applied after due date plus grace period and do not compound.
- Homeowners can securely view only their own account, invoices, payments, receipts, SOAs, and payment instructions.
- Admin, treasurer, billing staff, board, and homeowner access differs according to the documented permission matrix.
- Every Section 5.11 report is available and exportable as PDF, Excel, or CSV where applicable.
- Security Baseline and Property-Based Testing extension requirements are satisfied before relevant stages are considered complete.

## Explicit Out of Scope

- Full general ledger.
- Payroll.
- Inventory management.
- Vendor procurement.
- Advanced mobile app.
- SMS notifications.
- Bank API integration.
- Payment gateway integration.
- Legal case management for delinquent accounts.
- Accounting software integration.

## Open Issues

No unresolved requirements blockers remain after the initial verification and clarification rounds. Future stages may still ask design, story, unit decomposition, infrastructure, and implementation questions as required by AI-DLC.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant for Requirements Analysis | Enabled and captured as blocking constraints for design, implementation, infrastructure, and test stages. No code or infrastructure has been generated yet, so implementation-specific checks are not applicable at this stage. |
| Property-Based Testing | Compliant for Requirements Analysis | Enabled and captured as blocking constraints. PBT framework requirement is specified as `fast-check`; detailed property identification occurs during Functional Design as required by PBT-01. |

