import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Permissions } from '@hoa/shared';
import { RequirePermission } from '../authorization/require-permission.decorator';
import { InvoiceService } from './invoice.service';
import type { RequestWithActor } from './uow04.types';

@Controller('invoices')
export class Uow04Controller {
  constructor(private readonly invoices: InvoiceService) {}

  @RequirePermission(Permissions.UOW04_INVOICE_READ)
  @Get()
  list(@Req() req: RequestWithActor, @Query() query: unknown): Promise<unknown> {
    return this.invoices.list(req.actor, query);
  }

  @RequirePermission(Permissions.UOW04_INVOICE_MANAGE)
  @Post('recurring-batches')
  generateRecurring(@Req() req: RequestWithActor, @Body() body: unknown): Promise<unknown> {
    return this.invoices.generateRecurring(req.actor, body);
  }

  @RequirePermission(Permissions.UOW04_INVOICE_MANAGE)
  @Post('manual')
  createManual(@Req() req: RequestWithActor, @Body() body: unknown): Promise<unknown> {
    return this.invoices.createManualDraft(req.actor, body);
  }

  @RequirePermission(Permissions.UOW04_INVOICE_ISSUE)
  @Post('issue')
  issue(@Req() req: RequestWithActor, @Body() body: unknown): Promise<unknown> {
    return this.invoices.issue(req.actor, body);
  }

  @RequirePermission(Permissions.UOW04_INVOICE_READ)
  @Get(':id')
  get(@Req() req: RequestWithActor, @Param('id') id: string): Promise<unknown> {
    return this.invoices.get(req.actor, id);
  }

  @RequirePermission(Permissions.UOW04_INVOICE_MANAGE)
  @Post(':id/cancel')
  cancel(@Req() req: RequestWithActor, @Param('id') id: string, @Body() body: unknown): Promise<unknown> {
    return this.invoices.cancelDraft(req.actor, id, body);
  }

  @RequirePermission(Permissions.UOW04_INVOICE_LIFECYCLE)
  @Post(':id/void-request')
  voidRequest(@Req() req: RequestWithActor, @Param('id') id: string, @Body() body: unknown): Promise<unknown> {
    return this.invoices.requestLifecycle(req.actor, id, 'Void', body);
  }

  @RequirePermission(Permissions.UOW04_INVOICE_LIFECYCLE)
  @Post(':id/reissue-request')
  reissueRequest(@Req() req: RequestWithActor, @Param('id') id: string, @Body() body: unknown): Promise<unknown> {
    return this.invoices.requestLifecycle(req.actor, id, 'Reissue', body);
  }

  @RequirePermission(Permissions.UOW04_INVOICE_SUPPORT_INTENT)
  @Post(':id/support-intents')
  supportIntent(@Req() req: RequestWithActor, @Param('id') id: string, @Body() body: unknown): Promise<unknown> {
    return this.invoices.createSupportIntent(req.actor, id, body);
  }
}
