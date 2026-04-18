"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Stats {
  users: number;
  activeSubscriptions: number;
  draws: number;
  totalPayouts: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({ users: 0, activeSubscriptions: 0, draws: 0, totalPayouts: 0 });

  useEffect(() => {
    async function load() {
      const [users, subs, draws, payouts] = await Promise.all([
        supabase.from("users_profiles").select("id", { count: "exact" }),
        supabase.from("subscriptions").select("id", { count: "exact" }).eq("status", "active"),
        supabase.from("draws").select("id", { count: "exact" }),
        supabase.from("payouts").select("amount").eq("status", "paid"),
      ]);

      const totalPayouts = (payouts.data ?? []).reduce((s: number, p: any) => s + p.amount, 0);

      setStats({
        users: users.count ?? 0,
        activeSubscriptions: subs.count ?? 0,
        draws: draws.count ?? 0,
        totalPayouts,
      });
    }
    load();
  }, []);

  const cards = [
    { label: "Total Users", value: stats.users },
    { label: "Active Subscriptions", value: stats.activeSubscriptions },
    { label: "Total Draws", value: stats.draws },
    { label: "Total Paid Out", value: `£${stats.totalPayouts.toFixed(2)}` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ label, value }) => (
          <div key={label} className="glass-card">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Manage Users", href: "/admin/users" },
          { label: "Manage Draws", href: "/admin/draws" },
          { label: "Manage Charities", href: "/admin/charities" },
          { label: "View Winners", href: "/admin/winners" },
        ].map(({ label, href }) => (
          <Link key={href} href={href} className="glass-button text-sm text-center">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
