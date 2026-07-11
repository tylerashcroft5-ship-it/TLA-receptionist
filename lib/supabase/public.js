// Public Supabase config (URL + anon key). These are SAFE to ship in the
// browser bundle - the anon key is RLS-guarded and designed to be public
// (only the service-role key is secret).
//
// Deliberately NOT read from process.env: a mangled NEXT_PUBLIC_* value in
// Vercel would get inlined at build time and break fetch headers with a
// non-ISO-8859-1 char. These literals are verified clean, so login always works.
export const SUPABASE_URL = "https://wbkjduxqltgbzldtximf.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6India2pkdXhxbHRnYnpsZHR4aW1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2NDY3ODksImV4cCI6MjA5OTIyMjc4OX0.Oz8imwP1K5tp96S7vTbw9Ll6sSfLrvn3QhrLt3_GANM";
