-- Migration 009: Create Payouts Table
-- Created at: 2026-04-19

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_type VARCHAR(50) NOT NULL,
  recipient_type VARCHAR(50) NOT NULL,
  recipient_id UUID NOT NULL,
  draw_id UUID REFERENCES draws(id) ON DELETE SET NULL,
  draw_entry_id UUID REFERENCES draw_entries(id) ON DELETE SET NULL,
  charity_id UUID REFERENCES charities(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  gross_amount DECIMAL(15,2),
  fees_amount DECIMAL(10,2),
  net_amount DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'pending',
  payout_method VARCHAR(50) NOT NULL,
  bank_account_id UUID,
  stripe_payout_id VARCHAR,
  transaction_reference VARCHAR UNIQUE,
  scheduled_date TIMESTAMP,
  processed_date TIMESTAMP,
  completed_date TIMESTAMP,
  failure_reason TEXT,
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  next_retry_date TIMESTAMP,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payouts_recipient_id ON payouts(recipient_id);
CREATE INDEX IF NOT EXISTS idx_payouts_draw_id ON payouts(draw_id);
CREATE INDEX IF NOT EXISTS idx_payouts_charity_id ON payouts(charity_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_payout_type ON payouts(payout_type);
CREATE INDEX IF NOT EXISTS idx_payouts_processed_date ON payouts(processed_date);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payouts"
  ON payouts FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Charities can view payout history"
  ON payouts FOR SELECT
  USING (charity_id IS NOT NULL);
