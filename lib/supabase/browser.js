// Browser-side Supabase client (anon key). Used by the login form and any
// client components. RLS keeps it read-only + authed-only.
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./public.js";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
