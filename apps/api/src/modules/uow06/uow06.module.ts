import { Module } from '@nestjs/common';
import { ApprovalModule } from '../approvals/approval.module';
import { AuditModule } from '../audit/audit.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { SupportIntentModule } from '../support-intents/support-intent.module';
import { Uow06Repository } from '../../persistence/repositories/uow06.repository';
import { DelinquencyService } from './delinquency.service';
import { Uow06AuditAdapter } from './uow06-audit.service';
import { Uow06AuthorizationPolicy } from './uow06-authorization.service';
import { Uow06Controller } from './uow06.controller';

@Module({
  imports: [AuditModule, AuthorizationModule, ApprovalModule, SupportIntentModule],
  controllers: [Uow06Controller],
  providers: [Uow06Repository, Uow06AuditAdapter, Uow06AuthorizationPolicy, DelinquencyService],
  exports: [DelinquencyService]
})
export class Uow06Module {}
