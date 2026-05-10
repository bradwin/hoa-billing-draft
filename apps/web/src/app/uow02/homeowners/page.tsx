import { ProtectedAppShell } from '../../../features/shell/ProtectedAppShell';
import { HomeownerSearchPage } from '../../../features/uow02';

const actorView = {
  permissions: ['uow02.homeowner.read']
};

export default function Page() {
  return (
    <ProtectedAppShell actorView={actorView}>
      <HomeownerSearchPage result={{ items: [], page: 1, pageSize: 25, totalItems: 0 }} />
    </ProtectedAppShell>
  );
}
