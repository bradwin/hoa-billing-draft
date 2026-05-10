import { Injectable } from '@nestjs/common';

export interface AuditHashRow {
  streamKey: string;
  sequence: number;
  previousHash?: string | null;
  recordHash: string;
}

@Injectable()
export class AuditHashService {
  verifyChain(rows: readonly AuditHashRow[]): { valid: boolean; failedSequence?: number } {
    const ordered = [...rows].sort((a, b) => a.sequence - b.sequence);
    for (let index = 0; index < ordered.length; index += 1) {
      const current = ordered[index];
      const previous = ordered[index - 1];
      if (!current) continue;
      if (index === 0 && current.previousHash) {
        return { valid: false, failedSequence: current.sequence };
      }
      if (previous && current.previousHash !== previous.recordHash) {
        return { valid: false, failedSequence: current.sequence };
      }
    }
    return { valid: true };
  }
}
