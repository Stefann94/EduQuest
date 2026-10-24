import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase cu sesiunea utilizatorului (din cookie-uri). Toate citirile și
 * scrierile trec prin regulile RLS ale contului logat. Se folosește în Server
 * Components, Server Actions și Route Handlers.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    // biome-ignore lint/style/noNonNullAssertion: verificate în proxy.ts și la pornire
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // biome-ignore lint/style/noNonNullAssertion: verificate în proxy.ts și la pornire
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // În Server Components cookie-urile nu se pot scrie; sesiunea se
          // reîmprospătează oricum în proxy.ts, deci aici ignorăm eroarea.
          try {
            for (const { name, value, options } of cookiesToSet)
              cookieStore.set(name, value, options);
          } catch {}
        },
      },
    },
  );
}
