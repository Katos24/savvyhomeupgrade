import Link from 'next/link';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';

export const metadata = {
  title: 'Privacy Policy | Lead2Project',
  description: 'How Lead2Project collects, uses, and protects your information.',
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="bg-slate-900 min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">

          <div className="mb-12">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-4">Legal</p>
            <h1 className="text-4xl font-black text-white tracking-tight mb-3">Privacy Policy</h1>
<p className="text-slate-400 font-bold">Last updated: June 10, 2026</p>
          </div>

          <div className="space-y-10 text-slate-300">

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-4">
              <p className="text-sm font-bold text-emerald-300 leading-relaxed">
                This Privacy Policy explains how Lead2Project collects, uses, stores, and protects your information. By using the Service, you consent to the practices described in this policy.
              </p>
            </div>

            {[
              {
                title: '1. Who We Are',
                content: (
                  <>
                    <p className="leading-relaxed">Lead2Project is a software-as-a-service platform serving home service contractors, bookkeepers, and accounting professionals. We operate at lead2project.com. For privacy-related questions, contact us at privacy@lead2project.com.</p>
                    <p className="leading-relaxed mt-3">Lead2Project processes three categories of users: (1) <strong className="text-white">Subscribers</strong> — contractors and business owners who pay for and use our platform, (2) <strong className="text-white">End Customers</strong> — individuals who submit service requests through a subscriber's form, and (3) <strong className="text-white">Bookkeeper Partners</strong> — accounting professionals who create partner accounts to access their referred clients' financial data. This policy applies to all three categories.</p>
                  </>
                ),
              },
              {
                title: '2. Information We Collect',
                content: (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-black text-white mb-2">From Subscribers (Contractors)</h3>
                      <p className="mb-2">When you create an account, we collect: full name and business name, email address and phone number, business address and website, payment information (processed securely by Stripe — we do not store card numbers), account credentials, logo and branding assets, and communication preferences.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">From Bookkeeper Partners</h3>
                      <p className="mb-2">When you create a bookkeeper partner account, we collect: full name and business name, email address, account credentials, and your unique partner referral code. We also track which contractor companies are linked to your partner account.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">From End Customers</h3>
                      <p>When a customer submits a request through a subscriber's form, we collect on behalf of that subscriber: name, email, phone number, service address, description of the service request, photos and videos, and any additional fields configured by the subscriber. End customer data is stored on behalf of the subscribing contractor. Lead2Project acts as a data processor — the contractor is the data controller.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Automatically Collected</h3>
                      <p>IP address, browser type, operating system, pages visited, features used, time and duration of visits, referring URLs, and error logs.</p>
                    </div>
                  </div>
                ),
              },
              {
                title: '3. Photo, Media, and Document Data',
                content: (
                  <p>Our Service allows end customers and subscribers to upload photos, videos, documents, and receipts. These files are stored securely using Vercel Blob Storage. Media files are accessible only to the subscribing contractor, their authorized team members, and any linked bookkeeper partners. We do not use uploaded media for advertising or any purpose beyond delivering the Service. Files are retained for the duration of the subscription and for 30 days following cancellation, after which they are permanently deleted. The contractor is solely responsible for obtaining necessary consents from individuals who appear in uploaded media.</p>
                ),
              },
              {
                title: '4. How We Use Your Information',
                content: (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-black text-white mb-2">To Provide the Service</h3>
                      <p>Create and manage accounts, process subscription payments, store and display job and customer data, send transactional emails, enable team collaboration, generate QuickBooks exports, provide AI-powered features on Pro plan, and facilitate bookkeeper partner access to linked client data.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">To Improve and Protect the Service</h3>
                      <p>Monitor usage patterns, diagnose technical issues, detect and prevent fraud, analyze performance, and comply with legal obligations.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">To Communicate With You</h3>
                      <p>Send service updates, security alerts, policy changes, respond to support requests, and send marketing communications with opt-out available.</p>
                    </div>
                  </div>
                ),
              },
              {
                title: '5. Information Sharing and Disclosure',
                content: (
                  <div className="space-y-4">
                    <p>We do not sell your personal information. We do not share your data with advertisers.</p>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Bookkeeper Partners</h3>
                      <p>If a contractor signs up using a bookkeeper partner's referral code, that bookkeeper partner gains read-only access to the contractor's financial data including job records, invoice information, payment status, QuickBooks exports, and attached receipts. Contractors consent to this access at signup when using a partner referral code.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Service Providers</h3>
                      <p>Stripe (payments), Vercel (hosting and storage), Resend (email delivery), Neon (database), Sentry (error monitoring), and Anthropic Claude AI (AI features on Pro plan). All providers are contractually obligated to protect your data.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Legal Requirements</h3>
                      <p>We may disclose information if required by law, court order, or to protect our rights, prevent fraud, or protect user safety.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Business Transfers</h3>
                      <p>If Lead2Project is acquired or merges, your information may be transferred. You will be notified via email or prominent notice.</p>
                    </div>
                  </div>
                ),
              },
              {
  title: '6. QuickBooks Export and Financial Data',
  content: (
    <div className="space-y-3">
      <p>Lead2Project provides a QuickBooks-formatted CSV export feature that allows subscribers and their bookkeeper partners to export job financial data including invoice numbers, customer names, line items, payment status, and payment amounts.</p>
      <p>Pro plan subscribers have access to AI-powered line item classification. When enabled, quote line item descriptions are sent to Anthropic's Claude AI to automatically classify them by type (labor, materials, service, etc.) and suggest QuickBooks Chart of Accounts mappings. These classifications are suggestions only — subscribers and their bookkeepers are responsible for verifying the accuracy of all classifications before importing data into QuickBooks or any other accounting system.</p>
      <p>Lead2Project is a job management and organization tool. We do not provide accounting, bookkeeping, tax, or financial advice. All financial data exported from Lead2Project should be reviewed by a qualified accounting professional before use in financial statements, tax filings, or business decisions. Lead2Project assumes no liability for errors in exported data or decisions made based on that data.</p>
    </div>
  ),
},
              {
                title: '6. Referral Program',
                content: (
                  <p>Lead2Project operates a bookkeeper partner referral program. If you participate as a partner, we track referrals associated with your partner code and any commissions earned. Commission payments may require us to collect additional information for tax purposes including your legal name, address, and tax identification number. Partners who earn over $600 in a calendar year will receive a 1099 form as required by US tax law.</p>
                ),
              },
              {
                title: '7. Data Security',
                content: (
                  <p>We implement industry-standard security measures including 256-bit SSL/TLS encryption for data in transit, encrypted storage at rest, row-level security policies on our database, access controls limiting data access to authorized users only, regular security monitoring via Sentry, and PCI-compliant payment processing via Stripe. No method of transmission is 100% secure. In the event of a data breach, we will notify you as required by applicable law.</p>
                ),
              },
              {
                title: '8. Data Retention',
                content: (
                  <p>Subscriber account data is retained for the duration of your subscription. Upon cancellation, your data is retained for 30 days to allow account recovery, after which all data including leads, photos, documents, and receipts is permanently deleted. Billing records may be retained longer as required by law. Bookkeeper partner accounts and their linked client associations are retained until the partner account is deleted. Anonymized aggregated usage data may be retained indefinitely.</p>
                ),
              },
              {
                title: '9. Your Rights',
                content: (
                  <>
                    <p className="mb-3">Depending on your location, you may have the right to access, correct, delete, or export your personal data, opt out of marketing communications, and withdraw consent where processing is based on consent. Contact us at privacy@lead2project.com. We will respond within 30 days.</p>
                    <p>End customers seeking to exercise rights regarding data submitted through a contractor's form should contact the contractor directly, as the contractor is the data controller for that information.</p>
                  </>
                ),
              },
              {
                title: '10. Cookies and Tracking',
                content: (
                  <p>We use essential cookies required for the Service to function, including session authentication cookies. We do not use third-party advertising cookies or tracking pixels. You can configure your browser to refuse cookies but doing so may prevent certain features from functioning correctly.</p>
                ),
              },
              {
                title: '11. AI Features and Data',
                content: (
                  <p>Pro plan subscribers have access to AI-powered features powered by Anthropic's Claude AI. When you use these features, lead and project data may be sent to Anthropic's API to generate responses. We do not send personally identifiable customer information to AI services where avoidable. Anthropic's data handling is governed by their own privacy policy. AI-generated content is provided as-is and should be reviewed before use. Lead2Project is a software tool and does not provide financial, tax, or legal advice.</p>
                ),
              },
              {
                title: '12. Children\'s Privacy',
                content: (
                  <p>The Service is intended for use by businesses and is not directed to individuals under 18 years of age. We do not knowingly collect personal information from anyone under 18. If you believe a minor has submitted data through our Service, contact us at privacy@lead2project.com.</p>
                ),
              },
              {
                title: '13. International Data Transfers',
                content: (
                  <p>Our Service is operated in the United States. If you access the Service from outside the US, your data will be transferred to and processed in the US. By using the Service, you consent to this transfer.</p>
                ),
              },
              {
                title: '14. Changes to This Policy',
                content: (
                  <p>We may update this Privacy Policy from time to time. Material changes will be communicated via email or prominent notice within the Service. Your continued use of the Service after changes take effect constitutes acceptance of the updated policy.</p>
                ),
              },
              {
                title: '15. Contact Us',
                content: (
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-2">
                    <p><span className="text-white font-black">Email:</span> privacy@lead2project.com</p>
                    <p><span className="text-white font-black">Website:</span> lead2project.com</p>
                  </div>
                ),
              },
            ].map((section, i) => (
              <section key={i}>
                <h2 className="text-xl font-black text-white mb-4 pb-3 border-b border-slate-800">{section.title}</h2>
                <div className="text-sm leading-relaxed text-slate-400">{section.content}</div>
              </section>
            ))}

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}