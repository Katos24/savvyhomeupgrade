// ============================================================
// lib/permissions.ts
// Single source of truth for role-based and plan-based access.
// Update PLAN_CONFIG stripe price IDs when added in Stripe.
// ============================================================

export type UserRole = 'owner' | 'admin' | 'member';
export type PlanTier = 'basic' | 'pro' | 'business';

// ============================================================
// ROLE PERMISSIONS
// These check what a user can do based on their role,
// regardless of what plan the company is on.
// ============================================================

// ── Leads ────────────────────────────────────────────────────
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

// ── Team ─────────────────────────────────────────────────────
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
export function canRemoveOwner(_role: UserRole): boolean {
  return false;
}

// ── Company & settings ───────────────────────────────────────
export function canAccessCompanySettings(role: UserRole): boolean {
  return role === 'owner' || role === 'admin';
}
export function canDeleteCompany(role: UserRole): boolean {
  return role === 'owner';
}
export function canAccessPersonalSettings(_role: UserRole): boolean {
  return true;
}
export function canChangeOwnPassword(_role: UserRole): boolean {
  return true;
}
export function canToggleOwnNotifications(_role: UserRole): boolean {
  return true;
}

// ── Helpers ───────────────────────────────────────────────────
export function isAdminOrOwner(role: UserRole): boolean {
  return role === 'owner' || role === 'admin';
}
export function isOwner(role: UserRole): boolean {
  return role === 'owner';
}
export function isMember(role: UserRole): boolean {
  return role === 'member';
}

// ============================================================
// PLAN PERMISSIONS
// These check what features the company has access to based
// on their subscription plan. Use these everywhere in UI
// and API routes to gate features.
//
// Basic    → lead capture, board, photos, payment tracking
// Pro      → + pipeline, categories, scheduling, quotes,
//              one-click emails, outbox, CSV export,
//              customer video uploads, custom tasks & templates
// Business → + all AI features, daily digest
// ============================================================

// ── Customer form ─────────────────────────────────────────────
export function canCustomizeForm(plan: PlanTier): boolean {
  // All plans can toggle fields and set branding
  return true;
}
export function canEnableCustomerVideoUploads(plan: PlanTier): boolean {
  // Customer can attach video on the intake form
  return plan === 'pro' || plan === 'business';
}
export function canAddCustomFormQuestions(plan: PlanTier): boolean {
  return plan === 'pro' || plan === 'business';
}

// ── Lead board & pipeline ─────────────────────────────────────
export function canViewLeadBoard(plan: PlanTier): boolean {
  return true;
}
export function canCustomizePipeline(plan: PlanTier): boolean {
  // Add / rename / reorder pipeline stages
  return plan === 'pro' || plan === 'business';
}
export function canUseCategories(plan: PlanTier): boolean {
  // Job categories with linked tasks & quote templates
  return plan === 'pro' || plan === 'business';
}
export function canUseCustomTasks(plan: PlanTier): boolean {
  return plan === 'pro' || plan === 'business';
}

// ── Media ─────────────────────────────────────────────────────
export function canUploadPhotos(plan: PlanTier): boolean {
  // All plans — core feature
  return true;
}
export function canUploadDocs(plan: PlanTier): boolean {
  return true;
}

// ── Scheduling, quotes & payments ────────────────────────────
export function canUseScheduling(plan: PlanTier): boolean {
  return plan === 'pro' || plan === 'business';
}
export function canUseQuotes(plan: PlanTier): boolean {
  return plan === 'pro' || plan === 'business';
}
export function canUseCustomQuoteTemplates(plan: PlanTier): boolean {
  return plan === 'pro' || plan === 'business';
}
export function canTrackPayments(plan: PlanTier): boolean {
  // Basic gets payment status tracking, no quote builder
  return true;
}

// ── One-click emails & outbox ─────────────────────────────────
export function canSendOneClickEmails(plan: PlanTier): boolean {
  // Quote, schedule, payment reminder one-click sends
  return plan === 'pro' || plan === 'business';
}
export function canAccessOutbox(plan: PlanTier): boolean {
  return plan === 'pro' || plan === 'business';
}
export function canUseCustomEmailTemplates(plan: PlanTier): boolean {
  return plan === 'pro' || plan === 'business';
}

// ── Data export ───────────────────────────────────────────────
export function canExportCsv(plan: PlanTier): boolean {
  return plan === 'pro' || plan === 'business';
}

// ── AI features (Pro only) ────────────────────────────────────
export function canUseAiBrief(plan: PlanTier): boolean {
  return plan === 'business';
}
export function canUseAiQuoteGenerator(plan: PlanTier): boolean {
  return plan === 'business';
}
export function canUseAiChat(plan: PlanTier): boolean {
  return plan === 'business';
}
export function canUseAiPhotoAnalysis(plan: PlanTier): boolean {
  return plan === 'business';
}

// ── Daily digest (Pro only) ───────────────────────────────────
export function canUseDailyDigest(plan: PlanTier): boolean {
  return plan === 'business';
}

// ── Team members ──────────────────────────────────────────────
// No seat limits on any plan — upgrade path is features only
export function canAddTeamMembers(_plan: PlanTier): boolean {
  return true;
}
export function canManageRoles(plan: PlanTier): boolean {
  return plan === 'pro' || plan === 'business';
}

// ============================================================
// SETTINGS TAB PERMISSIONS
// Controls which settings tabs are accessible vs locked.
// Locked tabs are visible but show an upgrade overlay.
// ============================================================
export function canAccessSettingsTab(
  tab: SettingsTab,
  plan: PlanTier
): boolean {
  switch (tab) {
    case 'company':
    case 'customer-form':
    case 'billing':
      return true;
    case 'pipeline':
    case 'categories':
    case 'email-templates':
      return plan === 'pro' || plan === 'business';
    case 'daily-digest':
      return plan === 'business';
    default:
      return false;
  }
}

export type SettingsTab =
  | 'company'
  | 'customer-form'
  | 'pipeline'
  | 'categories'
  | 'email-templates'
  | 'daily-digest'
  | 'billing';

// ============================================================
// UPGRADE PROMPTS
// Used in lock overlays and API error responses.
// ============================================================
export const UPGRADE_PROMPTS: Record<string, { title: string; description: string; requiredPlan: PlanTier }> = {
  pipeline: {
    title: 'Customize your pipeline',
    description: 'Add, rename, and reorder your board stages to match your exact workflow.',
    requiredPlan: 'business',
  },
  categories: {
    title: 'Job categories & templates',
    description: 'Organize leads by job type and auto-load tasks and quote templates for each category.',
    requiredPlan: 'business',
  },
  email_templates: {
    title: 'Custom email templates',
    description: 'Personalize your quote, schedule, and payment reminder emails with your own copy.',
    requiredPlan: 'business',
  },
  one_click_emails: {
    title: 'One-click emails',
    description: 'Send quotes, schedules, and payment reminders in one click — tracked in your outbox.',
    requiredPlan: 'business',
  },
  csv_export: {
    title: 'CSV export',
    description: 'Download all your leads and job data for bookkeeping and reporting.',
    requiredPlan: 'business',
  },
  customer_video: {
    title: 'Customer video uploads',
    description: 'Let customers attach photos and videos directly on your intake form.',
    requiredPlan: 'business',
  },
  scheduling: {
    title: 'Job scheduling',
    description: 'Schedule jobs and send confirmation emails to customers in one click.',
    requiredPlan: 'business',
  },
  quotes: {
    title: 'Quotes & templates',
    description: 'Build and send professional quotes with custom line item templates.',
    requiredPlan: 'business',
  },
  ai_brief: {
    title: 'AI brief',
    description: 'Get an instant AI-generated summary of every lead — saved and ready on each card.',
    requiredPlan: 'business',
  },
  ai_quote: {
    title: 'AI quote generator',
    description: 'Let AI draft a quote based on the job details and your templates.',
    requiredPlan: 'business',
  },
  ai_chat: {
    title: 'AI assistant',
    description: 'Chat with AI about any lead — ask questions, get suggestions, draft messages.',
    requiredPlan: 'business',
  },
  ai_photo: {
    title: 'AI photo analysis',
    description: 'AI reads job site photos and surfaces damage, scope, and material insights.',
    requiredPlan: 'business',
  },
  daily_digest: {
    title: 'Daily digest',
    description: 'Get a morning email summary of all open leads, follow-ups, and scheduled jobs.',
    requiredPlan: 'business',
  },
};

// ============================================================
// ROLE ERROR MESSAGES
// ============================================================
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

// ============================================================
// PLAN METADATA
// Used on pricing page, upgrade prompts, and billing tab.
// Add Stripe price IDs when created in Stripe dashboard.
// ============================================================
export const PLAN_CONFIG = {
  basic: {
    label: 'Basic',
    price: 29,
    description: 'Lead capture and tracking for solo contractors',
    stripePriceId: 'price_XXXX_basic', // TODO: replace with live Stripe price ID
    features: [
      'Custom QR code & intake form',
      'Lead board (kanban view)',
      'Photo & doc uploads on cards',
      'Payment status tracking',
      'Unlimited team members',
      'Form branding (logo & colors)',
    ],
  },
  pro: {
    label: 'Pro',
    price: 69,
    description: 'Full workflow management for growing crews',
    stripePriceId: 'price_XXXX_pro', // TODO: replace with live Stripe price ID
    features: [
      'Everything in Basic',
      'Custom pipeline stages',
      'Job categories, tasks & quote templates',
      'Job scheduling',
      'Quote builder',
      'One-click emails (quote, schedule, reminder)',
      'Outbox — full sent email history',
      'Custom email templates',
      'Customer photo & video uploads',
      'CSV export for bookkeeping',
    ],
  },
  business: {
    label: 'Business',
    price: 109,
    description: 'AI-powered tools for closing more jobs',
    stripePriceId: 'price_XXXX_business', // TODO: add in Stripe, then replace
    features: [
      'Everything in Pro',
      'AI brief on every lead',
      'AI quote generator',
      'AI assistant chat',
      'AI photo & text analysis',
      'Daily digest email',
    ],
  },
} as const;

// ============================================================
// UTILITY — check if a plan meets a minimum requirement
// Usage: planMeetsRequirement(company.plan, 'pro')
// ============================================================
export function planMeetsRequirement(
  userPlan: PlanTier,
  requiredPlan: PlanTier
): boolean {
  const order: PlanTier[] = ['basic', 'pro', 'business'];
  return order.indexOf(userPlan) >= order.indexOf(requiredPlan);
}