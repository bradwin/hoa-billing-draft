import fc from 'fast-check';
import { SessionRepository } from '../../src/persistence/repositories/session.repository';

const pbtSeedOptions = process.env.PBT_SEED ? { seed: Number(process.env.PBT_SEED) } : undefined;

describe('session properties', () => {
  it('session digests are deterministic and never equal raw tokens', () => {
    const repo = new SessionRepository({} as never);
    fc.assert(
      fc.property(fc.string({ minLength: 16, maxLength: 128 }), (token) => {
        expect(repo.digest(token)).toBe(repo.digest(token));
        expect(repo.digest(token)).not.toBe(token);
      }),
      pbtSeedOptions
    );
  });
});
