import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { AuditCategory as PrismaAuditCategory, Prisma } from '@prisma/client';
import type { AuditEntryInput, PageRequest, PageResult } from '@hoa/shared';
import { redactSensitiveDetails } from '@hoa/shared';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditQueryFilter {
  actorUserId?: string;
  category?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  correlationId?: string;
  from: string;
  to: string;
}

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async append(input: AuditEntryInput): Promise<unknown> {
    const streamKey = this.streamKey(input);
    const previous = await this.prisma.auditEntry.findFirst({
      where: { streamKey },
      orderBy: { sequence: 'desc' }
    });
    const sequence = previous ? previous.sequence + 1 : 1;
    const metadata = redactSensitiveDetails(input.metadata);
    const recordHash = this.hashRecord({ ...input, metadata, streamKey, sequence, previousHash: previous?.recordHash });
    const data = {
      ...(input.actor ? { actorUserId: input.actor.userId } : {}),
      category: input.category,
      action: input.action,
      ...(input.resourceRef ? { resourceType: input.resourceRef.resourceType, resourceId: input.resourceRef.resourceId } : {}),
      correlationId: input.correlationId,
      ...(input.reason ? { reason: input.reason } : {}),
      ...(input.oldValue ? { oldValue: input.oldValue as Prisma.InputJsonValue } : {}),
      ...(input.newValue ? { newValue: input.newValue as Prisma.InputJsonValue } : {}),
      result: input.result,
      ...(metadata ? { metadata: metadata as Prisma.InputJsonValue } : {}),
      streamKey,
      sequence,
      ...(previous?.recordHash ? { previousHash: previous.recordHash } : {}),
      recordHash,
      hashAlgorithm: 'sha256-v1'
    };
    return this.prisma.auditEntry.create({
      data
    });
  }

  async findPage(filter: AuditQueryFilter, page: PageRequest): Promise<PageResult<unknown>> {
    const skip = (page.page - 1) * page.pageSize;
    const where: Prisma.AuditEntryWhereInput = {
      ...(filter.actorUserId ? { actorUserId: filter.actorUserId } : {}),
      ...(filter.category ? { category: filter.category as PrismaAuditCategory } : {}),
      ...(filter.action ? { action: filter.action } : {}),
      ...(filter.resourceType ? { resourceType: filter.resourceType } : {}),
      ...(filter.resourceId ? { resourceId: filter.resourceId } : {}),
      ...(filter.correlationId ? { correlationId: filter.correlationId } : {}),
      occurredAt: { gte: new Date(filter.from), lte: new Date(filter.to) }
    };
    const [items, total] = await Promise.all([
      this.prisma.auditEntry.findMany({ where, skip, take: page.pageSize, orderBy: { occurredAt: 'desc' } }),
      this.prisma.auditEntry.count({ where })
    ]);
    return { items, total, page: page.page, pageSize: page.pageSize };
  }

  private streamKey(input: AuditEntryInput): string {
    if (input.resourceRef) return `${input.category}:${input.resourceRef.resourceType}:${input.resourceRef.resourceId}`;
    return `${input.category}:global`;
  }

  private hashRecord(value: unknown): string {
    return createHash('sha256').update(JSON.stringify(value)).digest('hex');
  }
}
