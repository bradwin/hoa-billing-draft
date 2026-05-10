import { Body, Controller, Headers, Post } from '@nestjs/common';
import { mfaChallengeSchema } from '@hoa/shared';
import { CORRELATION_HEADER } from '../../common/correlation.middleware';
import { MfaService } from './mfa.service';

@Controller('auth/mfa')
export class MfaController {
  constructor(private readonly mfa: MfaService) {}

  @Post('challenge')
  async challenge(@Body() body: unknown, @Headers(CORRELATION_HEADER) correlationId: string): Promise<{ accepted: boolean; correlationId: string }> {
    mfaChallengeSchema.parse(body);
    return { accepted: false, correlationId };
  }
}
