// Permission helper functions for role-based access control
export type UserRole = 'owner' | 'admin' | 'member';
export type PlanTier = 'basic' | 'pro' | 'business';

// ==========================================
// LEAD PERMISSIONS
// ==========================================
export function canViewLeads(role: UserRole): boolean {
  return true;
}
export function canAddNotes(role: UserRole): boolean {
  return true;
}
export function canUpdateLeadStatus(role: UserRole): boolean {
  return true;
}
export function canDeleteLead(role: UserRole): boolean {
  return role === 'owner' || role === 'admin';
}
export function canConvertToProject(role: UserRole): boolean {
  return role === 'owner' || role === 'admin';
}
export function canRestoreDeletedLead(role: UserRole): boolean {
  return role === 'owner' || role === 'admin';
}

// ==========================================
// TEAM PERMISSIONS
// ==========================================
export function canAccessTeamPage(role: UserRole): boolean {
  return role === 'owner' || role === 'admin';
}
export function canInviteMembers(role: UserRole): boolean {
  return role === 'owner' || role === 'admin';
}
export function canRemoveMembers(role: UserRole): boolean {
  return role === 'owner' || role === 'admin';
}
export function canChangeRoles(role: UserRole): boolean {
  return role === 'owner' || role === 'admin';
}
export function canRemoveOwner(role: UserRole): boolean {
  return false;
}

// ==========================================
// COMPANY PERMISSIONS
// ==========================================
export function canAccessCompanySettings(role: UserRole): boolean {
  return role === 'owner' || role === 'admin';
}
export function canDeleteCompany(role: UserRole): boolean {
  return role === 'owner';
}

// ==========================================
// PERSONAL PERMISSIONS
// ==========================================
export function canAccessPersonalSettings(role: UserRole): boolean {
  return true;
}
export function canChangeOwnPassword(role: UserRole): boolean {
  return true;
}
export function canToggleOwnNotifications(role: UserRole): boolean {
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
// PERMISSION ERROR MESSAGES (role-based)
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

// ==========================================
// PLAN PERMISSIONS
// ==========================================

// ── Projects & job management ──────────────
export function canUseProjects(plan: PlanTier): boolean {
  // Basic = lead tracking only, no projects
  return plan === 'pro' || plan === 'business';
}
export function canUseQuotes(plan: PlanTier): boolean {
  return plan === 'pro' || plan === 'business';
}
export function canUsePayments(plan: PlanTier): boolean {
  return plan === 'pro' || plan === 'business';
}
export function canUseTasks(plan: PlanTier): boolean {
  return plan === 'pro' || plan === 'business';
}
export function canUseScheduling(plan: PlanTier): boolean {
  return plan === 'pro' || plan === 'business';
}
export function canUseDocs(plan: PlanTier): boolean {
  return plan === 'pro' || plan === 'business';
}
export function canUsePhotos(plan: PlanTier): boolean {
  return plan === 'pro' || plan === 'business';
}

// ── AI features ───────────────────────────
export function canUseAiBrief(plan: PlanTier): boolean {
  return plan === 'pro' || plan === 'business';
}
export function canUseAiChat(plan: PlanTier): boolean {
  return plan === 'pro' || plan === 'business';
}
export function canUseRepeatCustomerDetection(plan: PlanTier): boolean {
  return plan === 'pro' || plan === 'business';
}

// ── Team ──────────────────────────────────
export function getMaxTeamMembers(plan: PlanTier): number {
  if (plan === 'business') return 5;
  return 1; // basic + pro = solo only
}
export function canAddTeamMembers(plan: PlanTier): boolean {
  return plan === 'business';
}

// ── Customization ─────────────────────────
export function canUseCustomStatuses(plan: PlanTier): boolean {
  return plan === 'business';
}
export function canUseCustomFormQuestions(plan: PlanTier): boolean {
  return plan === 'business';
}

// ── Data ──────────────────────────────────
export function canExportCsv(plan: PlanTier): boolean {
  // All plans can export — contractors own their data
  return true;
}

// ==========================================
// PLAN UPGRADE MESSAGES
// ==========================================
export const PLAN_ERRORS = {
  PROJECTS_LOCKED:     'Projects are available on Pro and Business plans',
  QUOTES_LOCKED:       'Quotes & payments are available on Pro and Business plans',
  AI_LOCKED:           'AI features are available on Pro and Business plans',
  TEAM_LOCKED:         'Additional team members are available on the Business plan',
  CUSTOM_LOCKED:       'Custom statuses and form questions are available on the Business plan',
  SCHEDULING_LOCKED:   'Scheduling is available on Pro and Business plans',
};

// ==========================================
// PLAN METADATA (for UI — pricing page, upgrade prompts)
// ==========================================
export const PLAN_CONFIG = {
  basic: {
    label: 'Basic',
    price: 49,
    description: 'Lead tracking for solo contractors',
    features: [
      'Unlimited leads',
      'Cards + table view',
      'Status management',
      'CSV export',
      'Customer contact actions',
    ],
  },
  pro: {
    label: 'Pro',
    price: 99,
    description: 'Full job management with AI',
    features: [
      'Everything in Basic',
      'Convert leads to projects',
      'Quotes & payments',
      'Tasks & scheduling',
      'Docs & photos',
      'AI Brief on every job',
      'AI Assistant chat',
      'Repeat customer detection',
    ],
  },
  business: {
    label: 'Business',
    price: 149,
    description: 'For contractors with a crew',
    features: [
      'Everything in Pro',
      'Up to 5 team members',
      'Custom status options',
      'Custom form questions',
      'Priority support',
    ],
  },
} as const;