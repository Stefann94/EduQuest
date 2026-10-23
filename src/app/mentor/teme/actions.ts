"use server";

import { z } from "zod";
import { fromLocalInput } from "@/components/mentor-content/drafts";
import {
  type FormState,
  invalid,
  isLink,
  json,
  lines,
  text,
  toFieldErrors,
} from "@/components/mentor-content/form-state";
import {
  getMentorClasses,
  getSubmissionForMentor,
  getViewer,
} from "@/lib/data/queries";
import { now, plural } from "@/lib/format";

// Acțiunile pentru teme: creare și revizuirea trimiterilor.
// În demo validează datele și verifică accesul, fără să salveze nimic.

/** Bonusul maxim pentru calitate e fix, conform regulilor platformei (PROJECT.md §7.5). */
const MAX_BONUS_XP = 5;

export async function createAssignment(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const me = await getViewer("mentor");
  const { active } = await getMentorClasses(me.id);

  const schema = z.object({
    classId: z
      .string()
      .refine(
        (v) => active.some((c) => c.id === v),
        "Alege una dintre clasele tale active.",
      ),
    title: z
      .string()
      .trim()
      .min(3, "Titlul are cel puțin 3 caractere.")
      .max(120, "Titlul are cel mult 120 de caractere."),
    summary: z
      .string()
      .trim()
      .min(10, "Descrie tema într-o frază (cel puțin 10 caractere).")
      .max(300, "Descrierea are cel mult 300 de caractere."),
    instructions: z
      .array(
        z.string().max(300, "O instrucțiune are cel mult 300 de caractere."),
      )
      .min(1, "Scrie cel puțin o instrucțiune.")
      .max(15, "Folosește cel mult 15 instrucțiuni."),
    links: z
      .array(
        z.object({
          label: z.string().trim().min(2, "Scrie un nume pentru link."),
          url: z
            .string()
            .trim()
            .refine(
              isLink,
              "Introdu un link complet (https://…) sau o pagină din platformă (/invatare/…).",
            ),
        }),
        { error: "Linkurile nu au putut fi citite." },
      )
      .max(5, "Folosește cel mult 5 linkuri."),
    deadline: z
      .string()
      .refine(
        (v) => v === "" || fromLocalInput(v) !== null,
        "Alege o dată și o oră valide.",
      )
      .refine((v) => {
        const iso = v ? fromLocalInput(v) : null;
        return !iso || new Date(iso).getTime() > now().getTime();
      }, "Termenul trebuie să fie în viitor."),
    type: z.enum(["required", "optional"], {
      error: "Alege dacă tema este obligatorie sau opțională.",
    }),
    intent: z.enum(["publish", "draft"]),
  });

  const parsed = schema.safeParse({
    classId: text(formData, "classId"),
    title: text(formData, "title"),
    summary: text(formData, "summary"),
    instructions: lines(text(formData, "instructions")),
    links: json(formData, "links"),
    deadline: text(formData, "deadline"),
    type: text(formData, "type"),
    intent: text(formData, "intent") || "draft",
  });
  if (!parsed.success) return invalid(toFieldErrors(parsed.error));

  const v = parsed.data;
  const cls = active.find((c) => c.id === v.classId);
  const students = cls?.studentIds.length ?? 0;
  if (v.intent === "publish")
    return {
      status: "success",
      message: `Tema „${v.title}” a fost publicată.`,
      detail: `${plural(students, "elev", "elevi")} din ${cls?.name} ${students === 1 ? "primește" : "primesc"} o notificare. Demo: salvarea reală vine cu baza de date.`,
    };
  return {
    status: "success",
    message: `Tema „${v.title}” a fost salvată ca ciornă.`,
    detail:
      "Elevii nu o văd până nu o publici. Demo: salvarea reală vine cu baza de date.",
  };
}

export async function reviewSubmission(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const me = await getViewer("mentor");
  const found = await getSubmissionForMentor(
    me.id,
    text(formData, "submissionId"),
  );
  if (!found || found.assignment.id !== text(formData, "assignmentId"))
    return {
      status: "error",
      message: "Nu ai acces la această trimitere.",
      errors: {},
    };

  const { assignment, student } = found;
  const max = Math.min(assignment.maxBonusXp, MAX_BONUS_XP);
  const schema = z
    .object({
      decision: z.enum(["reviewed", "needs_changes"]),
      feedback: z
        .string()
        .trim()
        .max(2000, "Feedback-ul are cel mult 2000 de caractere."),
      bonusXp: z
        .number({ error: "Alege bonusul de calitate." })
        .int()
        .min(0, "Bonusul este între 0 și 5 XP.")
        .max(max, `Bonusul este între 0 și ${max} XP.`),
    })
    .superRefine((v, ctx) => {
      if (v.decision === "needs_changes" && v.feedback.length < 10)
        ctx.addIssue({
          code: "custom",
          path: ["feedback"],
          message:
            "Scrie ce trebuie corectat, ca elevul să știe ce să schimbe (cel puțin 10 caractere).",
        });
      if (v.decision === "needs_changes" && !assignment.allowResubmit)
        ctx.addIssue({
          code: "custom",
          path: ["decision"],
          message: "Tema nu permite retrimiteri, deci nu poți cere corecturi.",
        });
    });

  const rawBonus = text(formData, "bonusXp");
  const parsed = schema.safeParse({
    decision: text(formData, "decision"),
    feedback: text(formData, "feedback"),
    bonusXp: rawBonus === "" ? Number.NaN : Number(rawBonus),
  });
  if (!parsed.success) return invalid(toFieldErrors(parsed.error));

  const first = student.displayName.split(" ")[0];
  const v = parsed.data;
  if (v.decision === "needs_changes")
    return {
      status: "success",
      message: `Ai cerut corecturi de la ${first}.`,
      detail: `${first} primește feedback-ul și o notificare, apoi poate retrimite tema. Demo: salvarea reală vine cu baza de date.`,
    };
  return {
    status: "success",
    message: `Trimiterea lui ${first} a fost marcată ca revizuită.`,
    detail: `${first} primește feedback-ul${v.bonusXp > 0 ? ` și +${v.bonusXp} XP bonus` : ""}. Demo: salvarea reală vine cu baza de date.`,
  };
}
