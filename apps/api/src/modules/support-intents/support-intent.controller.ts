import { Body, Controller, Post, Req } from '@nestjs/common';
import { Permissions, type ActorContext } from '@hoa/shared';
import { RequirePermission } from '../authorization/require-permission.decorator';
import { SupportIntentService } from './support-intent.service';

@Controller('support-intents')
export class SupportIntentController {
  constructor(private readonly supportIntents: SupportIntentService) {}

  @RequirePermission(Permissions.SUPPORT_INTENT_CREATE)
  @Post()
  create(@Req() req: { actor: ActorContext }, @Body() body: unknown): Promise<unknown> {
    return this.supportIntents.createIntent(req.actor, body);
  }
}
