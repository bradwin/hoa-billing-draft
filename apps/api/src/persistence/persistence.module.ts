import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaTransactionRunner } from './transaction-runner';
import { AuditRepository } from './repositories/audit.repository';
import { SessionRepository } from './repositories/session.repository';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [PrismaModule],
  providers: [PrismaTransactionRunner, AuditRepository, SessionRepository, UserRepository],
  exports: [PrismaTransactionRunner, AuditRepository, SessionRepository, UserRepository]
})
export class PersistenceModule {}
