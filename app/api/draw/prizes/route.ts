import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const SPLIT = { "5-match": 0.40, "4-match": 0.35, "3-match": 0.25 };

export async function POST(req: NextRequest) {
  try {
    const { drawId, winners, totalPot, rollover = 0 } = await req.json();

    if (!drawId || !winners || !totalPot) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pot = totalPot + rollover;
    const payouts: Record<string, { users: string[]; perUser: number; total: number }> = {};
    let unclaimedRollover = 0;

    for (const tier of ["5-match", "4-match", "3-match"] as const) {
      const tierWinners: string[] = winners
        .filter((w: any) => w.tier === tier)
        .map((w: any) => w.userId);

      const tierTotal = Math.floor(pot * SPLIT[tier] * 100) / 100;

      if (tierWinners.length === 0) {
        // No winners for this tier — rolls over
        unclaimedRollover += tierTotal;
        payouts[tier] = { users: [], perUser: 0, total: tierTotal };
      } else {
        const perUser = Math.floor((tierTotal / tierWinners.length) * 100) / 100;
        payouts[tier] = { users: tierWinners, perUser, total: tierTotal };

        // Record each payout in DB
        const payoutRows = tierWinners.map((userId: string) => ({
          draw_id: drawId,
          user_id: userId,
          tier,
          amount: perUser,
          status: "pending",
        }));

        await supabase.from("payouts").insert(payoutRows);
      }
    }

    // Save rollover to draws table
    await supabase
      .from("draws")
      .update({ total_raised: pot, updated_at: new Date().toISOString() })
      .eq("id", drawId);

    return NextResponse.json({ payouts, pot, rollover: unclaimedRollover });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
