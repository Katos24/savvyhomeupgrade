import { ADDRESS_CONFIG } from '@/lib/formCategories';
import { can, type PlanTier } from '@/lib/permissions';

export type FieldConfig = {
  address: { enabled: boolean; required: boolean };
  preferred_date: { enabled: boolean };
  preferred_time: { enabled: boolean };
  lead_source: { enabled: boolean };
  file_upload: { enabled: boolean };
};

/** The ONE default for booking-form fields. Signup, Settings, the public
    form and Create Lead all resolve through this, so they can't disagree.
    To make new companies start with fields OFF instead, change the
    `true` values below to `false` — nothing else needs to change. */
export function defaultFieldConfig(businessType?: string | null): FieldConfig {
  const addr = ADDRESS_CONFIG[businessType || ''] ?? { show: true, required: false };
  return {
    address: { enabled: addr.show, required: addr.required },
    preferred_date: { enabled: true },
    preferred_time: { enabled: true },
    lead_source: { enabled: true },
    file_upload: { enabled: true },
  };
}

// Accepts an object, a JSON string, or a double-encoded JSON string.
function parseSaved(raw: unknown): any {
  if (!raw) return null;
  if (typeof raw === 'string') {
    try {
      const once = JSON.parse(raw);
      return typeof once === 'string' ? JSON.parse(once) : once;
    } catch {
      return null;
    }
  }
  return typeof raw === 'object' ? raw : null;
}

const ALL_OFF: FieldConfig = {
  address: { enabled: false, required: false },
  preferred_date: { enabled: false },
  preferred_time: { enabled: false },
  lead_source: { enabled: false },
  file_upload: { enabled: false },
};

/** Saved values win; anything missing falls back to the default.
    Plan rules are applied here, at read time, never baked into what's saved:
    - Free plan (no `customize_form`) gets the basic form only — no optional fields.
    - Photos are off unless the plan includes `customer_video_upload`.
    Because signup saves the ungated defaults, a company that upgrades
    immediately gets the default fields without having to re-enable them. */
export function resolveFieldConfig(
  raw: unknown,
  opts: { planTier?: string | null; businessType?: string | null }
): FieldConfig {
  const tier = (opts.planTier || 'free') as PlanTier;
  if (!can(tier, 'customize_form')) return { ...ALL_OFF };

  const saved = parseSaved(raw) || {};
  const d = defaultFieldConfig(opts.businessType);
  const pick = (k: keyof FieldConfig) =>
    typeof saved?.[k]?.enabled === 'boolean' ? saved[k].enabled : d[k].enabled;
  const canPhotos = can(tier, 'customer_video_upload');

  return {
    address: {
      enabled: pick('address'),
      required: typeof saved?.address?.required === 'boolean' ? saved.address.required : d.address.required,
    },
    preferred_date: { enabled: pick('preferred_date') },
    preferred_time: { enabled: pick('preferred_time') },
    lead_source: { enabled: pick('lead_source') },
    file_upload: { enabled: canPhotos && pick('file_upload') },
  };
}