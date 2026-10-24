import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client cu cheia secretă: ocolește regulile RLS, deci se folosește DOAR pe server și
// doar pentru citiri care filtrează singure ce e public (ex. cursurile globale publicate).
// După ce vin conturile reale, paginile elevilor vor citi cu sesiunea fiecărui utilizator.

let client: SupabaseClient | null | undefined;

/** null dacă proiectul nu are încă cheile Supabase (ex. un build fără variabile de mediu). */
export function supabaseAdmin() {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client =
    url && key
      ? createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      : null;
  return client;
}
