import { Injectable } from '@nestjs/common';
import {
  Permissions,
  applyContactRequestDecision,
  assertContactChangePayloadAllowed,
  decideContactChangeSchema,
  submitContactChangeSchema,
  type ActorContext,
  type PageRequest
} from '@hoa/shared';
import { Uow02Repository } from '../../persistence/repositories/uow02.repository';
import { Uow02AuditAdapter } from './uow02-audit.service';
import { Uow02AuthorizationPolicy } from './uow02-authorization.service';
import { asRecord } from './uow02.types';

@Injectable()
export class ContactChangeService {
  constructor(
    private readonly repository: Uow02Repository,
    private readonly authorization: Uow02AuthorizationPolicy,
    private readonly audit: Uow02AuditAdapter
  ) {}

  async submit(actor: ActorContext, body: unknown): Promise<unknown> {
    const parsed = submitContactChangeSchema.parse(body);
    if (actor.homeownerId !== parsed.homeownerId) {
      await this.authorization.require(actor, Permissions.UOW02_CONTACT_DECIDE);
    }
    const homeowner = asRecord(await this.repository.findHomeownerById(parsed.homeownerId));
    if (!homeowner.id) throw new Error('Homeowner not found');
    const requestedChanges = assertContactChangePayloadAllowed(parsed.requestedChanges);
    const oldValues = Object.fromEntries(Object.keys(requestedChanges).map((key) => [key, homeowner[key]]));
    const saved = await this.repository.createContactChangeRequest({
      homeownerId: parsed.homeownerId,
      requesterUserId: actor.userId,
      requestedChanges,
      oldValues,
      newValues: requestedChanges,
      remarks: parsed.remarks,
      correlationId: actor.correlationId
    });
    await this.audit.record(actor, 'UOW02.CONTACT_CHANGE.SUBMITTED', 'Homeowner', parsed.homeownerId, {
      requestId: asRecord(saved).id
    });
    return saved;
  }

  async list(actor: ActorContext, query: Record<string, unknown>): Promise<unknown[]> {
    await this.authorization.require(actor, Permissions.UOW02_CONTACT_DECIDE);
    const page: PageRequest = {
      page: Number(query.page ?? 1),
      pageSize: Math.min(Number(query.pageSize ?? 25), 100)
    };
    return this.repository.findContactChangeRequests({ status: query.status ?? 'Pending' }, page);
  }

  async decide(actor: ActorContext, id: string, decision: 'Approved' | 'Rejected', body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW02_CONTACT_DECIDE);
    const parsed = decideContactChangeSchema.parse(body);
    const request = asRecord(await this.repository.findContactChangeRequest(id));
    if (!request.id) throw new Error('Contact change request not found');
    const nextStatus = applyContactRequestDecision(request.status, decision);
    if (nextStatus === 'Approved') {
      await this.repository.updateHomeowner(request.homeownerId, request.newValues);
    }
    const saved = await this.repository.updateContactChangeRequest(id, {
      status: nextStatus,
      decisionUserId: actor.userId,
      decidedAt: new Date(),
      remarks: parsed.remarks ?? request.remarks
    });
    await this.audit.record(actor, `UOW02.CONTACT_CHANGE.${nextStatus.toUpperCase()}`, 'Homeowner', request.homeownerId, {
      requestId: id
    });
    return saved;
  }
}
