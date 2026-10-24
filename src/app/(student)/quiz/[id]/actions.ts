"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db, isUuid } from "@/lib/db/core";
import { xpOutlook } from "@/lib/db/quiz-rules";

const answersSchema = z
  .array(z.number().int().min(0).max(9).nullable())
  .min(1)
  .max(100);

export type QuestionResult = {
  questionId: string;
  your: number | null;
  correct: number;
  isCorrect: boolean;
  explanation?: string;
};

export type GradeResult =
  | {
      ok: true;
      correct: number;
      total: number;
      results: QuestionResult[];
      xp: number;
    }
  | { ok: false; reason: "invalid" | "unavailable" };

const keySchema = z.array(
  z.object({
    position: z.number(),
    correct: z.number(),
    explanation: z.string().nullable(),
  }),
);

/**
 * Trimite o încercare. Notarea și XP-ul le face baza de date (submit_quiz); răspunsurile
 * corecte și explicațiile ajung în browser abia acum, după trimitere.
 */
export async function submitQuiz(
  quizId: string,
  answers: (number | null)[],
): Promise<GradeResult> {
  const me = await requireUser("student");
  const parsed = answersSchema.safeParse(answers);
  if (!parsed.success || !isUuid(quizId))
    return { ok: false, reason: "invalid" };

  const supabase = await db();
  const [{ data: quiz }, { data: questions }, { count: before }] =
    await Promise.all([
      supabase.from("quizzes").select("xp").eq("id", quizId).maybeSingle(),
      supabase
        .from("quiz_questions")
        .select("id, position")
        .eq("quiz_id", quizId)
        .order("position"),
      supabase
        .from("quiz_attempts")
        .select("id", { count: "exact", head: true })
        .eq("quiz_id", quizId)
        .eq("student_id", me.id),
    ]);
  if (!quiz || !questions || questions.length !== parsed.data.length)
    return { ok: false, reason: "unavailable" };

  const { data, error } = await supabase.rpc("submit_quiz", {
    p_quiz: quizId,
    p_answers: parsed.data as number[],
  });
  if (error || !data) return { ok: false, reason: "unavailable" };

  const graded = data as { correct: number; total: number; key: unknown };
  const key = keySchema.safeParse(graded.key);
  if (!key.success) return { ok: false, reason: "unavailable" };
  const byPosition = new Map(key.data.map((k) => [k.position, k]));
  const results = questions.map((q, i) => {
    const k = byPosition.get(q.position);
    const your = parsed.data[i];
    return {
      questionId: q.id,
      your,
      correct: k?.correct ?? -1,
      isCorrect: your !== null && your === k?.correct,
      explanation: k?.explanation ?? undefined,
    };
  });

  // Aceeași regulă ca în submit_quiz: prima încercare după scor, a doua +1.
  const outlook = xpOutlook(quiz.xp, before ?? 0);
  const xp =
    outlook.kind === "first"
      ? Math.round((quiz.xp * graded.correct) / Math.max(1, graded.total))
      : outlook.max;

  revalidatePath("/", "layout");
  return {
    ok: true,
    correct: graded.correct,
    total: graded.total,
    results,
    xp,
  };
}
