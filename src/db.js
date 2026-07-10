// Supabase client for server-side use (webhook + scripts). Uses the
// service-role key, which bypasses RLS — safe because it only ever runs on the
// server, never in the browser. The dashboard UI will use the anon key + auth.

import { createClient } from "@supabase/supabase-js";

let _admin = null;

export function db() {
  if (_admin) return _admin;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set");
  _admin = createClient(url, key, { auth: { persistSession: false } });
  return _admin;
}

// Is the database configured? Lets the webhook fall back to JSON if not.
export function dbEnabled() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
