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
//
// Plans:
//   free    → $0     — booking link + basic form + view leads + create leads
//   basic   → $49.99 — full workflow, no emails, no AI
//   pro     → $79.99 — everything + one-click emails + AI
// ============================================================

// ── Plan types ────────────────────────────────────────────────
export type PlanTier = 'free' | 'basic' | 'pro';
export type UserRole = 'owner' | 'admin' | 'member';

export const PLAN_ORDER: PlanTier[] = ['free', 'basic', 'pro'];

export function planMeetsRequirement(
  userPlan: PlanTier,
  requiredPlan: PlanTier
): boolean {
  return PLAN_ORDER.indexOf(userPlan) >= PLAN_ORDER.indexOf(requiredPlan);
}

// ── Feature → minimum plan map ────────────────────────────────
// THIS is the single source of truth for what each plan gets.
// Change a value here — it propagates everywhere automatically.
//
// free    → booking link + basic form + view leads + create leads (card view only)
// basic   → full workflow, manual emails
// pro     → automation + AI on top of basic
export const FEATURE_PLAN_MAP = {
  // ── Customer form ──────────────────────────────────────────
  basic_form:               'free',    // name, email, phone, description only
  customize_form:           'basic',   // branding, field toggles
  customer_video_upload:    'basic',   // customer attaches photos/video on form
  custom_form_questions:    'basic',   // add your own questions to form
  send_invoice_email: 'pro',


  // ── Lead board ─────────────────────────────────────────────
  lead_board:               'free',    // kanban cards view only
  view_lead_details:        'free',    // can open and read lead info
  table_view:               'free',   // table view with sorting/filtering
  calendar_view:            'basic',   // calendar view
  photos_on_card:           'basic',
  docs_on_card:             'basic',
  payment_tracking:         'basic',   // basic payment status
  custom_pipeline:          'basic',   // add/rename/reorder board stages
  categories:               'basic',   // job categories with task templates
  custom_tasks:             'basic',   // default task lists per category
  csv_export:               'basic',   // download leads for bookkeeping

  // ── Scheduling, quotes & payments ──────────────────────────
  scheduling:               'basic',   // basic can schedule, just can't email
  quotes:                   'basic',   // basic can build quotes, just can't email
  quote_templates:          'basic',   // custom line item templates
  send_quote_email:         'pro',     // one-click send requires pro
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
  role_permissions:         'basic',

  // ── Settings tabs ──────────────────────────────────────────
  settings_company:         'free',    // can view company info
  settings_billing:         'free',    // can upgrade from here
       settings_form:            'free',

  settings_team:            'basic',
  settings_pipeline:        'basic',
  settings_categories:      'free',
  settings_email_templates: 'free',
  settings_notifications:   'pro',

  // ── Lead management actions ────────────────────────────────
  create_lead_manual:       'free',    // manual lead creation from dashboard
  convert_to_project:       'basic',   // convert lead → project
  delete_lead:              'basic',   // delete/archive leads
  assign_lead:              'basic',   // assign leads to team members
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
  free: {
    label:        'Free',
    price:        0,
    priceLabel:   'Free',
    description:  'See your leads come in. Upgrade when you\'re ready to manage them.',
    stripePriceId: '',
    features: [
      'Booking link & QR code',
      'Basic form (name, email, phone, description)',
      'Lead dashboard (card view)',
      'View lead details',
      'Create leads manually',
    ],
  },
  basic: {
    label:        'Basic',
    price:        49.99,
    priceLabel:   '$49.99/mo',
    description:  'Full job management for growing crews',
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || '',
    features: [
      'Custom booking form & branding',
      'Customer photo & video uploads on form',
      'CSV export for bookkeeping',
      'Build professional quote templates',
      'Job categories & task templates',
      'Table & calendar views',
      'Photo & doc uploads on cards',
      'Payment status tracking',
      'Custom pipeline stages',
      'Job scheduling & quote builder',
      'Unlimited team members',
    ],
  },
  pro: {
    label:        'Pro',
    price:        79.99,
    priceLabel:   '$79.99/mo',
    description:  'Automation + AI for serious contractors',
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
    features: [
      'Everything in Basic',
      'One-click emails (quote, schedule, reminder)',
      'Outbox — full sent email history',
      'Custom email templates',
       'Daily digest email',
      'AI brief on every lead',
      'AI quote generator',
      'AI assistant chat',
      'AI photo & text analysis',
    ],
  },
} as const;

// ── Upgrade prompt copy ───────────────────────────────────────
export const UPGRADE_PROMPTS: Record<string, {
  title: string;
  description: string;
}> = {
  // ── free → basic ───────────────────────────────────────────
  customize_form: {
    title: 'Customize your booking form',
    description: 'Add your logo, categories, address fields, photos, and custom questions to your form.',
  },
  table_view: {
    title: 'Table & calendar views',
    description: 'Sort, filter, and bulk-manage leads in table view. See your schedule at a glance in calendar view.',
  },
  calendar_view: {
    title: 'Calendar view',
    description: 'See all your scheduled jobs on a calendar at a glance.',
  },
  photos_on_card: {
    title: 'See customer photos',
    description: 'Customers can upload job site photos on your booking form and you\'ll see them right on the lead card.',
  },
  docs_on_card: {
    title: 'Document attachments',
    description: 'Attach and view documents on any lead card.',
  },
  payment_tracking: {
    title: 'Payment tracking',
    description: 'Track payment status on every job — see who\'s paid and who hasn\'t.',
  },
  team_members: {
    title: 'Team members',
    description: 'Invite your crew and assign leads to specific people.',
  },
  convert_to_project: {
    title: 'Convert to project',
    description: 'Turn leads into full projects with tasks, quotes, and scheduling.',
  },
  delete_lead: {
    title: 'Delete & archive leads',
    description: 'Clean up your board by deleting or archiving old leads.',
  },
  assign_lead: {
    title: 'Assign leads',
    description: 'Assign leads to specific team members so nothing falls through the cracks.',
  },
  settings_form: {
    title: 'Form settings',
    description: 'Control what customers fill out — toggle address, photos, custom questions, and more.',
  },
  settings_team: {
    title: 'Team settings',
    description: 'Manage your team members, roles, and permissions.',
  },
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
  scheduling: {
    title: 'Job scheduling',
    description: 'Schedule jobs and manage your crew calendar.',
  },
  quotes: {
    title: 'Quote builder',
    description: 'Build professional quotes with custom line item templates.',
  },
  quote_templates: {
    title: 'Quote templates',
    description: 'Save your most-used quote line items as reusable templates.',
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

  // ── basic → pro ────────────────────────────────────────────
  // Instead of just "One-click emails"
send_quote_email: {
  title: 'Stop typing the same emails',
  description: 'Send professional quotes and updates in a single click. Save 5+ hours a week on repetitive office work.',
},
outbox: {
  title: 'Never lose track of a conversation',
  description: 'See every email you’ve ever sent to a client in one organized outbox.',
},
  send_schedule_email: {
    title: 'One-click schedule email',
    description: 'Send schedule confirmations to customers in one click.',
  },
  send_payment_reminder: {
    title: 'One-click payment reminder',
    description: 'Send payment reminders to customers in one click.',
  },
  email_templates: {
    title: 'Custom email templates',
    description: 'Personalize your quote, schedule, and payment reminder emails.',
  },
  settings_email_templates: {
    title: 'Email template settings',
    description: 'Personalize the emails your customers receive.',
  },
  settings_notifications: {
    title: 'Notification settings',
    description: 'Configure your daily digest and reminder preferences.',
  },
  ai_brief: {
    title: 'AI brief',
    description: 'Get an instant AI-generated summary of every lead — saved on each card.',
  },
  ai_quote: {
    title: 'AI quote generator',
    description: 'Let AI draft a quote based on job details and your templates.',
  },
  send_invoice_email: {
  title: 'Send invoices directly to customers',
  description: 'Email a professional invoice to your customer in one click. Available on Pro.',
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