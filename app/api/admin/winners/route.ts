import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, winnerApprovedEmail, winnerRejectedEmail } from "@/lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function isAdmin(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return false;
  const { data } = await supabase.auth.getUser(token);
  if (!data.user) return false;
  const role = data.user.user_metadata?.role;
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (role === "admin" || data.user.email === adminEmail) return true;
  const { data: profile } = await supabase
    .from("users_profiles")
    .select("role")
    .eq("user_id", data.user.id)
    .single();
  return profile?.role === "admin";
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status, admin_note } = await req.json();
  if (!id || !status) {
    return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
  }

  const { error } = await supabase
    .from("payouts")
    .update({ status, admin_note: admin_note ?? null, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch payout + user info for email
  const { data: payout } = await supabase
    .from("payouts")
    .select("tier, amount, user_id, users_profiles(full_name, email)")
    .eq("id", id)
    .single();

  if (payout) {
    const profile = (payout as any).users_profiles;
    if (profile?.email) {
      if (status === "paid") {
        await sendEmail({
          to: profile.email,
          subject: "Your GolfDraw prize has been approved!",
          html: winnerApprovedEmail(profile.full_name ?? "there", payout.tier, payout.amount),
        });
      } else if (status === "rejected") {
        await sendEmail({
          to: profile.email,
          subject: "Update on your GolfDraw prize claim",
          html: winnerRejectedEmail(profile.full_name ?? "there", payout.tier, admin_note ?? ""),
        });
      }
    }
  }

  return NextResponse.json({ success: true });
}
