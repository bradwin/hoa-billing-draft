import { Module } from '@nestjs/common';
import { ApprovalModule } from '../approvals/approval.module';
import { AuditModule } from '../audit/audit.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { Uow03Repository } from '../../persistence/repositories/uow03.repository';
import { ConfigurationService } from './configuration.service';
import { Uow03AuditAdapter } from './uow03-audit.service';
import { Uow03AuthorizationPolicy } from './uow03-authorization.service';
import { Uow03Controller } from './uow03.controller';
import { VersionTimelineService } from './version-timeline.service';

@Module({
  imports: [AuditModule, AuthorizationModule, ApprovalModule],
  controllers: [Uow03Controller],
  providers: [Uow03Repository, Uow03AuditAdapter, Uow03AuthorizationPolicy, VersionTimelineService, ConfigurationService],
  exports: [ConfigurationService]
})
export class Uow03Module {}
