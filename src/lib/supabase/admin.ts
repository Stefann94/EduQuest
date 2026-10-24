import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Client cu cheia secretă: ocolește regulile RLS, deci se folosește DOAR pe server, pentru
// citiri care filtrează singure ce e public (cursurile globale publicate) și pentru scrieri
// pe care regulile nu le permit utilizatorilor (notificările altora), după verificarea dreptului.

let client: SupabaseClient<Database> | null | undefined;

/** null dacă proiectul nu are încă cheile Supabase (ex. un build fără variabile de mediu). */
export function supabaseAdmin() {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client =
    url && key
      ? createClient<Database>(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      : null;
  return client;
}
