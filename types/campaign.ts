export type Campaign = {
  id: string;
  title: string;
  description: string;
  category: string;
  target_amount: number;
  current_amount: number;
  image_url: string | null;
  status: "active" | "paused" | "completed" | "cancelled";
  created_by: string;
  created_at: string;
  updated_at: string;
  end_date?: string;
};

export type Donation = {
  id: string;
  user_id: string;
  campaign_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: "pending" | "completed" | "failed" | "refunded";
  stripe_payment_id?: string;
  created_at: string;
};

export type Impact = {
  id: string;
  campaign_id: string;
  metric_name: string;
  metric_value: number;
  unit: string;
  description: string;
  created_at: string;
};

export type CampaignStats = {
  campaign_id: string;
  total_donations: number;
  total_donors: number;
  funding_percentage: number;
  days_remaining: number;
};
