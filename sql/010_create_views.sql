-- Migration 010: Create Analytics Views
-- Created at: 2026-04-19

-- View 1: Charity Contribution Summary
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

-- View 2: Draw Performance Metrics
CREATE OR REPLACE VIEW draw_performance AS
SELECT
  d.id,
  d.name,
  COUNT(de.id) as total_entries,
  SUM(de.amount_paid) as total_revenue,
  COUNT(DISTINCT de.user_id) as unique_participants,
  d.tickets_sold,
  ROUND((COUNT(de.id) * 100.0 / NULLIF(d.total_tickets_available, 0))::numeric, 2) as fill_percentage
FROM draws d
LEFT JOIN draw_entries de ON d.id = de.draw_id
GROUP BY d.id, d.name, d.tickets_sold;

-- View 3: Payout Summary
CREATE OR REPLACE VIEW payout_summary AS
SELECT
  status,
  payout_type,
  COUNT(*) as count,
  SUM(amount) as total_amount,
  AVG(amount) as average_amount,
  MIN(created_at) as earliest_payout,
  MAX(created_at) as latest_payout
FROM payouts
GROUP BY status, payout_type;

-- View 4: User Contribution History
CREATE OR REPLACE VIEW user_contribution_history AS
SELECT
  u.id as user_id,
  u.email,
  COUNT(DISTINCT cc.charity_id) as charities_supported,
  COUNT(cc.id) as total_contributions,
  SUM(cc.amount) as total_donated,
  COUNT(CASE WHEN cc.contribution_type = 'donation' THEN 1 END) as donation_count,
  COUNT(CASE WHEN cc.contribution_type = 'fundraiser' THEN 1 END) as fundraiser_count,
  MAX(cc.contribution_date) as last_contribution_date
FROM auth.users u
LEFT JOIN charity_contributions cc ON u.id = cc.user_id
GROUP BY u.id, u.email;
