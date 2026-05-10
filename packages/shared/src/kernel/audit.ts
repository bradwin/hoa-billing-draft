import type { ActorContext, ResourceRef } from './types';

export type AuditCategory = 'Security' | 'Financial' | 'System' | 'Configuration' | 'Import' | 'Workflow';
export type AuditResult = 'Success' | 'Denied' | 'Failed' | 'Info';

export interface AuditEntryInput {
  actor?: ActorContext;
  category: AuditCategory;
  action: string;
  resourceRef?: ResourceRef;
  correlationId: string;
  result: AuditResult;
  reason?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface AuditHashFields {
  streamKey: string;
  sequence: number;
  previousHash?: string;
  recordHash: string;
  hashAlgorithm: 'sha256-v1';
}

export interface AuditEntry extends AuditEntryInput, AuditHashFields {
  id: string;
  occurredAt: string;
}

export const SENSITIVE_KEYS = [
  'password',
  'token',
  'session',
  'secret',
  'mfa',
  'recoveryCode',
  'apiKey',
  'authorization'
];

export function redactSensitiveDetails(input?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!input) return undefined;
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => {
      const lower = key.toLowerCase();
      return SENSITIVE_KEYS.some((sensitive) => lower.includes(sensitive.toLowerCase()))
        ? [key, '[REDACTED]']
        : [key, value];
    })
  );
}
