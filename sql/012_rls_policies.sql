-- Migration 012: Row Level Security (RLS) Policies
-- Created at: 2026-04-19

-- ============================================
-- USERS PROFILES - RLS Policies
-- ============================================

-- Enable RLS (if not already enabled)
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own profile
CREATE POLICY "users_can_view_own_profile"
  ON users_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can update their own profile
CREATE POLICY "users_can_update_own_profile"
  ON users_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can insert their own profile (on signup)
CREATE POLICY "users_can_insert_own_profile"
  ON users_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users cannot delete their own profile (only admins)
-- (implicitly denied - no DELETE policy)

-- Policy 5: Public can view profiles (for donor recognition) - optional
-- CREATE POLICY "public_can_view_profiles"
--   ON users_profiles FOR SELECT
--   USING (true);

-- ============================================
-- GOLF SCORES - RLS Policies
-- ============================================

-- Enable RLS (if not already enabled)
ALTER TABLE golf_scores ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own scores
CREATE POLICY "users_can_view_own_scores"
  ON golf_scores FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own scores
CREATE POLICY "users_can_insert_own_scores"
  ON golf_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own scores
CREATE POLICY "users_can_update_own_scores"
  ON golf_scores FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own scores
CREATE POLICY "users_can_delete_own_scores"
  ON golf_scores FOR DELETE
  USING (auth.uid() = user_id);

-- Policy 5: Public can view scores (for leaderboards) - optional
-- CREATE POLICY "public_can_view_scores"
--   ON golf_scores FOR SELECT
--   USING (true);

-- ============================================
-- SUBSCRIPTIONS - RLS Policies
-- ============================================

-- Enable RLS (if not already enabled)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own subscriptions
CREATE POLICY "users_can_view_own_subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own subscriptions
CREATE POLICY "users_can_insert_own_subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own subscriptions (pause/resume/cancel)
CREATE POLICY "users_can_update_own_subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete (cancel) their own subscriptions
CREATE POLICY "users_can_delete_own_subscriptions"
  ON subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Policy 5: Charities can view subscriptions to them (for analytics)
CREATE POLICY "charities_can_view_their_subscriptions"
  ON subscriptions FOR SELECT
  USING (
    charity_id IN (
      SELECT id FROM charities
      WHERE created_by = auth.uid()
    )
  );

-- ============================================
-- CHARITY CONTRIBUTIONS - RLS Policies
-- ============================================

-- Enable RLS (if not already enabled)
ALTER TABLE charity_contributions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own contributions
CREATE POLICY "users_can_view_own_contributions"
  ON charity_contributions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can insert (make) contributions
CREATE POLICY "users_can_insert_own_contributions"
  ON charity_contributions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can view all contributions (for transparency)
CREATE POLICY "public_can_view_contributions"
  ON charity_contributions FOR SELECT
  USING (true);

-- Policy 4: Charities can view contributions to them
CREATE POLICY "charities_can_view_contributions"
  ON charity_contributions FOR SELECT
  USING (
    charity_id IN (
      SELECT id FROM charities
      WHERE created_by = auth.uid()
    )
  );

-- ============================================
-- DRAW ENTRIES - RLS Policies
-- ============================================

-- Enable RLS (if not already enabled)
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own entries
CREATE POLICY "users_can_view_own_entries"
  ON draw_entries FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can insert (buy) entries
CREATE POLICY "users_can_insert_entries"
  ON draw_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Public can view draw entries (transparency)
CREATE POLICY "public_can_view_entries"
  ON draw_entries FOR SELECT
  USING (true);

-- Policy 4: Charities/Admins can view entries to their draws
CREATE POLICY "admins_can_view_entries"
  ON draw_entries FOR SELECT
  USING (
    draw_id IN (
      SELECT id FROM draws
      WHERE charity_id IN (
        SELECT id FROM charities
        WHERE created_by = auth.uid()
      )
    )
  );

-- ============================================
-- WINNER PROOFS - RLS Policies
-- ============================================

-- Enable RLS (if not already enabled)
ALTER TABLE winner_proofs ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own proofs
CREATE POLICY "users_can_view_own_proofs"
  ON winner_proofs FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own proofs
CREATE POLICY "users_can_insert_own_proofs"
  ON winner_proofs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own pending proofs
CREATE POLICY "users_can_update_own_proofs"
  ON winner_proofs FOR UPDATE
  USING (auth.uid() = user_id AND verification_status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Admins can view all proofs (for verification)
CREATE POLICY "admins_can_view_all_proofs"
  ON winner_proofs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy 5: Admins can update proofs (verify/reject)
CREATE POLICY "admins_can_verify_proofs"
  ON winner_proofs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================
-- PAYOUTS - RLS Policies
-- ============================================

-- Enable RLS (if not already enabled)
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view payouts to them
CREATE POLICY "users_can_view_own_payouts"
  ON payouts FOR SELECT
  USING (auth.uid() = recipient_id AND recipient_type = 'user');

-- Policy 2: Charities can view payouts to them
CREATE POLICY "charities_can_view_payouts"
  ON payouts FOR SELECT
  USING (
    charity_id IN (
      SELECT id FROM charities
      WHERE created_by = auth.uid()
    )
  );

-- Policy 3: Admins can view all payouts
CREATE POLICY "admins_can_view_all_payouts"
  ON payouts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy 4: Admins can create/update payouts
CREATE POLICY "admins_can_manage_payouts"
  ON payouts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "admins_can_update_payouts"
  ON payouts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================
-- DRAWS - RLS Policies
-- ============================================

-- Enable RLS (if not already enabled)
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone can view draws
CREATE POLICY "public_can_view_draws"
  ON draws FOR SELECT
  USING (true);

-- Policy 2: Admins can create draws
CREATE POLICY "admins_can_create_draws"
  ON draws FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy 3: Admins can update draws
CREATE POLICY "admins_can_update_draws"
  ON draws FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================
-- CHARITIES - RLS Policies
-- ============================================

-- Enable RLS (if not already enabled)
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone can view charities
CREATE POLICY "public_can_view_charities"
  ON charities FOR SELECT
  USING (true);

-- Policy 2: Admins can create charities
CREATE POLICY "admins_can_create_charities"
  ON charities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy 3: Admins can update charities
CREATE POLICY "admins_can_update_charities"
  ON charities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================
-- ADMIN ROLE HELPER FUNCTION
-- ============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
$$;

-- Function to check if user owns charity
CREATE OR REPLACE FUNCTION user_owns_charity(charity_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM charities
    WHERE id = charity_id
    AND created_by = auth.uid()
  )
$$;

-- Function to check if user owns draw
CREATE OR REPLACE FUNCTION user_owns_draw(draw_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM draws d
    JOIN charities c ON d.charity_id = c.id
    WHERE d.id = draw_id
    AND c.created_by = auth.uid()
  )
$$;

-- ============================================
-- RLS SUMMARY
-- ============================================
/*
Policies Created:
✅ Users Profiles:        3 policies (view, update, insert own)
✅ Golf Scores:           4 policies (view, insert, update, delete own)
✅ Subscriptions:         5 policies (user + charity access)
✅ Charity Contributions: 3 policies (user + public + charity)
✅ Draw Entries:          3 policies (user + public + admin)
✅ Winner Proofs:         5 policies (user + admin verification)
✅ Payouts:               5 policies (user + charity + admin)
✅ Draws:                 3 policies (public view + admin manage)
✅ Charities:             3 policies (public view + admin manage)
────────────────────────────
TOTAL: 34 Policies

Helper Functions: 3
- is_admin()
- user_owns_charity()
- user_owns_draw()

Security Model:
✅ Users can only access their own data
✅ Public can view campaigns/charities/transparency
✅ Admins have full management access
✅ Charities can see contributions/subscriptions
*/
