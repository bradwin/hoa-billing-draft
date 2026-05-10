import { AuditHashService } from '../../src/modules/audit/audit-hash.service';

describe('AuditHashService', () => {
  it('accepts a valid chain', () => {
    const service = new AuditHashService();
    expect(
      service.verifyChain([
        { streamKey: 'Security:global', sequence: 1, recordHash: 'hash-1' },
        { streamKey: 'Security:global', sequence: 2, previousHash: 'hash-1', recordHash: 'hash-2' }
      ])
    ).toEqual({ valid: true });
  });

  it('rejects a broken previous hash', () => {
    const service = new AuditHashService();
    expect(
      service.verifyChain([
        { streamKey: 'Security:global', sequence: 1, recordHash: 'hash-1' },
        { streamKey: 'Security:global', sequence: 2, previousHash: 'wrong', recordHash: 'hash-2' }
      ])
    ).toEqual({ valid: false, failedSequence: 2 });
  });
});
