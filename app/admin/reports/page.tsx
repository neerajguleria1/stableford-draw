"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalPrizePool: number;
  totalPaidOut: number;
  totalCharityContributions: number;
  totalDraws: number;
  completedDraws: number;
  totalScores: number;
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [users, subs, payouts, draws, scores] = await Promise.all([
        supabase.from("users_profiles").select("id", { count: "exact" }),
        supabase.from("subscriptions").select("status, plan_type, amount"),
        supabase.from("payouts").select("amount, status"),
        supabase.from("draws").select("status", { count: "exact" }),
        supabase.from("golf_scores").select("id", { count: "exact" }),
      ]);

      const activeSubs = (subs.data ?? []).filter((s) => s.status === "active");
      const monthlyRevenue = activeSubs.filter((s) => s.plan_type === "monthly").reduce((sum, s) => sum + s.amount, 0);
      const yearlyRevenue = activeSubs.filter((s) => s.plan_type === "yearly").reduce((sum, s) => sum + s.amount, 0);
      const totalRevenue = monthlyRevenue + yearlyRevenue;
      const totalCharityContributions = totalRevenue * 0.1;
      const totalPrizePool = totalRevenue * 0.9;
      const totalPaidOut = (payouts.data ?? []).filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
      const completedDraws = (draws.data ?? []).filter((d: any) => d.status === "completed").length;

      setStats({
        totalUsers: users.count ?? 0,
        activeSubscriptions: activeSubs.length,
        monthlyRevenue,
        yearlyRevenue,
        totalPrizePool,
        totalPaidOut,
        totalCharityContributions,
        totalDraws: draws.count ?? 0,
        completedDraws,
        totalScores: scores.count ?? 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" /></div>;
  if (!stats) return null;

  const sections = [
    {
      title: "Users",
      items: [
        { label: "Total Users", value: stats.totalUsers },
        { label: "Active Subscribers", value: stats.activeSubscriptions },
      ],
    },
    {
      title: "Revenue",
      items: [
        { label: "Monthly Plan Revenue", value: `£${stats.monthlyRevenue.toFixed(2)}` },
        { label: "Yearly Plan Revenue", value: `£${stats.yearlyRevenue.toFixed(2)}` },
        { label: "Total Revenue", value: `£${(stats.monthlyRevenue + stats.yearlyRevenue).toFixed(2)}` },
      ],
    },
    {
      title: "Prize Pool",
      items: [
        { label: "Total Prize Pool (90%)", value: `£${stats.totalPrizePool.toFixed(2)}` },
        { label: "Total Paid Out", value: `£${stats.totalPaidOut.toFixed(2)}` },
        { label: "Remaining Pool", value: `£${(stats.totalPrizePool - stats.totalPaidOut).toFixed(2)}` },
      ],
    },
    {
      title: "Charity",
      items: [
        { label: "Total Contributions (10%)", value: `£${stats.totalCharityContributions.toFixed(2)}` },
      ],
    },
    {
      title: "Draws",
      items: [
        { label: "Total Draws Run", value: stats.totalDraws },
        { label: "Completed Draws", value: stats.completedDraws },
      ],
    },
    {
      title: "Scores",
      items: [
        { label: "Total Scores Submitted", value: stats.totalScores },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Reports & Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map(({ title, items }) => (
          <div key={title} className="glass-card space-y-3">
            <h3 className="font-medium text-purple-400 text-sm uppercase tracking-wider">{title}</h3>
            {items.map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
