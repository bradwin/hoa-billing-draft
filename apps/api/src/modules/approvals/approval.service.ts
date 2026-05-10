import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { Permissions, type ActorContext, createApprovalRequestSchema } from '@hoa/shared';
import { AuditService } from '../audit/audit.service';
import { AuthorizationService } from '../authorization/authorization.service';
import { PrismaService } from '../../prisma/prisma.service';
import { assertCanTransitionApproval } from './approval-state';

export type ApprovedActionHandler = (requestId: string) => Promise<void>;

@Injectable()
export class ApprovalService {
  private readonly handlers = new Map<string, ApprovedActionHandler>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly authorization: AuthorizationService,
    private readonly audit: AuditService
  ) {}

  registerHandler(actionType: string, handler: ApprovedActionHandler): void {
    this.handlers.set(actionType, handler);
  }

  async createRequest(actor: ActorContext, input: unknown): Promise<unknown> {
    if (!this.authorization.can(actor, Permissions.APPROVAL_REQUEST_CREATE)) {
      await this.authorization.deny(actor, 'APPROVAL.CREATE_DENIED', actor.correlationId, 'Missing approval request permission');
      throw new Error('Access denied');
    }
    const parsed = createApprovalRequestSchema.parse(input);
    const request = await this.prisma.approvalRequest.create({
      data: {
        requesterUserId: actor.userId,
        targetType: parsed.targetRef.resourceType,
        targetId: parsed.targetRef.resourceId,
        actionType: parsed.actionType,
        reason: parsed.reason,
        payloadSnapshot: parsed.payloadSnapshot as Prisma.InputJsonValue,
        correlationId: parsed.correlationId
      }
    });
    await this.audit.append({
      actor,
      category: 'Workflow',
      action: 'APPROVAL.REQUEST_CREATED',
      resourceRef: { resourceType: 'ApprovalRequest', resourceId: (request as { id: string }).id },
      correlationId: actor.correlationId,
      result: 'Success',
      reason: parsed.reason,
      newValue: { status: 'Pending', actionType: parsed.actionType }
    });
    return request;
  }

  async approve(actor: ActorContext, request: { id: string; requesterUserId: string; status: 'Pending'; actionType: string }, decisionReason: string): Promise<void> {
    if (!this.authorization.can(actor, Permissions.APPROVAL_DECIDE)) {
      await this.authorization.deny(actor, 'APPROVAL.DECIDE_DENIED', actor.correlationId, 'Missing Treasurer approval permission');
      throw new Error('Access denied');
    }
    if (request.requesterUserId === actor.userId) {
      await this.authorization.deny(actor, 'APPROVAL.SELF_DECISION_DENIED', actor.correlationId, 'Requester cannot approve own request');
      throw new Error('Self approval is prohibited');
    }
    assertCanTransitionApproval(request.status, 'ApprovedPendingApply');
    await this.prisma.approvalRequest.update({
      where: { id: request.id },
      data: {
        status: 'ApprovedPendingApply',
        decisionUserId: actor.userId,
        decisionReason,
        decidedAt: new Date()
      }
    });
    await this.audit.append({
      actor,
      category: 'Workflow',
      action: 'APPROVAL.APPROVED',
      resourceRef: { resourceType: 'ApprovalRequest', resourceId: request.id },
      correlationId: actor.correlationId,
      result: 'Success',
      reason: decisionReason
    });
  }

  async reject(actor: ActorContext, request: { id: string; requesterUserId: string; status: 'Pending' }, decisionReason: string): Promise<void> {
    if (request.requesterUserId === actor.userId) throw new Error('Self rejection is prohibited');
    assertCanTransitionApproval(request.status, 'Rejected');
    await this.prisma.approvalRequest.update({
      where: { id: request.id },
      data: { status: 'Rejected', decisionUserId: actor.userId, decisionReason, decidedAt: new Date() }
    });
  }

  async applyApprovedAction(request: { id: string; actionType: string }): Promise<void> {
    const handler = this.handlers.get(request.actionType);
    if (!handler) {
      throw new Error('No approved action handler registered');
    }
    await handler(request.id);
  }
}
