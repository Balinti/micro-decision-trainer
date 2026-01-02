import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PricingTable } from "@/components/PricingTable";

export const metadata = {
  title: "Pricing - PressurePlay",
  description:
    "Choose the plan that's right for you. Start free or unlock all features with Pro.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-gray-600">
              Start free. Upgrade when you're ready to unlock everything.
            </p>
          </div>

          <PricingTable />

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <div className="max-w-2xl mx-auto text-left space-y-6">
              <div>
                <h3 className="font-semibold mb-2">
                  What's included in the free plan?
                </h3>
                <p className="text-gray-600">
                  Free users get access to one featured scenario each week, a basic
                  readiness score, and a generic playbook template. It's a great way
                  to try PressurePlay before upgrading.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-600">
                  Yes! You can cancel your Pro subscription at any time. You'll
                  continue to have access until the end of your billing period.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  What makes the personalized playbooks different?
                </h3>
                <p className="text-gray-600">
                  Personalized playbooks use your profile information (role, level,
                  location, risk tolerance) to generate tailored talking points,
                  market-specific anchor ranges, and customized email templates.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How are ROI estimates calculated?</h3>
                <p className="text-gray-600">
                  We use your compensation band, company size, and negotiation
                  performance to estimate the potential financial impact of your
                  decisions. These are educational estimates, not guarantees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
