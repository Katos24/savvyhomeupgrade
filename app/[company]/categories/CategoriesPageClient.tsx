'use client';

import StandalonePageShell from '@/components/StandalonePageShell';
import CategoriesTab from '@/app/[company]/admin/settings/tabs/CategoriesTab';

export default function CategoriesPageClient({ company, currentUser }: { company: any; currentUser: any }) {
  return (
    <StandalonePageShell companySlug={company.slug} title="Categories, Tasks & Pricing">
      <CategoriesTab company={company} currentUser={currentUser} />
    </StandalonePageShell>
  );
}