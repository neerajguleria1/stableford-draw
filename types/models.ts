export type Subscription = {
  id: string;
  user_id: string;
  charity_id?: string;
  plan_type: "monthly" | "annual" | "one-time";
  amount: number;
  currency: string;
  frequency?: "weekly" | "monthly" | "annual";
  status: "active" | "paused" | "cancelled";
  stripe_subscription_id?: string;
  start_date: string;
  next_billing_date?: string;
  cancelled_date?: string;
  total_donated: number;
  donation_count: number;
  created_at: string;
  updated_at: string;
};

export type GolfScore = {
  id: string;
  user_id: string;
  charity_event_id?: string;
  course_name?: string;
  holes: number;
  score: number;
  par?: number;
  handicap?: number;
  net_score?: number;
  date_played: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type Draw = {
  id: string;
  name: string;
  description?: string;
  charity_id: string;
  prize_description?: string;
  prize_value?: number;
  ticket_price: number;
  total_tickets_available?: number;
  tickets_sold: number;
  status: "active" | "closed" | "drawn";
  draw_date?: string;
  winner_id?: string;
  winner_announced_at?: string;
  total_raised: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
};

export type DrawTicket = {
  id: string;
  draw_id: string;
  user_id: string;
  ticket_number: string;
  quantity: number;
  amount_paid?: number;
  purchased_at: string;
  created_at: string;
};
