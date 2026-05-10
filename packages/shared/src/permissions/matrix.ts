import { Permissions, type Permission } from './permissions';
import { Roles, type Role } from './roles';

const MATRIX: Record<Role, readonly Permission[]> = {
  [Roles.SystemAdministrator]: [
    Permissions.USER_INVITE,
    Permissions.USER_READ,
    Permissions.SETTINGS_READ,
    Permissions.SETTINGS_UPDATE_HOA_PROFILE,
    Permissions.AUDIT_SECURITY_READ,
    Permissions.AUDIT_OPERATIONAL_READ,
    Permissions.SUPPORT_INTENT_READ,
    Permissions.SUPPORT_INTENT_CREATE,
    Permissions.UOW02_HOMEOWNER_MANAGE,
    Permissions.UOW02_HOMEOWNER_READ,
    Permissions.UOW02_PROPERTY_MANAGE,
    Permissions.UOW02_PROPERTY_READ,
    Permissions.UOW02_OWNERSHIP_MANAGE,
    Permissions.UOW02_CONTACT_DECIDE,
    Permissions.UOW03_CONFIG_READ,
    Permissions.UOW03_CONFIG_MANAGE,
    Permissions.UOW03_CONFIG_ACTIVATE,
    Permissions.UOW04_INVOICE_READ,
    Permissions.UOW04_INVOICE_MANAGE,
    Permissions.UOW04_INVOICE_ISSUE,
    Permissions.UOW04_INVOICE_LIFECYCLE,
    Permissions.UOW04_INVOICE_SUPPORT_INTENT
  ],
  [Roles.Treasurer]: [
    Permissions.SETTINGS_READ,
    Permissions.AUDIT_SECURITY_READ,
    Permissions.AUDIT_OPERATIONAL_READ,
    Permissions.APPROVAL_QUEUE_READ,
    Permissions.APPROVAL_DECIDE,
    Permissions.SUPPORT_INTENT_READ,
    Permissions.UOW02_HOMEOWNER_READ,
    Permissions.UOW02_PROPERTY_READ,
    Permissions.UOW03_CONFIG_READ,
    Permissions.UOW03_CONFIG_ACTIVATE,
    Permissions.UOW04_INVOICE_READ,
    Permissions.UOW04_INVOICE_ISSUE,
    Permissions.UOW04_INVOICE_LIFECYCLE
  ],
  [Roles.BillingStaff]: [
    Permissions.AUDIT_OPERATIONAL_READ,
    Permissions.APPROVAL_REQUEST_CREATE,
    Permissions.SUPPORT_INTENT_CREATE,
    Permissions.UOW02_HOMEOWNER_MANAGE,
    Permissions.UOW02_HOMEOWNER_READ,
    Permissions.UOW02_PROPERTY_MANAGE,
    Permissions.UOW02_PROPERTY_READ,
    Permissions.UOW02_OWNERSHIP_MANAGE,
    Permissions.UOW02_CONTACT_DECIDE,
    Permissions.UOW03_CONFIG_READ,
    Permissions.UOW03_CONFIG_MANAGE,
    Permissions.UOW04_INVOICE_READ,
    Permissions.UOW04_INVOICE_MANAGE,
    Permissions.UOW04_INVOICE_ISSUE,
    Permissions.UOW04_INVOICE_SUPPORT_INTENT
  ],
  [Roles.BoardMember]: [
    Permissions.AUDIT_OPERATIONAL_READ,
    Permissions.UOW02_HOMEOWNER_READ,
    Permissions.UOW02_PROPERTY_READ,
    Permissions.UOW03_CONFIG_READ,
    Permissions.UOW04_INVOICE_READ
  ],
  [Roles.Homeowner]: [
    Permissions.HOMEOWNER_SELF_READ,
    Permissions.UOW04_INVOICE_READ
  ]
};

export function listPermissionsForRole(role: Role): readonly Permission[] {
  return MATRIX[role] ?? [];
}

export function hasPermission(role: string, permission: string): boolean {
  if (!Object.values(Roles).includes(role as Role)) return false;
  if (!Object.values(Permissions).includes(permission as Permission)) return false;
  return MATRIX[role as Role].includes(permission as Permission);
}
