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
            <p className="text-slate-400 font-bold">Last updated: September 30, 2026</p>
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
                    <p className="leading-relaxed">Lead2Project is a software-as-a-service platform for home service contractors, bookkeepers, and accounting professionals, operated at lead2project.com. For privacy questions, contact us at privacy@lead2project.com.</p>
                    <p className="leading-relaxed mt-3">This policy covers three kinds of people: (1) <strong className="text-white">Subscribers</strong> — contractors and business owners who use our platform, (2) <strong className="text-white">End Customers</strong> — people who submit service requests, receive quotes or invoices, or make payments through a subscriber, and (3) <strong className="text-white">Bookkeeper Partners</strong> — accounting professionals with partner accounts linked to their referred clients.</p>
                  </>
                ),
              },
              {
                title: '2. Information We Collect',
                content: (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-black text-white mb-2">From Subscribers (Contractors)</h3>
                      <p>Name and business name, email and phone number, business address and website, account credentials, logo and branding, communication preferences, your time zone (detected from your browser, used to date payments and schedules correctly), and subscription billing details. Subscription card payments are processed by Stripe — we never see or store full card numbers.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">From Bookkeeper Partners</h3>
                      <p>Name and business name, email address, account credentials, and your partner referral code. We also track which contractor companies are linked to your partner account.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">From End Customers</h3>
                      <p>When a customer submits a request through a subscriber&rsquo;s booking form, we collect on the subscriber&rsquo;s behalf: name, email, phone number, service address, a description of the request, photos and videos, preferred dates and times, and any additional questions the subscriber has configured. We also keep records of quotes, invoices, schedules, and payments related to that customer&rsquo;s jobs. End customer data is stored on behalf of the subscribing contractor: the contractor is the data controller and Lead2Project acts as a data processor.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Payment Information</h3>
                      <p>When an end customer pays a subscriber online, the payment is processed by Stripe through the subscriber&rsquo;s own Stripe account. We receive and store a record of the payment — amount, date, payment method, and for card payments the card brand and last four digits — so it can be shown on invoices, receipts, and reports. We never receive or store full card numbers. Payments recorded manually by a subscriber (cash, check, Zelle, Venmo, etc.) are stored as the subscriber enters them.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Automatically Collected</h3>
                      <p>IP address, browser type, operating system, pages visited, features used, time and duration of visits, referring URLs, and error logs.</p>
                    </div>
                  </div>
                ),
              },
              {
                title: '3. Photos, Media, and Documents',
                content: (
                  <p>End customers and subscribers can upload photos, videos, documents, and receipts, and the Service generates invoice PDFs. These files are stored with Vercel Blob Storage at long, randomly generated links that cannot be guessed. They are shown only inside the subscriber&rsquo;s account and in emails the subscriber sends, but anyone who is given a file&rsquo;s exact link can open it — so treat those links like private documents and don&rsquo;t post them publicly. We do not use uploaded media for advertising or any purpose beyond delivering the Service. The subscriber is responsible for obtaining any consents needed from people who appear in uploaded media.</p>
                ),
              },
              {
                title: '4. How We Use Your Information',
                content: (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-black text-white mb-2">To Provide the Service</h3>
                      <p>Create and manage accounts, process subscription payments, store and display job and customer data, move jobs through the subscriber&rsquo;s pipeline automatically when things happen (for example, when a quote is sent or a scheduled date arrives), send emails, enable team collaboration, generate invoice PDFs and QuickBooks-formatted exports, provide the AI assistant on eligible plans, and give linked bookkeeper partners access to client data.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Emails to End Customers</h3>
                      <p>On a subscriber&rsquo;s behalf, the Service sends end customers transactional emails such as request confirmations, quotes, schedule confirmations, invoices, payment receipts (including the final invoice PDF when a job is paid in full), payment reminders, and review requests. These are sent because of the end customer&rsquo;s job with the subscriber, not for our own marketing.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">To Improve and Protect the Service</h3>
                      <p>Monitor usage, diagnose technical issues, detect and prevent fraud and abuse, analyze performance, and comply with legal obligations.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">To Communicate With Subscribers</h3>
                      <p>Send service updates, security alerts, policy changes, and support responses, and occasional product or marketing emails with an unsubscribe option.</p>
                    </div>
                  </div>
                ),
              },
              {
                title: '5. Information Sharing and Disclosure',
                content: (
                  <div className="space-y-4">
                    <p>We do not sell personal information. We do not share data with advertisers.</p>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Bookkeeper Partners</h3>
                      <p>If a contractor signs up using a bookkeeper partner&rsquo;s referral code, that partner gets read-only access to the contractor&rsquo;s financial data, including job records, invoices, payment status, exports, and attached receipts. Contractors consent to this at signup when using a partner code.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Service Providers</h3>
                      <p>We use the following providers to run the Service: Stripe (payments), Vercel (hosting and file storage), Neon (database), Resend (email delivery), Sentry (error monitoring), and Anthropic (the AI assistant). They process data only as needed to provide their services to us.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Legal Requirements</h3>
                      <p>We may disclose information if required by law or court order, or to protect our rights, prevent fraud, or protect user safety.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Business Transfers</h3>
                      <p>If Lead2Project is acquired or merges, information may be transferred as part of that transaction. We will notify subscribers by email or a prominent notice.</p>
                    </div>
                  </div>
                ),
              },
              {
                title: '6. AI Assistant',
                content: (
                  <p>Subscribers on eligible plans can use an AI assistant to ask questions about their business. When you use it, the question and a summary of your account&rsquo;s job data — which can include customer names, service addresses, job details, statuses, amounts, schedules, and notes — are sent to Anthropic&rsquo;s API to generate the answer. The AI assistant only runs when you use it. Anthropic processes this data under its own commercial terms and privacy policy. AI answers can be wrong and should be checked before you rely on them.</p>
                ),
              },
              {
                title: '7. QuickBooks Export and Financial Data',
                content: (
                  <div className="space-y-3">
                    <p>Lead2Project can export job financial data — invoice numbers, customer names, line items, payment status, and amounts — in a QuickBooks-friendly CSV format for subscribers and their linked bookkeeper partners.</p>
                    <p>Lead2Project is a job management tool. We do not provide accounting, bookkeeping, tax, or financial advice. Exported data should be reviewed by a qualified accounting professional before use in financial statements, tax filings, or business decisions.</p>
                  </div>
                ),
              },
              {
                title: '8. Referral Program',
                content: (
                  <p>If you participate as a bookkeeper partner, we track referrals associated with your partner code and any commissions earned. Paying commissions may require additional information for tax purposes, including your legal name, address, and tax identification number. Partners who earn $600 or more in a calendar year will receive a 1099 form as required by US tax law.</p>
                ),
              },
              {
                title: '9. Data Security',
                content: (
                  <p>We use industry-standard safeguards, including encryption in transit (TLS), encrypted storage at rest provided by our hosting and database providers, access controls that limit each account to its own company&rsquo;s data, error monitoring, and PCI-compliant payment processing through Stripe. No method of transmission or storage is 100% secure. If a data breach affects your information, we will notify you as required by applicable law.</p>
                ),
              },
              {
                title: '10. Data Retention and Deletion',
                content: (
                  <div className="space-y-3">
                    <p>We keep subscriber and end customer data for as long as the subscriber&rsquo;s account exists, including after a subscription is cancelled, so the account can be reactivated without losing history.</p>
                    <p>A subscriber can ask us to permanently delete their account and its data — including leads, jobs, photos, documents, and receipts — by emailing privacy@lead2project.com from the account&rsquo;s email address. We will complete the deletion within 30 days of confirming the request. We may keep billing and payment records for as long as the law requires, and anonymized, aggregated usage data that no longer identifies anyone.</p>
                    <p>Bookkeeper partner accounts and their client links are kept until the partner account is deleted.</p>
                  </div>
                ),
              },
              {
                title: '11. Your Rights',
                content: (
                  <>
                    <p className="mb-3">Depending on where you live, you may have the right to access, correct, delete, or export your personal data, opt out of marketing emails, and withdraw consent where processing is based on consent. Contact us at privacy@lead2project.com and we will respond within 30 days.</p>
                    <p>End customers who want to access or delete information they submitted to a contractor should contact that contractor directly, since the contractor controls that data. We will help the contractor fulfill the request.</p>
                  </>
                ),
              },
              {
                title: '12. Cookies',
                content: (
                  <p>We use essential cookies required for the Service to work, such as the cookie that keeps you signed in, and we may store simple preferences (like light or dark mode) in your browser. We do not use advertising cookies. You can block cookies in your browser, but you won&rsquo;t be able to sign in without them.</p>
                ),
              },
              {
                title: '13. Children’s Privacy',
                content: (
                  <p>The Service is intended for businesses and is not directed to anyone under 18. We do not knowingly collect personal information from minors. If you believe a minor has submitted data through the Service, contact privacy@lead2project.com.</p>
                ),
              },
              {
                title: '14. International Data Transfers',
                content: (
                  <p>The Service is operated in the United States. If you access it from outside the US, your data will be transferred to and processed in the US.</p>
                ),
              },
              {
                title: '15. Changes to This Policy',
                content: (
                  <p>We may update this Privacy Policy from time to time. Material changes will be communicated by email or a prominent notice in the Service. Continued use after changes take effect means you accept the updated policy.</p>
                ),
              },
              {
                title: '16. Contact Us',
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