# Application Design

## Summary

The HOA Billing System will be built as a TypeScript modular monolith with:

- One Next.js frontend application containing two logical portals.
- One NestJS backend API exposing REST resources and command-style financial endpoints.
- One PostgreSQL database accessed through Prisma.
- One worker process using the same backend modules for scheduled and asynchronous work.
- Local filesystem storage behind a storage abstraction.

This design intentionally prioritizes transactional financial correctness over service distribution. Invoices, payments, allocations, credits, penalties, receipts, approvals, and audit records must remain consistent under a single database transaction boundary wherever possible.

## Approved Design Decisions

| Decision Area | Approved Choice |
|---|---|
| Deployment/component boundary | Modular monolith with one NestJS backend API, one Next.js frontend, one PostgreSQL database, and a shared worker process |
| Frontend boundary | Two logical portals in one Next.js app |
| API style | REST resources plus command-style financial endpoints |
| Authorization ownership | Central policy helpers plus domain-owned object-level authorization |
| Balance ownership | Ledger-style Account Balance component derives balances from source records |
| Approval workflows | Dedicated Approval Workflow component |
| Reporting | Reporting reads normalized domain data and does not own source financial records |
| Background jobs | Dedicated Job Orchestration component |
| Documents and storage | Document Generation creates PDFs/exports; Storage persists files through local abstraction |
| Audit ownership | Dedicated append-only Audit component |
| Transactions | Financial operations use PostgreSQL transactions where possible; async side effects run after commit |
| Imports | Import validates/stages CSV rows and applies through domain services |

## Component Set

The application design defines these components:

1. Web Frontend
2. Backend API Shell
3. Identity and Access Control
4. Homeowner and Property
5. Billing Configuration
6. Invoice
7. Account Balance
8. Payment
9. Receipt
10. Penalty and Delinquency
11. Statement of Account
12. Reporting and Dashboard
13. Import
14. Notification
15. Document Generation
16. Storage
17. Audit
18. Approval Workflow
19. Job Orchestration
20. Shared Kernel

Detailed component responsibilities are documented in `components.md`.

## Service Layer

The application service layer coordinates domain components through explicit use-case services:

- User Access Service
- Homeowner Property Service
- Billing Configuration Service
- Billing Batch Service
- Invoice Issuance Service
- Payment Proof Service
- Payment Posting Service
- Financial Correction Service
- Penalty and Delinquency Service
- Statement Service
- Reporting Service
- Import Service
- Notification Service
- Document Service
- Job Service

Detailed orchestration behavior is documented in `services.md`.

## Interface Direction

The backend API will expose:

- Resource endpoints for standard create, read, update, search, and list workflows.
- Command endpoints for financial actions:
  - issue invoice
  - issue batch
  - post payment
  - reverse payment
  - approve request
  - reject request
  - waive penalty
  - generate SOA
  - generate report/export
  - resend email
  - apply import

All protected endpoints require authenticated `ActorContext`, request validation, route-level authorization, and domain-specific object authorization.

## Financial Transaction Model

Financial source records are owned by domain components:

- Invoice owns invoice source records.
- Payment owns payment, allocation, and credit source records.
- Receipt owns receipt records.
- Penalty and Delinquency owns penalty and waiver source records.
- Approval Workflow owns approval state and approved command coordination.
- Audit owns immutable audit entries.

Account Balance derives balances from these source records instead of acting as a mutable source of truth.

## Async Side Effects

The following work should run after financial commits:

- Email sends.
- Email retries.
- PDF generation when not required inside the immediate user flow.
- Batch SOA generation.
- Report exports.
- Reminder sends.

These jobs must be idempotent or duplicate-protected later during NFR Design and Functional Design.

## Artifact Index

- `components.md`: Component definitions, responsibilities, and interfaces.
- `component-methods.md`: High-level TypeScript-style method signatures.
- `services.md`: Application services and orchestration workflows.
- `component-dependency.md`: Dependency matrix and data-flow descriptions.
- `application-design.md`: Consolidated design summary.

## Design Completeness Check

- Requirements coverage: complete at component level.
- Story coverage: complete at epic and workflow level.
- Authorization model: central policy helpers plus domain object checks.
- Financial safety model: transactional source records plus derived balances.
- Reporting model: read/query model, no source-record ownership.
- Audit model: dedicated append-only component.
- Import model: staged validation and domain-service application.
- Document model: separate generation and storage responsibilities.
- Job model: dedicated orchestration component for async and scheduled work.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Application Design isolates authentication, authorization, audit, storage, request validation, approval workflow, and security-sensitive responsibilities. SECURITY-08 and SECURITY-11 are directly addressed. Detailed infrastructure checks remain for NFR and Infrastructure Design. |
| Property-Based Testing | N/A | PBT detailed property identification is not required until Functional Design. This design preserves boundaries for later PBT coverage of billing, allocation, penalties, SOA, import, and reconciliation logic. |

