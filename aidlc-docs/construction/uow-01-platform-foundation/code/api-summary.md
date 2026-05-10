# UOW-01 API Summary

## API Surface

| Area | Endpoint Group | Purpose |
|---|---|---|
| Health | `GET /health` | API health check. |
| Actor context | `GET /me` | Return server-resolved actor context and permission list. |
| Authentication | `POST /auth/login` | Login with generic failure behavior and server-side session creation. |
| Activation | `POST /auth/invitations/activate` | Activation flow boundary. |
| Password reset | `POST /auth/password-reset/request`, `POST /auth/password-reset/complete` | Non-enumerating reset request and completion boundaries. |
| Sessions | `POST /auth/logout` | Server-side session revocation. |
| MFA | `POST /auth/mfa/challenge` | MFA challenge boundary. |
| Settings | `GET /settings/categories`, `PUT /settings/hoa-profile` | Settings shell and HOA profile update. |
| Audit | `POST /audit/query` | Filtered and paginated audit query. |
| Approvals | `POST /approvals` | Approval request creation. |
| Support intents | `POST /support-intents` | Persist support intent records without real dispatch. |

## Security Controls

- Public route metadata is explicit.
- Protected routes use permission metadata.
- Validation uses shared schemas with explicit bounds.
- Errors are passed through a global safe error filter.
- Correlation IDs are propagated through middleware.
- Audit/security events are available to services for security-sensitive actions.

## Deferred API Work

Later units add homeowner, property, billing, invoice, payment, penalty, report, import, document, and portal APIs. Those units must use UOW-01 actor context, authorization, audit, support intent, and shared kernel contracts.
