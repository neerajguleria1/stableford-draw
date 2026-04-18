import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export type MatchTier = "5-match" | "4-match" | "3-match";

export interface Winner {
  userId: string;
  email: string;
  matchedNumbers: number[];
  tier: MatchTier;
  matchCount: number;
}

function getMatchTier(count: number): MatchTier | null {
  if (count === 5) return "5-match";
  if (count === 4) return "4-match";
  if (count === 3) return "3-match";
  return null;
}

async function isAdmin(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return false;
  const { data } = await supabase.auth.getUser(token);
  return data.user?.user_metadata?.role === "admin";
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { drawId, drawnNumbers } = await req.json();

    if (!drawId || !Array.isArray(drawnNumbers) || drawnNumbers.length !== 5) {
      return NextResponse.json({ error: "Invalid draw data" }, { status: 400 });
    }

    const drawn = new Set<number>(drawnNumbers);

    // Single query — join profiles to avoid N+1
    const { data: scores, error } = await supabase
      .from("golf_scores")
      .select("user_id, score, users_profiles!inner(email)");

    if (error) throw error;

    // Group scores by user, carry email from first row
    const userMap: Record<string, { scores: number[]; email: string }> = {};
    for (const row of scores ?? []) {
      if (!userMap[row.user_id]) {
        userMap[row.user_id] = {
          scores: [],
          email: (row.users_profiles as any)?.email ?? "unknown",
        };
      }
      userMap[row.user_id].scores.push(row.score);
    }

    const winners: Winner[] = [];

    for (const [userId, { scores: userNums, email }] of Object.entries(userMap)) {
      const matched = userNums.filter((n) => drawn.has(n));
      const tier = getMatchTier(matched.length);
      if (tier) {
        winners.push({ userId, email, matchedNumbers: matched, tier, matchCount: matched.length });
      }
    }

    winners.sort((a, b) => b.matchCount - a.matchCount);

    await supabase
      .from("draws")
      .update({ status: "completed", winner_id: winners[0]?.userId ?? null })
      .eq("id", drawId);

    return NextResponse.json({ winners, drawnNumbers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
