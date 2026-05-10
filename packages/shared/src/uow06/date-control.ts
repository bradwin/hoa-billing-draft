import type { AgingBucketCode, OverdueEvaluationInput, OverdueEvaluationResult } from './types';
import { moneyToMinorUnits } from './money';

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDateOnly(value: string, label: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must be an ISO date`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} must be a valid ISO date`);
  }
  return date;
}

export function addCalendarDays(dateOnly: string, days: number): string {
  const date = parseDateOnly(dateOnly, 'Date');
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function dayDifferenceInclusive(startDate: string, endDate: string): number {
  const start = parseDateOnly(startDate, 'Start date').getTime();
  const end = parseDateOnly(endDate, 'End date').getTime();
  return Math.floor((end - start) / DAY_MS) + 1;
}

export function firstOverdueDate(dueDate: string, resolvedGracePeriodDays: number): string {
  if (!Number.isInteger(resolvedGracePeriodDays) || resolvedGracePeriodDays < 0) {
    throw new Error('Grace period days must be a nonnegative integer');
  }
  return addCalendarDays(dueDate, resolvedGracePeriodDays + 1);
}

export function agingBucketForDays(agingDayCount: number): AgingBucketCode {
  if (agingDayCount <= 0) return 'Current';
  if (agingDayCount <= 30) return '1-30';
  if (agingDayCount <= 60) return '31-60';
  if (agingDayCount <= 90) return '61-90';
  return '90+';
}

export function penaltyPeriodKey(evaluationDate: string): string {
  parseDateOnly(evaluationDate, 'Evaluation date');
  return evaluationDate.slice(0, 7);
}

export function evaluateOverdue(input: OverdueEvaluationInput): OverdueEvaluationResult {
  const firstDate = firstOverdueDate(input.dueDate, input.resolvedGracePeriodDays);
  const hasOpenAmount = moneyToMinorUnits(input.openAmount) > 0n;
  const isIssued = input.invoiceStatus === 'Issued' || input.invoiceStatus === 'Reissued';
  const isAfterGrace = parseDateOnly(input.evaluationDate, 'Evaluation date').getTime() >= parseDateOnly(firstDate, 'First overdue date').getTime();
  const overdue = isIssued && hasOpenAmount && isAfterGrace;
  const agingDayCount = overdue ? dayDifferenceInclusive(firstDate, input.evaluationDate) : 0;
  return {
    overdue,
    firstOverdueDate: overdue ? firstDate : null,
    agingDayCount,
    agingBucket: agingBucketForDays(agingDayCount),
    openAmount: input.openAmount
  };
}
