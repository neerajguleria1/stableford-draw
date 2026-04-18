export type User = {
  id: string;
  email: string;
  name?: string;
};

export type UserProfile = {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  profile_picture_url?: string;
  bio?: string;
  location?: string;
  handicap?: number;
  total_donations: number;
  charity_preference_id?: string;
  created_at: string;
  updated_at: string;
};

export type Charity = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  long_description?: string;
  logo_url?: string;
  website?: string;
  email?: string;
  phone?: string;
  registration_number?: string;
  status: "active" | "inactive";
  category?: string;
  total_raised: number;
  total_beneficiaries: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
};
