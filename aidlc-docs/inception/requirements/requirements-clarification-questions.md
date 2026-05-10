# Requirements Clarification Questions

The first question round is complete. Two issues still block requirements generation because they affect system scope and financial correctness.

Please answer every question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe the exact decision after the tag.

## Question 1
You selected full first implementation scope in Question 3, but selected an MVP-sized report set in Question 28. Which reporting scope is the actual requirement for the first implementation?

A) Full reporting scope: implement every report listed in Section 5.11 because the first implementation is full in-scope
B) Core reporting scope: implement only billing summary, collection report, aging receivables, delinquent homeowners, invoice register, payment register, receipt register, and audit trail; defer the rest even though other features are full in-scope
C) Phased reporting scope: implement core reports first, then implement the remaining Section 5.11 reports before the first production release
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
You selected configurable tax lines. How should tax configuration work in the first implementation?

A) Tax rate is configurable per charge type; invoice generation applies active tax rates by billing period and snapshots the tax rate and tax amount on each taxable invoice line
B) Tax is manually added as explicit invoice line items only; the system does not auto-calculate taxes
C) One global tax rate applies to all taxable charge types; each charge type is marked taxable or non-taxable
X) Other (please describe after [Answer]: tag below)

[Answer]: B. Tax Handling Rule

The system shall not automatically calculate tax on association dues, penalties, assessments, or other HOA charges in the MVP. If the HOA needs to bill a tax, withholding-related amount, government fee, or other tax-like charge, an authorized user shall add it manually as a separate invoice line item with a clear description, amount, and reason.
