import { Body, Controller, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { Permissions } from '@hoa/shared';
import { RequirePermission } from '../authorization/require-permission.decorator';
import { ContactChangeService } from './contact-change.service';
import { HomeownerService } from './homeowner.service';
import { OwnershipService } from './ownership.service';
import { PropertyService } from './property.service';
import type { RequestWithActor } from './uow02.types';

@Controller()
export class Uow02Controller {
  constructor(
    private readonly homeowners: HomeownerService,
    private readonly properties: PropertyService,
    private readonly ownership: OwnershipService,
    private readonly contactChanges: ContactChangeService
  ) {}

  @RequirePermission(Permissions.UOW02_HOMEOWNER_READ)
  @Get('homeowners')
  searchHomeowners(@Req() req: RequestWithActor, @Query() query: unknown): Promise<unknown> {
    return this.homeowners.search(req.actor, query);
  }

  @RequirePermission(Permissions.UOW02_HOMEOWNER_READ)
  @Get('homeowners/:id')
  getHomeowner(@Req() req: RequestWithActor, @Param('id') id: string): Promise<unknown> {
    return this.homeowners.get(req.actor, id);
  }

  @RequirePermission(Permissions.UOW02_HOMEOWNER_MANAGE)
  @Post('homeowners/duplicate-check')
  duplicateCheck(@Req() req: RequestWithActor, @Body() body: unknown): Promise<unknown> {
    return this.homeowners.duplicateCheck(req.actor, body);
  }

  @RequirePermission(Permissions.UOW02_HOMEOWNER_MANAGE)
  @Post('homeowners')
  createHomeowner(@Req() req: RequestWithActor, @Body() body: unknown): Promise<unknown> {
    return this.homeowners.create(req.actor, body);
  }

  @RequirePermission(Permissions.UOW02_HOMEOWNER_MANAGE)
  @Put('homeowners/:id')
  updateHomeowner(@Req() req: RequestWithActor, @Param('id') id: string, @Body() body: unknown): Promise<unknown> {
    return this.homeowners.update(req.actor, id, body);
  }

  @RequirePermission(Permissions.UOW02_PROPERTY_READ)
  @Get('properties')
  searchProperties(@Req() req: RequestWithActor, @Query() query: unknown): Promise<unknown> {
    return this.properties.search(req.actor, query);
  }

  @RequirePermission(Permissions.UOW02_PROPERTY_READ)
  @Get('properties/:id')
  getProperty(@Req() req: RequestWithActor, @Param('id') id: string): Promise<unknown> {
    return this.properties.get(req.actor, id);
  }

  @RequirePermission(Permissions.UOW02_PROPERTY_MANAGE)
  @Post('properties')
  createProperty(@Req() req: RequestWithActor, @Body() body: unknown): Promise<unknown> {
    return this.properties.create(req.actor, body);
  }

  @RequirePermission(Permissions.UOW02_PROPERTY_MANAGE)
  @Put('properties/:id')
  updateProperty(@Req() req: RequestWithActor, @Param('id') id: string, @Body() body: unknown): Promise<unknown> {
    return this.properties.update(req.actor, id, body);
  }

  @RequirePermission(Permissions.UOW02_PROPERTY_MANAGE)
  @Post('properties/:id/aliases')
  addAlias(@Req() req: RequestWithActor, @Param('id') id: string, @Body() body: unknown): Promise<unknown> {
    return this.properties.addAlias(req.actor, id, body);
  }

  @RequirePermission(Permissions.UOW02_PROPERTY_MANAGE)
  @Put('properties/:id/aliases/:aliasId')
  updateAlias(@Req() req: RequestWithActor, @Param('aliasId') aliasId: string, @Body() body: unknown): Promise<unknown> {
    return this.properties.updateAlias(req.actor, aliasId, body);
  }

  @RequirePermission(Permissions.UOW02_PROPERTY_READ)
  @Get('properties/:id/ownership')
  listOwnership(@Req() req: RequestWithActor, @Param('id') id: string): Promise<unknown> {
    return this.ownership.listOwnership(req.actor, id);
  }

  @RequirePermission(Permissions.UOW02_OWNERSHIP_MANAGE)
  @Post('properties/:id/ownership/primary')
  assignPrimaryOwner(@Req() req: RequestWithActor, @Param('id') id: string, @Body() body: unknown): Promise<unknown> {
    return this.ownership.assignPrimary(req.actor, id, body);
  }

  @RequirePermission(Permissions.UOW02_PROPERTY_READ)
  @Get('properties/:id/billing-accounts')
  listBillingAccounts(@Req() req: RequestWithActor, @Param('id') id: string): Promise<unknown> {
    return this.ownership.listBillingAccounts(req.actor, id);
  }

  @RequirePermission(Permissions.UOW02_PROPERTY_READ)
  @Get('properties/:id/billable-validation')
  validateBillable(@Req() req: RequestWithActor, @Param('id') id: string, @Query() query: unknown): Promise<unknown> {
    return this.properties.validateBillable(req.actor, id, query);
  }

  @Post('contact-change-requests')
  submitContactChange(@Req() req: RequestWithActor, @Body() body: unknown): Promise<unknown> {
    return this.contactChanges.submit(req.actor, body);
  }

  @RequirePermission(Permissions.UOW02_CONTACT_DECIDE)
  @Get('contact-change-requests')
  listContactChanges(@Req() req: RequestWithActor, @Query() query: Record<string, unknown>): Promise<unknown> {
    return this.contactChanges.list(req.actor, query);
  }

  @RequirePermission(Permissions.UOW02_CONTACT_DECIDE)
  @Post('contact-change-requests/:id/approve')
  approveContactChange(@Req() req: RequestWithActor, @Param('id') id: string, @Body() body: unknown): Promise<unknown> {
    return this.contactChanges.decide(req.actor, id, 'Approved', body);
  }

  @RequirePermission(Permissions.UOW02_CONTACT_DECIDE)
  @Post('contact-change-requests/:id/reject')
  rejectContactChange(@Req() req: RequestWithActor, @Param('id') id: string, @Body() body: unknown): Promise<unknown> {
    return this.contactChanges.decide(req.actor, id, 'Rejected', body);
  }
}
