import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CorrelationMiddleware } from './common/correlation.middleware';
import { StructuredLogger } from './common/structured-logger.service';
import { loadAppConfig } from './config/app-config';
import { HealthController } from './health/health.controller';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { MfaModule } from './modules/mfa/mfa.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ApprovalModule } from './modules/approvals/approval.module';
import { SupportIntentModule } from './modules/support-intents/support-intent.module';
import { Uow02Module } from './modules/uow02/uow02.module';
import { Uow03Module } from './modules/uow03/uow03.module';
import { Uow04Module } from './modules/uow04/uow04.module';
import { MeModule } from './modules/me/me.module';
import { PrismaModule } from './prisma/prisma.module';
import { PersistenceModule } from './persistence/persistence.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => loadAppConfig()]
    }),
    PrismaModule,
    PersistenceModule,
    AuditModule,
    AuthModule,
    MfaModule,
    AuthorizationModule,
    SettingsModule,
    ApprovalModule,
    SupportIntentModule,
    Uow02Module,
    Uow03Module,
    Uow04Module,
    MeModule
  ],
  controllers: [HealthController],
  providers: [StructuredLogger]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
