// Server-side Supabase client (anon key + request cookies) for auth checks in
// server components and middleware. Reads the logged-in session from cookies.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./public.js";

// Strip any non-ISO-8859-1 char from outgoing header values (see browser.js).
// Must not build `new Headers(init.headers)` on raw input — that throws on the bad
// char before it can be cleaned. Iterate the raw input and rebuild a clean object.
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

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      global: { fetch: safeFetch },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // called from a Server Component — safe to ignore, middleware refreshes
          }
        },
      },
    }
  );
}
