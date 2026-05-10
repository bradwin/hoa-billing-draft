import { Body, Controller, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { Permissions } from '@hoa/shared';
import { RequirePermission } from '../authorization/require-permission.decorator';
import { ConfigurationService } from './configuration.service';
import type { RequestWithActor } from './uow03.types';

@Controller('billing-configuration')
export class Uow03Controller {
  constructor(private readonly configuration: ConfigurationService) {}

  @RequirePermission(Permissions.UOW03_CONFIG_READ)
  @Get('summary')
  summary(@Req() req: RequestWithActor, @Query() query: unknown): Promise<unknown> {
    return this.configuration.list(req.actor, query);
  }

  @RequirePermission(Permissions.UOW03_CONFIG_READ)
  @Get('drafts')
  drafts(@Req() req: RequestWithActor, @Query() query: unknown): Promise<unknown> {
    return this.configuration.list(req.actor, query);
  }

  @RequirePermission(Permissions.UOW03_CONFIG_MANAGE)
  @Post('drafts')
  createDraft(@Req() req: RequestWithActor, @Body() body: unknown): Promise<unknown> {
    return this.configuration.createDraft(req.actor, body);
  }

  @RequirePermission(Permissions.UOW03_CONFIG_MANAGE)
  @Put('drafts/:id')
  updateDraft(@Req() req: RequestWithActor, @Param('id') id: string, @Body() body: unknown): Promise<unknown> {
    return this.configuration.updateDraft(req.actor, id, body);
  }

  @RequirePermission(Permissions.UOW03_CONFIG_MANAGE)
  @Post('drafts/:id/submit-approval')
  submitApproval(@Req() req: RequestWithActor, @Param('id') id: string, @Body() body: unknown): Promise<unknown> {
    return this.configuration.submitForApproval(req.actor, id, body);
  }

  @RequirePermission(Permissions.UOW03_CONFIG_ACTIVATE)
  @Post('drafts/:id/activate')
  activate(@Req() req: RequestWithActor, @Param('id') id: string, @Body() body: unknown): Promise<unknown> {
    return this.configuration.activate(req.actor, id, body);
  }

  @RequirePermission(Permissions.UOW03_CONFIG_READ)
  @Get('history')
  history(@Req() req: RequestWithActor, @Query() query: unknown): Promise<unknown> {
    return this.configuration.history(req.actor, query);
  }

  @RequirePermission(Permissions.UOW03_CONFIG_READ)
  @Get('resolve')
  resolve(@Req() req: RequestWithActor, @Query() query: unknown): Promise<unknown> {
    return this.configuration.resolve(req.actor, query);
  }
}
