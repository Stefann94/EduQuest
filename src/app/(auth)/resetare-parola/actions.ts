"use server";

import { type FormState, passwordErrors, readForm } from "../_lib/validation";

type Field = "password" | "confirm";
export type ResetState = FormState<Field>;

/**
 * Setează o parolă nouă din linkul de resetare. Cu Supabase, tokenul se verifică
 * pe server: valabil 60 de minute și o singură folosire.
 */
export async function resetPassword(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const values = readForm(formData, ["token", "password", "confirm"] as const);
  if (!values.token)
    return {
      status: "error",
      title: "Linkul nu mai este valabil",
      message:
        "Linkul de resetare a expirat sau a fost deja folosit. Cere un link nou din pagina de recuperare a parolei.",
      errors: {},
      values: {},
    };

  const errors = passwordErrors(values.password, values.confirm);
  if (Object.keys(errors).length > 0)
    return { status: "error", errors, values: {} };

  // Demo: aici s-ar salva noua parolă (hash), s-ar invalida tokenul și celelalte sesiuni.
  return { status: "success" };
}
