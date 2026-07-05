'use client';
import StandalonePageShell from '@/components/StandalonePageShell';
import GoogleReviewsTab from '@/app/[company]/admin/settings/tabs/GoogleReviewsTab';

export default function GoogleReviewsPageClient({ company, locked }: { company: any; locked?: boolean }) {
  return (
    <StandalonePageShell companySlug={company.slug} title="Google Reviews">
      <GoogleReviewsTab company={company} locked={locked} />
    </StandalonePageShell>
  );
}