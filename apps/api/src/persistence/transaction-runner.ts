import { Injectable } from '@nestjs/common';
import type { TransactionContext, TransactionRunner, TransactionWork } from '@hoa/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaTransactionRunner implements TransactionRunner {
  constructor(private readonly prisma: PrismaService) {}

  async withTransaction<T>(work: TransactionWork<T>): Promise<T> {
    return this.prisma.$transaction(async () => work({ id: crypto.randomUUID() }));
  }
}
