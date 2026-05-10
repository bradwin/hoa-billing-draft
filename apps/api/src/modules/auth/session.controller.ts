import { Body, Controller, Headers, Post } from '@nestjs/common';
import { z } from 'zod';
import { CORRELATION_HEADER } from '../../common/correlation.middleware';
import { AuthService } from './auth.service';

const logoutSchema = z.object({ sessionToken: z.string().min(32).max(512) });

@Controller('auth')
export class SessionController {
  constructor(private readonly auth: AuthService) {}

  @Post('logout')
  async logout(@Body() body: unknown, @Headers(CORRELATION_HEADER) correlationId: string): Promise<{ ok: true }> {
    const parsed = logoutSchema.parse(body);
    await this.auth.logout(parsed.sessionToken, correlationId);
    return { ok: true };
  }
}
