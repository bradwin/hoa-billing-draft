const DECIMAL_BY_SCALE: Record<number, RegExp> = {
  2: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
  4: /^(0|[1-9]\d*)(\.\d{1,4})?$/
};

export function assertDecimalScale(value: string, scale: 2 | 4, fieldName = 'decimal'): void {
  const pattern = DECIMAL_BY_SCALE[scale] as RegExp;
  if (!pattern.test(value)) {
    throw new Error(`${fieldName} must be a non-negative decimal string with up to ${scale} decimal places`);
  }
}

export function toMinorUnitsHalfUp(value: string, scale = 2): bigint {
  const [rawWhole, rawFraction = ''] = value.split('.');
  const whole = rawWhole ?? '0';
  const fraction = rawFraction.padEnd(scale + 1, '0');
  const base = BigInt(whole) * BigInt(10 ** scale) + BigInt(fraction.slice(0, scale) || '0');
  return Number(fraction.charAt(scale) || '0') >= 5 ? base + 1n : base;
}
