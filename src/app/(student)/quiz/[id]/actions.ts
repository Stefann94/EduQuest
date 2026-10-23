"use server";

import { z } from "zod";
import { getViewer } from "@/lib/data/queries";
import {
  type GradeResult,
  gradeQuiz,
} from "@/lib/data/student-activity-queries";

const answersSchema = z
  .array(z.number().int().min(0).max(9).nullable())
  .min(1)
  .max(100);

/**
 * Notează o încercare. Răspunsurile corecte și explicațiile ajung în browser
 * doar acum, după trimitere. În demo, încercarea nu se salvează.
 */
export async function submitQuiz(
  quizId: string,
  answers: (number | null)[],
): Promise<GradeResult> {
  const me = await getViewer("student");
  const parsed = answersSchema.safeParse(answers);
  if (!parsed.success || typeof quizId !== "string")
    return { ok: false, reason: "invalid" };
  return gradeQuiz(me, quizId, parsed.data);
}
