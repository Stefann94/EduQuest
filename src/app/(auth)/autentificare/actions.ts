"use server";

import { redirect } from "next/navigation";
import { getUsers } from "@/lib/data/queries";
import type { FormState } from "../_lib/validation";
import { readForm } from "../_lib/validation";

type LoginField = "identifier" | "password";
export type LoginState = FormState<LoginField>;

// Demo: o singură parolă pentru toate conturile. Cu Supabase, verificarea se face
// de serviciul de autentificare, iar parolele sunt stocate doar ca hash.
const DEMO_PASSWORD = "parola123";

const WRONG =
  "Datele de autentificare nu sunt corecte. Verifică-le și încearcă din nou.";

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

  const users = await getUsers();
  const user = users.find((u) =>
    role === "student"
      ? u.role === "student" &&
        (u.username === identifier || u.email === identifier)
      : // Administratorii folosesc tot autentificarea cu email.
        (u.role === "mentor" || u.role === "admin") && u.email === identifier,
  );

  // Același mesaj pentru cont inexistent și parolă greșită: nu dezvăluim care câmp e greșit.
  if (!user || values.password !== DEMO_PASSWORD)
    return { status: "error", message: WRONG, errors: {}, values: kept };

  if (user.status === "suspended")
    return {
      status: "error",
      title: "Cont suspendat",
      message:
        "Contul tău este suspendat temporar, așa că nu te poți autentifica deocamdată. Scrie-ne la admin@eduquest.ro și te ajutăm să lămurim situația.",
      errors: {},
      values: kept,
    };
  if (user.status === "deactivated")
    return {
      status: "error",
      title: "Cont dezactivat",
      message:
        "Contul tău a fost dezactivat. Dacă vrei să îl folosești din nou, scrie-ne la admin@eduquest.ro.",
      errors: {},
      values: kept,
    };

  // Demo: aici s-ar crea sesiunea (cookie securizat, httpOnly).
  redirect(
    user.role === "admin" ? "/admin" : user.role === "mentor" ? "/mentor" : "/",
  );
}
