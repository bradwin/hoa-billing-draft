# UOW-01 Functional Design Clarification Questions

## Context

The first pass of UOW-01 Functional Design answers was validated at `2026-05-09T03:42:04Z`.

All 15 answers were present and syntactically valid. One blocking contradiction was detected:

- Question 5 selected `C`, deferring MFA entirely from the first implementation.
- Security Baseline is enabled in `aidlc-docs/aidlc-state.md`.
- SECURITY-12 requires MFA support for administrative accounts.
- US-001 also states that MFA is supported for administrative access.

UOW-01 Functional Design artifacts cannot be generated until this is resolved.

## Clarification Question 1
How should UOW-01 resolve the MFA requirement while Security Baseline remains enabled?

A) Require MFA for System Administrator and Treasurer accounts, and make MFA optional for Billing Staff, Board Member, and Homeowner accounts when supported (recommended)
B) Support MFA for System Administrator and Treasurer accounts in first implementation, but make enforcement optional until NFR Design defines rollout policy
C) Keep MFA deferred entirely; this blocks UOW-01 generation until Security Baseline is explicitly disabled or changed through AIDLC extension configuration
X) Other (please describe after [Answer]: tag below; must explain how SECURITY-12 is satisfied)

[Answer]: A

## Clarification Validation Summary

Validated at `2026-05-09T03:43:47Z`.

- Answer `A` is complete and valid.
- SECURITY-12 is satisfied at Functional Design level because MFA is required for System Administrator and Treasurer accounts.
- UOW-01 Functional Design generation is unblocked.

## Post-Answer Processing

After the `[Answer]:` tag is complete:

- The answer will be checked against SECURITY-12.
- If the answer is compliant and unambiguous, `uow-01-functional-design-plan.md` will be updated and Functional Design artifacts will be generated.
- If the answer leaves MFA unsupported for administrative accounts, Functional Design remains blocked.

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown uses standard headings, lists, and code spans only.
