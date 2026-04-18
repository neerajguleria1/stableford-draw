# 🔒 Database Constraints & Indexes Guide

## 📋 Overview

This migration adds comprehensive constraints and 40+ indexes to ensure:
- ✅ Data integrity
- ✅ Query performance
- ✅ Business rule enforcement
- ✅ Referential integrity

---

## 🔑 Constraint Types Added

### 1. **Unique Constraints**
Ensure no duplicate records for specific field combinations.

**Golf Scores:**
```sql
UNIQUE (user_id, DATE(date_played))
-- One score per user per day
```

**Charity Contributions:**
```sql
UNIQUE (transaction_id) WHERE transaction_id IS NOT NULL
-- Each transaction has unique reference
```

**Draw Entries:**
```sql
UNIQUE (transaction_id) WHERE transaction_id IS NOT NULL
```

**Payouts:**
```sql
UNIQUE (transaction_reference) WHERE transaction_reference IS NOT NULL
```

---

### 2. **Check Constraints** (35+)

#### Golf Scores
```sql
-- Score range: 1-90 (9 holes: 1-45, 18 holes: 1-90)
CHECK (score >= 1 AND score <= 90)

-- Par range: 27-72 (9-18 holes)
CHECK (par IS NULL OR (par >= 27 AND par <= 72))

-- Handicap must be positive
CHECK (handicap IS NULL OR handicap >= 0)

-- Net score valid
CHECK (net_score IS NULL OR (net_score >= 1 AND net_score <= 90))

-- Holes must be 9 or 18
CHECK (holes IN (9, 18))
```

#### Charity Contributions
```sql
-- Positive amounts only
CHECK (amount > 0)

-- Valid types
CHECK (contribution_type IN ('donation', 'volunteer', 'fundraiser', 'event'))

-- Valid payment methods
CHECK (payment_method IS NULL OR payment_method IN ('stripe', 'bank_transfer', 'cash', 'crypto'))

-- Non-negative impact value
CHECK (impact_value IS NULL OR impact_value >= 0)
```

#### Draw Entries
```sql
-- Positive quantities
CHECK (quantity > 0)

-- Positive amounts
CHECK (amount_paid > 0)

-- Valid status
CHECK (entry_status IN ('active', 'invalidated', 'won', 'lost'))
```

#### Winner Proofs
```sql
-- Valid proof type
CHECK (proof_type IN ('photo', 'video', 'document', 'verified_claim'))

-- Valid verification status
CHECK (verification_status IN ('pending', 'verified', 'rejected', 'requires_clarification'))

-- Valid file size
CHECK (proof_file_size IS NULL OR proof_file_size > 0)

-- HTTPS URLs only
CHECK (proof_url ~ '^https?://')
```

#### Payouts
```sql
-- Positive amounts
CHECK (amount > 0)

-- Gross >= Net
CHECK (gross_amount IS NULL OR net_amount IS NULL OR gross_amount >= net_amount)

-- Non-negative fees
CHECK (fees_amount IS NULL OR fees_amount >= 0)

-- Valid types
CHECK (payout_type IN ('prize', 'charity_distribution', 'refund', 'subscription_adjustment'))

-- Valid statuses
CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'))

-- Valid methods
CHECK (payout_method IN ('stripe', 'bank_transfer', 'check', 'crypto', 'gift_card'))

-- Retry logic
CHECK (retry_count >= 0 AND max_retries > 0)
```

#### Subscriptions
```sql
-- Positive amounts
CHECK (amount > 0)

-- Valid types
CHECK (plan_type IN ('monthly', 'annual', 'one-time'))

-- Valid frequencies
CHECK (frequency IS NULL OR frequency IN ('weekly', 'monthly', 'annual'))

-- Valid statuses
CHECK (status IN ('active', 'paused', 'cancelled'))

-- Non-negative totals
CHECK (total_donated >= 0 AND donation_count >= 0)
```

#### Draws
```sql
-- Positive ticket price
CHECK (ticket_price > 0)

-- Positive prize value if set
CHECK (prize_value IS NULL OR prize_value > 0)

-- Non-negative ticket counts
CHECK (tickets_sold >= 0)
CHECK (total_tickets_available IS NULL OR total_tickets_available > 0)

-- Valid status
CHECK (status IN ('active', 'closed', 'drawn'))
```

---

### 3. **Foreign Keys** (20+)

Enforces referential integrity with cascading deletes where appropriate.

```
golf_scores
├── REFERENCES auth.users(id) ON DELETE CASCADE
└── (user cannot have scores if deleted)

charity_contributions
├── REFERENCES auth.users(id) ON DELETE CASCADE
├── REFERENCES charities(id) ON DELETE CASCADE
└── (deletes contributions if user/charity deleted)

draw_entries
├── REFERENCES draws(id) ON DELETE CASCADE
├── REFERENCES auth.users(id) ON DELETE CASCADE
└── (delete entries if draw/user deleted)

winner_proofs
├── REFERENCES draw_entries(id) ON DELETE CASCADE
├── REFERENCES draws(id) ON DELETE CASCADE
├── REFERENCES auth.users(id) ON DELETE CASCADE
└── REFERENCES auth.users(verified_by) ON DELETE SET NULL
    (proof stays but verification cleared if admin deleted)

payouts
├── REFERENCES draws(id) ON DELETE SET NULL
├── REFERENCES draw_entries(id) ON DELETE SET NULL
├── REFERENCES charities(id) ON DELETE SET NULL
├── REFERENCES auth.users(created_by) ON DELETE SET NULL
└── (payout record stays but links cleared)

subscriptions
├── REFERENCES auth.users(id) ON DELETE CASCADE
└── REFERENCES charities(id) ON DELETE SET NULL

draws
├── REFERENCES charities(id) ON DELETE CASCADE
└── REFERENCES auth.users(winner_id) ON DELETE SET NULL

users_profiles
└── REFERENCES auth.users(id) ON DELETE CASCADE
```

---

## ⚡ Indexes for Performance

### Golf Scores (6 indexes)
```sql
-- Unique per user per day
idx_golf_scores_user_date

-- Score lookup
idx_golf_scores_score

-- Course and date lookups
idx_golf_scores_course_date
```

### Charity Contributions (4 indexes)
```sql
-- User and charity queries
idx_charity_contributions_user_charity

-- Type and date filtering
idx_charity_contributions_type_date

-- Amount sorting
idx_charity_contributions_amount

-- Payment method filtering
idx_charity_contributions_payment_method
```

### Draw Entries (4 indexes)
```sql
-- Draw and user queries
idx_draw_entries_draw_user

-- Status filtering with date
idx_draw_entries_status_date

-- Winning entries lookup
idx_draw_entries_winning

-- Amount sorting
idx_draw_entries_amount
```

### Winner Proofs (3 indexes)
```sql
-- Verification status
idx_winner_proofs_status

-- User and draw queries
idx_winner_proofs_user_draw

-- Admin verification work
idx_winner_proofs_verified_by_status
```

### Payouts (5 indexes)
```sql
-- Status queries
idx_payouts_status_date

-- Recipient lookups
idx_payouts_recipient

-- Type and status filtering
idx_payouts_payout_type_status

-- Completed payouts (partial index)
idx_payouts_completed_date

-- Failed payouts for retry (partial index)
idx_payouts_next_retry
```

### Subscriptions (3 indexes)
```sql
-- User subscriptions
idx_subscriptions_user_status

-- Charity subscriptions
idx_subscriptions_charity_status

-- Active subscriptions due for billing
idx_subscriptions_next_billing
```

### Draws (3 indexes)
```sql
-- Charity draws
idx_draws_charity_status

-- Draw date queries
idx_draws_draw_date

-- Winner announcements
idx_draws_winner_announced
```

### Charities (4 indexes)
```sql
-- Status filtering
idx_charities_status

-- Category browsing
idx_charities_category

-- Verified charities
idx_charities_verified (partial)

-- Top fundraisers
idx_charities_total_raised
```

### Users Profiles (3 indexes)
```sql
-- Email lookup
idx_users_profiles_email

-- Location filtering
idx_users_profiles_location

-- Top donors
idx_users_profiles_total_donations
```

---

## 📊 Constraint Statistics

| Category | Count |
|----------|-------|
| Unique Constraints | 4 |
| Check Constraints | 35+ |
| Foreign Keys | 20+ |
| Indexes | 40+ |
| **Total Constraints** | **99+** |

---

## 🚀 How to Apply

### Option 1: Direct (Recommended)
```sql
-- In Supabase SQL Editor:
-- Copy entire content of: sql/011_add_constraints_and_indexes.sql
-- Run it all at once
```

### Option 2: Step by Step
```sql
-- Apply constraints by table:
1. Golf Scores constraints
2. Charity Contributions constraints
3. Draw Entries constraints
4. Winner Proofs constraints
5. Payouts constraints
6. Subscriptions constraints
7. Draws constraints
8. Charities constraints
9. Users Profiles constraints
```

---

## ✅ Verification Checklist

After running the migration:

```
Golf Scores
✅ unique_user_golf_score_per_day
✅ check_golf_score_valid (1-90)
✅ check_golf_par_valid (27-72)
✅ check_golf_handicap_positive
✅ 6 indexes created

Charity Contributions
✅ unique_transaction_id
✅ check_contribution_amount_positive
✅ check_contribution_type_valid
✅ check_payment_method_valid
✅ 4 indexes created

Draw Entries
✅ unique_draw_entry_transaction
✅ check_draw_entry_quantity_positive
✅ check_draw_entry_status_valid
✅ 4 indexes created

Winner Proofs
✅ check_proof_type_valid
✅ check_proof_url_format
✅ 3 indexes created

Payouts
✅ unique_payout_transaction
✅ check_payout_amount_positive
✅ check_payout_status_valid
✅ 5 indexes created

All Foreign Keys ✅
All Check Constraints ✅
All Indexes ✅
```

---

## 🎯 Key Benefits

### Data Integrity
- ✅ No invalid scores (1-90)
- ✅ No negative amounts
- ✅ No orphaned records (foreign keys)
- ✅ No duplicate transactions
- ✅ Valid statuses always enforced

### Query Performance
- ✅ Fast user lookups
- ✅ Efficient date range queries
- ✅ Quick status filtering
- ✅ Rapid amount sorting
- ✅ Optimized retry logic

### Business Logic
- ✅ One score per user per day
- ✅ Only valid payment methods
- ✅ Proper payout states
- ✅ Verification workflows
- ✅ Cascading deletes (data cleanup)

---

## 📝 Example: Constraint in Action

```sql
-- This will FAIL (violates check constraint)
INSERT INTO golf_scores (user_id, score, date_played, holes)
VALUES ('user-123', 150, NOW(), 18); -- Score too high!
ERROR: new row for relation "golf_scores" violates check constraint "check_golf_score_valid"

-- This will SUCCEED
INSERT INTO golf_scores (user_id, score, date_played, holes, par)
VALUES ('user-123', 85, NOW(), 18, 72); -- Valid score
```

---

## 🔧 Troubleshooting

### Issue: Constraint violation on existing data
**Solution:** Data migration/cleanup needed before applying constraints

### Issue: FK constraint fails
**Solution:** Ensure referenced records exist or cascade rules are appropriate

### Issue: Slow queries despite indexes
**Solution:** Check index is being used with EXPLAIN, may need query optimization

---

## 📚 Documentation Files

- `SQL_SUMMARY.md` - Complete schema overview
- `ADDITIONAL_TABLES.md` - New tables documentation
- `DATABASE_SETUP.md` - Quick reference
- `sql/README.md` - Table descriptions

---

**All constraints and indexes ready to enforce data integrity and optimize performance! 🚀**
