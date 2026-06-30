// Single source of truth for translating Stripe requirement codes into
// plain-English copy. Used by both the settings page UI (PaymentsTab) and
// the restricted-account email (lib/email.ts). Add new codes here as you
// encounter them in production — anything unmapped falls back to a generic
// message built from the capability name.

export const REQUIREMENT_COPY: Record<string, string> = {
  requirements_past_due: 'Provide the missing business or identity information Stripe requires.',
  requirements_pending_verification: "Stripe is verifying the information you've submitted.",
};

export function describeRequirementReason(code: string, capability: string): string {
  return REQUIREMENT_COPY[code] || `Action needed on ${capability.replace(/_/g, ' ')}.`;
}