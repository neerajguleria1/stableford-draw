import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase.auth.getUser(token);
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id, status")
    .eq("user_id", data.user.id)
    .single();

  if (!sub || sub.status === "cancelled") {
    return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
  }

  if (sub.stripe_subscription_id) {
    // Cancel at period end so user keeps access until billing date
    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    });
  }

  // Mark as cancelled in DB immediately
  await supabase
    .from("subscriptions")
    .update({
      status: "cancelled",
      cancelled_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", data.user.id);

  return NextResponse.json({ success: true });
}
