import fc from 'fast-check';
import { AuditHashService } from '../../src/modules/audit/audit-hash.service';

const pbtSeedOptions = process.env.PBT_SEED ? { seed: Number(process.env.PBT_SEED) } : undefined;

describe('audit hash chain properties', () => {
  it('preserves existing entries when appending', () => {
    fc.assert(
      fc.property(fc.array(fc.hexaString({ minLength: 8, maxLength: 64 }), { minLength: 1, maxLength: 50 }), (hashes) => {
        const rows = hashes.map((hash, index) => ({
          streamKey: 'Security:global',
          sequence: index + 1,
          previousHash: index === 0 ? null : hashes[index - 1] ?? null,
          recordHash: hash
        }));
        const appended = [
          ...rows,
          {
            streamKey: 'Security:global',
            sequence: rows.length + 1,
            previousHash: rows[rows.length - 1]?.recordHash ?? null,
            recordHash: 'new-hash'
          }
        ];
        expect(appended.slice(0, rows.length)).toEqual(rows);
        expect(new AuditHashService().verifyChain(appended).valid).toBe(true);
      }),
      pbtSeedOptions
    );
  });
});
