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
  proof_url: string | null;
  admin_note: string | null;
  users_profiles: { full_name: string; email: string } | null;
  draws: { name: string } | null;
}

export default function AdminWinnersPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewProof, setViewProof] = useState<string | null>(null);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  async function load() {
    const { data } = await supabase
      .from("payouts")
      .select("id, user_id, tier, amount, status, created_at, proof_url, admin_note, users_profiles(full_name, email), draws(name)")
      .order("created_at", { ascending: false });
    setPayouts((data as any) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await supabase.from("payouts").update({
      status,
      admin_note: noteId === id ? note : undefined,
    }).eq("id", id);
    setNoteId(null);
    setNote("");
    load();
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  const statusColor: Record<string, string> = {
    paid: "bg-green-500/20 text-green-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    proof_submitted: "bg-blue-500/20 text-blue-400",
    rejected: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Winners & Payouts ({payouts.length})</h2>

      {/* Proof Image Modal */}
      {viewProof && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
          onClick={() => setViewProof(null)}>
          <div className="max-w-2xl w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <p className="font-semibold">Winner Proof</p>
              <button onClick={() => setViewProof(null)} className="text-muted-foreground hover:text-white">✕</button>
            </div>
            <img src={viewProof} alt="Winner proof" className="w-full rounded-xl border border-white/10" />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-muted-foreground text-left">
              <th className="py-2 px-3">Draw</th>
              <th className="py-2 px-3">Winner</th>
              <th className="py-2 px-3">Tier</th>
              <th className="py-2 px-3">Amount</th>
              <th className="py-2 px-3">Proof</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Actions</th>
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
                  }`}>{p.tier}</span>
                </td>
                <td className="py-2 px-3 font-semibold">£{p.amount.toFixed(2)}</td>
                <td className="py-2 px-3">
                  {p.proof_url ? (
                    <button onClick={() => setViewProof(p.proof_url!)}
                      className="text-xs text-purple-400 hover:text-purple-300 underline">
                      View Proof
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">No proof</span>
                  )}
                </td>
                <td className="py-2 px-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[p.status] ?? "bg-white/10 text-muted-foreground"}`}>
                    {p.status}
                  </span>
                  {p.admin_note && (
                    <p className="text-xs text-muted-foreground mt-1">{p.admin_note}</p>
                  )}
                </td>
                <td className="py-2 px-3">
                  <div className="flex flex-col gap-1">
                    {p.status === "proof_submitted" && (
                      <>
                        <button onClick={() => updateStatus(p.id, "paid")}
                          className="text-xs text-green-400 hover:text-green-300 underline">
                          ✓ Approve & Pay
                        </button>
                        <button onClick={() => setNoteId(noteId === p.id ? null : p.id)}
                          className="text-xs text-red-400 hover:text-red-300 underline">
                          ✕ Reject
                        </button>
                        {noteId === p.id && (
                          <div className="space-y-1 mt-1">
                            <input
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              placeholder="Rejection reason..."
                              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none"
                            />
                            <button onClick={() => updateStatus(p.id, "rejected")}
                              className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">
                              Confirm Reject
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    {p.status === "pending" && (
                      <button onClick={() => updateStatus(p.id, "paid")}
                        className="text-xs text-green-400 hover:text-green-300 underline">
                        Mark Paid
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {payouts.length === 0 && (
              <tr><td colSpan={7} className="py-6 text-center text-muted-foreground">No payouts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
