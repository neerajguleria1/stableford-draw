-- Users Extended Profile (Supabase Auth handles main users table)
CREATE TABLE IF NOT EXISTS users_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  profile_picture_url VARCHAR,
  bio TEXT,
  location VARCHAR(255),
  handicap DECIMAL(5,1),
  total_donations DECIMAL(10,2) DEFAULT 0,
  charity_preference_id UUID,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id)
);

-- Charities/Organizations Table
CREATE TABLE IF NOT EXISTS charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  long_description TEXT,
  logo_url VARCHAR,
  website VARCHAR,
  email VARCHAR(255),
  phone VARCHAR(20),
  registration_number VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  category VARCHAR(100),
  total_raised DECIMAL(15,2) DEFAULT 0,
  total_beneficiaries INT DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  charity_id UUID REFERENCES charities(id) ON DELETE SET NULL,
  plan_type VARCHAR(50) NOT NULL, -- 'monthly', 'annual', 'one-time'
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  frequency VARCHAR(50), -- 'monthly', 'weekly', 'annual'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'cancelled'
  stripe_subscription_id VARCHAR,
  start_date TIMESTAMP DEFAULT now(),
  next_billing_date TIMESTAMP,
  cancelled_date TIMESTAMP,
  total_donated DECIMAL(15,2) DEFAULT 0,
  donation_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Golf Scores Table
CREATE TABLE IF NOT EXISTS golf_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  charity_event_id UUID,
  course_name VARCHAR(255),
  holes INT DEFAULT 18,
  score INT NOT NULL,
  par INT,
  handicap DECIMAL(5,1),
  net_score INT,
  date_played TIMESTAMP NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Draws/Raffles Table
CREATE TABLE IF NOT EXISTS draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  prize_description TEXT,
  prize_value DECIMAL(10,2),
  ticket_price DECIMAL(8,2) NOT NULL,
  total_tickets_available INT,
  tickets_sold INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'closed', 'drawn'
  draw_date TIMESTAMP,
  winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  winner_announced_at TIMESTAMP,
  total_raised DECIMAL(15,2) DEFAULT 0,
  image_url VARCHAR,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Draw Tickets (Entries)
CREATE TABLE IF NOT EXISTS draw_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  quantity INT DEFAULT 1,
  amount_paid DECIMAL(10,2),
  purchased_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_profiles_user_id ON users_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_charity_id ON subscriptions(charity_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_golf_scores_user_id ON golf_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_golf_scores_date ON golf_scores(date_played);
CREATE INDEX IF NOT EXISTS idx_draws_charity_id ON draws(charity_id);
CREATE INDEX IF NOT EXISTS idx_draws_status ON draws(status);
CREATE INDEX IF NOT EXISTS idx_draw_tickets_draw_id ON draw_tickets(draw_id);
CREATE INDEX IF NOT EXISTS idx_draw_tickets_user_id ON draw_tickets(user_id);

-- Row Level Security (Optional - enable as needed)
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_tickets ENABLE ROW LEVEL SECURITY;

-- Policies for users_profiles
CREATE POLICY "Users can view their own profile"
  ON users_profiles FOR SELECT
  USING (auth.uid() = user_id OR true); -- true for public viewing

CREATE POLICY "Users can update their own profile"
  ON users_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for golf_scores
CREATE POLICY "Users can view their own golf scores"
  ON golf_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own golf scores"
  ON golf_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies for draw_tickets
CREATE POLICY "Users can view their own tickets"
  ON draw_tickets FOR SELECT
  USING (auth.uid() = user_id);

-- Charities are publicly readable
CREATE POLICY "Charities are publicly readable"
  ON charities FOR SELECT
  USING (true);
