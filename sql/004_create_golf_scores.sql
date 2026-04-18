-- Migration 004: Create Golf Scores Table
-- Created at: 2026-04-19

CREATE TABLE IF NOT EXISTS golf_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  charity_event_id UUID,
  course_name VARCHAR(255),
  holes INT DEFAULT 18,
  score INT NOT NULL,
  par INT,
  handicap DECIMAL(5,1),
  net_score INT,
  date_played TIMESTAMP NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_golf_scores_user_id ON golf_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_golf_scores_date ON golf_scores(date_played);
CREATE INDEX IF NOT EXISTS idx_golf_scores_course ON golf_scores(course_name);

ALTER TABLE golf_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own golf scores"
  ON golf_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own golf scores"
  ON golf_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own golf scores"
  ON golf_scores FOR UPDATE
  USING (auth.uid() = user_id);
