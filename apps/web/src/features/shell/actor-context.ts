import type { ActorContext } from '@hoa/shared';

export interface ActorView {
  actor?: ActorContext;
  permissions: readonly string[];
}

export function canShowCommand(actorView: ActorView, permission: string): boolean {
  return actorView.permissions.includes(permission);
}
