import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: April 3, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using Lead2Project ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed">
              Lead2Project is a lead management and customer relationship platform designed for home service providers. The Service allows businesses to collect, manage, and track customer leads, projects, quotes, payments, and communications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Account Creation</h3>
                <p className="text-gray-700 leading-relaxed">
                  To use certain features of the Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Account Security</h3>
                <p className="text-gray-700 leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Account Termination</h3>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to suspend or terminate your account at any time for any reason, including violation of these Terms, without prior notice.
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
                  We offer various subscription plans with different features and pricing. The specific features and pricing for each plan are described on our website.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Terms</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  By subscribing to a paid plan, you agree to the following:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Subscriptions are billed in advance on a monthly or annual basis</li>
                  <li>You will provide current, complete, and accurate billing information</li>
                  <li>You authorize us to charge your payment method for all fees</li>
                  <li>Failure to pay may result in suspension or termination of your account</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Automatic Renewal</h3>
                <p className="text-gray-700 leading-relaxed">
                  Your subscription will automatically renew at the end of each billing period unless you cancel before the renewal date. We will charge your payment method on file for the renewal.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Cancellation and Refunds</h3>
                <p className="text-gray-700 leading-relaxed">
                  You may cancel your subscription at any time. Cancellations take effect at the end of the current billing period. All sales are final. We do not provide refunds for any reason, including partial months, unused portions of the Service, or early cancellation, except as required by applicable law. By subscribing, you acknowledge and agree to this no-refund policy.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Acceptable Use</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
              <li>Use the Service for any illegal purpose or in violation of any laws</li>
              <li>Upload or transmit viruses, malware, or other malicious code</li>
              <li>Attempt to gain unauthorized access to the Service or related systems</li>
              <li>Interfere with or disrupt the Service or servers or networks</li>
              <li>Collect or harvest any information from other users</li>
              <li>Use the Service to send spam or unsolicited communications</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
  <h2 className="text-2xl font-bold text-gray-900 mb-4">6b. Photo and Media Uploads</h2>
  <p className="text-gray-700 leading-relaxed">
    The Service allows customers of our subscribers to upload photos, videos, and other media files ("Media") as part of submitting service requests. By uploading Media through the Service, you represent and warrant that you have all necessary rights to upload and share such Media. Lead2Project is not responsible for any Media uploaded by users or their customers. We store Media solely to facilitate the delivery of the Service and do not claim ownership of any uploaded Media. Media may be retained for up to 30 days after account cancellation before being permanently deleted.
  </p>
</section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. User Content</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Ownership</h3>
                <p className="text-gray-700 leading-relaxed">
                  You retain ownership of all content you submit to the Service ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, store, display, and distribute your User Content as necessary to provide the Service.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Responsibility</h3>
                <p className="text-gray-700 leading-relaxed">
                  You are solely responsible for your User Content and the consequences of posting or publishing it. You represent and warrant that you own or have the necessary rights to all User Content you submit.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Content Removal</h3>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to remove any User Content that violates these Terms or that we deem inappropriate, without prior notice.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              The Service and its original content, features, and functionality are owned by Lead2Project and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of our Service without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed">
              The Service may integrate with or contain links to third-party services, websites, or content. We are not responsible for and do not endorse any third-party services. Your use of third-party services is at your own risk and subject to their terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimers</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-gray-700 leading-relaxed font-semibold mb-2">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We disclaim all warranties, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be uninterrupted, secure, or error-free.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <p className="text-gray-700 leading-relaxed">
                To the maximum extent permitted by law, Lead2Project shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                <li>Your use or inability to use the Service</li>
                <li>Any unauthorized access to or use of our servers</li>
                <li>Any interruption or cessation of the Service</li>
                <li>Any bugs, viruses, or other harmful code transmitted through the Service</li>
                <li>Any errors or omissions in any content</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Lead2Project and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising out of or in any way connected with your access to or use of the Service or your violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Dispute Resolution</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Governing Law</h3>
                <p className="text-gray-700 leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law provisions.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Arbitration</h3>
                <p className="text-gray-700 leading-relaxed">
                  Any dispute arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall take place in New York, NY.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Severability</h2>
            <p className="text-gray-700 leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Entire Agreement</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms constitute the entire agreement between you and Lead2Project regarding the Service and supersede all prior agreements and understandings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-gray-700">
                <strong>Email:</strong> legal@lead2project.com
              </p>
              
              <p className="text-gray-700">
                <strong>Address:</strong> Lead2Project, New York, NY
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}