import { Injectable } from '@nestjs/common';
import {
  Permissions,
  calculateCreditRemainder,
  creditApplicationSchema,
  financialCorrectionSchema,
  paymentListQuerySchema,
  paymentPostingSchema,
  paymentProofListQuerySchema,
  paymentProofSubmissionSchema,
  proofDecisionSchema,
  receiptSupportIntentSchema,
  reversalRequestSchema,
  validateAllocationConservation,
  type ActorContext,
  type PageRequest
} from '@hoa/shared';
import { ApprovalService } from '../approvals/approval.service';
import { SupportIntentService } from '../support-intents/support-intent.service';
import { Uow05Repository } from '../../persistence/repositories/uow05.repository';
import { Uow05AuditAdapter } from './uow05-audit.service';
import { Uow05AuthorizationPolicy } from './uow05-authorization.service';
import { asRecord, type PageResultDto } from './uow05.types';

function receiptNumber(): string {
  return `OR-${Date.now()}`;
}

@Injectable()
export class PaymentService {
  constructor(
    private readonly repository: Uow05Repository,
    private readonly authorization: Uow05AuthorizationPolicy,
    private readonly audit: Uow05AuditAdapter,
    private readonly approvals: ApprovalService,
    private readonly supportIntents: SupportIntentService
  ) {}

  async listProofs(actor: ActorContext, query: unknown): Promise<PageResultDto<Record<string, unknown>>> {
    await this.authorization.require(actor, Permissions.UOW05_PAYMENT_PROOF_READ);
    const parsed = paymentProofListQuerySchema.parse(query);
    const where: Record<string, unknown> = {};
    if (parsed.status) where.status = parsed.status;
    if (parsed.billingAccountId) where.billingAccountId = parsed.billingAccountId;
    if (parsed.homeownerId) where.homeownerId = parsed.homeownerId;
    const page: PageRequest = { page: parsed.page, pageSize: parsed.pageSize };
    const [items, totalItems] = await Promise.all([this.repository.listPaymentProofs(where, page), this.repository.countPaymentProofs(where)]);
    return { items: items.map(asRecord), page: page.page, pageSize: page.pageSize, totalItems };
  }

  async submitProof(actor: ActorContext, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW05_PAYMENT_PROOF_SUBMIT);
    const parsed = paymentProofSubmissionSchema.parse(body);
    const proof = await this.repository.createPaymentProof({
      status: 'Submitted',
      homeownerId: parsed.homeownerId,
      billingAccountId: parsed.billingAccountId,
      propertyId: parsed.propertyId,
      amount: parsed.amount,
      paymentDate: new Date(parsed.paymentDate),
      paymentMethodKey: parsed.paymentMethodKey,
      externalReference: parsed.externalReference,
      targetInvoiceIds: parsed.targetInvoiceIds,
      attachmentIntentRef: parsed.attachmentIntentRef,
      submittedByUserId: actor.userId,
      correlationId: actor.correlationId
    });
    await this.audit.record(actor, 'UOW05.PAYMENT_PROOF.SUBMITTED', 'PaymentProof', asRecord(proof).id, { amount: parsed.amount });
    return proof;
  }

  async decideProof(actor: ActorContext, id: string, action: 'UnderReview' | 'Rejected' | 'Cancelled', body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW05_PAYMENT_PROOF_REVIEW);
    const parsed = action === 'UnderReview' ? { reason: 'Started review' } : proofDecisionSchema.parse(body);
    const saved = await this.repository.updatePaymentProof(id, {
      status: action,
      reason: parsed.reason,
      reviewedByUserId: actor.userId,
      reviewedAt: new Date()
    });
    await this.audit.record(actor, `UOW05.PAYMENT_PROOF.${action.toUpperCase()}`, 'PaymentProof', id, { reason: parsed.reason });
    return saved;
  }

  async listPayments(actor: ActorContext, query: unknown): Promise<PageResultDto<Record<string, unknown>>> {
    await this.authorization.require(actor, Permissions.UOW05_PAYMENT_READ);
    const parsed = paymentListQuerySchema.parse(query);
    const where: Record<string, unknown> = {};
    if (parsed.status) where.status = parsed.status;
    if (parsed.billingAccountId) where.billingAccountId = parsed.billingAccountId;
    if (parsed.propertyId) where.propertyId = parsed.propertyId;
    if (parsed.homeownerId) where.homeownerId = parsed.homeownerId;
    const page: PageRequest = { page: parsed.page, pageSize: parsed.pageSize };
    const [items, totalItems] = await Promise.all([this.repository.listPayments(where, page), this.repository.countPayments(where)]);
    return { items: items.map(asRecord), page: page.page, pageSize: page.pageSize, totalItems };
  }

  async getPayment(actor: ActorContext, id: string): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW05_PAYMENT_READ);
    const payment = await this.repository.findPaymentById(id);
    if (!payment) throw new Error('Payment not found');
    return payment;
  }

  async post(actor: ActorContext, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW05_PAYMENT_POST);
    const parsed = paymentPostingSchema.parse(body);
    const creditRemainder = parsed.creditRemainder === '0.00' ? calculateCreditRemainder(parsed.amount, parsed.allocations) : parsed.creditRemainder;
    validateAllocationConservation(parsed.amount, parsed.allocations, creditRemainder);
    const riskInput = { ...parsed, paymentDate: new Date(parsed.paymentDate) };
    const duplicatePayment = await this.repository.findDuplicatePaymentRisk(riskInput);
    const duplicateProof = await this.repository.findActiveDuplicateProof(riskInput);
    if ((duplicatePayment || duplicateProof) && !parsed.duplicateOverrideReason) {
      throw new Error('Duplicate payment risk requires override reason');
    }
    const allocations = parsed.allocations.map((allocation, index) => ({
      invoiceId: allocation.invoiceId,
      invoiceLineId: allocation.invoiceLineId,
      componentType: allocation.componentType,
      amount: allocation.amount,
      allocationMode: 'Manual',
      allocationOrder: index + 1,
      createdByUserId: actor.userId,
      correlationId: actor.correlationId
    }));
    const credit = creditRemainder !== '0.00'
      ? { status: 'Available', sourceType: 'Overpayment', billingAccountId: parsed.billingAccountId, propertyId: parsed.propertyId, originalAmount: creditRemainder, reason: 'Overpayment remainder', createdByUserId: actor.userId, correlationId: actor.correlationId }
      : null;
    const payment = await this.repository.postPayment(
      {
        status: 'Posted',
        paymentProofId: parsed.paymentProofId,
        homeownerId: parsed.homeownerId,
        billingAccountId: parsed.billingAccountId,
        propertyId: parsed.propertyId,
        amount: parsed.amount,
        paymentDate: new Date(parsed.paymentDate),
        postingDate: new Date(),
        paymentMethodKey: parsed.paymentMethodKey,
        externalReference: parsed.externalReference,
        duplicateOverrideReason: parsed.duplicateOverrideReason,
        postedByUserId: actor.userId,
        correlationId: actor.correlationId
      },
      allocations,
      credit,
      { receiptNumber: receiptNumber(), status: 'Issued', createdByUserId: actor.userId, correlationId: actor.correlationId },
      {
        paymentSnapshot: { amount: parsed.amount, paymentDate: parsed.paymentDate, paymentMethodKey: parsed.paymentMethodKey, externalReference: parsed.externalReference },
        payerSnapshot: { homeownerId: parsed.homeownerId },
        billingAccountSnapshot: { billingAccountId: parsed.billingAccountId },
        propertySnapshot: parsed.propertyId ? { propertyId: parsed.propertyId } : undefined,
        allocationSummary: allocations,
        creditRemainder,
        configurationReferences: { paymentMethodKey: parsed.paymentMethodKey },
        sourceProofReference: parsed.paymentProofId ? { paymentProofId: parsed.paymentProofId } : undefined,
        actorSnapshot: { userId: actor.userId }
      },
      [{ sourceRecordType: 'Payment', sourceRecordId: 'pending', billingAccountId: parsed.billingAccountId, propertyId: parsed.propertyId, amount: `-${parsed.amount}`, effectiveDate: new Date(), correlationId: actor.correlationId }]
    );
    await this.audit.record(actor, 'UOW05.PAYMENT.POSTED', 'Payment', asRecord(payment).id, { amount: parsed.amount, creditRemainder });
    return payment;
  }

  async applyCredit(actor: ActorContext, creditId: string, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW05_CREDIT_MANAGE);
    const parsed = creditApplicationSchema.parse(body);
    const saved = await this.repository.createCreditApplication({ creditId, ...parsed, createdByUserId: actor.userId, correlationId: actor.correlationId });
    await this.audit.record(actor, 'UOW05.CREDIT.APPLIED', 'Credit', creditId, { amount: parsed.amount });
    return saved;
  }

  async requestReversal(actor: ActorContext, paymentId: string, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW05_REVERSAL_REQUEST);
    const parsed = reversalRequestSchema.parse(body);
    const approval = await this.approvals.createRequest(actor, {
      targetRef: { resourceType: 'Payment', resourceId: paymentId },
      actionType: 'UOW05.PAYMENT.REVERSE',
      reason: parsed.reason,
      payloadSnapshot: { paymentId, reversalEffectiveDate: parsed.reversalEffectiveDate },
      correlationId: actor.correlationId
    });
    await this.audit.record(actor, 'UOW05.PAYMENT.REVERSAL_REQUESTED', 'Payment', paymentId, { approvalRequestId: asRecord(approval).id });
    return approval;
  }

  async requestCorrection(actor: ActorContext, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW05_CORRECTION_REQUEST);
    const parsed = financialCorrectionSchema.parse(body);
    const approval = await this.approvals.createRequest(actor, {
      targetRef: { resourceType: parsed.sourceRecordType, resourceId: parsed.sourceRecordId },
      actionType: 'UOW05.FINANCIAL_CORRECTION',
      reason: parsed.reason,
      payloadSnapshot: parsed,
      correlationId: actor.correlationId
    });
    await this.audit.record(actor, 'UOW05.FINANCIAL_CORRECTION.REQUESTED', parsed.sourceRecordType, parsed.sourceRecordId, { approvalRequestId: asRecord(approval).id });
    return approval;
  }

  async createSupportIntent(actor: ActorContext, paymentId: string, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW05_SUPPORT_INTENT);
    const parsed = receiptSupportIntentSchema.parse(body);
    const payment = asRecord(await this.repository.findPaymentById(paymentId));
    const receiptId = asRecord(payment.receipt).id;
    if (!receiptId) throw new Error('Receipt support intents require an issued receipt');
    const intent = await this.supportIntents.createIntent(actor, {
      type: parsed.intentType === 'Email' ? 'Notification' : parsed.intentType,
      purpose: parsed.intentType === 'Storage' ? 'PaymentProofAttachment' : parsed.intentType === 'Document' ? 'ReceiptDocument' : 'ReceiptEmail',
      sourceRef: { resourceType: 'Payment', resourceId: paymentId },
      recipientRef: parsed.recipientHomeownerId ? { resourceType: 'Homeowner', resourceId: parsed.recipientHomeownerId } : undefined,
      payload: { paymentId, receiptId, templateReferenceVersionId: parsed.templateReferenceVersionId },
      correlationId: actor.correlationId
    });
    if (parsed.intentType === 'Document') {
      await this.repository.createDocumentIntent({ paymentId, receiptId, templateReferenceVersionId: parsed.templateReferenceVersionId, requestedByUserId: actor.userId, correlationId: actor.correlationId });
    } else if (parsed.intentType === 'Email') {
      await this.repository.createEmailIntent({ paymentId, receiptId, recipientHomeownerId: parsed.recipientHomeownerId, templateReferenceVersionId: parsed.templateReferenceVersionId, requestedByUserId: actor.userId, correlationId: actor.correlationId });
    }
    await this.audit.record(actor, 'UOW05.SUPPORT_INTENT.CREATED', 'Payment', paymentId, { intentType: parsed.intentType });
    return intent;
  }
}
