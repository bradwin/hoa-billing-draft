import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Permissions } from '@hoa/shared';
import { RequirePermission } from '../authorization/require-permission.decorator';
import { DelinquencyService } from './delinquency.service';
import type { RequestWithActor } from './uow06.types';

@Controller('delinquency')
export class Uow06Controller {
  constructor(private readonly delinquency: DelinquencyService) {}

  @RequirePermission(Permissions.UOW06_AGING_READ)
  @Get('aging')
  listAging(@Req() req: RequestWithActor, @Query() query: unknown): Promise<unknown> {
    return this.delinquency.listAging(req.actor, query);
  }

  @RequirePermission(Permissions.UOW06_OVERDUE_EVALUATE)
  @Post('overdue/evaluate')
  evaluateOverdue(@Req() req: RequestWithActor, @Body() body: unknown): Promise<unknown> {
    return this.delinquency.evaluateOverdue(req.actor, body);
  }

  @RequirePermission(Permissions.UOW06_PENALTY_READ)
  @Get('penalties')
  listPenalties(@Req() req: RequestWithActor, @Query() query: unknown): Promise<unknown> {
    return this.delinquency.listPenalties(req.actor, query);
  }

  @RequirePermission(Permissions.UOW06_PENALTY_GENERATE)
  @Post('penalties/candidates')
  generatePenaltyCandidates(@Req() req: RequestWithActor, @Body() body: unknown): Promise<unknown> {
    return this.delinquency.generatePenaltyCandidates(req.actor, body);
  }

  @RequirePermission(Permissions.UOW06_PENALTY_APPLY)
  @Post('penalties/apply')
  applyPenalties(@Req() req: RequestWithActor, @Body() body: unknown): Promise<unknown> {
    return this.delinquency.applyPenalties(req.actor, body);
  }

  @RequirePermission(Permissions.UOW06_PENALTY_LIFECYCLE)
  @Post('penalties/:id/lifecycle-request')
  requestPenaltyLifecycle(@Req() req: RequestWithActor, @Param('id') id: string, @Body() body: unknown): Promise<unknown> {
    return this.delinquency.requestPenaltyLifecycle(req.actor, id, body);
  }

  @RequirePermission(Permissions.UOW06_WAIVER_REQUEST)
  @Post('waivers')
  requestWaiver(@Req() req: RequestWithActor, @Body() body: unknown): Promise<unknown> {
    return this.delinquency.requestWaiver(req.actor, body);
  }

  @RequirePermission(Permissions.UOW06_WAIVER_APPROVE)
  @Post('waivers/:id/decision')
  decideWaiver(@Req() req: RequestWithActor, @Param('id') id: string, @Body() body: unknown): Promise<unknown> {
    return this.delinquency.decideWaiver(req.actor, id, body);
  }

  @RequirePermission(Permissions.UOW06_REMINDER_READ)
  @Get('reminders')
  listReminderEligibility(@Req() req: RequestWithActor, @Query() query: unknown): Promise<unknown> {
    return this.delinquency.listReminderEligibility(req.actor, query);
  }

  @RequirePermission(Permissions.UOW06_REMINDER_INTENT)
  @Post('reminders/eligibility')
  evaluateReminderEligibility(@Req() req: RequestWithActor, @Body() body: unknown): Promise<unknown> {
    return this.delinquency.evaluateReminderEligibility(req.actor, body);
  }

  @RequirePermission(Permissions.UOW06_REMINDER_INTENT)
  @Post('reminders/intents')
  createReminderIntents(@Req() req: RequestWithActor, @Body() body: unknown): Promise<unknown> {
    return this.delinquency.createReminderIntents(req.actor, body);
  }
}
