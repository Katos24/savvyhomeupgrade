// Permission helper functions for role-based access control

export type UserRole = 'owner' | 'admin' | 'member';

// ==========================================
// LEAD PERMISSIONS
// ==========================================

export function canViewLeads(role: UserRole): boolean {
  // Everyone can view leads
  return true;
}

export function canAddNotes(role: UserRole): boolean {
  // Everyone can add notes
  return true;
}

export function canUpdateLeadStatus(role: UserRole): boolean {
  // Everyone can update status
  return true;
}

export function canDeleteLead(role: UserRole): boolean {
  // Only owner and admin can delete
  return role === 'owner' || role === 'admin';
}

export function canConvertToProject(role: UserRole): boolean {
  // Only owner and admin can convert to project
  return role === 'owner' || role === 'admin';
}

export function canRestoreDeletedLead(role: UserRole): boolean {
  // Only owner and admin can restore deleted leads
  return role === 'owner' || role === 'admin';
}

// ==========================================
// TEAM PERMISSIONS
// ==========================================

export function canAccessTeamPage(role: UserRole): boolean {
  // Only owner and admin can access team management
  return role === 'owner' || role === 'admin';
}

export function canInviteMembers(role: UserRole): boolean {
  // Only owner and admin can invite
  return role === 'owner' || role === 'admin';
}

export function canRemoveMembers(role: UserRole): boolean {
  // Only owner and admin can remove members
  return role === 'owner' || role === 'admin';
}

export function canChangeRoles(role: UserRole): boolean {
  // Only owner and admin can change roles
  return role === 'owner' || role === 'admin';
}

export function canRemoveOwner(role: UserRole): boolean {
  // Nobody can remove the owner
  return false;
}

// ==========================================
// COMPANY PERMISSIONS
// ==========================================

export function canAccessCompanySettings(role: UserRole): boolean {
  // Only owner and admin can access company settings
  return role === 'owner' || role === 'admin';
}

export function canDeleteCompany(role: UserRole): boolean {
  // Only owner can delete company
  return role === 'owner';
}

// ==========================================
// PERSONAL PERMISSIONS
// ==========================================

export function canAccessPersonalSettings(role: UserRole): boolean {
  // Everyone can access their own settings
  return true;
}

export function canChangeOwnPassword(role: UserRole): boolean {
  // Everyone can change their own password
  return true;
}

export function canToggleOwnNotifications(role: UserRole): boolean {
  // Everyone can toggle their own notifications
  return true;
}

// ==========================================
// HELPER: Check if user is admin or higher
// ==========================================

export function isAdminOrOwner(role: UserRole): boolean {
  return role === 'owner' || role === 'admin';
}

export function isOwner(role: UserRole): boolean {
  return role === 'owner';
}

export function isMember(role: UserRole): boolean {
  return role === 'member';
}

// ==========================================
// PERMISSION ERROR MESSAGES
// ==========================================

export const PERMISSION_ERRORS = {
  NOT_AUTHORIZED: 'You are not authorized to perform this action',
  ADMIN_ONLY: 'This action requires admin privileges',
  OWNER_ONLY: 'This action can only be performed by the company owner',
  CANNOT_DELETE_LEAD: 'Members cannot delete leads',
  CANNOT_ACCESS_TEAM: 'Members cannot access team management',
  CANNOT_INVITE: 'Members cannot invite team members',
  CANNOT_REMOVE: 'Members cannot remove team members',
  CANNOT_CHANGE_ROLES: 'Members cannot change user roles',
  CANNOT_DELETE_COMPANY: 'Only the owner can delete the company',
};