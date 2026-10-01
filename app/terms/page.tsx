import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';

export const metadata = {
  title: 'Terms of Service | Lead2Project',
  description: 'Terms of Service for Lead2Project.',
};

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="bg-slate-900 min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">

          <div className="mb-12">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-4">Legal</p>
            <h1 className="text-4xl font-black text-white tracking-tight mb-3">Terms of Service</h1>
            <p className="text-slate-400 font-bold">Last updated: September 30, 2026</p>
          </div>

          <div className="space-y-10 text-slate-400">

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-6 py-4">
              <p className="text-sm font-bold text-amber-300 leading-relaxed">
                Please read these Terms carefully. By creating an account or using Lead2Project, you agree to be legally bound by these Terms. If you do not agree, do not use the Service.
              </p>
            </div>

            {[
              {
                title: '1. Acceptance of Terms',
                content: (
                  <p>By creating an account on or using Lead2Project (the &ldquo;Service&rdquo;), you agree to these Terms of Service. These Terms apply to subscribers (contractors and business owners) and bookkeeper partners. If you use the Service on behalf of a business, you represent that you have authority to bind that business to these Terms.</p>
                ),
              },
              {
                title: '2. Description of Service',
                content: (
                  <div className="space-y-3">
                    <p>Lead2Project is a software-as-a-service platform that provides online booking forms, lead management, job tracking, scheduling, quoting, invoicing, online payment collection through Stripe, payment tracking, expense tracking, and QuickBooks-formatted exports for home service contractors. The Service also offers a bookkeeper partner program that gives accounting professionals read-only access to their referred clients&rsquo; financial data.</p>
                    <p>Lead2Project is a technology platform. We are not a contractor, bank, payment processor, financial advisor, tax advisor, bookkeeper, or accountant, and we do not provide financial, tax, legal, or accounting advice. Data and exports from the Service should be reviewed by a qualified professional before use in financial statements, tax filings, or business decisions.</p>
                  </div>
                ),
              },
              {
                title: '3. User Accounts',
                content: (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Account creation</h3>
                      <p>You must provide accurate, current, and complete information when you register. Accounts created with false information may be terminated without notice.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Account security</h3>
                      <p>You are responsible for keeping your login credentials confidential and for all activity under your account, including activity by team members you invite. Notify us immediately at support@lead2project.com if you suspect unauthorized use.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Bookkeeper partner accounts</h3>
                      <p>Bookkeeper partners have read-only access to financial data for contractor companies that used their referral code at signup. Partners may not modify, delete, or export data on behalf of contractors without the contractor&rsquo;s explicit consent, and must keep any client financial data they access confidential.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Account termination</h3>
                      <p>We may suspend or terminate your account for violation of these Terms, non-payment, or conduct harmful to the Service or other users. Termination does not entitle you to a refund.</p>
                    </div>
                  </div>
                ),
              },
              {
                title: '4. Subscription and Payment',
                content: (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Plans</h3>
                      <p>We offer a free plan and paid subscription plans billed monthly. Features and pricing for each plan are described on our website and may change with notice. Some paid plans may include a free trial; the length and terms of any trial are shown when you sign up.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Automatic renewal</h3>
                      <p>Paid subscriptions renew automatically at the end of each billing period. By subscribing, you authorize us to charge your payment method each period until you cancel. If a trial is offered and you provided a payment method, you will be charged when the trial ends unless you cancel first.</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4">
                      <h3 className="text-base font-black text-red-300 mb-2">Lead2Project subscription fees are non-refundable</h3>
                      <p className="text-red-300/80 text-sm">Subscription fees are non-refundable, including for partial billing periods, unused features, or account termination for violating these Terms, except where a refund is required by law. If you cancel, you keep access through the end of your current paid billing period.</p>
                    </div>
                  </div>
                ),
              },
              {
                title: '5. Collecting Payments From Your Customers',
                content: (
                  <div className="space-y-3">
                    <p>The Service lets you request and collect payments (such as deposits and balances) from your customers online. To accept card payments, you connect your own Stripe account. By connecting it, you also agree to Stripe&rsquo;s terms, including the Stripe Connected Account Agreement.</p>
                    <ul className="list-disc list-inside space-y-1.5 ml-3">
                      <li>Customer payments are processed by Stripe and deposited directly into your Stripe account. Lead2Project never holds or controls your funds.</li>
                      <li>You are the merchant for these payments. You can refund your customers through the Service or your Stripe account, and you are responsible for your own refund policy, prices, taxes, disputes, and chargebacks, and for complying with Stripe&rsquo;s rules.</li>
                      <li>Stripe&rsquo;s processing fees are charged by Stripe to your Stripe account. Lead2Project does not currently charge an additional fee on customer payments; if that changes, we will notify you at least 30 days in advance.</li>
                      <li>Payments you record manually (cash, check, Zelle, Venmo, and similar) are for your own record-keeping. Lead2Project does not process or verify them.</li>
                      <li>We are not responsible for Stripe outages, payout delays, account holds, or decisions Stripe makes about your account.</li>
                    </ul>
                  </div>
                ),
              },
              {
                title: '6. Emails to Your Customers',
                content: (
                  <div className="space-y-3">
                    <p>The Service sends emails to your customers on your behalf, including request confirmations, quotes, schedule confirmations, invoices, payment reminders, payment receipts (with the final invoice PDF when a job is paid in full), and review requests. Some of these are sent automatically when events happen in your account.</p>
                    <p>You are responsible for having your customers&rsquo; permission to contact them, for the accuracy of the content (such as prices, dates, and invoice details), and for complying with laws that apply to your communications. Do not use the Service to send spam or unsolicited marketing.</p>
                  </div>
                ),
              },
              {
                title: '7. Automation and AI Features',
                content: (
                  <div className="space-y-3">
                    <p>The Service automates some actions for you — for example, moving jobs to the next pipeline stage when a quote is sent or accepted, or when a scheduled date arrives. You are responsible for reviewing your jobs and correcting anything that doesn&rsquo;t fit your business.</p>
                    <p>Eligible plans include an AI assistant that answers questions using your account&rsquo;s data, processed by Anthropic. AI answers may be inaccurate or incomplete and are provided as-is. Check them before relying on them.</p>
                  </div>
                ),
              },
              {
                title: '8. Referral Partner Program',
                content: (
                  <div className="space-y-3">
                    <p>Bookkeeper partners who refer contractor clients may earn referral commissions as described on our partners page. The following terms apply:</p>
                    <ul className="list-disc list-inside space-y-1.5 ml-3">
                      <li>Commission rates and terms may change with 30 days&rsquo; notice</li>
                      <li>Commissions are paid only on active paying subscriptions — not on free plans, trials, or cancelled accounts</li>
                      <li>Partners earning $600 or more in a calendar year will receive a 1099 form and are responsible for taxes on commission income</li>
                      <li>Partners may not refer themselves or create fake accounts to generate commissions</li>
                      <li>We may withhold or reverse commissions for fraudulent referrals</li>
                      <li>The program may be discontinued with 30 days&rsquo; notice to active partners</li>
                    </ul>
                  </div>
                ),
              },
              {
                title: '9. QuickBooks Export and Financial Data',
                content: (
                  <ul className="list-disc list-inside space-y-1.5 ml-3">
                    <li>Exports are provided to help you organize your records and should be reviewed by a qualified accounting professional before use</li>
                    <li>We do not guarantee the accuracy, completeness, or fitness for purpose of any exported data</li>
                    <li>We are not liable for errors in exported data or decisions made based on it</li>
                    <li>QuickBooks is a registered trademark of Intuit Inc. Lead2Project is not affiliated with or endorsed by Intuit</li>
                  </ul>
                ),
              },
              {
                title: '10. Acceptable Use',
                content: (
                  <div className="space-y-3">
                    <p>You agree not to use the Service to break any law; upload malware or harmful code; attempt unauthorized access to any part of the Service or other users&rsquo; data; interfere with the Service&rsquo;s performance; collect personal information without consent; send spam or harassing messages; impersonate any person or business; commit fraud; infringe anyone&rsquo;s intellectual property or privacy rights; or reverse engineer the Service.</p>
                    <p>Violations may result in immediate termination without refund and may expose you to civil and criminal liability.</p>
                  </div>
                ),
              },
              {
                title: '11. Your Content and Data',
                content: (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Ownership</h3>
                      <p>You own the content you and your customers submit. You grant Lead2Project a limited, non-exclusive, royalty-free license to store, process, and display that content only as needed to provide the Service.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Your responsibility</h3>
                      <p>You are responsible for the content you submit and represent that you have the rights needed to submit it and that it does not violate any law or third-party rights.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Photos and media</h3>
                      <p>By uploading media you represent that you have the legal right to upload it, it contains no illegal content, and you have any consents needed from people who appear in it. Files are stored at private, unguessable links; don&rsquo;t share those links publicly.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Data after cancellation</h3>
                      <p>Cancelling your subscription does not automatically delete your data, so you can reactivate without losing history. You can request permanent deletion of your account data at any time, as described in our Privacy Policy. You are responsible for exporting any data you want to keep before requesting deletion.</p>
                    </div>
                  </div>
                ),
              },
              {
                title: '12. Intellectual Property',
                content: (
                  <p>The Service, including its software, design, text, graphics, logos, and features, is the property of Lead2Project. You may not copy, modify, distribute, sell, license, reverse engineer, or create derivative works from any part of the Service without our written permission.</p>
                ),
              },
              {
                title: '13. Third-Party Services',
                content: (
                  <p>The Service relies on third parties including Stripe, Vercel, Neon, Resend, Sentry, and Anthropic. Your use of features powered by them may also be governed by their terms. We are not responsible for the availability, accuracy, or conduct of third-party services and are not liable for damages caused by their failures.</p>
                ),
              },
              {
                title: '14. Service Availability and Disclaimers',
                content: (
                  <div className="space-y-3">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4">
                      <p className="text-sm font-black text-white">The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied.</p>
                    </div>
                    <p>We make no warranties, including implied warranties of merchantability or fitness for a particular purpose, and do not guarantee the Service will always be available, error-free, or secure. We provide no uptime guarantee and are not liable for losses caused by the Service being unavailable.</p>
                  </div>
                ),
              },
              {
                title: '15. Limitation of Liability',
                content: (
                  <div className="space-y-3">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4">
                      <p className="text-sm font-black text-red-300">To the maximum extent permitted by law, Lead2Project is not liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, revenue, data, or business.</p>
                    </div>
                    <p>Our total liability for any claim will not exceed the greater of (a) the amount you paid Lead2Project in the three months before the claim, or (b) $100.</p>
                  </div>
                ),
              },
              {
                title: '16. Indemnification',
                content: (
                  <p>You agree to defend, indemnify, and hold harmless Lead2Project and its officers, directors, employees, and agents from any claims, damages, and expenses arising from your use of the Service, your violation of these Terms, content you or your customers submit, payments you collect or refund, emails sent to your customers on your behalf, any dispute between you and your customers, or your violation of any law.</p>
                ),
              },
              {
                title: '17. Contractor–Customer Relationships',
                content: (
                  <p>Lead2Project is not a party to any agreement between you and your customers. You are solely responsible for the quality, legality, and safety of your services, your pricing, and your customer relationships. We do not screen or verify contractors. Disputes between you and your customers — including over work performed, payments, refunds, and chargebacks — are your responsibility.</p>
                ),
              },
              {
                title: '18. Dispute Resolution',
                content: (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Informal resolution first</h3>
                      <p>Before filing any formal claim, contact legal@lead2project.com and try to resolve the issue informally. We will make reasonable efforts to resolve it within 30 days.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Binding arbitration</h3>
                      <p>If informal resolution fails, disputes will be resolved by binding arbitration administered by the AAA under its Commercial Arbitration Rules in New York, NY.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Class action waiver</h3>
                      <p className="font-black text-white">You waive any right to participate in a class action or class-wide arbitration. Claims must be brought individually.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Governing law</h3>
                      <p>These Terms are governed by the laws of the State of New York. Claims must be filed within one year after the cause of action arose.</p>
                    </div>
                  </div>
                ),
              },
              {
                title: '19. Changes to Terms',
                content: (
                  <p>We may modify these Terms. Material changes will be communicated by email or a prominent notice at least 7 days before they take effect (30 days for changes to fees on customer payments). Continued use after changes take effect means you accept them.</p>
                ),
              },
              {
                title: '20. Severability and Entire Agreement',
                content: (
                  <p>If any provision of these Terms is found unenforceable, it will be modified to the minimum extent necessary and the rest will remain in effect. These Terms and our Privacy Policy are the entire agreement between you and Lead2Project regarding the Service.</p>
                ),
              },
              {
                title: '21. Contact',
                content: (
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-2 text-sm">
                    <p><span className="text-white font-black">Legal:</span> legal@lead2project.com</p>
                    <p><span className="text-white font-black">Support:</span> support@lead2project.com</p>
                    <p><span className="text-white font-black">Website:</span> lead2project.com</p>
                  </div>
                ),
              },
            ].map((section, i) => (
              <section key={i}>
                <h2 className="text-xl font-black text-white mb-4 pb-3 border-b border-slate-800">{section.title}</h2>
                <div className="text-sm leading-relaxed">{section.content}</div>
              </section>
            ))}

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}