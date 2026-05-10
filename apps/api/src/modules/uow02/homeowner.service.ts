import { Injectable } from '@nestjs/common';
import {
  Permissions,
  buildHomeownerNameKey,
  createHomeownerSchema,
  homeownerSearchSchema,
  normalizeEmailKey,
  normalizePhoneKey,
  updateHomeownerSchema,
  type ActorContext,
  type PageRequest
} from '@hoa/shared';
import { Uow02Repository } from '../../persistence/repositories/uow02.repository';
import { Uow02AuditAdapter } from './uow02-audit.service';
import { Uow02AuthorizationPolicy } from './uow02-authorization.service';
import { asRecord, type PageResultDto } from './uow02.types';

function contactData(contact: Record<string, any>): Record<string, unknown> {
  return {
    primaryEmail: contact.primaryEmail,
    normalizedEmailKey: contact.primaryEmail ? normalizeEmailKey(contact.primaryEmail) : undefined,
    primaryPhone: contact.primaryPhone,
    normalizedPhoneKey: contact.primaryPhone ? normalizePhoneKey(contact.primaryPhone) : undefined,
    alternatePhone: contact.alternatePhone,
    mailingAddress: contact.mailingAddress,
    communicationPreference: contact.communicationPreference,
    emergencyContactName: contact.emergencyContactName,
    emergencyContactPhone: contact.emergencyContactPhone
  };
}

@Injectable()
export class HomeownerService {
  constructor(
    private readonly repository: Uow02Repository,
    private readonly authorization: Uow02AuthorizationPolicy,
    private readonly audit: Uow02AuditAdapter
  ) {}

  async search(actor: ActorContext, query: unknown): Promise<PageResultDto<Record<string, unknown>>> {
    await this.authorization.require(actor, Permissions.UOW02_HOMEOWNER_READ);
    const parsed = homeownerSearchSchema.parse(query);
    const where: Record<string, any> = {};
    if (parsed.status) where.status = parsed.status;
    if (parsed.name) where.normalizedNameKey = { contains: buildHomeownerNameKey(parsed.name) };
    if (parsed.homeownerCode) where.homeownerCode = { contains: parsed.homeownerCode };
    if (parsed.email) where.normalizedEmailKey = normalizeEmailKey(parsed.email);
    if (parsed.mobile) where.normalizedPhoneKey = { contains: normalizePhoneKey(parsed.mobile) };

    const page: PageRequest = { page: parsed.page, pageSize: parsed.pageSize };
    if (parsed.sort) page.sort = parsed.sort;
    const [items, totalItems] = await Promise.all([
      this.repository.findHomeowners(where, page),
      this.repository.countHomeowners(where)
    ]);
    return {
      items: items.map((item) => this.authorization.shapeHomeowner(actor, asRecord(item))),
      page: page.page,
      pageSize: page.pageSize,
      totalItems
    };
  }

  async get(actor: ActorContext, id: string): Promise<Record<string, unknown>> {
    await this.authorization.require(actor, Permissions.UOW02_HOMEOWNER_READ);
    const homeowner = await this.repository.findHomeownerById(id);
    if (!homeowner) throw new Error('Homeowner not found');
    return this.authorization.shapeHomeowner(actor, asRecord(homeowner));
  }

  async duplicateCheck(actor: ActorContext, body: unknown): Promise<Record<string, unknown>> {
    await this.authorization.require(actor, Permissions.UOW02_HOMEOWNER_MANAGE);
    const parsed = createHomeownerSchema.parse(body);
    const where = {
      OR: [
        parsed.contact.primaryEmail ? { normalizedEmailKey: normalizeEmailKey(parsed.contact.primaryEmail) } : undefined,
        parsed.contact.primaryPhone ? { normalizedPhoneKey: normalizePhoneKey(parsed.contact.primaryPhone) } : undefined,
        { normalizedNameKey: buildHomeownerNameKey(parsed.legalName) }
      ].filter(Boolean)
    };
    const candidates = await this.repository.findDuplicateHomeowners(where);
    return {
      reviewRequired: candidates.length > 0,
      candidates: candidates.map((candidate) => this.authorization.shapeHomeowner(actor, asRecord(candidate)))
    };
  }

  async create(actor: ActorContext, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW02_HOMEOWNER_MANAGE);
    const parsed = createHomeownerSchema.parse(body);
    const duplicateResult = await this.duplicateCheck(actor, body);
    if ((duplicateResult.candidates as unknown[]).length > 0 && !parsed.duplicateOverrideReason) {
      throw new Error('Duplicate candidate review is required');
    }
    const homeownerCode = await this.repository.nextCode('HO', 'homeowner', 'homeownerCode');
    const homeowner = await this.repository.createHomeowner({
      homeownerCode,
      legalName: parsed.legalName,
      normalizedNameKey: buildHomeownerNameKey(parsed.legalName),
      status: parsed.status,
      ...contactData(parsed.contact),
      notes: parsed.notes
    });
    const id = asRecord(homeowner).id;
    if (parsed.duplicateOverrideReason && (duplicateResult.candidates as unknown[]).length > 0) {
      await this.repository.createDuplicateReview({
        submittedHomeownerId: id,
        candidateHomeownerIds: (duplicateResult.candidates as Record<string, unknown>[]).map((candidate) => candidate.id),
        matchSignals: { reason: 'staff_confirmed_distinct' },
        confirmedDistinct: true,
        reviewedByUserId: actor.userId,
        reason: parsed.duplicateOverrideReason,
        correlationId: actor.correlationId
      });
    }
    await this.audit.record(actor, 'UOW02.HOMEOWNER.CREATED', 'Homeowner', id, { homeownerCode });
    return homeowner;
  }

  async update(actor: ActorContext, id: string, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW02_HOMEOWNER_MANAGE);
    const parsed = updateHomeownerSchema.parse(body);
    const data: Record<string, unknown> = {};
    if (parsed.legalName) {
      data.legalName = parsed.legalName;
      data.normalizedNameKey = buildHomeownerNameKey(parsed.legalName);
    }
    if (parsed.status) data.status = parsed.status;
    if (parsed.contact) Object.assign(data, contactData(parsed.contact));
    if (parsed.notes !== undefined) data.notes = parsed.notes;
    const saved = await this.repository.updateHomeowner(id, data);
    await this.audit.record(actor, 'UOW02.HOMEOWNER.UPDATED', 'Homeowner', id, data);
    return saved;
  }
}
