import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { NullSupportAdapter } from './null-support-adapter';
import { SupportIntentController } from './support-intent.controller';
import { SupportIntentService } from './support-intent.service';

@Module({
  imports: [AuditModule, PrismaModule],
  controllers: [SupportIntentController],
  providers: [SupportIntentService, NullSupportAdapter],
  exports: [SupportIntentService, NullSupportAdapter]
})
export class SupportIntentModule {}
