import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../persistence/persistence.module';
import { AuditHashService } from './audit-hash.service';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

@Module({
  imports: [PersistenceModule],
  controllers: [AuditController],
  providers: [AuditService, AuditHashService],
  exports: [AuditService, AuditHashService]
})
export class AuditModule {}
