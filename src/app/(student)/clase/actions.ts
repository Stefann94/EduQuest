"use server";

import { getViewer, joinClassByCode } from "@/lib/data/queries";

export type JoinClassState =
  | { status: "idle" }
  | { status: "success"; className: string; mentorName: string }
  | { status: "error"; message: string };

const MESSAGES = {
  format: "Codul are 6 caractere: litere și cifre (de exemplu PY7K2Q).",
  invalid:
    "Nu am găsit nicio clasă cu acest cod. Verifică literele și cifrele.",
  expired: "Codul nu mai este valabil. Cere-i mentorului un cod nou.",
  archived: "Clasa aceasta a fost arhivată și nu mai primește elevi.",
  already: "Ești deja înscris în această clasă.",
} as const;

/** Verifică un cod de invitație pe server. În demo nu modifică datele. */
export async function joinClass(
  _prev: JoinClassState,
  formData: FormData,
): Promise<JoinClassState> {
  const me = await getViewer("student");
  const code = String(formData.get("code") ?? "");
  const result = await joinClassByCode(me.id, code);
  if (!result.ok) return { status: "error", message: MESSAGES[result.reason] };
  return {
    status: "success",
    className: result.classRoom.name,
    mentorName: result.classRoom.mentor.displayName,
  };
}
