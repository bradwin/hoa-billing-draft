# Prisma Schema

UOW-01 owns the foundation schema for users, sessions, MFA, audit, settings, approvals, and support intents.

Production migrations must run with the migration/admin database role. Runtime application roles must not own schema objects and must not receive update or delete privileges on `AuditEntry`.
