import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function getAuthUserId(req: NextRequest): Promise<string | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const { data } = await supabase.auth.getUser(token);
  return data.user?.id ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { score, played_at } = await req.json();

    if (!score || !played_at) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (typeof score !== "number" || !Number.isInteger(score) || score < 1 || score > 45) {
      return NextResponse.json({ error: "Score must be an integer between 1 and 45" }, { status: 400 });
    }

    const dateOnly = played_at.split("T")[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    if (new Date(dateOnly) > new Date()) {
      return NextResponse.json({ error: "Date cannot be in the future" }, { status: 400 });
    }

    // Block duplicate date
    const { data: existing } = await supabase
      .from("golf_scores")
      .select("id")
      .eq("user_id", userId)
      .gte("date_played", `${dateOnly}T00:00:00`)
      .lte("date_played", `${dateOnly}T23:59:59`)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "You already have a score for this date" },
        { status: 409 }
      );
    }

    // Get current scores ordered oldest first
    const { data: scores } = await supabase
      .from("golf_scores")
      .select("id, date_played")
      .eq("user_id", userId)
      .order("date_played", { ascending: true });

    // Delete oldest if already at 5
    if (scores && scores.length >= 5) {
      await supabase.from("golf_scores").delete().eq("id", scores[0].id);
    }

    const { data, error } = await supabase
      .from("golf_scores")
      .insert({ user_id: userId, score, date_played: played_at })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, score } = await req.json();
    if (!id || !score) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    if (typeof score !== "number" || score < 1 || score > 45)
      return NextResponse.json({ error: "Score must be between 1 and 45" }, { status: 400 });

    const { data, error } = await supabase
      .from("golf_scores")
      .update({ score })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { error } = await supabase
      .from("golf_scores")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("golf_scores")
    .select("id, score, date_played")
    .eq("user_id", userId)
    .order("date_played", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ scores: data });
}
