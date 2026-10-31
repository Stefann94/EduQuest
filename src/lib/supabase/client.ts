import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * Client Supabase pentru browser, cu sesiunea din cookie-uri și cheia publică.
 * Se folosește pentru încărcarea fișierelor direct în Storage (fără limita de mărime
 * a Server Actions) și pentru notificările în timp real (Realtime, filtrat de RLS).
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    // biome-ignore lint/style/noNonNullAssertion: setate la build (NEXT_PUBLIC_)
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // biome-ignore lint/style/noNonNullAssertion: setate la build (NEXT_PUBLIC_)
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
