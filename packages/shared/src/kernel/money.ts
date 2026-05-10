import type { DecimalString } from './types';

export interface Money {
  amount: DecimalString;
  currency: 'PHP';
}

const DECIMAL_PATTERN = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

export function createMoney(amount: DecimalString, currency: string = 'PHP'): Money {
  if (currency !== 'PHP') {
    throw new Error('Money currency must be PHP for this project');
  }
  if (!DECIMAL_PATTERN.test(amount)) {
    throw new Error('Money amount must be a non-negative decimal string with up to two decimals');
  }
  return { amount, currency: 'PHP' };
}

export function formatMoney(value: Money): string {
  return `${value.currency} ${value.amount}`;
}

export function parseMoney(input: string): Money {
  const trimmed = input.trim();
  const withoutPrefix = trimmed.startsWith('PHP ') ? trimmed.slice(4) : trimmed;
  return createMoney(withoutPrefix, 'PHP');
}
