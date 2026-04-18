"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Overview", href: "/admin" },
  { label: "Run Draw", href: "/admin/draw" },
  { label: "Users", href: "/admin/users" },
  { label: "Draws", href: "/admin/draws" },
  { label: "Charities", href: "/admin/charities" },
  { label: "Winners", href: "/admin/winners" },
  { label: "Reports", href: "/admin/reports" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return router.push("/auth/login");

      const { data: profile } = await supabase
        .from("users_profiles")
        .select("role, email")
        .eq("user_id", data.session.user.id)
        .single();

      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      const isAdmin = profile?.role === "admin" || data.session.user.email === adminEmail;

      if (!isAdmin) return router.push("/dashboard");
      setChecking(false);
    });
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Admin Panel</h1>
        </div>
        <nav className="flex gap-2 flex-wrap border-b border-white/10 pb-4">
          {NAV.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-purple-600 text-white"
                  : "text-muted-foreground hover:text-white hover:bg-white/10"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
