import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function isAdmin(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return false;
  const { data } = await supabase.auth.getUser(token);
  return data.user?.user_metadata?.role === "admin";
}

function randomDraw(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

async function weightedDraw(): Promise<number[]> {
  const { data } = await supabase.from("golf_scores").select("score");

  const frequency: Record<number, number> = {};
  for (let i = 1; i <= 45; i++) frequency[i] = 1;

  if (data) {
    for (const row of data) {
      if (row.score >= 1 && row.score <= 45) frequency[row.score] += 1;
    }
  }

  const pool: number[] = [];
  for (let i = 1; i <= 45; i++) {
    for (let w = 0; w < frequency[i]; w++) pool.push(i);
  }

  const picked = new Set<number>();
  let attempts = 0;
  while (picked.size < 5 && attempts < 1000) {
    picked.add(pool[Math.floor(Math.random() * pool.length)]);
    attempts++;
  }
  while (picked.size < 5) picked.add(Math.floor(Math.random() * 45) + 1);

  return Array.from(picked).sort((a, b) => a - b);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { mode = "random", simulate = false } = await req.json();
    const numbers = mode === "weighted" ? await weightedDraw() : randomDraw();

    // In simulation mode, don't save to DB
    if (simulate) {
      return NextResponse.json({ draw: { id: "simulation", draw_date: new Date().toISOString() }, numbers, simulated: true });
    }
    const { data, error } = await supabase
      .from("draws")
      .insert({
        name: `Weekly Draw - ${new Date().toLocaleDateString("en-GB")}`,
        drawn_numbers: numbers,
        mode,
        status: "pending",
        draw_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ draw: data, numbers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const { data, error } = await supabase
    .from("draws")
    .select("*")
    .order("draw_date", { ascending: false })
    .limit(10);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ draws: data });
}
