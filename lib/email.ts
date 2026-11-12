// All email senders live in lib/emails/. This file just re-exports them so
// every existing `import { ... } from '@/lib/email'` keeps working.
export * from './emails/customer';
export * from './emails/contractor';