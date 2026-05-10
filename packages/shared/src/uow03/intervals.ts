import type { EffectiveInterval } from './types';

export function coversDate(interval: EffectiveInterval, date: string): boolean {
  return interval.effectiveFrom <= date && (!interval.effectiveTo || date < interval.effectiveTo);
}

export function intervalsOverlap(a: EffectiveInterval, b: EffectiveInterval): boolean {
  const aEnd = a.effectiveTo ?? '9999-12-31';
  const bEnd = b.effectiveTo ?? '9999-12-31';
  return a.effectiveFrom < bEnd && b.effectiveFrom < aEnd;
}

export function assertHalfOpenInterval(interval: EffectiveInterval): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(interval.effectiveFrom)) {
    throw new Error('effectiveFrom must be an ISO date');
  }
  if (interval.effectiveTo !== null && interval.effectiveTo !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(interval.effectiveTo)) {
    throw new Error('effectiveTo must be an ISO date or null');
  }
  if (interval.effectiveTo && interval.effectiveFrom >= interval.effectiveTo) {
    throw new Error('effectiveFrom must be before effectiveTo');
  }
}

export function assertNoOverlappingIntervals(intervals: readonly EffectiveInterval[]): void {
  for (let index = 0; index < intervals.length; index += 1) {
    for (let other = index + 1; other < intervals.length; other += 1) {
      const left = intervals[index];
      const right = intervals[other];
      if (left && right && intervalsOverlap(left, right)) {
        throw new Error('Active configuration intervals must not overlap for the same identity, scope, and rule type');
      }
    }
  }
}
