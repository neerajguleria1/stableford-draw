-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- CHARITIES
create table if not exists charities (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null unique,
  slug varchar(255) not null unique,
  description text,
  logo_url varchar,
  status varchar(50) default 'active',
  total_raised decimal(15,2) default 0,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- USERS PROFILES
create table if not exists users_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  full_name varchar(255),
  email varchar(255),
  role varchar(50) default 'user',
  charity_preference_id uuid references charities(id) on delete set null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- SUBSCRIPTIONS
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  stripe_subscription_id varchar,
  plan_type varchar(50),
  amount decimal(10,2),
  currency varchar(3) default 'GBP',
  status varchar(50) default 'active',
  start_date timestamp default now(),
  next_billing_date timestamp,
  cancelled_date timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- GOLF SCORES
create table if not exists golf_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  score int not null check (score >= 1 and score <= 45),
  date_played timestamp not null,
  created_at timestamp default now(),
  unique(user_id, date_played)
);

-- DRAWS
create table if not exists draws (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  drawn_numbers int[],
  mode varchar(50) default 'random',
  status varchar(50) default 'pending',
  draw_date timestamp default now(),
  winner_id uuid references auth.users(id) on delete set null,
  total_raised decimal(15,2) default 0,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- PAYOUTS
create table if not exists payouts (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid references draws(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  tier varchar(50),
  amount decimal(10,2),
  status varchar(50) default 'pending',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- INDEXES
create index if not exists idx_users_profiles_user_id on users_profiles(user_id);
create index if not exists idx_subscriptions_user_id on subscriptions(user_id);
create index if not exists idx_golf_scores_user_id on golf_scores(user_id);
create index if not exists idx_golf_scores_date on golf_scores(date_played);
create index if not exists idx_draws_status on draws(status);
create index if not exists idx_payouts_user_id on payouts(user_id);
create index if not exists idx_payouts_draw_id on payouts(draw_id);

-- RLS
alter table charities enable row level security;
alter table users_profiles enable row level security;
alter table subscriptions enable row level security;
alter table golf_scores enable row level security;
alter table draws enable row level security;
alter table payouts enable row level security;

-- RLS POLICIES

-- Charities: public read
create policy "Charities public read" on charities for select using (true);
create policy "Admin insert charities" on charities for insert with check (true);
create policy "Admin update charities" on charities for update using (true);

-- Users profiles
create policy "Users read own profile" on users_profiles for select using (auth.uid() = user_id);
create policy "Users insert own profile" on users_profiles for insert with check (auth.uid() = user_id);
create policy "Users update own profile" on users_profiles for update using (auth.uid() = user_id);

-- Subscriptions
create policy "Users read own subscription" on subscriptions for select using (auth.uid() = user_id);
create policy "Service role manage subscriptions" on subscriptions for all using (true);

-- Golf scores
create policy "Users read own scores" on golf_scores for select using (auth.uid() = user_id);
create policy "Users insert own scores" on golf_scores for insert with check (auth.uid() = user_id);
create policy "Users delete own scores" on golf_scores for delete using (auth.uid() = user_id);

-- Draws: public read
create policy "Draws public read" on draws for select using (true);
create policy "Service role manage draws" on draws for all using (true);

-- Payouts
create policy "Users read own payouts" on payouts for select using (auth.uid() = user_id);
create policy "Service role manage payouts" on payouts for all using (true);
