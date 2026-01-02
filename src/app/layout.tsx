import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/QueryProvider";
import { PostHogProvider } from "@/components/PostHogProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PressurePlay - Negotiation Flight Simulator",
  description:
    "Practice raise and promotion conversations in 3-5 minutes. Get copy/paste scripts and track your readiness.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PostHogProvider>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
