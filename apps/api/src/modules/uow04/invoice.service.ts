import { Injectable } from '@nestjs/common';
import {
  Permissions,
  calculateInvoiceTotal,
  cancelDraftInvoiceSchema,
  invoiceListQuerySchema,
  issueInvoicesSchema,
  lifecycleRequestSchema,
  manualInvoiceDraftSchema,
  recurringGenerationSchema,
  supportIntentSchema,
  type ActorContext,
  type PageRequest
} from '@hoa/shared';
import { ApprovalService } from '../approvals/approval.service';
import { SupportIntentService } from '../support-intents/support-intent.service';
import { Uow04Repository } from '../../persistence/repositories/uow04.repository';
import { Uow04AuditAdapter } from './uow04-audit.service';
import { Uow04AuthorizationPolicy } from './uow04-authorization.service';
import { asRecord, type PageResultDto } from './uow04.types';

function toLines(lines: Array<Record<string, any>>): Record<string, any>[] {
  return lines.map((line, index) => ({
    lineNumber: index + 1,
    chargeTypeKey: line.chargeTypeKey,
    chargeCategory: line.isManualTaxLike ? 'ManualTaxLike' : 'Other',
    description: line.description,
    quantity: line.quantity,
    lotArea: line.lotArea,
    rate: line.rate,
    roundingRuleKey: 'default-half-up',
    amount: line.amount,
    isManual: line.isManual ?? true,
    isManualTaxLike: line.isManualTaxLike ?? false,
    manualReason: line.manualReason,
    configurationVersionIds: []
  }));
}

@Injectable()
export class InvoiceService {
  constructor(
    private readonly repository: Uow04Repository,
    private readonly authorization: Uow04AuthorizationPolicy,
    private readonly audit: Uow04AuditAdapter,
    private readonly approvals: ApprovalService,
    private readonly supportIntents: SupportIntentService
  ) {}

  async list(actor: ActorContext, query: unknown): Promise<PageResultDto<Record<string, unknown>>> {
    await this.authorization.require(actor, Permissions.UOW04_INVOICE_READ);
    const parsed = invoiceListQuerySchema.parse(query);
    const where: Record<string, unknown> = {};
    if (parsed.status) where.status = parsed.status;
    if (parsed.origin) where.origin = parsed.origin;
    if (parsed.propertyId) where.propertyId = parsed.propertyId;
    if (parsed.billingAccountId) where.billingAccountId = parsed.billingAccountId;
    if (parsed.billingPeriodKey) where.billingPeriodKey = parsed.billingPeriodKey;
    const page: PageRequest = { page: parsed.page, pageSize: parsed.pageSize };
    const [items, totalItems] = await Promise.all([this.repository.listInvoices(where, page), this.repository.countInvoices(where)]);
    return { items: items.map(asRecord), page: page.page, pageSize: page.pageSize, totalItems };
  }

  async get(actor: ActorContext, id: string): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW04_INVOICE_READ);
    const invoice = await this.repository.findInvoiceById(id);
    if (!invoice) throw new Error('Invoice not found');
    return invoice;
  }

  async createManualDraft(actor: ActorContext, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW04_INVOICE_MANAGE);
    const parsed = manualInvoiceDraftSchema.parse(body);
    const total = calculateInvoiceTotal(parsed.lines).totalAmount;
    const invoice = await this.repository.createManualDraft(
      {
        origin: 'Manual',
        status: 'Draft',
        propertyId: parsed.propertyId,
        billingAccountId: parsed.billingAccountId,
        responsibleHomeownerId: parsed.responsibleHomeownerId,
        dueDate: new Date(parsed.dueDate),
        subtotalAmount: total,
        totalAmount: total,
        reason: parsed.reason,
        createdByUserId: actor.userId,
        correlationId: actor.correlationId
      },
      toLines(parsed.lines)
    );
    await this.audit.record(actor, 'UOW04.INVOICE.MANUAL_DRAFT.CREATED', 'Invoice', asRecord(invoice).id, { totalAmount: total });
    return invoice;
  }

  async generateRecurring(actor: ActorContext, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW04_INVOICE_MANAGE);
    const parsed = recurringGenerationSchema.parse(body);
    const batch = await this.repository.createRecurringBatch(
      {
        billingPeriodKey: parsed.billingPeriodKey,
        billingPeriodStart: new Date(parsed.billingPeriodStart),
        billingPeriodEnd: new Date(parsed.billingPeriodEnd),
        chargeTypeKey: parsed.chargeTypeKey,
        scope: parsed.scope,
        validationDate: new Date(parsed.billingPeriodStart),
        createdByUserId: actor.userId,
        correlationId: actor.correlationId
      },
      [],
      []
    );
    await this.audit.record(actor, 'UOW04.INVOICE_BATCH.GENERATED', 'InvoiceBatch', asRecord(batch).id, {
      billingPeriodKey: parsed.billingPeriodKey,
      validationDate: parsed.billingPeriodStart
    });
    return { batch, createdDrafts: 0, exceptions: 0, duplicateBlocks: 0 };
  }

  async issue(actor: ActorContext, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW04_INVOICE_ISSUE);
    const parsed = issueInvoicesSchema.parse(body);
    const results = [];
    for (const invoiceId of parsed.invoiceIds) {
      const invoiceNumber: string = `INV-${Date.now()}-${results.length + 1}`;
      try {
        const issued = await this.repository.issueInvoice(invoiceId, actor.userId, new Date(parsed.issueDate), invoiceNumber, null, 'invoice-default', actor.correlationId);
        await this.audit.record(actor, 'UOW04.INVOICE.ISSUED', 'Invoice', invoiceId, { invoiceNumber });
        results.push({ invoiceId, ok: true, invoiceNumber, issued });
      } catch (error) {
        results.push({ invoiceId, ok: false, reason: error instanceof Error ? error.message : 'Issuance failed' });
      }
    }
    return { results };
  }

  async cancelDraft(actor: ActorContext, id: string, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW04_INVOICE_MANAGE);
    const parsed = cancelDraftInvoiceSchema.parse(body);
    const invoice = asRecord(await this.repository.findInvoiceById(id));
    if (invoice.status !== 'Draft') throw new Error('Only draft invoices can be cancelled');
    const saved = await this.repository.updateInvoice(id, { status: 'Cancelled', reason: parsed.reason });
    await this.repository.createLifecycleAction({ invoiceId: id, actionType: 'CancelDraft', fromStatus: 'Draft', toStatus: 'Cancelled', reason: parsed.reason, actorUserId: actor.userId, correlationId: actor.correlationId });
    await this.audit.record(actor, 'UOW04.INVOICE_DRAFT.CANCELLED', 'Invoice', id, { reason: parsed.reason });
    return saved;
  }

  async requestLifecycle(actor: ActorContext, id: string, actionType: 'Void' | 'Reissue', body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW04_INVOICE_LIFECYCLE);
    const parsed = lifecycleRequestSchema.parse(body);
    const approval = await this.approvals.createRequest(actor, {
      targetRef: { resourceType: 'Invoice', resourceId: id },
      actionType: `UOW04.INVOICE.${actionType.toUpperCase()}`,
      reason: parsed.reason,
      payloadSnapshot: { invoiceId: id, actionType },
      correlationId: actor.correlationId
    });
    await this.audit.record(actor, `UOW04.INVOICE.${actionType.toUpperCase()}_REQUESTED`, 'Invoice', id, { approvalRequestId: asRecord(approval).id });
    return approval;
  }

  async createSupportIntent(actor: ActorContext, id: string, body: unknown): Promise<unknown> {
    await this.authorization.require(actor, Permissions.UOW04_INVOICE_SUPPORT_INTENT);
    const parsed = supportIntentSchema.parse(body);
    const invoice = asRecord(await this.repository.findInvoiceById(id));
    const snapshotId = asRecord(invoice.issuedSnapshot).id;
    if (!snapshotId) throw new Error('Support intents require an issued invoice snapshot');
    const intent = await this.supportIntents.createIntent(actor, {
      type: parsed.intentType === 'Document' ? 'Document' : 'Notification',
      purpose: parsed.intentType === 'Document' ? 'InvoiceDocument' : 'InvoiceEmail',
      sourceRef: { resourceType: 'Invoice', resourceId: id },
      recipientRef: parsed.recipientHomeownerId ? { resourceType: 'Homeowner', resourceId: parsed.recipientHomeownerId } : undefined,
      payload: { invoiceId: id, issuedInvoiceSnapshotId: snapshotId, templateReferenceVersionId: parsed.templateReferenceVersionId },
      correlationId: actor.correlationId
    });
    if (parsed.intentType === 'Document') {
      await this.repository.createDocumentIntent({ invoiceId: id, issuedInvoiceSnapshotId: snapshotId, templateReferenceVersionId: parsed.templateReferenceVersionId, requestedByUserId: actor.userId, correlationId: actor.correlationId });
    } else {
      await this.repository.createEmailIntent({ invoiceId: id, issuedInvoiceSnapshotId: snapshotId, recipientHomeownerId: parsed.recipientHomeownerId, templateReferenceVersionId: parsed.templateReferenceVersionId, requestedByUserId: actor.userId, correlationId: actor.correlationId });
    }
    await this.audit.record(actor, 'UOW04.INVOICE.SUPPORT_INTENT.CREATED', 'Invoice', id, { intentType: parsed.intentType });
    return intent;
  }
}
