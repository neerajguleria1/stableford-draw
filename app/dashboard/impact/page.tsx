"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { supabase } from "@/lib/supabase";
import { Trophy, Flag, Heart, TrendingUp } from "lucide-react";

interface Stats {
  totalWinnings: number;
  scoresSubmitted: number;
  drawsEntered: number;
  charityName: string;
}

export default function ImpactPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats>({ totalWinnings: 0, scoresSubmitted: 0, drawsEntered: 0, charityName: "—" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [scoresRes, payoutsRes, profileRes] = await Promise.all([
        supabase.from("golf_scores").select("id", { count: "exact" }).eq("user_id", user!.id),
        supabase.from("payouts").select("amount").eq("user_id", user!.id),
        supabase.from("users_profiles").select("charities(name)").eq("user_id", user!.id).single(),
      ]);

      const totalWinnings = (payoutsRes.data ?? []).reduce((s: number, p: any) => s + p.amount, 0);
      const charity = (profileRes.data?.charities as any);

      setStats({
        totalWinnings,
        scoresSubmitted: scoresRes.count ?? 0,
        drawsEntered: payoutsRes.data?.length ?? 0,
        charityName: charity?.name ?? "None selected",
      });
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { icon: Trophy, label: "Total Winnings", value: `£${stats.totalWinnings.toFixed(2)}`, color: "from-yellow-500 to-orange-500" },
    { icon: Flag, label: "Scores Submitted", value: stats.scoresSubmitted, color: "from-blue-600 to-cyan-600" },
    { icon: TrendingUp, label: "Draw Entries Won", value: stats.drawsEntered, color: "from-purple-600 to-pink-600" },
    { icon: Heart, label: "Supporting", value: stats.charityName, color: "from-pink-600 to-red-600" },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">My Impact</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your contribution to the golf draw community</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="glass-card space-y-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        <div className="glass-card space-y-3">
          <h2 className="font-semibold">How It Works</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            {[
              "1. Submit up to 5 golf scores per week (range 1–45)",
              "2. Each week a draw picks 5 numbers from 1–45",
              "3. Match 3, 4, or 5 numbers to win prizes",
              "4. Prize pot split: 40% jackpot / 35% four-match / 25% three-match",
              "5. Unmatched tiers roll over to next week's pot",
            ].map((step) => (
              <p key={step} className="flex gap-2">{step}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
