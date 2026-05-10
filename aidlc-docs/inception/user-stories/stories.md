# HOA Billing System User Stories

## Story Organization

Stories are grouped by business domain with journey-oriented acceptance criteria. Financial and security-sensitive stories use Given/When/Then criteria. Simpler administrative stories use concise acceptance bullets.

## Persona References

- P-01: System Administrator
- P-02: HOA Treasurer
- P-03: Billing Staff or HOA Admin
- P-04: HOA Board Member
- P-05: Homeowner

## Epic E01: Access, Roles, and System Setup

### US-001: Invite and activate users

As a System Administrator, I want to invite users and assign fixed roles so that each person can access only the correct system functions.

**Personas**: P-01, P-02, P-03, P-04, P-05

**Acceptance Criteria**
- Given a System Administrator creates a user invitation, when the recipient activates the account, then the account is bound to the assigned role.
- Given a user signs in, when the session is created, then protected endpoints enforce server-side role checks.
- Given a homeowner signs in, when they request records, then only their own accounts and properties are visible.
- Given an admin account is configured, then MFA is supported for administrative access.
- Business rules needing tests later: role enforcement, homeowner object-level isolation, expired invitation handling.

**Traceability**: User, Role, and Access Management; Security

### US-002: Manage HOA and system settings

As a System Administrator, I want to configure HOA profile, templates, numbering formats, email settings, storage settings, and payment methods so that billing operations can run consistently.

**Personas**: P-01

**Acceptance Criteria**
- Admin can create and update HOA profile details.
- Admin can configure invoice, receipt, and statement numbering formats.
- Admin can configure SMTP settings and email templates.
- Admin can configure local file storage settings through the storage abstraction.
- All setting changes are audited with actor, timestamp, old value, and new value.

**Traceability**: Billing Configuration; Email Notifications; File Storage; Audit Logging

### US-003: Enforce permission matrix

As a Treasurer, I want fixed permissions enforced consistently so that operational users cannot perform unauthorized financial actions.

**Personas**: P-01, P-02, P-03, P-04, P-05

**Acceptance Criteria**
- Given Billing Staff attempts to approve a waiver, reversal, void, write-off, or adjustment, when they lack Treasurer authority, then the system denies the action.
- Given a Board Member opens financial dashboards, when they have read-only access, then no mutation controls are available.
- Given a homeowner requests another homeowner's invoice, then the system denies access and logs the authorization failure.
- Business rules needing tests later: route-level authorization, object-level authorization, approval-only actions.

**Traceability**: User, Role, and Access Management; Audit Logging; Security

## Epic E02: Homeowner, Property, and Ownership Management

### US-004: Manage homeowner records

As Billing Staff, I want to create and update homeowner profiles so that billing and communication data stays accurate.

**Personas**: P-03

**Acceptance Criteria**
- Staff can create homeowner records with required identity, contact, address, status, communication preference, and notes.
- Staff can search homeowners by name, email, mobile number, property, or status.
- Staff can deactivate or update homeowner status without deleting historical records.
- All changes are audited.

**Traceability**: Homeowner and Property Management; Audit Logging

### US-005: Manage property records and uniqueness

As Billing Staff, I want to manage properties with unique block, lot, phase, and street values so that duplicate billing records are prevented.

**Personas**: P-03

**Acceptance Criteria**
- Given a property is created, when block, lot, phase, and street duplicate an existing property, then the system rejects the duplicate.
- Given a property is billable, when lot area is missing, zero, or invalid, then recurring dues generation excludes it and lists it in a billing exception report.
- Property records include billing status, occupancy status, property type, lot area, current owner, and notes.
- Business rules needing tests later: duplicate detection, lot area validation, billable status handling.

**Traceability**: Homeowner and Property Management; Business Rule Requirements

### US-006: Preserve ownership history

As Billing Staff, I want to record ownership changes with effective dates so that historical billing responsibility is traceable.

**Personas**: P-03, P-02

**Acceptance Criteria**
- Staff can assign a primary homeowner to a property.
- Staff can record move-in and move-out dates.
- The system preserves previous owner history.
- Each billable property has exactly one active primary homeowner.
- Ownership changes are audited.

**Traceability**: Homeowner and Property Management; Audit Logging

### US-007: Approve homeowner contact change requests

As Billing Staff, I want to review homeowner-submitted contact updates before changing master records so that contact data remains controlled.

**Personas**: P-03, P-05

**Acceptance Criteria**
- Given a homeowner submits a contact change, when it is pending, then master contact details remain unchanged.
- Given staff approves the change, then the homeowner profile updates and the decision is audited.
- Given staff rejects the change, then the homeowner can see the request status without master data changing.
- Homeowners can only submit changes for their own profile.

**Traceability**: Homeowner Portal; Homeowner and Property Management; Security

## Epic E03: Billing Configuration and Charge Rules

### US-008: Configure dues rate and billing cycles

As Billing Staff, I want to configure billing cycles and rate per sqm effective dates so that recurring dues use the correct rate for each billing period.

**Personas**: P-03, P-02

**Acceptance Criteria**
- Given a rate changes, when recurring dues are generated for a billing period, then the active rate is selected by billing period start date.
- Given an invoice is issued, then lot area, rate, rounding rule, charge rule, and computed amount are snapshotted on the invoice line item.
- Given a rate changes after issuance, then existing issued invoices are not recalculated automatically.
- Business rules needing tests later: rate effective date selection, invoice snapshot immutability, decimal rounding.

**Traceability**: Billing Configuration; Data Integrity and Financial Correctness

### US-009: Configure due dates and grace periods

As Billing Staff, I want due date rules and grace periods to be configurable so that late penalties begin at the correct time.

**Personas**: P-03, P-02

**Acceptance Criteria**
- Staff can configure a fixed due day for the billing period or next month.
- Given due date plus grace period has passed, then penalties become eligible at the start of the next day.
- Due dates are stored on invoices when generated.
- Changes to future due date rules do not mutate issued invoices.

**Traceability**: Billing Configuration; Penalties, Interest, and Delinquency

### US-010: Configure charge types and manual tax-like charges

As Billing Staff, I want charge types to include manual tax-like line items so that non-standard charges can be billed without automatic tax calculation.

**Personas**: P-03, P-02

**Acceptance Criteria**
- Staff can configure charge types for dues, assessments, penalties, fees, adjustments, and manual tax-like amounts.
- Given a tax-like charge is added manually, then the line item requires description, amount, and reason.
- Manual tax-like line items are included in totals, balances, SOAs, reports, exports, and audit logs.
- The system does not automatically calculate tax on dues, penalties, assessments, or other charges.

**Traceability**: Tax-Like Charges; Invoice Management; Audit Logging

## Epic E04: Invoice Generation and Issuance

### US-011: Generate draft recurring invoices

As Billing Staff, I want to generate draft invoices for a billing period so that dues can be reviewed before issuance.

**Personas**: P-03

**Acceptance Criteria**
- Given a billing period is selected, when draft generation runs, then billable properties with valid lot area are included.
- Given a billable property has invalid lot area, then no invoice is generated for it and it appears in the exception report.
- Given an invoice already exists for the same property, charge type, and billing period, then duplicate generation is blocked unless authorized override is used.
- Draft invoices use internal IDs and do not consume issued invoice numbers.
- Business rules needing tests later: duplicate prevention, lot area calculation, exception reporting.

**Traceability**: Invoice Management; Billing Configuration; Business Rule Requirements

### US-012: Review and issue invoices

As Billing Staff, I want to review draft invoices before issuing them so that billing mistakes are caught before homeowners are notified.

**Personas**: P-03

**Acceptance Criteria**
- Given draft invoices exist, when staff reviews the batch, then totals, line items, due dates, and exceptions are visible.
- Given staff issues approved drafts, then immutable invoice numbers are assigned sequentially.
- Given invoices are issued, then account balances are updated and invoice PDFs can be generated.
- Given issued invoices need correction, then staff must use controlled cancel, void, or reissue workflows with reason and audit logging.

**Traceability**: Invoice Management; Audit Logging

### US-013: Create manual invoices

As Billing Staff, I want to create manual invoices with multiple line items so that approved non-recurring charges can be billed.

**Personas**: P-03

**Acceptance Criteria**
- Staff can create manual draft invoices with charge types, descriptions, amounts, due dates, and property/account references.
- Manual tax-like charges require clear description, amount, and reason.
- Issuing a manual invoice follows the same numbering, balance update, PDF, email, and audit behavior as recurring invoices.
- Unauthorized users cannot create or issue manual invoices.

**Traceability**: Invoice Management; Tax-Like Charges; Security

### US-014: Generate and send invoice PDFs

As Billing Staff, I want issued invoices to be downloadable and emailable as PDFs so that homeowners receive formal billing documents.

**Personas**: P-03, P-05

**Acceptance Criteria**
- Given an invoice is issued, when PDF generation is requested, then the PDF reflects stored invoice snapshots.
- Given email sending fails, then the invoice remains issued and the email log records failure.
- Given staff resends an invoice email, then the attempt is logged.
- Homeowners can download only their own invoice PDFs.

**Traceability**: Invoice Management; Email Notifications; File Storage; Security

## Epic E05: Payments, Proofs, Receipts, and Credits

### US-015: Submit homeowner payment proof

As a Homeowner, I want to upload payment proof so that staff can verify my payment.

**Personas**: P-05, P-03

**Acceptance Criteria**
- Given a homeowner uploads payment proof, then a pending payment record is created.
- Pending proof does not reduce invoice or account balances.
- Uploads validate file type, size, and ownership of the target account.
- Homeowners can view the status of their own submitted proofs.

**Traceability**: Payment Management; Homeowner Portal; File Storage; Security

### US-016: Verify and post payments

As Billing Staff, I want to verify payment details and post valid payments so that balances and receipts update correctly.

**Personas**: P-03, P-02

**Acceptance Criteria**
- Given a pending proof is verified, when payment is posted, then invoice balances and account balances update transactionally.
- Given payment amount is less than invoice balance, then the invoice remains Partially Paid and a receipt is generated for the paid amount.
- Given payment exceeds selected invoice balances, then the excess becomes a property or billing-account specific credit.
- Given posting fails, then no partial financial state is committed.
- Business rules needing tests later: transactional posting, partial payment, overpayment credit creation, balance reconciliation.

**Traceability**: Payment Management; Receipts; Data Integrity and Financial Correctness

### US-017: Allocate payments automatically and manually

As Billing Staff, I want payments allocated by default rules with manual override so that collections can be applied correctly.

**Personas**: P-03, P-02

**Acceptance Criteria**
- Given a payment is posted without manual allocation, then it applies to oldest unpaid invoices first.
- Within an invoice, allocations apply to penalties and fees before dues.
- Given staff manually allocates payment, then allocation cannot exceed payment amount or invoice balance.
- Allocation details are visible on invoices, payments, receipts, SOAs, and reports.
- Business rules needing property-based tests later: allocation totals equal payment amount, balances never become inconsistent, allocations do not exceed open balances.

**Traceability**: Payment Management; Testing; Data Integrity and Financial Correctness

### US-018: Generate official or provisional receipts

As Billing Staff, I want verified payments to generate receipts based on configured receipt rules so that payment documentation is reproducible.

**Personas**: P-03, P-05, P-02

**Acceptance Criteria**
- Given a payment is posted, then a receipt number is assigned according to configured rules.
- Receipt PDFs are reproducible from stored payment, allocation, and receipt records.
- Homeowners can download only their own receipts.
- Receipt cancellation or reversal requires Treasurer approval and reason capture.

**Traceability**: Receipts; Payment Management; Audit Logging; Security

### US-019: Reverse posted payments

As a Treasurer, I want to reverse posted payments with reasons so that corrections preserve the audit trail.

**Personas**: P-02, P-03

**Acceptance Criteria**
- Given a posted payment must be corrected, when Treasurer approves reversal, then the reversal records reason, actor, timestamp, and affected balances.
- The original posted payment remains visible and is not deleted.
- Invoice, credit, receipt, and account balances reflect the reversal transactionally.
- Unauthorized users cannot approve reversals.

**Traceability**: Payment Management; Receipts; Audit Logging; Security

## Epic E06: Penalties, Waivers, Delinquency, and Reminders

### US-020: Detect overdue invoices and aging buckets

As Billing Staff, I want overdue invoices classified by aging bucket so that delinquency can be monitored.

**Personas**: P-03, P-02, P-04

**Acceptance Criteria**
- Given an invoice is unpaid after due date plus grace period, then it becomes overdue.
- Aging buckets classify invoices as Current, 1-30, 31-60, 61-90, or Over 90 days overdue.
- Aging status appears in dashboards, SOAs, and reports.
- Homeowners can see overdue status for their own invoices.

**Traceability**: Penalties, Interest, and Delinquency; Reports and Exports

### US-021: Apply recurring monthly penalties

As Billing Staff, I want eligible overdue invoices to receive recurring monthly penalties so that late balances are assessed consistently.

**Personas**: P-03, P-02

**Acceptance Criteria**
- Given an invoice is overdue after grace period, when monthly penalty processing runs, then the configured recurring penalty is applied.
- Penalties do not compound; penalties and interest are not themselves penalized.
- Penalty line items are visible on invoices, SOAs, reports, and audit logs.
- Duplicate penalty application for the same invoice and penalty period is prevented.
- Business rules needing tests later: penalty eligibility date, non-compounding behavior, duplicate prevention.

**Traceability**: Penalties, Interest, and Delinquency; Data Integrity and Financial Correctness

### US-022: Waive penalties with Treasurer approval

As a Treasurer, I want to approve penalty waivers with reason capture so that exceptions are controlled and auditable.

**Personas**: P-02, P-03

**Acceptance Criteria**
- Given staff requests a penalty waiver, when Treasurer approves it, then the waiver adjusts balance and records reason, actor, and timestamp.
- Given Treasurer rejects the waiver, then balances remain unchanged.
- The original penalty remains traceable.
- Unauthorized users cannot approve waivers.

**Traceability**: Penalties, Interest, and Delinquency; Audit Logging; Security

### US-023: Send overdue reminders

As Billing Staff, I want overdue reminders sent by level so that collections follow the HOA escalation process.

**Personas**: P-03, P-05, P-02

**Acceptance Criteria**
- Given an invoice reaches a reminder level, when reminders are sent, then the configured email template is used.
- Reminder attempts are logged as sent, failed, or pending.
- Failed email delivery does not change financial balances.
- Homeowners receive reminders only for their own accounts.

**Traceability**: Email Notifications; Penalties, Interest, and Delinquency

## Epic E07: Statements of Account

### US-024: Generate homeowner or property SOA

As Billing Staff, I want to generate SOAs by homeowner or property and date range so that account activity is clear.

**Personas**: P-03, P-02, P-05

**Acceptance Criteria**
- Given a date range is selected, when SOA is generated, then opening balance, invoices, payments, penalties, credits, adjustments, running balance, and ending balance are shown.
- SOA includes unpaid, partially paid, paid, and overdue invoices.
- SOA balances reconcile with underlying financial records.
- Homeowners can generate SOAs only for their own accounts.
- Business rules needing property-based tests later: running balance reconciliation, opening plus activity equals ending balance.

**Traceability**: Statement of Account; Data Integrity and Financial Correctness; Security

### US-025: Download and email SOA PDFs

As a Homeowner, I want to download or receive my SOA as a PDF so that I can keep payment records.

**Personas**: P-05, P-03

**Acceptance Criteria**
- Homeowners can download only their own SOA PDFs.
- Staff can email SOAs to homeowners using configured templates.
- Email delivery attempts are logged.
- Generated PDFs reflect the selected period and stored financial records.

**Traceability**: Statement of Account; Email Notifications; File Storage

## Epic E08: Reports, Dashboards, and Exports

### US-026: View operational dashboard

As Billing Staff, I want dashboard metrics so that I can monitor daily billing and collection status.

**Personas**: P-03, P-02, P-04

**Acceptance Criteria**
- Dashboard shows billable properties, homeowners, billed amount, collected amount, outstanding balance, collection rate, overdue accounts, aging buckets, recent payments, due soon invoices, failed emails, and pending payment verifications.
- Board Members see dashboard information without mutation controls.
- Dashboard data respects role permissions.

**Traceability**: Admin Dashboard; Reports and Exports; Security

### US-027: Generate billing summary report

As a Treasurer, I want a billing summary report so that total billed amounts can be reviewed by period.

**Personas**: P-02, P-04

**Acceptance Criteria**
- Report supports date and billing period filters.
- Report totals reconcile with issued invoices and manual invoice line items.
- Report exports to PDF, Excel, and CSV where applicable.
- Access is limited to authorized roles.

**Traceability**: Reports and Exports

### US-028: Generate collection report

As a Treasurer, I want a collection report so that received payments can be reviewed.

**Personas**: P-02, P-04

**Acceptance Criteria**
- Report includes posted payments, payment methods, dates, references, allocations, and receipts.
- Pending payment proofs are distinguishable from posted payments.
- Reversed payments are visible and not deleted.
- Report exports to PDF, Excel, and CSV where applicable.

**Traceability**: Reports and Exports; Payment Management

### US-029: Generate aging receivables report

As a Treasurer, I want aging receivables so that overdue balances are visible by bucket.

**Personas**: P-02, P-04

**Acceptance Criteria**
- Report classifies receivables into Current, 1-30, 31-60, 61-90, and Over 90 day buckets.
- Totals reconcile with unpaid invoice balances, credits, penalties, and adjustments.
- Report exports to PDF, Excel, and CSV where applicable.

**Traceability**: Reports and Exports; Penalties, Interest, and Delinquency

### US-030: Generate delinquent homeowners report

As a Board Member, I want a delinquency report so that board escalation can be reviewed.

**Personas**: P-04, P-02

**Acceptance Criteria**
- Report lists delinquent accounts by homeowner, property, overdue amount, aging bucket, and reminder level.
- Access is read-only for Board Members.
- Report exports to PDF, Excel, and CSV where applicable.

**Traceability**: Reports and Exports; Security

### US-031: Generate invoice register

As Billing Staff, I want an invoice register so that issued, draft, voided, and cancelled invoices can be audited.

**Personas**: P-03, P-02

**Acceptance Criteria**
- Register includes invoice number, homeowner, property, billing period, status, totals, amount paid, and balance.
- Voided and cancelled invoices remain visible.
- Register exports to PDF, Excel, and CSV where applicable.

**Traceability**: Reports and Exports; Invoice Management

### US-032: Generate payment register

As Billing Staff, I want a payment register so that payment activity can be reconciled.

**Personas**: P-03, P-02

**Acceptance Criteria**
- Register includes payment date, posting date, method, reference, amount, status, received by, and allocations.
- Pending, posted, reversed, cancelled, failed states are distinguishable.
- Register exports to PDF, Excel, and CSV where applicable.

**Traceability**: Reports and Exports; Payment Management

### US-033: Generate receipt register

As a Treasurer, I want a receipt register so that receipt numbers and payment documentation can be controlled.

**Personas**: P-02, P-03

**Acceptance Criteria**
- Register lists receipt numbers, payment references, receipt type, amount, status, and reversal/cancellation state.
- Voided or reversed receipt references remain visible and numbers are not reused.
- Register exports to PDF, Excel, and CSV where applicable.

**Traceability**: Reports and Exports; Receipts

### US-034: Generate adjustment report

As a Treasurer, I want an adjustment report so that opening balances, credits, write-offs, and corrections can be reviewed.

**Personas**: P-02

**Acceptance Criteria**
- Report includes adjustment type, amount, account, reason, requester, approver, and timestamp.
- Only approved financial adjustments affect balances.
- Report exports to PDF, Excel, and CSV where applicable.

**Traceability**: Reports and Exports; Audit Logging

### US-035: Generate penalty report

As a Treasurer, I want a penalty report so that assessed and waived penalties can be reviewed.

**Personas**: P-02, P-04

**Acceptance Criteria**
- Report shows assessed penalties, waiver status, related invoices, periods, and amounts.
- Waivers include reason and approver.
- Report exports to PDF, Excel, and CSV where applicable.

**Traceability**: Reports and Exports; Penalties, Interest, and Delinquency

### US-036: Generate homeowner master list

As Billing Staff, I want a homeowner master list so that contact and status data can be reviewed.

**Personas**: P-03, P-02

**Acceptance Criteria**
- Report includes homeowner identity, contact details, status, communication preference, and associated properties.
- Access is limited to authorized roles because it includes PII.
- Report exports to PDF, Excel, and CSV where applicable.

**Traceability**: Reports and Exports; Security

### US-037: Generate property master list

As Billing Staff, I want a property master list so that subdivision records can be reviewed.

**Personas**: P-03, P-02

**Acceptance Criteria**
- Report includes block, lot, phase, street, lot area, type, occupancy status, billing status, and owner.
- Duplicate-sensitive fields are visible for review.
- Report exports to PDF, Excel, and CSV where applicable.

**Traceability**: Reports and Exports; Homeowner and Property Management

### US-038: Generate statement of account batch report

As Billing Staff, I want batch SOA generation so that statements can be produced for many accounts.

**Personas**: P-03, P-02

**Acceptance Criteria**
- Staff can select account filters and statement period.
- Batch output lists generated, skipped, and failed SOAs.
- Failed accounts produce exception details without stopping all valid SOAs.
- Batch output is exportable or downloadable as configured.

**Traceability**: Reports and Exports; Statement of Account

### US-039: Generate monthly collection summary

As a Treasurer, I want a monthly collection summary so that monthly performance can be reviewed.

**Personas**: P-02, P-04

**Acceptance Criteria**
- Report summarizes billed, collected, outstanding, and collection rate by month.
- Totals reconcile with invoices and posted payments.
- Report exports to PDF, Excel, and CSV where applicable.

**Traceability**: Reports and Exports

### US-040: Generate year-to-date billing and collection report

As a Board Member, I want year-to-date billing and collection results so that annual performance can be monitored.

**Personas**: P-04, P-02

**Acceptance Criteria**
- Report shows year-to-date billed, collected, outstanding, and collection rate.
- Filters support current fiscal or calendar year.
- Report exports to PDF, Excel, and CSV where applicable.

**Traceability**: Reports and Exports

### US-041: Generate audit trail report

As a Treasurer, I want an audit trail report so that financial and system changes can be inspected.

**Personas**: P-02, P-01

**Acceptance Criteria**
- Report includes actor, timestamp, action, old value, new value, reason, and related record IDs where applicable.
- Report supports filters by actor, date range, action type, and record type.
- Audit records cannot be edited or deleted through the application.
- Report exports to PDF, Excel, and CSV where applicable.

**Traceability**: Reports and Exports; Audit Logging; Security

## Epic E09: Imports and Opening Balances

### US-042: Import homeowners and properties

As Billing Staff, I want to import homeowners and properties from CSV so that the HOA can migrate from spreadsheets.

**Personas**: P-03, P-01

**Acceptance Criteria**
- Given a CSV is uploaded, when validation runs, then required fields, duplicate properties, valid lot area, and valid references are checked.
- Valid rows can be imported after review.
- Invalid rows are rejected into an exception report with reasons.
- Import activity is audited.

**Traceability**: Data Import and Opening Balances; Homeowner and Property Management

### US-043: Import opening balances as adjustments

As a Treasurer, I want opening balances imported as auditable adjustments so that starting receivables are traceable.

**Personas**: P-02, P-03

**Acceptance Criteria**
- Opening balances are imported as adjustment entries per billing account.
- Opening balance imports require review and approval before affecting balances.
- The system does not use a mutable starting balance field.
- Exception rows are reported and not partially applied.

**Traceability**: Data Import and Opening Balances; Audit Logging; Data Integrity and Financial Correctness

## Epic E10: Audit, Approvals, and Financial Corrections

### US-044: Approve financial adjustments

As a Treasurer, I want to approve adjustments, write-offs, voids, reversals, and waivers so that sensitive financial changes are controlled.

**Personas**: P-02, P-03

**Acceptance Criteria**
- Given staff submits a sensitive financial change, then it remains pending until Treasurer approval.
- Given Treasurer approves, then the change applies transactionally and records reason, actor, timestamp, old value, and new value where applicable.
- Given Treasurer rejects, then no financial balance changes.
- Unauthorized users cannot approve or bypass approval.

**Traceability**: Audit Logging; Security; Data Integrity and Financial Correctness

### US-045: Preserve immutable financial history

As a Treasurer, I want posted financial records preserved so that the HOA can audit corrections without losing original history.

**Personas**: P-02, P-01

**Acceptance Criteria**
- Issued invoices, posted payments, receipts, penalties, credits, and adjustments cannot be physically deleted through the application.
- Corrections are represented by voids, reversals, waivers, adjustments, or reissues.
- The audit trail links corrective actions to original records.
- Reports can include or filter corrected records without hiding them.

**Traceability**: Audit Logging; Invoice Management; Payment Management; Receipts

## Epic E11: Homeowner Portal

### US-046: View homeowner account overview

As a Homeowner, I want to view my account overview so that I understand what I owe and what is pending.

**Personas**: P-05

**Acceptance Criteria**
- Homeowner sees only their own properties, balances, invoices, payments, credits, penalties, receipts, and pending proofs.
- Homeowners with multiple properties can switch only among owned properties.
- Pending payment proofs are shown separately from posted payments.
- Overdue status and payment instructions are visible.

**Traceability**: Homeowner Portal; Security; Payment Management

### US-047: Download homeowner documents

As a Homeowner, I want to download my invoices, receipts, and SOAs so that I can keep records.

**Personas**: P-05

**Acceptance Criteria**
- Homeowner can download only their own PDFs.
- PDFs reflect stored financial records and selected periods.
- Unauthorized access to another homeowner's document is denied and logged.

**Traceability**: Homeowner Portal; Invoice Management; Receipts; Statement of Account; Security

## Epic E12: Notifications and Email Operations

### US-048: Send account and transaction emails

As Billing Staff, I want the system to send account, invoice, receipt, SOA, reminder, penalty, and password emails so that users receive timely communication.

**Personas**: P-03, P-01, P-05

**Acceptance Criteria**
- SMTP sending uses queued delivery with retry handling.
- Email templates support required placeholders.
- Every delivery attempt records sent, failed, or pending status.
- Failed emails can be resent by authorized users.
- Financial transactions remain valid even if email delivery fails.

**Traceability**: Email Notifications; Reliability

## Story Traceability Summary

| Requirement Area | Story IDs |
|---|---|
| User, Role, and Access Management | US-001, US-003, US-046, US-047 |
| Homeowner and Property Management | US-004, US-005, US-006, US-007, US-036, US-037, US-042 |
| Billing Configuration | US-008, US-009, US-010 |
| Invoice Management | US-011, US-012, US-013, US-014, US-031 |
| Tax-Like Charges | US-010, US-013 |
| Payment Management | US-015, US-016, US-017, US-019, US-028, US-032 |
| Receipts | US-018, US-033 |
| Penalties and Delinquency | US-020, US-021, US-022, US-023, US-029, US-030, US-035 |
| Statement of Account | US-024, US-025, US-038, US-047 |
| Email Notifications | US-014, US-023, US-025, US-048 |
| Homeowner Portal | US-007, US-015, US-025, US-046, US-047 |
| Dashboard and Reports | US-026 through US-041 |
| Data Import and Opening Balances | US-042, US-043 |
| Audit Logging and Approvals | US-003, US-019, US-022, US-041, US-044, US-045 |

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Stories include explicit role, object-level authorization, approval, logging, and denial criteria for protected workflows. Implementation-level security checks remain for later stages. |
| Property-Based Testing | Compliant for story stage | Stories flag billing, allocation, penalty, SOA, and reconciliation behavior that needs later unit, integration, and property-based tests. Detailed PBT property identification remains assigned to Functional Design per PBT-01. |

