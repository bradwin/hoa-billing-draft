import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { AuditEntryInput, PageRequest, PageResult } from '@hoa/shared';
import { redactSensitiveDetails } from '@hoa/shared';
import { AuditRepository, type AuditQueryFilter } from '../../persistence/repositories/audit.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(
    private readonly auditRepository: AuditRepository,
    private readonly prisma: PrismaService
  ) {}

  append(input: AuditEntryInput): Promise<unknown> {
    const metadata = redactSensitiveDetails(input.metadata);
    return this.auditRepository.append(metadata ? { ...input, metadata } : input);
  }

  recordSecurityEvent(input: AuditEntryInput & { eventType: string; sourceFingerprint?: string }): Promise<unknown> {
    return this.prisma.$transaction(async () => {
      const auditEntry = await this.append({ ...input, category: 'Security' });
      const metadata = redactSensitiveDetails(input.metadata);
      await this.prisma.securityEvent.create({
        data: {
          eventType: input.eventType,
          correlationId: input.correlationId,
          ...((auditEntry as { id?: string }).id ? { auditEntryId: (auditEntry as { id: string }).id } : {}),
          ...(input.actor ? { actorUserId: input.actor.userId } : {}),
          ...(input.sourceFingerprint ? { sourceFingerprint: input.sourceFingerprint } : {}),
          ...(metadata ? { metadata: metadata as Prisma.InputJsonValue } : {})
        }
      });
      return auditEntry;
    });
  }

  query(filter: AuditQueryFilter, page: PageRequest): Promise<PageResult<unknown>> {
    return this.auditRepository.findPage(filter, page);
  }
}
