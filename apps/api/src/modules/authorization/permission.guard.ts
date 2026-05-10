import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type ActorContext, type Permission } from '@hoa/shared';
import { CORRELATION_HEADER } from '../../common/correlation.middleware';
import { PUBLIC_ROUTE_KEY } from './public-route.decorator';
import { REQUIRED_PERMISSION_KEY } from './require-permission.decorator';
import { AuthorizationService } from './authorization.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorization: AuthorizationService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const actor = request.actor as ActorContext | undefined;
    const correlationId = request.headers?.[CORRELATION_HEADER] ?? 'unknown';
    const permission = this.reflector.getAllAndOverride<Permission>(REQUIRED_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!actor || !permission || !this.authorization.can(actor, permission)) {
      await this.authorization.deny(actor, 'AUTHZ.ROUTE_DENIED', correlationId, 'Missing permission');
      return false;
    }
    return true;
  }
}
