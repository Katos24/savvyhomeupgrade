// ============================================================
// lib/permissions.ts
// ============================================================
// THE ONLY FILE YOU NEED TO EDIT for plan/feature changes.
//
// To move a feature between plans:
//   Change its entry in FEATURE_PLAN_MAP below. Done.
//
// To add a new feature:
//   1. Add a key to FEATURE_PLAN_MAP
//   2. Add upgrade copy to UPGRADE_PROMPTS
//   Components call can('your_key') — no other changes needed.
//
// To change pricing:
//   Update PLAN_CONFIG prices. Done.
// ============================================================

// ── Plan types ────────────────────────────────────────────────
export type PlanTier = 'basic' | 'pro';
export type UserRole = 'owner' | 'admin' | 'member';

export const PLAN_ORDER: PlanTier[] = ['basic', 'pro'];

export function planMeetsRequirement(
  userPlan: PlanTier,
  requiredPlan: PlanTier
): boolean {
  return PLAN_ORDER.indexOf(userPlan) >= PLAN_ORDER.indexOf(requiredPlan);
}

// ── Feature → minimum plan map ────────────────────────────────
// THIS is the single source of truth for what each plan gets.
// Change a value here — it propagates everywhere automatically.
export const FEATURE_PLAN_MAP = {
  // ── Customer form ──────────────────────────────────────────
  customize_form:           'basic',
  customer_video_upload:    'pro',   // customer attaches photos/video on form
  custom_form_questions:    'pro',   // add your own questions to form

  // ── Lead board ─────────────────────────────────────────────
  lead_board:               'basic',
  photos_on_card:           'basic',
  docs_on_card:             'basic',
  payment_tracking:         'basic',
  custom_pipeline:          'pro',   // add/rename/reorder board stages
  categories:               'pro',   // job categories with task templates
  custom_tasks:             'pro',   // default task lists per category
  csv_export:               'pro',   // download leads for bookkeeping

  // ── Scheduling, quotes & payments ──────────────────────────
  scheduling:               'pro',
  quotes:                   'pro',
  quote_templates:          'pro',
  send_quote_email:         'pro',
  send_schedule_email:      'pro',
  send_payment_reminder:    'pro',

  // ── Outbox & email templates ───────────────────────────────
  outbox:                   'pro',
  email_templates:          'pro',

  // ── AI features ────────────────────────────────────────────
  ai_brief:                 'pro',
  ai_quote:                 'pro',
  ai_chat:                  'pro',
  ai_photo_analysis:        'pro',

  // ── Notifications ──────────────────────────────────────────
  daily_digest:             'pro',

  // ── Team & admin ───────────────────────────────────────────
  team_members:             'basic',
  role_permissions:         'pro',

  // ── Settings tabs ──────────────────────────────────────────
  settings_company:         'basic',
  settings_form:            'basic',
  settings_billing:         'basic',
  settings_team:            'basic',
  settings_pipeline:        'pro',
  settings_categories:      'pro',
  settings_email_templates: 'pro',
  settings_notifications:   'pro',
} as const;

export type FeatureKey = keyof typeof FEATURE_PLAN_MAP;

// ── Core permission check ─────────────────────────────────────
// Use this everywhere. Never hardcode plan names in components.
export function can(userPlan: PlanTier, feature: FeatureKey): boolean {
  const required = FEATURE_PLAN_MAP[feature] as PlanTier;
  return planMeetsRequirement(userPlan, required);
}

// ── Plan metadata ─────────────────────────────────────────────
export const PLAN_CONFIG = {
  basic: {
    label:        'Basic',
    price:        49.99,
    priceLabel:   '$49.99/mo',
    description:  'Lead capture and tracking for solo contractors',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || 'price_XXXX_basic',
    features: [
      'Custom QR code & booking form',
      'Lead board (kanban view)',
      'Photo & doc uploads on cards',
      'Payment status tracking',
      'Unlimited team members',
      'Form branding (logo & colors)',
    ],
  },
  pro: {
    label:        'Pro',
    price:        99.99,
    priceLabel:   '$99.99/mo',
    description:  'Full workflow + AI for growing crews',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_XXXX_pro',
    features: [
      'Everything in Basic',
      'Custom pipeline stages',
      'Job categories, tasks & quote templates',
      'Job scheduling',
      'Quote builder',
      'One-click emails (quote, schedule, reminder)',
      'Outbox — full sent email history',
      'Custom email templates',
      'Customer photo & video uploads on form',
      'CSV export for bookkeeping',
      'AI brief on every lead',
      'AI quote generator',
      'AI assistant chat',
      'AI photo & text analysis',
      'Daily digest email',
    ],
  },
} as const;

// ── Upgrade prompt copy ───────────────────────────────────────
export const UPGRADE_PROMPTS: Record<string, {
  title: string;
  description: string;
}> = {
  custom_pipeline: {
    title: 'Customize your pipeline',
    description: 'Add, rename, and reorder your board stages to match your exact workflow.',
  },
  categories: {
    title: 'Job categories & templates',
    description: 'Organize leads by job type and auto-load tasks and quote templates.',
  },
  custom_tasks: {
    title: 'Custom task lists',
    description: 'Build default task checklists for each job category.',
  },
  email_templates: {
    title: 'Custom email templates',
    description: 'Personalize your quote, schedule, and payment reminder emails.',
  },
  send_quote_email: {
    title: 'One-click emails',
    description: 'Send quotes, schedules, and payment reminders in one click — tracked in your outbox.',
  },
  outbox: {
    title: 'Email outbox',
    description: 'Review every email sent to customers in one place.',
  },
  csv_export: {
    title: 'CSV export',
    description: 'Download all your leads and job data for bookkeeping and reporting.',
  },
  customer_video_upload: {
    title: 'Customer photo & video uploads',
    description: 'Let customers attach job site photos directly on your booking form.',
  },
  custom_form_questions: {
    title: 'Custom form questions',
    description: 'Ask customers anything — budget range, gate codes, pet info.',
  },
  scheduling: {
    title: 'Job scheduling',
    description: 'Schedule jobs and send confirmation emails in one click.',
  },
  quotes: {
    title: 'Quote builder',
    description: 'Build and send professional quotes with custom line item templates.',
  },
  ai_brief: {
    title: 'AI brief',
    description: 'Get an instant AI-generated summary of every lead — saved on each card.',
  },
  ai_quote: {
    title: 'AI quote generator',
    description: 'Let AI draft a quote based on job details and your templates.',
  },
  ai_chat: {
    title: 'AI assistant',
    description: 'Ask questions about your leads, get suggestions, draft follow-up messages.',
  },
  ai_photo_analysis: {
    title: 'AI photo analysis',
    description: 'AI reads job site photos and surfaces damage, scope, and material insights.',
  },
  daily_digest: {
    title: 'Daily digest',
    description: 'Get a morning email summary of open leads, follow-ups, and scheduled jobs.',
  },
  role_permissions: {
    title: 'Role-based permissions',
    description: 'Control what admins and members can see and do in your dashboard.',
  },
  settings_pipeline: {
    title: 'Pipeline settings',
    description: 'Customize your lead stages to match your workflow.',
  },
  settings_categories: {
    title: 'Categories settings',
    description: 'Set up job types with auto-loaded tasks and quote templates.',
  },
  settings_email_templates: {
    title: 'Email template settings',
    description: 'Personalize the emails your customers receive.',
  },
  settings_notifications: {
    title: 'Notification settings',
    description: 'Configure your daily digest and reminder preferences.',
  },
};

// ── Role-based checks ─────────────────────────────────────────
// Role = what a user can do within their company.
// Plan = what features the company has access to.
// These are intentionally separate concerns.
export function canDeleteLead(role: UserRole):       boolean { return role === 'owner' || role === 'admin'; }
export function canConvertToProject(role: UserRole): boolean { return role === 'owner' || role === 'admin'; }
export function canRestoreLead(role: UserRole):      boolean { return role === 'owner' || role === 'admin'; }
export function canInviteMembers(role: UserRole):    boolean { return role === 'owner' || role === 'admin'; }
export function canRemoveMembers(role: UserRole):    boolean { return role === 'owner' || role === 'admin'; }
export function canChangeRoles(role: UserRole):      boolean { return role === 'owner' || role === 'admin'; }
export function canAccessSettings(role: UserRole):   boolean { return role === 'owner' || role === 'admin'; }
export function canDeleteCompany(role: UserRole):    boolean { return role === 'owner'; }
export function isAdminOrOwner(role: UserRole):      boolean { return role === 'owner' || role === 'admin'; }

export const PERMISSION_ERRORS = {
  NOT_AUTHORIZED:      'You are not authorized to perform this action',
  ADMIN_ONLY:          'This action requires admin or owner privileges',
  OWNER_ONLY:          'This action can only be performed by the company owner',
  CANNOT_DELETE_LEAD:  'Members cannot delete leads',
  CANNOT_INVITE:       'Members cannot invite team members',
  CANNOT_REMOVE:       'Members cannot remove team members',
  CANNOT_CHANGE_ROLES: 'Members cannot change user roles',
};