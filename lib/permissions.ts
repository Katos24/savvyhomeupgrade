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
// Plans (two offered):
//   free    → $0     — booking link + basic form + cards/table/board/calendar + create leads
//   basic   → $49.99 — everything: quotes, quote/schedule emails, deposits, invoices,
//                      Stripe, reviews, team, outbox, templates, digest, AI chat
//
// 'pro' still exists as a tier so older code and any legacy accounts keep
// working. It's no longer offered, and it includes everything Basic does.
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
// free  → booking link + basic form + all board views + create leads
// basic → everything else
export const FEATURE_PLAN_MAP = {
  // ── Customer form ──────────────────────────────────────────
  basic_form:               'free',    // name, email, phone, description only
  customize_form:           'basic',   // branding, field toggles
  customer_video_upload:    'basic',   // customer attaches photos/video on form
  custom_form_questions:    'basic',   // add your own questions to form
  send_invoice_email:       'basic',
  stripe_connect:           'basic',
  google_reviews:           'basic',

  // ── Lead board ─────────────────────────────────────────────
  lead_board:               'free',    // board views
  view_lead_details:        'free',    // can open and read lead info
  table_view:               'free',    // table view with sorting/filtering
  calendar_view:            'free',    // calendar view
  photos_on_card:           'basic',
  docs_on_card:             'basic',
  payment_tracking:         'basic',   // payment status
  custom_pipeline:          'basic',   // add/rename/reorder board stages
  categories:               'basic',   // job categories with task templates
  custom_tasks:             'basic',   // default task lists per category
  csv_export:               'basic',   // CSV incl. QuickBooks format

  // ── Scheduling, quotes & payments ──────────────────────────
  scheduling:               'basic',
  quotes:                   'basic',
  quote_templates:          'basic',   // saved services / line item templates
  send_quote_email:         'basic',   // email quote, customer accepts online
  send_schedule_email:      'basic',
  send_payment_reminder:    'basic',

  // ── Outbox & email templates ───────────────────────────────
  outbox:                   'basic',
  email_templates:          'basic',

  // ── AI features ────────────────────────────────────────────
  ai_chat:                  'basic',

  // ── Notifications ──────────────────────────────────────────
  daily_digest:             'basic',

  // ── Team & admin ───────────────────────────────────────────
  team_members:             'basic',
  role_permissions:         'basic',

  // ── Settings tabs ──────────────────────────────────────────
  settings_company:         'free',    // can view company info
  settings_billing:         'free',    // can upgrade from here
  settings_form:            'free',
  settings_team:            'basic',
  settings_pipeline:        'basic',
  settings_categories:      'basic',
  settings_email_templates: 'basic',
  settings_notifications:   'basic',

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
    description:  'See your leads come in. Upgrade when you\'re ready to quote and get paid.',
    stripePriceId: '',
    features: [
      'Booking link & QR code',
      'Basic form (name, email, phone, description)',
      'Lead dashboard: cards, table, board & calendar',
      'View lead details',
      'Create leads manually',
    ],
  },
  basic: {
    label:        'Pro',
    price:        49.99,
    priceLabel:   '$49.99/mo',
    description:  'Everything you need to quote, schedule and get paid',
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || '',
    features: [
      'Custom booking form & branding',
      'Customer photo & video uploads on form',
      'Services with prices and default deposits',
      'Quote builder',
      'Email quotes customers accept online',
      'Job scheduling & one-click schedule emails',
      'Deposits & balance invoices',
      'Accept online payments (Stripe)',
      'Send invoices & payment reminders',
      'Google review requests',
      'Outbox: every email you send, saved',
      'Custom email templates',
      'Daily digest email',
      'AI assistant chat',
      'Custom pipeline stages',
      'Job categories & task templates',
      'Photo & doc uploads on cards',
      'CSV export, including QuickBooks format',
      'Unlimited team members',
    ],
  },
   // Reserved for a future higher tier ("Crew"). Not offered yet.
  // Customers see the $49.99 'basic' tier as "Pro".
  pro: {
    label:        'Crew',
    price:        79.99,
    priceLabel:   '$79.99/mo',
    description:  'Legacy plan. Includes everything in Basic.',
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
    features: [
      'Everything in Basic',
    ],
  },
} as const;

// ── Upgrade prompt copy ───────────────────────────────────────
// Every locked feature is on Basic now, so every prompt is free → basic.
export const UPGRADE_PROMPTS: Record<string, {
  title: string;
  description: string;
}> = {
  // ── Booking form ───────────────────────────────────────────
  customize_form: {
    title: 'Customize your booking form',
    description: 'Add your logo, categories, address fields, photos, and custom questions to your form.',
  },
  settings_form: {
    title: 'Form settings',
    description: 'Control what customers fill out — toggle address, photos, custom questions, and more.',
  },
  customer_video_upload: {
    title: 'Customer photo & video uploads',
    description: 'Let customers attach job site photos directly on your booking form.',
  },
  custom_form_questions: {
    title: 'Custom form questions',
    description: 'Ask customers anything — budget range, gate codes, pet info.',
  },

  // ── Jobs & board ───────────────────────────────────────────
  photos_on_card: {
    title: 'See customer photos',
    description: 'Customers can upload job site photos on your booking form and you\'ll see them right on the lead card.',
  },
  docs_on_card: {
    title: 'Document attachments',
    description: 'Attach and view documents on any lead card.',
  },
  convert_to_project: {
    title: 'Convert to project',
    description: 'Turn leads into full projects with tasks, quotes, and scheduling.',
  },
  delete_lead: {
    title: 'Delete & archive leads',
    description: 'Clean up your board by deleting or archiving old leads.',
  },
  custom_pipeline: {
    title: 'Customize your pipeline',
    description: 'Add, rename, and reorder your board stages to match your exact workflow.',
  },
  settings_pipeline: {
    title: 'Pipeline settings',
    description: 'Customize your lead stages to match your workflow.',
  },
  categories: {
    title: 'Job categories & templates',
    description: 'Organize leads by job type and auto-load tasks and quote templates.',
  },
  settings_categories: {
    title: 'Services & pricing',
    description: 'Set your services, prices and default deposits once, and every quote uses them.',
  },
  custom_tasks: {
    title: 'Custom task lists',
    description: 'Build default task checklists for each job category.',
  },
  csv_export: {
    title: 'CSV export',
    description: 'Download your leads and job data for bookkeeping, including a QuickBooks-ready format.',
  },

  // ── Quotes, scheduling & payments ──────────────────────────
  quotes: {
    title: 'Quote builder',
    description: 'Build professional quotes with your saved services and prices.',
  },
  quote_templates: {
    title: 'Saved services',
    description: 'Save your most-used line items and prices so every quote takes a few taps.',
  },
  send_quote_email: {
    title: 'Email your quote',
    description: 'Email your quote in one click. Your customer can accept it online.',
  },
  scheduling: {
    title: 'Job scheduling',
    description: 'Schedule jobs and manage your crew calendar.',
  },
  send_schedule_email: {
    title: 'One-click schedule email',
    description: 'Send customers their date, time and address in one click.',
  },
  payment_tracking: {
    title: 'Payment tracking',
    description: 'Track payment status on every job — see who\'s paid and who hasn\'t.',
  },
  stripe_connect: {
    title: 'Accept online payments',
    description: 'Connect Stripe to let customers pay their deposits and invoices online with a card.',
  },
  send_invoice_email: {
    title: 'Send invoices directly to customers',
    description: 'Email a professional invoice to your customer and let them pay online with a card.',
  },
  send_payment_reminder: {
    title: 'One-click payment reminder',
    description: 'Send payment reminders to customers in one click.',
  },
  google_reviews: {
    title: 'Turn finished jobs into 5-star reviews',
    description: 'When you mark a job complete, send your customer a one-click email asking for a Google review. More reviews means more visibility on Google, and more leads finding you first.',
  },

  // ── Emails & notifications ─────────────────────────────────
  outbox: {
    title: 'Every email, in one place',
    description: 'See every quote, schedule, invoice and reminder you’ve sent, and catch any that failed.',
  },
  email_templates: {
    title: 'Custom email templates',
    description: 'Personalize your quote, schedule, and payment reminder emails.',
  },
  settings_email_templates: {
    title: 'Email template settings',
    description: 'Personalize the emails your customers receive.',
  },
  daily_digest: {
    title: 'Daily digest',
    description: 'One email every morning with today’s jobs, quotes waiting on an answer, overdue payments and balances still owed.',
  },
  settings_notifications: {
    title: 'Notification settings',
    description: 'Configure your daily digest and reminder preferences.',
  },
  ai_chat: {
    title: 'AI assistant',
    description: 'Ask questions about your leads, get suggestions, draft follow-up messages.',
  },

  // ── Team ───────────────────────────────────────────────────
  team_members: {
    title: 'Team members',
    description: 'Invite your crew and assign leads to specific people.',
  },
  assign_lead: {
    title: 'Assign leads',
    description: 'Assign leads to specific team members so nothing falls through the cracks.',
  },
  settings_team: {
    title: 'Team settings',
    description: 'Manage your team members, roles, and permissions.',
  },
  role_permissions: {
    title: 'Role-based permissions',
    description: 'Control what admins and members can see and do in your dashboard.',
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