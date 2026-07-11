// Public Supabase config (URL + anon key). These are SAFE to ship in the
// browser bundle - the anon key is RLS-guarded and designed to be public
// (only the service-role key is secret). Baked in as verified-clean literals
// so they never need pasting into Vercel env vars (which mangles JWT dashes).
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wbkjduxqltgbzldtximf.supabase.co";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6India2pkdXhxbHRnYnpsZHR4aW1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2NDY3ODksImV4cCI6MjA5OTIyMjc4OX0.Oz8imwP1K5tp96S7vTbw9Ll6sSfLrvn3QhrLt3_GANM";
