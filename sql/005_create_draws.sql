-- Migration 005: Create Draws and Draw Tickets Tables
-- Created at: 2026-04-19

-- Main Draws Table
CREATE TABLE IF NOT EXISTS draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  prize_description TEXT,
  prize_value DECIMAL(10,2),
  ticket_price DECIMAL(8,2) NOT NULL,
  total_tickets_available INT,
  tickets_sold INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  draw_date TIMESTAMP,
  winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  winner_announced_at TIMESTAMP,
  total_raised DECIMAL(15,2) DEFAULT 0,
  image_url VARCHAR,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Draw Tickets (Entries) Table
CREATE TABLE IF NOT EXISTS draw_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  quantity INT DEFAULT 1,
  amount_paid DECIMAL(10,2),
  purchased_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_draws_charity_id ON draws(charity_id);
CREATE INDEX IF NOT EXISTS idx_draws_status ON draws(status);
CREATE INDEX IF NOT EXISTS idx_draws_winner_id ON draws(winner_id);
CREATE INDEX IF NOT EXISTS idx_draw_tickets_draw_id ON draw_tickets(draw_id);
CREATE INDEX IF NOT EXISTS idx_draw_tickets_user_id ON draw_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_draw_tickets_ticket_number ON draw_tickets(ticket_number);

-- Row Level Security
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_tickets ENABLE ROW LEVEL SECURITY;

-- Policies for draws
CREATE POLICY "Draws are publicly readable"
  ON draws FOR SELECT
  USING (true);

-- Policies for draw_tickets
CREATE POLICY "Users can view their own tickets"
  ON draw_tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can purchase tickets"
  ON draw_tickets FOR INSERT
  WITH CHECK (true);
