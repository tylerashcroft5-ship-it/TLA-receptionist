// Supabase client for server-side use (webhook + scripts). Uses the
// service-role key, which bypasses RLS — safe because it only ever runs on the
// server, never in the browser. The dashboard UI will use the anon key + auth.

import { createClient } from "@supabase/supabase-js";

let _admin = null;

// Env values pasted into a hosting dashboard can pick up invisible/masking
// artefacts (e.g. a "•" U+2022, non-breaking spaces, stray newlines). supabase-js
// puts the key straight into the Authorization header, and a header value with any
// code point > 255 makes undici throw "Cannot convert argument to a ByteString"
// INSIDE the library — before any custom fetch can sanitise it. URLs and JWT/secret
// keys are always printable ASCII, so we strip anything outside 0x20–0x7E and trim.
function cleanAscii(s) {
  return String(s || "").replace(/[^\x20-\x7E]/g, "").trim();
}

export function db() {
  if (_admin) return _admin;
  const url = cleanAscii(process.env.SUPABASE_URL);
  const key = cleanAscii(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set");
  _admin = createClient(url, key, { auth: { persistSession: false } });
  return _admin;
}

// Is the database configured? Lets the webhook fall back to JSON if not.
export function dbEnabled() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
