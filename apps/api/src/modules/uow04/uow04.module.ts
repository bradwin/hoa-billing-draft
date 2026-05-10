import { Module } from '@nestjs/common';
import { ApprovalModule } from '../approvals/approval.module';
import { AuditModule } from '../audit/audit.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { SupportIntentModule } from '../support-intents/support-intent.module';
import { Uow04Repository } from '../../persistence/repositories/uow04.repository';
import { InvoiceService } from './invoice.service';
import { Uow04AuditAdapter } from './uow04-audit.service';
import { Uow04AuthorizationPolicy } from './uow04-authorization.service';
import { Uow04Controller } from './uow04.controller';

@Module({
  imports: [AuditModule, AuthorizationModule, ApprovalModule, SupportIntentModule],
  controllers: [Uow04Controller],
  providers: [Uow04Repository, Uow04AuditAdapter, Uow04AuthorizationPolicy, InvoiceService],
  exports: [InvoiceService]
})
export class Uow04Module {}
