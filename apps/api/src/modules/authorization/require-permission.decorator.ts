import { SetMetadata } from '@nestjs/common';
import type { Permission } from '@hoa/shared';

export const REQUIRED_PERMISSION_KEY = 'requiredPermission';
export const RequirePermission = (permission: Permission) => SetMetadata(REQUIRED_PERMISSION_KEY, permission);
