export function supportDispatchEnabled(): false {
  return false;
}

export function describeSupportIntentMode(): string {
  return 'Support intents are persisted only; real dispatch is disabled until UOW-08.';
}
