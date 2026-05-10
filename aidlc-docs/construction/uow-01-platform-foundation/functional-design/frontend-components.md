# UOW-01 Frontend Components

## Frontend Scope

UOW-01 owns the foundation frontend behavior needed for secure access and later domain navigation:

- Sign-in.
- Activation.
- Password reset request and completion.
- MFA enrollment and challenge for roles requiring MFA.
- Protected application shell.
- Role-aware navigation.
- Settings shell.
- Audit query shell.
- Approval queue shell.

All authorization is enforced by backend APIs. Frontend role-aware visibility is only a usability layer.

## Component Hierarchy

| Component | Purpose | Primary API Integration |
|---|---|---|
| `AuthLayout` | Shared unauthenticated layout for sign-in, activation, reset, and MFA screens | None |
| `SignInForm` | Collect email/password and submit authentication | `POST /auth/login` |
| `MfaChallengeForm` | Complete required MFA challenge | `POST /auth/mfa/challenge` |
| `MfaEnrollmentForm` | Enroll required MFA for System Administrator and Treasurer accounts | `POST /auth/mfa/enroll`, `POST /auth/mfa/verify-enrollment` |
| `ActivationForm` | Accept invitation and set credentials | `POST /auth/invitations/activate` |
| `PasswordResetRequestForm` | Request reset with non-enumerating response | `POST /auth/password-reset/request` |
| `PasswordResetForm` | Consume reset token and set new password | `POST /auth/password-reset/complete` |
| `ProtectedAppShell` | Load actor context and render protected application frame | `GET /me` |
| `RoleAwareNavigation` | Show navigation allowed by resolved permissions | `GET /me/permissions` |
| `SettingsShell` | Display foundation setting categories and delegated placeholders | `GET /settings/categories` |
| `HoaProfileSettingsForm` | Edit HOA profile shell fields | `GET /settings/hoa-profile`, `PUT /settings/hoa-profile` |
| `AuditQueryShell` | Query role-authorized audit entries | `GET /audit` |
| `ApprovalQueueShell` | List approval requests and show status | `GET /approvals` |
| `ApprovalDecisionPanel` | Approve or reject requests when allowed | `POST /approvals/{id}/approve`, `POST /approvals/{id}/reject` |
| `SafeErrorBanner` | Render safe domain errors with correlation ID | All command/query responses |

## Interaction Rules

| Rule ID | Rule |
|---|---|
| UOW01-FE-001 | Protected views must request server-resolved actor context before rendering protected content. |
| UOW01-FE-002 | Role-aware navigation must not be treated as authorization. |
| UOW01-FE-003 | Hidden controls do not replace backend permission checks. |
| UOW01-FE-004 | Every command form displays safe validation errors only. |
| UOW01-FE-005 | Error displays include correlation ID when available. |
| UOW01-FE-006 | Password, token, and MFA code inputs are never logged in client diagnostics. |
| UOW01-FE-007 | Forms must be stable for automation with consistent `data-testid` values. |
| UOW01-FE-008 | Approval decision UI must hide or disable self-approval, but backend remains authoritative. |
| UOW01-FE-009 | Audit query UI must render only fields returned by authorized backend queries. |
| UOW01-FE-010 | Settings shell must distinguish UOW-01 owned settings from delegated domain categories. |

## Authentication UI States

| State | UI Behavior |
|---|---|
| Initial | Show sign-in form |
| Invalid credentials | Show generic sign-in failure |
| Temporarily locked | Show generic delayed/locked sign-in response without exposing sensitive detail |
| MFA required | Show MFA challenge or enrollment flow |
| Password reset requested | Show non-enumerating confirmation |
| Activation expired or invalid | Show safe activation failure |
| Authenticated | Navigate to protected shell based on role |

## Protected Shell Navigation

| Role | Foundation Navigation |
|---|---|
| System Administrator | User invitations, settings shell, security/audit query |
| Treasurer | Approval queue, audit/report read links where available later, settings read |
| Billing Staff | Own approval requests and future billing operations |
| Board Member | Future read-only dashboard/report links |
| Homeowner | Future homeowner self-service links |

Later domain units add navigation items through permission-backed route registration.

## Form Validation

| Form | Required Client Validation | Backend Authority |
|---|---|---|
| Sign-in | Email present and email-shaped; password present | Backend validates credentials, lockout, MFA requirement |
| Activation | Token present; password fields present and match local confirmation | Backend validates invitation status, expiration, role, password policy |
| Password reset request | Email present and email-shaped | Backend returns non-enumerating response |
| Password reset completion | Token present; password fields present and match local confirmation | Backend validates token status and password policy |
| MFA challenge | Challenge code present | Backend validates factor |
| HOA profile settings | Required profile fields present and length-bounded | Backend validates schema and authorization |
| Approval decision | Decision and reason present | Backend validates Treasurer permission and self-approval prohibition |

## Stable Test IDs

| Element | `data-testid` |
|---|---|
| Sign-in form | `auth-sign-in-form` |
| Sign-in email input | `auth-sign-in-email-input` |
| Sign-in password input | `auth-sign-in-password-input` |
| Sign-in submit button | `auth-sign-in-submit-button` |
| MFA challenge form | `auth-mfa-challenge-form` |
| MFA enrollment form | `auth-mfa-enrollment-form` |
| Activation form | `auth-activation-form` |
| Password reset request form | `auth-password-reset-request-form` |
| Password reset completion form | `auth-password-reset-complete-form` |
| Protected app shell | `app-protected-shell` |
| Role-aware navigation | `app-role-navigation` |
| Settings shell | `settings-shell` |
| HOA profile form | `settings-hoa-profile-form` |
| Audit query shell | `audit-query-shell` |
| Approval queue shell | `approval-queue-shell` |
| Approval decision panel | `approval-decision-panel` |
| Safe error banner | `safe-error-banner` |

## API Contract Expectations

| API Area | Frontend Expectation |
|---|---|
| Authentication | Responses distinguish only safe states such as MFA required, activation required, or generic failure |
| Actor context | `GET /me` returns role, display name, session status, and required action markers |
| Permissions | Permission responses are scoped to navigation and do not expose sensitive policy internals |
| Settings | Settings category response identifies owner unit and read/edit permission |
| Audit | Audit query response is already filtered server-side |
| Approvals | Approval list response indicates whether actor may decide, but backend still validates decision commands |
| Errors | Errors use stable code, safe message, and correlation ID |

## State Management

| State Area | Owner | Notes |
|---|---|---|
| Session status | Protected app shell | Loaded from server, not trusted from local storage |
| Actor permissions | Protected app shell | Refreshed after login and role-impacting changes |
| Form state | Individual form components | Sensitive fields cleared after submit or route change |
| Audit filters | Audit query shell | Stored in component state or URL-safe filters |
| Approval selected item | Approval queue shell | Refetched after decision |
| Safe errors | Safe error banner | Uses structured domain errors |

## Testable Properties

| Area | PBT Category | Property |
|---|---|---|
| Navigation rendering | Invariant | Navigation never displays a command item not present in the server permission list. |
| Safe errors | Invariant | Rendered error content uses safe message and correlation ID, not internal detail fields. |
| Form validation | Invariant | Empty required fields cannot produce submit payloads. |
| Approval decision UI | Invariant | Self-approval state cannot enable approve or reject action client-side; backend remains authoritative. |

## Extension Rule Compliance Summary

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Frontend design relies on server authorization, keeps errors safe, avoids sensitive logging, supports administrative MFA flows, and uses stable automation identifiers. |
| Property-Based Testing | Compliant | PBT-01 frontend-relevant invariants are identified for navigation, safe errors, forms, and approval decision states. |

## Content Validation Summary

- No Mermaid diagrams are included.
- No ASCII art diagrams are included.
- Markdown tables and lists are used only.
