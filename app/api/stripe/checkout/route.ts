import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PLANS = {
  monthly: { amount: 1000, interval: "month" as const, label: "Monthly Plan" },
  yearly: { amount: 10000, interval: "year" as const, label: "Yearly Plan" },
};

export async function POST(req: NextRequest) {
  try {
    const { plan, userId, email } = await req.json();

    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const selected = PLANS[plan as keyof typeof PLANS];

    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer =
      customers.data[0] ??
      (await stripe.customers.create({ email, metadata: { userId } }));

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { name: selected.label },
            unit_amount: selected.amount,
            recurring: { interval: selected.interval },
          },
          quantity: 1,
        },
      ],
      metadata: { userId, plan },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe?cancelled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
