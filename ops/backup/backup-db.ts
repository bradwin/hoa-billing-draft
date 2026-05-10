import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const databaseUrl = process.env.DATABASE_BACKUP_URL;
const outputDir = process.env.BACKUP_OUTPUT_DIR ?? 'docker/backups';

if (!databaseUrl) {
  throw new Error('DATABASE_BACKUP_URL is required');
}

mkdirSync(outputDir, { recursive: true });
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const output = join(outputDir, `hoa-billing-${timestamp}.sql`);
const result = spawnSync('pg_dump', [databaseUrl, '--format=plain', `--file=${output}`], { stdio: 'inherit' });

if (result.status !== 0) {
  throw new Error('pg_dump failed');
}

process.stdout.write(`Backup written to ${output}\n`);
