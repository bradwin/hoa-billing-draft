export function normalizeSearchText(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

export function normalizeCompactKey(input: string): string {
  return normalizeSearchText(input).replace(/[^A-Z0-9]/g, '');
}

export function normalizeEmailKey(input: string): string {
  return input.trim().toLowerCase();
}

export function normalizePhoneKey(input: string): string {
  return input.replace(/\D/g, '');
}

export interface PropertyIdentityInput {
  phaseOrSection: string;
  block: string;
  lot: string;
  street: string;
}

export function buildPropertyIdentityKey(input: PropertyIdentityInput): string {
  return [
    normalizeCompactKey(input.phaseOrSection),
    normalizeCompactKey(input.block),
    normalizeCompactKey(input.lot),
    normalizeCompactKey(input.street)
  ].join('|');
}

export function buildHomeownerNameKey(legalName: string): string {
  return normalizeSearchText(legalName);
}
