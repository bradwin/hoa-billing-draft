import type { ReminderDuplicateKey } from './types';

export function reminderDuplicateKey(input: ReminderDuplicateKey): string {
  return [input.reminderScopeType, input.reminderScopeId, input.reminderPeriodKey].join('|');
}

export function shouldSuppressReminder(input: { duplicateExists: boolean; hasAuthorizedContactPath: boolean }): boolean {
  return input.duplicateExists || !input.hasAuthorizedContactPath;
}
