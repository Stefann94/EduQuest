import "server-only";
import { headers } from "next/headers";

/**
 * Adresa site-ului pentru linkurile din emailuri (local sau online). Supabase acceptă
 * doar adresele din lista „Redirect URLs”, deci un antet falsificat nu duce nicăieri.
 */
export async function siteOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
