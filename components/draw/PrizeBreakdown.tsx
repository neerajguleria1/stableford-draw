"use client";

interface TierPayout {
  users: string[];
  perUser: number;
  total: number;
}

interface PrizeBreakdownProps {
  payouts: Record<string, TierPayout>;
  pot: number;
  rollover: number;
}

const TIER_LABELS: Record<string, { label: string; pct: string; color: string }> = {
  "5-match": { label: "🏆 Jackpot (5 Match)", pct: "40%", color: "text-yellow-400" },
  "4-match": { label: "🥈 4 Match", pct: "35%", color: "text-purple-400" },
  "3-match": { label: "🥉 3 Match", pct: "25%", color: "text-blue-400" },
};

export function PrizeBreakdown({ payouts, pot, rollover }: PrizeBreakdownProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-muted-foreground border-b border-white/10 pb-3">
        <span>Total Pot</span>
        <span className="text-white font-semibold">£{pot.toFixed(2)}</span>
      </div>

      {(["5-match", "4-match", "3-match"] as const).map((tier) => {
        const p = payouts[tier];
        const { label, pct, color } = TIER_LABELS[tier];
        const hasWinners = p?.users.length > 0;

        return (
          <div key={tier} className="glass-card space-y-1">
            <div className="flex justify-between items-center">
              <span className={`font-semibold ${color}`}>{label}</span>
              <span className="text-sm text-muted-foreground">{pct}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {hasWinners ? `${p.users.length} winner(s)` : "No winners — rolls over"}
              </span>
              <span className={hasWinners ? "text-white" : "text-muted-foreground line-through"}>
                £{p?.total.toFixed(2) ?? "0.00"}
              </span>
            </div>
            {hasWinners && (
              <p className="text-xs text-green-400">
                £{p.perUser.toFixed(2)} per winner
              </p>
            )}
          </div>
        );
      })}

      {rollover > 0 && (
        <div className="glass-card border border-yellow-500/30">
          <div className="flex justify-between items-center">
            <span className="text-yellow-400 font-semibold">🔄 Rollover to Next Draw</span>
            <span className="text-white font-bold">£{rollover.toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Added to next week's prize pot.
          </p>
        </div>
      )}
    </div>
  );
}
