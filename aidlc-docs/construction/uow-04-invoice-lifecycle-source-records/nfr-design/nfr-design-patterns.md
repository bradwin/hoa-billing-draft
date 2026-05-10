# UOW-04 NFR Design Patterns

## Unit

- **Unit ID**: UOW-04
- **Unit Name**: Invoice Lifecycle and Invoice Source Records
- **Stage**: NFR Design

## Design Boundary

UOW-04 creates invoice source records, invoice line amounts, billing exceptions, issued invoice numbers, issued snapshots, lifecycle actions, invoice open-amount input facts, and document/email support intents.

UOW-04 does not create payments, allocations, credits, receipts, penalties, adjustments, statements, reports, rendered PDFs, sent emails, stored files, import batches, or mutable account-balance source-of-truth records.

## Recurring Batch Generation Pattern

| Pattern Element | Design |
|---|---|
| Trigger | Staff-triggered backend command. |
| First-scope capacity | Up to 2,000 candidate properties per recurring batch. |
| Processing | Synchronous command for first scope, with internal chunking where useful. |
| Result | Persisted draft invoices, persisted billing exceptions, duplicate-block count, and summary counts. |
| Retry behavior | Retry-safe through duplicate guard and persisted exception records. |
| Client role | The browser submits criteria and displays results; it does not generate invoices client-side. |

The generation command evaluates each candidate through UOW-02 billable validation and UOW-03 configuration resolution. Failures create billing exceptions. Success candidates pass through duplicate prevention before draft creation.

## Issuance Transaction Pattern

| Pattern Element | Design |
|---|---|
| Transaction boundary | Per-invoice issuance transaction inside selected batch processing. |
| Revalidation | Revalidate each selected draft before issuance. |
| Numbering | Lock the numbering sequence or scope before assigning the issued number. |
| Snapshot | Persist issued header snapshot, line snapshots, and calculation inputs in the same issuance transaction where practical. |
| Balance input | Persist invoice open-amount input facts with the issued invoice. |
| Audit | Write issuance audit with actor, invoice ID, issued number, source references, and correlation ID. |
| Result | Return per-invoice success or failure result. |

Batch issuance may process selected invoices independently. A failure for one selected invoice does not require rolling back already successful invoice issuance results.

## Duplicate Prevention and Replacement Pattern

| Pattern Element | Design |
|---|---|
| Service guard | Check for existing non-voided recurring invoices by property, responsible billing account, charge type, and billing period. |
| Persistence guard | Use PostgreSQL-backed unique or indexed duplicate key constraints where practical. |
| Cancelled draft replacement | Requires explicit linked replacement action with reason, actor, and audit. |
| Voided records | Preserve history and invoice number; do not reuse invoice numbers. |
| Conflict result | Return stable safe duplicate/conflict errors. |

The duplicate guard exists in both service logic and persistence constraints because financial duplicate prevention cannot rely on staff review or frontend controls.

## Issued-Number Concurrency Pattern

| Pattern Element | Design |
|---|---|
| Numbering scope | Derived from UOW-03 numbering metadata at issuance time. |
| Locking | Use PostgreSQL row-level or advisory lock per numbering scope. |
| Uniqueness | Enforce unique issued invoice number per applicable scope. |
| Race handling | Return stable conflict error and do not issue duplicate numbers. |
| Ownership | UOW-04 allocates actual invoice numbers; UOW-03 only stores numbering metadata. |

Draft invoices use internal IDs and never consume issued invoice numbers.

## Fail-Closed Validation Pattern

| Pattern Element | Design |
|---|---|
| Gateway | InvoiceValidationGateway resolves UOW-02 billable facts and UOW-03 configuration. |
| Success | Typed validation result with source facts and configuration snapshots. |
| Failure | Safe reason-coded failure. |
| Recurring candidate failure | Persist billing exception. |
| Issuance failure | Block issuance and return safe validation result. |
| Staff override | No direct form override for missing source facts. |

UOW-04 must not fill missing values from previous invoices or create invoices with placeholders.

## Snapshot Durability Pattern

| Pattern Element | Design |
|---|---|
| Header snapshot | Persist issued invoice header facts as durable source records. |
| Line snapshot | Persist issued line facts and calculation inputs. |
| Structured columns | Use typed columns for core facts. |
| Metadata JSON | Allow bounded metadata JSON only for snapshot facts that do not justify separate columns. |
| Timing | Create snapshots transactionally with issuance where practical. |
| Reproduction | Historical invoices remain reproducible after UOW-02 or UOW-03 changes. |

Generated PDFs are not invoice history. Current UOW-02 and UOW-03 records are not sufficient to reconstruct issued invoices.

## Decimal and Rounding Pattern

| Pattern Element | Design |
|---|---|
| Calculation policy | Central InvoiceCalculationPolicy component. |
| Decimal representation | Integer minor units or validated decimal representations. |
| Helpers | Shared decimal-safe helpers. |
| Rounding | UOW-03 rounding metadata controls line or total rounding behavior. |
| Snapshot | Snapshot inputs, outputs, rate, lot area, rounding rule, and configuration references. |
| Prohibited behavior | JavaScript floating-point invoice calculation. |

Invoice total must equal line totals after configured rounding behavior.

## Support-Intent Pattern

| Pattern Element | Design |
|---|---|
| Adapter | SupportIntentAdapter records document/email intents through UOW-01 contracts. |
| Source | Intents reference issued invoice snapshots. |
| Timing | Record after or within issuance as appropriate for the command. |
| Failure | Intent failure is visible but never invalidates a valid issued invoice. |
| Ownership | UOW-08 owns PDF rendering, file storage, SMTP delivery, retries, and document downloads. |

UOW-04 does not render PDFs or send emails synchronously during issuance.

## Security and Authorization Pattern

| Pattern Element | Design |
|---|---|
| Actor context | UOW-01 actor context is required. |
| Route guards | Backend route guards protect every read and mutation. |
| Object/scope policy | Invoice access is constrained by invoice, property, billing account, and homeowner authorization. |
| Treasurer approval | Issued void and reissue require Treasurer approval. |
| Homeowner isolation | Homeowners can read only their own authorized invoice read models. |
| Board Member access | Read-only and PII-minimized. |
| Denials | Safe denial response plus audit/security event where appropriate. |

Frontend route protection and hidden controls are not authorization controls.

## Observability and Logging Pattern

| Signal | Design |
|---|---|
| Generation | Emit started/completed counts and duration. |
| Exceptions | Emit exception count by safe failure code. |
| Duplicates | Emit duplicate block count. |
| Issuance | Emit success/failure counts and duration. |
| Numbering conflicts | Emit safe conflict signal. |
| Validation failures | Emit safe failure code and correlation ID. |
| Denied access | Emit security/audit event. |
| Lifecycle approvals | Emit void/reissue request and decision events. |
| Snapshot creation | Emit count and correlation ID. |
| Support intents | Emit document/email intent request status. |

Logs may include safe identifiers and aggregate counts. Logs must not include full homeowner PII, full invoice payloads, payment-like details, or email recipient payloads.

## Frontend NFR Pattern

| Pattern Element | Design |
|---|---|
| Data loading | Server-authorized data only. |
| Lists | Paginated, filtered, server-sorted tables. |
| Batch review | Keyboard-accessible review and selection flow. |
| Issuance | Clear per-invoice result display. |
| Validation | Safe validation summaries. |
| Testability | Stable `data-testid` values. |
| Status display | Lifecycle status is clearly separate from payment-derived status. |
| Editing | Structured forms and tables, not JSON-only editing. |

## PBT Design Pattern

| Property Area | Design |
|---|---|
| Duplicate keys | Generate recurring candidates, duplicate keys, cancelled/replacement cases, and voided cases. |
| Numbering scopes | Generate concurrent-like issued number allocation sequences and conflict cases. |
| Invoice lines and totals | Generate valid line sets, rounding modes, and totals. |
| Snapshots | Generate source changes after issuance and assert snapshot immutability. |
| Decimal cases | Generate area/rate/money edge cases and rounding boundaries. |
| Void/reissue transitions | Generate valid and invalid lifecycle state commands. |
| Reproducibility | Capture seeds and shrunk counterexamples for regression tests. |

PBT uses centralized `fast-check` generators and state models. Ad hoc primitive-only generators are insufficient for UOW-04 financial invariants.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Patterns require backend authorization, object isolation, Treasurer approval, safe denials, audit/security events, safe logging, PII minimization, and support-service boundaries. |
| Property-Based Testing | Compliant | Patterns define centralized `fast-check` generators, state models, seed replay, shrinking capture, and UOW-04 financial invariants. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
