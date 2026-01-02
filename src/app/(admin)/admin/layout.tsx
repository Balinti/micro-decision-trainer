import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Target, LayoutDashboard, FileText, ArrowLeft } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check admin status
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("user_id, role")
    .eq("user_id", user.id)
    .single();

  if (!adminUser) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-gray-50">
        <div className="p-4 border-b">
          <Link href="/admin" className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <span className="font-bold">Admin Panel</span>
          </Link>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            <li>
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-100"
              >
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </Link>
            </li>
            <li>
              <Link
                href="/admin/scenarios"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-100"
              >
                <FileText className="h-4 w-4" />
                Scenarios
              </Link>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 w-64 p-4 border-t">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
