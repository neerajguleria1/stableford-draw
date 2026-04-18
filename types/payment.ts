export type Payment = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  stripe_payment_intent_id: string;
  status: "pending" | "succeeded" | "failed" | "canceled";
  metadata?: Record<string, unknown>;
  created_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  plan: "monthly" | "yearly";
  amount: number;
  status: "active" | "canceled" | "past_due";
  started_at: string;
  canceled_at?: string;
};

export type Invoice = {
  id: string;
  user_id: string;
  stripe_invoice_id: string;
  amount: number;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  due_date?: string;
  created_at: string;
};
