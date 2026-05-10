# Docker Deployment Artifacts

The Docker files are UOW-01 deployment skeletons. They use pinned base image tags and do not include real secrets.

Before production:

- Replace placeholder environment files with root-owned secret files or Docker Compose secrets outside the repository.
- Verify host disk or cloud volume encryption.
- Configure PostgreSQL TLS certificates.
- Configure Caddy DNS and certificate management.
- Configure log retention, monitoring dashboards, alerts, backups, and restore rehearsal evidence.
