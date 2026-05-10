import { Injectable } from '@nestjs/common';
import type { PageRequest } from '@hoa/shared';
import { PrismaService } from '../../prisma/prisma.service';

function toSkipTake(page: PageRequest): { skip: number; take: number } {
  return {
    skip: (page.page - 1) * page.pageSize,
    take: page.pageSize
  };
}

@Injectable()
export class Uow03Repository {
  constructor(private readonly prisma: PrismaService) {}

  get client(): any {
    return this.prisma as any;
  }

  findDrafts(where: Record<string, unknown>, page: PageRequest): Promise<unknown[]> {
    return this.client.billingConfigurationDraft.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      ...toSkipTake(page)
    });
  }

  countDrafts(where: Record<string, unknown>): Promise<number> {
    return this.client.billingConfigurationDraft.count({ where });
  }

  createDraft(data: Record<string, unknown>): Promise<unknown> {
    return this.client.billingConfigurationDraft.create({ data });
  }

  updateDraft(id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.client.billingConfigurationDraft.update({ where: { id }, data });
  }

  findDraftById(id: string): Promise<unknown | null> {
    return this.client.billingConfigurationDraft.findUnique({ where: { id }, include: { versions: true } });
  }

  findVersions(where: Record<string, unknown>, page: PageRequest): Promise<unknown[]> {
    return this.client.configurationVersion.findMany({
      where,
      orderBy: { effectiveFrom: 'desc' },
      ...toSkipTake(page)
    });
  }

  findActiveVersions(identity: Record<string, unknown>): Promise<unknown[]> {
    return this.client.configurationVersion.findMany({
      where: { ...identity, status: 'Active' },
      orderBy: { effectiveFrom: 'asc' }
    });
  }

  findCoveringVersions(identity: Record<string, unknown>, resolutionDate: Date): Promise<unknown[]> {
    return this.client.configurationVersion.findMany({
      where: {
        ...identity,
        status: 'Active',
        effectiveFrom: { lte: resolutionDate },
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: resolutionDate } }]
      },
      orderBy: { effectiveFrom: 'desc' }
    });
  }

  async activateDraft(draft: Record<string, any>, actorUserId: string, approvalRequestId?: string): Promise<unknown> {
    return this.client.$transaction(async (tx: any) => {
      await tx.configurationVersion.updateMany({
        where: {
          configurationType: draft.configurationType,
          identityKey: draft.identityKey,
          scopeKey: draft.scopeKey,
          ruleType: draft.ruleType,
          status: 'Active',
          effectiveFrom: { gte: draft.effectiveFrom }
        },
        data: { status: 'Superseded' }
      });
      const version = await tx.configurationVersion.create({
        data: {
          configurationType: draft.configurationType,
          identityKey: draft.identityKey,
          scopeKey: draft.scopeKey,
          ruleType: draft.ruleType,
          effectiveFrom: draft.effectiveFrom,
          effectiveTo: draft.effectiveTo,
          sourceDraftId: draft.id,
          approvalRequestId,
          activatedByUserId: actorUserId,
          payload: draft.payload,
          ruleMetadata: this.ruleMetadata(draft),
          auditCorrelationId: draft.correlationId
        }
      });
      await this.createRuleRecord(tx, version.id, draft);
      await tx.billingConfigurationDraft.update({
        where: { id: draft.id },
        data: { status: 'Activated', approvalRequestId }
      });
      return version;
    });
  }

  private ruleMetadata(draft: Record<string, any>): Record<string, unknown> {
    return {
      configurationType: draft.configurationType,
      identityKey: draft.identityKey,
      scopeKey: draft.scopeKey,
      ruleType: draft.ruleType
    };
  }

  private async createRuleRecord(tx: any, versionId: string, draft: Record<string, any>): Promise<void> {
    const payload = draft.payload ?? {};
    if (draft.configurationType === 'DuesRate') {
      await tx.duesRateRule.create({ data: { versionId, ratePerSqm: payload.ratePerSqm, currency: payload.currency ?? 'PHP', roundingRuleKey: payload.roundingRuleKey ?? 'default-half-up', chargeTypeKey: payload.chargeTypeKey ?? 'dues' } });
    } else if (draft.configurationType === 'BillingCycle') {
      await tx.billingCycleRule.create({ data: { versionId, cycleType: payload.cycleType, anchorDate: new Date(payload.anchorDate), customRule: payload.customRule, periodLabelFormat: payload.periodLabelFormat ?? 'YYYY-MM' } });
    } else if (draft.configurationType === 'DueDate') {
      await tx.dueDateRule.create({ data: { versionId, baseDateType: payload.baseDateType, dayOffset: payload.dayOffset } });
    } else if (draft.configurationType === 'GracePeriod') {
      await tx.gracePeriodRule.create({ data: { versionId, graceDays: payload.graceDays } });
    } else if (draft.configurationType === 'Rounding') {
      await tx.roundingRule.create({ data: { versionId, roundingMode: 'HalfUp', moneyScale: 2, lotAreaScale: 4, rateScale: 4, roundingTiming: payload.roundingTiming ?? 'LineLevel' } });
    } else if (draft.configurationType === 'ChargeType') {
      await tx.chargeType.create({ data: { versionId, code: payload.code, name: payload.name, category: payload.category, isRecurringEligible: payload.isRecurringEligible ?? false, isManualEntryEligible: payload.isManualEntryEligible ?? false, isAutomaticGenerationEligible: payload.isAutomaticGenerationEligible ?? false } });
    } else if (draft.configurationType === 'NumberingFormat') {
      await tx.numberingFormatRule.create({ data: { versionId, documentType: payload.documentType, prefixTemplate: payload.prefixTemplate, sequenceScope: payload.sequenceScope, padding: payload.padding, resetPolicy: payload.resetPolicy ?? 'Never' } });
    } else if (draft.configurationType === 'TemplateReference') {
      await tx.templateReference.create({ data: { versionId, templateType: payload.templateType, templateKey: payload.templateKey, versionLabel: payload.versionLabel } });
    } else if (draft.configurationType === 'PaymentMethod') {
      await tx.paymentMethodDefinition.create({ data: { versionId, code: payload.code, displayName: payload.displayName, instructions: payload.instructions, referenceRequired: payload.referenceRequired ?? false, sortOrder: payload.sortOrder ?? 0 } });
    }
  }
}
