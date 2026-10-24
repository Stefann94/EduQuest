"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getVisibleClasses } from "@/lib/db/classes";
import { db } from "@/lib/db/core";

export type JoinClassState =
  | { status: "idle" }
  | { status: "success"; className: string; mentorName: string }
  | { status: "error"; message: string };

const MESSAGES = {
  format: "Codul are 6 caractere: litere și cifre (de exemplu PY7K2Q).",
  invalid:
    "Codul nu e valabil: verifică literele și cifrele sau cere-i mentorului un cod nou.",
  already: "Ești deja înscris în această clasă.",
} as const;

/** Intrarea într-o clasă cu codul de invitație (verificat de baza de date, în join_class). */
export async function joinClass(
  _prev: JoinClassState,
  formData: FormData,
): Promise<JoinClassState> {
  const me = await requireUser("student");
  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code))
    return { status: "error", message: MESSAGES.format };

  const before = await getVisibleClasses();
  const supabase = await db();
  const { data: classId, error } = await supabase.rpc("join_class", {
    p_code: code,
  });
  if (error || !classId) return { status: "error", message: MESSAGES.invalid };
  if (before.some((c) => c.id === classId && c.studentIds.includes(me.id)))
    return { status: "error", message: MESSAGES.already };

  const { data: cls } = await supabase
    .from("classes")
    .select("name, mentor:profiles!classes_mentor_id_fkey(display_name)")
    .eq("id", classId)
    .single();
  revalidatePath("/", "layout");
  return {
    status: "success",
    className: cls?.name ?? "clasă",
    mentorName: cls?.mentor?.display_name ?? "",
  };
}
