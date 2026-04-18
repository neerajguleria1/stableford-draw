# SQL Database Setup Guide

## 📊 Database Tables Overview

This document explains how to set up your Supabase database with all required tables.

## 🗄️ Tables Created

### 1. **users_profiles** (Extended User Data)
Stores additional user information beyond Supabase Auth.

**Fields:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Reference to auth.users
- `full_name` (VARCHAR) - User's full name
- `email` (VARCHAR) - Email address
- `phone` (VARCHAR) - Phone number
- `profile_picture_url` (VARCHAR) - Avatar URL
- `bio` (TEXT) - User biography
- `location` (VARCHAR) - User location
- `handicap` (DECIMAL) - Golf handicap
- `total_donations` (DECIMAL) - Total amount donated
- `charity_preference_id` (UUID) - Preferred charity
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Update timestamp

**Row Level Security:** Users can only view/edit their own profile

---

### 2. **charities** (Organizations)
Stores information about charities/organizations.

**Fields:**
- `id` (UUID) - Primary key
- `name` (VARCHAR) - Charity name (unique)
- `slug` (VARCHAR) - URL slug (unique)
- `description` (TEXT) - Short description
- `long_description` (TEXT) - Detailed description
- `logo_url` (VARCHAR) - Logo image URL
- `website` (VARCHAR) - Website URL
- `email` (VARCHAR) - Contact email
- `phone` (VARCHAR) - Contact phone
- `registration_number` (VARCHAR) - Legal registration
- `status` (VARCHAR) - 'active', 'inactive', etc.
- `category` (VARCHAR) - Charity category
- `total_raised` (DECIMAL) - Total funds raised
- `total_beneficiaries` (INT) - People helped
- `verified` (BOOLEAN) - Is verified by platform
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Update timestamp

**Row Level Security:** Publicly readable

---

### 3. **subscriptions** (Recurring Donations)
Tracks recurring donations and memberships.

**Fields:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Reference to auth.users
- `charity_id` (UUID) - Reference to charities
- `plan_type` (VARCHAR) - 'monthly', 'annual', 'one-time'
- `amount` (DECIMAL) - Amount per period
- `currency` (VARCHAR) - Currency code (default: USD)
- `frequency` (VARCHAR) - 'weekly', 'monthly', 'annual'
- `status` (VARCHAR) - 'active', 'paused', 'cancelled'
- `stripe_subscription_id` (VARCHAR) - Stripe reference
- `start_date` (TIMESTAMP) - Start date
- `next_billing_date` (TIMESTAMP) - Next billing date
- `cancelled_date` (TIMESTAMP) - When cancelled
- `total_donated` (DECIMAL) - Total donated so far
- `donation_count` (INT) - Number of donations
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Update timestamp

**Row Level Security:** Users can only access their own subscriptions

---

### 4. **golf_scores** (Game Scores)
Tracks golf game scores for tournaments and events.

**Fields:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Reference to auth.users
- `charity_event_id` (UUID) - Associated event
- `course_name` (VARCHAR) - Golf course name
- `holes` (INT) - Number of holes (default: 18)
- `score` (INT) - Total score
- `par` (INT) - Course par
- `handicap` (DECIMAL) - Player handicap
- `net_score` (INT) - Score after handicap adjustment
- `date_played` (TIMESTAMP) - When the round was played
- `notes` (TEXT) - Additional notes
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Update timestamp

**Row Level Security:** Users can only view/edit their own scores

---

### 5. **draws** (Raffles/Lotteries)
Manages charity draws and raffles.

**Fields:**
- `id` (UUID) - Primary key
- `name` (VARCHAR) - Draw name
- `description` (TEXT) - Draw description
- `charity_id` (UUID) - Associated charity
- `prize_description` (TEXT) - What's being won
- `prize_value` (DECIMAL) - Prize monetary value
- `ticket_price` (DECIMAL) - Cost per ticket
- `total_tickets_available` (INT) - Total possible tickets
- `tickets_sold` (INT) - Number sold so far
- `status` (VARCHAR) - 'active', 'closed', 'drawn'
- `draw_date` (TIMESTAMP) - When winner is drawn
- `winner_id` (UUID) - Winner user reference
- `winner_announced_at` (TIMESTAMP) - When announced
- `total_raised` (DECIMAL) - Total funds from draw
- `image_url` (VARCHAR) - Prize image
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Update timestamp

**Row Level Security:** Publicly readable

---

### 6. **draw_tickets** (Raffle Entries)
Individual tickets/entries in a draw.

**Fields:**
- `id` (UUID) - Primary key
- `draw_id` (UUID) - Reference to draws
- `user_id` (UUID) - Reference to auth.users
- `ticket_number` (VARCHAR) - Unique ticket number
- `quantity` (INT) - Number of tickets purchased
- `amount_paid` (DECIMAL) - Amount paid
- `purchased_at` (TIMESTAMP) - Purchase time
- `created_at` (TIMESTAMP) - Creation timestamp

**Row Level Security:** Users can only view their own tickets

---

## 🚀 How to Set Up

### Option 1: Using SQL Editor (Recommended for Supabase)

1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the complete SQL script from `sql/create_tables.sql`
5. Click "Run"

### Option 2: Using Individual Migrations

1. Go to Supabase SQL Editor
2. Run migration files in order:
   - `001_create_users_profiles.sql`
   - `002_create_charities.sql`
   - `003_create_subscriptions.sql`
   - `004_create_golf_scores.sql`
   - `005_create_draws.sql`

### Option 3: Using Database Client

```bash
# Using psql
psql postgresql://[user]:[password]@[host]/[database] < sql/create_tables.sql
```

## 📋 Sample Data

You can insert sample data for testing:

```sql
-- Insert sample charity
INSERT INTO charities (name, slug, description, category, verified)
VALUES 
  ('World Water Foundation', 'world-water', 'Providing clean water globally', 'Health & Water', true),
  ('Green Earth Initiative', 'green-earth', 'Environmental conservation', 'Environment', true);

-- Insert sample draw
INSERT INTO draws (name, charity_id, prize_description, ticket_price, total_tickets_available)
VALUES 
  ('Charity Golf Tournament Draw', (SELECT id FROM charities WHERE slug = 'world-water'), 'Weekend Golf Package at Premium Course', 50, 1000);
```

## 🔐 Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **users_profiles**: Users can only view/edit their own
- **charities**: Public read access
- **subscriptions**: Users can only see their own
- **golf_scores**: Users can only manage their own
- **draws**: Public read access
- **draw_tickets**: Users can only see their own tickets

## 📈 Indexes

All tables have indexes on frequently-queried fields:
- User IDs (foreign keys)
- Status fields
- Date fields
- Slug fields

These improve query performance significantly.

## 🔄 Relationships

```
auth.users
  ├── users_profiles (1-to-1)
  ├── subscriptions (1-to-many)
  │   └── charities (many-to-1)
  ├── golf_scores (1-to-many)
  ├── draw_tickets (1-to-many)
  │   └── draws (many-to-1)
  └── draws (as winner, 1-to-many)

charities
  ├── subscriptions (1-to-many)
  ├── draws (1-to-many)
```

## ✅ Verification

After creating tables, verify in Supabase:

1. Go to Table Editor
2. You should see all 6 tables listed
3. Click each to view structure
4. Check indexes and policies are applied

## 🎯 Next Steps

1. ✅ Create tables
2. Add sample data (optional)
3. Update TypeScript types to match
4. Create API services for CRUD operations
5. Build UI components to interact with data

## 📝 Notes

- All timestamps use UTC (TIMESTAMP type)
- UUIDs are auto-generated
- Cascade delete on auth.users deletion
- Foreign keys prevent orphaned data
- RLS provides security at database level

## 🆘 Troubleshooting

**Issue: Permission denied creating policies**
- Solution: Ensure you're using a role with sufficient permissions (admin or owner)

**Issue: Foreign key constraint fails**
- Solution: Ensure parent records exist before inserting child records

**Issue: RLS blocking queries**
- Solution: Check policies are correctly configured for your use case

---

For more help, refer to the main SETUP.md or Supabase documentation.
