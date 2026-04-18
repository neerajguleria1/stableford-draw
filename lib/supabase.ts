import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn("⚠️ Supabase credentials not configured.");
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

export const getSupabaseServiceClient = () =>
  createClient(supabaseUrl, supabaseSecretKey);
