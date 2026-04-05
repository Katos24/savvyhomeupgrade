import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: April 3, 2026</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-gray-800 font-semibold text-sm leading-relaxed">
              PLEASE READ THESE TERMS CAREFULLY. BY CREATING AN ACCOUNT OR USING LEAD2PROJECT, YOU AGREE TO BE LEGALLY BOUND BY THESE TERMS. IF YOU DO NOT AGREE, DO NOT USE THE SERVICE.
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using Lead2Project ("Service," "Platform," or "we"), you agree to be bound by these Terms of Service ("Terms"). These Terms apply to all users, including business owners, contractors, and their end customers. If you are using the Service on behalf of a business, you represent that you have authority to bind that business to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Lead2Project is a software-as-a-service (SaaS) platform that provides lead management, customer relationship, and business operation tools for home service professionals and contractors. The Service allows subscribers to collect and manage customer inquiries, track projects, send quotes, and communicate with clients. Lead2Project does not process, handle, facilitate, or hold any payments between contractors and their customers. All payment transactions between contractors and their end customers occur entirely outside of our platform and are solely the responsibility of the contractor.            </p>
            <p className="text-gray-700 leading-relaxed">
              Lead2Project is a technology platform only. We are not a contractor, home service provider, or party to any agreement between our subscribers and their customers. We do not verify, endorse, or guarantee the quality of work performed by any contractor using our platform. Any disputes between a contractor and their customer are solely between those parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Account Creation</h3>
                <p className="text-gray-700 leading-relaxed">
                  You must provide accurate, current, and complete information during registration. You agree to maintain and promptly update your account information. Accounts created with false information may be terminated without notice.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Account Security</h3>
                <p className="text-gray-700 leading-relaxed">
                  You are solely responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Lead2Project will not be liable for any loss or damage arising from unauthorized access to your account resulting from your failure to safeguard your credentials. You must notify us immediately at support@lead2project.com of any suspected unauthorized use.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Account Termination</h3>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to suspend or terminate your account at any time, for any reason, including but not limited to violation of these Terms, non-payment, or conduct we determine to be harmful to the Service or other users. Termination does not entitle you to any refund.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription and Payment</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Subscription Plans</h3>
                <p className="text-gray-700 leading-relaxed">
                  We offer subscription plans billed on a monthly basis. Features and pricing for each plan are described on our website and are subject to change with notice.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Free Trial</h3>
                <p className="text-gray-700 leading-relaxed">
                  We offer a 14-day free trial. Your payment method will be charged automatically at the end of the trial period unless you cancel before the trial ends. We will send a reminder email 48 hours before your trial expires.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Terms</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  By subscribing, you authorize Lead2Project to charge your payment method on a recurring basis. You must provide valid, current billing information. Failure to maintain valid payment information may result in immediate suspension of your account.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Automatic Renewal</h3>
                <p className="text-gray-700 leading-relaxed">
                  Subscriptions automatically renew at the end of each billing period. By subscribing, you authorize us to charge your payment method for each renewal period until you cancel.
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Refund Policy</h3>
                <p className="text-gray-700 leading-relaxed">
                  ALL SALES ARE FINAL. WE DO NOT PROVIDE REFUNDS UNDER ANY CIRCUMSTANCES, including but not limited to: dissatisfaction with the Service, failure to use the Service, account termination due to Terms violations, cancellation before the end of a billing period, or technical issues outside our reasonable control. By subscribing, you explicitly acknowledge and agree to this no-refund policy. If you cancel, you will retain access through the end of your current paid billing period, after which your account will be deactivated. This no-refund policy applies to the fullest extent permitted by applicable law.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Acceptable Use</h2>
            <p className="text-gray-700 leading-relaxed mb-3">You agree not to use the Service to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Violate any applicable federal, state, or local laws or regulations</li>
              <li>Upload or transmit viruses, malware, or any malicious or harmful code</li>
              <li>Attempt to gain unauthorized access to any part of the Service or related systems</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
              <li>Collect or harvest personal information from other users without consent</li>
              <li>Send spam, unsolicited communications, or harassing messages</li>
              <li>Impersonate any person, entity, or business</li>
              <li>Use the Service for any fraudulent or deceptive purpose</li>
              <li>Violate any third party's intellectual property, privacy, or other rights</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Violation of this section may result in immediate account termination without refund and may expose you to civil and criminal liability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. User Content and Data</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Ownership</h3>
                <p className="text-gray-700 leading-relaxed">
                  You retain ownership of all content you submit to the Service. By submitting content, you grant Lead2Project a limited, non-exclusive, royalty-free license to store, process, and display your content solely as necessary to provide the Service.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Responsibility for Content</h3>
                <p className="text-gray-700 leading-relaxed">
                  You are solely and exclusively responsible for all content you submit, upload, or transmit through the Service. You represent and warrant that you have all rights necessary to submit such content, that your content does not violate any law or third-party rights, and that your content is accurate. Lead2Project does not review, verify, or endorse any user content and expressly disclaims all liability arising from user content.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Photo and Media Uploads</h3>
                <p className="text-gray-700 leading-relaxed">
                  The Service allows subscribers and their customers to upload photos, videos, and other media files ("Media"). By uploading Media, you represent and warrant that: (a) you own or have the legal right to upload and share such Media; (b) the Media does not contain any content that is illegal, obscene, defamatory, or invasive of another person's privacy; (c) you have obtained all necessary consents from any individuals who may appear in the Media; and (d) the Media does not violate any applicable privacy laws, including but not limited to laws governing recording of individuals on private property.
                </p>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Lead2Project assumes no responsibility for Media uploaded by users or their customers. Any liability arising from the upload, storage, or use of Media — including claims related to privacy violations, unauthorized recording, or misuse of images of individuals or property — rests solely with the user who uploaded the Media. You agree to indemnify and hold Lead2Project harmless from any claims arising from your Media uploads.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Data Retention After Cancellation</h3>
                <p className="text-gray-700 leading-relaxed">
                  Upon account cancellation or termination, your data will be retained for 30 days to allow for account recovery. After 30 days, all data including leads, photos, and account information will be permanently and irreversibly deleted. Lead2Project is not responsible for any data loss following this period.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              The Service, including all software, design, text, graphics, logos, and features, is the exclusive property of Lead2Project and is protected by intellectual property laws. You may not copy, modify, distribute, sell, license, reverse engineer, or create derivative works based on any part of the Service without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed">
              The Service integrates with third-party services including Stripe (payments), Vercel (hosting), Resend (email), and others. Your use of these third-party services is governed by their respective terms and privacy policies. Lead2Project is not responsible for the availability, accuracy, or conduct of any third-party service. Any issues arising from third-party service failures, outages, or errors are outside our control and we accept no liability for resulting damages or losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Service Availability and Disclaimers</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 space-y-3">
              <p className="text-gray-700 leading-relaxed font-semibold">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Lead2Project makes no warranties, express or implied, including but not limited to: implied warranties of merchantability, fitness for a particular purpose, title, or non-infringement. We do not warrant that:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>The Service will be available at all times or without interruption</li>
                <li>The Service will be error-free, bug-free, or secure</li>
                <li>Any data transmitted through the Service will be transmitted securely or without loss</li>
                <li>Defects in the Service will be corrected within any specific timeframe</li>
                <li>The Service will meet your specific business requirements or expectations</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We provide no Service Level Agreement (SLA) and make no guarantees regarding uptime, response time, or availability. Scheduled or unscheduled maintenance, outages, or downtime may occur at any time. Lead2Project shall not be liable for any losses, lost revenue, missed opportunities, or damages of any kind resulting from Service unavailability or interruption.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 space-y-3">
              <p className="text-gray-700 leading-relaxed font-semibold">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, LEAD2PROJECT AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, LICENSORS, AND SERVICE PROVIDERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES WHATSOEVER.
              </p>
              <p className="text-gray-700 leading-relaxed">
                This includes but is not limited to damages for:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Loss of profits, revenue, data, business, or goodwill</li>
                <li>Business interruption or loss of business opportunity</li>
                <li>Unauthorized access to or alteration of your data</li>
                <li>Statements or conduct of any third party using the Service</li>
                <li>Bugs, viruses, or harmful code transmitted through the Service</li>
                <li>Errors, omissions, or inaccuracies in any content</li>
                <li>Service outages, downtime, or unavailability</li>
                <li>Disputes between contractors and their customers</li>
                <li>Any matter beyond our reasonable control</li>
              </ul>
              <div className="mt-3 p-3 bg-red-100 rounded-lg">
                <p className="text-gray-800 font-bold leading-relaxed">
                  LIABILITY CAP: IN NO EVENT SHALL LEAD2PROJECT'S TOTAL CUMULATIVE LIABILITY TO YOU FOR ANY AND ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE EXCEED THE GREATER OF: (A) THE TOTAL AMOUNT YOU PAID TO LEAD2PROJECT IN THE THREE (3) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100.00), WHICHEVER IS LESS.
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">
                Some jurisdictions do not allow the exclusion or limitation of certain damages. In such jurisdictions, our liability shall be limited to the maximum extent permitted by law.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              You agree to defend, indemnify, and hold harmless Lead2Project and its officers, directors, employees, contractors, agents, licensors, and service providers from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or related to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Your use of or inability to use the Service</li>
              <li>Your violation of these Terms</li>
              <li>Any content you submit, upload, or transmit through the Service</li>
              <li>Any Media you or your customers upload, including claims related to privacy, consent, or unauthorized recording</li>
              <li>Any dispute between you and your customers, clients, or third parties</li>
              <li>Your violation of any applicable law, regulation, or third-party right</li>
              <li>Any misrepresentation you make in connection with the Service</li>
              <li>Any work, services, or obligations you perform for your customers through or in connection with the Service</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Lead2Project reserves the right to assume exclusive control of any matter subject to indemnification by you, in which case you agree to cooperate fully with our defense of such claims.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contractor-Customer Relationships</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Lead2Project is a technology platform only. We are not a party to any agreement, transaction, or relationship between you (the contractor or business) and your customers. You acknowledge and agree that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>You are solely responsible for the quality, legality, and safety of all services you provide to your customers</li>
              <li>Lead2Project does not screen, verify, license, or certify any contractor using the Service</li>
              <li>Any disputes, claims, or legal actions arising between you and your customers — including disputes over payment, quality of work, or services rendered — are solely your responsibility. Lead2Project does not process, mediate, or have any involvement in financial transactions between contractors and their customers.</li>
              <li>Lead2Project shall not be liable for any damages arising from services performed by contractors using our platform</li>
              <li>You are responsible for complying with all applicable licensing, insurance, bonding, and regulatory requirements in your jurisdiction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Dispute Resolution</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Informal Resolution First</h3>
                <p className="text-gray-700 leading-relaxed">
                  Before filing any formal legal claim, you agree to contact Lead2Project at legal@lead2project.com and attempt to resolve the dispute informally. We will make reasonable efforts to resolve disputes within 30 days of notification.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Binding Arbitration</h3>
                <p className="text-gray-700 leading-relaxed">
                  If informal resolution fails, any dispute, claim, or controversy arising out of or relating to these Terms or the Service shall be resolved exclusively through binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. The arbitration shall take place in New York, NY. The arbitrator's decision shall be final and binding and may be entered as a judgment in any court of competent jurisdiction.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Class Action Waiver</h3>
                <p className="text-gray-700 leading-relaxed font-semibold">
                  YOU WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION AGAINST LEAD2PROJECT. ALL CLAIMS MUST BE BROUGHT ON AN INDIVIDUAL BASIS ONLY.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Governing Law</h3>
                <p className="text-gray-700 leading-relaxed">
                  These Terms are governed by the laws of the State of New York, without regard to conflict of law principles. For any matters not subject to arbitration, you consent to the exclusive jurisdiction of the state and federal courts located in New York County, New York.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Time Limitation on Claims</h3>
                <p className="text-gray-700 leading-relaxed">
                  Any claim arising out of or related to these Terms or the Service must be filed within one (1) year after the cause of action arose. Claims filed after this period are permanently barred.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. Material changes will be communicated via email or prominent notice within the Service at least 7 days before taking effect. Your continued use of the Service after changes take effect constitutes acceptance of the updated Terms. If you do not agree to updated Terms, you must cancel your subscription before the changes take effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Severability</h2>
            <p className="text-gray-700 leading-relaxed">
              If any provision of these Terms is found to be invalid, illegal, or unenforceable, that provision shall be modified to the minimum extent necessary to make it enforceable, and the remaining provisions shall continue in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Entire Agreement</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Lead2Project regarding the Service and supersede all prior agreements, representations, and understandings. No waiver of any provision of these Terms shall be effective unless in writing and signed by Lead2Project.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              For questions about these Terms, contact us at:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-gray-700"><strong>Email:</strong> legal@lead2project.com</p>
              <p className="text-gray-700"><strong>Address:</strong> Lead2Project, New York, NY</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}