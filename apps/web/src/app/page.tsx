import { ProtectedAppShell } from '../features/shell/ProtectedAppShell';

const actorView = {
  permissions: []
};

export default function Page() {
  return (
    <ProtectedAppShell actorView={actorView}>
      <p>Foundation shell ready.</p>
    </ProtectedAppShell>
  );
}
