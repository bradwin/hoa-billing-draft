import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { createSupportIntentSchema, type ActorContext } from '@hoa/shared';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SupportIntentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async createIntent(actor: ActorContext, input: unknown): Promise<unknown> {
    const parsed = createSupportIntentSchema.parse(input);
    const intent = await this.prisma.supportIntent.create({
      data: {
        type: parsed.type,
        purpose: parsed.purpose,
        ...(parsed.sourceRef ? { sourceType: parsed.sourceRef.resourceType, sourceId: parsed.sourceRef.resourceId } : {}),
        ...(parsed.recipientRef
          ? { recipientType: parsed.recipientRef.resourceType, recipientId: parsed.recipientRef.resourceId }
          : {}),
        payload: parsed.payload as Prisma.InputJsonValue,
        requestedBy: actor.userId,
        correlationId: parsed.correlationId
      }
    });
    await this.audit.append({
      actor,
      category: 'System',
      action: 'SUPPORT_INTENT.CREATED',
      resourceRef: { resourceType: 'SupportIntent', resourceId: (intent as { id: string }).id },
      correlationId: parsed.correlationId,
      result: 'Success',
      metadata: { type: parsed.type, purpose: parsed.purpose }
    });
    return intent;
  }
}
