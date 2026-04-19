"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store/auth";

interface Draw {
  id: string;
  name: string;
  draw_date: string;
  status: string;
  drawn_numbers: number[];
  total_raised: number;
}

interface Score {
  score: number;
}

interface Payout {
  tier: string;
  amount: number;
  status: string;
}

export default function DrawPage() {
  const { user } = useAuthStore();
  const [draws, setDraws] = useState<Draw[]>([]);
  const [myScores, setMyScores] = useState<number[]>([]);
  const [myPayouts, setMyPayouts] = useState<Record<string, Payout>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const [drawsRes, scoresRes, payoutsRes] = await Promise.all([
        supabase
          .from("draws")
          .select("id, name, draw_date, status, drawn_numbers, total_raised")
          .order("draw_date", { ascending: false })
          .limit(10),
        supabase
          .from("golf_scores")
          .select("score")
          .eq("user_id", user!.id),
        supabase
          .from("payouts")
          .select("draw_id, tier, amount, status")
          .eq("user_id", user!.id),
      ]);

      setDraws(drawsRes.data ?? []);
      setMyScores((scoresRes.data ?? []).map((s: Score) => s.score));

      const payoutMap: Record<string, Payout> = {};
      for (const p of payoutsRes.data ?? []) {
        payoutMap[p.draw_id] = p;
      }
      setMyPayouts(payoutMap);
      setLoading(false);
    }

    load();
  }, [user]);

  function getMatches(drawnNumbers: number[]): number[] {
    if (!drawnNumbers) return [];
    return myScores.filter((s) => drawnNumbers.includes(s));
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
          <h1 className="text-2xl font-bold gradient-text">Monthly Draws</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your scores: {myScores.length > 0 ? myScores.join(", ") : "None submitted yet"}
          </p>
        </div>

        {draws.length === 0 ? (
          <div className="glass-card text-center py-12">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-lg font-semibold">No draws yet</p>
            <p className="text-muted-foreground text-sm mt-1">Check back after the weekly draw runs.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {draws.map((draw) => {
              const matched = getMatches(draw.drawn_numbers ?? []);
              const payout = myPayouts[draw.id];

              return (
                <div key={draw.id} className="glass-card space-y-4">
                  {/* Draw Header */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-semibold">{draw.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(draw.draw_date).toLocaleDateString("en-GB", { dateStyle: "long" })}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      draw.status === "completed" ? "bg-green-500/20 text-green-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {draw.status}
                    </span>
                  </div>

                  {/* Drawn Numbers */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Drawn Numbers</p>
                    <div className="flex gap-2 flex-wrap">
                      {(draw.drawn_numbers ?? []).map((n, i) => (
                        <div
                          key={i}
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            myScores.includes(n)
                              ? "bg-purple-600 text-white shadow-neon"
                              : "bg-white/10 text-muted-foreground"
                          }`}
                        >
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Match Result */}
                  {draw.status === "completed" && (
                    <div className={`rounded-lg p-3 text-sm ${
                      matched.length >= 3
                        ? "bg-green-500/10 border border-green-500/30 text-green-400"
                        : "bg-white/5 text-muted-foreground"
                    }`}>
                      {matched.length >= 5 && "🏆 Jackpot! You matched all 5 numbers!"}
                      {matched.length === 4 && "🥈 Great! You matched 4 numbers!"}
                      {matched.length === 3 && "🥉 You matched 3 numbers!"}
                      {matched.length < 3 && matched.length > 0 && `You matched ${matched.length} number${matched.length > 1 ? "s" : ""} — keep playing!`}
                      {matched.length === 0 && "No matches this draw. Better luck next time!"}
                      {matched.length >= 3 && (
                        <span className="ml-2">Matched: {matched.join(", ")}</span>
                      )}
                    </div>
                  )}

                  {/* Payout */}
                  {payout && (
                    <div className="flex items-center justify-between text-sm bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                      <span className="text-yellow-400 font-medium">
                        💰 Prize: £{payout.amount.toFixed(2)} ({payout.tier})
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        payout.status === "paid" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {payout.status}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
