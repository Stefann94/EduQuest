"use server";

import { z } from "zod";
import { getViewer } from "@/lib/data/queries";

const DEMO_NOTE =
  "Demo: modificarea se salvează după conectarea la baza de date.";

export type FormState<F extends string> =
  | { status: "idle" }
  | { status: "success"; message: string; note: string }
  | { status: "error"; errors: Partial<Record<F, string>> };

function firstErrors<F extends string>(error: z.ZodError) {
  const out: Partial<Record<F, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as F;
    out[key] ??= issue.message;
  }
  return out;
}

/* ---------- Profil ---------- */

const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Numele afișat are cel puțin 2 caractere.")
    .max(50, "Numele afișat are cel mult 50 de caractere."),
});

export async function updateProfile(
  _prev: FormState<"displayName">,
  formData: FormData,
): Promise<FormState<"displayName">> {
  await getViewer("mentor");
  const parsed = profileSchema.safeParse({
    displayName: String(formData.get("displayName") ?? ""),
  });
  if (!parsed.success)
    return { status: "error", errors: firstErrors(parsed.error) };
  return {
    status: "success",
    message: `Numele afișat este acum „${parsed.data.displayName}”.`,
    note: DEMO_NOTE,
  };
}

/* ---------- Email ---------- */

type EmailField = "email" | "currentPassword";

export async function requestEmailChange(
  _prev: FormState<EmailField>,
  formData: FormData,
): Promise<FormState<EmailField>> {
  const me = await getViewer("mentor");
  const schema = z.object({
    email: z
      .email("Scrie o adresă de email validă, de forma nume@exemplu.ro.")
      .refine((e) => e.toLowerCase() !== me.email.toLowerCase(), {
        error: "Aceasta este deja adresa ta de autentificare.",
      }),
    currentPassword: z
      .string()
      .min(1, "Confirmă schimbarea cu parola actuală."),
  });
  const parsed = schema.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    currentPassword: String(formData.get("currentPassword") ?? ""),
  });
  if (!parsed.success)
    return { status: "error", errors: firstErrors(parsed.error) };
  return {
    status: "success",
    message: `Am trimis un link de confirmare la ${parsed.data.email}.`,
    note: `Până confirmi, te autentifici în continuare cu ${me.email}. ${DEMO_NOTE}`,
  };
}

/* ---------- Parolă ---------- */

type PasswordField = "currentPassword" | "newPassword" | "confirmPassword";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Scrie parola actuală."),
    newPassword: z
      .string()
      .min(8, "Parola nouă are cel puțin 8 caractere.")
      .max(128, "Parola nouă are cel mult 128 de caractere."),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    error: "Parolele nu coincid.",
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ["newPassword"],
    error: "Parola nouă trebuie să fie diferită de cea actuală.",
  });

export async function changePassword(
  _prev: FormState<PasswordField>,
  formData: FormData,
): Promise<FormState<PasswordField>> {
  await getViewer("mentor");
  const parsed = passwordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success)
    return { status: "error", errors: firstErrors(parsed.error) };
  return {
    status: "success",
    message: "Parola a fost schimbată.",
    note: `Celelalte sesiuni deschise vor fi deconectate. ${DEMO_NOTE}`,
  };
}

/* ---------- Notificări ---------- */

export async function updateNotificationPreferences(
  _prev: FormState<never>,
  formData: FormData,
): Promise<FormState<never>> {
  await getViewer("mentor");
  const on = (k: string) => formData.get(k) === "on";
  const enabled = [
    on("submissions") && "trimiteri noi",
    on("resubmissions") && "retrimiteri",
    on("classActivity") && "activitate în clase",
  ].filter(Boolean);
  return {
    status: "success",
    message: "Preferințele de notificare au fost salvate.",
    note:
      enabled.length > 0
        ? `Primești notificări pentru: ${enabled.join(", ")}. ${DEMO_NOTE}`
        : `Nu vei primi notificări în aplicație. ${DEMO_NOTE}`,
  };
}
