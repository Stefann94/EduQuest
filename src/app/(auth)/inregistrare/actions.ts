"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { emailHtml, mailAllowed, mailConfigured, sendMail } from "@/lib/mail";
import { siteOrigin, trustedOrigin } from "@/lib/site-url";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  emailSchema,
  type FormState,
  firstErrors,
  passwordErrors,
  readForm,
  withoutPasswords,
} from "../_lib/validation";

const FIELDS = ["displayName", "email", "password", "confirm"] as const;
type Field = (typeof FIELDS)[number];

export type RegisterState = FormState<Field, { email: string }>;

const schema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, { error: "Scrie-ți numele (cel puțin 2 caractere)." })
    .max(40, { error: "Numele poate avea cel mult 40 de caractere." }),
  email: emailSchema,
});

/** Creează un cont de elev și trimite emailul de confirmare. */
export async function register(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const values = readForm(formData, FIELDS);
  const parsed = schema.safeParse(values);
  const errors: Partial<Record<Field, string>> = {
    ...(parsed.success ? {} : firstErrors(parsed.error)),
    ...passwordErrors(values.password, values.confirm),
  };

  const admin = supabaseAdmin();
  if (parsed.success && admin) {
    const { data: emailTaken } = await admin.rpc("email_taken", {
      p_email: parsed.data.email,
    });
    if (emailTaken)
      errors.email =
        "Există deja un cont cu această adresă. Intră în cont sau recuperează-ți parola.";
  }

  if (!parsed.success || Object.keys(errors).length > 0)
    return { status: "error", errors, values: withoutPasswords(values) };

  // Rolul nu se trimite: orice cont nou e de elev (vezi trigger-ul din baza de date).
  // Username-ul (pentru autentificare, pe lângă email) se face automat din nume.
  const data = {
    display_name: parsed.data.displayName,
    username: await freeUsername(parsed.data.displayName, parsed.data.email),
  };

  if (admin && mailConfigured()) {
    // Cu server de email: emailul de confirmare îl trimitem noi, cu un buton care duce
    // direct pe site (nu depinde de setările de adrese și de email din Supabase).
    const { data: link, error } = await admin.auth.admin.generateLink({
      type: "signup",
      email: parsed.data.email,
      password: values.password,
      options: { data },
    });
    if (!error && link.properties?.hashed_token) {
      await sendConfirmEmail(
        parsed.data.email,
        parsed.data.displayName,
        link.properties.hashed_token,
        "signup",
      );
      return { status: "success", email: parsed.data.email };
    }
  } else if (admin) {
    // Fără server de email, confirmarea n-ar ajunge la elev (serviciul implicit al
    // Supabase trimite doar către echipa proiectului): contul se activează direct.
    const { error } = await admin.auth.admin.createUser({
      email: parsed.data.email,
      password: values.password,
      email_confirm: true,
      user_metadata: data,
    });
    if (!error) {
      const supabase = await createSupabaseServerClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: values.password,
      });
      redirect(loginError ? "/autentificare" : "/");
    }
    if (error.code === "email_exists")
      return {
        status: "error",
        errors: {
          email:
            "Există deja un cont cu această adresă. Intră în cont sau recuperează-ți parola.",
        },
        values: withoutPasswords(values),
      };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: values.password,
    options: {
      emailRedirectTo: `${await siteOrigin()}/auth/confirm?next=/`,
      data,
    },
  });
  if (error?.code === "email_address_invalid")
    return {
      status: "error",
      errors: { email: "Adresa de email nu pare corectă." },
      values: withoutPasswords(values),
    };
  if (error)
    return {
      status: "error",
      title: "Contul nu a putut fi creat",
      message:
        error.code === "over_email_send_rate_limit"
          ? "Am trimis prea multe emailuri într-un timp scurt. Încearcă din nou peste câteva minute."
          : "A apărut o problemă la crearea contului. Încearcă din nou peste puțin timp.",
      errors: {},
      values: withoutPasswords(values),
    };

  return { status: "success", email: parsed.data.email };
}

/** Retrimite emailul de confirmare. */
export async function resendVerification(email: string) {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { ok: false };
  const admin = supabaseAdmin();
  if (admin && mailConfigured()) {
    // Un link de autentificare confirmă și adresa. Se trimite doar conturilor
    // neconfirmate; altfel răspunsul e același, fără email.
    if (!mailAllowed(parsed.data)) return { ok: true };
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: parsed.data,
    });
    if (error || !data.properties?.hashed_token) return { ok: true };
    if (data.user?.email_confirmed_at) return { ok: true };
    const name =
      (data.user?.user_metadata?.display_name as string | undefined) ?? "";
    return {
      ok: await sendConfirmEmail(
        parsed.data,
        name,
        data.properties.hashed_token,
        "magiclink",
      ),
    };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data,
    options: { emailRedirectTo: `${await siteOrigin()}/auth/confirm?next=/` },
  });
  return { ok: !error };
}

/** Emailul de confirmare a contului, cu butonul „Confirmă adresa”. */
async function sendConfirmEmail(
  email: string,
  name: string,
  tokenHash: string,
  type: "signup" | "magiclink",
) {
  const link = `${await trustedOrigin()}/auth/confirm?${new URLSearchParams({
    token_hash: tokenHash,
    type,
    next: "/",
  })}`;
  const hello = name ? `Bună, ${name}!` : "Bună!";
  return sendMail(
    email,
    "Confirmă-ți contul EduQuest",
    [
      hello,
      "",
      "Mai ai un pas: confirmă adresa de email ca să-ți activezi contul de elev EduQuest.",
      "",
      link,
      "",
      "Dacă nu tu ți-ai făcut cont, ignoră acest email.",
      "",
      "Echipa EduQuest",
    ].join("\n"),
    emailHtml({
      title: "Confirmă-ți contul",
      paragraphs: [
        hello,
        "Mai ai un pas: confirmă adresa de email ca să-ți activezi contul de elev EduQuest.",
      ],
      button: { label: "Confirmă adresa", href: link },
      note: "Dacă nu tu ți-ai făcut cont, ignoră acest email: fără confirmare, contul nu se activează.",
    }),
  );
}

/** Un username liber, din nume: „Maria Popescu” → maria.popescu (sau maria.popescu2…). */
async function freeUsername(name: string, email: string) {
  const slug = (t: string) =>
    t
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.+|\.+$/g, "")
      .slice(0, 18)
      .replace(/\.+$/, "");
  let base = slug(name);
  if (base.length < 3) base = slug(email.split("@")[0]);
  if (base.length < 3) base = "elev";
  const admin = supabaseAdmin();
  if (!admin) return base;
  const { data } = await admin
    .from("profiles")
    .select("username")
    .like("username", `${base}%`);
  const taken = new Set((data ?? []).map((r) => r.username));
  if (!taken.has(base)) return base;
  for (let n = 2; n < 1000; n++)
    if (!taken.has(`${base}${n}`)) return `${base}${n}`;
  return `${base}${Date.now() % 100000}`;
}
