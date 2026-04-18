-- Migration 006: Create Charity Contributions Table
-- Created at: 2026-04-19

CREATE TABLE IF NOT EXISTS charity_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  contribution_type VARCHAR(50) NOT NULL,
  contribution_date TIMESTAMP DEFAULT now(),
  description TEXT,
  campaign_name VARCHAR(255),
  impact_metric VARCHAR(255),
  impact_value INT,
  payment_method VARCHAR(50),
  stripe_payment_intent_id VARCHAR,
  transaction_id VARCHAR UNIQUE,
  receipt_url VARCHAR,
  tax_deductible BOOLEAN DEFAULT true,
  acknowledgment_sent BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_charity_contributions_user_id ON charity_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_charity_contributions_charity_id ON charity_contributions(charity_id);
CREATE INDEX IF NOT EXISTS idx_charity_contributions_date ON charity_contributions(contribution_date);
CREATE INDEX IF NOT EXISTS idx_charity_contributions_type ON charity_contributions(contribution_type);

ALTER TABLE charity_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contributions"
  ON charity_contributions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view contributions for transparency"
  ON charity_contributions FOR SELECT
  USING (true);
