# Requirements Verification Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

This project is a financial billing system. Ambiguous billing, payment, receipt, penalty, credit, approval, and audit rules are implementation blockers until resolved.

## Question 1
Should security extension rules be enforced for this project?

A) Yes - enforce all SECURITY rules as blocking constraints (recommended for a production-grade HOA billing system)
B) No - skip all SECURITY rules (suitable only for prototypes or experiments)
X) Other (please describe after [Answer]: tag below)

[Answer]: A 

## Question 2
Should property-based testing (PBT) rules be enforced for this project?

A) Yes - enforce all PBT rules as blocking constraints (recommended for billing, payment allocation, penalties, credits, and SOA balances)
B) Partial - enforce PBT rules only for pure functions and serialization round-trips
C) No - skip all PBT rules
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
What is the initial implementation scope?

A) Production-ready MVP matching Section 13 of the source requirements (recommended)
B) Full in-scope system from Section 3.1 in the first implementation
C) Admin and treasurer portal first; homeowner portal deferred
X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 4
Which technology stack should be used?

A) TypeScript stack: Next.js, NestJS, PostgreSQL, Prisma, SMTP, server-side PDF generation, worker queue (recommended)
B) Laravel stack: Laravel, Blade or Vue, MySQL or PostgreSQL, Laravel Queue, Laravel Mail
C) Django stack: Django, PostgreSQL, Celery, SMTP, WeasyPrint or ReportLab
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
What is the deployment target for the first usable version?

A) Local or single-server Docker deployment suitable for a small HOA (recommended default)
B) Managed cloud deployment on AWS with managed database and object storage
C) Development-only local application with production deployment deferred
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
What currency and tax treatment should the system use?

A) Philippine peso only; HOA dues and fees are not taxed in MVP (recommended unless your HOA requires tax handling)
B) Philippine peso only; support configurable tax lines on invoices
C) Multi-currency and configurable tax rules
X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 7
What receipt policy should the system implement?

A) Provisional receipts only; official receipts are handled outside the system
B) System-generated official receipts with controlled legal numbering
C) Homeowner proof creates pending payment record; verified posting generates official or provisional receipt based on payment method (recommended)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 8
How should invoice numbering work?

A) Draft invoices use internal IDs; issued invoices receive immutable sequential invoice numbers, and voided numbers are never reused (recommended)
B) Draft and issued invoices both receive visible invoice numbers immediately
C) Use the HOA's existing custom numbering sequence
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 9
How should money, lot area, rates, and rounding be handled?

A) Use decimal arithmetic; money rounded half-up to centavos; lot area and rates stored with configurable decimal precision (recommended)
B) Use decimal arithmetic; round every invoice line to whole pesos
C) Use decimal arithmetic; use banker's rounding for all financial amounts
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 10
Which date determines the active rate per sqm for recurring dues?

A) Billing period start date (recommended)
B) Billing period end date
C) Invoice issue date
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 11
How should due dates be calculated?

A) Fixed day of the billing period or next month, configured by HOA
B) Invoice issue date plus configured number of days
C) Last calendar day of the billing period or next month
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 12
When should late penalties become eligible?

A) At the start of the day after due date plus grace period (recommended)
B) During a scheduled month-end overdue batch
C) Only when an admin manually applies penalties
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 13
Which penalty model should MVP support?

A) Flat one-time penalty per overdue invoice
B) Percentage one-time penalty based on outstanding invoice balance
C) Recurring monthly penalty until paid
D) No automatic penalties in MVP; manual penalties only
X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 14
Should penalties compound?

A) No; penalties and interest are not themselves penalized (recommended)
B) Yes; penalty or interest compounds on unpaid total
C) Configurable per charge type
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 15
What is the default payment allocation order?

A) Oldest unpaid invoice first; within an invoice apply penalties and fees before dues (recommended if the HOA wants strict collections)
B) Oldest unpaid invoice first; within an invoice apply dues before penalties and fees
C) Manual allocation only; no automatic allocation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 16
How should partial payments behave?

A) Post immediately, reduce invoice balance, keep invoice Partially Paid, and generate a receipt for the amount paid (recommended)
B) Hold as pending until the invoice is fully paid
C) Require treasurer approval before any partial payment can be posted
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 17
What is the scope of overpayment credits?

A) Property or billing-account specific credits only (recommended for clean auditability)
B) Homeowner-level credits that can automatically pay any property owned by the homeowner
C) Property-specific by default, with treasurer-approved transfer between properties
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 18
How should payment proof uploads affect balances?

A) Proof uploads create pending records only; balances change only after admin or treasurer verification (recommended)
B) Proof uploads immediately reduce visible homeowner balance but remain pending for admin review
C) Payment proof upload is excluded from MVP
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 19
What approval control should apply to voids, reversals, waivers, write-offs, and financial adjustments?

A) Treasurer approval required for all such changes (recommended for financial safety)
B) Role-based thresholds: billing staff can perform small changes with reason; treasurer approval required above threshold
C) Billing staff can perform all such changes with reason capture and audit log
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 20
How should homeowner portal authentication work?

A) Invite-based account activation with email/password and password reset (recommended)
B) Open self-registration matched to property records
C) No homeowner login in MVP
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 21
How configurable should roles and permissions be in MVP?

A) Fixed roles from the requirements with a documented permission matrix (recommended for MVP)
B) Fully configurable RBAC in the admin UI from the start
C) Fixed roles with limited per-user permission overrides
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 22
How should email delivery be implemented?

A) SMTP with queued sends, retry handling, and email delivery logs (recommended)
B) Manual PDF export only; email sending deferred
C) Third-party provider API such as SES, SendGrid, or Mailgun
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 23
Where should generated PDFs and uploaded attachments be stored?

A) Local filesystem for MVP with a storage abstraction for later migration (recommended for single-server deployment)
B) S3-compatible object storage from the start
C) Database blob storage
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 24
Should MVP include data import?

A) CSV import for homeowners, properties, and opening balances (recommended because most HOAs start from spreadsheets)
B) Manual data entry only
C) Seed/demo data only; real import deferred
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 25
How should opening balances be established?

A) Import opening balances as auditable adjustment entries per billing account (recommended)
B) Create historical invoices and payments for all prior periods
C) Set a mutable starting balance field on each account
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 26
What is the accounting boundary for MVP?

A) Accounts receivable subledger only; no full general ledger (recommended and consistent with source requirements)
B) Include chart of accounts and GL-ready journal entries
C) Integrate with external accounting software in MVP
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 27
How long should audit logs and financial records be retained?

A) Indefinitely, with no physical deletion through the application (recommended)
B) Configurable retention period with archive/export support
C) Retain audit logs for a fixed number of years
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 28
What report set is required for MVP acceptance?

A) Billing summary, collection report, aging receivables, delinquent homeowners, invoice register, payment register, receipt register, and audit trail (recommended)
B) Every report listed in Section 5.11 of the source requirements
C) Dashboard metrics first; detailed report exports deferred
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 29
What expected scale should guide performance and data model decisions?

A) Up to 1,000 properties and one HOA/subdivision (recommended default)
B) 1,001 to 10,000 properties and one HOA/subdivision
C) Multi-HOA or more than 10,000 properties
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 30
How should homeowner contact updates be handled?

A) Homeowners submit change requests; admin approves before master records change (recommended)
B) Homeowners can directly update their own contact details
C) Homeowner contact updates are excluded from MVP
X) Other (please describe after [Answer]: tag below)

[Answer]: A
