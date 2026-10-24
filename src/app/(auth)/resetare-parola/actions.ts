"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type FormState, passwordErrors, readForm } from "../_lib/validation";

type Field = "password" | "confirm";
export type ResetState = FormState<Field>;

const EXPIRED = {
  status: "error",
  title: "Linkul nu mai este valabil",
  message:
    "Linkul de resetare a expirat sau a fost deja folosit. Cere un link nou din pagina de recuperare a parolei.",
  errors: {},
  values: {},
} as const;

/**
 * Setează o parolă nouă. Sesiunea vine din linkul primit pe email (verificat în
 * /auth/confirm: o singură folosire, valabilitate limitată).
 */
export async function resetPassword(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const values = readForm(formData, ["password", "confirm"] as const);
  const errors = passwordErrors(values.password, values.confirm);
  if (Object.keys(errors).length > 0)
    return { status: "error", errors, values: {} };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return EXPIRED;

  const { error } = await supabase.auth.updateUser({
    password: values.password,
  });
  if (error)
    return {
      status: "error",
      errors:
        error.code === "same_password"
          ? { password: "Alege o parolă diferită de cea veche." }
          : {},
      message:
        error.code === "same_password"
          ? undefined
          : "Parola nu a putut fi schimbată. Încearcă din nou.",
      values: {},
    };

  // Celelalte sesiuni se închid; de aici te autentifici din nou cu parola nouă.
  await supabase.auth.signOut({ scope: "global" });
  return { status: "success" };
}
