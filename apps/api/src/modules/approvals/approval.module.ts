import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { ApprovalService } from './approval.service';
import { ApprovalController } from './approval.controller';

@Module({
  imports: [AuditModule, AuthorizationModule, PrismaModule],
  controllers: [ApprovalController],
  providers: [ApprovalService],
  exports: [ApprovalService]
})
export class ApprovalModule {}
