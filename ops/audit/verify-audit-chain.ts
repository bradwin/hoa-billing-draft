import { createHash } from 'node:crypto';

export interface AuditRow {
  streamKey: string;
  sequence: number;
  previousHash?: string | null;
  recordHash: string;
}

export function verifyAuditRows(rows: readonly AuditRow[]): boolean {
  const byStream = new Map<string, AuditRow[]>();
  for (const row of rows) {
    byStream.set(row.streamKey, [...(byStream.get(row.streamKey) ?? []), row]);
  }
  for (const streamRows of byStream.values()) {
    const ordered = streamRows.sort((a, b) => a.sequence - b.sequence);
    for (let index = 0; index < ordered.length; index += 1) {
      const previous = ordered[index - 1];
      const current = ordered[index];
      if (!current) continue;
      if (index === 0 && current.previousHash) return false;
      if (previous && current.previousHash !== previous.recordHash) return false;
    }
  }
  return true;
}

export function hashCanonical(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

if (require.main === module) {
  process.stdout.write('Audit verification library loaded. Wire database query before production readiness.\n');
}
