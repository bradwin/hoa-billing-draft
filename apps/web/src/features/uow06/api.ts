export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
}

export interface AgingView {
  id: string;
  invoiceId: string;
  billingAccountId: string;
  evaluationDate: string;
  openAmount: string;
  overdue: boolean;
  firstOverdueDate?: string;
  agingDayCount: number;
  agingBucket: 'Current' | '1-30' | '31-60' | '61-90' | '90+';
}

export interface PenaltyView {
  id: string;
  status: 'Draft' | 'Applied' | 'Voided' | 'Reissued';
  invoiceId: string;
  responsibleBillingAccountId: string;
  penaltyPeriodKey: string;
  basisAmount: string;
  penaltyAmount: string;
}

export interface ReminderEligibilityView {
  id: string;
  reminderScopeType: string;
  reminderScopeId: string;
  reminderPeriodKey: string;
  suppressed: boolean;
  suppressionReason?: string;
}

export function delinquencyStateSeparationLabel(): string {
  return 'Overdue, aging, penalty, waiver, and reminder states are tracked separately.';
}

export function penaltyStatusLabel(status: PenaltyView['status']): string {
  return `Penalty: ${status}`;
}

export async function listAging(evaluationDate: string): Promise<PageResult<AgingView>> {
  const response = await fetch(`/api/delinquency/aging?evaluationDate=${encodeURIComponent(evaluationDate)}`, { credentials: 'include' });
  if (!response.ok) throw new Error('Unable to load aging data');
  return response.json() as Promise<PageResult<AgingView>>;
}

export async function listPenalties(): Promise<PageResult<PenaltyView>> {
  const response = await fetch('/api/delinquency/penalties', { credentials: 'include' });
  if (!response.ok) throw new Error('Unable to load penalties');
  return response.json() as Promise<PageResult<PenaltyView>>;
}
