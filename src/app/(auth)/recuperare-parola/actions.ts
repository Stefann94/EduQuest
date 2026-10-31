"use server";

import { emailHtml, mailAllowed, mailConfigured, sendMail } from "@/lib/mail";
import { siteOrigin, trustedOrigin } from "@/lib/site-url";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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

  // Cu server de email: trimitem noi emailul, cu un buton „Resetează parola” care duce
  // direct pe site (linkul nu depinde de setările de adrese din Supabase).
  if (mailConfigured() && (await sendResetEmail(parsed.data)))
    return { status: "success" };

  const supabase = await createSupabaseServerClient();
  // Eventualele erori (ex. adresă fără cont) nu se arată, din același motiv.
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${await siteOrigin()}/auth/confirm?next=/resetare-parola`,
  });
  return { status: "success" };
}

/** Emailul de resetare cu buton. Întoarce false dacă nu s-a trimis (atunci trimite Supabase). */
async function sendResetEmail(email: string) {
  const admin = supabaseAdmin();
  if (!admin) return false;
  // Cereri repetate pentru aceeași adresă: același răspuns, fără încă un email.
  if (!mailAllowed(email)) return true;
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
  });
  // Adresă fără cont: nu trimitem nimic, dar răspunsul rămâne același.
  if (error || !data.properties?.hashed_token) return true;

  const name =
    (data.user?.user_metadata?.display_name as string | undefined) ?? "";
  const link = `${await trustedOrigin()}/auth/confirm?${new URLSearchParams({
    token_hash: data.properties.hashed_token,
    type: "recovery",
    next: "/resetare-parola",
  })}`;
  const hello = name ? `Bună, ${name}!` : "Bună!";
  return sendMail(
    email,
    "Resetează-ți parola EduQuest",
    [
      hello,
      "",
      "Ai cerut resetarea parolei contului tău EduQuest. Deschide linkul de mai jos și alege o parolă nouă:",
      "",
      link,
      "",
      "Linkul e valabil 60 de minute și poate fi folosit o singură dată.",
      "Dacă nu tu ai cerut resetarea, ignoră acest email: parola rămâne neschimbată.",
      "",
      "Echipa EduQuest",
    ].join("\n"),
    emailHtml({
      title: "Resetează-ți parola",
      paragraphs: [
        hello,
        "Ai cerut resetarea parolei contului tău EduQuest. Apasă butonul de mai jos și alege o parolă nouă.",
      ],
      button: { label: "Resetează parola", href: link },
      note: "Linkul e valabil 60 de minute și poate fi folosit o singură dată. Dacă nu tu ai cerut resetarea, ignoră acest email: parola rămâne neschimbată.",
    }),
  );
}
