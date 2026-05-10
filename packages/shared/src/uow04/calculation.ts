import { toMinorUnitsHalfUp } from '../uow03/decimal';
import type { InvoiceCalculationResult, InvoiceLineInput } from './types';

export function addMoneyMinorUnits(values: readonly string[]): string {
  const total = values.reduce((sum, value) => sum + toMinorUnitsHalfUp(value), 0n);
  const sign = total < 0n ? '-' : '';
  const absolute = total < 0n ? -total : total;
  const whole = absolute / 100n;
  const cents = (absolute % 100n).toString().padStart(2, '0');
  return `${sign}${whole.toString()}.${cents}`;
}

export function calculateInvoiceTotal(lines: readonly InvoiceLineInput[]): InvoiceCalculationResult {
  if (lines.length === 0) throw new Error('Invoice requires at least one line');
  const lineAmounts = lines.map((line) => line.amount);
  return {
    lineAmounts,
    totalAmount: addMoneyMinorUnits(lineAmounts)
  };
}

export function assertInvoiceTotalMatchesLines(lines: readonly InvoiceLineInput[], totalAmount: string): void {
  const calculated = calculateInvoiceTotal(lines).totalAmount;
  if (calculated !== totalAmount) {
    throw new Error(`Invoice total ${totalAmount} does not match line total ${calculated}`);
  }
}
