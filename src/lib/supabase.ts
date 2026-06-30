import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Supabase is optional: with no env vars the app runs entirely on demo data.
// Add the three vars (see .env.example) to switch to the live database.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

// Server-side client with the service role — bypasses RLS for trusted writes
// (ingestion, subscriptions). NEVER import this into client components.
export function getServiceClient(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Read-only anon client for public data.
export function getAnonClient(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
