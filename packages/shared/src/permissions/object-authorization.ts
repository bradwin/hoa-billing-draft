import type { ActorContext, ResourceRef } from '../kernel/types';
import { Roles } from './roles';

export interface ObjectAuthorizationInput {
  actor: ActorContext;
  resource: ResourceRef;
  action: string;
  ownershipRefs?: readonly string[];
}

export interface ObjectAuthorizationResult {
  allowed: boolean;
  reasonCode: 'ALLOWED' | 'MISSING_OWNERSHIP' | 'UNKNOWN_RESOURCE' | 'DENIED_BY_ROLE';
}

export function authorizeObject(input: ObjectAuthorizationInput): ObjectAuthorizationResult {
  if (!input.resource.resourceType || !input.resource.resourceId) {
    return { allowed: false, reasonCode: 'UNKNOWN_RESOURCE' };
  }
  if (input.actor.role === Roles.SystemAdministrator || input.actor.role === Roles.Treasurer) {
    return { allowed: true, reasonCode: 'ALLOWED' };
  }
  if (input.actor.role === Roles.Homeowner) {
    const homeownerId = input.actor.homeownerId;
    if (!homeownerId || !input.ownershipRefs?.includes(homeownerId)) {
      return { allowed: false, reasonCode: 'MISSING_OWNERSHIP' };
    }
    return { allowed: true, reasonCode: 'ALLOWED' };
  }
  return { allowed: false, reasonCode: 'DENIED_BY_ROLE' };
}
