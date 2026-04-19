import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// POST /api/donate — create a one-off Stripe checkout for a charity donation
export async function POST(req: NextRequest) {
  try {
    const { charityId, amount, userId, email } = await req.json();

    if (!charityId || !amount || amount < 1) {
      return NextResponse.json({ error: "Invalid donation details" }, { status: 400 });
    }

    const { data: charity } = await supabase
      .from("charities")
      .select("id, name")
      .eq("id", charityId)
      .eq("status", "active")
      .single();

    if (!charity) {
      return NextResponse.json({ error: "Charity not found" }, { status: 404 });
    }

    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer =
      customers.data[0] ??
      (await stripe.customers.create({ email, metadata: { userId: userId ?? "" } }));

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `Donation to ${charity.name}`,
              description: "One-off charitable donation via GolfDraw",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "donation",
        charityId,
        userId: userId ?? "",
        amount: String(amount),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/charities/${charityId}?donated=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/charities/${charityId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
