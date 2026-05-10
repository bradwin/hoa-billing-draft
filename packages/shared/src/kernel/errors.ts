import type { DomainError } from './types';

export const ErrorCodes = {
  AUTH_GENERIC_FAILURE: 'AUTH_GENERIC_FAILURE',
  AUTH_MFA_REQUIRED: 'AUTH_MFA_REQUIRED',
  AUTH_SESSION_INVALID: 'AUTH_SESSION_INVALID',
  AUTHORIZATION_DENIED: 'AUTHORIZATION_DENIED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  SETTINGS_UNKNOWN_KEY: 'SETTINGS_UNKNOWN_KEY',
  AUDIT_APPEND_FAILED: 'AUDIT_APPEND_FAILED',
  APPROVAL_SELF_DECISION_DENIED: 'APPROVAL_SELF_DECISION_DENIED',
  SUPPORT_ADAPTER_DISABLED: 'SUPPORT_ADAPTER_DISABLED',
  SYSTEM_UNEXPECTED: 'SYSTEM_UNEXPECTED'
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export function buildError(
  code: ErrorCode,
  safeMessage: string,
  category: DomainError['category'],
  correlationId?: string,
  safeDetails?: Record<string, unknown>
): DomainError {
  return {
    code,
    safeMessage,
    category,
    ...(correlationId ? { correlationId } : {}),
    ...(safeDetails ? { safeDetails } : {})
  };
}

export function authorizationDenied(correlationId: string, reason = 'Access denied'): DomainError {
  return buildError(ErrorCodes.AUTHORIZATION_DENIED, reason, 'Authorization', correlationId);
}

export function validationFailed(correlationId: string, safeDetails?: Record<string, unknown>): DomainError {
  return buildError(ErrorCodes.VALIDATION_FAILED, 'Invalid request', 'Validation', correlationId, safeDetails);
}
