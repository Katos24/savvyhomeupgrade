import { fontVars } from '@/components/marketing/marketingTheme';
import AdStudio from '@/components/marketing/AdStudio';

// Internal page for recording ad videos. Not linked anywhere, kept out of search.
export const metadata = {
  title: 'Ad recording | Lead2Project',
  robots: { index: false, follow: false },
};

export default function AdPage() {
  return (
    <div className={`${fontVars} font-[family-name:var(--font-body)]`}>
      <AdStudio />
    </div>
  );
}