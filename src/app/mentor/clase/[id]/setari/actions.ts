"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/core";
import { NO_ACCESS, ownedClass } from "../../access";
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

const refresh = (classId: string) =>
  revalidatePath(`/mentor/clase/${classId}`, "layout");

/** Salvează numele, descrierea și programul clasei. */
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
  const schedule = formatSchedule(parsed.data);
  const supabase = await db();
  const { error } = await supabase
    .from("classes")
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      schedule,
    })
    .eq("id", owned.classRoom.id);
  if (error)
    return {
      status: "error",
      message: "Modificările nu s-au putut salva. Încearcă din nou.",
      errors: {},
      values,
    };
  refresh(owned.classRoom.id);
  return { status: "success", values: { ...parsed.data }, schedule };
}

/** Generează un cod nou; cel vechi nu mai funcționează. */
export async function regenerateInviteCode(
  classId: string,
): Promise<SettingsResult> {
  const owned = await ownedClass(classId);
  if (!owned) return { ok: false, message: NO_ACCESS };
  if (owned.classRoom.status === "archived")
    return { ok: false, message: "Clasa este arhivată și nu primește elevi." };
  const supabase = await db();
  // Codul e unic în toată platforma; la o coliziune (foarte rară) mai încercăm o dată.
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateInviteCode();
    const { error } = await supabase
      .from("classes")
      .update({ invite_code: code, invite_code_active: true })
      .eq("id", classId);
    if (!error) {
      refresh(classId);
      return {
        ok: true,
        code,
        message: `Codul nou este ${code}.`,
        note: `Codul ${owned.classRoom.inviteCode} nu mai funcționează.`,
      };
    }
    if (error.code !== "23505") break;
  }
  return {
    ok: false,
    message: "Nu am putut genera un cod nou. Încearcă din nou.",
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
  const supabase = await db();
  const { error } = await supabase
    .from("classes")
    .update({ invite_code_active: active })
    .eq("id", classId);
  if (error) return { ok: false, message: "Modificarea nu s-a putut salva." };
  refresh(classId);
  return {
    ok: true,
    message: active
      ? "Codul de invitație este din nou activ."
      : "Codul de invitație a fost dezactivat.",
    note: active
      ? "Elevii noi se pot înscrie cu el."
      : "Nimeni nu se mai poate înscrie până îl activezi.",
  };
}

/** Arhivează clasa: elevii păstrează accesul de citire la lecții, dar nu mai trimit teme. */
export async function archiveClass(classId: string): Promise<SettingsResult> {
  const owned = await ownedClass(classId);
  if (!owned) return { ok: false, message: NO_ACCESS };
  if (owned.classRoom.status === "archived")
    return { ok: false, message: "Clasa este deja arhivată." };
  const supabase = await db();
  const { error } = await supabase
    .from("classes")
    .update({ status: "archived", invite_code_active: false })
    .eq("id", classId);
  if (error) return { ok: false, message: "Clasa nu s-a putut arhiva." };
  refresh(classId);
  return {
    ok: true,
    message: `${owned.classRoom.name} a fost arhivată.`,
    note: "Elevii pot reciti lecțiile, dar nu mai pot trimite teme.",
  };
}
