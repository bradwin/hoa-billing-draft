import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { Uow02Repository } from '../../persistence/repositories/uow02.repository';
import { ContactChangeService } from './contact-change.service';
import { HomeownerService } from './homeowner.service';
import { OwnershipService } from './ownership.service';
import { PropertyService } from './property.service';
import { Uow02AuditAdapter } from './uow02-audit.service';
import { Uow02AuthorizationPolicy } from './uow02-authorization.service';
import { Uow02Controller } from './uow02.controller';

@Module({
  imports: [AuditModule, AuthorizationModule],
  controllers: [Uow02Controller],
  providers: [
    Uow02Repository,
    Uow02AuditAdapter,
    Uow02AuthorizationPolicy,
    HomeownerService,
    PropertyService,
    OwnershipService,
    ContactChangeService
  ],
  exports: [HomeownerService, PropertyService, OwnershipService, ContactChangeService]
})
export class Uow02Module {}
