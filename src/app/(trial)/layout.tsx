import { Navbar } from "@/components/Navbar";

export default function TrialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
