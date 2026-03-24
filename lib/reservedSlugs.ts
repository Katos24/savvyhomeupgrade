export const RESERVED_SLUGS = new Set([
  // App routes
  'login', 'logout', 'signup', 'register', 'onboarding',
  'subscribe', 'success', 'demo', 'pricing', 'upload',
  // Admin
  'admin', 'superadmin', 'staff',
  // API
  'api', 'auth', 'webhook', 'webhooks',
  // Legal/info
  'privacy', 'terms', 'about', 'contact', 'support', 'help',
  // Common abuse targets
  'www', 'mail', 'ftp', 'billing', 'dashboard', 'settings',
  'account', 'profile', 'user', 'users', 'team',
  // Your brand
  'lead2project', 'l2p',
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase().trim());
}