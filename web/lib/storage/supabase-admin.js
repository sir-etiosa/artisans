import { createClient } from "@supabase/supabase-js";

let client;

// Service-role client for server-side Storage writes only — never expose
// this key to the browser. Uploads go through our own API routes.
export function supabaseAdmin() {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return client;
}

export function isStorageConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
