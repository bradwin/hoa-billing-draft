export const Permissions = {
  USER_INVITE: 'user.invite',
  USER_READ: 'user.read',
  SETTINGS_READ: 'settings.read',
  SETTINGS_UPDATE_HOA_PROFILE: 'settings.update_hoa_profile',
  AUDIT_SECURITY_READ: 'audit.security.read',
  AUDIT_OPERATIONAL_READ: 'audit.operational.read',
  APPROVAL_QUEUE_READ: 'approval.queue.read',
  APPROVAL_REQUEST_CREATE: 'approval.request.create',
  APPROVAL_DECIDE: 'approval.decide',
  SUPPORT_INTENT_READ: 'support_intent.read',
  SUPPORT_INTENT_CREATE: 'support_intent.create',
  HOMEOWNER_SELF_READ: 'homeowner.self.read',
  UOW02_HOMEOWNER_MANAGE: 'uow02.homeowner.manage',
  UOW02_HOMEOWNER_READ: 'uow02.homeowner.read',
  UOW02_PROPERTY_MANAGE: 'uow02.property.manage',
  UOW02_PROPERTY_READ: 'uow02.property.read',
  UOW02_OWNERSHIP_MANAGE: 'uow02.ownership.manage',
  UOW02_CONTACT_DECIDE: 'uow02.contact.decide',
  UOW03_CONFIG_READ: 'uow03.config.read',
  UOW03_CONFIG_MANAGE: 'uow03.config.manage',
  UOW03_CONFIG_ACTIVATE: 'uow03.config.activate',
  UOW04_INVOICE_READ: 'uow04.invoice.read',
  UOW04_INVOICE_MANAGE: 'uow04.invoice.manage',
  UOW04_INVOICE_ISSUE: 'uow04.invoice.issue',
  UOW04_INVOICE_LIFECYCLE: 'uow04.invoice.lifecycle',
  UOW04_INVOICE_SUPPORT_INTENT: 'uow04.invoice.support_intent'
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

export function isPermission(value: string): value is Permission {
  return Object.values(Permissions).includes(value as Permission);
}
