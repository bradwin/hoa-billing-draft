# Application Design Plan

## Purpose

Define high-level application components, service boundaries, component methods, dependency relationships, and orchestration patterns for the HOA Billing System.

This stage does not define detailed algorithms. Detailed billing, allocation, penalty, SOA, import, and report business rules will be designed later during per-unit Functional Design.

## Source Context

- Requirements: `aidlc-docs/inception/requirements/requirements.md`
- Personas: `aidlc-docs/inception/user-stories/personas.md`
- Stories: `aidlc-docs/inception/user-stories/stories.md`
- Execution Plan: `aidlc-docs/inception/plans/execution-plan.md`

## Application Design Checklist

- [x] Review approved requirements.
- [x] Review approved personas and user stories.
- [x] Review approved execution plan.
- [x] Identify primary business capabilities and design decision points.
- [x] Validate all design-planning answers in this file.
- [x] Generate `aidlc-docs/inception/application-design/components.md` with component definitions and high-level responsibilities.
- [x] Generate `aidlc-docs/inception/application-design/component-methods.md` with method signatures and high-level purposes.
- [x] Generate `aidlc-docs/inception/application-design/services.md` with service definitions and orchestration patterns.
- [x] Generate `aidlc-docs/inception/application-design/component-dependency.md` with dependency relationships and communication patterns.
- [x] Generate `aidlc-docs/inception/application-design/application-design.md` as the consolidated design document.
- [x] Validate design completeness and consistency.
- [x] Verify extension compliance summary for Application Design stage.

## Preliminary Component Areas

The final component list will be generated after answers are validated, but the approved scope implies these likely component areas:

- Web Frontend: Admin, Treasurer, Board, and Homeowner portal views.
- Backend API: Authenticated REST API for all workflows.
- Identity and Access Control: invitations, sessions, MFA support, fixed roles, object-level authorization.
- Homeowner and Property: homeowner profiles, property records, ownership history, contact requests.
- Billing Configuration: rates, due dates, charge types, numbering, templates, payment methods.
- Invoice: draft generation, issuance, manual invoices, PDFs, duplicate prevention, void/cancel/reissue workflow.
- Payment: payment proof intake, verification, posting, allocation, credits, reversals.
- Receipt: official/provisional receipt generation and reversal/cancellation control.
- Penalty and Delinquency: overdue detection, recurring non-compounding penalties, waivers, reminders.
- Statement of Account: account activity, running balances, PDF and email workflows.
- Reporting and Dashboard: all required reports, exports, and dashboard metrics.
- Import: CSV import, validation, exception reporting, opening balance adjustments.
- Notification: queued SMTP emails, templates, retries, logs.
- Attachment and Document Storage: local storage abstraction for PDFs and uploads.
- Audit and Approval: immutable audit trail, approval queues, financial correction workflows.
- Background Jobs: recurring billing, penalty processing, reminder/email sending, report/SOA batch generation.

## Design Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

### Question 1
What deployment/component boundary should Application Design target?

A) Modular monolith: one NestJS backend API with strongly separated modules, one Next.js frontend, one PostgreSQL database, and a worker process sharing the same codebase (recommended)
B) Service-oriented split: separate deployable backend services for identity, billing, payments, reporting, notifications, and files
C) Single full-stack Next.js application with API routes and no separate NestJS backend
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
How should frontend boundaries be represented?

A) Two logical portals in one Next.js app: admin/treasurer/board operations and homeowner self-service, with shared authenticated layout and shared design system (recommended)
B) Separate Next.js apps for admin users and homeowners
C) One unified UI with role-based navigation only, without distinct portal boundaries
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
What API style should the backend expose?

A) REST API with resource-oriented controllers and command-style endpoints for financial actions such as issue, post, reverse, approve, waive, and generate (recommended)
B) GraphQL API for all application operations
C) REST API for CRUD only and background jobs for all financial commands
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
Where should authorization checks be owned?

A) Central Identity and Access Control component provides guards/policies, while each domain component enforces object-level ownership and domain-specific authorization rules (recommended)
B) Central Identity and Access Control component owns all authorization decisions for every domain
C) Each domain component implements all authorization independently with no central policy layer
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
Which component should own account balance calculations?

A) Ledger-style Account Balance component derives balances from invoices, payments, allocations, credits, penalties, and adjustments, while domain components own their source records (recommended)
B) Invoice component owns all account balances and receives updates from payment, penalty, and adjustment components
C) Payment component owns balances because payments are the main balance-changing event
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
How should financial approval workflows be modeled?

A) Dedicated Approval Workflow component coordinates pending requests, Treasurer decisions, and audit events for voids, reversals, waivers, write-offs, and adjustments (recommended)
B) Each financial component owns its own approval process independently
C) Approval is represented only as status fields on financial records, with no shared approval component
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
How should reports be designed?

A) Reporting component reads normalized domain data through read/query services and produces report/export models without owning source financial records (recommended)
B) Reporting component owns denormalized reporting tables as the primary source for all report output
C) Each domain component generates its own reports independently
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
How should background jobs be organized?

A) Dedicated Job Orchestration component schedules and invokes domain services for billing batches, penalties, reminders, email retries, imports, and batch SOAs (recommended)
B) Each domain component schedules its own jobs independently
C) Avoid worker jobs in first implementation and run all batch actions synchronously from user requests
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
How should document generation and storage responsibilities be split?

A) Document Generation component creates PDFs from domain snapshots; Storage component persists PDFs/uploads through a local filesystem abstraction (recommended)
B) Each domain component generates and stores its own PDFs/uploads directly
C) Store all documents in the database and avoid a separate storage component
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
How should audit logging be owned?

A) Dedicated Audit component provides append-only audit recording used by every domain component, with domain components supplying before/after values and reasons (recommended)
B) Each domain component writes its own audit records directly with no shared audit component
C) Audit is handled only by database triggers
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 11
What design stance should be used for cross-component transactions?

A) Keep financial operations inside a single PostgreSQL transaction boundary in the backend where possible; use idempotent jobs for async side effects such as email and PDF generation (recommended)
B) Use event-driven eventual consistency for most financial operations
C) Avoid explicit transaction orchestration and let each repository save independently
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 12
How should imports be integrated with domain components?

A) Import component validates and stages CSV rows, then calls domain services to create homeowners, properties, and opening balance adjustments after review/approval (recommended)
B) Import component writes directly to all domain tables for speed
C) Imports are handled as one-off scripts outside the application design
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Post-Answer Processing

After all `[Answer]:` tags are complete:

- Responses will be validated for blanks, invalid options, contradictions, and vague answers.
- Follow-up questions will be added if any answer is ambiguous.
- If answers are clear, Application Design artifacts will be generated directly from this plan and the approved source context.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant for planning | Questions explicitly cover authorization ownership, audit ownership, transaction boundaries, frontend/API boundaries, job orchestration, and storage separation. Implementation-specific checks are not applicable until design artifacts and code exist. |
| Property-Based Testing | N/A for planning | PBT property identification is required during Functional Design. This plan preserves financial component boundaries needed for later property identification. |
