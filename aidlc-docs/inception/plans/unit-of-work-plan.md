# Unit of Work Plan

## Purpose

Decompose the approved HOA Billing System design into units of work for construction planning, per-unit design, code generation, and test planning.

This file is the Units Generation planning gate. It is not the generated unit decomposition. The final unit artifacts must not be created until all `[Answer]:` tags below are complete, validated, and explicitly approved.

## Source Context

- Requirements: `aidlc-docs/inception/requirements/requirements.md`
- Personas: `aidlc-docs/inception/user-stories/personas.md`
- Stories: `aidlc-docs/inception/user-stories/stories.md`
- Execution Plan: `aidlc-docs/inception/plans/execution-plan.md`
- Application Design: `aidlc-docs/inception/application-design/application-design.md`
- Components: `aidlc-docs/inception/application-design/components.md`
- Services: `aidlc-docs/inception/application-design/services.md`
- Component Dependencies: `aidlc-docs/inception/application-design/component-dependency.md`

## Planning Status

- Current stage: Units Generation, Part 2 - Generation
- Current gate: Unit artifacts generated; waiting for stage approval
- Application code generation status: Not started
- Unit artifact generation status: Complete

## Planning Checklist

- [x] Resolve AI-DLC rule details directory as `.aidlc-rule-details/`.
- [x] Load common process, session continuity, content validation, and question format rules.
- [x] Load Units Generation detailed rules.
- [x] Confirm enabled extensions from `aidlc-docs/aidlc-state.md`.
- [x] Load enabled Security Baseline rules.
- [x] Load enabled Property-Based Testing rules.
- [x] Review current workflow state.
- [x] Review approved execution plan.
- [x] Review approved application design summary.
- [x] Review approved component catalog.
- [x] Review approved service orchestration summary.
- [x] Review representative user stories for story grouping.
- [x] Create this unit-of-work planning file with mandatory artifact checklist.
- [x] Create decomposition questions using `[Answer]:` tags.
- [x] Collect answers for every `[Answer]:` tag.
- [x] Validate answers for blanks, invalid choices, contradictions, and ambiguity.
- [x] Add follow-up questions if any answer is vague, mixed, or contradictory. No follow-up questions required because all answers are valid option A choices and no contradictions were detected.
- [x] Request explicit approval to proceed from planning to generation.
- [x] Log planning approval and update workflow state.

## Mandatory Generation Checklist

The following artifacts are mandatory after this plan is answered, validated, and approved:

- [x] Generate `aidlc-docs/inception/application-design/unit-of-work.md` with unit definitions and responsibilities.
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-dependency.md` with dependency matrix.
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-story-map.md` mapping stories to units.
- [x] Document greenfield code organization strategy in `unit-of-work.md`.
- [x] Validate unit boundaries and dependencies.
- [x] Ensure every user story is assigned to a unit.
- [x] Ensure security-sensitive workflows have an owning unit.
- [x] Ensure financial workflows have a dependency order that prevents balance, receipt, SOA, and report work from outrunning invoice and ledger contracts.
- [x] Verify extension compliance summary for Units Generation.

## Recommended Starting Decomposition

This is a proposed starting point only. The approved decomposition will be generated after the answers below are complete.

1. Platform Foundation, Identity, RBAC, Settings, Audit, and Shared Kernel
2. Homeowner, Property, Ownership, and Contact Requests
3. Billing Configuration and Invoice Lifecycle
4. Payments, Allocations, Credits, Receipts, and Financial Corrections
5. Penalties, Delinquency, Waivers, and Reminders
6. Statements of Account, Reports, Dashboards, and Exports
7. Imports, Documents, Storage, Notifications, and Job Orchestration
8. Frontend Portal Integration and End-to-End Workflow Completion, if frontend work is not owned inside each domain unit

## Financial Safety Rule for Unit Boundaries

Financial ambiguity is a blocker, not a detail to defer silently. If a proposed unit boundary leaves unclear ownership for invoices, allocations, credits, penalties, receipts, adjustments, SOA balances, report reconciliation, or audit records, Units Generation must either:

- split the boundary until ownership is explicit, or
- record the unresolved point as a blocker with a concrete default and approval requirement.

The recommended default is to sequence financial source-record units before derived balance, SOA, reporting, and export units.

## Decomposition Questions

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

### Question 1
What unit decomposition model should this greenfield modular monolith use?

A) Multiple domain-oriented units inside one TypeScript monorepo and one deployable application boundary (recommended)
B) One large AI-DLC unit for the entire monolith, with internal modules only
C) Independently deployable service units, despite the approved modular monolith design
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What unit granularity should be used?

A) Seven to eight balanced units aligned to business capabilities and financial dependencies (recommended)
B) Four to five large units to reduce planning overhead
C) Ten to twelve small units for fine-grained tracking
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
How should financial-domain units be split?

A) Separate invoice, payment/receipt, penalty, and SOA/reporting concerns so source records are owned before derived outputs (recommended)
B) Put all invoice, payment, receipt, penalty, SOA, and reporting behavior in one Financial unit
C) Split financial work by technical layer, such as backend financial APIs first and frontend financial screens later
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
What dependency sequencing should Units Generation enforce?

A) Strict sequence: foundation, master data, billing configuration, invoices, payments/receipts, penalties, SOA/reporting, imports/support (recommended)
B) Parallel streams after foundation, with explicit interface contracts between invoice, payment, penalty, and reporting units
C) Feature-first vertical increments, accepting more cross-unit coordination during construction
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
How should frontend work be assigned to units?

A) Each domain unit owns its backend APIs, frontend screens, and tests, with a final portal integration pass (recommended)
B) Backend domain units are generated first, followed by one dedicated frontend unit
C) Separate frontend units for admin/treasurer/board portal and homeowner portal
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
Where should shared platform concerns be owned?

A) A first Foundation unit owns authentication, RBAC, settings shell, audit service, shared kernel, validation conventions, and security scaffolding (recommended)
B) Each business unit owns its own share of authentication, audit, settings, and validation behavior
C) Delay foundation work until after the core billing domain is generated
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
How should documents, storage, notifications, and job orchestration be grouped?

A) One support unit owns shared implementations, with early interfaces available to invoice, receipt, SOA, report, and reminder workflows (recommended)
B) Each domain unit owns its own document, storage, notification, and job behavior
C) Implement all support components at the end after financial workflows are complete
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
How should imports and opening balances be handled as units?

A) Create an Import and Opening Balance unit after master data and core financial contracts exist, applying data only through domain services (recommended)
B) Split import behavior across homeowner/property and financial units
C) Treat imports as one-off scripts outside the application
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
How should SOA, reports, dashboards, and exports be grouped?

A) One read/output unit after source financial records exist, covering SOA, required reports, dashboards, and exports (recommended)
B) Split SOA into its own unit and put reports, dashboards, and exports into a separate reporting unit
C) Let each financial domain unit own its own reports and exports
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
What greenfield code organization should the generated unit plan target?

A) TypeScript monorepo with `apps/api`, `apps/web`, `apps/worker`, and `packages/shared`; domain modules/features inside those apps (recommended)
B) Strict AI-DLC monolith default with root `src/{unit-name}/` and `tests/{unit-name}/`
C) Separate top-level folders per unit as if they were deployable services
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 11
What team execution model should the unit dependency plan assume?

A) Mostly sequential implementation by one developer or one small workstream (recommended)
B) Two parallel streams after foundation: financial backend and frontend/user workflows
C) Multiple domain owners working in parallel with explicit contract reviews between units
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 12
What should Units Generation do if an answer or proposed unit boundary leaves financial ownership ambiguous?

A) Stop and add follow-up questions before generating unit artifacts (recommended)
B) Use the most conservative default, document the assumption, and continue
C) Defer the ambiguity to Functional Design
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Post-Answer Processing

After all `[Answer]:` tags are complete:

- Answers will be checked for blanks, invalid options, contradictions, and vague wording.
- Follow-up questions will be added if any answer is ambiguous.
- If answers are clear, approval will be requested before generating unit artifacts.
- After approval, generation must follow this plan exactly and update checkboxes immediately.

## Answer Validation Summary

Validated at `2026-05-09T03:24:00Z`.

- Completion: all 12 `[Answer]:` tags are populated.
- Validity: all answers use valid option A choices.
- Ambiguity: none detected.
- Contradictions: none detected.
- Financial ownership: strict sequencing and explicit ambiguity blocking are selected.
- Follow-up questions: not required.
- Next gate: explicit approval is required before generating unit artifacts.

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant for planning | The plan preserves dedicated ownership for authentication, authorization, audit, validation, storage, notifications, and security-sensitive financial approvals. SECURITY-08 and SECURITY-11 are directly supported by the proposed foundation and domain-boundary questions. Implementation-specific security checks remain for NFR, Infrastructure, Code Generation, and Build/Test stages. |
| Property-Based Testing | N/A for planning | PBT enforcement starts in Functional Design, NFR Requirements, Code Generation, and Build/Test. This plan preserves financial boundaries needed later for allocation, balance, penalty, SOA, import, and reconciliation properties. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown uses standard headings, lists, tables, and code spans only.
- All questions include a final `X) Other` option and `[Answer]:` tag.
