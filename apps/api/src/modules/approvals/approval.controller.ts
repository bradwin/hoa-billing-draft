import { Body, Controller, Post, Req } from '@nestjs/common';
import { Permissions, type ActorContext } from '@hoa/shared';
import { RequirePermission } from '../authorization/require-permission.decorator';
import { ApprovalService } from './approval.service';

@Controller('approvals')
export class ApprovalController {
  constructor(private readonly approvals: ApprovalService) {}

  @RequirePermission(Permissions.APPROVAL_REQUEST_CREATE)
  @Post()
  create(@Req() req: { actor: ActorContext }, @Body() body: unknown): Promise<unknown> {
    return this.approvals.createRequest(req.actor, body);
  }
}
