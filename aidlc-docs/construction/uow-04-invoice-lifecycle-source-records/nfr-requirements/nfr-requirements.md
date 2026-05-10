# UOW-04 NFR Requirements

## Unit

- **Unit ID**: UOW-04
- **Unit Name**: Invoice Lifecycle and Invoice Source Records
- **Stage**: NFR Requirements

## Scope

UOW-04 creates invoice source records, invoice line amounts, issued invoice numbers, immutable issued snapshots, billing exceptions, lifecycle actions, invoice open-amount input facts, and document/email support intents. These records become financial source data for later payment, penalty, statement, report, document, email, and portal units.

UOW-04 must not create payments, allocations, credits, receipts, penalties, adjustments, statements, reports, rendered PDFs, sent emails, stored files, import batches, or mutable account-balance source-of-truth records.

## Scalability Requirements

| Requirement ID | Requirement |
|---|---|
| UOW04-NFR-SCALE-001 | UOW-04 first-scope capacity target is up to 25 operational users. |
| UOW04-NFR-SCALE-002 | UOW-04 recurring generation must support up to 2,000 billable candidate properties per recurring batch. |
| UOW04-NFR-SCALE-003 | UOW-04 assumes low-frequency staff-triggered recurring generation for the first HOA scope. |
| UOW04-NFR-SCALE-004 | Staff review screens must use pagination, filters, and server-side sorting for drafts, exceptions, issued invoices, and lifecycle history. |
| UOW04-NFR-SCALE-005 | UOW-04 must not require distributed batch workers, a separate search database, or a distributed workflow engine for the first scope. |

## Performance Requirements

| Requirement ID | Requirement |
|---|---|
| UOW04-NFR-PERF-001 | Recurring draft generation must generate drafts and exceptions for 2,000 candidate properties within 60 seconds in normal conditions. |
| UOW04-NFR-PERF-002 | Recurring generation must provide progress or result visibility, including created draft count, exception count, and duplicate block count. |
| UOW04-NFR-PERF-003 | Recurring generation retries must not create duplicate invoices. |
| UOW04-NFR-PERF-004 | Protected invoice list and detail queries must target p95 under 500 ms for first-scope data. |
| UOW04-NFR-PERF-005 | Single-invoice issuance must target p95 under 2 seconds in normal conditions. |
| UOW04-NFR-PERF-006 | Batch issuance may process selected invoices with per-invoice success or failure results rather than requiring all selected invoices to succeed together. |

## Reliability and Transactionality Requirements

| Requirement ID | Requirement |
|---|---|
| UOW04-NFR-REL-001 | Issuance must revalidate each selected draft before issuing it. |
| UOW04-NFR-REL-002 | Issuance must number, snapshot, create open-amount input facts, and audit each issued invoice transactionally where practical. |
| UOW04-NFR-REL-003 | PostgreSQL transactions, unique constraints, and row-level or advisory locking must prevent duplicate recurring invoices and duplicate issued numbers under concurrent requests. |
| UOW04-NFR-REL-004 | Missing or ambiguous UOW-02 or UOW-03 source facts must fail closed with safe reason-coded errors or billing exceptions. |
| UOW04-NFR-REL-005 | UOW-04 must not create or issue invoices until required source facts are valid and resolvable. |
| UOW04-NFR-REL-006 | Durable document and email support intents may be recorded after or within the invoice transaction as appropriate, but intent failure must not roll back a valid issued invoice. |

## Durability and Recovery Requirements

| Requirement ID | Requirement |
|---|---|
| UOW04-NFR-DUR-001 | Issued invoice source records, line records, number assignments, snapshots, open-amount input facts, lifecycle actions, and audit references must be durable. |
| UOW04-NFR-DUR-002 | Issued invoice records and snapshots must be included in encrypted PostgreSQL backup and restore controls. |
| UOW04-NFR-DUR-003 | Issued snapshots must not be reconstructable views only. They must persist enough source facts to reproduce historical invoices after UOW-02 or UOW-03 changes. |
| UOW04-NFR-DUR-004 | Voided, cancelled, and reissued invoices must preserve history, invoice numbers, linkage, reason, actor, and audit references. |

## Security Requirements

| Requirement ID | Requirement |
|---|---|
| UOW04-NFR-SEC-001 | UOW-04 must enforce backend route authorization for every invoice read and mutation. |
| UOW04-NFR-SEC-002 | UOW-04 must enforce role and object/scope authorization for staff, Treasurer, Board Member, and homeowner access. |
| UOW04-NFR-SEC-003 | Homeowners may access only invoices tied to their authorized billing accounts, properties, or homeowner profile. |
| UOW04-NFR-SEC-004 | Board Member invoice access must be read-only and PII-minimized. |
| UOW04-NFR-SEC-005 | Issued void and reissue actions require Treasurer approval through UOW-01 approval contracts. |
| UOW04-NFR-SEC-006 | Authorization denials and sensitive invoice lifecycle actions must produce audit or security events through UOW-01 contracts. |
| UOW04-NFR-SEC-007 | Frontend role hiding must not be treated as an authorization control. |

## Logging and Privacy Requirements

| Requirement ID | Requirement |
|---|---|
| UOW04-NFR-LOG-001 | Structured logs may include correlation ID, invoice ID, batch ID, action, status, safe failure code, and aggregate counts. |
| UOW04-NFR-LOG-002 | Logs must not include full homeowner PII, full invoice payloads, payment-like details, or email recipient payloads. |
| UOW04-NFR-LOG-003 | Safe errors must avoid leaking internal implementation details, unauthorized object identifiers, or sensitive homeowner data. |

## Precision Requirements

| Requirement ID | Requirement |
|---|---|
| UOW04-NFR-PREC-001 | UOW-04 invoice amount calculation must use decimal-safe helpers and integer minor units or validated decimal representations. |
| UOW04-NFR-PREC-002 | UOW-04 must never use JavaScript floating point for invoice amount calculation. |
| UOW04-NFR-PREC-003 | UOW-04 must preserve UOW-03 rate, lot area, and rounding rules in issued invoice snapshots. |
| UOW04-NFR-PREC-004 | Invoice total must equal line totals after configured rounding behavior. |

## Data and Query Requirements

| Requirement ID | Requirement |
|---|---|
| UOW04-NFR-DATA-001 | UOW-04 must use typed PostgreSQL invoice tables for invoice, line, number, snapshot, exception, lifecycle, and intent data. |
| UOW04-NFR-DATA-002 | UOW-04 must include indexed duplicate keys for recurring invoice prevention. |
| UOW04-NFR-DATA-003 | UOW-04 must include indexes for lifecycle/status filters, billing period filters, property/account filters, and issued invoice number lookups. |
| UOW04-NFR-DATA-004 | JSON may be used only for bounded snapshot metadata where structured columns are not justified. |
| UOW04-NFR-DATA-005 | UOW-04 must not store invoices only as generic JSON documents. |

## Validation Requirements

| Requirement ID | Requirement |
|---|---|
| UOW04-NFR-VAL-001 | UOW-04 must use shared TypeScript domain validators for invoice lifecycle, duplicate keys, issuance checks, manual invoice lines, and calculation inputs. |
| UOW04-NFR-VAL-002 | UOW-04 must use Zod request schemas for API input validation. |
| UOW04-NFR-VAL-003 | Validation must align with existing shared-kernel, UOW-02, and UOW-03 patterns. |
| UOW04-NFR-VAL-004 | Database constraints are required as defense-in-depth but are not sufficient as the only validation layer. |

## Accessibility and Usability Requirements

| Requirement ID | Requirement |
|---|---|
| UOW04-NFR-UX-001 | UOW-04 frontend forms and tables must be WCAG 2.2 AA-oriented. |
| UOW04-NFR-UX-002 | Batch review and issue workflows must be keyboard-accessible. |
| UOW04-NFR-UX-003 | Validation failures must use clear safe summaries. |
| UOW04-NFR-UX-004 | UOW-04 frontend elements must use stable `data-testid` values. |
| UOW04-NFR-UX-005 | Normal staff workflows must not require JSON-only editing. |
| UOW04-NFR-UX-006 | UI must explicitly separate UOW-04 lifecycle status from payment-derived status. |

## Observability Requirements

| Requirement ID | Requirement |
|---|---|
| UOW04-NFR-OBS-001 | UOW-04 must emit metrics or structured events for recurring generation started and completed. |
| UOW04-NFR-OBS-002 | UOW-04 must expose exception counts and duplicate block counts. |
| UOW04-NFR-OBS-003 | UOW-04 must emit signals for issuance success, issuance failure, numbering conflicts, and validation failures. |
| UOW04-NFR-OBS-004 | UOW-04 must emit signals for denied access. |
| UOW04-NFR-OBS-005 | UOW-04 must emit signals for void and reissue requests and decisions. |
| UOW04-NFR-OBS-006 | UOW-04 must emit signals for snapshot creation and document/email intent requests. |

## Testing Requirements

| Requirement ID | Requirement |
|---|---|
| UOW04-NFR-TEST-001 | UOW-04 must include example-based tests for recurring generation, billing exceptions, manual invoice creation, issuance, cancellation, void/reissue request flow, authorization, and support intents. |
| UOW04-NFR-TEST-002 | UOW-04 must include `fast-check` PBT for duplicate prevention. |
| UOW04-NFR-TEST-003 | UOW-04 must include `fast-check` PBT for issued numbering uniqueness. |
| UOW04-NFR-TEST-004 | UOW-04 must include `fast-check` PBT for invoice total equals line totals. |
| UOW04-NFR-TEST-005 | UOW-04 must include `fast-check` PBT for issued snapshot immutability. |
| UOW04-NFR-TEST-006 | UOW-04 must include `fast-check` PBT for decimal rounding stability. |
| UOW04-NFR-TEST-007 | UOW-04 must include `fast-check` PBT for void and reissue state transitions. |

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Requirements include backend authorization, object isolation, Treasurer approval, audit/security events, safe logging, PII minimization, encrypted backup/restore inclusion, and no client-side security reliance. |
| Property-Based Testing | Compliant | Requirements explicitly mandate `fast-check` PBT for UOW-04 financial and lifecycle invariants. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
