"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null | undefined;

// These are public browser credentials, not secrets. Sites injects production
// environment variables at runtime, while this client module is bundled at
// build time, so keep the deployed project's public values as a safe fallback.
const PRODUCTION_SUPABASE_URL = "https://vfogktcturcacprlwlea.supabase.co";
const PRODUCTION_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_Z3NC_CC1fYp56rqpv0rCag_0DJyBx5K";

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (browserClient !== undefined) return browserClient;

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? PRODUCTION_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    PRODUCTION_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anonKey) {
    browserClient = null;
    return browserClient;
  }

  browserClient = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });

  return browserClient;
}
