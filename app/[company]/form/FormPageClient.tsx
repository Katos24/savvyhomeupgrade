'use client';

import StandalonePageShell from '@/components/StandalonePageShell';
import FormTab from '@/app/[company]/admin/settings/tabs/FormTab';

export default function FormPageClient({ company, currentUser }: { company: any; currentUser: any }) {
  return (
    <StandalonePageShell companySlug={company.slug} title="Booking Form">
      <FormTab company={company} currentUser={currentUser} />
    </StandalonePageShell>
  );
}