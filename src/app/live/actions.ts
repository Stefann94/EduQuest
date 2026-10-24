"use server";

import { requireUser } from "@/lib/auth";
import { db, isUuid } from "@/lib/db/core";
import { type LiveState, liveStateSchema } from "@/lib/live";

export type JoinResult =
  | { ok: true; sessionId: string }
  | { ok: false; message: string };

/** Intrarea în quiz-ul live cu codul de 6 cifre (verificat de join_live). */
export async function joinLive(rawCode: string): Promise<JoinResult> {
  await requireUser("student");
  const code = rawCode.replace(/\s/g, "");
  if (!/^\d{6}$/.test(code))
    return { ok: false, message: "Codul are 6 cifre." };
  const supabase = await db();
  const { data, error } = await supabase.rpc("join_live", { p_code: code });
  if (error || !data)
    return {
      ok: false,
      message:
        error?.code === "42501"
          ? "Sesiunea e pentru altă clasă."
          : "Cod greșit sau sesiunea s-a încheiat. Verifică cifrele.",
    };
  return { ok: true, sessionId: data };
}

/** Starea jocului (citită la fiecare secundă). */
export async function getLiveState(
  sessionId: string,
): Promise<LiveState | null> {
  if (!isUuid(sessionId)) return null;
  const supabase = await db();
  const { data, error } = await supabase.rpc("live_state", {
    p_session: sessionId,
  });
  if (error) return null;
  const parsed = liveStateSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
}

/** Răspunsul la întrebarea curentă. Timpul și punctele le calculează serverul. */
export async function answerLive(
  sessionId: string,
  position: number,
  answer: number,
) {
  await requireUser("student");
  if (
    !isUuid(sessionId) ||
    !Number.isInteger(position) ||
    !Number.isInteger(answer)
  )
    return { ok: false, message: "Răspuns invalid." };
  const supabase = await db();
  const { error } = await supabase.rpc("answer_live", {
    p_session: sessionId,
    p_position: position,
    p_answer: answer,
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "" };
}
