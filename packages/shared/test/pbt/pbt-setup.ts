import fc from 'fast-check';

export function pbtOptions(): fc.Parameters<unknown> {
  const options: fc.Parameters<unknown> = { numRuns: process.env.CI ? 200 : 100 };
  if (process.env.PBT_SEED) {
    options.seed = Number(process.env.PBT_SEED);
  }
  return options;
}

export function logPbtSeed(): void {
  if (process.env.PBT_SEED) {
    process.stdout.write(`PBT_SEED=${process.env.PBT_SEED}\n`);
  }
}
