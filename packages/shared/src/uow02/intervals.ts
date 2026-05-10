import type { HalfOpenDateInterval } from './types';

function dateValue(value: string): number {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid date value: ${value}`);
  }
  return parsed;
}

export function validateHalfOpenInterval(interval: HalfOpenDateInterval): HalfOpenDateInterval {
  if (!interval.effectiveFrom) {
    throw new Error('effectiveFrom is required');
  }

  if (interval.effectiveTo != null && dateValue(interval.effectiveFrom) >= dateValue(interval.effectiveTo)) {
    throw new Error('effectiveTo must be after effectiveFrom for a half-open interval');
  }

  return interval;
}

export function intervalCoversDate(interval: HalfOpenDateInterval, validationDate: string): boolean {
  const from = dateValue(interval.effectiveFrom);
  const date = dateValue(validationDate);
  const to = interval.effectiveTo == null ? Number.POSITIVE_INFINITY : dateValue(interval.effectiveTo);

  return from <= date && date < to;
}

export function halfOpenIntervalsOverlap(left: HalfOpenDateInterval, right: HalfOpenDateInterval): boolean {
  validateHalfOpenInterval(left);
  validateHalfOpenInterval(right);

  const leftFrom = dateValue(left.effectiveFrom);
  const leftTo = left.effectiveTo == null ? Number.POSITIVE_INFINITY : dateValue(left.effectiveTo);
  const rightFrom = dateValue(right.effectiveFrom);
  const rightTo = right.effectiveTo == null ? Number.POSITIVE_INFINITY : dateValue(right.effectiveTo);

  return leftFrom < rightTo && rightFrom < leftTo;
}

export function hasAnyHalfOpenOverlap(intervals: HalfOpenDateInterval[]): boolean {
  for (let leftIndex = 0; leftIndex < intervals.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < intervals.length; rightIndex += 1) {
      const left = intervals[leftIndex];
      const right = intervals[rightIndex];
      if (left && right && halfOpenIntervalsOverlap(left, right)) {
        return true;
      }
    }
  }

  return false;
}
