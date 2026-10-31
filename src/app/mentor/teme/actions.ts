"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { localToIso } from "@/components/mentor-classes/dates";
import { requireUser } from "@/lib/auth";
import { mentorClassIds } from "@/lib/db/classes";
import { db, isUuid } from "@/lib/db/core";
import { getHomeworkForMentor } from "@/lib/db/homework";
import { notifyClassStudents } from "@/lib/db/notify";

// Temele mentorului: o temă are una sau mai multe probleme (obligatorii sau opționale),
// e refolosibilă și se dă mai multor clase, fiecare cu termenul ei.

export type ActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; errors?: Record<string, string> };

const NOT_FOUND: ActionResult = {
  ok: false,
  message: "Tema nu mai există sau nu ai acces la ea.",
};

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

async function ownHomework(id: string) {
  const me = await requireUser("mentor");
  const homework = isUuid(id)
    ? await getHomeworkForMentor(me.id, id)
    : undefined;
  return homework ? { me, homework } : undefined;
}

const LANGUAGES = [
  "python",
  "html",
  "css",
  "javascript",
  "java",
  "json",
  "text",
] as const;

const homeworkSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Titlul are cel puțin 3 caractere.")
    .max(120, "Titlul are cel mult 120 de caractere."),
  description: z
    .string()
    .trim()
    .max(1000, "Descrierea are cel mult 1000 de caractere."),
  required: z.boolean(),
  problems: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z
          .string()
          .trim()
          .min(2, "Dă un titlu problemei.")
          .max(120, "Titlul are cel mult 120 de caractere."),
        statement: z
          .string()
          .trim()
          .min(10, "Scrie enunțul (cel puțin 10 caractere).")
          .max(10_000, "Enunțul e prea lung."),
        language: z.enum(LANGUAGES),
        starter: z.string().max(5000, "Codul de pornire e prea lung."),
        required: z.boolean(),
      }),
    )
    .min(1, "O temă are cel puțin o problemă.")
    .max(20, "O temă are cel mult 20 de probleme."),
});

export type HomeworkInput = z.input<typeof homeworkSchema>;

/** Creează sau modifică o temă cu problemele ei (în ordinea din formular). */
export async function saveHomework(
  id: string | null,
  input: HomeworkInput,
  /** Tema nouă creată din tabul „Teme” al unei clase: se dă direct clasei, cu termenul ales. */
  forClass?: { classId: string; deadline: string },
): Promise<ActionResult> {
  const me = await requireUser("mentor");
  const parsed = homeworkSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      message: "Verifică câmpurile marcate.",
      errors: issues(parsed.error),
    };
  const existing = id ? (await ownHomework(id))?.homework : undefined;
  if (id && !existing) return NOT_FOUND;

  const supabase = await db();
  let homeworkId = existing?.id;
  if (existing) {
    const { error } = await supabase
      .from("homeworks")
      .update({
        title: parsed.data.title,
        description: parsed.data.description,
        required: parsed.data.required,
      })
      .eq("id", existing.id);
    if (error) return { ok: false, message: "Tema nu s-a putut salva." };
  } else {
    const { data, error } = await supabase
      .from("homeworks")
      .insert({
        author_id: me.id,
        title: parsed.data.title,
        description: parsed.data.description,
        required: parsed.data.required,
      })
      .select("id")
      .single();
    if (error || !data)
      return { ok: false, message: "Tema nu s-a putut crea." };
    homeworkId = data.id;
  }
  if (!homeworkId) return NOT_FOUND;

  // Problemele scoase din formular: le ștergem doar dacă nu au trimiteri (ar dispărea munca elevilor).
  const keep = new Set(
    parsed.data.problems.flatMap((p) => (p.id ? [p.id] : [])),
  );
  const removed = (existing?.problems ?? []).filter((p) => !keep.has(p.id));
  if (removed.length) {
    const { count } = await supabase
      .from("problem_submissions")
      .select("id", { count: "exact", head: true })
      .in(
        "problem_id",
        removed.map((p) => p.id),
      );
    if ((count ?? 0) > 0)
      return {
        ok: false,
        message:
          "Unele probleme scoase au deja rezolvări trimise de elevi. Păstrează-le sau arhivează tema.",
      };
    await supabase
      .from("homework_problems")
      .delete()
      .in(
        "id",
        removed.map((p) => p.id),
      );
  }
  for (const [position, p] of parsed.data.problems.entries()) {
    const row = {
      homework_id: homeworkId,
      position,
      title: p.title,
      statement: p.statement,
      language: p.language,
      starter: p.starter || null,
      required: p.required,
    };
    const known = p.id && existing?.problems.some((x) => x.id === p.id);
    const { error } = known
      ? await supabase
          .from("homework_problems")
          .update(row)
          .eq("id", p.id as string)
      : await supabase.from("homework_problems").insert(row);
    if (error)
      return { ok: false, message: "Problemele nu s-au putut salva toate." };
  }
  refresh();
  if (!existing && forClass) {
    const r = await assignHomework(
      homeworkId,
      [forClass.classId],
      forClass.deadline,
    );
    if (!r.ok)
      return {
        ok: false,
        message: `Tema s-a creat, dar nu s-a putut da clasei: ${r.message}`,
        errors: r.errors,
      };
    redirect(`/mentor/clase/${forClass.classId}/teme`);
  }
  if (!existing) redirect(`/mentor/teme/${homeworkId}?nou=1`);
  return { ok: true, message: "Tema a fost salvată.", id: homeworkId };
}

const deadlineSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Alege data și ora termenului.")
  .or(z.literal(""));

/** Dă tema mai multor clase deodată, cu același termen (se poate schimba apoi pe fiecare). */
export async function assignHomework(
  homeworkId: string,
  classIds: string[],
  deadline: string,
): Promise<ActionResult> {
  const owned = await ownHomework(homeworkId);
  if (!owned) return NOT_FOUND;
  const d = deadlineSchema.safeParse(deadline);
  if (!d.success)
    return {
      ok: false,
      message: d.error.issues[0].message,
      errors: { deadline: d.error.issues[0].message },
    };
  const mine = await mentorClassIds(owned.me.id);
  const already = new Set(owned.homework.assignments.map((a) => a.classId));
  const targets = classIds.filter((c) => mine.includes(c) && !already.has(c));
  if (targets.length === 0)
    return { ok: false, message: "Alege cel puțin o clasă nouă." };
  const iso = d.data ? localToIso(d.data.slice(0, 10), d.data.slice(11)) : null;
  if (iso && Date.parse(iso) < Date.now())
    return {
      ok: false,
      message: "Termenul e în trecut.",
      errors: { deadline: "Termenul e în trecut." },
    };

  const supabase = await db();
  const { data, error } = await supabase
    .from("homework_assignments")
    .insert(
      targets.map((class_id) => ({
        homework_id: homeworkId,
        class_id,
        deadline: iso,
      })),
    )
    .select("id, class_id");
  if (error || !data)
    return { ok: false, message: "Tema nu s-a putut da claselor alese." };
  for (const a of data)
    await notifyClassStudents([a.class_id], {
      kind: "assignment_new",
      title: `Temă nouă: ${owned.homework.title}`,
      body: `${owned.homework.problems.length === 1 ? "O problemă" : `${owned.homework.problems.length} probleme`}${iso ? " · are termen" : ""}`,
      href: `/teme/${a.id}`,
    });
  refresh();
  return {
    ok: true,
    message:
      targets.length === 1
        ? "Tema a fost dată clasei."
        : `Tema a fost dată la ${targets.length} clase.`,
  };
}

export async function updateDeadline(
  assignmentId: string,
  deadline: string,
): Promise<ActionResult> {
  const me = await requireUser("mentor");
  const d = deadlineSchema.safeParse(deadline);
  if (!d.success || !isUuid(assignmentId))
    return { ok: false, message: "Alege data și ora termenului." };
  const iso = d.data ? localToIso(d.data.slice(0, 10), d.data.slice(11)) : null;
  const supabase = await db();
  const { data, error } = await supabase
    .from("homework_assignments")
    .update({ deadline: iso })
    .eq("id", assignmentId)
    .select("id, class_id");
  if (
    error ||
    !data?.length ||
    !(await mentorClassIds(me.id)).includes(data[0].class_id)
  )
    return { ok: false, message: "Termenul nu s-a putut schimba." };
  refresh();
  return {
    ok: true,
    message: iso ? "Termenul a fost schimbat." : "Tema nu mai are termen.",
  };
}

/** Retrage tema dintr-o clasă, doar dacă niciun elev nu a trimis încă nimic. */
export async function unassignHomework(
  assignmentId: string,
): Promise<ActionResult> {
  await requireUser("mentor");
  if (!isUuid(assignmentId)) return NOT_FOUND;
  const supabase = await db();
  const { count } = await supabase
    .from("problem_submissions")
    .select("id", { count: "exact", head: true })
    .eq("assignment_id", assignmentId);
  if ((count ?? 0) > 0)
    return {
      ok: false,
      message:
        "Elevii au trimis deja rezolvări. Arhivează tema în loc s-o retragi.",
    };
  const { error } = await supabase
    .from("homework_assignments")
    .delete()
    .eq("id", assignmentId);
  if (error) return { ok: false, message: "Tema nu s-a putut retrage." };
  refresh();
  return { ok: true, message: "Tema a fost retrasă din clasă." };
}

/** Arhivarea o scoate din panoul mentorului; elevii o văd în continuare în arhiva lor. */
export async function setHomeworkArchived(
  homeworkId: string,
  archived: boolean,
): Promise<ActionResult> {
  const owned = await ownHomework(homeworkId);
  if (!owned) return NOT_FOUND;
  const supabase = await db();
  const { error } = await supabase
    .from("homeworks")
    .update({ archived })
    .eq("id", homeworkId);
  if (error) return { ok: false, message: "Modificarea nu s-a putut salva." };
  refresh();
  return {
    ok: true,
    message: archived ? "Tema a fost arhivată." : "Tema e din nou activă.",
  };
}

export async function deleteHomework(
  homeworkId: string,
): Promise<ActionResult> {
  const owned = await ownHomework(homeworkId);
  if (!owned) return NOT_FOUND;
  if (owned.homework.assignments.some((a) => a.complete > 0 || a.waiting > 0))
    return {
      ok: false,
      message: "Tema are rezolvări trimise. Arhiveaz-o în loc s-o ștergi.",
    };
  const supabase = await db();
  const { count } = await supabase
    .from("problem_submissions")
    .select("id", { count: "exact", head: true })
    .in(
      "problem_id",
      owned.homework.problems.map((p) => p.id),
    );
  if ((count ?? 0) > 0)
    return {
      ok: false,
      message: "Tema are rezolvări trimise. Arhiveaz-o în loc s-o ștergi.",
    };
  const { error } = await supabase
    .from("homeworks")
    .delete()
    .eq("id", homeworkId);
  if (error) return { ok: false, message: "Tema nu s-a putut șterge." };
  refresh();
  redirect("/mentor/teme");
}

/* ---------- Evaluare ---------- */

const reviewSchema = z.object({
  status: z.enum(["accepted", "needs_changes"]),
  feedback: z
    .string()
    .trim()
    .max(3000, "Feedbackul are cel mult 3000 de caractere."),
});

/** Evaluarea unei probleme trimise: acceptată sau de refăcut, cu feedback (review_problem). */
export async function reviewProblem(
  submissionId: string,
  input: { status: string; feedback: string },
): Promise<ActionResult> {
  await requireUser("mentor");
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success || !isUuid(submissionId))
    return { ok: false, message: "Alege „Acceptată” sau „De refăcut”." };
  if (parsed.data.status === "needs_changes" && parsed.data.feedback.length < 5)
    return {
      ok: false,
      message: "Spune-i elevului ce are de refăcut.",
      errors: {
        feedback: "Spune-i elevului ce are de refăcut (cel puțin 5 caractere).",
      },
    };
  const supabase = await db();
  const { error } = await supabase.rpc("review_problem", {
    p_submission: submissionId,
    p_status: parsed.data.status,
    p_feedback: parsed.data.feedback,
  });
  if (error) return { ok: false, message: "Evaluarea nu s-a putut salva." };
  refresh();
  return {
    ok: true,
    message:
      parsed.data.status === "accepted"
        ? "Problema a fost acceptată."
        : "Elevul a primit cererea de refacere.",
  };
}

/** Bonusul de calitate pe toată tema (0 – maximul temei); se corectează, nu se adună. */
export async function setHomeworkBonus(
  assignmentId: string,
  studentId: string,
  input: { bonus: number; note: string },
): Promise<ActionResult> {
  await requireUser("mentor");
  const bonus = z.number().int().min(0).max(5).safeParse(input.bonus);
  if (!bonus.success || !isUuid(assignmentId) || !isUuid(studentId))
    return { ok: false, message: "Bonusul e între 0 și 5 XP." };
  const supabase = await db();
  const { error } = await supabase.rpc("set_homework_bonus", {
    p_assignment: assignmentId,
    p_student: studentId,
    p_bonus: bonus.data,
    p_note: input.note.trim().slice(0, 1000),
  });
  if (error) return { ok: false, message: "Bonusul nu s-a putut salva." };
  refresh();
  return {
    ok: true,
    message:
      bonus.data > 0
        ? `Bonus de calitate: +${bonus.data} XP.`
        : "Bonusul a fost scos.",
  };
}
