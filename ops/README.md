# Operations Scripts

These scripts are placeholders for UOW-01 infrastructure controls and must not contain real credentials.

- `backup/backup-db.ts`: runs a logical PostgreSQL backup using `DATABASE_BACKUP_URL`.
- `restore/rehearse-restore.ts`: validates restore rehearsal inputs before the concrete staging restore command is configured.
- `audit/verify-audit-chain.ts`: verifies audit hash-chain ordering and previous-hash continuity.
- `readiness/production-readiness.ts`: checks required production environment settings.

Production use still requires evidence for TLS, encrypted storage, backup success, restore rehearsal, log retention, alert contact, and audit immutability controls.
