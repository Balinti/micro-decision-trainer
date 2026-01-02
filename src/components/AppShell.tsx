"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Target,
  LayoutDashboard,
  Library,
  CheckSquare,
  User,
  LogOut,
  Menu,
  X,
  Crown,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  isPro?: boolean;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/library", label: "Scenarios", icon: Library },
  { href: "/actions", label: "Actions", icon: CheckSquare },
  { href: "/account", label: "Account", icon: User },
];

export function AppShell({ children, isPro = false }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white">
        <div className="p-4 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">PressurePlay</span>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t">
          {!isPro && (
            <Link href="/upgrade" className="block mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="h-4 w-4" />
                  <span className="font-medium text-sm">Upgrade to Pro</span>
                </div>
                <p className="text-xs opacity-90">
                  Unlock all scenarios & personalization
                </p>
              </div>
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">PressurePlay</span>
          </Link>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t p-4 bg-white">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {!isPro && (
              <Link
                href="/upgrade"
                className="block mt-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    <span className="font-medium text-sm">Upgrade to Pro</span>
                  </div>
                </div>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 w-full mt-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Log out
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 md:overflow-auto">
        <div className="md:hidden h-16" /> {/* Spacer for mobile header */}
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
