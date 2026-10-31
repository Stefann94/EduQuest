import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import type { AccountStatus, AvatarId, Role, User } from "./data/types";
import { createSupabaseServerClient } from "./supabase/server";

/** Pagina de start a fiecărui rol. */
export const HOME: Record<Role, string> = {
  student: "/",
  mentor: "/mentor",
  admin: "/admin",
};

export type SessionProfile = {
  id: string;
  email: string;
  displayName: string;
  username?: string;
  role: Role;
  avatar?: AvatarId;
  status: AccountStatus;
  createdAt: string;
  /** Mentor cu drepturi și de administrator (vede și panoul de admin). */
  adminAccess: boolean;
};

/**
 * Contul logat și profilul lui, citite o singură dată pe cerere.
 * `getUser()` verifică sesiunea la serviciul de autentificare (nu doar cookie-ul).
 */
export const getSessionProfile = cache(
  async (): Promise<SessionProfile | null> => {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return null;
    const { data: p } = await supabase
      .from("profiles")
      .select(
        "display_name, username, role, avatar, status, created_at, admin_access",
      )
      .eq("id", user.id)
      .single();
    if (!p) return null;
    return {
      id: user.id,
      email: user.email,
      displayName: p.display_name,
      username: p.username ?? undefined,
      role: p.role,
      avatar: (p.avatar ?? undefined) as AvatarId | undefined,
      status: p.status,
      createdAt: p.created_at,
      adminAccess: p.role === "admin" || p.admin_access,
    };
  },
);

/**
 * Utilizatorul logat, dacă are rolul cerut. Altfel: la autentificare (fără sesiune
 * sau cont inactiv) ori la pagina de start a rolului lui.
 */
export async function requireUser(role: Role): Promise<User> {
  // Paginile cu cont se randează la fiecare cerere (folosesc și ora curentă).
  await connection();
  const p = await getSessionProfile();
  if (!p || p.status !== "active") redirect("/auth/iesire");
  // Un mentor cu acces de admin intră și în panoul de administrator.
  const allowed = p.role === role || (role === "admin" && p.adminAccess);
  if (!allowed) redirect(HOME[p.role]);
  return {
    id: p.id,
    displayName: p.displayName,
    username: p.username,
    email: p.email,
    role: p.role,
    avatar: p.avatar ?? "fox",
    status: p.status,
    createdAt: p.createdAt,
  };
}

/** Doar adrese relative din același site (fără redirecționări către alte domenii). */
export function safeNext(next: unknown, fallback = "/") {
  return typeof next === "string" &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.startsWith("/\\")
    ? next
    : fallback;
}
