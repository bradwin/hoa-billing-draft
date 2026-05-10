import { Body, Controller, Headers, Post } from '@nestjs/common';
import { activateInvitationSchema, loginSchema, passwordResetCompleteSchema, passwordResetRequestSchema } from '@hoa/shared';
import { CORRELATION_HEADER } from '../../common/correlation.middleware';
import { PublicRoute } from '../authorization/public-route.decorator';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @PublicRoute()
  @Post('login')
  login(@Body() body: unknown, @Headers(CORRELATION_HEADER) correlationId: string): Promise<unknown> {
    const parsed = loginSchema.parse(body);
    return this.auth.login({
      ...parsed,
      correlationId,
      sourceFingerprint: 'source-unavailable'
    });
  }

  @PublicRoute()
  @Post('invitations/activate')
  activate(@Body() body: unknown, @Headers(CORRELATION_HEADER) correlationId: string): Promise<unknown> {
    const parsed = activateInvitationSchema.parse(body);
    return this.auth.activateInvitation({ token: parsed.token, password: parsed.password, correlationId });
  }

  @PublicRoute()
  @Post('password-reset/request')
  async requestReset(@Body() body: unknown, @Headers(CORRELATION_HEADER) correlationId: string): Promise<{ accepted: true }> {
    const parsed = passwordResetRequestSchema.parse(body);
    await this.auth.requestPasswordReset({ email: parsed.email, correlationId });
    return { accepted: true };
  }

  @PublicRoute()
  @Post('password-reset/complete')
  completeReset(@Body() body: unknown, @Headers(CORRELATION_HEADER) correlationId: string): Promise<unknown> {
    const parsed = passwordResetCompleteSchema.parse(body);
    return this.auth.completePasswordReset({ token: parsed.token, newPassword: parsed.newPassword, correlationId });
  }
}
