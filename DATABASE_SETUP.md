## 📊 SQL Database Setup - Quick Reference

### 🚀 One-Step Setup (Recommended)

Copy and execute the entire contents of `/sql/create_tables.sql` in Supabase SQL Editor:

1. **Go to Supabase Dashboard** → SQL Editor
2. **Click "New Query"**
3. **Copy all content** from `sql/create_tables.sql`
4. **Paste** into the editor
5. **Click "Run"** ✅

---

### 📋 Table Overview

| Table | Purpose | Records |
|-------|---------|---------|
| `users_profiles` | Extended user data | User details, preferences |
| `charities` | Organizations | Nonprofits, charities |
| `subscriptions` | Recurring donations | Monthly/annual giving |
| `golf_scores` | Game tracking | Tournament scores |
| `draws` | Raffles/Lotteries | Prize draws |
| `draw_tickets` | Raffle entries | Individual tickets |

---

### 🔑 Key Features

✅ **Row Level Security (RLS)** - Data isolation per user
✅ **Foreign Keys** - Data integrity
✅ **Indexes** - Fast queries
✅ **Timestamps** - Audit trails
✅ **Auto-generated UUIDs** - Unique IDs

---

### ✨ Sample Queries

**View all users:**
```sql
SELECT * FROM users_profiles;
```

**Get user's subscriptions:**
```sql
SELECT s.* FROM subscriptions s
WHERE s.user_id = 'user-uuid';
```

**List active draws:**
```sql
SELECT * FROM draws
WHERE status = 'active'
ORDER BY draw_date DESC;
```

**Get golf scores by user:**
```sql
SELECT * FROM golf_scores
WHERE user_id = 'user-uuid'
ORDER BY date_played DESC;
```

---

### 🎯 Done! Your database is ready.

All tables are created with:
- Proper relationships
- Security policies
- Performance indexes
- Sample structure ready for data

**Next: Start using the API services to interact with these tables!**
