import { Injectable } from '@nestjs/common';
import { authorizeObject, hasPermission, type ActorContext, type Permission, type ResourceRef } from '@hoa/shared';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthorizationService {
  constructor(private readonly audit: AuditService) {}

  can(actor: ActorContext, permission: Permission): boolean {
    return hasPermission(actor.role, permission);
  }

  async deny(actor: ActorContext | undefined, action: string, correlationId: string, reason: string): Promise<void> {
    await this.audit.recordSecurityEvent({
      category: 'Security',
      action,
      eventType: 'AUTHZ.DENIED',
      correlationId,
      result: 'Denied',
      ...(actor ? { actor } : {}),
      metadata: { reason }
    });
  }

  authorizeResource(input: {
    actor: ActorContext;
    resource: ResourceRef;
    action: string;
    ownershipRefs?: readonly string[];
  }): boolean {
    return authorizeObject(input).allowed;
  }
}
