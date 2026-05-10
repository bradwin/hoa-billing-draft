export const Roles = {
  SystemAdministrator: 'SystemAdministrator',
  Treasurer: 'Treasurer',
  BillingStaff: 'BillingStaff',
  BoardMember: 'BoardMember',
  Homeowner: 'Homeowner'
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

export function isRole(value: string): value is Role {
  return Object.values(Roles).includes(value as Role);
}

export function roleRequiresMfa(role: Role): boolean {
  return role === Roles.SystemAdministrator || role === Roles.Treasurer;
}
