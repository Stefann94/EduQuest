"use server";

import { z } from "zod";
import { siteOrigin } from "@/lib/site-url";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  emailSchema,
  type FormState,
  firstErrors,
  passwordErrors,
  readForm,
  withoutPasswords,
} from "../_lib/validation";

const FIELDS = [
  "displayName",
  "username",
  "email",
  "password",
  "confirm",
] as const;
type Field = (typeof FIELDS)[number];

export type RegisterState = FormState<Field, { email: string }>;

const schema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, { error: "Scrie numele afișat (cel puțin 2 caractere)." })
    .max(40, { error: "Numele afișat poate avea cel mult 40 de caractere." }),
  username: z
    .string()
    .trim()
    .min(3, { error: "Username-ul are cel puțin 3 caractere." })
    .max(20, { error: "Username-ul poate avea cel mult 20 de caractere." })
    .regex(/^[a-z0-9._]+$/, {
      error:
        "Folosește doar litere mici fără diacritice, cifre, punct și underscore.",
    }),
  email: emailSchema,
});

/** Creează un cont de elev și trimite emailul de confirmare. */
export async function register(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const values = readForm(formData, FIELDS);
  const parsed = schema.safeParse(values);
  const errors: Partial<Record<Field, string>> = {
    ...(parsed.success ? {} : firstErrors(parsed.error)),
    ...passwordErrors(values.password, values.confirm),
  };

  const admin = supabaseAdmin();
  if (parsed.success && admin) {
    // Unicitatea se verifică pe server; baza de date o garantează oricum (username unic).
    const [{ data: taken }, { data: emailTaken }] = await Promise.all([
      admin
        .from("profiles")
        .select("id")
        .eq("username", parsed.data.username)
        .maybeSingle(),
      admin.rpc("email_taken", { p_email: parsed.data.email }),
    ]);
    if (taken) errors.username = "Username-ul este deja folosit. Alege altul.";
    if (emailTaken)
      errors.email =
        "Există deja un cont cu această adresă. Intră în cont sau recuperează-ți parola.";
  }

  if (!parsed.success || Object.keys(errors).length > 0)
    return { status: "error", errors, values: withoutPasswords(values) };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: values.password,
    options: {
      emailRedirectTo: `${await siteOrigin()}/auth/confirm?next=/`,
      // Rolul nu se trimite: orice cont nou e de elev (vezi trigger-ul din baza de date).
      data: {
        display_name: parsed.data.displayName,
        username: parsed.data.username,
      },
    },
  });
  if (error?.code === "email_address_invalid")
    return {
      status: "error",
      errors: { email: "Adresa de email nu pare corectă." },
      values: withoutPasswords(values),
    };
  if (error)
    return {
      status: "error",
      title: "Contul nu a putut fi creat",
      message:
        error.code === "over_email_send_rate_limit"
          ? "Am trimis prea multe emailuri într-un timp scurt. Încearcă din nou peste câteva minute."
          : "A apărut o problemă la crearea contului. Încearcă din nou peste puțin timp.",
      errors: {},
      values: withoutPasswords(values),
    };

  return { status: "success", email: parsed.data.email };
}

/** Retrimite emailul de confirmare. */
export async function resendVerification(email: string) {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { ok: false };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data,
    options: { emailRedirectTo: `${await siteOrigin()}/auth/confirm?next=/` },
  });
  return { ok: !error };
}
