'use client';

import { useState, useEffect, useRef } from 'react';
import StandalonePageShell from '@/components/StandalonePageShell';
import BookingFormConfig from '@/app/[company]/(app)/dashboard/services/BookingFormConfig';
import { useFormTabLogic } from '@/app/[company]/admin/settings/tabs/useFormTabLogic';
import { themeTokens } from '@/app/[company]/(app)/dashboard/services/CategoriesTaskEditorModal';

// BookingFormConfig no longer manages its own theme or data-fetching —
// both now come from the parent (ServicesFormLanding normally). This
// standalone page is a second, independent entry point into the same
// component, so it needs to supply the same two things itself.
export default function FormPageClient({ company, currentUser }: { company: any; currentUser: any }) {
  // StandalonePageShell's content card is permanently light
  // (bg-white, hardcoded, no theme support) — forcing isDark={false}
  // here, not reading localStorage, is deliberate: this page can never
  // actually go dark regardless of the dashboard's own theme setting,
  // so pretending otherwise would just reproduce the exact
  // invisible-dark-text-on-light-background bug found and fixed
  // earlier this session, in a new location.
  const isDark = false;
  const t = themeTokens(isDark);
  const formLogic = useFormTabLogic(company);

  return (
    <StandalonePageShell companySlug={company.slug} title="Booking Form">
      <BookingFormConfig company={company} formLogic={formLogic} isDark={isDark} t={t} />
    </StandalonePageShell>
  );
}