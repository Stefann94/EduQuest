"use server";

import { DEMO_NOTE, NO_ACCESS, ownedClass } from "../../access";
import {
  fieldErrors,
  generateInviteCode,
  readClassDetails,
  submittedValues,
} from "../../class-schema";
import {
  type ClassFieldErrors,
  type ClassFormValues,
  formatSchedule,
} from "../../schedule";

export type ClassDetailsState =
  | { status: "idle" }
  | { status: "success"; values: ClassFormValues; schedule: string }
  | {
      status: "error";
      message?: string;
      errors: ClassFieldErrors;
      values: ClassFormValues;
    };

export type SettingsResult =
  | { ok: true; message: string; note: string; code?: string }
  | { ok: false; message: string };

/** Salvează numele, descrierea și programul clasei. În demo nu salvează nimic. */
export async function updateClassDetails(
  _prev: ClassDetailsState,
  formData: FormData,
): Promise<ClassDetailsState> {
  const values = submittedValues(formData);
  const owned = await ownedClass(String(formData.get("classId") ?? ""));
  if (!owned)
    return { status: "error", message: NO_ACCESS, errors: {}, values };
  const parsed = readClassDetails(formData);
  if (!parsed.success)
    return { status: "error", errors: fieldErrors(parsed.error), values };
  return {
    status: "success",
    values: { ...parsed.data },
    schedule: formatSchedule(parsed.data),
  };
}

/** Generează un cod nou; cel vechi nu mai funcționează. */
export async function regenerateInviteCode(
  classId: string,
): Promise<SettingsResult> {
  const owned = await ownedClass(classId);
  if (!owned) return { ok: false, message: NO_ACCESS };
  if (owned.classRoom.status === "archived")
    return { ok: false, message: "Clasa este arhivată și nu primește elevi." };
  const code = generateInviteCode();
  return {
    ok: true,
    code,
    message: `Codul nou este ${code}. Codul ${owned.classRoom.inviteCode} nu mai funcționează.`,
    note: DEMO_NOTE,
  };
}

/** Activează sau dezactivează codul de invitație. */
export async function setInviteCodeActive(
  classId: string,
  active: boolean,
): Promise<SettingsResult> {
  const owned = await ownedClass(classId);
  if (!owned) return { ok: false, message: NO_ACCESS };
  if (active && owned.classRoom.status === "archived")
    return { ok: false, message: "Clasa este arhivată și nu primește elevi." };
  return {
    ok: true,
    message: active
      ? "Codul de invitație este din nou activ."
      : "Codul de invitație a fost dezactivat.",
    note: DEMO_NOTE,
  };
}

/** Arhivează clasa: elevii păstrează accesul de citire la materiale. */
export async function archiveClass(classId: string): Promise<SettingsResult> {
  const owned = await ownedClass(classId);
  if (!owned) return { ok: false, message: NO_ACCESS };
  if (owned.classRoom.status === "archived")
    return { ok: false, message: "Clasa este deja arhivată." };
  return {
    ok: true,
    message: `${owned.classRoom.name} a fost arhivată.`,
    note: DEMO_NOTE,
  };
}
