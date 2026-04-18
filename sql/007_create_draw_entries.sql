-- Migration 007: Create Draw Entries Table
-- Created at: 2026-04-19

CREATE TABLE IF NOT EXISTS draw_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_number VARCHAR(50) NOT NULL,
  quantity INT DEFAULT 1,
  amount_paid DECIMAL(10,2) NOT NULL,
  entry_status VARCHAR(50) DEFAULT 'active',
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
