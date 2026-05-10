# UOW-04 Logical Components

## Unit

- **Unit ID**: UOW-04
- **Unit Name**: Invoice Lifecycle and Invoice Source Records
- **Stage**: NFR Design

## Component Summary

| Component | Responsibility |
|---|---|
| RecurringBatchGeneration | Coordinates staff-triggered recurring draft generation for selected billing scope. |
| InvoiceValidationGateway | Resolves UOW-02 billable facts and UOW-03 configuration, returning typed success or safe failure. |
| DuplicateGuard | Enforces recurring invoice duplicate prevention and explicit cancelled-draft replacement rules. |
| InvoiceCalculationPolicy | Performs decimal-safe invoice amount calculation and total validation. |
| ManualInvoiceDraft | Validates and creates manual invoice drafts. |
| IssuanceCoordinator | Revalidates selected drafts and coordinates per-invoice issuance transactions. |
| NumberingAllocator | Allocates immutable issued invoice numbers using UOW-03 numbering metadata and PostgreSQL locking. |
| SnapshotWriter | Persists issued header and line snapshots. |
| LifecycleActionService | Handles draft cancellation, issued void requests, and issued reissue requests/completion. |
| BalanceInputPublisher | Creates invoice open-amount input facts for later balance derivation. |
| SupportIntentAdapter | Records durable document and email intents through UOW-01 support contracts. |
| AuthorizationPolicy | Enforces route and object/scope authorization. |
| AuditAdapter | Writes audit records through UOW-01 audit contracts. |
| ObservabilityAdapter | Emits metrics and structured safe events. |
| FrontendInteraction | Provides staff and homeowner-safe UI workflows. |
| PBTGenerators | Provides `fast-check` generators and state models for UOW-04 invariants. |

## RecurringBatchGeneration

| Aspect | Design |
|---|---|
| Inputs | Actor, billing period, charge type, generation scope, correlation ID. |
| Uses | InvoiceValidationGateway, DuplicateGuard, InvoiceCalculationPolicy, AuditAdapter, ObservabilityAdapter. |
| Outputs | Draft invoices, billing exceptions, summary counts. |
| NFR role | Meets 2,000-candidate first-scope batch target and retry-safe duplicate behavior. |

Processing remains backend-owned. The browser submits criteria and displays results.

## InvoiceValidationGateway

| Aspect | Design |
|---|---|
| Inputs | Property, billing account, billing period, validation date, charge type, operation context. |
| Uses | UOW-02 billable validation and UOW-03 typed resolution DTOs. |
| Outputs | Typed success facts or safe failure code. |
| NFR role | Centralizes fail-closed validation and blocks invoice creation/issuance on unresolved facts. |

Recurring candidate failures become billing exceptions. Issuance failures block the affected invoice and return per-invoice result.

## DuplicateGuard

| Aspect | Design |
|---|---|
| Inputs | Property, responsible billing account, charge type, billing period, invoice origin, replacement context. |
| Uses | Invoice repository and PostgreSQL duplicate indexes or constraints. |
| Outputs | Allow, duplicate blocked, or replacement allowed. |
| NFR role | Prevents duplicate recurring invoices under retry and concurrency conditions. |

Cancelled recurring draft replacement requires explicit linked replacement action with reason, actor, and audit.

## InvoiceCalculationPolicy

| Aspect | Design |
|---|---|
| Inputs | Lot area, rate, rounding metadata, charge type, manual line amount, calculation basis. |
| Uses | Shared decimal-safe helpers and UOW-03 rounding metadata. |
| Outputs | Line amount, total amount, calculation input metadata. |
| NFR role | Prevents floating-point financial errors and supports snapshot reproducibility. |

The policy rejects unvalidated decimal strings and JavaScript floating-point calculation.

## ManualInvoiceDraft

| Aspect | Design |
|---|---|
| Inputs | Actor, property or billing account, responsible homeowner, due date, lines, reason. |
| Uses | InvoiceValidationGateway, InvoiceCalculationPolicy, UOW-03 charge type validation, AuditAdapter. |
| Outputs | Manual draft invoice and line records. |
| NFR role | Ensures manual invoices use structured validation and configured charge types. |

Manual tax-like lines require UOW-03 manual-entry eligible tax-like charge type metadata.

## IssuanceCoordinator

| Aspect | Design |
|---|---|
| Inputs | Actor, selected draft invoice IDs, issuance date, correlation ID. |
| Uses | InvoiceValidationGateway, NumberingAllocator, SnapshotWriter, BalanceInputPublisher, SupportIntentAdapter, AuditAdapter, ObservabilityAdapter. |
| Outputs | Per-invoice issuance result. |
| NFR role | Enforces per-invoice transaction boundary and returns clear success/failure results. |

The coordinator does not assign numbers before validation succeeds.

## NumberingAllocator

| Aspect | Design |
|---|---|
| Inputs | Numbering scope, invoice ID, actor, correlation ID. |
| Uses | UOW-03 numbering metadata and PostgreSQL row-level or advisory locking. |
| Outputs | Immutable issued invoice number. |
| NFR role | Prevents duplicate issued invoice numbers under concurrent issuance. |

UOW-03 provides numbering metadata only. UOW-04 allocates invoice numbers.

## SnapshotWriter

| Aspect | Design |
|---|---|
| Inputs | Invoice, invoice lines, UOW-02 facts, UOW-03 resolution DTOs, calculation metadata. |
| Uses | Invoice persistence transaction. |
| Outputs | Issued header snapshot and issued line snapshots. |
| NFR role | Makes issued invoices reproducible after source data changes. |

Core facts use structured columns. Bounded metadata JSON is used only where structured columns are not justified.

## LifecycleActionService

| Aspect | Design |
|---|---|
| Inputs | Actor, invoice ID, action, reason, approval reference where applicable. |
| Uses | UOW-01 approval contracts, DuplicateGuard, AuditAdapter, ObservabilityAdapter. |
| Outputs | Cancelled draft, void request/result, or reissue request/result. |
| NFR role | Prevents in-place edits to issued invoices and preserves lifecycle traceability. |

Issued void and reissue actions require Treasurer approval.

## BalanceInputPublisher

| Aspect | Design |
|---|---|
| Inputs | Issued invoice ID, total amount, currency, effective date, status. |
| Uses | Invoice persistence transaction. |
| Outputs | Invoice open-amount input fact. |
| NFR role | Supplies UOW-04 source facts for later balance derivation without creating a mutable account balance. |

This component does not post payments, credits, penalties, or adjustments.

## SupportIntentAdapter

| Aspect | Design |
|---|---|
| Inputs | Issued invoice snapshot, intent type, actor, recipient context where applicable, correlation ID. |
| Uses | UOW-01 support-service contracts. |
| Outputs | Durable document or email intent record/status. |
| NFR role | Separates UOW-04 invoice validity from UOW-08 rendering, storage, delivery, and retries. |

Intent failure is visible but never invalidates a valid issued invoice.

## AuthorizationPolicy

| Aspect | Design |
|---|---|
| Inputs | Actor, action, invoice/property/billing-account/homeowner context. |
| Uses | UOW-01 actor context and permission helpers, UOW-02 ownership/account facts. |
| Outputs | Allow or safe denial. |
| NFR role | Enforces backend authorization, homeowner isolation, Board Member PII minimization, and Treasurer-only approvals. |

Frontend controls are not trusted as security controls.

## AuditAdapter

| Aspect | Design |
|---|---|
| Inputs | Actor, action, invoice IDs, reason, approval reference, source references, correlation ID. |
| Uses | UOW-01 audit contracts. |
| Outputs | Audit record. |
| NFR role | Provides immutable traceability for financial source-record changes. |

Audit writes are transactionally coupled with financial actions where practical.

## ObservabilityAdapter

| Aspect | Design |
|---|---|
| Inputs | Safe event name, safe identifiers, counts, status, duration, failure code, correlation ID. |
| Uses | Existing structured logging and metrics conventions. |
| Outputs | Redacted log event or metric. |
| NFR role | Supports operational diagnosis without exposing sensitive invoice or homeowner payloads. |

## FrontendInteraction

| Aspect | Design |
|---|---|
| Inputs | Server-authorized view models and action permissions. |
| Uses | UOW-04 API endpoints and existing protected shell conventions. |
| Outputs | Staff and homeowner-safe UI flows. |
| NFR role | Provides accessible, testable, non-JSON workflows with clear status separation. |

Components use paginated tables, safe validation summaries, keyboard-accessible controls, and stable `data-testid` values.

## PBTGenerators

| Aspect | Design |
|---|---|
| Inputs | Domain generators for candidate keys, invoice lines, numbering scopes, snapshots, decimals, and lifecycle commands. |
| Uses | `fast-check`. |
| Outputs | Property tests, state models, seeds, and shrunk counterexamples. |
| NFR role | Verifies high-risk financial and lifecycle invariants beyond example tests. |

## Key Request Flows

### Recurring Generation

1. FrontendInteraction submits generation criteria.
2. AuthorizationPolicy authorizes staff action.
3. RecurringBatchGeneration loads candidates.
4. InvoiceValidationGateway validates UOW-02 and UOW-03 facts.
5. DuplicateGuard blocks duplicates or allows explicit replacements.
6. InvoiceCalculationPolicy calculates draft line amounts.
7. Billing exceptions and draft invoices are persisted.
8. AuditAdapter and ObservabilityAdapter record safe events.

### Issuance

1. FrontendInteraction submits selected draft IDs.
2. AuthorizationPolicy authorizes issuance.
3. IssuanceCoordinator processes each invoice.
4. InvoiceValidationGateway revalidates the draft.
5. NumberingAllocator locks scope and assigns number.
6. SnapshotWriter persists issued snapshots.
7. BalanceInputPublisher persists invoice open-amount input facts.
8. AuditAdapter records issuance.
9. SupportIntentAdapter records requested document/email intents when requested.
10. ObservabilityAdapter emits safe metrics/events.

### Void/Reissue

1. FrontendInteraction submits request and reason.
2. AuthorizationPolicy authorizes request.
3. LifecycleActionService creates or references UOW-01 approval.
4. Approved action changes lifecycle without editing issued invoice in place.
5. Reissue creates a linked new invoice source record.
6. AuditAdapter and ObservabilityAdapter record the action.

## NFR Responsibility Mapping

| NFR Area | Primary Components |
|---|---|
| Batch performance | RecurringBatchGeneration, DuplicateGuard, ObservabilityAdapter |
| Duplicate prevention | DuplicateGuard, RecurringBatchGeneration |
| Number uniqueness | NumberingAllocator, IssuanceCoordinator |
| Snapshot durability | SnapshotWriter, IssuanceCoordinator |
| Decimal precision | InvoiceCalculationPolicy |
| Fail-closed validation | InvoiceValidationGateway |
| Authorization | AuthorizationPolicy |
| Approval | LifecycleActionService, AuthorizationPolicy |
| Audit | AuditAdapter |
| Safe logging | ObservabilityAdapter |
| Support boundary | SupportIntentAdapter |
| Frontend accessibility | FrontendInteraction |
| PBT | PBTGenerators |

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Logical components enforce backend authorization, object isolation, approval, audit, safe denial, PII minimization, and support-service boundaries. |
| Property-Based Testing | Compliant | PBTGenerators are a first-class logical component for UOW-04 financial and lifecycle invariants. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
