import { Body, Controller, Get, Req, Put } from '@nestjs/common';
import { Permissions, type ActorContext } from '@hoa/shared';
import { RequirePermission } from '../authorization/require-permission.decorator';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @RequirePermission(Permissions.SETTINGS_READ)
  @Get('categories')
  categories(): readonly string[] {
    return this.settings.listCategories();
  }

  @RequirePermission(Permissions.SETTINGS_UPDATE_HOA_PROFILE)
  @Put('hoa-profile')
  updateHoaProfile(@Req() req: { actor: ActorContext }, @Body() body: unknown): Promise<unknown> {
    return this.settings.updateSetting(req.actor, body);
  }
}
