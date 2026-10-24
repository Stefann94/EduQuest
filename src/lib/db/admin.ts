import "server-only";
import type {
  AccountStatus,
  AvatarId,
  MentorApplication,
  Role,
} from "@/lib/data/types";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { db, isUuid, must } from "./core";

// Zona de administrare. Aplicațiile de mentor se citesc cu sesiunea (RLS: doar adminii).
// Lista de conturi are nevoie de emailuri (din auth.users), deci se citește cu cheia de
// server, DOAR după ce pagina a verificat rolul de administrator (requireUser("admin")).

const APPLICATION_FIELDS =
  "id, full_name, email, phone, background, intended_use, evidence, status, submitted_at, review_note";

type ApplicationRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  background: string;
  intended_use: string;
  evidence: string;
  status: MentorApplication["status"];
  submitted_at: string;
  review_note: string | null;
};

const toApplication = (r: ApplicationRow): MentorApplication => ({
  id: r.id,
  fullName: r.full_name,
  email: r.email,
  phone: r.phone,
  background: r.background,
  intendedUse: r.intended_use,
  evidence: r.evidence,
  status: r.status,
  submittedAt: r.submitted_at,
  reviewNote: r.review_note ?? undefined,
});

export async function getMentorApplications(): Promise<MentorApplication[]> {
  const supabase = await db();
  const rows = must(
    "Aplicațiile",
    await supabase
      .from("mentor_applications")
      .select(APPLICATION_FIELDS)
      .order("submitted_at", { ascending: false }),
  );
  return (rows as ApplicationRow[]).map(toApplication);
}

export async function getMentorApplication(id: string) {
  if (!isUuid(id)) return undefined;
  const supabase = await db();
  const { data } = await supabase
    .from("mentor_applications")
    .select(APPLICATION_FIELDS)
    .eq("id", id)
    .maybeSingle();
  return data ? toApplication(data as ApplicationRow) : undefined;
}

export type AdminUser = {
  id: string;
  displayName: string;
  username?: string;
  email: string;
  role: Role;
  avatar: AvatarId;
  status: AccountStatus;
  createdAt: string;
  classCount: number;
};

/** Toate conturile, cu emailul și numărul de clase (ca elev sau ca mentor). */
export async function getAdminUsers(): Promise<AdminUser[]> {
  const admin = supabaseAdmin();
  if (!admin) return [];
  const emails = new Map<string, string>();
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw new Error(`Conturile: ${error.message}`);
    for (const u of data.users) emails.set(u.id, u.email ?? "");
    if (data.users.length < 200) break;
  }
  const [profiles, classes, members] = await Promise.all([
    admin
      .from("profiles")
      .select("id, display_name, username, role, avatar, status, created_at"),
    admin.from("classes").select("id, mentor_id, status"),
    admin.from("class_members").select("student_id"),
  ]);
  const taught = new Map<string, number>();
  for (const c of must("Clasele", classes))
    taught.set(c.mentor_id, (taught.get(c.mentor_id) ?? 0) + 1);
  const joined = new Map<string, number>();
  for (const m of must("Membrii", members))
    joined.set(m.student_id, (joined.get(m.student_id) ?? 0) + 1);
  return must("Profilurile", profiles)
    .map((p) => ({
      id: p.id,
      displayName: p.display_name,
      username: p.username ?? undefined,
      email: emails.get(p.id) ?? "",
      role: p.role,
      avatar: (p.avatar ?? "fox") as AvatarId,
      status: p.status,
      createdAt: p.created_at,
      classCount:
        (p.role === "mentor" ? taught.get(p.id) : joined.get(p.id)) ?? 0,
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName, "ro"));
}

/** Cifrele pentru prezentarea generală. */
export async function getAdminStats() {
  const admin = supabaseAdmin();
  const [apps, users, classes] = await Promise.all([
    getMentorApplications(),
    admin ? admin.from("profiles").select("role, status") : null,
    admin ? admin.from("classes").select("status") : null,
  ]);
  const u = users ? must("Profilurile", users) : [];
  const c = classes ? must("Clasele", classes) : [];
  return {
    pendingApplications: apps.filter((a) => a.status === "pending").length,
    needsInfoApplications: apps.filter((a) => a.status === "needs_info").length,
    activeMentors: u.filter((x) => x.role === "mentor" && x.status === "active")
      .length,
    activeStudents: u.filter(
      (x) => x.role === "student" && x.status === "active",
    ).length,
    totalStudents: u.filter((x) => x.role === "student").length,
    activeClasses: c.filter((x) => x.status === "active").length,
    archivedClasses: c.filter((x) => x.status === "archived").length,
    suspendedAccounts: u.filter((x) => x.status === "suspended").length,
    deactivatedAccounts: u.filter((x) => x.status === "deactivated").length,
  };
}

/**
 * Schimbă starea unui cont. Suspendarea și dezactivarea blochează autentificarea și
 * închid sesiunile deschise; reactivarea le deblochează.
 */
export async function setAccountStatus(userId: string, status: AccountStatus) {
  const admin = supabaseAdmin();
  if (!admin || !isUuid(userId)) return false;
  const { error } = await admin
    .from("profiles")
    .update({ status })
    .eq("id", userId);
  if (error) return false;
  const { error: banError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: status === "active" ? "none" : "876000h",
  });
  return !banError;
}

export async function getAccountStatus(userId: string) {
  const admin = supabaseAdmin();
  if (!admin || !isUuid(userId)) return undefined;
  const { data } = await admin
    .from("profiles")
    .select("id, status")
    .eq("id", userId)
    .maybeSingle();
  return data ?? undefined;
}
