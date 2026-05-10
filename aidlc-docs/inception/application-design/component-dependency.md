# Component Dependencies

## Dependency Principles

- Backend domain components communicate through application services, not direct controller-to-repository shortcuts.
- Financial mutations must keep source-record changes, balance-impacting records, approvals, and audit entries inside one PostgreSQL transaction where possible.
- Email, PDF generation, and batch document work are asynchronous side effects after financial commits.
- Reporting reads domain data and does not own source financial records.
- Imports apply data through domain services and must not bypass validation or audit.

## Dependency Matrix

| Component | Depends On | Used By |
|---|---|---|
| Web Frontend | Backend API Shell | Users |
| Backend API Shell | Identity and Access Control, application services, Shared Kernel | Web Frontend |
| Identity and Access Control | Audit, Notification, Shared Kernel | Backend API Shell, all protected components |
| Homeowner and Property | Identity and Access Control, Audit, Shared Kernel | Invoice, Payment, SOA, Reporting, Import, Portal workflows |
| Billing Configuration | Audit, Shared Kernel | Invoice, Receipt, Penalty, Notification, SOA, Reporting |
| Invoice | Homeowner and Property, Billing Configuration, Account Balance, Approval Workflow, Document Generation, Notification, Audit | Payment, SOA, Reporting, Portal |
| Account Balance | Invoice, Payment, Receipt, Penalty, Approval-approved adjustments, Shared Kernel | Invoice, Payment, SOA, Reporting, Dashboard, Portal |
| Payment | Invoice, Account Balance, Receipt, Storage, Approval Workflow, Audit | Reporting, SOA, Portal |
| Receipt | Payment, Billing Configuration, Document Generation, Storage, Audit | SOA, Reporting, Portal |
| Penalty and Delinquency | Invoice, Billing Configuration, Account Balance, Approval Workflow, Notification, Audit | SOA, Reporting, Dashboard |
| Statement of Account | Account Balance, Invoice, Payment, Receipt, Penalty, Homeowner and Property, Document Generation, Notification | Portal, Reporting |
| Reporting and Dashboard | Account Balance, Invoice, Payment, Receipt, Penalty, SOA, Homeowner and Property, Audit, Document Generation, Storage | Admin, Treasurer, Board views |
| Import | Storage, Homeowner and Property, Approval Workflow, Account Balance, Audit, Reporting | Admin and Billing Staff workflows |
| Notification | Billing Configuration, Storage, Audit | Identity, Invoice, Receipt, SOA, Penalty, Job Orchestration |
| Document Generation | Invoice, Receipt, SOA, Reporting, Storage | Invoice, Receipt, SOA, Reporting |
| Storage | Identity and Access Control at API boundary, Shared Kernel | Payment, Import, Document Generation, Reporting, Portal |
| Audit | Shared Kernel | All mutating components and Reporting |
| Approval Workflow | Identity and Access Control, Audit, domain components | Invoice, Payment, Receipt, Penalty, Import |
| Job Orchestration | Domain application services, Audit | Scheduled worker process |
| Shared Kernel | None | All backend components |

## Core Data Flows

### Authentication and Authorization Flow

1. Web Frontend sends request to Backend API Shell.
2. Backend API Shell validates request shape.
3. Identity and Access Control authenticates the session and checks route permission.
4. Domain component checks object-level and domain-specific authorization.
5. Audit records security-sensitive failures and administrative changes.

### Invoice Issuance Flow

1. Invoice reads Homeowner and Property and Billing Configuration.
2. Invoice creates or updates invoice source records.
3. Account Balance derives updated balance views.
4. Audit records issuance.
5. Document Generation and Notification are queued after financial commit.

### Payment Posting Flow

1. Payment reads pending proof and target account.
2. Account Balance validates impact.
3. Payment allocates to Invoice balances.
4. Payment creates Credit if overpaid.
5. Receipt creates receipt record.
6. Audit records payment, allocation, credit, and receipt effects.
7. Document Generation and Notification run after commit.

### Approval Flow

1. Domain component creates Approval Workflow request.
2. Treasurer approves or rejects.
3. Approval Workflow invokes the relevant domain action only after approval.
4. Domain action updates source records transactionally.
5. Audit records request, decision, and applied financial effect.

### Reporting Flow

1. Reporting receives authorized report request.
2. Reporting reads normalized domain data through query services.
3. Reporting builds report model.
4. Document Generation creates export output if requested.
5. Storage persists generated export if needed.

### Import Flow

1. Import receives file reference from Storage.
2. Import validates rows and creates preview/exception output.
3. Approved rows call Homeowner and Property or Approval Workflow.
4. Opening balances become approved adjustment entries.
5. Audit records import lifecycle.

## Dependency Risk Controls

- Identity and Access Control is central for policy helpers, but domain components still own object-level rules to prevent IDOR.
- Account Balance derives from source records and does not become a mutable balance source of truth.
- Reporting cannot write source financial records.
- Import cannot write directly to domain tables.
- Notification and Document Generation cannot roll back committed financial transactions.
- Audit is append-only from application perspective.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Dependencies preserve central authorization, object-level checks, upload validation, audit logging, and separation of security-critical logic. |
| Property-Based Testing | N/A | Dependencies identify future PBT-relevant components but detailed properties are deferred to Functional Design. |

