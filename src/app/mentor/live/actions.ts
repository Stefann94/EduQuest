"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { mentorClassIds } from "@/lib/db/classes";
import { db, isUuid } from "@/lib/db/core";
import { notifyClassStudents } from "@/lib/db/notify";

const startSchema = z.object({
  quizId: z.string().refine(isUuid, { message: "Alege quiz-ul." }),
  classId: z.string().refine(isUuid, { message: "Alege clasa." }),
  seconds: z.number().int().min(5).max(120),
});

/**
 * Deschide o sesiune live: baza de date generează un cod unic de 6 cifre
 * (create_live_session). Elevii clasei primesc o notificare.
 */
export async function startLiveSession(input: {
  quizId: string;
  classId: string;
  seconds: number;
}) {
  const me = await requireUser("mentor");
  const parsed = startSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, message: parsed.error.issues[0].message };
  if (!(await mentorClassIds(me.id)).includes(parsed.data.classId))
    return {
      ok: false as const,
      message: "Poți porni quiz-uri live doar în clasele tale.",
    };

  const supabase = await db();
  const { data: id, error } = await supabase.rpc("create_live_session", {
    p_quiz: parsed.data.quizId,
    p_class: parsed.data.classId,
  });
  if (error || !id)
    return { ok: false as const, message: "Sesiunea nu s-a putut deschide." };
  await supabase
    .from("live_sessions")
    .update({ question_seconds: parsed.data.seconds })
    .eq("id", id);
  await notifyClassStudents([parsed.data.classId], {
    kind: "live_quiz",
    title: "Quiz live deschis",
    body: "Intră cu codul afișat de mentor.",
    href: "/live",
  });
  revalidatePath("/mentor", "layout");
  redirect(`/mentor/live/${id}`);
}

/** Comenzile din panoul de control: start, dezvăluie, următoarea, încheie. */
export async function controlLive(
  sessionId: string,
  action: "start" | "reveal" | "next" | "finish",
) {
  await requireUser("mentor");
  if (!isUuid(sessionId)) return { ok: false, message: "Sesiunea nu există." };
  const supabase = await db();
  const { error } = await supabase.rpc("live_control", {
    p_session: sessionId,
    p_action: action,
  });
  if (error) return { ok: false, message: error.message };
  if (action === "finish" || action === "next")
    revalidatePath("/mentor", "layout");
  return { ok: true, message: "" };
}
