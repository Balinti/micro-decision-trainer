import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy - PressurePlay",
  description: "Learn how PressurePlay collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl prose prose-gray">
          <h1>Privacy Policy</h1>
          <p className="text-gray-500">Last updated: January 2026</p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, including:
          </p>
          <ul>
            <li>Account information (email, name)</li>
            <li>Profile information (role, level, industry, location, compensation band)</li>
            <li>Usage data (scenarios completed, decisions made, session data)</li>
            <li>Payment information (processed securely by Stripe)</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Personalize your experience and generate tailored playbooks</li>
            <li>Process transactions and send related information</li>
            <li>Send you technical notices, updates, and support messages</li>
            <li>Analyze usage patterns to improve our scenarios and features</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>
            We do not sell your personal information. We may share information with:
          </p>
          <ul>
            <li>Service providers who assist in our operations (hosting, payment processing, analytics)</li>
            <li>Law enforcement when required by law</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect
            your personal information. Your data is stored securely using
            industry-standard encryption and access controls.
          </p>

          <h2>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data</li>
            <li>Opt out of marketing communications</li>
          </ul>

          <h2>6. Cookies and Analytics</h2>
          <p>
            We use cookies and similar technologies to analyze usage patterns and
            improve our service. You can control cookie preferences through your
            browser settings.
          </p>

          <h2>7. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li>Supabase for authentication and data storage</li>
            <li>Stripe for payment processing</li>
            <li>PostHog for analytics</li>
            <li>Resend for email delivery</li>
            <li>Sentry for error monitoring</li>
          </ul>

          <h2>8. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. Upon account
            deletion, we will delete or anonymize your personal data within 30 days,
            unless required by law to retain it longer.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you
            of any material changes by posting the new policy on this page and
            updating the "Last updated" date.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy, please contact us at
            privacy@pressureplay.app.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
