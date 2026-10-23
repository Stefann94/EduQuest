"use server";

import { z } from "zod";
import { getUsers } from "@/lib/data/queries";
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

/** Creează un cont de elev. În demo verifică datele și simulează emailul de verificare. */
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

  if (parsed.success) {
    // Unicitatea se verifică pe server (cu Supabase: constrângeri unice în baza de date).
    const users = await getUsers();
    if (users.some((u) => u.username === parsed.data.username))
      errors.username = "Username-ul este deja folosit. Alege altul.";
    if (users.some((u) => u.email === parsed.data.email))
      errors.email =
        "Există deja un cont cu această adresă. Intră în cont sau recuperează-ți parola.";
  }

  if (!parsed.success || Object.keys(errors).length > 0)
    return { status: "error", errors, values: withoutPasswords(values) };

  return { status: "success", email: parsed.data.email };
}

/** Retrimite emailul de verificare (demo). */
export async function resendVerification(email: string) {
  const ok = emailSchema.safeParse(email).success;
  return { ok };
}
