# HOA Billing System — Initial Requirements Document

## 1. Project Overview

Build a **Home Owners’ Association Billing System** for a landed-house subdivision. The system will help the HOA manage homeowner records, generate association dues, issue invoices and statements of account, record payments, track balances, send reminders, and produce financial reports.

The system should support recurring monthly, quarterly, semi-annual, and annual dues, as well as one-time charges such as penalties, special assessments, gate passes, stickers, maintenance fees, clubhouse fees, or other HOA-approved charges.

The system should be designed for use by HOA administrators, treasurers, billing staff, board members, and homeowners.

---

## 2. Business Objectives

The system should:

1. Centralize homeowner, property, billing, and payment records.
2. Automate recurring billing for association dues.
3. Generate invoices, receipts, and statements of account.
4. Track unpaid balances, partial payments, penalties, credits, and overpayments.
5. Send email notifications for invoices, due dates, overdue balances, and payment confirmations.
6. Provide dashboards and reports for HOA officers.
7. Allow homeowners to view their accounts and payment history.
8. Improve transparency, auditability, and collection efficiency.
9. Reduce manual spreadsheet-based billing work.

---

## 3. Scope

### 3.1 In Scope

The system should include:

- Homeowner and property management
- Lot/unit/house records
- Account balances
- Billing cycles
- Association dues setup
- Recurring invoice generation
- Manual invoice generation
- Statement of account generation
- Payment recording
- Payment allocation
- Partial payment handling
- Penalty and late fee computation
- Discounts, waivers, and adjustments
- Receipts
- Email notifications
- Homeowner portal
- Admin dashboard
- Treasurer/board reporting
- Audit logs
- Role-based access control
- Export to PDF, Excel, and CSV
- Basic configuration/settings

### 3.2 Out of Scope for Initial Version

The first version does not need to include:

- Full accounting/general ledger
- Payroll
- Inventory management
- Vendor procurement
- Advanced mobile app
- SMS notifications
- Bank API integration
- Payment gateway integration, unless selected as an optional phase
- Legal case management for delinquent accounts

These may be considered future enhancements.

---

## 4. User Roles / Actors

### 4.1 System Administrator

Responsible for technical and system-level configuration.

Capabilities:

- Manage users and roles
- Configure HOA profile
- Manage billing settings
- Manage system templates
- View audit logs
- Configure email settings
- Back up/export data

### 4.2 HOA Treasurer

Responsible for financial oversight.

Capabilities:

- View all billing and payment data
- Approve adjustments, waivers, and write-offs
- Generate financial reports
- Review collections
- Monitor aging receivables
- Export reports

### 4.3 Billing Staff / HOA Admin

Responsible for day-to-day billing operations.

Capabilities:

- Manage homeowner records
- Manage property records
- Generate invoices
- Record payments
- Issue receipts
- Send reminders
- Generate SOAs
- Apply penalties
- Add manual charges

### 4.4 HOA Board Member

Responsible for governance and review.

Capabilities:

- View dashboards
- View summary reports
- View delinquency reports
- View collection performance
- No direct modification of financial records unless granted permission

### 4.5 Homeowner

Responsible for viewing and paying their dues.

Capabilities:

- View invoices
- View statement of account
- View payments and receipts
- Download PDFs
- Submit payment proof, if online payment is not integrated
- Update contact information, subject to approval
- Receive email notifications

---

## 5. Core Modules

## 5.1 Homeowner Management

The system must maintain homeowner profiles.

### Required fields:

- Homeowner ID
- First name
- Middle name
- Last name
- Display name
- Email address
- Mobile number
- Alternate contact number
- Billing address
- Mailing address
- Account status: Active, Inactive, Delinquent, Moved Out, Deceased, Suspended
- Preferred communication method
- Notes
- Created date
- Updated date

### Requirements:

- A homeowner may own one or more properties.
- A property may have one primary homeowner.
- A property may have secondary contacts or authorized representatives.
- The system should preserve historical ownership records.
- The system should support homeowner move-in and move-out dates.

---

## 5.2 Property / Lot Management

The system must maintain subdivision property records.

### Required fields:

- Property ID
- Block number
- Lot number
- House number
- Street name
- Phase/section/zone
- Lot area
- Property type: Residential, Vacant Lot, Commercial, Common Area, Other
- Occupancy status: Owner-occupied, Tenant-occupied, Vacant, Under construction
- Billing status: Billable, Non-billable, Exempt
- Current owner
- Previous owner history
- Meter/reference number, if applicable
- Notes

### Requirements:

- Each property should have a unique identifier.
- The system should prevent duplicate block/lot/property records.
- The system should calculate association dues based on lot area using the formula: `Association Due = Lot Area × Rate per sqm`.

---

## 5.3 Billing Configuration

The system must allow authorized users to configure billing rules.

### Configuration items:

- HOA name
- Default billing cycle
- Default due date rule
- Grace period
- Association dues rate per sqm
- Effective date of dues rate
- Late fee type
- Late fee amount or percentage
- Interest rate, if applicable
- Invoice numbering format
- Receipt numbering format
- Statement numbering format
- Currency
- Tax settings, if applicable
- Email templates
- Payment methods
- Penalty rules
- Discount rules
- Rounding rules

### Association dues calculation:

The system must calculate regular association dues using this formula:

```text
Association Due = Lot Area × Rate per sqm
```

Example:

```text
Lot Area = 180 sqm
Rate per sqm = ₱10
Association Due = 180 × ₱10
Association Due = ₱1,800
```

The calculated association due should be stored on the invoice line item at the time of invoice generation so historical invoices remain unchanged even if the rate per sqm is updated later.

### Supported billing frequencies:

- Monthly
- Quarterly
- Semi-annual
- Annual
- Custom billing period

### Charge types:

- Association dues
- Special assessment
- Penalty
- Interest
- Sticker fee
- Gate pass fee
- Clubhouse fee
- Maintenance charge
- Security fee
- Garbage collection fee
- Water charge, if applicable
- Miscellaneous charge
- Credit adjustment
- Debit adjustment

---

## 5.4 Invoice Management

The system must generate invoices for homeowner accounts.

### Invoice fields:

- Invoice ID
- Invoice number
- Homeowner
- Property
- Billing period
- Invoice date
- Due date
- Line items
- Subtotal
- Discounts
- Penalties
- Total amount due
- Amount paid
- Balance
- Status: Draft, Issued, Partially Paid, Paid, Overdue, Cancelled, Voided
- Email sent status
- Created by
- Approved by, if applicable
- Created date

### Requirements:

- The system should generate invoices automatically based on billing schedules.
- The system should allow manual invoices.
- The system should support multiple invoice line items.
- The system should allow invoice preview before issuance.
- The system should allow PDF invoice generation.
- The system should send invoices by email.
- The system should prevent duplicate invoices for the same property and billing period unless explicitly allowed.
- The system should support voiding or cancelling invoices with reason capture.
- Invoice edits after issuance should be restricted and logged.

---

## 5.5 Statement of Account Management

The system must generate a statement of account for each homeowner or property.

### SOA should include:

- Homeowner name
- Property details
- Opening balance
- Invoice history
- Payment history
- Adjustments
- Penalties
- Credits
- Running balance
- Total amount due
- Aging summary
- Statement date
- Statement period

### Requirements:

- The SOA should be downloadable as PDF.
- The SOA should be emailable to the homeowner.
- The SOA should support date range filters.
- The SOA should show unpaid, partially paid, and paid invoices.
- The SOA should clearly show overdue balances.
- The SOA should include payment instructions.

---

## 5.6 Payment Management

The system must record homeowner payments.

### Payment fields:

- Payment ID
- Receipt number
- Homeowner
- Property
- Payment date
- Posting date
- Payment method
- Reference number
- Bank/account reference
- Amount paid
- Applied invoices
- Unapplied amount
- Payment status: Pending, Posted, Reversed, Cancelled, Failed
- Received by
- Notes
- Attachment/proof of payment

### Supported payment methods:

- Cash
- Check
- Bank deposit
- Bank transfer
- Online payment
- GCash/e-wallet, if applicable
- Other

### Requirements:

- The system should allow full and partial payments.
- The system should allocate payments to oldest outstanding invoices by default.
- The system should allow manual payment allocation.
- The system should handle overpayments as account credits.
- The system should generate official or provisional receipts.
- The system should allow uploading proof of payment.
- The system should allow payment reversal with reason and audit trail.
- The system should not allow deletion of posted payments; use reversal instead.
- The system should update invoice and account balances after payment posting.

---

## 5.7 Penalties, Interest, and Delinquency

The system must support late payment handling.

### Requirements:

- The system should identify overdue invoices after the due date and grace period.
- The system should calculate penalties based on configured rules.
- Penalties may be flat amount, percentage, recurring monthly penalty, or custom rule.
- The system should support manual waiver of penalties by authorized users.
- Penalty waivers must require reason capture.
- The system should classify accounts by aging bucket:
  - Current
  - 1–30 days overdue
  - 31–60 days overdue
  - 61–90 days overdue
  - Over 90 days overdue
- The system should generate delinquency reports.
- The system should support reminder levels:
  - Friendly reminder
  - First overdue notice
  - Final notice
  - Board escalation
  - Legal endorsement, future phase

---

## 5.8 Email Notification Module

The system must send email notifications.

### Email types:

- Welcome/account activation email
- Invoice issued email
- Payment received email
- Receipt email
- Upcoming due date reminder
- Overdue payment reminder
- Statement of account email
- Penalty notice
- Password reset email

### Requirements:

- Email templates should be configurable.
- Emails should support placeholders such as homeowner name, invoice number, amount due, due date, and payment instructions.
- The system should log email delivery attempts.
- The system should track sent, failed, and pending email statuses.
- Admin users should be able to resend emails.
- The system should support PDF attachments for invoices, receipts, and SOAs.

---

## 5.9 Homeowner Portal

The system should provide a homeowner-facing portal.

### Homeowner capabilities:

- Log in securely
- View property details
- View account balance
- View invoices
- View payment history
- Download invoices, receipts, and SOAs
- Submit proof of payment
- View HOA payment instructions
- Update email/contact details
- Receive announcements, optional future feature

### Requirements:

- Homeowners should only see their own accounts.
- Homeowners with multiple properties should be able to switch between properties.
- Homeowner-submitted payment proofs should be marked as pending until verified by admin or treasurer.

---

## 5.10 Admin Dashboard

The system should provide a dashboard for authorized HOA users.

### Dashboard metrics:

- Total billable properties
- Total homeowners
- Total billed amount
- Total collected amount
- Total outstanding balance
- Collection rate
- Overdue accounts
- Accounts by aging bucket
- Recent payments
- Invoices due soon
- Failed email deliveries
- Pending payment verifications

---

## 5.11 Reports

The system must generate reports.

### Required reports:

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

### Export formats:

- PDF
- Excel
- CSV

---

## 6. Business Rules

### BR-001: Unique Property Rule

Each property must have a unique combination of block, lot, phase/section, and street.

### BR-002: One Primary Owner Rule

Each billable property must have one primary homeowner responsible for billing.

### BR-003: Multiple Property Ownership Rule

A homeowner may own multiple properties, and each property may generate separate charges.

### BR-004: Billing Period Rule

The system must not generate duplicate invoices for the same property, charge type, and billing period unless an authorized override is performed.

### BR-004A: Lot Area Association Due Calculation Rule

The system must calculate regular association dues per property using the formula `Association Due = Lot Area × Rate per sqm`. The lot area must come from the property record. The rate per sqm must come from the active billing configuration for the billing period. The computed amount must be rounded according to the configured rounding rule and saved on the invoice line item.

### BR-004B: Lot Area Data Requirement Rule

A billable property must have a valid lot area greater than zero before recurring association dues can be generated. Properties with missing, zero, or invalid lot area must be excluded from batch billing and listed in a billing exception report.

### BR-004C: Rate Effective Date Rule

If the HOA changes the rate per sqm, the system must apply the rate that is effective for the invoice billing period. Existing issued invoices must not be recalculated automatically unless an authorized adjustment, void, or reissue process is performed.

### BR-005: Due Date Rule

Each invoice must have a due date based on the configured billing cycle.

### BR-006: Grace Period Rule

Late penalties should only apply after the due date plus the configured grace period.

### BR-007: Payment Allocation Rule

Payments should be applied to the oldest unpaid invoice first unless the user manually selects another allocation.

### BR-008: Partial Payment Rule

Partial payments must reduce the outstanding balance but should not mark the invoice as fully paid.

### BR-009: Overpayment Rule

Overpayments should be recorded as account credit and may be applied to future invoices.

### BR-010: Voiding Rule

Issued invoices and posted payments must not be deleted. They may only be voided, cancelled, or reversed with a reason and audit log.

### BR-011: Audit Rule

All financial changes must be logged with user, timestamp, old value, new value, and reason where applicable.

### BR-012: Statement Rule

A statement of account must reflect all invoices, payments, penalties, credits, and adjustments within the selected period.

### BR-013: Email Rule

The system should record whether each billing-related email was sent, failed, or pending.

### BR-014: Access Control Rule

Users may only access features and records permitted by their role.

---

## 7. Core Workflows

## 7.1 Monthly Billing Workflow

1. Admin confirms billing period.
2. System identifies billable properties.
3. System retrieves each property's lot area and the active rate per sqm.
4. System calculates association dues using `Association Due = Lot Area × Rate per sqm`.
5. System calculates any other applicable charges.
6. System generates draft invoices.
7. Admin reviews invoice batch.
8. Admin issues invoices.
9. System emails invoices to homeowners.
10. System updates homeowner balances.

## 7.2 Payment Posting Workflow

1. Homeowner pays through allowed payment method.
2. Admin records payment or homeowner submits proof.
3. Admin verifies payment details.
4. System allocates payment to invoices.
5. System updates invoice status.
6. System generates receipt.
7. System emails receipt to homeowner.
8. System updates dashboard and reports.

## 7.3 Overdue Reminder Workflow

1. System checks unpaid invoices past due date and grace period.
2. System calculates penalty, if configured.
3. System updates invoice/account status to overdue.
4. System sends reminder email.
5. System logs notification.
6. Account appears in delinquency report.

## 7.4 Statement of Account Workflow

1. Admin or homeowner selects account and date range.
2. System retrieves invoices, payments, penalties, credits, and adjustments.
3. System calculates opening balance, activity, and ending balance.
4. System generates SOA.
5. User downloads or emails SOA.

---

## 8. Suggested Data Entities

The code generation AI should propose a database schema using these core entities:

1. User
2. Role
3. Permission
4. Homeowner
5. Property
6. OwnershipHistory
7. BillingAccount
8. ChargeType
9. BillingCycle
10. Invoice
11. InvoiceLineItem
12. Payment
13. PaymentAllocation
14. Receipt
15. StatementOfAccount
16. Adjustment
17. Penalty
18. Credit
19. EmailTemplate
20. EmailLog
21. Attachment
22. AuditLog
23. SystemSetting
24. Notification
25. PaymentMethod

---

## 9. Initial Entity Relationships

The system should support the following relationships:

- One homeowner may own many properties.
- One property may have many ownership history records.
- One property should have one active billing account.
- One billing account may have many invoices.
- One invoice may have many invoice line items.
- One payment may be allocated to many invoices.
- One invoice may receive many payment allocations.
- One billing account may have many adjustments.
- One invoice or account may have many penalties.
- One homeowner may have many email logs.
- One user may create many audit log entries.

---

## 10. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | The system shall allow administrators to create and manage homeowner records. | Must |
| FR-002 | The system shall allow administrators to create and manage property records. | Must |
| FR-003 | The system shall link homeowners to one or more properties. | Must |
| FR-004 | The system shall configure association dues rate per sqm and billing cycles. | Must |
| FR-004A | The system shall calculate association dues using `Lot Area × Rate per sqm`. | Must |
| FR-004B | The system shall prevent recurring dues generation for billable properties with missing or invalid lot area and include them in an exception report. | Must |
| FR-005 | The system shall generate recurring invoices. | Must |
| FR-006 | The system shall generate manual invoices. | Must |
| FR-007 | The system shall generate invoice PDFs. | Must |
| FR-008 | The system shall email invoices to homeowners. | Must |
| FR-009 | The system shall record full and partial payments. | Must |
| FR-010 | The system shall allocate payments to invoices. | Must |
| FR-011 | The system shall generate receipts. | Must |
| FR-012 | The system shall generate homeowner statements of account. | Must |
| FR-013 | The system shall compute overdue balances. | Must |
| FR-014 | The system shall calculate penalties based on configured rules. | Should |
| FR-015 | The system shall support penalty waivers and adjustments. | Should |
| FR-016 | The system shall provide a homeowner portal. | Should |
| FR-017 | The system shall allow homeowners to download invoices, receipts, and SOAs. | Should |
| FR-018 | The system shall provide billing and collection dashboards. | Must |
| FR-019 | The system shall generate receivables aging reports. | Must |
| FR-020 | The system shall export reports to PDF, Excel, and CSV. | Should |
| FR-021 | The system shall log all financial changes. | Must |
| FR-022 | The system shall implement role-based access control. | Must |
| FR-023 | The system shall allow batch invoice generation. | Must |
| FR-024 | The system shall allow batch email sending. | Should |
| FR-025 | The system shall support homeowner payment proof uploads. | Could |

---

## 11. Non-Functional Requirements

### Security

- Use role-based access control.
- Passwords must be securely hashed.
- Sensitive data must be protected.
- Homeowners must only access their own records.
- Admin actions must be logged.
- Financial records must not be physically deleted once posted.

### Reliability

- Billing and payment calculations must be accurate.
- Generated invoices and SOAs must be reproducible.
- Payment posting must be transactional.
- Failed email sending must not corrupt billing data.

### Usability

- Admin screens should support search, filters, and sorting.
- Homeowner portal should be simple and mobile-friendly.
- Common actions should require minimal clicks.
- Financial pages should clearly show balances and statuses.

### Performance

- Dashboard should load within acceptable time for typical HOA data volume.
- Batch billing should support hundreds or thousands of properties.
- Reports should support date range filtering.

### Auditability

- All financial changes must be traceable.
- The system should keep old and new values for key financial updates.
- Voids, reversals, waivers, and adjustments must require reason codes.

### Maintainability

- Use modular architecture.
- Separate billing logic from UI.
- Centralize business rules.
- Provide automated tests for billing, payment allocation, penalties, and SOA generation.

---

## 12. Suggested Architecture for Code Generation AI

The AI should propose an architecture suitable for a modern web application.

### Recommended components:

- Web frontend
- Admin portal
- Homeowner portal
- Backend API
- Relational database
- Email service
- PDF generation service
- Authentication and authorization module
- Reporting module
- Background job scheduler for recurring billing and reminders
- File storage for attachments and generated PDFs
- Audit logging service

### Suggested technology stack

The code generation AI may recommend a stack, but the system should work well with one of the following:

#### Option A

- Frontend: React / Next.js
- Backend: Node.js / NestJS
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT or session-based auth
- Email: SMTP provider
- PDF: server-side PDF generation
- Jobs: cron or queue-based worker

#### Option B

- Frontend: Laravel Blade or Vue
- Backend: Laravel
- Database: MySQL or PostgreSQL
- Auth: Laravel Breeze/Fortify
- Jobs: Laravel Queue
- Email: Laravel Mail
- PDF: DomPDF or equivalent

#### Option C

- Backend: Django
- Frontend: Django templates or React
- Database: PostgreSQL
- Jobs: Celery
- Email: SMTP
- PDF: WeasyPrint or ReportLab

The AI should select one stack and explain the rationale.

---

## 13. Suggested MVP

The first production-ready MVP should include:

1. User login and role-based access
2. Homeowner management
3. Property management
4. Billing account setup
5. Charge type setup
6. Rate-per-sqm association dues configuration
7. Recurring invoice generation using lot area × rate per sqm
8. Manual invoice creation
9. PDF invoice generation
10. Payment recording
11. Receipt generation
12. Statement of account generation
13. Basic email notifications
14. Dashboard
15. Billing reports
16. Collection reports
17. Aging receivables report
18. Audit log

---

## 14. Future Enhancements

Future phases may include:

- Online payment gateway
- SMS reminders
- Mobile app
- Homeowner self-service registration
- Board approval workflow
- Legal collection workflow
- Accounting/general ledger integration
- Bank reconciliation
- QR code payment references
- Digital official receipt numbering
- Budgeting module
- Expense tracking
- HOA announcements
- Document repository
- Violation/fine management
- Facility reservation billing
- Tenant management

---

## 15. Sample User Stories

### US-001: Manage Homeowners

As an HOA admin, I want to create and update homeowner records so that billing information is accurate.

Acceptance Criteria:

- Admin can create a homeowner profile.
- Admin can edit contact information.
- Admin can deactivate a homeowner.
- Admin can search homeowners by name, email, mobile number, or property.
- System logs all changes.

### US-002: Generate Monthly Dues

As a billing staff member, I want to generate monthly dues invoices for all billable properties so that homeowners can be charged on schedule.

Acceptance Criteria:

- User selects billing period.
- System identifies billable properties.
- System applies the correct dues rate.
- System prevents duplicate billing for the same period.
- User can review invoices before issuing.
- Issued invoices update homeowner balances.

### US-003: Record Payment

As a treasurer, I want to record homeowner payments so that account balances are updated.

Acceptance Criteria:

- User can select homeowner/property.
- User can enter payment amount, date, method, and reference number.
- System can allocate payment to unpaid invoices.
- System supports partial payment.
- System generates receipt.
- System updates invoice and account balances.

### US-004: View Statement of Account

As a homeowner, I want to view my statement of account so that I can understand my outstanding dues and payment history.

Acceptance Criteria:

- Homeowner can log in.
- Homeowner can view only their own account.
- Homeowner can select a statement period.
- System displays invoices, payments, penalties, credits, and balance.
- Homeowner can download SOA as PDF.

### US-005: Send Overdue Reminder

As a billing staff member, I want the system to send overdue reminders so that collections can improve.

Acceptance Criteria:

- System identifies overdue invoices.
- System applies grace period rules.
- System sends email reminder using a template.
- System logs email status.
- Account appears in delinquency report.

---

## 16. Instructions to the Code Generation AI

Use this requirements document to produce:

1. A recommended technical architecture.
2. A database schema with tables, fields, keys, and relationships.
3. API endpoint design.
4. Page/screen list for admin and homeowner portals.
5. Role and permission matrix.
6. Core billing algorithms.
7. Payment allocation logic.
8. Penalty computation logic.
9. PDF generation approach.
10. Email notification flow.
11. Background job design.
12. Security model.
13. MVP implementation plan.
14. Test plan.
15. Seed data for development.
16. Initial backlog of epics, features, and user stories.

Prioritize correctness of billing, auditability, data integrity, and ease of use. The system should be suitable for a real HOA managing a subdivision of landed houses.
