import { apiRequest } from '../../lib/api-client';

export interface HomeownerSummary {
  id: string;
  homeownerCode: string;
  legalName: string;
  status: string;
  primaryEmail?: string;
  primaryPhone?: string;
}

export interface PropertySummary {
  id: string;
  propertyCode: string;
  phaseOrSection: string;
  block: string;
  lot: string;
  street: string;
  billingStatus: string;
  lifecycleStatus: string;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
}

export interface BillableValidationView {
  isValid: boolean;
  reasonCodes: string[];
  validationDate: string;
  primaryHomeownerId?: string;
  billingAccountId?: string;
}

export function toQuery(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') query.set(key, String(value));
  }
  return query.toString();
}

export function searchHomeowners(params: Record<string, string | number | undefined>) {
  const query = toQuery(params);
  return apiRequest<PageResult<HomeownerSummary>>(`/homeowners${query ? `?${query}` : ''}`);
}

export function searchProperties(params: Record<string, string | number | undefined>) {
  const query = toQuery(params);
  return apiRequest<PageResult<PropertySummary>>(`/properties${query ? `?${query}` : ''}`);
}

export function validateBillableProperty(propertyId: string, validationDate: string) {
  return apiRequest<BillableValidationView>(
    `/properties/${propertyId}/billable-validation?${toQuery({ validationDate })}`
  );
}
