import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { MfaService } from './mfa.service';
import { MfaController } from './mfa.controller';
import { SecretEncryptionService } from './secret-encryption.service';

@Module({
  imports: [AuditModule],
  controllers: [MfaController],
  providers: [MfaService, SecretEncryptionService],
  exports: [MfaService, SecretEncryptionService]
})
export class MfaModule {}
