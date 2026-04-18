-- Migration 002: Create Charities Table
-- Created at: 2026-04-19

CREATE TABLE IF NOT EXISTS charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  long_description TEXT,
  logo_url VARCHAR,
  website VARCHAR,
  email VARCHAR(255),
  phone VARCHAR(20),
  registration_number VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  category VARCHAR(100),
  total_raised DECIMAL(15,2) DEFAULT 0,
  total_beneficiaries INT DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_charities_slug ON charities(slug);
CREATE INDEX IF NOT EXISTS idx_charities_status ON charities(status);
CREATE INDEX IF NOT EXISTS idx_charities_category ON charities(category);

ALTER TABLE charities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Charities are publicly readable"
  ON charities FOR SELECT
  USING (true);
