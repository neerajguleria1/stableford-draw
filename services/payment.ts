import { supabase } from "@/lib/supabase";
import { Payment, Subscription, Invoice } from "@/types";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const paymentService = {
  async createPaymentIntent(amount: number, currency: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: {
        userId: user.id,
      },
    });

    return paymentIntent;
  },

  async recordDonation(
    userId: string,
    campaignId: string,
    amount: number,
    stripePaymentId?: string
  ): Promise<Payment> {
    const { data, error } = await supabase
      .from("donations")
      .insert([
        {
          user_id: userId,
          campaign_id: campaignId,
          amount,
          currency: "USD",
          stripe_payment_id: stripePaymentId,
          status: "completed",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPaymentHistory(userId: string) {
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async createSubscription(
    userId: string,
    plan: "monthly" | "yearly",
    amount: number
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    // Create Stripe customer if doesn't exist
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        userId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_PRICE_ID }], // You'll need to set this
      metadata: {
        userId,
        plan,
      },
    });

    // Save to database
    const { data, error } = await supabase
      .from("subscriptions")
      .insert([
        {
          user_id: userId,
          stripe_subscription_id: subscription.id,
          plan,
          amount,
          status: "active",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async cancelSubscription(subscriptionId: string) {
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "canceled", canceled_at: new Date() })
      .eq("id", subscriptionId);

    if (error) throw error;
  },

  async getInvoices(userId: string) {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },
};
