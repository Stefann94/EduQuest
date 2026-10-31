"use server";

import { redirect } from "next/navigation";
import { HOME, safeNext } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FormState } from "../_lib/validation";
import { readForm } from "../_lib/validation";

type LoginField = "identifier" | "password";
export type LoginState = FormState<LoginField>;

const WRONG =
  "Datele de autentificare nu sunt corecte. Verifică-le și încearcă din nou.";

/** Emailul unui elev după username (doar pe server; emailul nu ajunge în browser). */
async function emailForUsername(username: string) {
  const admin = supabaseAdmin();
  if (!admin) return null;
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (!data) return null;
  const { data: user } = await admin.auth.admin.getUserById(data.id);
  return user.user?.email ?? null;
}

/** Autentificare pentru elevi (username sau email) și mentori (email). */
export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const role = formData.get("role") === "mentor" ? "mentor" : "student";
  const values = readForm(formData, ["identifier", "password"] as const);
  const identifier = values.identifier.trim().toLowerCase();
  const kept = { identifier: values.identifier };

  const errors: Partial<Record<LoginField, string>> = {};
  if (!identifier)
    errors.identifier =
      role === "student"
        ? "Scrie username-ul sau adresa de email."
        : "Scrie adresa de email.";
  else if (role === "mentor" && !identifier.includes("@"))
    errors.identifier = "Mentorii se autentifică cu adresa de email.";
  if (!values.password) errors.password = "Scrie parola.";
  if (Object.keys(errors).length > 0)
    return { status: "error", errors, values: kept };

  const email = identifier.includes("@")
    ? identifier
    : await emailForUsername(identifier);
  // Același mesaj pentru cont inexistent și parolă greșită: nu dezvăluim care câmp e greșit.
  if (!email)
    return { status: "error", message: WRONG, errors: {}, values: kept };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: values.password,
  });
  if (error) {
    if (error.code === "email_not_confirmed")
      return {
        status: "error",
        title: "Confirmă adresa de email",
        message:
          "Ți-am trimis un email cu un link de confirmare. Deschide-l, apoi intră în cont.",
        errors: {},
        values: kept,
      };
    return { status: "error", message: WRONG, errors: {}, values: kept };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", data.user.id)
    .single();
  if (!profile || profile.status !== "active") {
    await supabase.auth.signOut();
    return {
      status: "error",
      title:
        profile?.status === "deactivated"
          ? "Cont dezactivat"
          : "Cont suspendat",
      message:
        profile?.status === "deactivated"
          ? "Contul tău a fost dezactivat. Dacă vrei să îl folosești din nou, scrie-ne la admin@eduquest.ro."
          : "Contul tău este suspendat temporar, așa că nu te poți autentifica deocamdată. Scrie-ne la admin@eduquest.ro și te ajutăm să lămurim situația.",
      errors: {},
      values: kept,
    };
  }

  const home = HOME[profile.role as keyof typeof HOME];
  const next = safeNext(formData.get("next"), home);
  redirect(next === "/" ? home : next);
}

/** Ieșirea din cont, din meniul contului. */
export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/autentificare");
}
