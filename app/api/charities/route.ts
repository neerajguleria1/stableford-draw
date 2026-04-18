import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("charities")
      .select("id, name, description, logo_url")
      .eq("status", "active")
      .order("name", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ charities: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
