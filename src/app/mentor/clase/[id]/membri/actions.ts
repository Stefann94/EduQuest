"use server";

import { DEMO_NOTE, NO_ACCESS, ownedClass } from "../../access";

export type RemoveMemberResult =
  | { ok: true; message: string; note: string }
  | { ok: false; message: string };

/** Elimină un elev din clasă. În demo doar verifică accesul și întoarce confirmarea. */
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
  return {
    ok: true,
    message: `${student.displayName} a fost eliminat din ${owned.classRoom.name}.`,
    note: DEMO_NOTE,
  };
}
