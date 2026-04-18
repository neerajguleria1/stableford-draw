"use client";

import { useState } from "react";

type DrawMode = "random" | "weighted";

interface DrawResult {
  numbers: number[];
  drawId: string;
  date: string;
}

interface DrawGeneratorProps {
  onDrawComplete?: (result: DrawResult) => void;
}

export function DrawGenerator({ onDrawComplete }: DrawGeneratorProps) {
  const [mode, setMode] = useState<DrawMode>("random");
  const [numbers, setNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drawn, setDrawn] = useState(false);

  async function handleDraw() {
    setLoading(true);
    setError("");
    setDrawn(false);
    setNumbers([]);

    try {
      const res = await fetch("/api/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setNumbers(json.numbers);
      setDrawn(true);
      onDrawComplete?.({
        numbers: json.numbers,
        drawId: json.draw.id,
        date: json.draw.draw_date,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex rounded-lg overflow-hidden border border-white/10">
        {(["random", "weighted"] as DrawMode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setDrawn(false); setNumbers([]); }}
            className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
              mode === m
                ? "bg-purple-600 text-white"
                : "bg-white/5 text-muted-foreground hover:bg-white/10"
            }`}
          >
            {m === "weighted" ? "Weighted (by scores)" : "Random"}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {mode === "weighted"
          ? "Numbers are biased toward scores submitted most often by players."
          : "Fully random — equal chance for all numbers 1–45."}
      </p>

      {/* Number Balls */}
      <div className="flex gap-3 justify-center flex-wrap">
        {drawn && numbers.length > 0
          ? numbers.map((n, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-neon"
              >
                {n}
              </div>
            ))
          : Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-muted-foreground font-bold text-lg"
              >
                ?
              </div>
            ))}
      </div>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <button
        onClick={handleDraw}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50"
      >
        {loading ? "Drawing..." : drawn ? "Draw Again" : "Run Draw"}
      </button>

      {drawn && (
        <p className="text-center text-sm text-muted-foreground">
          Drawn on {new Date().toLocaleDateString("en-GB", { dateStyle: "long" })}
        </p>
      )}
    </div>
  );
}
