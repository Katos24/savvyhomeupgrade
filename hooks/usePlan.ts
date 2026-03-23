// ============================================================
// hooks/usePlan.ts
// ============================================================
// Reads the company plan and exposes can() for any component.
// All feature logic lives in lib/permissions.ts — not here.
//
// Usage:
//   const { can, plan, isLoading } = usePlan();
//   if (!can('ai_brief'))   → show upgrade prompt
//   if (!can('csv_export')) → hide export button
// ============================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  can as checkFeature,
  planMeetsRequirement,
  PLAN_CONFIG,
  UPGRADE_PROMPTS,
  type PlanTier,
  type FeatureKey,
} from '@/lib/permissions';

export type { FeatureKey };

export type UsePlanReturn = {
  plan: PlanTier | null;
  isLoading: boolean;
  error: string | null;

  // Check if a feature is available — reads from FEATURE_PLAN_MAP
  can: (feature: FeatureKey) => boolean;

  // Get upgrade prompt copy for a feature key
  upgradePrompt: (feature: string) => { title: string; description: string } | null;

  // Get plan config (label, price, features list)
  planConfig: typeof PLAN_CONFIG[PlanTier] | null;

  // Convenience
  isBasic: boolean;
  isPro: boolean;
};

export function usePlan(): UsePlanReturn {
  const params = useParams();
  const companySlug = params?.company as string;

  const [plan, setPlan] = useState<PlanTier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companySlug) { setIsLoading(false); return; }

    fetch(`/api/company/${companySlug}/info`)
      .then(r => r.json())
      .then(data => {
        const tier = data.company?.plan_tier as PlanTier;
        // Normalise — treat anything unrecognised as basic (fail safe)
        setPlan(tier === 'pro' ? 'pro' : 'basic');
      })
      .catch(() => setPlan('basic')) // fail safe — never grant access on error
      .finally(() => setIsLoading(false));
  }, [companySlug]);

  const can = useCallback(
    (feature: FeatureKey): boolean => {
      if (!plan) return false;
      return checkFeature(plan, feature);
    },
    [plan]
  );

  const upgradePrompt = useCallback(
    (feature: string) => UPGRADE_PROMPTS[feature] ?? null,
    []
  );

  const planConfig = plan ? PLAN_CONFIG[plan] : null;

  return {
    plan,
    isLoading,
    error,
    can,
    upgradePrompt,
    planConfig,
    isBasic: plan === 'basic',
    isPro:   plan === 'pro',
  };
}