-- Migration 003: Charity events table + website_url column

-- Add website_url to charities if not exists
alter table charities
  add column if not exists website_url varchar(500);

-- Charity events (golf days, fundraisers, etc.)
create table if not exists charity_events (
  id uuid primary key default gen_random_uuid(),
  charity_id uuid not null references charities(id) on delete cascade,
  title varchar(255) not null,
  description text,
  event_date timestamp not null,
  location varchar(255),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index if not exists idx_charity_events_charity_id on charity_events(charity_id);
create index if not exists idx_charity_events_date on charity_events(event_date);

-- RLS for charity_events
alter table charity_events enable row level security;

-- Public can read upcoming events
create policy "Public can view charity events"
  on charity_events for select
  using (true);

-- Only admins can manage events
create policy "Admins can manage charity events"
  on charity_events for all
  using (
    exists (
      select 1 from users_profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Ensure charity_contributions table has contribution_type
alter table charity_contributions
  add column if not exists contribution_type varchar(50) default 'subscription';
