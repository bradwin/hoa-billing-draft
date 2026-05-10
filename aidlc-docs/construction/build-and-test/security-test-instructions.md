# Security Test Instructions

## Purpose

Validate security-sensitive behavior across authentication, authorization, audit, financial mutations, and PII-minimized reads.

## Required Commands

```bash
npm audit --audit-level=moderate
```

```bash
npm run test
```

## Security Scenarios

| Area | Test Focus |
|---|---|
| Authentication | Session, reset-token, MFA, and protected shell tests must pass. |
| Authorization | Server-side permission checks must deny missing permissions; frontend filtering is not authorization. |
| Homeowner isolation | Homeowners may read only authorized invoices, payments, penalties, waivers, delinquency, and reminder status. |
| Board Member access | Read-only and PII-minimized access must remain enforced in API policies and read models. |
| Audit | Sensitive financial actions write actor, action, target, timestamp, result, and correlation data. |
| Support intents | UOW-04, UOW-05, and UOW-06 create intent records only; UOW-08 owns rendering, storage, SMTP delivery, and retries. |

## Manual Review Checklist

- No secrets are committed.
- No logs include raw credentials, tokens, payment proof payloads, or unnecessary PII.
- UOW-06 does not expose direct document rendering, email sending, file storage, import, or retry job endpoints.
- Approval-sensitive waiver and lifecycle actions require appropriate permissions and approval references where applicable.
