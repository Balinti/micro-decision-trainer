import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleAuth from "@/components/GoogleAuth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Micro Decision Trainer",
  description: "Train your brain to make faster, better decisions with quick micro-exercises",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-purple-500/20">
          <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
            <span className="text-purple-200 font-semibold">Micro Decision Trainer</span>
            <GoogleAuth />
          </div>
        </header>
        <div className="pt-14">
          {children}
        </div>
      </body>
    </html>
  );
}
