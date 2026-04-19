"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { CreditCard, Flag, Heart, Trophy } from "lucide-react";

interface DashboardData {
  subscription: { status: string; plan_type: string } | null;
  scoreCount: number;
  charity: { name: string } | null;
  totalWinnings: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuthStore();
  const [data, setData] = useState<DashboardData>({
    subscription: null,
    scoreCount: 0,
    charity: null,
    totalWinnings: 0,
  });
  const [fetching, setFetching] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    try {
      const [subRes, scoresRes, profileRes, payoutsRes] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("status, plan_type")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single(),
        supabase
          .from("golf_scores")
          .select("id", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("users_profiles")
          .select("charity_preference_id, charities(name)")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("payouts")
          .select("amount")
          .eq("user_id", user.id)
          .eq("status", "paid"),
      ]);

      const totalWinnings = (payoutsRes.data ?? []).reduce(
        (sum: number, p: any) => sum + (p.amount ?? 0),
        0
      );

      setData({
        subscription: subRes.data ?? null,
        scoreCount: scoresRes.count ?? 0,
        charity: (profileRes.data?.charities as any) ?? null,
        totalWinnings,
      });
    } finally {
      setFetching(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/auth/login");
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const cards = [
    {
      icon: CreditCard,
      label: "Subscription",
      value: data.subscription
        ? `${data.subscription.plan_type} — ${data.subscription.status}`
        : "No active plan",
      sub: data.subscription ? null : "Subscribe to enter draws",
      href: "/subscribe",
      color: "from-purple-600 to-pink-600",
      cta: !data.subscription ? "Subscribe" : null,
    },
    {
      icon: Flag,
      label: "My Scores",
      value: `${data.scoreCount} / 5`,
      sub: "Scores submitted this period",
      href: "/dashboard/scores",
      color: "from-blue-600 to-cyan-600",
      cta: "Add Score",
    },
    {
      icon: Heart,
      label: "My Charity",
      value: data.charity?.name ?? "None selected",
      sub: "Your chosen charity",
      href: "/dashboard/profile",
      color: "from-pink-600 to-red-600",
      cta: !data.charity ? "Choose Charity" : null,
    },
    {
      icon: Trophy,
      label: "Total Winnings",
      value: `£${data.totalWinnings.toFixed(2)}`,
      sub: "From all draws",
      href: "/dashboard/history",
      color: "from-yellow-500 to-orange-500",
      cta: null,
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text">
            Welcome, {user.name ?? user.email}
          </h1>
          <p className="text-muted-foreground mt-1">Here's your golf draw overview.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map(({ icon: Icon, label, value, sub, href, color, cta }) => (
            <div key={label} className="glass-card space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center`}>
                  <Icon size={20} className="text-white" />
                </div>
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
              <p className="text-2xl font-bold">{value}</p>
              {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
              {cta && (
                <Link
                  href={href}
                  className="inline-block text-sm text-purple-400 hover:text-purple-300 underline underline-offset-2"
                >
                  {cta} →
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="glass-card space-y-3">
          <h2 className="font-semibold">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Submit Score", href: "/dashboard/scores" },
              { label: "View Draw", href: "/dashboard/draw" },
              { label: "Winner Proof", href: "/dashboard/winner-proof" },
              { label: "Donation History", href: "/dashboard/history" },
              { label: "Profile Settings", href: "/dashboard/profile" },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="glass-button text-sm"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
