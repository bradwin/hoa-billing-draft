import { ProtectedAppShell } from '../../../features/shell/ProtectedAppShell';
import { PropertySearchPage } from '../../../features/uow02';

const actorView = {
  permissions: ['uow02.property.read']
};

export default function Page() {
  return (
    <ProtectedAppShell actorView={actorView}>
      <PropertySearchPage result={{ items: [], page: 1, pageSize: 25, totalItems: 0 }} />
    </ProtectedAppShell>
  );
}
