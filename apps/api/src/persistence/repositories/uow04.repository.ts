import { Injectable } from '@nestjs/common';
import type { PageRequest } from '@hoa/shared';
import { PrismaService } from '../../prisma/prisma.service';

function toSkipTake(page: PageRequest): { skip: number; take: number } {
  return { skip: (page.page - 1) * page.pageSize, take: page.pageSize };
}

@Injectable()
export class Uow04Repository {
  constructor(private readonly prisma: PrismaService) {}

  get client(): any {
    return this.prisma as any;
  }

  listInvoices(where: Record<string, unknown>, page: PageRequest): Promise<unknown[]> {
    return this.client.invoice.findMany({ where, orderBy: { updatedAt: 'desc' }, include: { lines: true }, ...toSkipTake(page) });
  }

  countInvoices(where: Record<string, unknown>): Promise<number> {
    return this.client.invoice.count({ where });
  }

  listExceptions(where: Record<string, unknown>, page: PageRequest): Promise<unknown[]> {
    return this.client.billingException.findMany({ where, orderBy: { createdAt: 'desc' }, ...toSkipTake(page) });
  }

  countExceptions(where: Record<string, unknown>): Promise<number> {
    return this.client.billingException.count({ where });
  }

  findInvoiceById(id: string): Promise<unknown | null> {
    return this.client.invoice.findUnique({
      where: { id },
      include: {
        lines: true,
        issuedSnapshot: { include: { lineSnapshots: true } },
        lifecycleActions: true,
        documentIntents: true,
        emailIntents: true
      }
    });
  }

  createManualDraft(data: Record<string, any>, lines: Record<string, any>[]): Promise<unknown> {
    return this.client.invoice.create({
      data: { ...data, lines: { create: lines } },
      include: { lines: true }
    });
  }

  async createRecurringBatch(batch: Record<string, any>, drafts: Array<{ invoice: Record<string, any>; lines: Record<string, any>[] }>, exceptions: Record<string, any>[]): Promise<unknown> {
    return this.client.invoiceBatch.create({
      data: {
        ...batch,
        invoices: { create: drafts.map((draft) => ({ ...draft.invoice, lines: { create: draft.lines } })) },
        exceptions: { create: exceptions }
      },
      include: { invoices: true, exceptions: true }
    });
  }

  findDuplicateRecurring(input: Record<string, unknown>): Promise<unknown | null> {
    return this.client.invoice.findFirst({
      where: {
        origin: 'Recurring',
        status: { not: 'Voided' },
        propertyId: input.propertyId,
        billingAccountId: input.billingAccountId,
        billingPeriodKey: input.billingPeriodKey,
        lines: { some: { chargeTypeKey: input.chargeTypeKey } }
      }
    });
  }

  async issueInvoice(invoiceId: string, actorUserId: string, issueDate: Date, invoiceNumber: string, numberingRuleVersionId: string | null, numberingScope: string, correlationId: string): Promise<unknown> {
    return this.client.$transaction(async (tx: any) => {
      const invoice = await tx.invoice.findUnique({ where: { id: invoiceId }, include: { lines: true } });
      if (!invoice || invoice.status !== 'Draft') throw new Error('Only draft invoices can be issued');
      const issued = await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: 'Issued', invoiceNumber, issueDate, issuedAt: new Date() },
        include: { lines: true }
      });
      await tx.invoiceNumberAssignment.create({
        data: { invoiceId, invoiceNumber, numberingRuleVersionId, numberingScope, assignedByUserId: actorUserId, correlationId }
      });
      const snapshot = await tx.issuedInvoiceSnapshot.create({
        data: {
          invoiceId,
          invoiceNumber,
          statusAtIssue: 'Issued',
          propertySnapshot: { propertyId: invoice.propertyId },
          billingAccountSnapshot: { billingAccountId: invoice.billingAccountId },
          homeownerSnapshot: { homeownerId: invoice.responsibleHomeownerId },
          billingPeriodSnapshot: invoice.billingPeriodKey ? { billingPeriodKey: invoice.billingPeriodKey, billingPeriodStart: invoice.billingPeriodStart, billingPeriodEnd: invoice.billingPeriodEnd } : undefined,
          dueDate: invoice.dueDate,
          totalAmount: invoice.totalAmount,
          configurationReferences: {},
          sourceReferences: { invoiceId },
          lineSnapshots: {
            create: invoice.lines.map((line: any) => ({
              lineNumber: line.lineNumber,
              chargeTypeSnapshot: { chargeTypeKey: line.chargeTypeKey, chargeCategory: line.chargeCategory },
              lotArea: line.lotArea,
              rate: line.rate,
              quantityOrBasis: line.quantity?.toString(),
              roundingRuleSnapshot: line.roundingRuleKey ? { roundingRuleKey: line.roundingRuleKey } : undefined,
              lineAmount: line.amount,
              manualMetadata: line.isManual ? { reason: line.manualReason } : undefined,
              taxLikeMetadata: line.isManualTaxLike ? { isManualTaxLike: true } : undefined,
              calculationInputs: { configurationVersionIds: line.configurationVersionIds }
            }))
          }
        }
      });
      await tx.invoiceOpenAmountInput.create({ data: { invoiceId, sourceAmount: invoice.totalAmount, currency: invoice.currency, effectiveDate: issueDate } });
      await tx.invoiceLifecycleAction.create({ data: { invoiceId, actionType: 'Issue', fromStatus: 'Draft', toStatus: 'Issued', reason: 'Issued by staff', actorUserId, correlationId } });
      return { ...issued, issuedSnapshotId: snapshot.id };
    });
  }

  updateInvoice(id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.client.invoice.update({ where: { id }, data });
  }

  createLifecycleAction(data: Record<string, unknown>): Promise<unknown> {
    return this.client.invoiceLifecycleAction.create({ data });
  }

  createDocumentIntent(data: Record<string, unknown>): Promise<unknown> {
    return this.client.invoiceDocumentIntent.create({ data });
  }

  createEmailIntent(data: Record<string, unknown>): Promise<unknown> {
    return this.client.invoiceEmailIntent.create({ data });
  }
}
