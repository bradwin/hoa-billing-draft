import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PersistenceModule } from '../../persistence/persistence.module';
import { AbuseProtectionService } from './abuse-protection.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

@Module({
  imports: [AuditModule, PersistenceModule],
  controllers: [AuthController, SessionController],
  providers: [AbuseProtectionService, AuthService, SessionService],
  exports: [AbuseProtectionService, AuthService, SessionService]
})
export class AuthModule {}
