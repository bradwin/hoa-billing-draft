import { Injectable } from '@nestjs/common';
import {
  Permissions,
  halfOpenIntervalsOverlap,
  ownershipTransferSchema,
  type ActorContext
} from '@hoa/shared';
import { Uow02Repository } from '../../persistence/repositories/uow02.repository';
import { Uow02AuditAdapter } from './uow02-audit.service';
import { Uow02AuthorizationPolicy } from './uow02-authorization.service';
import { asRecord } from './uow02.types';

@Injectable()
export class OwnershipService {
  constructor(
    private readonly repository: Uow02Repository,
    private readonly authorization: Uow02AuthorizationPolicy,
    private readonly audit: Uow02AuditAdapter
  ) {}

  async listOwnership(actor: ActorContext, propertyId: string): Promise<unknown[]> {
    await this.authorization.require(actor, Permissions.UOW02_PROPERTY_READ);
    return this.repository.findOwnershipPeriods(propertyId);
  }

  async listBillingAccounts(actor: ActorContext, propertyId: string): Promise<unknown[]> {
    await this.authorization.require(actor, Permissions.UOW02_PROPERTY_READ);
    return this.repository.findBillingAccountPeriods(propertyId);
  }

  async assignPrimary(actor: ActorContext, propertyId: string, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW02_OWNERSHIP_MANAGE);
    const parsed = ownershipTransferSchema.parse(body);
    const property = asRecord(await this.repository.findPropertyById(propertyId));
    if (!property.id) throw new Error('Property not found');
    const homeowner = asRecord(await this.repository.findHomeownerById(parsed.homeownerId));
    if (!homeowner.id) throw new Error('Homeowner not found');
    if (homeowner.status !== 'Active') throw new Error('Billing-responsible homeowner must be Active');

    const periods = ((property.ownershipPeriods ?? []) as Record<string, any>[]).filter(
      (period) => period.role === 'PrimaryOwner' && !period.effectiveTo
    );
    for (const period of periods) {
      if (
        halfOpenIntervalsOverlap(
          { effectiveFrom: String(period.effectiveFrom), effectiveTo: period.effectiveTo ? String(period.effectiveTo) : null },
          { effectiveFrom: parsed.effectiveFrom }
        )
      ) {
        await this.repository.updateOwnershipPeriod(period.id, {
          effectiveTo: new Date(`${parsed.effectiveFrom}T00:00:00.000Z`),
          closedAt: new Date()
        });
      }
    }

    const ownership = asRecord(
      await this.repository.createOwnershipPeriod({
        propertyId,
        homeownerId: parsed.homeownerId,
        role: 'PrimaryOwner',
        effectiveFrom: new Date(`${parsed.effectiveFrom}T00:00:00.000Z`),
        isBillingResponsible: true,
        createdByUserId: actor.userId
      })
    );
    const billingAccount = await this.repository.createBillingAccountPeriod({
      billingAccountRef: `BA-${ownership.id}`,
      propertyId,
      homeownerId: parsed.homeownerId,
      ownershipPeriodId: ownership.id,
      effectiveFrom: new Date(`${parsed.effectiveFrom}T00:00:00.000Z`)
    });
    await this.audit.record(actor, 'UOW02.OWNERSHIP.PRIMARY_ASSIGNED', 'Property', propertyId, {
      homeownerId: parsed.homeownerId,
      effectiveFrom: parsed.effectiveFrom
    });
    return { ownership, billingAccount };
  }
}
