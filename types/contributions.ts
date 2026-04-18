export type CharityContribution = {
  id: string;
  user_id: string;
  charity_id: string;
  amount: number;
  currency: string;
  contribution_type: "donation" | "volunteer" | "fundraiser" | "event";
  contribution_date: string;
  description?: string;
  campaign_name?: string;
  impact_metric?: string;
  impact_value?: number;
  payment_method?: "stripe" | "bank_transfer" | "cash" | "crypto";
  stripe_payment_intent_id?: string;
  transaction_id?: string;
  receipt_url?: string;
  tax_deductible: boolean;
  acknowledgment_sent: boolean;
  acknowledged_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type DrawEntry = {
  id: string;
  draw_id: string;
  user_id: string;
  entry_number: string;
  quantity: number;
  amount_paid: number;
  entry_status: "active" | "invalidated" | "won" | "lost";
  payment_intent_id?: string;
  transaction_id?: string;
  purchased_at: string;
  confirmed_at?: string;
  confirmation_email_sent: boolean;
  is_winning_entry: boolean;
  winning_number?: string;
  created_at: string;
  updated_at: string;
};

export type WinnerProof = {
  id: string;
  draw_entry_id: string;
  draw_id: string;
  user_id: string;
  proof_type: "photo" | "video" | "document" | "verified_claim";
  proof_url: string;
  proof_file_type?: string;
  proof_file_size?: number;
  description?: string;
  verification_status: "pending" | "verified" | "rejected" | "requires_clarification";
  verified_by?: string;
  verified_at?: string;
  verification_notes?: string;
  submitted_at: string;
  resubmission_requested: boolean;
  resubmission_reason?: string;
  created_at: string;
  updated_at: string;
};

export type Payout = {
  id: string;
  payout_type: "prize" | "charity_distribution" | "refund" | "subscription_adjustment";
  recipient_type: "user" | "charity" | "organization";
  recipient_id: string;
  draw_id?: string;
  draw_entry_id?: string;
  charity_id?: string;
  amount: number;
  currency: string;
  gross_amount?: number;
  fees_amount?: number;
  net_amount?: number;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  payout_method: "stripe" | "bank_transfer" | "check" | "crypto" | "gift_card";
  bank_account_id?: string;
  stripe_payout_id?: string;
  transaction_reference?: string;
  scheduled_date?: string;
  processed_date?: string;
  completed_date?: string;
  failure_reason?: string;
  retry_count: number;
  max_retries: number;
  next_retry_date?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
};

// Analytics Views
export type CharityContributionSummary = {
  id: string;
  name: string;
  total_contributions: number;
  total_amount: number;
  unique_contributors: number;
  average_contribution: number;
  last_contribution: string;
};

export type DrawPerformance = {
  id: string;
  name: string;
  total_entries: number;
  total_revenue: number;
  unique_participants: number;
  tickets_sold: number;
  fill_percentage: number;
};

export type PayoutSummary = {
  status: string;
  payout_type: string;
  count: number;
  total_amount: number;
  average_amount: number;
  earliest_payout: string;
  latest_payout: string;
};

export type UserContributionHistory = {
  user_id: string;
  email: string;
  charities_supported: number;
  total_contributions: number;
  total_donated: number;
  donation_count: number;
  fundraiser_count: number;
  last_contribution_date: string;
};
