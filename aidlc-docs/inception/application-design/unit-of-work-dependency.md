# Unit of Work Dependencies

## Dependency Strategy

The approved plan uses strict sequential construction. Later units may consume earlier contracts and data models, but earlier units must not reach forward into later implementations.

Financial source-record dependencies are intentionally conservative:

1. Foundation and audit before every protected workflow.
2. Homeowner and property master data before billing.
3. Billing configuration before invoice source records.
4. Invoice source records before payment allocation.
5. Payment and receipt source records before penalties and derived outputs.
6. Penalties before SOA and reports.
7. SOA and reports before final portal, import, document, notification, storage, and job integration.

## Build Sequence

| Order | Unit ID | Unit Name | Direct Prerequisites |
|---|---|---|---|
| 1 | UOW-01 | Platform Foundation, Access, Settings, Audit, and Approval Core | None |
| 2 | UOW-02 | Homeowner, Property, Ownership, and Contact Requests | UOW-01 |
| 3 | UOW-03 | Billing Configuration and Charge Rules | UOW-01 |
| 4 | UOW-04 | Invoice Lifecycle and Invoice Source Records | UOW-01, UOW-02, UOW-03 |
| 5 | UOW-05 | Payments, Allocations, Credits, Receipts, and Financial Corrections | UOW-01, UOW-02, UOW-03, UOW-04 |
| 6 | UOW-06 | Penalties, Delinquency, Waivers, and Reminders | UOW-01, UOW-03, UOW-04, UOW-05 |
| 7 | UOW-07 | Statements, Reports, Dashboards, and Exports | UOW-01, UOW-02, UOW-03, UOW-04, UOW-05, UOW-06 |
| 8 | UOW-08 | Imports, Opening Balances, Support Services, Jobs, and Portal Integration | UOW-01, UOW-02, UOW-03, UOW-04, UOW-05, UOW-06, UOW-07 |

## Prerequisite Matrix

Cell value `Required` means the column unit must be available before the row unit can be completed.

| Row Unit | UOW-01 | UOW-02 | UOW-03 | UOW-04 | UOW-05 | UOW-06 | UOW-07 | UOW-08 |
|---|---|---|---|---|---|---|---|---|
| UOW-01 | Self | - | - | - | - | - | - | - |
| UOW-02 | Required | Self | - | - | - | - | - | - |
| UOW-03 | Required | - | Self | - | - | - | - | - |
| UOW-04 | Required | Required | Required | Self | - | - | - | - |
| UOW-05 | Required | Required | Required | Required | Self | - | - | - |
| UOW-06 | Required | - | Required | Required | Required | Self | - | - |
| UOW-07 | Required | Required | Required | Required | Required | Required | Self | - |
| UOW-08 | Required | Required | Required | Required | Required | Required | Required | Self |

## Contract Dependencies

| Provider | Consumers | Contract |
|---|---|---|
| UOW-01 | All units | Actor context, auth guards, permission checks, object authorization helpers, audit API, approval request API, shared kernel types, transaction context |
| UOW-01 | UOW-04, UOW-05, UOW-06, UOW-07, UOW-08 | Document, notification, storage, and job interfaces without concrete adapters |
| UOW-02 | UOW-04, UOW-05, UOW-07, UOW-08 | Homeowner, property, ownership, billing account, billable property validation, owner visibility |
| UOW-03 | UOW-04, UOW-05, UOW-06, UOW-07, UOW-08 | Rates, billing periods, due dates, grace periods, charge types, numbering rules, payment methods, template references |
| UOW-04 | UOW-05, UOW-06, UOW-07, UOW-08 | Invoice source records, issued invoice snapshots, invoice balances, invoice status, invoice query models |
| UOW-05 | UOW-06, UOW-07, UOW-08 | Payment, allocation, credit, receipt, reversal, correction, and balance-impact source records |
| UOW-06 | UOW-07, UOW-08 | Penalty source records, waiver records, aging classification, reminder eligibility |
| UOW-07 | UOW-08 | SOA output, report output, dashboard read models, export requests, report access rules |
| UOW-08 | All units after integration | Concrete PDF/export rendering, filesystem storage, SMTP delivery, queued jobs, portal integration |

## Financial Dependency Controls

| Control | Enforcement |
|---|---|
| Payments cannot exist before invoice contracts | UOW-05 depends on UOW-04 and must allocate only against invoice source records from UOW-04 |
| Receipts cannot be generated from unposted payments | UOW-05 owns both payment posting and receipt source records in one transaction boundary |
| Penalties cannot be assessed before due date and invoice status rules exist | UOW-06 depends on UOW-03 and UOW-04 |
| SOA and reports cannot own balances | UOW-07 consumes source records and Account Balance views from UOW-04 through UOW-06 |
| Imports cannot bypass domain validation | UOW-08 must call UOW-02, UOW-05, and approval services rather than direct table writes |
| Support services cannot roll back committed financial records | UOW-08 document, storage, notification, and job failures are asynchronous side effects after financial commits |
| Audit cannot be optional for financial mutations | UOW-01 audit contract is a prerequisite for UOW-04 through UOW-08 financial or security-sensitive workflows |

## Cross-Unit Story Completion Notes

Some stories have a primary unit and a support unit. The primary unit owns business behavior, while support units complete document, email, storage, job, or portal integration acceptance criteria.

| Story Area | Primary Unit | Supporting Units | Completion Rule |
|---|---|---|---|
| Invoice PDFs and email | UOW-04 | UOW-08 | UOW-04 queues document/email intents; UOW-08 implements delivery |
| Payment proof upload storage | UOW-05 | UOW-08 | UOW-05 owns proof records; UOW-08 owns file persistence |
| Receipt PDFs | UOW-05 | UOW-08 | UOW-05 owns receipt source records; UOW-08 renders and stores PDFs |
| Reminder emails | UOW-06 | UOW-08 | UOW-06 owns eligibility; UOW-08 sends and retries emails |
| SOA/report exports | UOW-07 | UOW-08 | UOW-07 owns data models; UOW-08 renders and stores exports |
| Homeowner portal overview | UOW-08 | UOW-02, UOW-04, UOW-05, UOW-06, UOW-07 | UOW-08 composes read models from prior units |

## Risk Controls

- If a later unit reveals a missing source-record field in an earlier financial unit, stop construction and revise the earlier Functional Design. Do not patch around missing financial ownership in a report, import, or support unit.
- If a unit needs a support adapter before UOW-08, use the UOW-01 interface and a test/null adapter. Do not implement duplicate document, email, storage, or job logic inside domain units.
- If report reconciliation does not tie back to source records from UOW-04 through UOW-06, UOW-07 is incomplete.
- If import opening balances cannot be represented as approved adjustments, UOW-08 is blocked until the adjustment model is corrected.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Dependencies require auth, authorization, audit, approval, and shared validation before all protected and financial units. Upload, storage, notification, and report PII concerns are isolated for later detailed enforcement. |
| Property-Based Testing | Compliant for Units Generation | Dependencies preserve clear units for later PBT property identification and prevent report/import/support units from hiding financial invariants. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables are used for matrix representation.
