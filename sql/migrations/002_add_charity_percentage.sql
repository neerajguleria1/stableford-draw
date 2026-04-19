-- Add charity contribution percentage to user profiles (minimum 10%)
alter table users_profiles add column if not exists charity_percentage int default 10 check (charity_percentage >= 10 and charity_percentage <= 100);
