import type { IsoDateString } from './types';
import { createDateRange, type DateRange } from './date-range';

export interface BillingPeriod {
  id: string;
  range: DateRange;
}

export function createBillingPeriod(id: string, from: IsoDateString, to: IsoDateString): BillingPeriod {
  if (!/^[A-Z0-9][A-Z0-9_-]{2,31}$/i.test(id)) {
    throw new Error('BillingPeriod id has invalid format');
  }
  return { id, range: createDateRange(from, to) };
}
