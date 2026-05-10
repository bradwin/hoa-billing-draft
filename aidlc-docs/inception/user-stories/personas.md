# HOA Billing System Personas

## Persona Map

| ID | Persona | Primary Goal | Authority Level |
|---|---|---|---|
| P-01 | System Administrator | Keep the system configured, secure, and operational | System configuration and user administration |
| P-02 | HOA Treasurer | Protect financial correctness and approve sensitive financial changes | Financial oversight and approvals |
| P-03 | Billing Staff or HOA Admin | Run daily billing, payment, homeowner, and property operations | Operational financial data entry and processing |
| P-04 | HOA Board Member | Review financial performance, delinquency, and governance reports | Read-only governance visibility unless separately granted |
| P-05 | Homeowner | View account status, download documents, and submit payment proof | Own-account self-service only |

## P-01 System Administrator

**Profile**: A technical or administrative user responsible for system-level setup and ongoing configuration.

**Goals**
- Configure HOA profile, email settings, templates, roles, numbering formats, and basic system settings.
- Manage user accounts and invitations.
- Keep authentication, authorization, logging, exports, and storage behavior operational.

**Authority**
- Can manage users and system configuration.
- Can view audit logs.
- Cannot bypass financial approval requirements unless explicitly assigned the Treasurer role.

**Constraints**
- Must not directly alter posted financial records outside controlled workflows.
- Must not access homeowner records beyond authorized operational needs.
- Must preserve security settings required by the Security Baseline extension.

**Success Signals**
- Users can sign in, receive invitations and password resets, and access only allowed functions.
- System settings are complete enough for billing, email, PDF, import, report, and storage operations.
- Audit logs show system and security changes.

## P-02 HOA Treasurer

**Profile**: The financial authority responsible for correctness, approvals, collections oversight, and reporting.

**Goals**
- Review billing, collection, receivable, adjustment, penalty, and audit information.
- Approve voids, reversals, waivers, write-offs, and financial adjustments.
- Ensure balances, receipts, statements, and reports reconcile.

**Authority**
- Can view all financial records.
- Can approve sensitive financial changes.
- Can generate and export financial reports.
- Can monitor aging receivables and collection performance.

**Constraints**
- Must provide or require reasons for sensitive financial changes.
- Must not physically delete posted invoices, payments, receipts, penalties, credits, or audit records.
- Must distinguish approved corrections from original transaction history.

**Success Signals**
- Financial reports reconcile with invoices, payments, credits, penalties, adjustments, and receipts.
- Approval queues show all pending sensitive changes with sufficient context.
- Delinquency and aging reports are accurate and timely.

## P-03 Billing Staff or HOA Admin

**Profile**: A day-to-day operational user who maintains homeowner and property data, runs billing, records payments, and handles communications.

**Goals**
- Maintain homeowner, property, ownership, and billing account records.
- Generate draft invoices, review billing exceptions, issue invoices, and send emails.
- Record payment proofs, post verified payments where authorized, issue receipts, and generate SOAs.

**Authority**
- Can create and update operational records.
- Can generate invoices, receipts, SOAs, reminders, and reports as permitted.
- Cannot approve voids, reversals, waivers, write-offs, or financial adjustments that require Treasurer approval.

**Constraints**
- Must resolve missing or invalid lot area before recurring dues can be billed for a property.
- Must use reversal, void, waiver, adjustment, or reissue workflows instead of deleting posted records.
- Must keep manual tax-like line items explicit, reasoned, and auditable.

**Success Signals**
- Billing batches can be reviewed before issuance.
- Payment posting updates balances and receipts correctly.
- Exceptions are visible instead of silently skipped.

## P-04 HOA Board Member

**Profile**: A governance user who reviews financial performance and delinquency without routine editing authority.

**Goals**
- View dashboards and summary reports.
- Review collection rate, delinquency, aging, and board escalation information.
- Export governance reports when allowed.

**Authority**
- Read-only access to dashboards and reports by default.
- No direct modification of financial records unless another role is explicitly granted.

**Constraints**
- Must not see operational controls that could mutate financial data unless authorized.
- Must not access homeowner details outside board-approved reporting visibility.

**Success Signals**
- Board can review financial status without asking staff for spreadsheet exports.
- Report data is current, filtered, exportable, and traceable.

## P-05 Homeowner

**Profile**: A property owner responsible for monitoring dues, payments, invoices, receipts, and account status.

**Goals**
- View own properties, balances, invoices, payments, receipts, SOAs, and payment instructions.
- Download PDF invoices, receipts, and statements.
- Submit payment proof and contact change requests.

**Authority**
- Can access only own accounts and properties.
- Can submit payment proof but cannot post payments.
- Can submit contact updates but cannot directly change approved master records.

**Constraints**
- Must not see other homeowners' records.
- Pending payment proof must not reduce balances until verified.
- Multiple-property homeowners must be able to switch only among properties they own.

**Success Signals**
- Homeowner can understand what is owed, what was paid, and what remains pending.
- Homeowner can download reliable PDFs and submit proof without staff intervention.

## Cross-Persona Notes

- Financial safety beats convenience. Any story that changes posted financial state must preserve auditability and approval rules.
- Authorization criteria are part of user acceptance, not an implementation afterthought.
- Reports and PDFs are user-facing records and must reconcile with the same financial source of truth.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Personas define authority boundaries, object-level access expectations, and financial approval limits needed for later SECURITY-08 enforcement. |
| Property-Based Testing | N/A | Personas do not define algorithms or testable properties; PBT enforcement begins in Functional Design and later construction stages. |

