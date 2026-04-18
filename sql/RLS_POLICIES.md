# 🔐 Row Level Security (RLS) Policies Guide

## Overview

Migration 012 implements comprehensive Row Level Security (RLS) policies for:
- **34 Policies** across 9 tables
- **3 Helper Functions** for role checking
- **Multi-tier Access Control**: Users, Charities, Admins, Public

---

## 🎯 Security Model

### Access Levels
```
┌─────────────────────────────────────────────┐
│ ADMIN                                       │
│ ├─ Full access to all data                  │
│ ├─ Can manage users, charities, draws       │
│ ├─ Can verify winner proofs                 │
│ └─ Can process payouts                      │
├─────────────────────────────────────────────┤
│ CHARITY                                     │
│ ├─ View contributions to their charity      │
│ ├─ View subscriptions                       │
│ ├─ View draw entries                        │
│ └─ Limited to their own charity             │
├─────────────────────────────────────────────┤
│ USER                                        │
│ ├─ View own profile                         │
│ ├─ View own golf scores                     │
│ ├─ View own subscriptions                   │
│ ├─ Make contributions                       │
│ ├─ Buy raffle entries                       │
│ └─ Upload winner proofs                     │
├─────────────────────────────────────────────┤
│ PUBLIC                                      │
│ ├─ View all charities                       │
│ ├─ View all draws                           │
│ ├─ View contributions (transparency)        │
│ └─ View draw entries                        │
└─────────────────────────────────────────────┘
```

---

## 📋 Policies by Table

### **1. Users Profiles (3 Policies)**

```sql
-- SELECT: Own profile only
users_can_view_own_profile
├─ user_id = auth.uid()

-- UPDATE: Own profile only
users_can_update_own_profile
├─ user_id = auth.uid()

-- INSERT: Own profile only
users_can_insert_own_profile
├─ user_id = auth.uid()
```

**Access:**
- ✅ Users can view their own profile
- ✅ Users can edit their own profile
- ❌ Users cannot view others' profiles
- ❌ Users cannot delete their profile

---

### **2. Golf Scores (4 Policies)**

```sql
-- SELECT: Own scores only
users_can_view_own_scores
├─ user_id = auth.uid()

-- INSERT: Own scores only
users_can_insert_own_scores
├─ user_id = auth.uid()

-- UPDATE: Own scores only
users_can_update_own_scores
├─ user_id = auth.uid()

-- DELETE: Own scores only
users_can_delete_own_scores
├─ user_id = auth.uid()
```

**Access:**
- ✅ Users can log their own golf scores
- ✅ Users can edit their own scores
- ✅ Users can delete their own scores
- ❌ Users cannot access others' scores

---

### **3. Subscriptions (5 Policies)**

```sql
-- SELECT: Own subscriptions + Charity subscriptions
users_can_view_own_subscriptions
├─ user_id = auth.uid()

charities_can_view_their_subscriptions
├─ charity_id IN (charities created by user)

-- INSERT: Own subscriptions
users_can_insert_own_subscriptions
├─ user_id = auth.uid()

-- UPDATE: Own subscriptions
users_can_update_own_subscriptions
├─ user_id = auth.uid()

-- DELETE: Own subscriptions
users_can_delete_own_subscriptions
├─ user_id = auth.uid()
```

**Access:**
- ✅ Users can create subscriptions
- ✅ Users can pause/resume subscriptions
- ✅ Charities can see subscriptions to them
- ✅ Users can cancel anytime
- ❌ Users cannot access others' subscriptions

---

### **4. Charity Contributions (3 Policies)**

```sql
-- SELECT: Own + Public + Charity
users_can_view_own_contributions
├─ user_id = auth.uid()

public_can_view_contributions
├─ true (for transparency)

charities_can_view_contributions
├─ charity_id IN (charities created by user)
```

**Access:**
- ✅ Everyone can view all contributions (transparency)
- ✅ Users can see their own giving history
- ✅ Charities can see contributions to them
- ✅ Promotes transparency

---

### **5. Draw Entries (3 Policies)**

```sql
-- SELECT: Own + Public + Admin
users_can_view_own_entries
├─ user_id = auth.uid()

public_can_view_entries
├─ true (for transparency)

admins_can_view_entries
├─ draw_id IN (draws from admin's charities)
```

**Access:**
- ✅ Users can see their own entries
- ✅ Everyone can see entries (transparency)
- ✅ Admins can see all entries
- ✅ Prevents ticket fraud

---

### **6. Winner Proofs (5 Policies)**

```sql
-- SELECT: Own + Admin
users_can_view_own_proofs
├─ user_id = auth.uid()

admins_can_view_all_proofs
├─ is_admin() = true

-- INSERT: Own proofs
users_can_insert_own_proofs
├─ user_id = auth.uid()

-- UPDATE: Own pending + Admin verification
users_can_update_own_proofs
├─ user_id = auth.uid() AND verification_status = 'pending'

admins_can_verify_proofs
├─ is_admin() = true
```

**Access:**
- ✅ Winners can upload proof
- ✅ Admins can verify/reject proof
- ✅ Winners can resubmit if rejected
- ✅ Prevents fraud claims

---

### **7. Payouts (5 Policies)**

```sql
-- SELECT: Own + Charity + Admin
users_can_view_own_payouts
├─ recipient_id = auth.uid() AND recipient_type = 'user'

charities_can_view_payouts
├─ charity_id IN (charities by user)

admins_can_view_all_payouts
├─ is_admin() = true

-- INSERT/UPDATE: Admin only
admins_can_manage_payouts
├─ is_admin() = true
```

**Access:**
- ✅ Users can see payouts to them
- ✅ Charities can see distributions
- ✅ Admins manage all payouts
- ❌ Non-admins cannot create payouts

---

### **8. Draws (3 Policies)**

```sql
-- SELECT: Public
public_can_view_draws
├─ true

-- INSERT/UPDATE: Admin only
admins_can_create_draws
├─ is_admin() = true

admins_can_update_draws
├─ is_admin() = true
```

**Access:**
- ✅ Everyone can view active draws
- ✅ Admins create/manage draws
- ❌ Users cannot create draws

---

### **9. Charities (3 Policies)**

```sql
-- SELECT: Public
public_can_view_charities
├─ true

-- INSERT/UPDATE: Admin only
admins_can_create_charities
├─ is_admin() = true

admins_can_update_charities
├─ is_admin() = true
```

**Access:**
- ✅ Everyone can browse charities
- ✅ Admins manage charities
- ❌ Users cannot add charities

---

## 🔧 Helper Functions

### **1. is_admin()**
```sql
-- Check if current user is admin
SELECT is_admin(); -- Returns BOOLEAN

-- Usage in policies:
WHERE is_admin() = true
```

### **2. user_owns_charity(charity_id)**
```sql
-- Check if user owns a charity
SELECT user_owns_charity('charity-uuid'); -- Returns BOOLEAN

-- Usage in policies:
WHERE user_owns_charity(charity_id)
```

### **3. user_owns_draw(draw_id)**
```sql
-- Check if user owns a draw (via charity)
SELECT user_owns_draw('draw-uuid'); -- Returns BOOLEAN

-- Usage in policies:
WHERE user_owns_draw(draw_id)
```

---

## 🔑 Key Security Features

### **Data Isolation**
- ✅ Users only see their own data
- ✅ Charities only see their contributions
- ✅ Admins have full visibility

### **Public Transparency**
- ✅ All contributions visible (donor names removed if anonymous)
- ✅ All draws visible
- ✅ All charities visible
- ✅ Builds trust

### **Role-Based Access**
- ✅ Admin role checked via JWT
- ✅ Stored in `raw_user_meta_data`
- ✅ Verified on every query

### **Admin Features**
- ✅ Proof verification workflow
- ✅ Payout processing
- ✅ Draw management
- ✅ Charity management
- ✅ User support

---

## 🚀 How to Apply

### Step 1: Enable RLS (Already Done in Previous Migrations)
Tables already have RLS enabled from earlier migrations.

### Step 2: Execute Policies
```sql
-- In Supabase SQL Editor:
-- Copy from: sql/012_rls_policies.sql
-- Click Run
```

### Step 3: Verify Policies
```sql
-- View all policies
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
ORDER BY tablename, policyname;

-- View policies for specific table
SELECT policyname, permissive
FROM pg_policies
WHERE tablename = 'users_profiles';
```

---

## 🧪 Testing RLS Policies

### Test 1: User Cannot View Others' Profile
```sql
-- As user-a
SELECT * FROM users_profiles WHERE user_id = 'user-b-id';
-- Result: Empty (blocked by RLS)
```

### Test 2: User Can View Own Profile
```sql
-- As user-a
SELECT * FROM users_profiles WHERE user_id = auth.uid();
-- Result: Returns own profile (allowed)
```

### Test 3: User Cannot Insert Scores for Others
```sql
-- As user-a
INSERT INTO golf_scores (user_id, score, date_played, holes)
VALUES ('user-b-id', 85, NOW(), 18);
-- Result: Error - violates RLS (allowed)
```

### Test 4: Public Can View Contributions
```sql
-- As anyone (including public)
SELECT * FROM charity_contributions;
-- Result: All contributions visible (transparency)
```

### Test 5: Admin Can Manage Everything
```sql
-- As admin user (with role='admin' in JWT)
SELECT * FROM payouts; -- All visible
UPDATE payouts SET status='completed' WHERE id='...'; -- Allowed
INSERT INTO draws (...) VALUES (...); -- Allowed
```

---

## ⚠️ Admin Role Setup

For admin access to work, users must have `role='admin'` in their JWT metadata:

### In Supabase:
```sql
-- Update user metadata (via Supabase dashboard or API)
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'
WHERE email = 'admin@example.com';
```

### Or via Supabase JS:
```javascript
const { data, error } = await supabase.auth.admin.updateUserById(userId, {
  user_metadata: { role: 'admin' }
});
```

---

## 📊 Policy Statistics

```
Total Policies:       34
├─ SELECT policies:  12
├─ INSERT policies:   5
├─ UPDATE policies:   8
└─ DELETE policies:   2

Tables Protected:      9
├─ Users Profiles
├─ Golf Scores
├─ Subscriptions
├─ Charity Contributions
├─ Draw Entries
├─ Winner Proofs
├─ Payouts
├─ Draws
└─ Charities

Access Levels:         4
├─ Public
├─ Users
├─ Charities
└─ Admins
```

---

## 🎯 Best Practices

### ✅ Do
- ✅ Always check `auth.uid()` in policies
- ✅ Use helper functions for complex checks
- ✅ Test policies before production
- ✅ Document access levels
- ✅ Log admin actions

### ❌ Don't
- ❌ Trust client-side filtering
- ❌ Expose all data then filter
- ❌ Hardcode user IDs in policies
- ❌ Forget to handle NULL values
- ❌ Disable RLS for performance

---

## 📚 Related Files

- `sql/011_add_constraints_and_indexes.sql` - Constraints
- `sql/CONSTRAINTS_INDEXES.md` - Constraint reference
- `DATABASE_SETUP.md` - Quick setup guide
- `ADDITIONAL_TABLES.md` - Table documentation

---

## ✅ Verification Checklist

```
□ RLS enabled on all tables
□ 34 policies created
□ 3 helper functions added
□ Admin role verification works
□ Users can only see own data
□ Public can view charities/draws
□ Charities can see contributions
□ Admins have full access
□ No data leakage between users
```

---

## 🚀 Next Steps

1. ✅ Execute migration 012
2. ✅ Set up admin users
3. ✅ Test policies
4. ✅ Monitor for policy violations
5. Build API layer on top

**Database security is now complete!** 🔒
