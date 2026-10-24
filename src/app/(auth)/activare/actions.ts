"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type FormState, passwordErrors, readForm } from "../_lib/validation";

type Field = "password" | "confirm";
export type ActivationState = FormState<Field>;

/**
 * Setează parola unui mentor aprobat. Sesiunea și emailul vin din invitația primită
 * pe email (verificată în /auth/confirm), nu din formular.
 */
export async function activateMentor(
  _prev: ActivationState,
  formData: FormData,
): Promise<ActivationState> {
  const values = readForm(formData, ["password", "confirm"] as const);
  const errors = passwordErrors(values.password, values.confirm);
  if (Object.keys(errors).length > 0)
    return { status: "error", errors, values: {} };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      status: "error",
      title: "Linkul nu mai este valabil",
      message:
        "Linkul de activare a expirat sau a fost deja folosit. Scrie-ne la admin@eduquest.ro și îți trimitem unul nou.",
      errors: {},
      values: {},
    };

  const { error } = await supabase.auth.updateUser({
    password: values.password,
  });
  if (error)
    return {
      status: "error",
      message: "Parola nu a putut fi salvată. Încearcă din nou.",
      errors: {},
      values: {},
    };
  redirect("/mentor");
}
