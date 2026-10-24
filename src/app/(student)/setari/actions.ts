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
import type { AvatarId } from "@/lib/data/types";
import { db } from "@/lib/db/core";
import { PREF_KINDS, type PrefKey } from "@/lib/notification-prefs";

// Setările contului elevului, salvate în Supabase (profilul prin RLS, emailul și
// parola prin serviciul de autentificare).

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
  const me = await requireUser("student");
  const parsed = profileSchema.safeParse({
    displayName: String(formData.get("displayName") ?? ""),
    avatar: String(formData.get("avatar") ?? ""),
  });
  if (!parsed.success)
    return {
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  if (!(await saveProfile(me.id, parsed.data)))
    return {
      status: "error",
      errors: { form: ["Profilul nu s-a putut salva. Încearcă din nou."] },
    };
  revalidatePath("/", "layout");
  return { status: "success", message: "Profilul a fost actualizat." };
}

/* ---------- Email ---------- */

export async function changeEmail(
  _prev: FormState<"email">,
  formData: FormData,
): Promise<FormState<"email">> {
  const me = await requireUser("student");
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
  const result = await startEmailChange(parsed.data.email);
  if (result === "taken")
    return {
      status: "error",
      errors: { email: ["Adresa aceasta e folosită deja de alt cont."] },
    };
  if (result === "invalid")
    return {
      status: "error",
      errors: { email: ["Adresa nu pare validă. Verifică-o."] },
    };
  if (result !== "ok")
    return {
      status: "error",
      errors: {
        form: ["Nu am putut trimite linkul. Încearcă din nou mai târziu."],
      },
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
  const me = await requireUser("student");
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
  if (!(await passwordMatches(me.email, parsed.data.current)))
    return {
      status: "error",
      errors: { current: ["Parola actuală nu e corectă."] },
    };
  const result = await setPassword(parsed.data.next);
  if (result === "same")
    return {
      status: "error",
      errors: { next: ["Parola nouă trebuie să fie diferită de cea actuală."] },
    };
  if (result !== "ok")
    return {
      status: "error",
      errors: { form: ["Parola nu s-a putut schimba. Încearcă din nou."] },
    };
  return {
    status: "success",
    message:
      "Parola a fost schimbată. Celelalte dispozitive au fost deconectate.",
  };
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
  const me = await requireUser("student");
  const parsed = prefsSchema.safeParse(prefs);
  if (!parsed.success) return { ok: false };
  // Doar cheile cunoscute ajung în baza de date.
  const clean = Object.fromEntries(
    Object.entries(parsed.data).filter(([k]) => k in PREF_KINDS),
  ) as Partial<Record<PrefKey, boolean>>;
  const supabase = await db();
  const { error } = await supabase
    .from("profiles")
    .update({ notification_prefs: clean })
    .eq("id", me.id);
  revalidatePath("/", "layout");
  return { ok: !error };
}
