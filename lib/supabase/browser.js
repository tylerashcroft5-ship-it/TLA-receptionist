// Browser-side Supabase client (anon key). Used by the login form and any
// client components. RLS keeps it read-only + authed-only.
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./public.js";

// Defensive fetch: strip any non-ISO-8859-1 char from outgoing header values.
// Browser fetch throws "STRING CONTAINS NON ISO-8859-1 CODE POINT" if a header
// value has a char > 255 (e.g. a mangled dash). This guarantees login works no
// matter what sneaks into a header from cache/storage/config.
function safeFetch(input, init = {}) {
  if (init && init.headers) {
    const h = new Headers(init.headers);
    const clean = {};
    for (const [k, v] of h.entries()) {
      clean[k] = Array.from(v).filter((c) => c.charCodeAt(0) <= 255).join("");
    }
    init = { ...init, headers: clean };
  }
  return fetch(input, init);
}

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { fetch: safeFetch },
  });
}
