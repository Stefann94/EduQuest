"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  passwordMatches,
  saveProfile,
  setPassword,
  startEmailChange,
} from "@/lib/account";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db/core";

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
  const me = await requireUser("mentor");
  const parsed = profileSchema.safeParse({
    displayName: String(formData.get("displayName") ?? ""),
  });
  if (!parsed.success)
    return { status: "error", errors: firstErrors(parsed.error) };
  if (!(await saveProfile(me.id, parsed.data)))
    return {
      status: "error",
      errors: { displayName: "Numele nu s-a putut salva. Încearcă din nou." },
    };
  revalidatePath("/mentor", "layout");
  return {
    status: "success",
    message: `Numele afișat este acum „${parsed.data.displayName}”.`,
    note: "Elevii îl văd în clasele tale.",
  };
}

/* ---------- Email ---------- */

type EmailField = "email" | "currentPassword";

export async function requestEmailChange(
  _prev: FormState<EmailField>,
  formData: FormData,
): Promise<FormState<EmailField>> {
  const me = await requireUser("mentor");
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
  if (!(await passwordMatches(me.email, parsed.data.currentPassword)))
    return {
      status: "error",
      errors: { currentPassword: "Parola actuală nu e corectă." },
    };
  const result = await startEmailChange(parsed.data.email);
  if (result === "taken")
    return {
      status: "error",
      errors: { email: "Adresa aceasta e folosită deja de alt cont." },
    };
  if (result !== "ok")
    return {
      status: "error",
      errors: {
        email:
          "Nu am putut trimite linkul. Verifică adresa sau încearcă mai târziu.",
      },
    };
  return {
    status: "success",
    message: `Am trimis un link de confirmare la ${parsed.data.email}.`,
    note: `Până confirmi, te autentifici în continuare cu ${me.email}.`,
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
  const me = await requireUser("mentor");
  const parsed = passwordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success)
    return { status: "error", errors: firstErrors(parsed.error) };
  if (!(await passwordMatches(me.email, parsed.data.currentPassword)))
    return {
      status: "error",
      errors: { currentPassword: "Parola actuală nu e corectă." },
    };
  const result = await setPassword(parsed.data.newPassword);
  if (result === "same")
    return {
      status: "error",
      errors: {
        newPassword: "Parola nouă trebuie să fie diferită de cea actuală.",
      },
    };
  if (result !== "ok")
    return {
      status: "error",
      errors: { newPassword: "Parola nu s-a putut schimba. Încearcă din nou." },
    };
  return {
    status: "success",
    message: "Parola a fost schimbată.",
    note: "Celelalte dispozitive au fost deconectate.",
  };
}

/* ---------- Notificări ---------- */

export async function updateNotificationPreferences(
  _prev: FormState<never>,
  formData: FormData,
): Promise<FormState<never>> {
  const me = await requireUser("mentor");
  const on = (k: string) => formData.get(k) === "on";
  const prefs = {
    submissions: on("submissions"),
    resubmissions: on("resubmissions"),
    classActivity: on("classActivity"),
  };
  const supabase = await db();
  const { error } = await supabase
    .from("profiles")
    .update({ notification_prefs: prefs })
    .eq("id", me.id);
  if (error) return { status: "error", errors: {} };
  revalidatePath("/mentor", "layout");
  const enabled = [
    prefs.submissions && "trimiteri noi",
    prefs.resubmissions && "retrimiteri",
    prefs.classActivity && "aplicații și activitate",
  ].filter(Boolean);
  return {
    status: "success",
    message: "Preferințele de notificare au fost salvate.",
    note:
      enabled.length > 0
        ? `Vezi notificări pentru: ${enabled.join(", ")}.`
        : "Nu vei mai vedea notificări în aplicație.",
  };
}
