"use client";

import { Winner } from "@/app/api/draw/match/route";

const TIER_STYLES: Record<string, { label: string; color: string }> = {
  "5-match": { label: "🏆 5 Match — Jackpot", color: "text-yellow-400" },
  "4-match": { label: "🥈 4 Match", color: "text-purple-400" },
  "3-match": { label: "🥉 3 Match", color: "text-blue-400" },
};

interface WinnerResultsProps {
  winners: Winner[];
  drawnNumbers: number[];
}

export function WinnerResults({ winners, drawnNumbers }: WinnerResultsProps) {
  if (winners.length === 0) {
    return (
      <p className="text-muted-foreground text-sm text-center py-4">
        No winners this draw. Better luck next time!
      </p>
    );
  }

  const grouped = winners.reduce<Record<string, Winner[]>>((acc, w) => {
    if (!acc[w.tier]) acc[w.tier] = [];
    acc[w.tier].push(w);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center flex-wrap">
        {drawnNumbers.map((n, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm"
          >
            {n}
          </div>
        ))}
      </div>

      {(["5-match", "4-match", "3-match"] as const).map((tier) => {
        const group = grouped[tier];
        if (!group) return null;
        const { label, color } = TIER_STYLES[tier];
        return (
          <div key={tier} className="glass-card space-y-2">
            <h3 className={`font-semibold ${color}`}>{label}</h3>
            {group.map((w) => (
              <div key={w.userId} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{w.email}</span>
                <span className="text-white font-medium">
                  Matched: {w.matchedNumbers.join(", ")}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
