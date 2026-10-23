"use server";

import { z } from "zod";
import { fromLocalInput } from "@/components/mentor-content/drafts";
import {
  type FormState,
  invalid,
  json,
  text,
  toFieldErrors,
} from "@/components/mentor-content/form-state";
import { canEditContent } from "@/lib/data/mentor-content-queries";
import { getMentorClasses, getQuiz, getViewer } from "@/lib/data/queries";
import { plural } from "@/lib/format";

// Salvarea unui quiz (nou sau editat). În demo validează datele, fără să salveze.

const question = z.object({
  prompt: z.string().trim().min(3, "Scrie textul întrebării."),
  code: z.string(),
  options: z.array(z.string().trim()),
  correct: z.number().int().nullable(),
  explanation: z
    .string()
    .trim()
    .max(500, "Explicația are cel mult 500 de caractere."),
});

export async function saveQuiz(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const me = await getViewer("mentor");
  const { active } = await getMentorClasses(me.id);
  const id = text(formData, "id");

  if (id) {
    const existing = await getQuiz(me, id);
    if (!existing || !canEditContent(me.id, existing))
      return {
        status: "error",
        message: "Nu poți modifica acest quiz.",
        errors: {},
      };
  }

  const schema = z
    .object({
      title: z
        .string()
        .trim()
        .min(3, "Titlul are cel puțin 3 caractere.")
        .max(120, "Titlul are cel mult 120 de caractere."),
      description: z
        .string()
        .trim()
        .max(300, "Descrierea are cel mult 300 de caractere."),
      topic: z
        .string()
        .trim()
        .min(2, "Scrie tema, de exemplu „Python”.")
        .max(60, "Tema are cel mult 60 de caractere."),
      difficulty: z.enum(["1", "2", "3"], { error: "Alege dificultatea." }),
      scope: z.enum(["global", "class"], {
        error: "Alege unde este disponibil quiz-ul.",
      }),
      classId: z.string(),
      opensAt: z.string(),
      deadline: z.string(),
      maxAttempts: z.string(),
      xp: z.string(),
      timeLimit: z.string().trim(),
      timeUnit: z.enum(["sec", "min"]),
      questions: z
        .array(question, { error: "Întrebările nu au putut fi citite." })
        .min(1, "Adaugă cel puțin o întrebare.")
        .max(30, "Un quiz are cel mult 30 de întrebări."),
    })
    .superRefine((v, ctx) => {
      const add = (path: (string | number)[], message: string) =>
        ctx.addIssue({ code: "custom", path, message });

      if (v.scope === "class") {
        if (!active.some((c) => c.id === v.classId))
          add(["classId"], "Alege una dintre clasele tale active.");
        const opens = fromLocalInput(v.opensAt);
        const deadline = fromLocalInput(v.deadline);
        if (!opens) add(["opensAt"], "Alege de când este disponibil.");
        if (!deadline) add(["deadline"], "Alege termenul.");
        if (opens && deadline && deadline <= opens)
          add(["deadline"], "Termenul trebuie să fie după deschidere.");
        const attempts = Number(v.maxAttempts);
        if (!Number.isInteger(attempts) || attempts < 1 || attempts > 10)
          add(["maxAttempts"], "Alege între 1 și 10 încercări.");
        const xp = Number(v.xp);
        if (!Number.isInteger(xp) || xp < 0 || xp > 10)
          add(["xp"], "XP-ul este un număr întreg între 0 și 10.");
      }

      if (v.timeLimit) {
        const n = Number(v.timeLimit);
        const sec = v.timeUnit === "min" ? n * 60 : n;
        if (!Number.isFinite(n) || n <= 0)
          add(["timeLimit"], "Scrie un număr pozitiv sau lasă gol.");
        else if (sec < 10 || sec > 7200)
          add(["timeLimit"], "Limita este între 10 secunde și 120 de minute.");
      }

      v.questions.forEach((q, i) => {
        if (q.options.length < 2 || q.options.length > 4)
          add(["questions", i, "options"], "O întrebare are 2–4 variante.");
        q.options.forEach((o, j) => {
          if (!o) add(["questions", i, "options", j], "Completează varianta.");
        });
        if (
          q.correct === null ||
          q.correct < 0 ||
          q.correct >= q.options.length ||
          !q.options[q.correct]
        )
          add(["questions", i, "correct"], "Marchează răspunsul corect.");
      });
    });

  const parsed = schema.safeParse({
    title: text(formData, "title"),
    description: text(formData, "description"),
    topic: text(formData, "topic"),
    difficulty: text(formData, "difficulty"),
    scope: text(formData, "scope"),
    classId: text(formData, "classId"),
    opensAt: text(formData, "opensAt"),
    deadline: text(formData, "deadline"),
    maxAttempts: text(formData, "maxAttempts"),
    xp: text(formData, "xp"),
    timeLimit: text(formData, "timeLimit"),
    timeUnit: text(formData, "timeUnit") || "min",
    questions: json(formData, "questions"),
  });
  if (!parsed.success) return invalid(toFieldErrors(parsed.error));

  const v = parsed.data;
  const cls = active.find((c) => c.id === v.classId);
  const count = plural(v.questions.length, "întrebare", "întrebări");
  return {
    status: "success",
    message: id
      ? `Quiz-ul „${v.title}” a fost salvat (${count}).`
      : `Quiz-ul „${v.title}” a fost creat (${count}).`,
    detail:
      v.scope === "class" && cls
        ? `Elevii din ${cls.name} îl văd la data deschiderii și primesc o notificare. Demo: salvarea reală vine cu baza de date.`
        : "Este disponibil pentru exersare tuturor elevilor. Demo: salvarea reală vine cu baza de date.",
  };
}
