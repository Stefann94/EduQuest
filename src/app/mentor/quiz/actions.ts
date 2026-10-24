"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { mentorClassIds } from "@/lib/db/classes";
import { db, isUuid } from "@/lib/db/core";
import { getMentorLessons } from "@/lib/db/lessons";
import { notifyClassStudents } from "@/lib/db/notify";
import { getQuizForEditor } from "@/lib/db/quizzes";

// Quiz-urile mentorului: pe o lecție sau pe mai multe (recapitulare), cu fiecare întrebare
// etichetată pe lecția pe care o verifică (de aici vine tabelul „elevi × lecții”).
// Nu există quiz-uri programate: un quiz dat clasei e disponibil imediat.

export type ActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; errors?: Record<string, string> };

function issues(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of error.issues) {
    const key = i.path.map(String).join(".") || "form";
    out[key] ??= i.message;
  }
  return out;
}

const refresh = () => {
  revalidatePath("/mentor", "layout");
  revalidatePath("/", "layout");
};

const questionSchema = z
  .object({
    prompt: z
      .string()
      .trim()
      .min(3, "Scrie întrebarea.")
      .max(500, "Întrebarea are cel mult 500 de caractere."),
    code: z.string().max(2000, "Codul are cel mult 2000 de caractere."),
    options: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Completează varianta.")
          .max(200, "Varianta are cel mult 200 de caractere."),
      )
      .min(2, "Cel puțin 2 variante.")
      .max(4, "Cel mult 4 variante."),
    correct: z.number({ error: "Alege varianta corectă." }).int().min(0),
    explanation: z
      .string()
      .trim()
      .max(600, "Explicația are cel mult 600 de caractere."),
    lessonId: z.string().nullable(),
  })
  .refine((q) => q.correct < q.options.length, {
    path: ["correct"],
    error: "Alege varianta corectă.",
  });

const quizSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Titlul are cel puțin 3 caractere.")
    .max(120, "Titlul are cel mult 120 de caractere."),
  description: z
    .string()
    .trim()
    .max(300, "Descrierea are cel mult 300 de caractere."),
  lessonIds: z.array(z.string().refine(isUuid)).max(30),
  xp: z
    .number()
    .int()
    .min(0, "XP-ul e între 0 și 5.")
    .max(5, "XP-ul e între 0 și 5."),
  timeLimitSec: z
    .number()
    .int()
    .min(30, "Cel puțin 30 de secunde.")
    .max(7200, "Cel mult 2 ore.")
    .nullable(),
  questions: z
    .array(questionSchema)
    .min(1, "Adaugă cel puțin o întrebare.")
    .max(40, "Cel mult 40 de întrebări."),
  classIds: z.array(z.string().refine(isUuid)).max(30),
});

export type QuizInput = z.input<typeof quizSchema>;

/** Creează sau modifică un quiz, cu întrebările, lecțiile și clasele cărora le e dat. */
export async function saveQuiz(
  id: string | null,
  input: QuizInput,
): Promise<ActionResult> {
  const me = await requireUser("mentor");
  const parsed = quizSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      message: "Verifică câmpurile marcate.",
      errors: issues(parsed.error),
    };
  const q = parsed.data;
  const existing =
    id && isUuid(id) ? await getQuizForEditor(me.id, id) : undefined;
  if (id && !existing)
    return { ok: false, message: "Quiz-ul nu mai există sau nu e al tău." };

  // Doar lecțiile proprii și doar clasele în care predă.
  const myLessons = new Set((await getMentorLessons(me.id)).map((l) => l.id));
  const lessonIds = q.lessonIds.filter((l) => myLessons.has(l));
  const myClasses = await mentorClassIds(me.id);
  const classIds = q.classIds.filter((c) => myClasses.includes(c));
  const lessonOf = (l: string | null) =>
    l && lessonIds.includes(l) ? l : null;

  const supabase = await db();
  const row = {
    title: q.title,
    description: q.description,
    kind: (lessonIds.length > 1 ? "recap" : "lesson") as "recap" | "lesson",
    xp: q.xp,
    time_limit_sec: q.timeLimitSec,
  };
  let quizId = existing?.id;
  if (existing) {
    const { error } = await supabase
      .from("quizzes")
      .update(row)
      .eq("id", existing.id);
    if (error) return { ok: false, message: "Quiz-ul nu s-a putut salva." };
  } else {
    const { data, error } = await supabase
      .from("quizzes")
      .insert({ ...row, author_id: me.id })
      .select("id")
      .single();
    if (error || !data)
      return { ok: false, message: "Quiz-ul nu s-a putut crea." };
    quizId = data.id;
  }
  if (!quizId) return { ok: false, message: "Quiz-ul nu s-a putut salva." };

  // Întrebările se rescriu în ordine (pozițiile 1…n); răspunsurile corecte separat.
  await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);
  const { data: inserted, error: qError } = await supabase
    .from("quiz_questions")
    .insert(
      q.questions.map((x, i) => ({
        quiz_id: quizId as string,
        position: i + 1,
        prompt: x.prompt,
        code: x.code.trim() ? x.code : null,
        options: x.options,
        lesson_id: lessonOf(x.lessonId),
      })),
    )
    .select("id, position");
  if (qError || !inserted)
    return { ok: false, message: "Întrebările nu s-au putut salva." };
  const byPos = new Map(inserted.map((r) => [r.position, r.id]));
  const { error: kError } = await supabase.from("quiz_answer_keys").insert(
    q.questions.map((x, i) => ({
      question_id: byPos.get(i + 1) as string,
      correct: x.correct,
      explanation: x.explanation || null,
    })),
  );
  if (kError)
    return { ok: false, message: "Răspunsurile corecte nu s-au putut salva." };

  await supabase.from("quiz_lessons").delete().eq("quiz_id", quizId);
  if (lessonIds.length)
    await supabase.from("quiz_lessons").insert(
      lessonIds.map((lesson_id) => ({
        quiz_id: quizId as string,
        lesson_id,
      })),
    );

  // Clasele: cele noi primesc quiz-ul (și o notificare); cele debifate îl pierd.
  const before = new Set(existing?.classIds ?? []);
  const added = classIds.filter((c) => !before.has(c));
  const removed = [...before].filter((c) => !classIds.includes(c));
  if (removed.length)
    await supabase
      .from("quiz_assignments")
      .delete()
      .eq("quiz_id", quizId)
      .in("class_id", removed);
  if (added.length) {
    await supabase
      .from("quiz_assignments")
      .insert(
        added.map((class_id) => ({ quiz_id: quizId as string, class_id })),
      );
    await notifyClassStudents(added, {
      kind: "assignment_new",
      title: `Quiz nou: ${q.title}`,
      body: `${q.questions.length} întrebări${q.xp > 0 ? ` · până la ${q.xp} XP` : ""}`,
      href: `/quiz/${quizId}`,
    });
  }

  refresh();
  if (!existing) redirect(`/mentor/quiz/${quizId}`);
  return { ok: true, message: "Quiz-ul a fost salvat.", id: quizId };
}

export async function deleteQuiz(id: string): Promise<ActionResult> {
  const me = await requireUser("mentor");
  const quiz = isUuid(id) ? await getQuizForEditor(me.id, id) : undefined;
  if (!quiz) return { ok: false, message: "Quiz-ul nu mai există." };
  const supabase = await db();
  const { error } = await supabase.from("quizzes").delete().eq("id", id);
  if (error) return { ok: false, message: "Quiz-ul nu s-a putut șterge." };
  refresh();
  redirect("/mentor/quiz");
}
