import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  const session = event.data.object as any;

  switch (event.type) {
    case "checkout.session.completed": {
      const { userId, plan } = session.metadata;
      const stripeSubId = session.subscription;

      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_subscription_id: stripeSubId,
          plan_type: plan,
          amount: plan === "yearly" ? 100 : 10,
          currency: "GBP",
          status: "active",
          start_date: new Date().toISOString(),
          next_billing_date: plan === "yearly"
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: "user_id" }
      );
      break;
    }

    case "invoice.payment_succeeded": {
      const stripeSubId = session.subscription;
      await supabase
        .from("subscriptions")
        .update({ status: "active", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", stripeSubId);
      break;
    }

    case "invoice.payment_failed": {
      const stripeSubId = session.subscription;
      await supabase
        .from("subscriptions")
        .update({ status: "past_due", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", stripeSubId);
      break;
    }

    case "customer.subscription.deleted": {
      const stripeSubId = session.id;
      await supabase
        .from("subscriptions")
        .update({
          status: "cancelled",
          cancelled_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", stripeSubId);
      break;
    }

    case "customer.subscription.updated": {
      const stripeSubId = session.id;
      const status = session.status === "active" ? "active" : session.status;
      await supabase
        .from("subscriptions")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", stripeSubId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
