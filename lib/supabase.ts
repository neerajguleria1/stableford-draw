import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Browser client — uses cookies so middleware can read the session
export const supabase = createBrowserClient(supabaseUrl, supabaseKey);

// Server-side admin client (uses secret key, no cookie needed)
export const getSupabaseServiceClient = () =>
  createClient(supabaseUrl, process.env.SUPABASE_SECRET_KEY!);
