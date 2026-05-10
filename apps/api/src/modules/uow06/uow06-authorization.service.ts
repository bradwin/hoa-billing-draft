import { Injectable } from '@nestjs/common';
import type { ActorContext, Permission } from '@hoa/shared';
import { AuthorizationService } from '../authorization/authorization.service';

@Injectable()
export class Uow06AuthorizationPolicy {
  constructor(private readonly authorization: AuthorizationService) {}

  async require(actor: ActorContext, permission: Permission): Promise<void> {
    if (!this.authorization.can(actor, permission)) {
      await this.authorization.deny(actor, 'UOW06.ACCESS_DENIED', actor.correlationId, 'Missing UOW-06 permission');
      throw new Error('Access denied');
    }
  }
}
