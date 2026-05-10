import { Injectable } from '@nestjs/common';
import type { ActorContext } from '@hoa/shared';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class Uow03AuditAdapter {
  constructor(private readonly audit: AuditService) {}

  record(actor: ActorContext, action: string, resourceType: string, resourceId: string, newValue?: Record<string, unknown>): Promise<unknown> {
    return this.audit.append({
      actor,
      category: 'Configuration',
      action,
      resourceRef: { resourceType, resourceId },
      correlationId: actor.correlationId,
      result: 'Success',
      ...(newValue ? { newValue } : {})
    });
  }
}
