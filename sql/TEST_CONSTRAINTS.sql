-- Validation Tests for Constraints
-- Run these to verify constraints are working properly

-- ============================================
-- TEST 1: Golf Score Constraints
-- ============================================

-- Test 1A: Valid score (should succeed)
-- INSERT INTO golf_scores (user_id, score, date_played, holes, par)
-- VALUES ('user-uuid', 85, NOW(), 18, 72);
-- Expected: SUCCESS

-- Test 1B: Invalid score - too high (should fail)
-- INSERT INTO golf_scores (user_id, score, date_played, holes, par)
-- VALUES ('user-uuid', 150, NOW(), 18, 72);
-- Expected: VIOLATION - check_golf_score_valid

-- Test 1C: Invalid score - too low (should fail)
-- INSERT INTO golf_scores (user_id, score, date_played, holes, par)
-- VALUES ('user-uuid', 0, NOW(), 18, 72);
-- Expected: VIOLATION - check_golf_score_valid

-- Test 1D: Invalid par (should fail)
-- INSERT INTO golf_scores (user_id, score, date_played, holes, par)
-- VALUES ('user-uuid', 45, NOW(), 9, 100);
-- Expected: VIOLATION - check_golf_par_valid

-- Test 1E: Duplicate score same day (should fail)
-- INSERT INTO golf_scores (user_id, score, date_played, holes) VALUES ('user-uuid', 85, '2026-04-19', 18);
-- INSERT INTO golf_scores (user_id, score, date_played, holes) VALUES ('user-uuid', 88, '2026-04-19', 18);
-- Expected: VIOLATION - unique_user_golf_score_per_day

-- Test 1F: Same user, different dates (should succeed)
-- INSERT INTO golf_scores (user_id, score, date_played, holes) VALUES ('user-uuid', 85, '2026-04-19', 18);
-- INSERT INTO golf_scores (user_id, score, date_played, holes) VALUES ('user-uuid', 88, '2026-04-20', 18);
-- Expected: SUCCESS (both inserts OK)

-- ============================================
-- TEST 2: Charity Contribution Constraints
-- ============================================

-- Test 2A: Valid contribution (should succeed)
-- INSERT INTO charity_contributions (user_id, charity_id, amount, contribution_type)
-- VALUES ('user-uuid', 'charity-uuid', 100.00, 'donation');
-- Expected: SUCCESS

-- Test 2B: Negative amount (should fail)
-- INSERT INTO charity_contributions (user_id, charity_id, amount, contribution_type)
-- VALUES ('user-uuid', 'charity-uuid', -100.00, 'donation');
-- Expected: VIOLATION - check_contribution_amount_positive

-- Test 2C: Invalid contribution type (should fail)
-- INSERT INTO charity_contributions (user_id, charity_id, amount, contribution_type)
-- VALUES ('user-uuid', 'charity-uuid', 100.00, 'invalid_type');
-- Expected: VIOLATION - check_contribution_type_valid

-- Test 2D: Invalid payment method (should fail)
-- INSERT INTO charity_contributions (user_id, charity_id, amount, contribution_type, payment_method)
-- VALUES ('user-uuid', 'charity-uuid', 100.00, 'donation', 'western_union');
-- Expected: VIOLATION - check_payment_method_valid

-- ============================================
-- TEST 3: Draw Entry Constraints
-- ============================================

-- Test 3A: Valid entry (should succeed)
-- INSERT INTO draw_entries (draw_id, user_id, entry_number, quantity, amount_paid, entry_status)
-- VALUES ('draw-uuid', 'user-uuid', 'ENTRY001', 1, 50.00, 'active');
-- Expected: SUCCESS

-- Test 3B: Zero quantity (should fail)
-- INSERT INTO draw_entries (draw_id, user_id, entry_number, quantity, amount_paid)
-- VALUES ('draw-uuid', 'user-uuid', 'ENTRY002', 0, 50.00);
-- Expected: VIOLATION - check_draw_entry_quantity_positive

-- Test 3C: Zero amount (should fail)
-- INSERT INTO draw_entries (draw_id, user_id, entry_number, quantity, amount_paid)
-- VALUES ('draw-uuid', 'user-uuid', 'ENTRY003', 1, 0.00);
-- Expected: VIOLATION - check_draw_entry_amount_positive

-- Test 3D: Invalid status (should fail)
-- INSERT INTO draw_entries (draw_id, user_id, entry_number, quantity, amount_paid, entry_status)
-- VALUES ('draw-uuid', 'user-uuid', 'ENTRY004', 1, 50.00, 'pending');
-- Expected: VIOLATION - check_draw_entry_status_valid

-- ============================================
-- TEST 4: Payout Constraints
-- ============================================

-- Test 4A: Valid payout (should succeed)
-- INSERT INTO payouts (payout_type, recipient_type, recipient_id, amount, currency, payout_method, status)
-- VALUES ('prize', 'user', 'user-uuid', 1000.00, 'USD', 'stripe', 'pending');
-- Expected: SUCCESS

-- Test 4B: Negative amount (should fail)
-- INSERT INTO payouts (payout_type, recipient_type, recipient_id, amount, payout_method, status)
-- VALUES ('prize', 'user', 'user-uuid', -1000.00, 'stripe', 'pending');
-- Expected: VIOLATION - check_payout_amount_positive

-- Test 4C: Gross < Net (should fail)
-- INSERT INTO payouts (payout_type, recipient_type, recipient_id, amount, gross_amount, net_amount, payout_method, status)
-- VALUES ('prize', 'user', 'user-uuid', 1000.00, 900.00, 1000.00, 'stripe', 'pending');
-- Expected: VIOLATION - check_payout_gross_net

-- Test 4D: Invalid status (should fail)
-- INSERT INTO payouts (payout_type, recipient_type, recipient_id, amount, payout_method, status)
-- VALUES ('prize', 'user', 'user-uuid', 1000.00, 'stripe', 'waiting');
-- Expected: VIOLATION - check_payout_status_valid

-- ============================================
-- TEST 5: Foreign Key Constraints
-- ============================================

-- Test 5A: Valid foreign key (should succeed)
-- WITH new_user AS (
--   SELECT 'test-user-id' as user_id
-- )
-- INSERT INTO golf_scores (user_id, score, date_played, holes)
-- SELECT new_user.user_id, 85, NOW(), 18
-- FROM new_user;
-- Expected: SUCCESS (if user exists in auth.users)

-- Test 5B: Invalid foreign key (should fail)
-- INSERT INTO golf_scores (user_id, score, date_played, holes)
-- VALUES ('non-existent-user-id', 85, NOW(), 18);
-- Expected: VIOLATION - fk_golf_scores_user_id

-- Test 5C: Cascade delete test
-- First: Create charity with contributions
-- Then: DELETE FROM charities WHERE id = 'charity-uuid';
-- Expected: All related contributions also deleted

-- ============================================
-- TEST 6: Unique Constraints
-- ============================================

-- Test 6A: Unique transaction ID (should fail on duplicate)
-- INSERT INTO charity_contributions (user_id, charity_id, amount, contribution_type, transaction_id)
-- VALUES ('user1', 'charity1', 100, 'donation', 'TXN001');
-- INSERT INTO charity_contributions (user_id, charity_id, amount, contribution_type, transaction_id)
-- VALUES ('user2', 'charity1', 50, 'donation', 'TXN001');
-- Expected: VIOLATION - unique_transaction_id (on second insert)

-- Test 6B: Unique transaction ID NULL handling (should succeed)
-- INSERT INTO charity_contributions (user_id, charity_id, amount, contribution_type, transaction_id)
-- VALUES ('user1', 'charity1', 100, 'donation', NULL);
-- INSERT INTO charity_contributions (user_id, charity_id, amount, contribution_type, transaction_id)
-- VALUES ('user2', 'charity1', 50, 'donation', NULL);
-- Expected: SUCCESS (NULLs don't violate unique constraint)

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all constraints are created
SELECT constraint_name, table_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
ORDER BY table_name, constraint_name;

-- Check all indexes are created
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check foreign keys
SELECT
  constraint_name,
  table_name,
  column_name,
  referenced_table_name,
  referenced_column_name
FROM information_schema.key_column_usage
WHERE referenced_table_name IS NOT NULL
  AND table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- PERFORMANCE TESTING QUERIES
-- ============================================

-- Test index usage: Golf scores by user and date
EXPLAIN ANALYZE
SELECT * FROM golf_scores
WHERE user_id = 'user-uuid'
AND DATE(date_played) = '2026-04-19';

-- Test index usage: Draw entries by status and date
EXPLAIN ANALYZE
SELECT * FROM draw_entries
WHERE entry_status = 'active'
AND DATE(purchased_at) >= '2026-04-01'
ORDER BY purchased_at DESC;

-- Test index usage: Payouts by status
EXPLAIN ANALYZE
SELECT * FROM payouts
WHERE status = 'pending'
AND next_retry_date <= NOW()
ORDER BY created_at ASC;

-- Test index usage: User contributions
EXPLAIN ANALYZE
SELECT c.*, ch.name
FROM charity_contributions c
JOIN charities ch ON c.charity_id = ch.id
WHERE c.user_id = 'user-uuid'
ORDER BY c.contribution_date DESC;
