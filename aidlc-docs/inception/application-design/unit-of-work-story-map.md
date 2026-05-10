# Unit of Work Story Map

## Summary

All 48 user stories are assigned to exactly one primary unit. Supporting units are listed where acceptance criteria depend on cross-unit behavior such as documents, email, storage, portal integration, approvals, audit reports, or derived financial reads.

## Unit Story Coverage

| Unit ID | Primary Story IDs | Count |
|---|---|---|
| UOW-01 | US-001, US-002, US-003 | 3 |
| UOW-02 | US-004, US-005, US-006, US-007 | 4 |
| UOW-03 | US-008, US-009, US-010 | 3 |
| UOW-04 | US-011, US-012, US-013, US-014 | 4 |
| UOW-05 | US-015, US-016, US-017, US-018, US-019, US-044, US-045 | 7 |
| UOW-06 | US-020, US-021, US-022, US-023 | 4 |
| UOW-07 | US-024, US-025, US-026, US-027, US-028, US-029, US-030, US-031, US-032, US-033, US-034, US-035, US-036, US-037, US-038, US-039, US-040, US-041 | 18 |
| UOW-08 | US-042, US-043, US-046, US-047, US-048 | 5 |
| Total | US-001 through US-048 | 48 |

## Detailed Story Map

| Story ID | Story Title | Primary Unit | Supporting Units | Notes |
|---|---|---|---|---|
| US-001 | Invite and activate users | UOW-01 | UOW-08 | UOW-08 implements email delivery for invitations and password reset delivery. |
| US-002 | Manage HOA and system settings | UOW-01 | UOW-03, UOW-08 | UOW-01 owns settings shell; UOW-03 owns billing rules; UOW-08 owns SMTP/storage implementations. |
| US-003 | Enforce permission matrix | UOW-01 | All domain units | Domain units must enforce object-level and action-specific rules using UOW-01 helpers. |
| US-004 | Manage homeowner records | UOW-02 | UOW-01 | Audit and authorization come from UOW-01. |
| US-005 | Manage property records and uniqueness | UOW-02 | UOW-01, UOW-04 | UOW-04 consumes billable property validation for invoice generation. |
| US-006 | Preserve ownership history | UOW-02 | UOW-01, UOW-07 | UOW-07 reports consume ownership history. |
| US-007 | Approve homeowner contact change requests | UOW-02 | UOW-01, UOW-08 | Portal submission is completed during UOW-08 integration. |
| US-008 | Configure dues rate and billing cycles | UOW-03 | UOW-04, UOW-07 | Invoice and report units consume rate decisions. |
| US-009 | Configure due dates and grace periods | UOW-03 | UOW-04, UOW-06 | Invoice due dates and penalty eligibility consume this configuration. |
| US-010 | Configure charge types and manual tax-like charges | UOW-03 | UOW-04, UOW-07 | Manual tax-like charges remain explicit line items only. |
| US-011 | Generate draft recurring invoices | UOW-04 | UOW-02, UOW-03, UOW-07 | Billing exceptions later appear in reports. |
| US-012 | Review and issue invoices | UOW-04 | UOW-01, UOW-05, UOW-08 | UOW-05 consumes issued invoice balances; UOW-08 handles documents/email. |
| US-013 | Create manual invoices | UOW-04 | UOW-01, UOW-03, UOW-08 | Manual tax-like validation comes from UOW-03. |
| US-014 | Generate and send invoice PDFs | UOW-04 | UOW-08 | UOW-04 owns invoice snapshots; UOW-08 renders, stores, and emails PDFs. |
| US-015 | Submit homeowner payment proof | UOW-05 | UOW-01, UOW-08 | UOW-05 owns proof records; UOW-08 owns file storage and portal upload integration. |
| US-016 | Verify and post payments | UOW-05 | UOW-04 | UOW-05 allocates against invoice source records from UOW-04. |
| US-017 | Allocate payments automatically and manually | UOW-05 | UOW-04, UOW-07 | UOW-07 consumes allocation details for SOA/reports. |
| US-018 | Generate official or provisional receipts | UOW-05 | UOW-03, UOW-08 | UOW-03 provides numbering rules; UOW-08 renders/stores receipt PDFs. |
| US-019 | Reverse posted payments | UOW-05 | UOW-01, UOW-04 | Approval and audit come from UOW-01; invoice balances are affected through UOW-04 records. |
| US-020 | Detect overdue invoices and aging buckets | UOW-06 | UOW-03, UOW-04, UOW-05, UOW-07 | UOW-07 consumes aging output. |
| US-021 | Apply recurring monthly penalties | UOW-06 | UOW-03, UOW-04, UOW-05 | Non-compounding and duplicate prevention are UOW-06 rules. |
| US-022 | Waive penalties with Treasurer approval | UOW-06 | UOW-01, UOW-05 | Approval comes from UOW-01; balance impact flows through account balance records. |
| US-023 | Send overdue reminders | UOW-06 | UOW-08 | UOW-06 owns eligibility; UOW-08 sends and retries email. |
| US-024 | Generate homeowner or property SOA | UOW-07 | UOW-02, UOW-04, UOW-05, UOW-06 | SOA must reconcile to source records. |
| US-025 | Download and email SOA PDFs | UOW-07 | UOW-08 | UOW-07 owns SOA data; UOW-08 renders, stores, emails, and authorizes download. |
| US-026 | View operational dashboard | UOW-07 | UOW-01, UOW-02, UOW-04, UOW-05, UOW-06 | Dashboard is read-only for board users. |
| US-027 | Generate billing summary report | UOW-07 | UOW-04 | Totals reconcile with issued invoices and manual lines. |
| US-028 | Generate collection report | UOW-07 | UOW-05 | Pending proofs and reversed payments remain visible. |
| US-029 | Generate aging receivables report | UOW-07 | UOW-04, UOW-05, UOW-06 | Aging totals reconcile with unpaid balances, credits, penalties, and adjustments. |
| US-030 | Generate delinquent homeowners report | UOW-07 | UOW-02, UOW-06 | Board access is read-only. |
| US-031 | Generate invoice register | UOW-07 | UOW-04 | Voided and cancelled invoices remain visible. |
| US-032 | Generate payment register | UOW-07 | UOW-05 | Pending, posted, reversed, cancelled, and failed states remain distinguishable. |
| US-033 | Generate receipt register | UOW-07 | UOW-05 | Receipt numbers are not reused. |
| US-034 | Generate adjustment report | UOW-07 | UOW-01, UOW-05, UOW-08 | Opening balance adjustments from UOW-08 are included after import integration. |
| US-035 | Generate penalty report | UOW-07 | UOW-06 | Assessed and waived penalties remain traceable. |
| US-036 | Generate homeowner master list | UOW-07 | UOW-02 | PII restrictions must be enforced. |
| US-037 | Generate property master list | UOW-07 | UOW-02 | Duplicate-sensitive fields are visible for review. |
| US-038 | Generate statement of account batch report | UOW-07 | UOW-08 | UOW-08 runs batch jobs and stores outputs. |
| US-039 | Generate monthly collection summary | UOW-07 | UOW-04, UOW-05 | Totals reconcile with invoices and posted payments. |
| US-040 | Generate year-to-date billing and collection report | UOW-07 | UOW-04, UOW-05 | Report supports fiscal or calendar year filters. |
| US-041 | Generate audit trail report | UOW-07 | UOW-01 | UOW-01 owns audit records; UOW-07 owns report output. |
| US-042 | Import homeowners and properties | UOW-08 | UOW-02, UOW-07 | Import applies through UOW-02 services and produces exception output. |
| US-043 | Import opening balances as adjustments | UOW-08 | UOW-01, UOW-05, UOW-07 | Opening balances require approval and become adjustment entries, not mutable starting balances. |
| US-044 | Approve financial adjustments | UOW-05 | UOW-01, UOW-04, UOW-06 | UOW-01 owns approval engine; UOW-05 owns cross-financial correction coordination. |
| US-045 | Preserve immutable financial history | UOW-05 | UOW-04, UOW-06, UOW-07 | Financial records are corrected through linked records, not deletion. |
| US-046 | View homeowner account overview | UOW-08 | UOW-02, UOW-04, UOW-05, UOW-06, UOW-07 | Final portal composition after domain read models exist. |
| US-047 | Download homeowner documents | UOW-08 | UOW-04, UOW-05, UOW-07 | Document access uses stored source records and object authorization. |
| US-048 | Send account and transaction emails | UOW-08 | UOW-01, UOW-03, UOW-04, UOW-05, UOW-06, UOW-07 | Financial transactions remain valid if email delivery fails. |

## Security-Sensitive Story Ownership

| Story ID | Security Concern | Owning Unit |
|---|---|---|
| US-001 | Account activation, role binding, MFA support | UOW-01 |
| US-003 | Permission matrix, object-level authorization, denial logging | UOW-01 |
| US-007 | Homeowner contact request ownership | UOW-02 |
| US-013 | Unauthorized manual invoice prevention | UOW-04 |
| US-014 | Homeowner-only invoice PDF access | UOW-04 primary, UOW-08 support |
| US-015 | Payment proof file ownership, type, and size validation | UOW-05 primary, UOW-08 support |
| US-018 | Homeowner-only receipt access | UOW-05 primary, UOW-08 support |
| US-019 | Treasurer-only reversal approval | UOW-05 |
| US-022 | Treasurer-only waiver approval | UOW-06 |
| US-024 | Homeowner-only SOA access | UOW-07 |
| US-026 | Role-restricted dashboard mutation controls | UOW-07 |
| US-036 | PII-restricted homeowner master list | UOW-07 |
| US-041 | Immutable audit trail report | UOW-07 primary, UOW-01 support |
| US-044 | Approval controls for sensitive financial changes | UOW-05 primary, UOW-01 support |
| US-046 | Homeowner-only account overview | UOW-08 |
| US-047 | Homeowner-only document download | UOW-08 |

## Financial Property Candidates for Functional Design

| Unit | Candidate Properties |
|---|---|
| UOW-03 | Rate effective-date resolution, due date calculation, rounding stability, manual tax-like charge validation |
| UOW-04 | Draft generation duplicate prevention, invoice snapshot immutability, invoice total equals line totals, issued numbering uniqueness |
| UOW-05 | Allocation totals equal posted payment amount, allocations never exceed open balances, credits equal overpayment remainder, reversal restores observable balance impact |
| UOW-06 | Penalty non-compounding, duplicate penalty prevention by invoice and period, waiver does not delete original penalty |
| UOW-07 | Opening balance plus activity equals ending balance, report totals reconcile to source records, exports preserve row counts and totals |
| UOW-08 | Import valid rows apply exactly once, invalid rows never partially apply, job retries are idempotent |

## Coverage Validation

- Expected stories: US-001 through US-048.
- Primary story assignments: 48.
- Missing primary story assignments: none.
- Duplicate primary story assignments: none.
- Cross-unit supporting relationships are documented where acceptance criteria span units.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Security-sensitive stories have owning units and supporting units. Object-level access, approval controls, PII restrictions, upload controls, document access, and audit immutability are traceable. |
| Property-Based Testing | Compliant for Units Generation | Financial and transformation-heavy units include explicit PBT candidate properties for later Functional Design. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables are used for story mapping.
