import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AuthorizationService } from './authorization.service';
import { PermissionGuard } from './permission.guard';

@Module({
  imports: [AuditModule],
  providers: [AuthorizationService, PermissionGuard],
  exports: [AuthorizationService, PermissionGuard]
})
export class AuthorizationModule {}
