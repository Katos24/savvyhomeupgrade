'use client';

import StandalonePageShell from '@/components/StandalonePageShell';
import PaymentsTab from '@/app/[company]/admin/settings/tabs/PaymentsTab';

export default function PaymentsPageClient({ company, currentUser }: { company: any; currentUser: any }) {
  return (
    <StandalonePageShell companySlug={company.slug} title="Customer Payments">
      <PaymentsTab company={company} currentUser={currentUser} />
    </StandalonePageShell>
  );
}