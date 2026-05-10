import { Injectable } from '@nestjs/common';
import type { ActorContext } from '@hoa/shared';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class Uow02AuditAdapter {
  constructor(private readonly audit: AuditService) {}

  record(actor: ActorContext, action: string, resourceType: 'Homeowner' | 'Property' | 'BillingAccount', resourceId: string, newValue?: Record<string, unknown>): Promise<unknown> {
    return this.audit.append({
      actor,
      category: 'Workflow',
      action,
      resourceRef: { resourceType, resourceId },
      correlationId: actor.correlationId,
      result: 'Success',
      ...(newValue ? { newValue } : {})
    });
  }
}
