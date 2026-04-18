-- RLS Testing & Admin Setup Guide

-- ============================================
-- PART 1: VERIFY RLS POLICIES ARE ACTIVE
-- ============================================

-- Check that RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- Expected: All should have rowsecurity = true

-- View all created policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
-- Expected: Should see 34 policies

-- Count policies per table
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
-- Expected output:
-- charities | 3
-- charity_contributions | 3
-- draw_entries | 3
-- draws | 3
-- golf_scores | 4
-- payouts | 5
-- subscriptions | 5
-- users_profiles | 3
-- winner_proofs | 5

-- ============================================
-- PART 2: SETUP ADMIN USERS
-- ============================================

-- Option 1: Via SQL (if you have admin access)
-- Update existing user to be admin
UPDATE auth.users
SET raw_user_meta_data =
  CASE
    WHEN raw_user_meta_data IS NULL THEN '{"role":"admin"}'
    ELSE raw_user_meta_data || '{"role":"admin"}'
  END
WHERE email = 'admin@example.com';

-- Verify admin was set
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'admin@example.com';

-- Option 2: Via Supabase UI
-- 1. Go to Authentication → Users
-- 2. Click on user
-- 3. Scroll to "User Metadata"
-- 4. Add: {"role": "admin"}
-- 5. Save

-- List all admin users
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'admin'
ORDER BY created_at DESC;

-- ============================================
-- PART 3: TEST RLS WITH SAMPLE DATA
-- ============================================

-- Create test users and data
-- Note: You'll need to do this via your app or Supabase UI
-- since you can't create auth.users directly via SQL

-- Example test workflow:
/*
1. Sign up as user-a@test.com
2. Sign up as user-b@test.com
3. Sign up as admin@test.com and set role='admin'

4. As user-a:
   - Create profile
   - Insert golf scores
   - Should see only own data
   - Should NOT see user-b data

5. As user-b:
   - Create profile
   - Insert golf scores
   - Should see only own data

6. As admin:
   - Should see all data
   - Should be able to manage everything
*/

-- ============================================
-- PART 4: RLS POLICY TEST QUERIES
-- ============================================

-- TEST 1: Users can view their own profiles
-- Run as user-a
SELECT * FROM users_profiles WHERE user_id = auth.uid();
-- Expected: Returns user-a's profile (1 row)

-- TEST 2: Users cannot view other profiles
-- Run as user-a
SELECT * FROM users_profiles WHERE user_id != auth.uid();
-- Expected: Empty result (0 rows) - RLS blocks it

-- TEST 3: Users can insert own golf scores
-- Run as user-a
INSERT INTO golf_scores (user_id, score, date_played, holes, par)
VALUES (auth.uid(), 85, NOW()::DATE, 18, 72);
-- Expected: SUCCESS

-- TEST 4: Users cannot insert scores for others
-- Run as user-a
INSERT INTO golf_scores (user_id, score, date_played, holes)
VALUES ('different-user-id', 85, NOW()::DATE, 18);
-- Expected: ERROR - violates RLS policy

-- TEST 5: Users cannot view others' scores
-- Run as user-a
SELECT * FROM golf_scores WHERE user_id != auth.uid();
-- Expected: Empty result (0 rows)

-- TEST 6: Contributions are publicly visible
SELECT COUNT(*) as total_contributions FROM charity_contributions;
-- Expected: Works for everyone (public access)

-- TEST 7: Users can manage own subscriptions
-- Run as user-a
INSERT INTO subscriptions (user_id, charity_id, plan_type, amount, frequency)
VALUES (auth.uid(), 'charity-id', 'monthly', 50.00, 'monthly');
-- Expected: SUCCESS

-- TEST 8: Admin can view all payouts
-- Run as admin (with role='admin')
SELECT COUNT(*) FROM payouts;
-- Expected: Returns count of all payouts

-- TEST 9: Non-admin cannot create payouts
-- Run as regular user
INSERT INTO payouts (payout_type, recipient_type, recipient_id, amount, payout_method, status)
VALUES ('prize', 'user', auth.uid(), 100.00, 'stripe', 'pending');
-- Expected: ERROR - violates RLS policy

-- TEST 10: Admin can manage winner proofs
-- Run as admin
UPDATE winner_proofs
SET verification_status = 'verified'
WHERE verification_status = 'pending'
LIMIT 1;
-- Expected: SUCCESS (may be 0 rows if no pending)

-- ============================================
-- PART 5: SECURITY AUDIT QUERIES
-- ============================================

-- Check for potential data leaks
-- Verify users can only see own profile
SELECT
  u.user_id,
  COUNT(DISTINCT up.user_id) as visible_profiles
FROM auth.users u
CROSS JOIN users_profiles up
WHERE up.user_id = u.id -- Only own profile should be visible
GROUP BY u.user_id;

-- Check golf scores isolation
SELECT
  u.user_id,
  COUNT(DISTINCT gs.user_id) as visible_score_owners
FROM auth.users u
CROSS JOIN golf_scores gs
WHERE gs.user_id = u.id -- Only own scores
GROUP BY u.user_id;

-- Verify admin role is set correctly
SELECT
  email,
  raw_user_meta_data->>'role' as role,
  CASE
    WHEN raw_user_meta_data->>'role' = 'admin' THEN 'ADMIN'
    ELSE 'USER'
  END as access_level
FROM auth.users
WHERE created_at > NOW() - INTERVAL '30 days'
ORDER BY email;

-- ============================================
-- PART 6: MONITORING & LOGGING
-- ============================================

-- View recent policy violations attempts
-- (if you have audit logging enabled)
-- Run this query to see recent permission errors
SELECT
  pg_stat_statements.query,
  pg_stat_statements.calls,
  pg_stat_statements.total_time
FROM pg_stat_statements
WHERE query LIKE '%users_profiles%'
ORDER BY total_time DESC
LIMIT 10;

-- Check for slow queries that might indicate missing indexes
SELECT
  query,
  mean_time,
  calls
FROM pg_stat_statements
WHERE query LIKE '%users_profiles%'
  OR query LIKE '%golf_scores%'
  OR query LIKE '%subscriptions%'
ORDER BY mean_time DESC;

-- ============================================
-- PART 7: TROUBLESHOOTING
-- ============================================

-- If RLS blocks expected query:
-- 1. Check user is authenticated: SELECT auth.uid();
-- 2. Check user ID matches: SELECT auth.uid()::TEXT;
-- 3. Check policy exists:
--    SELECT policyname FROM pg_policies WHERE tablename = 'table_name';
-- 4. Check policy condition: SELECT qual FROM pg_policies WHERE policyname = 'policy_name';

-- Check if user has correct role
SELECT
  id,
  email,
  raw_user_meta_data as metadata,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'user@example.com';

-- View all policies for debugging
SELECT
  tablename,
  policyname,
  permissive,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users_profiles'
ORDER BY policyname;

-- ============================================
-- PART 8: ADMIN MAINTENANCE
-- ============================================

-- Remove admin role from user
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'role'
WHERE email = 'was-admin@example.com';

-- Bulk add admin role
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'
WHERE email IN (
  'admin1@example.com',
  'admin2@example.com',
  'admin3@example.com'
);

-- View admin team
SELECT
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'admin'
ORDER BY last_sign_in_at DESC;

-- Count active users by role
SELECT
  CASE
    WHEN raw_user_meta_data->>'role' = 'admin' THEN 'Admin'
    ELSE 'User'
  END as role,
  COUNT(*) as count,
  COUNT(DISTINCT last_sign_in_at) as active_count
FROM auth.users
GROUP BY role;

-- ============================================
-- SUMMARY OF TESTS
-- ============================================
/*
RLS Policy Testing Checklist:

□ Verify all 34 policies are created
□ Test user data isolation
  □ Users see only own profile
  □ Users see only own scores
  □ Users see only own subscriptions
□ Test public data
  □ Everyone sees charities
  □ Everyone sees draws
  □ Everyone sees contributions (transparency)
□ Test admin access
  □ Admin can see all payouts
  □ Admin can manage draws
  □ Admin can verify winner proofs
□ Test restrictions
  □ Users cannot create draws
  □ Users cannot create charities
  □ Users cannot create payouts
  □ Users cannot see others' scores
□ Test role-based access
  □ Admin role is respected
  □ Regular users blocked from admin functions
  □ Charity owners can see their data
□ Performance
  □ Policies don't cause slow queries
  □ Indexes still working with RLS
*/
