"use server";

import { type FormState, passwordErrors, readForm } from "../_lib/validation";

type Field = "password" | "confirm";
export type ActivationState = FormState<Field>;

/**
 * Setează parola unui mentor aprobat. Cu Supabase, tokenul din link se verifică
 * pe server (o singură folosire, valabilitate limitată), iar emailul vine din token,
 * nu din formular.
 */
export async function activateMentor(
  _prev: ActivationState,
  formData: FormData,
): Promise<ActivationState> {
  const values = readForm(formData, ["token", "password", "confirm"] as const);
  if (!values.token)
    return {
      status: "error",
      title: "Linkul nu mai este valabil",
      message:
        "Linkul de activare a expirat sau a fost deja folosit. Scrie-ne la admin@eduquest.ro și îți trimitem unul nou.",
      errors: {},
      values: {},
    };

  const errors = passwordErrors(values.password, values.confirm);
  if (Object.keys(errors).length > 0)
    return { status: "error", errors, values: {} };

  // Demo: aici s-ar salva parola (doar ca hash) și s-ar invalida tokenul.
  return { status: "success" };
}
