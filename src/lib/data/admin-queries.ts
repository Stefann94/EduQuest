// Funcțiile de citire pentru zona de administrare. Fiecare verifică pe server că
// cererea vine de la un administrator (ascunderea din interfață nu este suficientă).

import * as db from "./demo";
import type { User } from "./types";

function assertAdmin(viewer: User) {
  if (viewer.role !== "admin" || viewer.status !== "active")
    throw new Error("Acces permis doar administratorilor.");
}

/** Cifrele pentru prezentarea generală. */
export async function getAdminStats(viewer: User) {
  assertAdmin(viewer);
  const apps = db.mentorApplications;
  const users = db.users;
  return {
    pendingApplications: apps.filter((a) => a.status === "pending").length,
    needsInfoApplications: apps.filter((a) => a.status === "needs_info").length,
    activeMentors: users.filter(
      (u) => u.role === "mentor" && u.status === "active",
    ).length,
    activeStudents: users.filter(
      (u) => u.role === "student" && u.status === "active",
    ).length,
    totalStudents: users.filter((u) => u.role === "student").length,
    activeClasses: db.classes.filter((c) => c.status === "active").length,
    archivedClasses: db.classes.filter((c) => c.status === "archived").length,
    suspendedAccounts: users.filter((u) => u.status === "suspended").length,
    deactivatedAccounts: users.filter((u) => u.status === "deactivated").length,
  };
}

/** Utilizatorii, cu numărul de clase (ca elev sau ca mentor) pentru fiecare. */
export async function getAdminUsers(viewer: User) {
  assertAdmin(viewer);
  return db.users.map((u) => ({
    ...u,
    classCount: db.classes.filter((c) =>
      u.role === "mentor" ? c.mentorId === u.id : c.studentIds.includes(u.id),
    ).length,
  }));
}

export type AdminUser = Awaited<ReturnType<typeof getAdminUsers>>[number];
