'use client';

import StandalonePageShell from '@/components/StandalonePageShell';
import StandaloneUpgradeOverlay from '@/components/StandaloneUpgradeOverlay';
import PaymentsTab from '@/app/[company]/admin/settings/tabs/PaymentsTab';

export default function PaymentsPageClient({
  company, currentUser, locked,
}: { company: any; currentUser: any; locked?: boolean }) {
  return (
    <StandalonePageShell companySlug={company.slug} title="Customer Payments">
      {locked ? (
        <div className="relative">
          <div className="blur-[3px] pointer-events-none select-none opacity-60" aria-hidden>
            <PaymentsTab company={company} currentUser={currentUser} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <StandaloneUpgradeOverlay feature="stripe_connect" companySlug={company.slug} requiredPlan="basic" />
          </div>
        </div>
      ) : (
        <PaymentsTab company={company} currentUser={currentUser} />
      )}
    </StandalonePageShell>
  );
}