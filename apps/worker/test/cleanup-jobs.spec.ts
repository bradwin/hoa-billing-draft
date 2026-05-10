import { selectExpiredInvitations, selectExpiredResetRequests, selectExpiredSessions } from '../src/jobs/cleanup-jobs';

describe('cleanup job selection', () => {
  const now = new Date('2026-01-01T00:00:00Z');

  it('selects expired active sessions', () => {
    expect(selectExpiredSessions([{ id: 's1', status: 'Active', expiresAt: now }], now)).toHaveLength(1);
    expect(selectExpiredSessions([{ id: 's2', status: 'Revoked', expiresAt: now }], now)).toHaveLength(0);
  });

  it('selects only pending expired invitations and reset requests', () => {
    expect(selectExpiredInvitations([{ id: 'i1', status: 'Pending', expiresAt: now }], now)).toHaveLength(1);
    expect(selectExpiredResetRequests([{ id: 'r1', status: 'Consumed', expiresAt: now }], now)).toHaveLength(0);
  });
});
