/**
 * lib/supabase.ts
 *
 * Creates and exports the Supabase client used exclusively by lib/storage.ts.
 *
 * Rules:
 *  - This file is the ONLY place that imports from @supabase/supabase-js.
 *  - lib/storage.ts imports `supabase` from here.
 *  - Nothing else in the codebase imports from this file or from @supabase/supabase-js.
 *
 * We use the SERVICE ROLE key (never the anon key) for server-side operations
 * so that Row Level Security doesn't interfere with the storage layer.
 * The service role key must never be exposed to the browser — it lives only
 * in server-side API routes via lib/storage.ts.
 *
 * Required env vars (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...   ← never prefix with NEXT_PUBLIC_
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

function createSupabaseClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "[LynkHive] Missing Supabase environment variables.\n" +
        "Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local\n" +
        "See README.md → Setup for instructions."
    );
  }

  return createClient<Database>(url, key, {
    auth: {
      // We're running server-side only — disable session persistence
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Singleton — one client instance for the lifetime of the server process
export const supabase = createSupabaseClient();
