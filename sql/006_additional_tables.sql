-- Combined SQL: Additional Tables
-- charity_contributions, draw_entries, winner_proofs, payouts

-- ============================================
-- TABLE 1: Charity Contributions
-- ============================================
CREATE TABLE IF NOT EXISTS charity_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  contribution_type VARCHAR(50) NOT NULL, -- 'donation', 'volunteer', 'fundraiser', 'event'
  contribution_date TIMESTAMP DEFAULT now(),
  description TEXT,
  campaign_name VARCHAR(255),
  impact_metric VARCHAR(255), -- 'meals provided', 'trees planted', etc.
  impact_value INT,
  payment_method VARCHAR(50), -- 'stripe', 'bank_transfer', 'cash', 'crypto'
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

CREATE POLICY "Charities can view contributions to them"
  ON charity_contributions FOR SELECT
  USING (true); -- Allow public viewing for transparency

-- ============================================
-- TABLE 2: Draw Entries (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS draw_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_number VARCHAR(50) NOT NULL,
  quantity INT DEFAULT 1,
  amount_paid DECIMAL(10,2) NOT NULL,
  entry_status VARCHAR(50) DEFAULT 'active', -- 'active', 'invalidated', 'won', 'lost'
  payment_intent_id VARCHAR,
  transaction_id VARCHAR UNIQUE,
  purchased_at TIMESTAMP DEFAULT now(),
  confirmed_at TIMESTAMP,
  confirmation_email_sent BOOLEAN DEFAULT false,
  is_winning_entry BOOLEAN DEFAULT false,
  winning_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_draw_entries_draw_id ON draw_entries(draw_id);
CREATE INDEX IF NOT EXISTS idx_draw_entries_user_id ON draw_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_draw_entries_status ON draw_entries(entry_status);
CREATE INDEX IF NOT EXISTS idx_draw_entries_entry_number ON draw_entries(entry_number);
CREATE INDEX IF NOT EXISTS idx_draw_entries_winning ON draw_entries(is_winning_entry);

ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own entries"
  ON draw_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Draw organizers can view all entries"
  ON draw_entries FOR SELECT
  USING (true);

-- ============================================
-- TABLE 3: Winner Proofs
-- ============================================
CREATE TABLE IF NOT EXISTS winner_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_entry_id UUID NOT NULL REFERENCES draw_entries(id) ON DELETE CASCADE,
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proof_type VARCHAR(50) NOT NULL, -- 'photo', 'video', 'document', 'verified_claim'
  proof_url VARCHAR NOT NULL,
  proof_file_type VARCHAR(50), -- 'image/jpeg', 'image/png', 'video/mp4'
  proof_file_size INT, -- in bytes
  description TEXT,
  verification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'rejected', 'requires_clarification'
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP,
  verification_notes TEXT,
  submitted_at TIMESTAMP DEFAULT now(),
  resubmission_requested BOOLEAN DEFAULT false,
  resubmission_reason TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_winner_proofs_draw_entry_id ON winner_proofs(draw_entry_id);
CREATE INDEX IF NOT EXISTS idx_winner_proofs_draw_id ON winner_proofs(draw_id);
CREATE INDEX IF NOT EXISTS idx_winner_proofs_user_id ON winner_proofs(user_id);
CREATE INDEX IF NOT EXISTS idx_winner_proofs_status ON winner_proofs(verification_status);
CREATE INDEX IF NOT EXISTS idx_winner_proofs_verified_by ON winner_proofs(verified_by);

ALTER TABLE winner_proofs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own proofs"
  ON winner_proofs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all proofs"
  ON winner_proofs FOR SELECT
  USING (true); -- In production, add role check

-- ============================================
-- TABLE 4: Payouts
-- ============================================
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_type VARCHAR(50) NOT NULL, -- 'prize', 'charity_distribution', 'refund', 'subscription_adjustment'
  recipient_type VARCHAR(50) NOT NULL, -- 'user', 'charity', 'organization'
  recipient_id UUID NOT NULL,
  draw_id UUID REFERENCES draws(id) ON DELETE SET NULL,
  draw_entry_id UUID REFERENCES draw_entries(id) ON DELETE SET NULL,
  charity_id UUID REFERENCES charities(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  gross_amount DECIMAL(15,2),
  fees_amount DECIMAL(10,2), -- processing fees
  net_amount DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
  payout_method VARCHAR(50) NOT NULL, -- 'stripe', 'bank_transfer', 'check', 'crypto', 'gift_card'
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
  USING (
    auth.uid() = recipient_id
    OR payout_type = 'charity_distribution' AND recipient_id IN (
      SELECT id FROM charities WHERE auth.uid() IN (
        SELECT created_by FROM charities LIMIT 1
      )
    )
  );

CREATE POLICY "Admins can view all payouts"
  ON payouts FOR SELECT
  USING (true);

-- ============================================
-- VIEWS for Analytics
-- ============================================

-- Total contributions by charity
CREATE OR REPLACE VIEW charity_contribution_summary AS
SELECT
  c.id,
  c.name,
  COUNT(cc.id) as total_contributions,
  SUM(cc.amount) as total_amount,
  COUNT(DISTINCT cc.user_id) as unique_contributors,
  AVG(cc.amount) as average_contribution,
  MAX(cc.contribution_date) as last_contribution
FROM charities c
LEFT JOIN charity_contributions cc ON c.id = cc.charity_id
GROUP BY c.id, c.name;

-- Draw performance metrics
CREATE OR REPLACE VIEW draw_performance AS
SELECT
  d.id,
  d.name,
  COUNT(de.id) as total_entries,
  SUM(de.amount_paid) as total_revenue,
  COUNT(DISTINCT de.user_id) as unique_participants,
  d.tickets_sold,
  (COUNT(de.id) * 100.0 / NULLIF(d.total_tickets_available, 0)) as fill_percentage
FROM draws d
LEFT JOIN draw_entries de ON d.id = de.draw_id
GROUP BY d.id, d.name;

-- Payout tracking
CREATE OR REPLACE VIEW payout_summary AS
SELECT
  status,
  payout_type,
  COUNT(*) as count,
  SUM(amount) as total_amount,
  AVG(amount) as average_amount
FROM payouts
GROUP BY status, payout_type;
