import { Injectable } from '@nestjs/common';
import type { PageRequest } from '@hoa/shared';
import { PrismaService } from '../../prisma/prisma.service';

function toSkipTake(page: PageRequest): { skip: number; take: number } {
  return { skip: (page.page - 1) * page.pageSize, take: page.pageSize };
}

@Injectable()
export class Uow05Repository {
  constructor(private readonly prisma: PrismaService) {}

  get client(): any {
    return this.prisma as any;
  }

  listPaymentProofs(where: Record<string, unknown>, page: PageRequest): Promise<unknown[]> {
    return this.client.paymentProof.findMany({ where, orderBy: { submittedAt: 'desc' }, ...toSkipTake(page) });
  }

  countPaymentProofs(where: Record<string, unknown>): Promise<number> {
    return this.client.paymentProof.count({ where });
  }

  findPaymentProofById(id: string): Promise<unknown | null> {
    return this.client.paymentProof.findUnique({ where: { id }, include: { payments: true } });
  }

  createPaymentProof(data: Record<string, any>): Promise<unknown> {
    return this.client.paymentProof.create({ data });
  }

  updatePaymentProof(id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.client.paymentProof.update({ where: { id }, data });
  }

  listPayments(where: Record<string, unknown>, page: PageRequest): Promise<unknown[]> {
    return this.client.payment.findMany({
      where,
      orderBy: { postingDate: 'desc' },
      include: { allocations: true, credits: true, receipt: { include: { snapshot: true } }, reversals: true },
      ...toSkipTake(page)
    });
  }

  countPayments(where: Record<string, unknown>): Promise<number> {
    return this.client.payment.count({ where });
  }

  findPaymentById(id: string): Promise<unknown | null> {
    return this.client.payment.findUnique({
      where: { id },
      include: { allocations: true, credits: { include: { applications: true } }, receipt: { include: { snapshot: true, documentIntents: true, emailIntents: true } }, reversals: true, balanceImpactFacts: true }
    });
  }

  findDuplicatePaymentRisk(input: Record<string, unknown>): Promise<unknown | null> {
    return this.client.payment.findFirst({
      where: {
        status: { not: 'Reversed' },
        billingAccountId: input.billingAccountId,
        paymentMethodKey: input.paymentMethodKey,
        externalReference: input.externalReference,
        amount: input.amount,
        paymentDate: input.paymentDate
      }
    });
  }

  findActiveDuplicateProof(input: Record<string, unknown>): Promise<unknown | null> {
    return this.client.paymentProof.findFirst({
      where: {
        status: { in: ['Submitted', 'UnderReview'] },
        billingAccountId: input.billingAccountId,
        paymentMethodKey: input.paymentMethodKey,
        externalReference: input.externalReference,
        amount: input.amount,
        paymentDate: input.paymentDate
      }
    });
  }

  async postPayment(payment: Record<string, any>, allocations: Record<string, any>[], credit: Record<string, any> | null, receipt: Record<string, any>, receiptSnapshot: Record<string, any>, balanceFacts: Record<string, any>[]): Promise<unknown> {
    return this.client.$transaction(async (tx: any) => {
      const savedPayment = await tx.payment.create({ data: { ...payment, allocations: { create: allocations }, ...(credit ? { credits: { create: [credit] } } : {}) } });
      const savedReceipt = await tx.receipt.create({ data: { ...receipt, paymentId: savedPayment.id } });
      await tx.receiptSnapshot.create({ data: { ...receiptSnapshot, receiptId: savedReceipt.id } });
      if (balanceFacts.length > 0) {
        await tx.paymentBalanceImpactFact.createMany({
          data: balanceFacts.map((fact) => ({
            ...fact,
            paymentId: savedPayment.id,
            sourceRecordId: fact.sourceRecordId === 'pending' ? savedPayment.id : fact.sourceRecordId
          }))
        });
      }
      if (payment.paymentProofId) {
        await tx.paymentProof.update({ where: { id: payment.paymentProofId }, data: { status: 'Posted', reviewedByUserId: payment.postedByUserId, reviewedAt: new Date() } });
      }
      return tx.payment.findUnique({ where: { id: savedPayment.id }, include: { allocations: true, credits: true, receipt: { include: { snapshot: true } }, balanceImpactFacts: true } });
    });
  }

  createCreditApplication(data: Record<string, unknown>): Promise<unknown> {
    return this.client.creditApplication.create({ data });
  }

  createReversal(data: Record<string, unknown>): Promise<unknown> {
    return this.client.paymentReversal.create({ data });
  }

  createCorrection(data: Record<string, unknown>): Promise<unknown> {
    return this.client.financialCorrection.create({ data });
  }

  createDocumentIntent(data: Record<string, unknown>): Promise<unknown> {
    return this.client.receiptDocumentIntent.create({ data });
  }

  createEmailIntent(data: Record<string, unknown>): Promise<unknown> {
    return this.client.receiptEmailIntent.create({ data });
  }
}
