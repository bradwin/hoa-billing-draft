import { Controller, Get, Req } from '@nestjs/common';
import { listPermissionsForRole, type ActorContext } from '@hoa/shared';

@Controller('me')
export class MeController {
  @Get()
  me(@Req() req: { actor?: ActorContext }): { actor?: ActorContext; permissions: readonly string[] } {
    if (!req.actor) return { permissions: [] };
    return { actor: req.actor, permissions: listPermissionsForRole(req.actor.role) };
  }
}
