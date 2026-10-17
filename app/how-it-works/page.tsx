import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { fontVars } from '@/components/marketing/marketingTheme';
import HowItWorksTour from '@/components/marketing/HowItWorksTour';

// Outreach page: shared by link in emails and messages, kept out of search results.
export const metadata = {
  title: 'How Lead2Project Works | From Request to Paid in Full',
  description:
    'Follow one roofing job from the customer request to the final payment: booking form, board, estimate templates, online quotes, deposits and the balance.',
  robots: { index: false, follow: true },
};

export default function HowItWorksPage() {
  return (
    <div className={`${fontVars} min-h-screen bg-[#F4EFE6] font-[family-name:var(--font-body)]`}>
      <Nav />
      <main>
        <HowItWorksTour />
      </main>
      <Footer />
    </div>
  );
}