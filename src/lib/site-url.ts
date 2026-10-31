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

/**
 * Adresa site-ului pentru linkurile cu token din emailurile trimise de noi (ex. resetarea
 * parolei). Nu vine din antetele cererii: un antet falsificat ar trimite tokenul pe alt
 * site. Online: SITE_URL sau domeniul de producție dat de Vercel; local: cererea curentă.
 */
export async function trustedOrigin() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  if (process.env.NODE_ENV !== "production") return siteOrigin();
  return "https://eduquest-gilt.vercel.app";
}
