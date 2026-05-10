import { Injectable, NestMiddleware } from '@nestjs/common';
import { createCorrelationId } from '@hoa/shared';
import type { NextFunction, Request, Response } from 'express';

export const CORRELATION_HEADER = 'x-correlation-id';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.header(CORRELATION_HEADER);
    const correlationId = incoming && /^[A-Za-z0-9_-]{8,120}$/.test(incoming)
      ? incoming
      : createCorrelationId();
    req.headers[CORRELATION_HEADER] = correlationId;
    res.setHeader(CORRELATION_HEADER, correlationId);
    next();
  }
}
