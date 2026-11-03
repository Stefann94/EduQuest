"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db, isUuid } from "@/lib/db/core";
import { xpOutlook } from "@/lib/db/quiz-rules";
import { answerCredit } from "@/lib/quiz-answers";

// Un index (întrebare simplă) sau masca variantelor bifate (întrebare cu mai multe
// răspunsuri corecte, cel mult 6 variante → cel mult 2^6 − 1).
const answersSchema = z
  .array(z.number().int().min(0).max(63).nullable())
  .min(1)
  .max(100);

export type QuestionResult = {
  questionId: string;
  /** Indexul variantei sau, la o întrebare cu mai multe răspunsuri, masca lor. */
  your: number | null;
  correct: number;
  isCorrect: boolean;
  /** Cât valorează răspunsul (0…1): la mai multe răspunsuri corecte poate fi parțial. */
  credit: number;
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
      supabase
        .from("quizzes")
        .select("xp, required, deadline")
        .eq("id", quizId)
        .maybeSingle(),
      supabase
        .from("quiz_questions")
        .select("id, position, options, multi")
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
      credit: k ? answerCredit(k.correct, your, q.options.length, q.multi) : 0,
      explanation: k?.explanation ?? undefined,
    };
  });

  // Aceeași regulă ca în submit_quiz: prima încercare după scor, a doua +1.
  const outlook = xpOutlook(quiz.xp, before ?? 0);
  // După termenul unui quiz obligatoriu nu se mai dă XP (la fel ca în submit_quiz).
  const late =
    quiz.required && !!quiz.deadline && Date.parse(quiz.deadline) < Date.now();
  const xp = late
    ? 0
    : outlook.kind === "first"
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
