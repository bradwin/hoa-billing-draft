import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { Permissions, type ActorContext, updateSettingSchema } from '@hoa/shared';
import { AuthorizationService } from '../authorization/authorization.service';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';

export const DELEGATED_SETTING_CATEGORIES = [
  'billing_rules',
  'numbering',
  'smtp',
  'storage',
  'document_templates',
  'payment_methods'
] as const;

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorization: AuthorizationService,
    private readonly audit: AuditService
  ) {}

  async updateSetting(actor: ActorContext, input: unknown): Promise<unknown> {
    if (!this.authorization.can(actor, Permissions.SETTINGS_UPDATE_HOA_PROFILE)) {
      await this.authorization.deny(actor, 'SETTINGS.UPDATE_DENIED', actor.correlationId, 'Missing settings permission');
      throw new Error('Access denied');
    }
    const parsed = updateSettingSchema.parse(input);
    const existing = await this.prisma.settingValue.findUnique({
      where: { categoryKey_settingKey: { categoryKey: 'hoa_profile', settingKey: parsed.key } }
    });
    const saved = await this.prisma.settingValue.upsert({
      where: { categoryKey_settingKey: { categoryKey: 'hoa_profile', settingKey: parsed.key } },
      create: {
        categoryKey: 'hoa_profile',
        settingKey: parsed.key,
        value: parsed.value as Prisma.InputJsonValue,
        updatedBy: actor.userId
      },
      update: {
        value: parsed.value as Prisma.InputJsonValue,
        version: { increment: 1 },
        updatedBy: actor.userId
      }
    });
    const oldValue =
      existing?.value && typeof existing.value === 'object' && !Array.isArray(existing.value)
        ? (existing.value as Record<string, unknown>)
        : undefined;
    const newValue = typeof parsed.value === 'object' ? parsed.value : { value: parsed.value };
    await this.audit.append({
      actor,
      category: 'Configuration',
      action: 'SETTING.UPDATED',
      resourceRef: { resourceType: 'Setting', resourceId: parsed.key },
      correlationId: actor.correlationId,
      result: 'Success',
      reason: parsed.reason,
      ...(oldValue ? { oldValue } : {}),
      newValue
    });
    return saved;
  }

  listCategories(): readonly string[] {
    return ['hoa_profile', ...DELEGATED_SETTING_CATEGORIES];
  }
}
