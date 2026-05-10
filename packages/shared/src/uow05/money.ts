import { toMinorUnitsHalfUp } from '../uow03/decimal';

export function moneyToMinorUnits(value: string): bigint {
  return toMinorUnitsHalfUp(value);
}

export function minorUnitsToMoney(value: bigint): string {
  const sign = value < 0n ? '-' : '';
  const absolute = value < 0n ? -value : value;
  const whole = absolute / 100n;
  const cents = (absolute % 100n).toString().padStart(2, '0');
  return `${sign}${whole.toString()}.${cents}`;
}

export function addMoney(values: readonly string[]): string {
  return minorUnitsToMoney(values.reduce((sum, value) => sum + moneyToMinorUnits(value), 0n));
}

export function subtractMoney(left: string, right: string): string {
  return minorUnitsToMoney(moneyToMinorUnits(left) - moneyToMinorUnits(right));
}

export function assertNonNegativeMoney(value: string, label = 'Amount'): void {
  if (moneyToMinorUnits(value) < 0n) {
    throw new Error(`${label} must be nonnegative`);
  }
}

export function assertPositiveMoney(value: string, label = 'Amount'): void {
  if (moneyToMinorUnits(value) <= 0n) {
    throw new Error(`${label} must be positive`);
  }
}
