import Link from "next/link";
import { ArrowRight, Target, Clock, FileText, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto max-w-6xl text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Nail Your Next
              <span className="text-primary"> Raise Conversation</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Practice high-stakes salary negotiations in 3-5 minute simulations.
              Get personalized scripts, avoid costly mistakes, and walk in prepared.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/try"
                className="rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-primary/90 transition-colors"
              >
                Try Free Demo
                <ArrowRight className="inline-block ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/pricing"
                className="rounded-lg border border-gray-300 px-8 py-4 text-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View Pricing
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No signup required. Try it now in 3 minutes.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Practice Matters
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-6 rounded-xl border bg-white shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Realistic Scenarios</h3>
                <p className="text-gray-600">
                  Face common pushbacks like "budget is tight" and learn optimal responses.
                </p>
              </div>
              <div className="p-6 rounded-xl border bg-white shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">3-5 Minutes</h3>
                <p className="text-gray-600">
                  Quick practice sessions that fit into your busy schedule.
                </p>
              </div>
              <div className="p-6 rounded-xl border bg-white shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Copy-Paste Scripts</h3>
                <p className="text-gray-600">
                  Get personalized talking points and follow-up emails.
                </p>
              </div>
              <div className="p-6 rounded-xl border bg-white shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">ROI Estimates</h3>
                <p className="text-gray-600">
                  See how much each decision could cost or gain you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              How It Works
            </h2>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Choose a Scenario</h3>
                  <p className="text-gray-600">
                    Pick from realistic negotiation situations like "Budget Pushback" or "Promotion Timing".
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Make Decisions</h3>
                  <p className="text-gray-600">
                    Respond to your manager's statements. Each choice leads to different outcomes.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Get Your Playbook</h3>
                  <p className="text-gray-600">
                    Receive a readiness score, risk analysis, and personalized scripts to use in your real conversation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Practice?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Your next raise conversation could be worth thousands. Prepare in minutes.
            </p>
            <Link
              href="/try"
              className="rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-primary/90 transition-colors inline-flex items-center"
            >
              Try Free Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
