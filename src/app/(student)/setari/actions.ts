"use server";

import { z } from "zod";
import { getViewer } from "@/lib/data/queries";
import type { AvatarId } from "@/lib/data/types";

// Setările contului. În demo, acțiunile validează datele și întorc rezultatul,
// fără să salveze nimic.

const AVATAR_IDS = [
  "fox",
  "panda",
  "owl",
  "cat",
  "robot",
  "rocket",
  "octopus",
  "penguin",
] as const satisfies readonly AvatarId[];

export type FormState<F extends string> =
  | { status: "idle" }
  | { status: "error"; errors: Partial<Record<F | "form", string[]>> }
  | { status: "success"; message: string };

/* ---------- Profil ---------- */

const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Numele trebuie să aibă cel puțin 2 caractere.")
    .max(40, "Numele poate avea cel mult 40 de caractere.")
    .regex(
      /^[\p{L}][\p{L} .'-]*$/u,
      "Folosește doar litere, spații, cratimă sau apostrof.",
    ),
  avatar: z.enum(AVATAR_IDS, "Alege unul dintre personajele din listă."),
});

export async function updateProfile(
  _prev: FormState<"displayName" | "avatar">,
  formData: FormData,
): Promise<FormState<"displayName" | "avatar">> {
  await getViewer("student");
  const parsed = profileSchema.safeParse({
    displayName: String(formData.get("displayName") ?? ""),
    avatar: String(formData.get("avatar") ?? ""),
  });
  if (!parsed.success)
    return {
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  return { status: "success", message: "Profilul a fost actualizat." };
}

/* ---------- Email ---------- */

export async function changeEmail(
  _prev: FormState<"email">,
  formData: FormData,
): Promise<FormState<"email">> {
  const me = await getViewer("student");
  const parsed = z
    .object({
      email: z
        .string()
        .trim()
        .toLowerCase()
        .pipe(z.email("Introdu o adresă de email validă.")),
    })
    .safeParse({ email: String(formData.get("email") ?? "") });
  if (!parsed.success)
    return {
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  if (parsed.data.email === me.email.toLowerCase())
    return {
      status: "error",
      errors: { email: ["Aceasta este deja adresa contului tău."] },
    };
  return {
    status: "success",
    message: `Am trimis un link de confirmare la ${parsed.data.email}. Adresa se schimbă după ce îl deschizi.`,
  };
}

/* ---------- Parolă ---------- */

const passwordSchema = z
  .object({
    current: z.string().min(1, "Introdu parola actuală."),
    next: z
      .string()
      .min(8, "Parola nouă trebuie să aibă cel puțin 8 caractere.")
      .max(128, "Parola poate avea cel mult 128 de caractere."),
    confirm: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.confirm !== v.next)
      ctx.addIssue({
        code: "custom",
        path: ["confirm"],
        message: "Parolele nu se potrivesc.",
      });
    if (v.current && v.next === v.current)
      ctx.addIssue({
        code: "custom",
        path: ["next"],
        message: "Parola nouă trebuie să fie diferită de cea actuală.",
      });
  });

export async function changePassword(
  _prev: FormState<"current" | "next" | "confirm">,
  formData: FormData,
): Promise<FormState<"current" | "next" | "confirm">> {
  await getViewer("student");
  const parsed = passwordSchema.safeParse({
    current: String(formData.get("current") ?? ""),
    next: String(formData.get("next") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  });
  if (!parsed.success)
    return {
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  // Cu Supabase: verificăm parola actuală și închidem celelalte sesiuni.
  return { status: "success", message: "Parola a fost schimbată." };
}

/* ---------- Notificări ---------- */

const prefsSchema = z.object({
  assignments: z.boolean(),
  deadlines: z.boolean(),
  feedback: z.boolean(),
  materials: z.boolean(),
  liveQuiz: z.boolean(),
});

export type NotificationPrefs = z.infer<typeof prefsSchema>;

export async function saveNotificationPrefs(
  prefs: NotificationPrefs,
): Promise<{ ok: boolean }> {
  await getViewer("student");
  return { ok: prefsSchema.safeParse(prefs).success };
}
