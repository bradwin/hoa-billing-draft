import { Injectable } from '@nestjs/common';
import { Permissions, Roles, type ActorContext, type Permission } from '@hoa/shared';
import { AuthorizationService } from '../authorization/authorization.service';

@Injectable()
export class Uow02AuthorizationPolicy {
  constructor(private readonly authorization: AuthorizationService) {}

  async require(actor: ActorContext, permission: Permission): Promise<void> {
    if (!this.authorization.can(actor, permission)) {
      await this.authorization.deny(actor, 'UOW02.AUTHORIZATION_DENIED', actor.correlationId, 'Missing UOW-02 permission');
      throw new Error('Access denied');
    }
  }

  canReadGovernance(actor: ActorContext): boolean {
    return actor.role === Roles.BoardMember || this.authorization.can(actor, Permissions.UOW02_PROPERTY_READ);
  }

  shapeHomeowner(actor: ActorContext, homeowner: Record<string, any>): Record<string, unknown> {
    const base = {
      id: homeowner.id,
      homeownerCode: homeowner.homeownerCode,
      legalName: homeowner.legalName,
      status: homeowner.status
    };
    if (actor.role === Roles.BoardMember) {
      return base;
    }
    return {
      ...base,
      primaryEmail: homeowner.primaryEmail,
      primaryPhone: homeowner.primaryPhone,
      mailingAddress: homeowner.mailingAddress,
      communicationPreference: homeowner.communicationPreference,
      portalAccountUserId: homeowner.portalAccountUserId
    };
  }
}
