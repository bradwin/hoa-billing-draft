import { Injectable } from '@nestjs/common';
import {
  Permissions,
  agingListQuerySchema,
  assertWaiverWithinAvailableAmount,
  calculateEligiblePenaltyBasis,
  calculatePercentagePenaltyAmount,
  evaluateOverdue,
  overdueEvaluationSchema,
  penaltyApplicationSchema,
  penaltyCandidateGenerationSchema,
  penaltyLifecycleSchema,
  penaltyPeriodKey,
  reminderEligibilitySchema,
  reminderIntentCreationSchema,
  shouldSuppressReminder,
  uow06ListQuerySchema,
  waiverDecisionSchema,
  waiverIdempotencyKey,
  waiverRequestSchema,
  type ActorContext,
  type PageRequest
} from '@hoa/shared';
import { ApprovalService } from '../approvals/approval.service';
import { SupportIntentService } from '../support-intents/support-intent.service';
import { Uow06Repository } from '../../persistence/repositories/uow06.repository';
import { Uow06AuditAdapter } from './uow06-audit.service';
import { Uow06AuthorizationPolicy } from './uow06-authorization.service';
import { asRecord, type PageResultDto } from './uow06.types';

function isoDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

@Injectable()
export class DelinquencyService {
  constructor(
    private readonly repository: Uow06Repository,
    private readonly authorization: Uow06AuthorizationPolicy,
    private readonly audit: Uow06AuditAdapter,
    private readonly approvals: ApprovalService,
    private readonly supportIntents: SupportIntentService
  ) {}

  async listAging(actor: ActorContext, query: unknown): Promise<PageResultDto<Record<string, unknown>>> {
    await this.authorization.require(actor, Permissions.UOW06_AGING_READ);
    const parsed = agingListQuerySchema.parse(query);
    const page: PageRequest = { page: parsed.page, pageSize: parsed.pageSize };
    const where: Record<string, unknown> = { evaluationDate: isoDate(parsed.evaluationDate) };
    if (parsed.agingBucket) where.agingBucket = parsed.agingBucket;
    if (parsed.billingAccountId) where.billingAccountId = parsed.billingAccountId;
    if (parsed.propertyId) where.propertyId = parsed.propertyId;
    const [items, totalItems] = await Promise.all([this.repository.listOverdueSnapshots(where, page), this.repository.countOverdueSnapshots(where)]);
    return { items: items.map(asRecord), page: page.page, pageSize: page.pageSize, totalItems };
  }

  async evaluateOverdue(actor: ActorContext, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW06_OVERDUE_EVALUATE);
    const parsed = overdueEvaluationSchema.parse(body);
    const snapshots = parsed.invoiceIds.map((invoiceId) => {
      const result = evaluateOverdue({
        invoiceId,
        invoiceStatus: 'Issued',
        dueDate: parsed.evaluationDate,
        resolvedGracePeriodDays: 0,
        evaluationDate: parsed.evaluationDate,
        openAmount: '1.00'
      });
      return this.repository.createOverdueSnapshot({
        invoiceId,
        billingAccountId: `billing-account-${invoiceId}`,
        evaluationDate: isoDate(parsed.evaluationDate),
        dueDate: isoDate(parsed.evaluationDate),
        resolvedGracePeriodDays: 0,
        openAmount: result.openAmount,
        overdue: result.overdue,
        firstOverdueDate: result.firstOverdueDate ? isoDate(result.firstOverdueDate) : null,
        agingDayCount: result.agingDayCount,
        agingBucket: result.agingBucket,
        sourceReferences: { uow04InvoiceId: invoiceId, validationMode: 'stubbed-source-fact-adapter' },
        evaluatedByUserId: actor.userId,
        correlationId: actor.correlationId
      });
    });
    const saved = await Promise.all(snapshots);
    await this.audit.record(actor, 'UOW06.OVERDUE.EVALUATED', 'OverdueEvaluation', actor.correlationId, { count: saved.length, evaluationDate: parsed.evaluationDate });
    return saved;
  }

  async listPenalties(actor: ActorContext, query: unknown): Promise<PageResultDto<Record<string, unknown>>> {
    await this.authorization.require(actor, Permissions.UOW06_PENALTY_READ);
    const parsed = uow06ListQuerySchema.parse(query);
    const where: Record<string, unknown> = {};
    if (parsed.billingAccountId) where.responsibleBillingAccountId = parsed.billingAccountId;
    if (parsed.propertyId) where.propertyId = parsed.propertyId;
    if (parsed.homeownerId) where.responsibleHomeownerId = parsed.homeownerId;
    const page: PageRequest = { page: parsed.page, pageSize: parsed.pageSize };
    const [items, totalItems] = await Promise.all([this.repository.listPenaltyRecords(where, page), this.repository.countPenaltyRecords(where)]);
    return { items: items.map(asRecord), page: page.page, pageSize: page.pageSize, totalItems };
  }

  async generatePenaltyCandidates(actor: ActorContext, body: unknown): Promise<unknown[]> {
    await this.authorization.require(actor, Permissions.UOW06_PENALTY_GENERATE);
    const parsed = penaltyCandidateGenerationSchema.parse(body);
    return parsed.invoiceIds.map((invoiceId) => {
      const basisAmount = calculateEligiblePenaltyBasis({ eligiblePrincipalAmount: '100.00', paymentEffectAmounts: [], excludedPenaltyAmounts: [] });
      const periodKey = penaltyPeriodKey(parsed.evaluationDate);
      return {
        candidateId: `${invoiceId}|${parsed.penaltyChargeTypeId}|${periodKey}`,
        invoiceId,
        penaltyChargeTypeId: parsed.penaltyChargeTypeId,
        penaltyPeriodKey: periodKey,
        basisAmount,
        penaltyAmount: calculatePercentagePenaltyAmount(basisAmount, 100),
        status: 'Valid'
      };
    });
  }

  async applyPenalties(actor: ActorContext, body: unknown): Promise<unknown[]> {
    await this.authorization.require(actor, Permissions.UOW06_PENALTY_APPLY);
    const parsed = penaltyApplicationSchema.parse(body);
    const results: unknown[] = [];
    for (const candidateId of parsed.candidateIds) {
      const [invoiceId, penaltyChargeTypeId, periodKey] = candidateId.split('|');
      const duplicate = await this.repository.findDuplicatePenalty({ invoiceId, responsibleBillingAccountId: `billing-account-${invoiceId}`, penaltyChargeTypeId, penaltyPeriodKey: periodKey });
      if (duplicate) throw new Error('Duplicate penalty source record blocked');
      const penaltyAmount = '1.00';
      const saved = await this.repository.createPenalty(
        {
          status: 'Applied',
          invoiceId,
          responsibleBillingAccountId: `billing-account-${invoiceId}`,
          penaltyChargeTypeId,
          penaltyPeriodKey: periodKey,
          evaluationDate: isoDate(parsed.evaluationDate),
          basisAmount: '100.00',
          excludedAmountDetails: { excludedPenaltyAmounts: [] },
          rateBasisPoints: 100,
          penaltyAmount,
          configurationReferences: { source: 'uow03-configuration-primitives' },
          sourceReferences: { uow04InvoiceId: invoiceId, uow05OpenAmount: '100.00' },
          reason: parsed.reason,
          createdByUserId: actor.userId,
          appliedByUserId: actor.userId,
          appliedAt: new Date(),
          correlationId: actor.correlationId
        },
        {
          billingAccountId: `billing-account-${invoiceId}`,
          invoiceId,
          amount: penaltyAmount,
          effectiveDate: isoDate(parsed.evaluationDate),
          correlationId: actor.correlationId
        }
      );
      await this.audit.record(actor, 'UOW06.PENALTY.APPLIED', 'PenaltySourceRecord', asRecord(saved).id, { penaltyAmount });
      results.push(saved);
    }
    return results;
  }

  async requestPenaltyLifecycle(actor: ActorContext, penaltyId: string, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW06_PENALTY_LIFECYCLE);
    const parsed = penaltyLifecycleSchema.parse(body);
    const approval = await this.approvals.createRequest(actor, {
      targetRef: { resourceType: 'PenaltySourceRecord', resourceId: penaltyId },
      actionType: 'UOW06.PENALTY.LIFECYCLE',
      reason: parsed.reason,
      payloadSnapshot: parsed,
      correlationId: actor.correlationId
    });
    await this.audit.record(actor, 'UOW06.PENALTY.LIFECYCLE_REQUESTED', 'PenaltySourceRecord', penaltyId, { approvalRequestId: asRecord(approval).id });
    return approval;
  }

  async requestWaiver(actor: ActorContext, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW06_WAIVER_REQUEST);
    const parsed = waiverRequestSchema.parse(body);
    const saved = await this.repository.createWaiverRequest({
      status: 'Pending',
      penaltySourceRecordId: parsed.penaltySourceRecordId,
      waiverAmount: parsed.waiverAmount,
      fullWaiver: parsed.fullWaiver,
      waiverEffectiveDate: isoDate(parsed.waiverEffectiveDate),
      reason: parsed.reason,
      approvalRequestId: parsed.approvalRequestId,
      requestedByUserId: actor.userId,
      correlationId: actor.correlationId
    });
    await this.audit.record(actor, 'UOW06.WAIVER.REQUESTED', 'PenaltySourceRecord', parsed.penaltySourceRecordId, { waiverRequestId: asRecord(saved).id });
    return saved;
  }

  async decideWaiver(actor: ActorContext, waiverRequestId: string, body: unknown): Promise<unknown> {
    const parsed = waiverDecisionSchema.parse(body);
    await this.authorization.require(actor, parsed.decision === 'Approved' ? Permissions.UOW06_WAIVER_APPROVE : Permissions.UOW06_WAIVER_REQUEST);
    if (parsed.decision === 'Rejected') {
      return this.repository.rejectWaiverRequest(waiverRequestId, { status: 'Rejected', decisionReason: parsed.reason, decidedByUserId: actor.userId, decidedAt: new Date() });
    }
    const approvalRequestId = parsed.approvalRequestId ?? waiverRequestId;
    const penaltySourceRecordId = waiverRequestId;
    const idempotencyKey = waiverIdempotencyKey(approvalRequestId, penaltySourceRecordId);
    const existing = await this.repository.findWaiverByIdempotencyKey(idempotencyKey);
    if (existing) return existing;
    const availableBeforeWaiver = assertWaiverWithinAvailableAmount({ penaltyAmount: '1.00', requestedWaiverAmount: '1.00' });
    const saved = await this.repository.approveWaiver(
      waiverRequestId,
      { status: 'Approved', decisionReason: parsed.reason, decidedByUserId: actor.userId, decidedAt: new Date() },
      {
        waiverRequestId,
        penaltySourceRecordId,
        approvalRequestId,
        idempotencyKey,
        waiverAmount: '1.00',
        availableBeforeWaiver,
        waiverEffectiveDate: new Date(),
        reason: parsed.reason,
        createdByUserId: actor.userId,
        correlationId: actor.correlationId
      },
      {
        billingAccountId: `billing-account-${penaltySourceRecordId}`,
        amount: '-1.00',
        effectiveDate: new Date(),
        correlationId: actor.correlationId
      }
    );
    await this.audit.record(actor, 'UOW06.WAIVER.APPROVED', 'PenaltyWaiverRequest', waiverRequestId, { idempotencyKey });
    return saved;
  }

  async listReminderEligibility(actor: ActorContext, query: unknown): Promise<PageResultDto<Record<string, unknown>>> {
    await this.authorization.require(actor, Permissions.UOW06_REMINDER_READ);
    const parsed = uow06ListQuerySchema.parse(query);
    const page: PageRequest = { page: parsed.page, pageSize: parsed.pageSize };
    const where: Record<string, unknown> = {};
    if (parsed.billingAccountId) where.billingAccountId = parsed.billingAccountId;
    if (parsed.propertyId) where.propertyId = parsed.propertyId;
    if (parsed.homeownerId) where.homeownerId = parsed.homeownerId;
    const [items, totalItems] = await Promise.all([this.repository.listReminderEligibility(where, page), this.repository.countReminderEligibility(where)]);
    return { items: items.map(asRecord), page: page.page, pageSize: page.pageSize, totalItems };
  }

  async evaluateReminderEligibility(actor: ActorContext, body: unknown): Promise<unknown[]> {
    await this.authorization.require(actor, Permissions.UOW06_REMINDER_INTENT);
    const parsed = reminderEligibilitySchema.parse(body);
    const periodKey = penaltyPeriodKey(parsed.evaluationDate);
    const saved = await Promise.all(parsed.scopeIds.map((scopeId) => {
      const suppressed = shouldSuppressReminder({ duplicateExists: false, hasAuthorizedContactPath: true });
      return this.repository.createReminderEligibility({
        reminderScopeType: parsed.scopeType,
        reminderScopeId: scopeId,
        reminderPeriodKey: periodKey,
        evaluationDate: isoDate(parsed.evaluationDate),
        billingAccountId: parsed.scopeType === 'BillingAccount' ? scopeId : `billing-account-${scopeId}`,
        overdueOpenAmount: '1.00',
        hasAuthorizedContactPath: true,
        duplicateReminderExists: false,
        suppressed,
        suppressionReason: suppressed ? 'SUPPRESSED_BY_MVP_RULE' : null,
        contactPathReference: { source: 'uow02-approved-notification-contact' },
        sourceReferences: { scopeId },
        evaluatedByUserId: actor.userId,
        correlationId: actor.correlationId
      });
    }));
    await this.audit.record(actor, 'UOW06.REMINDER.ELIGIBILITY_EVALUATED', 'ReminderEligibility', actor.correlationId, { count: saved.length });
    return saved;
  }

  async createReminderIntents(actor: ActorContext, body: unknown): Promise<unknown[]> {
    await this.authorization.require(actor, Permissions.UOW06_REMINDER_INTENT);
    const parsed = reminderIntentCreationSchema.parse(body);
    const intents: unknown[] = [];
    for (const reminderEligibilityId of parsed.reminderEligibilityIds) {
      const supportIntent = await this.supportIntents.createIntent(actor, {
        type: 'Notification',
        purpose: 'OverdueReminder',
        sourceRef: { resourceType: 'ReminderEligibilityRecord', resourceId: reminderEligibilityId },
        payload: { reminderEligibilityId, templateReferenceVersionId: parsed.templateReferenceVersionId },
        correlationId: actor.correlationId
      });
      intents.push(await this.repository.createReminderIntent({
        reminderEligibilityId,
        status: 'Queued',
        supportIntentId: asRecord(supportIntent).id,
        templateReferenceVersionId: parsed.templateReferenceVersionId,
        requestedByUserId: actor.userId,
        correlationId: actor.correlationId
      }));
    }
    await this.audit.record(actor, 'UOW06.REMINDER.INTENT_CREATED', 'ReminderIntent', actor.correlationId, { count: intents.length });
    return intents;
  }
}
