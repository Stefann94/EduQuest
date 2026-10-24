"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/core";
import { NO_ACCESS, ownedClass } from "../../access";

export type RemoveMemberResult =
  | { ok: true; message: string; note: string }
  | { ok: false; message: string };

/** Elimină un elev din clasă (RLS: doar mentorul clasei poate). XP-ul și trimiterile rămân. */
export async function removeMember(
  classId: string,
  studentId: string,
): Promise<RemoveMemberResult> {
  const owned = await ownedClass(classId);
  if (!owned) return { ok: false, message: NO_ACCESS };
  const student = owned.classRoom.students.find((s) => s.id === studentId);
  if (!student)
    return {
      ok: false,
      message: "Elevul nu mai face parte din această clasă.",
    };
  const supabase = await db();
  const { error } = await supabase
    .from("class_members")
    .delete()
    .eq("class_id", classId)
    .eq("student_id", studentId);
  if (error)
    return {
      ok: false,
      message: "Elevul nu a putut fi eliminat. Încearcă din nou.",
    };
  revalidatePath(`/mentor/clase/${classId}`, "layout");
  return {
    ok: true,
    message: `${student.displayName} a fost eliminat din ${owned.classRoom.name}.`,
    note: "Poate reveni oricând cu codul de invitație al clasei.",
  };
}
