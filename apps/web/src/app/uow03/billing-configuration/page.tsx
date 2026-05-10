import { ProtectedAppShell } from '../../../features/shell/ProtectedAppShell';
import { BillingConfigurationPage } from '../../../features/uow03';

const actorView = {
  permissions: ['uow03.config.read', 'uow03.config.manage']
};

export default function Page() {
  return (
    <ProtectedAppShell actorView={actorView}>
      <BillingConfigurationPage />
    </ProtectedAppShell>
  );
}
