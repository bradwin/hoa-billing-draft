import { Injectable } from '@nestjs/common';
import type { PageRequest } from '@hoa/shared';
import { PrismaService } from '../../prisma/prisma.service';

function toSkipTake(page: PageRequest): { skip: number; take: number } {
  return { skip: (page.page - 1) * page.pageSize, take: page.pageSize };
}

@Injectable()
export class Uow06Repository {
  constructor(private readonly prisma: PrismaService) {}

  get client(): any {
    return this.prisma as any;
  }

  listOverdueSnapshots(where: Record<string, unknown>, page: PageRequest): Promise<unknown[]> {
    return this.client.overdueEvaluationSnapshot.findMany({ where, orderBy: { evaluationDate: 'desc' }, ...toSkipTake(page) });
  }

  countOverdueSnapshots(where: Record<string, unknown>): Promise<number> {
    return this.client.overdueEvaluationSnapshot.count({ where });
  }

  createOverdueSnapshot(data: Record<string, unknown>): Promise<unknown> {
    return this.client.overdueEvaluationSnapshot.create({ data });
  }

  listPenaltyRecords(where: Record<string, unknown>, page: PageRequest): Promise<unknown[]> {
    return this.client.penaltySourceRecord.findMany({ where, orderBy: { createdAt: 'desc' }, include: { waivers: true, balanceImpactFacts: true }, ...toSkipTake(page) });
  }

  countPenaltyRecords(where: Record<string, unknown>): Promise<number> {
    return this.client.penaltySourceRecord.count({ where });
  }

  findPenaltyById(id: string): Promise<unknown | null> {
    return this.client.penaltySourceRecord.findUnique({ where: { id }, include: { waivers: true, balanceImpactFacts: true } });
  }

  findDuplicatePenalty(input: Record<string, unknown>): Promise<unknown | null> {
    return this.client.penaltySourceRecord.findFirst({
      where: {
        invoiceId: input.invoiceId,
        responsibleBillingAccountId: input.responsibleBillingAccountId,
        penaltyChargeTypeId: input.penaltyChargeTypeId,
        penaltyPeriodKey: input.penaltyPeriodKey,
        status: { in: ['Draft', 'Applied', 'Reissued'] }
      }
    });
  }

  async createPenalty(data: Record<string, any>, balanceFact: Record<string, any>): Promise<unknown> {
    return this.client.$transaction(async (tx: any) => {
      const penalty = await tx.penaltySourceRecord.create({ data });
      await tx.penaltyBalanceImpactFact.create({
        data: {
          ...balanceFact,
          sourceRecordType: 'PenaltySourceRecord',
          sourceRecordId: penalty.id,
          penaltySourceRecordId: penalty.id
        }
      });
      return tx.penaltySourceRecord.findUnique({ where: { id: penalty.id }, include: { balanceImpactFacts: true } });
    });
  }

  updatePenalty(id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.client.penaltySourceRecord.update({ where: { id }, data });
  }

  createWaiverRequest(data: Record<string, unknown>): Promise<unknown> {
    return this.client.penaltyWaiverRequest.create({ data });
  }

  findWaiverByIdempotencyKey(idempotencyKey: string): Promise<unknown | null> {
    return this.client.penaltyWaiverSourceRecord.findUnique({ where: { idempotencyKey } });
  }

  async approveWaiver(waiverRequestId: string, decision: Record<string, any>, waiver: Record<string, any>, balanceFact: Record<string, any>): Promise<unknown> {
    return this.client.$transaction(async (tx: any) => {
      const existing = await tx.penaltyWaiverSourceRecord.findUnique({ where: { idempotencyKey: waiver.idempotencyKey } });
      if (existing) return existing;
      await tx.penaltyWaiverRequest.update({ where: { id: waiverRequestId }, data: decision });
      const savedWaiver = await tx.penaltyWaiverSourceRecord.create({ data: waiver });
      await tx.penaltyBalanceImpactFact.create({
        data: {
          ...balanceFact,
          sourceRecordType: 'PenaltyWaiverSourceRecord',
          sourceRecordId: savedWaiver.id,
          waiverSourceRecordId: savedWaiver.id
        }
      });
      return tx.penaltyWaiverSourceRecord.findUnique({ where: { id: savedWaiver.id }, include: { balanceImpactFacts: true } });
    });
  }

  rejectWaiverRequest(id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.client.penaltyWaiverRequest.update({ where: { id }, data });
  }

  listReminderEligibility(where: Record<string, unknown>, page: PageRequest): Promise<unknown[]> {
    return this.client.reminderEligibilityRecord.findMany({ where, orderBy: { evaluationDate: 'desc' }, include: { reminderIntents: true }, ...toSkipTake(page) });
  }

  countReminderEligibility(where: Record<string, unknown>): Promise<number> {
    return this.client.reminderEligibilityRecord.count({ where });
  }

  createReminderEligibility(data: Record<string, unknown>): Promise<unknown> {
    return this.client.reminderEligibilityRecord.create({ data });
  }

  createReminderIntent(data: Record<string, unknown>): Promise<unknown> {
    return this.client.reminderIntentRecord.create({ data });
  }
}
