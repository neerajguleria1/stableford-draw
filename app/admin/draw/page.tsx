"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { PrizeBreakdown } from "@/components/draw/PrizeBreakdown";
import { WinnerResults } from "@/components/draw/WinnerResults";

type DrawMode = "random" | "weighted";
type Step = "idle" | "drawn" | "matched" | "prizes";

interface DrawResult { id: string; numbers: number[] }
interface Winner {
  userId: string; email: string;
  matchedNumbers: number[];
  tier: "5-match" | "4-match" | "3-match";
  matchCount: number;
}
interface Payouts { [tier: string]: { users: string[]; perUser: number; total: number } }

export default function AdminDrawRunnerPage() {
  const [mode, setMode] = useState<DrawMode>("random");
  const [totalPot, setTotalPot] = useState(0);
  const [rollover, setRollover] = useState(0);
  const [simulate, setSimulate] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [draw, setDraw] = useState<DrawResult | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [payouts, setPayouts] = useState<Payouts>({});
  const [pot, setPot] = useState(0);
  const [newRollover, setNewRollover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? "";
  }

  async function runDraw() {
    setLoading(true); setError("");
    try {
      const token = await getToken();
      const res = await fetch("/api/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode, simulate }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setDraw({ id: json.draw.id, numbers: json.numbers });
      setStep("drawn");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function matchWinners() {
    if (!draw) return;
    setLoading(true); setError("");
    try {
      const token = await getToken();
      const res = await fetch("/api/draw/match", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ drawId: draw.id, drawnNumbers: draw.numbers }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setWinners(json.winners);
      setStep("matched");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function calculatePrizes() {
    if (!draw) return;
    setLoading(true); setError("");
    try {
      const token = await getToken();
      const res = await fetch("/api/draw/prizes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ drawId: draw.id, winners, totalPot, rollover }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setPayouts(json.payouts); setPot(json.pot); setNewRollover(json.rollover);
      setStep("prizes");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  function reset() {
    setStep("idle"); setDraw(null); setWinners([]);
    setPayouts({}); setPot(0); setNewRollover(0); setError("");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Run Weekly Draw</h2>
        <p className="text-sm text-muted-foreground">Step through draw → match → prizes</p>
      </div>

      {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>}

      {step === "idle" && (
        <div className="glass-card space-y-4">
          <h3 className="font-medium">Step 1: Configure Draw</h3>
          <div>
            <label className="block text-sm font-medium mb-2">Draw Mode</label>
            <div className="flex rounded-lg overflow-hidden border border-white/10">
              {(["random", "weighted"] as DrawMode[]).map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${mode === m ? "bg-purple-600 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
                  {m === "weighted" ? "Weighted" : "Random"}
                </button>
              ))}
            </div>
          </div>

          {/* Simulation toggle */}
          <div className="flex items-center justify-between glass p-3 rounded-lg">
            <div>
              <p className="text-sm font-medium">Simulation Mode</p>
              <p className="text-xs text-muted-foreground">Test draw without saving results</p>
            </div>
            <button onClick={() => setSimulate(!simulate)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                simulate ? "bg-purple-600" : "bg-white/20"
              }`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                simulate ? "translate-x-7" : "translate-x-1"
              }`} />
            </button>
          </div>
          {simulate && (
            <p className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
              ⚠️ Simulation mode — draw results will NOT be saved to the database.
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Total Pot (£)</label>
              <input type="number" min={0} value={totalPot}
                onChange={(e) => setTotalPot(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rollover (£)</label>
              <input type="number" min={0} value={rollover}
                onChange={(e) => setRollover(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500" />
            </div>
          </div>
          <button onClick={runDraw} disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50">
            {loading ? "Running Draw..." : "🎯 Run Draw"}
          </button>
        </div>
      )}

      {step !== "idle" && draw && (
        <div className="glass-card space-y-4">
          <h3 className="font-medium">Draw Result</h3>
          <div className="flex gap-3 flex-wrap">
            {draw.numbers.map((n, i) => (
              <div key={i} className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-neon">{n}</div>
            ))}
          </div>
          {step === "drawn" && (
            <button onClick={matchWinners} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50">
              {loading ? "Matching..." : "🔍 Match Winners"}
            </button>
          )}
        </div>
      )}

      {(step === "matched" || step === "prizes") && (
        <div className="glass-card space-y-4">
          <h3 className="font-medium">Winners ({winners.length})</h3>
          <WinnerResults winners={winners} drawnNumbers={draw?.numbers ?? []} />
          {step === "matched" && (
            <button onClick={calculatePrizes} disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50">
              {loading ? "Calculating..." : "💰 Calculate Prizes"}
            </button>
          )}
        </div>
      )}

      {step === "prizes" && (
        <div className="glass-card space-y-4">
          <h3 className="font-medium">Prize Breakdown</h3>
          <PrizeBreakdown payouts={payouts} pot={pot} rollover={newRollover} />
          <button onClick={reset}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-xl transition-all">
            ↩ Run Another Draw
          </button>
        </div>
      )}
    </div>
  );
}
