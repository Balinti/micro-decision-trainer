"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

interface TrialExpiredModalProps {
  isOpen: boolean;
  isCompleted?: boolean;
}

export function TrialExpiredModal({ isOpen, isCompleted }: TrialExpiredModalProps) {
  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl p-6 shadow-xl z-50 focus:outline-none">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>

            <Dialog.Title className="text-xl font-bold text-gray-900 mb-2">
              {isCompleted
                ? "Great job! See your results"
                : "Your trial has ended"}
            </Dialog.Title>

            <Dialog.Description className="text-gray-600 mb-6">
              {isCompleted
                ? "Sign up to view your personalized playbook with talking points and scripts for your negotiation."
                : "Sign up for free to continue practicing and see your personalized results. No credit card required."}
            </Dialog.Description>

            <div className="space-y-3">
              <Link
                href="/signup?redirect=/try-convert"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-semibold hover:bg-primary/90 transition-colors"
              >
                Sign Up Free
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/login?redirect=/try-convert"
                className="w-full flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Already have an account? Log in
              </Link>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Your progress will be saved when you sign up
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
