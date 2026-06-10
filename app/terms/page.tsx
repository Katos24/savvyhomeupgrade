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
            <p className="text-slate-400 font-bold">Last updated: June 10, 2026</p>
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
                  <p>By accessing or using Lead2Project ("Service"), you agree to be bound by these Terms of Service. These Terms apply to all users including contractors, bookkeeper partners, and end customers. If you are using the Service on behalf of a business, you represent that you have authority to bind that business to these Terms.</p>
                ),
              },
              {
                title: '2. Description of Service',
                content: (
                  <div className="space-y-3">
                    <p>Lead2Project is a software-as-a-service platform providing lead management, job tracking, quoting, invoicing, financial organization, and QuickBooks export tools for home service contractors. The Service also provides a bookkeeper partner program allowing accounting professionals to access their referred clients' financial data.</p>
                    <p>Lead2Project is a technology platform only. We are not a contractor, financial advisor, tax advisor, bookkeeper, or accountant. We do not process payments between contractors and their customers. We do not provide financial, tax, legal, or accounting advice. All data and exports from Lead2Project should be reviewed by a qualified professional before use in financial statements, tax filings, or business decisions.</p>
                  </div>
                ),
              },
              {
                title: '3. User Accounts',
                content: (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Account creation</h3>
                      <p>You must provide accurate, current, and complete information during registration. Accounts created with false information may be terminated without notice.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Account security</h3>
                      <p>You are solely responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Notify us immediately at support@lead2project.com of any suspected unauthorized use.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Bookkeeper partner accounts</h3>
                      <p>Bookkeeper partners who create accounts agree that their access is limited to read-only viewing of financial data for contractor companies that used their referral code at signup. Bookkeeper partners may not modify, delete, or export data on behalf of contractors without the contractor's explicit consent. Partners are responsible for maintaining the confidentiality of any client financial data they access through the Service.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Account termination</h3>
                      <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms, non-payment, or conduct harmful to the Service or other users. Termination does not entitle you to any refund.</p>
                    </div>
                  </div>
                ),
              },
              {
                title: '4. Subscription and Payment',
                content: (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Subscription plans</h3>
                      <p>We offer subscription plans billed on a monthly basis. Features and pricing for each plan are described on our website and are subject to change with notice.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Free trial</h3>
                      <p>We offer a 14-day free trial. Your payment method will be charged automatically at the end of the trial period unless you cancel before the trial ends.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Automatic renewal</h3>
                      <p>Subscriptions automatically renew at the end of each billing period. By subscribing, you authorize us to charge your payment method for each renewal period until you cancel.</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4">
                      <h3 className="text-base font-black text-red-300 mb-2">No refund policy</h3>
                      <p className="text-red-300/80 text-sm">All sales are final. We do not provide refunds under any circumstances including dissatisfaction with the Service, failure to use the Service, account termination due to Terms violations, or cancellation before the end of a billing period. If you cancel, you retain access through the end of your current paid billing period.</p>
                    </div>
                  </div>
                ),
              },
              {
                title: '5. Referral Partner Program',
                content: (
                  <div className="space-y-3">
                    <p>Lead2Project operates a bookkeeper partner referral program. Partners who refer contractor clients may be eligible to earn referral commissions as described on our partners page. The following terms apply to the referral program:</p>
                    <ul className="list-disc list-inside space-y-1.5 ml-3">
                      <li>Commission rates and terms are subject to change with 30 days notice</li>
                      <li>Commissions are paid only on active paying subscriptions — not on free trials or cancelled accounts</li>
                      <li>Partners who earn over $600 in a calendar year will receive a 1099 form and are responsible for reporting and paying applicable taxes on commission income</li>
                      <li>Partners may not refer themselves or create fake accounts to generate commissions</li>
                      <li>Lead2Project reserves the right to withhold or reverse commissions for fraudulent referrals</li>
                      <li>The referral program may be discontinued at any time with 30 days notice to active partners</li>
                    </ul>
                  </div>
                ),
              },
              {
                title: '6. QuickBooks Export and Financial Data',
                content: (
                  <div className="space-y-3">
                    <p>Lead2Project provides QuickBooks-formatted CSV exports and AI-powered line item classification as tools to help contractors organize their financial records. The following terms apply:</p>
                    <ul className="list-disc list-inside space-y-1.5 ml-3">
                      <li>AI line item classifications are suggestions only and may contain errors</li>
                      <li>All exported data should be reviewed by a qualified accounting professional before use</li>
                      <li>Lead2Project does not guarantee the accuracy, completeness, or fitness for purpose of any exported data</li>
                      <li>Lead2Project assumes no liability for errors in exported data or decisions made based on that data</li>
                      <li>QuickBooks is a registered trademark of Intuit Inc. Lead2Project is not affiliated with or endorsed by Intuit</li>
                    </ul>
                  </div>
                ),
              },
              {
                title: '7. Acceptable Use',
                content: (
                  <div className="space-y-3">
                    <p>You agree not to use the Service to violate any applicable laws, upload malware or harmful code, attempt unauthorized access to any part of the Service, interfere with Service integrity or performance, collect personal information from other users without consent, send spam or harassing messages, impersonate any person or business, use the Service for fraudulent purposes, violate any third party's intellectual property or privacy rights, or reverse engineer any part of the Service.</p>
                    <p>Violation may result in immediate account termination without refund and may expose you to civil and criminal liability.</p>
                  </div>
                ),
              },
              {
                title: '8. User Content and Data',
                content: (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Ownership</h3>
                      <p>You retain ownership of all content you submit. By submitting content you grant Lead2Project a limited, non-exclusive, royalty-free license to store, process, and display your content solely as necessary to provide the Service.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Your responsibility</h3>
                      <p>You are solely responsible for all content you submit. You represent that you have all rights necessary to submit such content and that your content does not violate any law or third-party rights.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Photo and media uploads</h3>
                      <p>By uploading media you represent that you own or have legal right to upload it, it does not contain illegal content, and you have obtained all necessary consents from individuals who appear in it. Lead2Project assumes no responsibility for uploaded media. Any liability arising from media uploads rests solely with the user who uploaded it.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Data retention after cancellation</h3>
                      <p>Upon cancellation, your data is retained for 30 days. After 30 days all data is permanently and irreversibly deleted. Lead2Project is not responsible for data loss following this period.</p>
                    </div>
                  </div>
                ),
              },
              {
                title: '9. Intellectual Property',
                content: (
                  <p>The Service including all software, design, text, graphics, logos, and features is the exclusive property of Lead2Project. You may not copy, modify, distribute, sell, license, reverse engineer, or create derivative works based on any part of the Service without our express written permission.</p>
                ),
              },
              {
                title: '10. Third-Party Services',
                content: (
                  <p>The Service integrates with Stripe, Vercel, Resend, Neon, Sentry, Anthropic, and others. Your use of these services is governed by their respective terms. Lead2Project is not responsible for the availability, accuracy, or conduct of any third-party service and accepts no liability for resulting damages from third-party failures.</p>
                ),
              },
              {
                title: '11. Service Availability and Disclaimers',
                content: (
                  <div className="space-y-3">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4">
                      <p className="text-sm font-black text-white">The Service is provided "as is" and "as available" without warranty of any kind, express or implied.</p>
                    </div>
                    <p>Lead2Project makes no warranties including implied warranties of merchantability or fitness for a particular purpose. We do not warrant that the Service will be available at all times, error-free, or secure. We provide no SLA and make no guarantees regarding uptime. Lead2Project shall not be liable for any losses resulting from Service unavailability.</p>
                  </div>
                ),
              },
              {
                title: '12. Limitation of Liability',
                content: (
                  <div className="space-y-3">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4">
                      <p className="text-sm font-black text-red-300">To the maximum extent permitted by law, Lead2Project shall not be liable for any indirect, incidental, special, consequential, or punitive damages including loss of profits, revenue, data, or business.</p>
                    </div>
                    <p>In no event shall Lead2Project's total liability exceed the greater of: (a) the total amount you paid to Lead2Project in the three months preceding the claim, or (b) $100.00.</p>
                  </div>
                ),
              },
              {
                title: '13. Indemnification',
                content: (
                  <p>You agree to defend, indemnify, and hold harmless Lead2Project and its officers, directors, employees, and agents from any claims, damages, and expenses arising from your use of the Service, your violation of these Terms, any content you submit, any media you or your customers upload, any dispute between you and your customers, or your violation of any applicable law.</p>
                ),
              },
              {
                title: '14. Contractor-Customer Relationships',
                content: (
                  <p>Lead2Project is not a party to any agreement between you and your customers. You are solely responsible for the quality, legality, and safety of all services you provide. Lead2Project does not screen or verify any contractor. All disputes between contractors and their customers are solely the contractor's responsibility. Lead2Project has no involvement in financial transactions between contractors and their customers.</p>
                ),
              },
              {
                title: '15. Dispute Resolution',
                content: (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Informal resolution first</h3>
                      <p>Before filing any formal legal claim, contact legal@lead2project.com and attempt to resolve informally. We will make reasonable efforts to resolve within 30 days.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Binding arbitration</h3>
                      <p>If informal resolution fails, disputes shall be resolved through binding arbitration administered by the AAA under its Commercial Arbitration Rules in New York, NY.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Class action waiver</h3>
                      <p className="font-black text-white">You waive any right to participate in a class action lawsuit or class-wide arbitration. All claims must be brought on an individual basis only.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white mb-2">Governing law</h3>
                      <p>These Terms are governed by the laws of the State of New York. Claims must be filed within one year after the cause of action arose.</p>
                    </div>
                  </div>
                ),
              },
              {
                title: '16. Changes to Terms',
                content: (
                  <p>We may modify these Terms at any time. Material changes will be communicated via email or prominent notice at least 7 days before taking effect. Continued use of the Service after changes take effect constitutes acceptance.</p>
                ),
              },
              {
                title: '17. Severability and Entire Agreement',
                content: (
                  <p>If any provision of these Terms is found unenforceable it shall be modified to the minimum extent necessary and remaining provisions continue in full force. These Terms together with our Privacy Policy constitute the entire agreement between you and Lead2Project regarding the Service.</p>
                ),
              },
              {
                title: '18. Contact',
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