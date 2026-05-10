import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Permissions } from '@hoa/shared';
import { RoleAwareNavigation } from '../../src/features/shell/RoleAwareNavigation';

describe('RoleAwareNavigation', () => {
  it('does not display command items absent from server permissions', () => {
    render(<RoleAwareNavigation actorView={{ permissions: [Permissions.AUDIT_OPERATIONAL_READ] }} />);
    expect(screen.getByText('Audit')).toBeInTheDocument();
    expect(screen.queryByText('Invite user')).not.toBeInTheDocument();
  });
});
