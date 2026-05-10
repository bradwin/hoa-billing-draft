import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { CORRELATION_HEADER } from './correlation.middleware';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();
    const request = host.switchToHttp().getRequest();
    const correlationId = request.headers?.[CORRELATION_HEADER] ?? 'unknown';
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const code = exception instanceof HttpException ? 'REQUEST_FAILED' : 'SYSTEM_UNEXPECTED';

    response.status(status).json({
      code,
      message: status === HttpStatus.INTERNAL_SERVER_ERROR ? 'Unexpected system error' : 'Request failed',
      correlationId
    });
  }
}
