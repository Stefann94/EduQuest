// Validări comune pentru formularele de autentificare (rulează pe server, în Server Actions).
import { z } from "zod";
import { PASSWORD_RULES } from "@/components/auth/password-rules";

export type FieldErrors<F extends string = string> = Partial<Record<F, string>>;

/** Starea unui formular: inițial, cu erori (și valorile trimise, fără parole) sau reușit. */
export type FormState<F extends string, S extends object = object> =
  | { status: "idle" }
  | {
      status: "error";
      title?: string;
      message?: string;
      errors: FieldErrors<F>;
      values: Partial<Record<F, string>>;
    }
  | ({ status: "success" } & S);

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { error: "Scrie adresa de email." })
  .pipe(z.email({ error: "Adresa de email nu pare corectă." }));

/** Valorile text dintr-un FormData. */
export function readForm<F extends string>(
  formData: FormData,
  fields: readonly F[],
): Record<F, string> {
  const out = {} as Record<F, string>;
  for (const f of fields) {
    const v = formData.get(f);
    out[f] = typeof v === "string" ? v : "";
  }
  return out;
}

/** Prima eroare pentru fiecare câmp. */
export function firstErrors(error: z.ZodError): FieldErrors {
  const flat = z.flattenError(error).fieldErrors as Record<
    string,
    string[] | undefined
  >;
  const out: FieldErrors = {};
  for (const [k, v] of Object.entries(flat)) if (v?.[0]) out[k] = v[0];
  return out;
}

/** Verifică parola nouă și confirmarea ei. */
export function passwordErrors(
  password: string,
  confirm: string,
): FieldErrors<"password" | "confirm"> {
  const errors: FieldErrors<"password" | "confirm"> = {};
  if (!password) errors.password = "Alege o parolă.";
  else if (password.length > 128)
    errors.password = "Parola poate avea cel mult 128 de caractere.";
  else if (PASSWORD_RULES.some((r) => !r.test(password)))
    errors.password =
      "Parola trebuie să aibă cel puțin 8 caractere, cu cel puțin o literă și o cifră.";
  if (!confirm) errors.confirm = "Scrie parola încă o dată.";
  else if (confirm !== password) errors.confirm = "Parolele nu coincid.";
  return errors;
}

/** Păstrează valorile trimise, fără câmpurile de parolă. */
export function withoutPasswords<T extends Record<string, string>>(values: T) {
  const { password: _p, confirm: _c, ...rest } = values;
  return rest;
}
