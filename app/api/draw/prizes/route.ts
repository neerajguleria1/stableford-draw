import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, drawResultEmail } from "@/lib/email";

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

    // Fetch draw info for email
    const { data: draw } = await supabase
      .from("draws")
      .select("name, drawn_numbers")
      .eq("id", drawId)
      .single();

    for (const tier of ["5-match", "4-match", "3-match"] as const) {
      const tierWinners: Array<{ userId: string; email: string; matchedNumbers: number[] }> = winners
        .filter((w: any) => w.tier === tier);

      const tierWinnerIds = tierWinners.map((w) => w.userId);
      const tierTotal = Math.floor(pot * SPLIT[tier] * 100) / 100;

      if (tierWinnerIds.length === 0) {
        unclaimedRollover += tierTotal;
        payouts[tier] = { users: [], perUser: 0, total: tierTotal };
      } else {
        const perUser = Math.floor((tierTotal / tierWinnerIds.length) * 100) / 100;
        payouts[tier] = { users: tierWinnerIds, perUser, total: tierTotal };

        const payoutRows = tierWinnerIds.map((userId: string) => ({
          draw_id: drawId,
          user_id: userId,
          tier,
          amount: perUser,
          status: "pending",
        }));

        await supabase.from("payouts").insert(payoutRows);

        // Send winner notification emails
        for (const winner of tierWinners) {
          if (winner.email) {
            await sendEmail({
              to: winner.email,
              subject: `🎉 You won the ${draw?.name ?? "GolfDraw"} draw!`,
              html: drawResultEmail(
                winner.email,
                draw?.name ?? "Monthly Draw",
                draw?.drawn_numbers ?? [],
                winner.matchedNumbers,
                tier,
                perUser
              ),
            });
          }
        }
      }
    }

    // Notify non-winners too (fetch all participants who didn't win)
    const winnerIds = new Set(winners.map((w: any) => w.userId));
    const { data: allScoreUsers } = await supabase
      .from("golf_scores")
      .select("user_id, users_profiles!inner(email, full_name)")
      .not("user_id", "in", `(${Array.from(winnerIds).join(",")})`);

    if (allScoreUsers) {
      const notified = new Set<string>();
      for (const row of allScoreUsers as any[]) {
        const uid = row.user_id;
        if (notified.has(uid)) continue;
        notified.add(uid);
        const profile = row.users_profiles;
        if (profile?.email) {
          await sendEmail({
            to: profile.email,
            subject: `${draw?.name ?? "Monthly Draw"} results are in`,
            html: drawResultEmail(
              profile.full_name ?? "there",
              draw?.name ?? "Monthly Draw",
              draw?.drawn_numbers ?? [],
              [],
              null,
              null
            ),
          });
        }
      }
    }

    await supabase
      .from("draws")
      .update({ total_raised: pot, updated_at: new Date().toISOString() })
      .eq("id", drawId);

    return NextResponse.json({ payouts, pot, rollover: unclaimedRollover });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
