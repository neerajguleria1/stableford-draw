-- Migration 001: Create Users Profiles Table
-- Created at: 2026-04-19

CREATE TABLE IF NOT EXISTS users_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  profile_picture_url VARCHAR,
  bio TEXT,
  location VARCHAR(255),
  handicap DECIMAL(5,1),
  total_donations DECIMAL(10,2) DEFAULT 0,
  charity_preference_id UUID,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_users_profiles_user_id ON users_profiles(user_id);

ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON users_profiles FOR SELECT
  USING (auth.uid() = user_id OR true);

CREATE POLICY "Users can update their own profile"
  ON users_profiles FOR UPDATE
  USING (auth.uid() = user_id);
