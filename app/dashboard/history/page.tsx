"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { supabase } from "@/lib/supabase";

interface Payout {
  id: string;
  tier: string;
  amount: number;
  status: string;
  created_at: string;
  draws: { name: string; draw_date: string } | null;
}

interface Subscription {
  plan_type: string;
  amount: number;
  status: string;
  start_date: string;
  currency: string;
}

export default function HistoryPage() {
  const { user } = useAuthStore();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [payoutsRes, subRes] = await Promise.all([
        supabase
          .from("payouts")
          .select("id, tier, amount, status, created_at, draws(name, draw_date)")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("subscriptions")
          .select("plan_type, amount, status, start_date, currency")
          .eq("user_id", user!.id)
          .single(),
      ]);
      setPayouts((payoutsRes.data as any) ?? []);
      setSubscription(subRes.data ?? null);
      setLoading(false);
    }
    load();
  }, [user]);

  const totalWon = payouts
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  function exportCSV() {
    const rows = [
      ["Draw", "Tier", "Amount", "Status", "Date"],
      ...payouts.map((p) => [
        p.draws?.name ?? "—",
        p.tier,
        `£${p.amount.toFixed(2)}`,
        p.status,
        new Date(p.created_at).toLocaleDateString("en-GB"),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "winnings-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">History</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your subscription and winnings</p>
        </div>

        {/* Subscription Card */}
        <div className="glass-card space-y-3">
          <h2 className="font-semibold">Subscription</h2>
          {subscription ? (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-medium capitalize">{subscription.plan_type} Plan</p>
                <p className="text-sm text-muted-foreground">
                  Started {new Date(subscription.start_date).toLocaleDateString("en-GB", { dateStyle: "long" })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">£{subscription.amount}/
                  {subscription.plan_type === "yearly" ? "yr" : "mo"}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  subscription.status === "active"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {subscription.status}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No active subscription. <a href="/subscribe" className="text-purple-400 hover:underline">Subscribe now →</a></p>
          )}
        </div>

        {/* Winnings Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Won", value: `£${totalWon.toFixed(2)}` },
            { label: "Draw Entries", value: payouts.length },
            { label: "Paid Out", value: payouts.filter((p) => p.status === "paid").length },
          ].map(({ label, value }) => (
            <div key={label} className="glass-card text-center">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold mt-1">{value}</p>
            </div>
          ))}
        </div>

        {/* Payouts Table */}
        <div className="glass-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Winnings History</h2>
            {payouts.length > 0 && (
              <button
                onClick={exportCSV}
                className="text-xs text-purple-400 hover:text-purple-300 underline"
              >
                Export CSV
              </button>
            )}
          </div>

          {payouts.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">
              No winnings yet. Keep playing!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-muted-foreground text-left">
                    <th className="py-2 px-3">Draw</th>
                    <th className="py-2 px-3">Tier</th>
                    <th className="py-2 px-3">Amount</th>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-2 px-3">{p.draws?.name ?? "—"}</td>
                      <td className="py-2 px-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          p.tier === "5-match" ? "bg-yellow-500/20 text-yellow-400" :
                          p.tier === "4-match" ? "bg-purple-500/20 text-purple-400" :
                          "bg-blue-500/20 text-blue-400"
                        }`}>
                          {p.tier}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold">£{p.amount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString("en-GB")}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          p.status === "paid" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
