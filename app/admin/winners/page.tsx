"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Payout {
  id: string;
  user_id: string;
  tier: string;
  amount: number;
  status: string;
  created_at: string;
  draw_id: string;
  users_profiles: { full_name: string; email: string } | null;
  draws: { name: string } | null;
}

export default function AdminWinnersPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from("payouts")
      .select("id, user_id, tier, amount, status, created_at, draw_id, users_profiles(full_name, email), draws(name)")
      .order("created_at", { ascending: false });
    setPayouts((data as any) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function markPaid(id: string) {
    await supabase.from("payouts").update({ status: "paid" }).eq("id", id);
    load();
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Winners & Payouts ({payouts.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-muted-foreground text-left">
              <th className="py-2 px-3">Draw</th>
              <th className="py-2 px-3">Winner</th>
              <th className="py-2 px-3">Tier</th>
              <th className="py-2 px-3">Amount</th>
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-2 px-3 text-muted-foreground">{p.draws?.name ?? "—"}</td>
                <td className="py-2 px-3">
                  <div>{p.users_profiles?.full_name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{p.users_profiles?.email}</div>
                </td>
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
                <td className="py-2 px-3">
                  {p.status === "pending" && (
                    <button
                      onClick={() => markPaid(p.id)}
                      className="text-xs text-green-400 hover:text-green-300 underline"
                    >
                      Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {payouts.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-muted-foreground">No payouts yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
