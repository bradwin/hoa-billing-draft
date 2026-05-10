# UOW-06 Frontend Components

## Unit

- **Unit ID**: UOW-06
- **Unit Name**: Penalties, Delinquency, Waivers, and Reminders
- **Stage**: Functional Design

## Frontend Scope

UOW-06 frontend surfaces support staff workflows for overdue review, aging classification, penalty run review, penalty application, waiver request and approval tracking, delinquency review, reminder eligibility review, and reminder intent status. Homeowner-safe views expose only authorized penalty, waiver, delinquency, and reminder status. All data must come from server-authorized APIs. Frontend controls must not be treated as authorization.

## Component Summary

| Component | Primary Actor | Purpose |
|---|---|---|
| `PenaltyWorkspace` | Staff | Main staff workspace for overdue review, penalty runs, waiver queues, aging, delinquency, and reminders. |
| `OverdueReviewPanel` | Staff | Review issued invoices that are overdue as of selected `evaluationDate`. |
| `AgingClassificationPanel` | Staff/Board Member | View aging buckets and delinquent amount by invoice or account scope. |
| `PenaltyRunPanel` | Staff | Create or review draft penalty run candidates before applying. |
| `PenaltyCandidateTable` | Staff | Display penalty candidates, basis amounts, exclusions, rule references, and blocking issues. |
| `PenaltySourceRecordDetail` | Staff/Homeowner | View applied penalty source facts and lifecycle status. |
| `PenaltyWaiverRequestPanel` | Staff/Treasurer | Request, review, approve, reject, or track penalty waiver requests. |
| `DelinquencyStatusPanel` | Staff/Homeowner/Board Member | View delinquency status and amount from derived source facts. |
| `ReminderEligibilityPanel` | Staff | Review reminder eligibility, suppression reason, and duplicate status. |
| `ReminderIntentStatusPanel` | Staff/Homeowner | View reminder intent status without rendering or sending email. |
| `HomeownerDelinquencyPage` | Homeowner | View homeowner-safe penalty, waiver, delinquency, and reminder status. |

## Overdue Review Panel

| Element | Behavior |
|---|---|
| Evaluation date control | Staff selects explicit `evaluationDate`; server clock is not implied. |
| Scope filters | Filters by billing account, property, invoice, homeowner, and status where authorized. |
| Overdue table | Shows issued non-voided invoices with due date, grace period, first overdue date, and open amount. |
| Source fact detail | Shows source invoice, payment, allocation, credit, reversal, correction, and waiver references used in evaluation. |
| Review action | Opens penalty candidate or aging detail for selected records. |

Stable test IDs:

| Test ID | Purpose |
|---|---|
| `overdue-review-panel` | Root overdue review panel. |
| `overdue-evaluation-date-input` | Explicit evaluation date control. |
| `overdue-invoice-table` | Overdue invoice results. |
| `overdue-source-fact-detail` | Source fact reference detail. |

## Aging Classification Panel

| Element | Behavior |
|---|---|
| Bucket summary | Shows `Current`, `1-30`, `31-60`, `61-90`, `90+`, or configured buckets. |
| Delinquent amount | Shows remaining unpaid open amount after approved waivers and payment effects. |
| Scope selector | Switches between invoice and billing account scope where authorized. |
| Configuration reference | Shows effective bucket definition reference when available. |

Stable test IDs:

| Test ID | Purpose |
|---|---|
| `aging-classification-panel` | Root aging panel. |
| `aging-bucket-summary` | Bucket summary. |
| `aging-delinquent-amount` | Delinquent amount display. |
| `aging-scope-selector` | Scope selector. |

## Penalty Run Panel

| Element | Behavior |
|---|---|
| Evaluation date input | Supplies penalty `evaluationDate`. |
| Penalty period display | Shows normalized period key such as `YYYY-MM`. |
| Candidate preview | Shows eligible penalty candidates before application. |
| Duplicate warning | Shows existing non-voided penalty source records for same duplicate key. |
| Apply action | Applies selected valid candidates through server API. |

Stable test IDs:

| Test ID | Purpose |
|---|---|
| `penalty-run-panel` | Root penalty run panel. |
| `penalty-evaluation-date-input` | Penalty evaluation date control. |
| `penalty-period-key-display` | Period key display. |
| `penalty-candidate-table` | Candidate preview table. |
| `penalty-duplicate-warning` | Duplicate prevention warning. |
| `penalty-apply-button` | Apply selected penalties action. |

## Penalty Candidate Table

| Element | Behavior |
|---|---|
| Basis amount column | Shows eligible unpaid regular invoice balance only. |
| Exclusions column | Shows excluded prior penalties, waivers, reminder fees, and penalty-on-penalty amounts. |
| Rule reference column | Shows resolved UOW-03 rule references. |
| Calculated amount column | Shows rounded output amount. |
| Blocking issue column | Shows missing configuration, duplicate, zero basis, or authorization issue. |

Stable test IDs:

| Test ID | Purpose |
|---|---|
| `penalty-candidate-basis-amount` | Basis amount cell or column. |
| `penalty-candidate-exclusions` | Exclusion detail. |
| `penalty-candidate-rule-reference` | Rule reference display. |
| `penalty-candidate-calculated-amount` | Calculated amount display. |
| `penalty-candidate-blocking-issue` | Blocking issue display. |

## Penalty Source Record Detail

| Element | Behavior |
|---|---|
| Penalty summary | Shows status, amount, invoice, billing account, period, and evaluation date. |
| Snapshot detail | Shows basis amount, exclusions, rule references, rounding rule, and calculation inputs. |
| Lifecycle history | Shows draft, applied, voided, or reissued history with reason and audit references. |
| Waiver summary | Shows linked waiver requests and approved waivers. |

Stable test IDs:

| Test ID | Purpose |
|---|---|
| `penalty-source-record-detail` | Root penalty detail panel. |
| `penalty-snapshot-detail` | Calculation snapshot detail. |
| `penalty-lifecycle-history` | Lifecycle history. |
| `penalty-waiver-summary` | Waiver summary. |

## Penalty Waiver Request Panel

| Element | Behavior |
|---|---|
| Target penalty selector | Selects eligible penalty source record. |
| Waiver amount input | Requires amount not exceeding available unpaid penalty amount. |
| Full waiver control | Requests waiver of all available unpaid penalty amount. |
| Reason input | Required for all waiver requests. |
| Approval status | Shows UOW-01 approval state and resulting waiver source record. |

Stable test IDs:

| Test ID | Purpose |
|---|---|
| `penalty-waiver-request-panel` | Root waiver panel. |
| `penalty-waiver-target-selector` | Target penalty selector. |
| `penalty-waiver-amount-input` | Waiver amount input. |
| `penalty-waiver-full-control` | Full waiver control. |
| `penalty-waiver-reason-input` | Required reason input. |
| `penalty-waiver-approval-status` | Approval and source record status. |

## Reminder Eligibility Panel

| Element | Behavior |
|---|---|
| Eligibility table | Shows invoice or account scopes eligible or ineligible for reminders. |
| Contact path status | Shows whether an authorized notification contact path exists. |
| Suppression detail | Shows configured suppression rule, duplicate reminder period reason, or missing authorized contact path reason. |
| Create intent action | Creates reminder intent records only. |

Stable test IDs:

| Test ID | Purpose |
|---|---|
| `reminder-eligibility-panel` | Root reminder eligibility panel. |
| `reminder-eligibility-table` | Eligibility table. |
| `reminder-contact-path-status` | Contact path status. |
| `reminder-suppression-detail` | Suppression detail. |
| `reminder-create-intent-button` | Create reminder intent action. |

## Reminder Intent Status Panel

| Element | Behavior |
|---|---|
| Intent status | Shows queued, accepted, failed, or cancelled status. |
| Scope detail | Shows invoice or billing account reminder scope. |
| Boundary text | Makes clear that rendering, storage, SMTP delivery, retries, and downloads are UOW-08 responsibilities. |

Stable test IDs:

| Test ID | Purpose |
|---|---|
| `reminder-intent-status-panel` | Root reminder status panel. |
| `reminder-intent-status` | Intent status display. |
| `reminder-intent-scope-detail` | Scope detail. |

## Homeowner Delinquency Page

| Element | Behavior |
|---|---|
| Authorized account selector | Shows only server-authorized billing accounts and properties. |
| Delinquency summary | Shows authorized overdue amount, aging bucket, and penalty/waiver status. |
| Penalty history | Shows homeowner-safe penalty source records and approved waivers. |
| Reminder status | Shows reminder intent status without exposing internal queue details. |

Stable test IDs:

| Test ID | Purpose |
|---|---|
| `homeowner-delinquency-page` | Root homeowner delinquency page. |
| `homeowner-delinquency-summary` | Delinquency summary. |
| `homeowner-penalty-history` | Penalty and waiver history. |
| `homeowner-reminder-status` | Reminder status. |

## Accessibility And Validation

- Forms must expose labels and validation summaries.
- Tables must have clear column headers and row actions.
- Financial amounts must use consistent decimal display.
- Blocking server validation errors must be displayed near the relevant action.
- Penalty lifecycle state must be visually distinct from waiver request state and reminder intent state.
- UI must not use JSON-only editing for normal penalty, waiver, aging, delinquency, or reminder workflows.
- UI text must not imply direct email sending, document rendering, file storage, report generation, or mutable balance editing by UOW-06.

## Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Components rely on server-authorized data, preserve homeowner isolation, support PII minimization, and do not implement client-side-only authorization. |
| Property-Based Testing | N/A for frontend design | PBT applies to domain and service invariants; frontend tests should cover validation summaries, state separation, stable test IDs, and no JSON-only workflows. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown headings, lists, and tables are used only.
