import { apiRequest } from '../../lib/api-client';

export interface ConfigurationDraftView {
  id: string;
  configurationType: string;
  identityKey: string;
  scopeKey: string;
  ruleType: string;
  status: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  approvalRequestId?: string | null;
}

export interface ResolutionPreviewView {
  ok: boolean;
  failureCode?: string;
  reason?: string;
  snapshot?: Record<string, unknown>;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
}

export function toQuery(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') query.set(key, String(value));
  }
  return query.toString();
}

export function listConfigurationDrafts(params: Record<string, string | number | undefined>) {
  const query = toQuery(params);
  return apiRequest<PageResult<ConfigurationDraftView>>(`/billing-configuration/drafts${query ? `?${query}` : ''}`);
}

export function resolveConfiguration(params: Record<string, string | number | undefined>) {
  const query = toQuery(params);
  return apiRequest<ResolutionPreviewView>(`/billing-configuration/resolve${query ? `?${query}` : ''}`);
}
