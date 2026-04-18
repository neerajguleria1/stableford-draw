-- Migration 003: Create Subscriptions Table
-- Created at: 2026-04-19

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  charity_id UUID REFERENCES charities(id) ON DELETE SET NULL,
  plan_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  frequency VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  stripe_subscription_id VARCHAR,
  start_date TIMESTAMP DEFAULT now(),
  next_billing_date TIMESTAMP,
  cancelled_date TIMESTAMP,
  total_donated DECIMAL(15,2) DEFAULT 0,
  donation_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_charity_id ON subscriptions(charity_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);
