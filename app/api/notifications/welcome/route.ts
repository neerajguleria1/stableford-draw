import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, welcomeEmail } from "@/lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase.auth.getUser(token);
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = data.user.email;
  const name = data.user.user_metadata?.name ?? "there";

  if (!email) return NextResponse.json({ error: "No email" }, { status: 400 });

  await sendEmail({
    to: email,
    subject: "Welcome to GolfDraw 🏌️",
    html: welcomeEmail(name),
  });

  return NextResponse.json({ sent: true });
}
