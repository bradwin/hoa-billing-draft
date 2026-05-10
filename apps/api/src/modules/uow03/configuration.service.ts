import { Injectable } from '@nestjs/common';
import {
  Permissions,
  activateConfigurationDraftSchema,
  configurationListQuerySchema,
  createConfigurationDraftSchema,
  resolutionQuerySchema,
  submitConfigurationDraftSchema,
  updateConfigurationDraftSchema,
  type ActorContext,
  type PageRequest
} from '@hoa/shared';
import { ApprovalService } from '../approvals/approval.service';
import { Uow03Repository } from '../../persistence/repositories/uow03.repository';
import { Uow03AuditAdapter } from './uow03-audit.service';
import { Uow03AuthorizationPolicy } from './uow03-authorization.service';
import { asRecord, type PageResultDto } from './uow03.types';
import { VersionTimelineService } from './version-timeline.service';

@Injectable()
export class ConfigurationService {
  constructor(
    private readonly repository: Uow03Repository,
    private readonly authorization: Uow03AuthorizationPolicy,
    private readonly audit: Uow03AuditAdapter,
    private readonly timeline: VersionTimelineService,
    private readonly approvals: ApprovalService
  ) {}

  async list(actor: ActorContext, query: unknown): Promise<PageResultDto<Record<string, unknown>>> {
    await this.authorization.require(actor, Permissions.UOW03_CONFIG_READ);
    const parsed = configurationListQuerySchema.parse(query);
    const where: Record<string, unknown> = {};
    if (parsed.configurationType) where.configurationType = parsed.configurationType;
    if (parsed.status) where.status = parsed.status;
    if (parsed.scopeKey) where.scopeKey = parsed.scopeKey;
    const page: PageRequest = { page: parsed.page, pageSize: parsed.pageSize };
    const [items, totalItems] = await Promise.all([this.repository.findDrafts(where, page), this.repository.countDrafts(where)]);
    return { items: items.map(asRecord), page: page.page, pageSize: page.pageSize, totalItems };
  }

  async createDraft(actor: ActorContext, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW03_CONFIG_MANAGE);
    const parsed = createConfigurationDraftSchema.parse(body);
    const draft = await this.repository.createDraft({
      configurationType: parsed.configurationType,
      identityKey: parsed.identityKey,
      scopeKey: parsed.scopeKey,
      ruleType: parsed.ruleType,
      payload: parsed.payload,
      effectiveFrom: new Date(parsed.effectiveFrom),
      effectiveTo: parsed.effectiveTo ? new Date(parsed.effectiveTo) : null,
      requiresTreasurerApproval: parsed.requiresTreasurerApproval,
      createdByUserId: actor.userId,
      remarks: parsed.remarks,
      correlationId: actor.correlationId
    });
    await this.audit.record(actor, 'UOW03.CONFIG_DRAFT.CREATED', 'BillingConfigurationDraft', asRecord(draft).id, {
      configurationType: parsed.configurationType,
      identityKey: parsed.identityKey
    });
    return draft;
  }

  async updateDraft(actor: ActorContext, id: string, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW03_CONFIG_MANAGE);
    const existing = asRecord(await this.repository.findDraftById(id));
    if (!existing.id) throw new Error('Configuration draft not found');
    if (existing.status !== 'Draft') throw new Error('Only draft configuration can be updated');
    const parsed = updateConfigurationDraftSchema.parse(body);
    const data: Record<string, unknown> = {};
    if (parsed.effectiveFrom) data.effectiveFrom = new Date(parsed.effectiveFrom);
    if (parsed.effectiveTo !== undefined) data.effectiveTo = parsed.effectiveTo ? new Date(parsed.effectiveTo) : null;
    if (parsed.payload) data.payload = parsed.payload;
    if (parsed.remarks !== undefined) data.remarks = parsed.remarks;
    const saved = await this.repository.updateDraft(id, data);
    await this.audit.record(actor, 'UOW03.CONFIG_DRAFT.UPDATED', 'BillingConfigurationDraft', id, data);
    return saved;
  }

  async submitForApproval(actor: ActorContext, id: string, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW03_CONFIG_MANAGE);
    const parsed = submitConfigurationDraftSchema.parse(body);
    const draft = asRecord(await this.repository.findDraftById(id));
    if (!draft.id) throw new Error('Configuration draft not found');
    if (draft.status !== 'Draft') throw new Error('Only draft configuration can be submitted');
    const approval = await this.approvals.createRequest(actor, {
      targetRef: { resourceType: 'BillingConfigurationDraft', resourceId: id },
      actionType: 'UOW03.CONFIG.ACTIVATE',
      reason: parsed.reason,
      payloadSnapshot: draft,
      correlationId: actor.correlationId
    });
    const approvalId = asRecord(approval).id;
    const saved = await this.repository.updateDraft(id, { status: 'PendingApproval', approvalRequestId: approvalId });
    await this.audit.record(actor, 'UOW03.CONFIG_DRAFT.SUBMITTED', 'BillingConfigurationDraft', id, { approvalRequestId: approvalId });
    return saved;
  }

  async activate(actor: ActorContext, id: string, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW03_CONFIG_ACTIVATE);
    const parsed = activateConfigurationDraftSchema.parse(body);
    const draft = asRecord(await this.repository.findDraftById(id));
    if (!draft.id) throw new Error('Configuration draft not found');
    if (draft.requiresTreasurerApproval && !parsed.approvalRequestId && !draft.approvalRequestId) {
      throw new Error('Treasurer approval is required before activation');
    }
    await this.timeline.assertCanActivate(draft);
    const version = await this.repository.activateDraft(draft, actor.userId, parsed.approvalRequestId ?? draft.approvalRequestId);
    await this.audit.record(actor, 'UOW03.CONFIG_VERSION.ACTIVATED', 'ConfigurationVersion', asRecord(version).id, {
      sourceDraftId: id,
      approvalRequestId: parsed.approvalRequestId ?? draft.approvalRequestId,
      reason: parsed.reason
    });
    return version;
  }

  async history(actor: ActorContext, query: unknown): Promise<PageResultDto<Record<string, unknown>>> {
    await this.authorization.require(actor, Permissions.UOW03_CONFIG_READ);
    const parsed = configurationListQuerySchema.parse(query);
    const where: Record<string, unknown> = {};
    if (parsed.configurationType) where.configurationType = parsed.configurationType;
    if (parsed.scopeKey) where.scopeKey = parsed.scopeKey;
    const page: PageRequest = { page: parsed.page, pageSize: parsed.pageSize };
    const items = await this.repository.findVersions(where, page);
    return { items: items.map(asRecord), page: page.page, pageSize: page.pageSize, totalItems: items.length };
  }

  async resolve(actor: ActorContext, query: unknown): Promise<Record<string, unknown>> {
    await this.authorization.require(actor, Permissions.UOW03_CONFIG_READ);
    const parsed = resolutionQuerySchema.parse(query);
    const versions = await this.repository.findCoveringVersions(
      {
        configurationType: parsed.configurationType,
        identityKey: parsed.identityKey,
        scopeKey: parsed.scopeKey,
        ruleType: parsed.ruleType
      },
      new Date(parsed.resolutionDate)
    );
    if (versions.length === 0) {
      return { ok: false, failureCode: 'CONFIGURATION_MISSING', reason: 'No active approved configuration covers the requested date' };
    }
    if (versions.length > 1) {
      return { ok: false, failureCode: 'CONFIGURATION_AMBIGUOUS', reason: 'More than one active configuration covers the requested date' };
    }
    const version = asRecord(versions[0]);
    return {
      ok: true,
      snapshot: {
        configurationVersionId: version.id,
        configurationType: version.configurationType,
        identityKey: version.identityKey,
        scopeKey: version.scopeKey,
        ruleType: version.ruleType,
        effectiveFrom: version.effectiveFrom,
        effectiveTo: version.effectiveTo,
        approvalRequestId: version.approvalRequestId,
        payload: version.payload,
        ruleMetadata: version.ruleMetadata ?? {}
      }
    };
  }
}
