"use server";

import { emailSchema, type FormState, readForm } from "../_lib/validation";

export type RecoveryState = FormState<"email">;

/**
 * Cere un link de resetare. Răspunsul este mereu același, indiferent dacă adresa
 * are cont sau nu, ca să nu se poată afla cine folosește platforma.
 */
export async function requestPasswordReset(
  _prev: RecoveryState,
  formData: FormData,
): Promise<RecoveryState> {
  const { email } = readForm(formData, ["email"] as const);
  const parsed = emailSchema.safeParse(email);
  // Doar formatul adresei poate produce o eroare; existența contului nu se verifică aici.
  if (!parsed.success)
    return {
      status: "error",
      errors: { email: parsed.error.issues[0]?.message },
      values: { email },
    };

  // Demo: dacă adresa are cont, aici s-ar trimite un link valabil 60 de minute.
  return { status: "success" };
}
