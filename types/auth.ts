export type User = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
};

export type UserProfile = {
  id: string;
  user_id: string;
  bio: string | null;
  location: string | null;
  website: string | null;
  phone: string | null;
  impact_score: number;
  donations_count: number;
  hours_volunteered: number;
};

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
};
