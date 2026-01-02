import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Terms of Service - PressurePlay",
  description: "Read the terms and conditions for using PressurePlay.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl prose prose-gray">
          <h1>Terms of Service</h1>
          <p className="text-gray-500">Last updated: January 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using PressurePlay ("the Service"), you agree to be
            bound by these Terms of Service. If you do not agree to these terms,
            please do not use the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            PressurePlay is a negotiation practice platform that provides
            interactive scenarios, personalized feedback, and educational resources
            to help users prepare for salary and promotion conversations.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account
            credentials and for all activities that occur under your account. You
            must provide accurate and complete information when creating an account.
          </p>

          <h2>4. Subscription and Billing</h2>
          <p>
            Pro subscriptions are billed on a recurring basis (monthly or annually).
            You can cancel at any time, and your subscription will remain active
            until the end of the current billing period. Refunds are provided in
            accordance with our refund policy.
          </p>

          <h2>5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any illegal purpose</li>
            <li>Share your account credentials with others</li>
            <li>Attempt to reverse engineer or copy the Service</li>
            <li>Interfere with the proper functioning of the Service</li>
            <li>Use automated means to access the Service without permission</li>
          </ul>

          <h2>6. Intellectual Property</h2>
          <p>
            All content, scenarios, and materials on PressurePlay are protected by
            copyright and other intellectual property rights. You may not reproduce,
            distribute, or create derivative works without our permission.
          </p>

          <h2>7. Disclaimer</h2>
          <p>
            PressurePlay provides educational scenarios and estimates for practice
            purposes only. We do not guarantee any specific outcomes in your actual
            negotiations. The readiness scores and ROI estimates are for educational
            purposes and should not be relied upon as financial or legal advice.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, PressurePlay shall not be liable
            for any indirect, incidental, special, consequential, or punitive damages,
            or any loss of profits or revenues, whether incurred directly or
            indirectly.
          </p>

          <h2>9. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless PressurePlay and its officers,
            directors, employees, and agents from any claims, damages, or expenses
            arising from your use of the Service or violation of these terms.
          </p>

          <h2>10. Modifications to Service</h2>
          <p>
            We reserve the right to modify or discontinue the Service at any time,
            with or without notice. We will make reasonable efforts to notify users
            of significant changes.
          </p>

          <h2>11. Termination</h2>
          <p>
            We may terminate or suspend your account at any time for violations of
            these terms or for any other reason at our discretion. Upon termination,
            your right to use the Service will immediately cease.
          </p>

          <h2>12. Governing Law</h2>
          <p>
            These terms shall be governed by and construed in accordance with the
            laws of the State of Delaware, without regard to its conflict of law
            provisions.
          </p>

          <h2>13. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the Service
            after changes constitutes acceptance of the new terms.
          </p>

          <h2>14. Contact</h2>
          <p>
            For questions about these terms, please contact us at legal@pressureplay.app.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
