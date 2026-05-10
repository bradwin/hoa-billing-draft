import fc from 'fast-check';

type ResetState = 'Pending' | 'Consumed' | 'Expired';
const pbtSeedOptions = process.env.PBT_SEED ? { seed: Number(process.env.PBT_SEED) } : undefined;

function consume(state: ResetState): ResetState {
  return state === 'Pending' ? 'Consumed' : state;
}

describe('password reset token properties', () => {
  it('consuming twice is idempotent after the first consumption', () => {
    fc.assert(
      fc.property(fc.constantFrom<ResetState>('Pending', 'Consumed', 'Expired'), (state) => {
        expect(consume(consume(state))).toBe(consume(state));
      }),
      pbtSeedOptions
    );
  });
});
