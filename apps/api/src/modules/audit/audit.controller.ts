import { Body, Controller, Post, Req } from '@nestjs/common';
import { auditQuerySchema, Permissions, type ActorContext } from '@hoa/shared';
import { createPageRequest } from '@hoa/shared';
import { RequirePermission } from '../authorization/require-permission.decorator';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @RequirePermission(Permissions.AUDIT_OPERATIONAL_READ)
  @Post('query')
  query(@Req() _req: { actor: ActorContext }, @Body() body: unknown): Promise<unknown> {
    const parsed = auditQuerySchema.parse(body);
    const filter = {
      from: parsed.from,
      to: parsed.to,
      ...(parsed.actorUserId ? { actorUserId: parsed.actorUserId } : {}),
      ...(parsed.category ? { category: parsed.category } : {}),
      ...(parsed.action ? { action: parsed.action } : {}),
      ...(parsed.resourceType ? { resourceType: parsed.resourceType } : {}),
      ...(parsed.resourceId ? { resourceId: parsed.resourceId } : {}),
      ...(parsed.correlationId ? { correlationId: parsed.correlationId } : {})
    };
    return this.audit.query(filter, createPageRequest(parsed.page, parsed.pageSize, parsed.sort));
  }
}
