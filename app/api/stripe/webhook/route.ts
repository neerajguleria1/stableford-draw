import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, subscriptionConfirmEmail } from "@/lib/email";
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

      // Handle one-off donation
      if (session.metadata?.type === "donation") {
        const { charityId, amount } = session.metadata;
        if (charityId && amount) {
          const donationAmount = parseFloat(amount);
          // Record contribution
          await supabase.from("charity_contributions").insert({
            user_id: userId || null,
            charity_id: charityId,
            amount: donationAmount,
            contribution_type: "donation",
          });
          // Update charity total_raised directly
          const { data: charityRow } = await supabase
            .from("charities")
            .select("total_raised")
            .eq("id", charityId)
            .single();
          await supabase
            .from("charities")
            .update({ total_raised: (charityRow?.total_raised ?? 0) + donationAmount })
            .eq("id", charityId);
        }
        break;
      }

      // Handle subscription checkout
      const stripeSubId = session.subscription;
      const amount = plan === "yearly" ? 100 : 10;

      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_subscription_id: stripeSubId,
          plan_type: plan,
          amount,
          currency: "GBP",
          status: "active",
          start_date: new Date().toISOString(),
          next_billing_date: plan === "yearly"
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: "user_id" }
      );

      // Record charity contribution (10% of subscription)
      const { data: profile } = await supabase
        .from("users_profiles")
        .select("full_name, email, charity_preference_id, charity_percentage")
        .eq("user_id", userId)
        .single();

      if (profile?.charity_preference_id) {
        const pct = (profile.charity_percentage ?? 10) / 100;
        const charityAmount = Math.round(amount * pct * 100) / 100;
        await supabase.from("charity_contributions").insert({
          user_id: userId,
          charity_id: profile.charity_preference_id,
          amount: charityAmount,
          contribution_type: "subscription",
        });
        // Update charity total_raised
        const { data: charity } = await supabase
          .from("charities")
          .select("total_raised")
          .eq("id", profile.charity_preference_id)
          .single();
        await supabase
          .from("charities")
          .update({ total_raised: (charity?.total_raised ?? 0) + charityAmount })
          .eq("id", profile.charity_preference_id);
      }

      // Send subscription confirmation email
      if (profile?.email) {
        await sendEmail({
          to: profile.email,
          subject: "Your GolfDraw subscription is confirmed!",
          html: subscriptionConfirmEmail(profile.full_name ?? "there", plan, amount),
        });
      }
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
