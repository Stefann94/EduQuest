import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { AvatarId } from "./data/types";
import { db } from "./db/core";
import { siteOrigin } from "./site-url";

// Schimbările de cont, comune elevilor și mentorilor. Validarea câmpurilor rămâne
// în acțiunile fiecărei pagini; aici sunt doar operațiile pe Supabase.

/** Numele afișat (și avatarul, pentru elevi). RLS: fiecare își poate schimba doar profilul. */
export async function saveProfile(
  userId: string,
  fields: { displayName: string; avatar?: AvatarId },
) {
  const supabase = await db();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: fields.displayName,
      ...(fields.avatar ? { avatar: fields.avatar } : {}),
    })
    .eq("id", userId);
  return !error;
}

/**
 * Verifică parola actuală fără să atingă sesiunea din browser: o autentificare separată,
 * fără cookie-uri, care se închide imediat.
 */
export async function passwordMatches(email: string, password: string) {
  const probe = createClient(
    // biome-ignore lint/style/noNonNullAssertion: verificate la pornire
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // biome-ignore lint/style/noNonNullAssertion: verificate la pornire
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { error } = await probe.auth.signInWithPassword({ email, password });
  // „local”: închide doar sesiunea de probă (implicit, signOut le-ar închide pe toate).
  if (!error) await probe.auth.signOut({ scope: "local" });
  return !error;
}

/** Parola nouă; celelalte sesiuni deschise (alte dispozitive) se închid. */
export async function setPassword(next: string) {
  const supabase = await db();
  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return error.code === "same_password" ? "same" : "error";
  await supabase.auth.signOut({ scope: "others" });
  return "ok";
}

/** Schimbarea emailului: Supabase trimite un link de confirmare la adresa nouă. */
export async function startEmailChange(email: string) {
  const supabase = await db();
  const { error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: `${await siteOrigin()}/auth/confirm?next=/` },
  );
  if (!error) return "ok";
  if (error.code === "email_exists") return "taken";
  if (error.code === "email_address_invalid") return "invalid";
  return "error";
}
