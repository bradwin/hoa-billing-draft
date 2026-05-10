import type { IsoDateString } from './types';

export interface DateRange {
  from: IsoDateString;
  to: IsoDateString;
}

export function createDateRange(from: IsoDateString, to: IsoDateString): DateRange {
  if (!from || !to) {
    throw new Error('DateRange requires from and to values');
  }
  if (Date.parse(from) > Date.parse(to)) {
    throw new Error('DateRange from must be before or equal to to');
  }
  return { from, to };
}

export function formatDateRange(range: DateRange): string {
  return `${range.from}/${range.to}`;
}

export function parseDateRange(input: string): DateRange {
  const [from, to] = input.split('/');
  if (!from || !to) {
    throw new Error('DateRange string must use from/to format');
  }
  return createDateRange(from, to);
}
