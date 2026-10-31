import "server-only";
import type { Database } from "@/lib/supabase/database.types";
import { getVisibleClasses } from "./classes";
import { db, isUuid, must, PERSON_FIELDS, type Person, toPerson } from "./core";
import { xpOutlook } from "./quiz-rules";

export type QuizKind = Database["public"]["Enums"]["quiz_kind"];

/** O întrebare fără răspunsul corect: singura formă care ajunge în browser înainte de trimitere. */
export type PublicQuestion = {
  id: string;
  position: number;
  prompt: string;
  code?: string;
  options: string[];
  /** Mai multe răspunsuri corecte: elevul le bifează pe toate (răspunsul e o mască). */
  multi: boolean;
  lessonId: string | null;
};

export type AttemptSummary = {
  count: number;
  best: number | null;
  last: number | null;
  total: number;
};

function summarizeAttempts(
  rows: { correct: number; total: number; at: string }[],
): AttemptSummary {
  const sorted = [...rows].sort((a, b) => a.at.localeCompare(b.at));
  return {
    count: rows.length,
    best: rows.length ? Math.max(...rows.map((r) => r.correct)) : null,
    last: sorted.at(-1)?.correct ?? null,
    total: sorted.at(-1)?.total ?? 0,
  };
}

/* ---------- Elev ---------- */

export type StudentQuiz = {
  id: string;
  title: string;
  description: string;
  kind: QuizKind;
  xp: number;
  questionCount: number;
  lessons: string[];
  classIds: string[];
  classNames: string[];
  assignedAt: string;
  attempts: AttemptSummary;
  /** Arhivat de mentor: nu mai poate fi rezolvat; rezultatele de până acum rămân. */
  archived: boolean;
};

const QUIZ_CARD_FIELDS = `id, title, description, kind, xp, time_limit_sec, course_id, archived,
  quiz_questions(count),
  quiz_lessons(lesson:lessons!quiz_lessons_lesson_id_fkey(title))`;

/** Quiz-urile date claselor elevului, cu încercările lui. */
export async function getStudentQuizzes(
  studentId: string,
): Promise<StudentQuiz[]> {
  const supabase = await db();
  const [classes, assigned, attempts] = await Promise.all([
    getVisibleClasses(),
    supabase
      .from("quiz_assignments")
      .select(
        `class_id, assigned_at, quiz:quizzes!quiz_assignments_quiz_id_fkey(${QUIZ_CARD_FIELDS})`,
      )
      .order("assigned_at", { ascending: false }),
    supabase
      .from("quiz_attempts")
      .select("quiz_id, correct, total, at")
      .eq("student_id", studentId),
  ]);
  const mine = new Map(
    classes
      .filter((c) => c.studentIds.includes(studentId))
      .map((c) => [c.id, c.name]),
  );
  const attemptRows = must("Încercările", attempts);
  const byQuiz = new Map<string, StudentQuiz>();
  for (const a of must("Quiz-urile", assigned)) {
    const className = mine.get(a.class_id);
    if (!className || !a.quiz) continue;
    const existing = byQuiz.get(a.quiz.id);
    if (existing) {
      existing.classIds.push(a.class_id);
      existing.classNames.push(className);
      continue;
    }
    byQuiz.set(a.quiz.id, {
      id: a.quiz.id,
      title: a.quiz.title,
      description: a.quiz.description,
      kind: a.quiz.kind,
      xp: a.quiz.xp,
      questionCount: a.quiz.quiz_questions[0]?.count ?? 0,
      lessons: a.quiz.quiz_lessons.flatMap((l) =>
        l.lesson ? [l.lesson.title] : [],
      ),
      classIds: [a.class_id],
      classNames: [className],
      assignedAt: a.assigned_at,
      attempts: summarizeAttempts(
        attemptRows.filter((t) => t.quiz_id === a.quiz?.id),
      ),
      archived: a.quiz.archived,
    });
  }
  return [...byQuiz.values()];
}

export type PracticeQuiz = {
  id: string;
  title: string;
  description: string;
  xp: number;
  questionCount: number;
  attempts: AttemptSummary;
};

/**
 * Quiz-urile de exersare din cursurile globale (pagina Quiz-uri), pentru toți elevii,
 * în ordinea capitolelor, cu încercările elevului.
 */
export async function getPracticeQuizzes(
  studentId: string,
): Promise<PracticeQuiz[]> {
  const supabase = await db();
  const [rows, attempts] = await Promise.all([
    supabase
      .from("quizzes")
      .select("id, title, description, xp, created_at, quiz_questions(count)")
      .eq("kind", "practice")
      .not("course_id", "is", null)
      .order("created_at")
      .order("title"),
    supabase
      .from("quiz_attempts")
      .select("quiz_id, correct, total, at")
      .eq("student_id", studentId),
  ]);
  const mine = must("Încercările", attempts);
  return must("Quiz-urile de exersare", rows).map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    xp: q.xp,
    questionCount: q.quiz_questions[0]?.count ?? 0,
    attempts: summarizeAttempts(mine.filter((a) => a.quiz_id === q.id)),
  }));
}

/** Quiz-ul pentru player: întrebările fără răspunsuri și câte încercări a făcut elevul. */
export async function getQuizForPlayer(studentId: string, id: string) {
  if (!isUuid(id)) return undefined;
  const supabase = await db();
  const { data: q } = await supabase
    .from("quizzes")
    .select(
      `id, title, description, kind, xp, time_limit_sec, course_id, archived,
       course:courses!quizzes_course_id_fkey(slug, title),
       quiz_questions(id, position, prompt, code, options, multi, lesson_id),
       quiz_lessons(lesson:lessons!quiz_lessons_lesson_id_fkey(title)),
       quiz_assignments(class_id)`,
    )
    .eq("id", id)
    .maybeSingle();
  if (!q) return undefined;
  const [classes, attempts] = await Promise.all([
    getVisibleClasses(),
    supabase
      .from("quiz_attempts")
      .select("correct, total, at")
      .eq("quiz_id", id)
      .eq("student_id", studentId),
  ]);
  const cls = classes.find(
    (c) =>
      c.studentIds.includes(studentId) &&
      q.quiz_assignments.some((a) => a.class_id === c.id),
  );
  const questions: PublicQuestion[] = [...q.quiz_questions]
    .sort((a, b) => a.position - b.position)
    .map((x) => ({
      id: x.id,
      position: x.position,
      prompt: x.prompt,
      code: x.code ?? undefined,
      options: x.options,
      multi: x.multi,
      lessonId: x.lesson_id,
    }));
  const summary = summarizeAttempts(must("Încercările", attempts));
  return {
    id: q.id,
    title: q.title,
    description: q.description,
    kind: q.kind,
    xp: q.xp,
    archived: q.archived,
    timeLimitSec: q.time_limit_sec ?? undefined,
    className: cls?.name,
    course: q.course
      ? { slug: q.course.slug, title: q.course.title }
      : undefined,
    lessons: q.quiz_lessons.flatMap((l) => (l.lesson ? [l.lesson.title] : [])),
    questions,
    attempts: summary,
    outlook: xpOutlook(q.xp, summary.count),
  };
}

export type PlayerQuiz = NonNullable<
  Awaited<ReturnType<typeof getQuizForPlayer>>
>;

/* ---------- Mentor ---------- */

export type MentorQuiz = {
  id: string;
  title: string;
  description: string;
  kind: QuizKind;
  /** Quiz live (jucat doar în sesiuni cu cod) sau pentru clase (rezolvat oricând). */
  live: boolean;
  /** Arhivat: în afara listelor active; nu se mai rezolvă și nu se mai joacă live. */
  archived: boolean;
  xp: number;
  createdAt: string;
  questionCount: number;
  lessons: { id: string; title: string }[];
  classes: { id: string; name: string; assignedAt: string }[];
  attempts: number;
};

const MENTOR_QUIZ_FIELDS = `id, title, description, kind, live, archived, xp, created_at,
  quiz_questions(count),
  quiz_lessons(lesson:lessons!quiz_lessons_lesson_id_fkey(id, title)),
  quiz_assignments(class_id, assigned_at),
  quiz_attempts(count)`;

/** Quiz-urile scrise de mentor (fără cele din cursurile globale). */
export async function getMentorQuizzes(
  mentorId: string,
): Promise<MentorQuiz[]> {
  const supabase = await db();
  const [classes, rows] = await Promise.all([
    getVisibleClasses(),
    supabase
      .from("quizzes")
      .select(MENTOR_QUIZ_FIELDS)
      .eq("author_id", mentorId)
      .is("course_id", null)
      .order("created_at", { ascending: false }),
  ]);
  const names = new Map(classes.map((c) => [c.id, c.name]));
  return must("Quiz-urile", rows).map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    kind: q.kind,
    live: q.live,
    archived: q.archived,
    xp: q.xp,
    createdAt: q.created_at,
    questionCount: q.quiz_questions[0]?.count ?? 0,
    lessons: q.quiz_lessons.flatMap((l) => (l.lesson ? [l.lesson] : [])),
    classes: q.quiz_assignments
      .map((a) => ({
        id: a.class_id,
        name: names.get(a.class_id) ?? "Clasă",
        assignedAt: a.assigned_at,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "ro")),
    attempts: q.quiz_attempts[0]?.count ?? 0,
  }));
}

export type EditorQuestion = {
  id: string;
  position: number;
  prompt: string;
  code: string;
  options: string[];
  /** Mai multe răspunsuri corecte: `correct` e atunci masca variantelor corecte. */
  multi: boolean;
  correct: number;
  explanation: string;
  lessonId: string | null;
  /** Timpul de răspuns, în secunde (doar în quiz-urile live). */
  timeSec: number;
};

/** Un quiz pentru editor, cu răspunsurile corecte (doar autorul are acces la ele). */
export async function getQuizForEditor(mentorId: string, id: string) {
  if (!isUuid(id)) return undefined;
  const supabase = await db();
  const { data: q } = await supabase
    .from("quizzes")
    .select(
      `id, title, description, kind, live, archived, xp, time_limit_sec,
       quiz_questions(id, position, prompt, code, options, multi, lesson_id, time_sec,
         quiz_answer_keys(correct, explanation)),
       quiz_lessons(lesson_id),
       quiz_assignments(class_id, assigned_at)`,
    )
    .eq("id", id)
    .eq("author_id", mentorId)
    .is("course_id", null)
    .maybeSingle();
  if (!q) return undefined;
  const questions: EditorQuestion[] = [...q.quiz_questions]
    .sort((a, b) => a.position - b.position)
    .map((x) => {
      const key = Array.isArray(x.quiz_answer_keys)
        ? x.quiz_answer_keys[0]
        : x.quiz_answer_keys;
      return {
        id: x.id,
        position: x.position,
        prompt: x.prompt,
        code: x.code ?? "",
        options: x.options,
        multi: x.multi,
        correct: key?.correct ?? (x.multi ? 1 : 0),
        explanation: key?.explanation ?? "",
        lessonId: x.lesson_id,
        timeSec: x.time_sec,
      };
    });
  return {
    id: q.id,
    title: q.title,
    description: q.description,
    kind: q.kind,
    live: q.live,
    archived: q.archived,
    xp: q.xp,
    timeLimitSec: q.time_limit_sec,
    questions,
    lessonIds: q.quiz_lessons.map((l) => l.lesson_id),
    classIds: q.quiz_assignments.map((a) => a.class_id),
  };
}

export type EditorQuiz = NonNullable<
  Awaited<ReturnType<typeof getQuizForEditor>>
>;

/** Tabelul „elevi × lecții”: cât a răspuns corect fiecare elev la întrebările fiecărei lecții. */
export async function getClassMastery(classId: string) {
  if (!isUuid(classId)) return { lessons: [], students: [] };
  const supabase = await db();
  const rows = must(
    "Analiza quiz-urilor",
    await supabase.rpc("class_quiz_mastery", { p_class: classId }),
  );
  const lessons = new Map<string, string>();
  const students = new Map<
    string,
    {
      id: string;
      name: string;
      cells: Map<string, { correct: number; total: number }>;
    }
  >();
  for (const r of rows) {
    lessons.set(r.lesson_id, r.lesson_title);
    const s = students.get(r.student_id) ?? {
      id: r.student_id,
      name: r.display_name,
      cells: new Map(),
    };
    s.cells.set(r.lesson_id, {
      correct: Number(r.correct),
      total: Number(r.total),
    });
    students.set(r.student_id, s);
  }
  return {
    lessons: [...lessons].map(([id, title]) => ({ id, title })),
    students: [...students.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "ro"),
    ),
  };
}

/* ---------- Sesiuni live ---------- */

export type LiveSession = {
  id: string;
  quizId: string;
  quizTitle: string;
  classId: string;
  className: string;
  title: string;
  code: string;
  status: Database["public"]["Enums"]["live_status"];
  createdAt: string;
  endedAt: string | null;
  results: { student: Person; score: number; rank: number; xp: number }[];
};

/** Sesiunile live din clasele contului (mentor sau elev), cele mai noi primele. */
export async function getLiveSessions(): Promise<LiveSession[]> {
  const supabase = await db();
  const [classes, rows] = await Promise.all([
    getVisibleClasses(),
    supabase
      .from("live_sessions")
      .select(
        `id, quiz_id, class_id, title, code, status, created_at, ended_at,
         quiz:quizzes!live_sessions_quiz_id_fkey(title),
         live_results(score, rank, xp, student:profiles!live_results_student_id_fkey(${PERSON_FIELDS}))`,
      )
      .order("created_at", { ascending: false }),
  ]);
  const names = new Map(classes.map((c) => [c.id, c.name]));
  return must("Sesiunile live", rows).map((s) => ({
    id: s.id,
    quizId: s.quiz_id,
    quizTitle: s.quiz?.title ?? s.title,
    classId: s.class_id,
    className: names.get(s.class_id) ?? "Clasă",
    title: s.title,
    code: s.code,
    status: s.status,
    createdAt: s.created_at,
    endedAt: s.ended_at,
    results: s.live_results
      .flatMap((r) =>
        r.student
          ? [
              {
                student: toPerson(r.student),
                score: r.score,
                rank: r.rank,
                xp: r.xp,
              },
            ]
          : [],
      )
      .sort((a, b) => a.rank - b.rank),
  }));
}

export async function getLiveSession(id: string) {
  if (!isUuid(id)) return undefined;
  return (await getLiveSessions()).find((s) => s.id === id);
}
