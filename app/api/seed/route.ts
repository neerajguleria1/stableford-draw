import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const CHARITIES = [
  { name: "Cancer Research UK", slug: "cancer-research-uk", description: "Fighting cancer through research, diagnosis and treatment.", status: "active" },
  { name: "British Heart Foundation", slug: "british-heart-foundation", description: "Funding research into heart and circulatory diseases.", status: "active" },
  { name: "Macmillan Cancer Support", slug: "macmillan-cancer-support", description: "Supporting people living with cancer.", status: "active" },
  { name: "Age UK", slug: "age-uk", description: "Helping older people love later life.", status: "active" },
  { name: "Oxfam", slug: "oxfam", description: "Fighting poverty and injustice around the world.", status: "active" },
  { name: "RSPCA", slug: "rspca", description: "Preventing cruelty and promoting kindness to animals.", status: "active" },
  { name: "Save the Children", slug: "save-the-children", description: "Giving children a healthy start in life.", status: "active" },
  { name: "Mind", slug: "mind", description: "Supporting people with mental health problems.", status: "active" },
];

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("charities")
      .upsert(CHARITIES, { onConflict: "slug" })
      .select();

    if (error) throw error;
    return NextResponse.json({ message: `Seeded ${data.length} charities`, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
