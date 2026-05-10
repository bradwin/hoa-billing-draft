import { Permissions } from '@hoa/shared';
import { canShowCommand, type ActorView } from './actor-context';

export function RoleAwareNavigation({ actorView }: { actorView: ActorView }) {
  return (
    <nav data-testid="app-role-navigation" aria-label="Primary">
      <a href="/settings">Settings</a>
      {canShowCommand(actorView, Permissions.AUDIT_OPERATIONAL_READ) ? <a href="/audit">Audit</a> : null}
      {canShowCommand(actorView, Permissions.APPROVAL_QUEUE_READ) ? <a href="/approvals">Approvals</a> : null}
      {canShowCommand(actorView, Permissions.USER_INVITE) ? <a href="/users/invite">Invite user</a> : null}
    </nav>
  );
}
