import { ProtectedAppShell } from '../../../features/shell/ProtectedAppShell';
import { ContactChangeQueuePage } from '../../../features/uow02';

const actorView = {
  permissions: ['uow02.contact.decide']
};

export default function Page() {
  return (
    <ProtectedAppShell actorView={actorView}>
      <ContactChangeQueuePage requests={[]} />
    </ProtectedAppShell>
  );
}
