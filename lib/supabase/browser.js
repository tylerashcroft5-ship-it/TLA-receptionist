// Browser-side Supabase client (anon key). Used by the login form and any
// client components. RLS keeps it read-only + authed-only.
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./public.js";

// Defensive fetch: strip any non-ISO-8859-1 char from outgoing header values.
// Browser fetch throws "STRING CONTAINS NON ISO-8859-1 CODE POINT" if a header
// value has a char > 255. We must NOT construct `new Headers(init.headers)` on the
// raw input — that itself throws on the bad char before we can clean it. Instead we
// iterate the plain object / array / Headers-like input and rebuild a clean object.
function sanitizeHeaderValue(v) {
  return Array.from(String(v)).filter((c) => c.charCodeAt(0) <= 255).join("");
}
function safeFetch(input, init = {}) {
  if (init && init.headers) {
    const hdr = init.headers;
    let entries;
    if (Array.isArray(hdr)) entries = hdr;
    else if (typeof hdr.forEach === "function") {
      entries = [];
      hdr.forEach((v, k) => entries.push([k, v]));
    } else entries = Object.entries(hdr);
    const clean = {};
    for (const [k, v] of entries) clean[k] = sanitizeHeaderValue(v);
    init = { ...init, headers: clean };
  }
  return fetch(input, init);
}

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { fetch: safeFetch },
  });
}
