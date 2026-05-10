export type ID = string;
export type IsoDateString = string;
export type DecimalString = string;

export type RoleCode =
  | 'SystemAdministrator'
  | 'Treasurer'
  | 'BillingStaff'
  | 'BoardMember'
  | 'Homeowner';

export interface ActorContext {
  userId: ID;
  role: RoleCode;
  homeownerId?: ID;
  correlationId: string;
  sessionId: ID;
}

export interface ResourceRef {
  resourceType: string;
  resourceId: ID;
  ownerScope?: string;
}

export interface AuditContext {
  actor: ActorContext;
  correlationId: string;
  reason?: string;
  requestIp?: string;
  userAgent?: string;
}

export type CommandResult<T> =
  | { ok: true; value: T; correlationId: string }
  | { ok: false; error: DomainError; correlationId: string };

export interface DomainError {
  code: string;
  safeMessage: string;
  category: 'Validation' | 'Authorization' | 'Authentication' | 'Conflict' | 'System';
  correlationId?: string;
  safeDetails?: Record<string, unknown>;
}
