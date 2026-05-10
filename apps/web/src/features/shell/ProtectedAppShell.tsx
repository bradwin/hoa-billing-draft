import type { ReactNode } from 'react';
import type { ActorView } from './actor-context';
import { RoleAwareNavigation } from './RoleAwareNavigation';

export function ProtectedAppShell({ actorView, children }: { actorView: ActorView; children: ReactNode }) {
  return (
    <div data-testid="app-protected-shell" className="app-shell">
      <header>
        <h1>HOA Billing</h1>
        <p>{actorView.actor?.role ?? 'Unauthenticated'}</p>
      </header>
      <RoleAwareNavigation actorView={actorView} />
      <main>{children}</main>
    </div>
  );
}
