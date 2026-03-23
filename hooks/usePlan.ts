// ============================================================
// hooks/usePlan.ts
// Reads the company's current plan and exposes a can() helper
// for feature gating anywhere in the app.
//
// Usage:
//   const { can, plan, isLoading } = usePlan();
//   if (!can('pipeline'))   → show lock overlay
//   if (!can('ai_brief'))   → hide AI button
//   if (!canTab('pipeline')) → lock settings tab
// ============================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  type PlanTier,
  type SettingsTab,
  UPGRADE_PROMPTS,
  planMeetsRequirement,
  canAccessSettingsTab,
  // Customer form
  canCustomizeForm,
  canEnableCustomerVideoUploads,
  canAddCustomFormQuestions,
  // Lead board & pipeline
  canViewLeadBoard,
  canCustomizePipeline,
  canUseCategories,
  canUseCustomTasks,
  // Media
  canUploadPhotos,
  canUploadDocs,
  // Scheduling, quotes & payments
  canUseScheduling,
  canUseQuotes,
  canUseCustomQuoteTemplates,
  canTrackPayments,
  // Emails & outbox
  canSendOneClickEmails,
  canAccessOutbox,
  canUseCustomEmailTemplates,
  // Data
  canExportCsv,
  // AI — Business only
  canUseAiBrief,
  canUseAiQuoteGenerator,
  canUseAiChat,
  canUseAiPhotoAnalysis,
  // Digest — Business only
  canUseDailyDigest,
  // Team
  canAddTeamMembers,
  canManageRoles,
} from '@/lib/permissions';

// ── Feature key map ──────────────────────────────────────────
// Every feature key maps to its permission function.
// Add new keys here as features are added.
const FEATURE_MAP = {
  // Form
  customize_form:        (p: PlanTier) => canCustomizeForm(p),
  customer_video:        (p: PlanTier) => canEnableCustomerVideoUploads(p),
  custom_form_questions: (p: PlanTier) => canAddCustomFormQuestions(p),
  // Board
  lead_board:            (p: PlanTier) => canViewLeadBoard(p),
  pipeline:              (p: PlanTier) => canCustomizePipeline(p),
  categories:            (p: PlanTier) => canUseCategories(p),
  custom_tasks:          (p: PlanTier) => canUseCustomTasks(p),
  // Media
  photos:                (p: PlanTier) => canUploadPhotos(p),
  docs:                  (p: PlanTier) => canUploadDocs(p),
  // Workflow
  scheduling:            (p: PlanTier) => canUseScheduling(p),
  quotes:                (p: PlanTier) => canUseQuotes(p),
  quote_templates:       (p: PlanTier) => canUseCustomQuoteTemplates(p),
  payments:              (p: PlanTier) => canTrackPayments(p),
  // Emails
  one_click_emails:      (p: PlanTier) => canSendOneClickEmails(p),
  outbox:                (p: PlanTier) => canAccessOutbox(p),
  email_templates:       (p: PlanTier) => canUseCustomEmailTemplates(p),
  // Data
  csv_export:            (p: PlanTier) => canExportCsv(p),
  // AI — Business only
  ai_brief:              (p: PlanTier) => canUseAiBrief(p),
  ai_quote:              (p: PlanTier) => canUseAiQuoteGenerator(p),
  ai_chat:               (p: PlanTier) => canUseAiChat(p),
  ai_photo:              (p: PlanTier) => canUseAiPhotoAnalysis(p),
  // Digest — Business only
  daily_digest:          (p: PlanTier) => canUseDailyDigest(p),
  // Team
  add_team_members:      (p: PlanTier) => canAddTeamMembers(p),
  manage_roles:          (p: PlanTier) => canManageRoles(p),
} as const;

export type FeatureKey = keyof typeof FEATURE_MAP;

// ── Return type ───────────────────────────────────────────────
export type UsePlanReturn = {
  // The company's current plan tier
  plan: PlanTier | null;
  isLoading: boolean;
  error: string | null;

  // Check if a feature is available on the current plan
  // Usage: can('pipeline') → boolean
  can: (feature: FeatureKey) => boolean;

  // Check if a settings tab is accessible on the current plan
  // Usage: canTab('pipeline') → boolean
  canTab: (tab: SettingsTab) => boolean;

  // Get the upgrade prompt copy for a locked feature
  // Usage: upgradePrompt('pipeline') → { title, description, requiredPlan }
  upgradePrompt: (feature: string) => typeof UPGRADE_PROMPTS[string] | null;

  // Check if current plan meets a minimum requirement
  // Usage: meetsRequirement('pro') → boolean
  meetsRequirement: (required: PlanTier) => boolean;

  // Convenience booleans
  isBasic: boolean;
  isPro: boolean;
  isBusiness: boolean;
};

// ── Hook ──────────────────────────────────────────────────────
export function usePlan(): UsePlanReturn {
  const params = useParams();
  const companySlug = params?.company as string;

  const [plan, setPlan] = useState<PlanTier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companySlug) {
      setIsLoading(false);
      return;
    }

    async function fetchPlan() {
      try {
        const res = await fetch(`/api/company/${companySlug}/info`);
        const data = await res.json();

        if (data.success && data.company?.plan_tier) {
          setPlan(data.company.plan_tier as PlanTier);
        } else {
          // Default to basic if plan_tier missing — fail safe
          setPlan('basic');
        }
      } catch (err) {
        console.error('usePlan: failed to fetch plan', err);
        setError('Failed to load plan');
        setPlan('basic'); // fail safe — never grant access on error
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlan();
  }, [companySlug]);

  const can = useCallback(
    (feature: FeatureKey): boolean => {
      if (!plan) return false;
      const check = FEATURE_MAP[feature];
      return check ? check(plan) : false;
    },
    [plan]
  );

  const canTab = useCallback(
    (tab: SettingsTab): boolean => {
      if (!plan) return false;
      return canAccessSettingsTab(tab, plan);
    },
    [plan]
  );

  const upgradePrompt = useCallback(
    (feature: string) => {
      return UPGRADE_PROMPTS[feature] ?? null;
    },
    []
  );

  const meetsRequirement = useCallback(
    (required: PlanTier): boolean => {
      if (!plan) return false;
      return planMeetsRequirement(plan, required);
    },
    [plan]
  );

  return {
    plan,
    isLoading,
    error,
    can,
    canTab,
    upgradePrompt,
    meetsRequirement,
    isBasic:    plan === 'basic',
    isPro:      plan === 'pro',
    isBusiness: plan === 'business',
  };
}