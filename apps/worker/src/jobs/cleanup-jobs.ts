export interface CleanupCandidate {
  id: string;
  expiresAt?: Date;
  status: string;
}

export function selectExpiredSessions(candidates: readonly CleanupCandidate[], now = new Date()): CleanupCandidate[] {
  return candidates.filter((candidate) => candidate.status !== 'Revoked' && candidate.expiresAt && candidate.expiresAt <= now);
}

export function selectExpiredInvitations(candidates: readonly CleanupCandidate[], now = new Date()): CleanupCandidate[] {
  return candidates.filter((candidate) => candidate.status === 'Pending' && candidate.expiresAt && candidate.expiresAt <= now);
}

export function selectExpiredResetRequests(candidates: readonly CleanupCandidate[], now = new Date()): CleanupCandidate[] {
  return candidates.filter((candidate) => candidate.status === 'Pending' && candidate.expiresAt && candidate.expiresAt <= now);
}
