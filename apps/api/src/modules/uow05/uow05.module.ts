import { Module } from '@nestjs/common';
import { ApprovalModule } from '../approvals/approval.module';
import { AuditModule } from '../audit/audit.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { SupportIntentModule } from '../support-intents/support-intent.module';
import { Uow05Repository } from '../../persistence/repositories/uow05.repository';
import { PaymentService } from './payment.service';
import { Uow05AuditAdapter } from './uow05-audit.service';
import { Uow05AuthorizationPolicy } from './uow05-authorization.service';
import { Uow05Controller } from './uow05.controller';

@Module({
  imports: [AuditModule, AuthorizationModule, ApprovalModule, SupportIntentModule],
  controllers: [Uow05Controller],
  providers: [Uow05Repository, Uow05AuditAdapter, Uow05AuthorizationPolicy, PaymentService],
  exports: [PaymentService]
})
export class Uow05Module {}
