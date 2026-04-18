# 🎉 Additional SQL Tables - Complete Reference

## 📊 4 New Tables Created

### 1. **charity_contributions** - Track All Contributions
Detailed tracking of every contribution type (donations, volunteering, events, etc.)

**Key Fields:**
- `user_id` - Who contributed
- `charity_id` - Which charity
- `amount` - Contribution amount
- `contribution_type` - donation, volunteer, fundraiser, event
- `impact_metric` - What was achieved (meals, trees, people helped)
- `payment_method` - How it was paid (Stripe, bank, cash, crypto)
- `transaction_id` - Payment reference
- `tax_deductible` - For tax purposes
- `acknowledgment_sent` - Thank you email sent

**Use Cases:**
✅ Track all donation types
✅ Store impact metrics
✅ Generate tax receipts
✅ Send acknowledgment emails
✅ Analyze contribution patterns

---

### 2. **draw_entries** - Raffle/Lottery Participation
Enhanced draw entry tracking with verification and winning status.

**Key Fields:**
- `draw_id` - Which draw/raffle
- `user_id` - Who purchased
- `entry_number` - Ticket number
- `quantity` - Number of tickets
- `amount_paid` - Price paid
- `entry_status` - active, won, lost, invalidated
- `transaction_id` - Payment proof
- `is_winning_entry` - Did this entry win?
- `winning_number` - Winning ticket number
- `confirmation_email_sent` - Receipt sent?

**Use Cases:**
✅ Sell raffle tickets
✅ Track entry status
✅ Determine winners
✅ Email confirmations
✅ Prevent fraud

---

### 3. **winner_proofs** - Winner Verification
Stores proof of winning (photos, videos, documents) with verification workflow.

**Key Fields:**
- `draw_entry_id` - Which entry won
- `draw_id` - Which draw
- `user_id` - The winner
- `proof_type` - photo, video, document, claim
- `proof_url` - Where file is stored
- `proof_file_type` - image/jpeg, video/mp4, etc.
- `proof_file_size` - File size in bytes
- `verification_status` - pending, verified, rejected
- `verified_by` - Admin who verified
- `verification_notes` - Verification comments
- `resubmission_requested` - Need better proof?

**Use Cases:**
✅ Prove winners are real
✅ Prevent fraud
✅ Store evidence
✅ Admin verification workflow
✅ Request resubmissions
✅ Maintain transparency

---

### 4. **payouts** - Distribution & Payments
Tracks all payouts: prize payments, charity distributions, refunds.

**Key Fields:**
- `payout_type` - prize, charity_distribution, refund, adjustment
- `recipient_type` - user, charity, organization
- `recipient_id` - Who gets paid
- `amount` - Payout amount
- `gross_amount` - Before fees
- `fees_amount` - Processing fees
- `net_amount` - After fees
- `status` - pending, processing, completed, failed
- `payout_method` - Stripe, bank, check, crypto
- `stripe_payout_id` - Stripe reference
- `transaction_reference` - Unique reference
- `retry_count` - Failed payout retries
- `scheduled_date` - When to pay
- `completed_date` - When paid
- `failure_reason` - Why it failed

**Use Cases:**
✅ Pay prize winners
✅ Distribute to charities
✅ Process refunds
✅ Track payment status
✅ Handle failed payments
✅ Calculate fees
✅ Audit trail

---

## 📈 4 Analytics Views Included

### 1. **charity_contribution_summary**
Shows contribution metrics per charity:
- Total contributions
- Total amount raised
- Unique contributors
- Average contribution
- Last contribution date

### 2. **draw_performance**
Draw metrics and fill rates:
- Total entries sold
- Revenue generated
- Unique participants
- Fill percentage
- Entry count

### 3. **payout_summary**
Payout tracking by status and type:
- Count by status
- Total amounts
- Average payout
- Date ranges

### 4. **user_contribution_history**
User-level contribution analytics:
- Charities supported
- Total donations
- Last contribution date
- Fundraiser participation

---

## 🗂️ Complete File Structure

```
sql/
├── create_tables.sql                    ← All tables (Complete setup)
├── 006_additional_tables.sql            ← All 4 new tables
├── 006_create_charity_contributions.sql
├── 007_create_draw_entries.sql
├── 008_create_winner_proofs.sql
├── 009_create_payouts.sql
└── 010_create_views.sql
```

---

## 🚀 How to Execute

### **Option 1: Complete Setup (All at once)**
```sql
-- Copy and run:
sql/create_tables.sql              (Original 5 tables)
sql/006_additional_tables.sql      (All 4 new tables + views)
```

### **Option 2: Step by Step**
```sql
001_create_users_profiles.sql
002_create_charities.sql
003_create_subscriptions.sql
004_create_golf_scores.sql
005_create_draws.sql
006_create_charity_contributions.sql
007_create_draw_entries.sql
008_create_winner_proofs.sql
009_create_payouts.sql
010_create_views.sql
```

### **In Supabase:**
1. SQL Editor → New Query
2. Copy file content
3. Click Run ✅

---

## 🔒 Security Features

✅ **Row Level Security (RLS)** on all tables
✅ **Foreign Keys** for data integrity
✅ **Unique Constraints** to prevent duplicates
✅ **Timestamps** for audit trails
✅ **User Isolation** - Users only see their data
✅ **Status Tracking** - Complete payout workflow
✅ **Verification Workflow** - Proof validation

---

## 💾 Data Relationships

```
Users
├── charity_contributions
│   └── charities
├── draw_entries
│   ├── draws
│   └── winner_proofs
└── payouts
    ├── draws
    ├── draw_entries
    └── charities
```

---

## 🎯 Common Queries

**Get all contributions by a user:**
```sql
SELECT * FROM charity_contributions
WHERE user_id = 'user-uuid'
ORDER BY contribution_date DESC;
```

**Check draw entry status:**
```sql
SELECT de.*, d.name, d.draw_date
FROM draw_entries de
JOIN draws d ON de.draw_id = d.id
WHERE de.user_id = 'user-uuid';
```

**Get pending winner proofs:**
```sql
SELECT * FROM winner_proofs
WHERE verification_status = 'pending'
ORDER BY submitted_at;
```

**Payout summary by status:**
```sql
SELECT status, COUNT(*) as count, SUM(amount) as total
FROM payouts
GROUP BY status;
```

**Charity fundraising totals:**
```sql
SELECT c.name, ccs.total_amount, ccs.unique_contributors
FROM charities c
JOIN charity_contribution_summary ccs ON c.id = ccs.id
ORDER BY ccs.total_amount DESC;
```

---

## ✅ You Now Have:

- ✅ 9 Total Tables (5 original + 4 new)
- ✅ 4 Analytics Views
- ✅ Complete RLS Security
- ✅ Full TypeScript Types
- ✅ Audit Trail & Timestamps
- ✅ Payout Tracking System
- ✅ Winner Verification Workflow
- ✅ Contribution Analytics
- ✅ Draw Management

---

## 📝 Next Steps

1. ✅ Execute the SQL migrations
2. Verify tables in Supabase
3. Create API services for CRUD
4. Build UI components
5. Implement payout workflows
6. Add winner verification flows

**Everything is ready! 🚀**
