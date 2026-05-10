import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Permissions } from '@hoa/shared';
import { RequirePermission } from '../authorization/require-permission.decorator';
import { PaymentService } from './payment.service';
import type { RequestWithActor } from './uow05.types';

@Controller('payments')
export class Uow05Controller {
  constructor(private readonly payments: PaymentService) {}

  @RequirePermission(Permissions.UOW05_PAYMENT_READ)
  @Get()
  listPayments(@Req() req: RequestWithActor, @Query() query: unknown): Promise<unknown> {
    return this.payments.listPayments(req.actor, query);
  }

  @RequirePermission(Permissions.UOW05_PAYMENT_POST)
  @Post('post')
  postPayment(@Req() req: RequestWithActor, @Body() body: unknown): Promise<unknown> {
    return this.payments.post(req.actor, body);
  }

  @RequirePermission(Permissions.UOW05_PAYMENT_PROOF_READ)
  @Get('proofs')
  listProofs(@Req() req: RequestWithActor, @Query() query: unknown): Promise<unknown> {
    return this.payments.listProofs(req.actor, query);
  }

  @RequirePermission(Permissions.UOW05_PAYMENT_PROOF_SUBMIT)
  @Post('proofs')
  submitProof(@Req() req: RequestWithActor, @Body() body: unknown): Promise<unknown> {
    return this.payments.submitProof(req.actor, body);
  }

  @RequirePermission(Permissions.UOW05_PAYMENT_PROOF_REVIEW)
  @Post('proofs/:id/review')
  reviewProof(@Req() req: RequestWithActor, @Param('id') id: string): Promise<unknown> {
    return this.payments.decideProof(req.actor, id, 'UnderReview', {});
  }

  @RequirePermission(Permissions.UOW05_PAYMENT_PROOF_REVIEW)
  @Post('proofs/:id/reject')
  rejectProof(@Req() req: RequestWithActor, @Param('id') id: string, @Body() body: unknown): Promise<unknown> {
    return this.payments.decideProof(req.actor, id, 'Rejected', body);
  }

  @RequirePermission(Permissions.UOW05_PAYMENT_PROOF_REVIEW)
  @Post('proofs/:id/cancel')
  cancelProof(@Req() req: RequestWithActor, @Param('id') id: string, @Body() body: unknown): Promise<unknown> {
    return this.payments.decideProof(req.actor, id, 'Cancelled', body);
  }

  @RequirePermission(Permissions.UOW05_PAYMENT_READ)
  @Get(':id')
  getPayment(@Req() req: RequestWithActor, @Param('id') id: string): Promise<unknown> {
    return this.payments.getPayment(req.actor, id);
  }

  @RequirePermission(Permissions.UOW05_CREDIT_MANAGE)
  @Post('credits/:id/apply')
  applyCredit(@Req() req: RequestWithActor, @Param('id') id: string, @Body() body: unknown): Promise<unknown> {
    return this.payments.applyCredit(req.actor, id, body);
  }

  @RequirePermission(Permissions.UOW05_REVERSAL_REQUEST)
  @Post(':id/reversal-request')
  requestReversal(@Req() req: RequestWithActor, @Param('id') id: string, @Body() body: unknown): Promise<unknown> {
    return this.payments.requestReversal(req.actor, id, body);
  }

  @RequirePermission(Permissions.UOW05_CORRECTION_REQUEST)
  @Post('correction-requests')
  requestCorrection(@Req() req: RequestWithActor, @Body() body: unknown): Promise<unknown> {
    return this.payments.requestCorrection(req.actor, body);
  }

  @RequirePermission(Permissions.UOW05_SUPPORT_INTENT)
  @Post(':id/support-intents')
  supportIntent(@Req() req: RequestWithActor, @Param('id') id: string, @Body() body: unknown): Promise<unknown> {
    return this.payments.createSupportIntent(req.actor, id, body);
  }
}
