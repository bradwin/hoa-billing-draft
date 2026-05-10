import { Injectable } from '@nestjs/common';
import {
  Permissions,
  billableValidationQuerySchema,
  buildPropertyIdentityKey,
  createPropertySchema,
  evaluateBillableValidationFacts,
  intervalCoversDate,
  normalizeCompactKey,
  propertyAliasSchema,
  propertySearchSchema,
  updatePropertySchema,
  type ActorContext,
  type PageRequest
} from '@hoa/shared';
import { Uow02Repository } from '../../persistence/repositories/uow02.repository';
import { Uow02AuditAdapter } from './uow02-audit.service';
import { Uow02AuthorizationPolicy } from './uow02-authorization.service';
import { asRecord, type PageResultDto } from './uow02.types';

@Injectable()
export class PropertyService {
  constructor(
    private readonly repository: Uow02Repository,
    private readonly authorization: Uow02AuthorizationPolicy,
    private readonly audit: Uow02AuditAdapter
  ) {}

  async search(actor: ActorContext, query: unknown): Promise<PageResultDto<unknown>> {
    await this.authorization.require(actor, Permissions.UOW02_PROPERTY_READ);
    const parsed = propertySearchSchema.parse(query);
    const where: Record<string, any> = {};
    if (parsed.propertyCode) where.propertyCode = { contains: parsed.propertyCode };
    if (parsed.phaseOrSection) where.phaseOrSection = { contains: parsed.phaseOrSection };
    if (parsed.block) where.block = { contains: parsed.block };
    if (parsed.lot) where.lot = { contains: parsed.lot };
    if (parsed.street) where.street = { contains: parsed.street };
    if (parsed.billingStatus) where.billingStatus = parsed.billingStatus;
    if (parsed.lifecycleStatus) where.lifecycleStatus = parsed.lifecycleStatus;
    if (parsed.alias) where.aliases = { some: { normalizedAliasKey: normalizeCompactKey(parsed.alias) } };
    const page: PageRequest = { page: parsed.page, pageSize: parsed.pageSize };
    if (parsed.sort) page.sort = parsed.sort;
    const [items, totalItems] = await Promise.all([
      this.repository.findProperties(where, page),
      this.repository.countProperties(where)
    ]);
    return { items, page: page.page, pageSize: page.pageSize, totalItems };
  }

  async get(actor: ActorContext, id: string): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW02_PROPERTY_READ);
    const property = await this.repository.findPropertyById(id);
    if (!property) throw new Error('Property not found');
    return property;
  }

  async create(actor: ActorContext, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW02_PROPERTY_MANAGE);
    const parsed = createPropertySchema.parse(body);
    const propertyCode = await this.repository.nextCode('PR', 'property', 'propertyCode');
    const saved = await this.repository.createProperty({
      propertyCode,
      ...parsed,
      canonicalIdentityKey: buildPropertyIdentityKey(parsed)
    });
    await this.audit.record(actor, 'UOW02.PROPERTY.CREATED', 'Property', asRecord(saved).id, { propertyCode });
    return saved;
  }

  async update(actor: ActorContext, id: string, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW02_PROPERTY_MANAGE);
    const parsed = updatePropertySchema.parse(body);
    const data: Record<string, unknown> = { ...parsed };
    if (parsed.phaseOrSection && parsed.block && parsed.lot && parsed.street) {
      data.canonicalIdentityKey = buildPropertyIdentityKey(parsed as any);
    }
    const saved = await this.repository.updateProperty(id, data);
    await this.audit.record(actor, 'UOW02.PROPERTY.UPDATED', 'Property', id, data);
    return saved;
  }

  async addAlias(actor: ActorContext, propertyId: string, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW02_PROPERTY_MANAGE);
    const parsed = propertyAliasSchema.parse(body);
    const saved = await this.repository.createPropertyAlias({
      propertyId,
      ...parsed,
      normalizedAliasKey: normalizeCompactKey(parsed.aliasValue)
    });
    await this.audit.record(actor, 'UOW02.PROPERTY_ALIAS.CREATED', 'Property', propertyId, { aliasId: asRecord(saved).id });
    return saved;
  }

  async updateAlias(actor: ActorContext, aliasId: string, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW02_PROPERTY_MANAGE);
    const parsed = propertyAliasSchema.parse(body);
    const saved = await this.repository.updatePropertyAlias(aliasId, {
      ...parsed,
      normalizedAliasKey: normalizeCompactKey(parsed.aliasValue)
    });
    await this.audit.record(actor, 'UOW02.PROPERTY_ALIAS.UPDATED', 'Property', asRecord(saved).propertyId, { aliasId });
    return saved;
  }

  async validateBillable(actor: ActorContext, propertyId: string, query: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW02_PROPERTY_READ);
    const parsed = billableValidationQuerySchema.parse(query);
    const property = asRecord(await this.repository.findPropertyById(propertyId));
    if (!property.id) throw new Error('Property not found');
    const ownershipPeriods = (property.ownershipPeriods ?? []) as Record<string, any>[];
    const accountPeriods = (property.billingAccountPeriods ?? []) as Record<string, any>[];
    const effectiveOwners = ownershipPeriods.filter(
      (period) =>
        period.role === 'PrimaryOwner' &&
        intervalCoversDate(
          { effectiveFrom: String(period.effectiveFrom), effectiveTo: period.effectiveTo ? String(period.effectiveTo) : null },
          parsed.validationDate
        )
    );
    const effectiveAccounts = accountPeriods.filter((period) =>
      intervalCoversDate(
        { effectiveFrom: String(period.effectiveFrom), effectiveTo: period.effectiveTo ? String(period.effectiveTo) : null },
        parsed.validationDate
      )
    );
    const responsibleHomeowner = effectiveOwners[0]?.homeowner;
    const result = evaluateBillableValidationFacts({
      propertyBillingStatus: property.billingStatus,
      propertyLifecycleStatus: property.lifecycleStatus,
      lotAreaSqm: property.lotAreaSqm == null ? null : String(property.lotAreaSqm),
      primaryOwnerCount: effectiveOwners.length,
      responsibleHomeownerStatus: responsibleHomeowner?.status,
      billingAccountPeriodCount: effectiveAccounts.length
    });
    return {
      propertyId,
      validationDate: parsed.validationDate,
      ...result,
      primaryHomeownerId: result.isValid ? responsibleHomeowner?.id : undefined,
      billingAccountId: result.isValid ? effectiveAccounts[0]?.billingAccountRef : undefined,
      lotAreaSqm: property.lotAreaSqm
    };
  }
}
