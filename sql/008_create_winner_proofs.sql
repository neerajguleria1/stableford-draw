-- Migration 008: Create Winner Proofs Table
-- Created at: 2026-04-19

CREATE TABLE IF NOT EXISTS winner_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_entry_id UUID NOT NULL REFERENCES draw_entries(id) ON DELETE CASCADE,
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proof_type VARCHAR(50) NOT NULL,
  proof_url VARCHAR NOT NULL,
  proof_file_type VARCHAR(50),
  proof_file_size INT,
  description TEXT,
  verification_status VARCHAR(50) DEFAULT 'pending',
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

CREATE POLICY "Admins can verify proofs"
  ON winner_proofs FOR SELECT
  USING (true);
