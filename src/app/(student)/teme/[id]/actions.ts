"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db, isUuid } from "@/lib/db/core";

const codeSchema = z
  .string()
  .max(50_000, "Codul e prea lung (cel mult 50.000 de caractere).")
  .refine(
    (v) => v.trim().length > 0,
    "Scrie sau lipește rezolvarea înainte să o trimiți.",
  );

export type SubmitResult =
  | { ok: true; late: boolean; xpAwarded: boolean }
  | { ok: false; message: string };

/**
 * Trimite (sau retrimite) rezolvarea unei probleme. Regulile (clasa elevului, termenul,
 * +2 XP o singură dată, la timp) le aplică baza de date, în submit_problem.
 */
export async function submitProblem(
  assignmentId: string,
  problemId: string,
  code: string,
): Promise<SubmitResult> {
  const me = await requireUser("student");
  if (!isUuid(assignmentId) || !isUuid(problemId))
    return { ok: false, message: "Tema nu mai există." };
  const parsed = codeSchema.safeParse(code);
  if (!parsed.success)
    return { ok: false, message: parsed.error.issues[0].message };

  const supabase = await db();
  const eventKey = `homework:${assignmentId}:${me.id}`;
  const before = await supabase
    .from("xp_transactions")
    .select("id")
    .eq("event_key", eventKey)
    .maybeSingle();

  const { data: submissionId, error } = await supabase.rpc("submit_problem", {
    p_assignment: assignmentId,
    p_problem: problemId,
    p_code: parsed.data,
  });
  if (error || !submissionId)
    return {
      ok: false,
      message: error?.message ?? "Trimiterea nu a reușit. Încearcă din nou.",
    };

  const [{ data: attempt }, after] = await Promise.all([
    supabase
      .from("problem_attempts")
      .select("late")
      .eq("submission_id", submissionId)
      .order("at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("xp_transactions")
      .select("id")
      .eq("event_key", eventKey)
      .maybeSingle(),
  ]);

  revalidatePath("/", "layout");
  return {
    ok: true,
    late: attempt?.late ?? false,
    xpAwarded: !before.data && !!after.data,
  };
}
