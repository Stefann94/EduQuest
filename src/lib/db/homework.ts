import "server-only";
import type { Database } from "@/lib/supabase/database.types";
import { getVisibleClasses } from "./classes";
import { db, isUuid, must, PERSON_FIELDS, type Person, toPerson } from "./core";

export type ProblemStatus = Database["public"]["Enums"]["problem_status"];
/** Starea unei probleme pentru un elev: ca în baza de date, plus „netrimisă”. */
export type ProblemState = ProblemStatus | "not_started";

export type HomeworkProblem = {
  id: string;
  position: number;
  title: string;
  statement: string;
  language: string;
  starter: string | null;
  required: boolean;
};

export type ProblemAttempt = {
  id: string;
  at: string;
  code: string;
  late: boolean;
};

export type ProblemWork = HomeworkProblem & {
  state: ProblemState;
  submissionId?: string;
  feedback?: { text: string; at: string };
  attempts: ProblemAttempt[];
};

const PROBLEM_FIELDS =
  "id, position, title, statement, language, starter, required";

const byPosition = (a: { position: number }, b: { position: number }) =>
  a.position - b.position;

/* ---------- Elev ---------- */

export type StudentHomework = {
  /** Id-ul atribuirii (tema dată unei clase); apare în URL: /teme/<id>. */
  id: string;
  homeworkId: string;
  title: string;
  description: string;
  required: boolean;
  classId: string;
  className: string;
  deadline: string | null;
  assignedAt: string;
  maxBonusXp: number;
  problems: {
    id: string;
    title: string;
    required: boolean;
    state: ProblemState;
  }[];
  /** Probleme obligatorii trimise / total obligatorii (sau toate, dacă tema e opțională). */
  progress: { done: number; total: number };
  complete: boolean;
  overdue: boolean;
  bonusXp: number | null;
};

type SubRow = {
  id: string;
  assignment_id: string;
  problem_id: string;
  status: ProblemStatus;
  feedback: string | null;
  feedback_at: string | null;
};

function progressOf(problems: { required: boolean; state: ProblemState }[]) {
  const counted = problems.some((p) => p.required)
    ? problems.filter((p) => p.required)
    : problems;
  const done = counted.filter((p) => p.state !== "not_started").length;
  return { done, total: counted.length };
}

/** Temele din clasele elevului, cu progresul lui, cele mai urgente primele. */
export async function getStudentHomework(
  studentId: string,
): Promise<StudentHomework[]> {
  const supabase = await db();
  const [classes, assignments, subs, reviews] = await Promise.all([
    getVisibleClasses(),
    supabase.from("homework_assignments").select(
      `id, class_id, deadline, assigned_at, max_bonus_xp,
         homework:homeworks!homework_assignments_homework_id_fkey(id, title, description, required,
           problems:homework_problems(id, position, title, required))`,
    ),
    supabase
      .from("problem_submissions")
      .select("id, assignment_id, problem_id, status, feedback, feedback_at")
      .eq("student_id", studentId),
    supabase
      .from("homework_reviews")
      .select("assignment_id, bonus_xp")
      .eq("student_id", studentId),
  ]);
  const mine = new Map(
    classes
      .filter((c) => c.studentIds.includes(studentId))
      .map((c) => [c.id, c]),
  );
  const subOf = new Map(
    (must("Trimiterile", subs) as SubRow[]).map((s) => [
      `${s.assignment_id}:${s.problem_id}`,
      s,
    ]),
  );
  const bonus = new Map(
    must("Evaluările", reviews).map((r) => [r.assignment_id, r.bonus_xp]),
  );
  const now = Date.now();

  return must("Temele", assignments)
    .flatMap((a) => {
      const cls = mine.get(a.class_id);
      if (!cls || !a.homework) return [];
      const problems = [...a.homework.problems].sort(byPosition).map((p) => ({
        id: p.id,
        title: p.title,
        required: p.required,
        state: (subOf.get(`${a.id}:${p.id}`)?.status ??
          "not_started") as ProblemState,
      }));
      const progress = progressOf(problems);
      const complete = progress.done === progress.total;
      return [
        {
          id: a.id,
          homeworkId: a.homework.id,
          title: a.homework.title,
          description: a.homework.description,
          required: a.homework.required,
          classId: a.class_id,
          className: cls.name,
          deadline: a.deadline,
          assignedAt: a.assigned_at,
          maxBonusXp: a.max_bonus_xp,
          problems,
          progress,
          complete,
          overdue: !complete && !!a.deadline && Date.parse(a.deadline) < now,
          bonusXp: bonus.get(a.id) ?? null,
        },
      ];
    })
    .sort(
      (x, y) =>
        (x.deadline ?? "9999").localeCompare(y.deadline ?? "9999") ||
        x.title.localeCompare(y.title, "ro"),
    );
}

/** O temă cu toate problemele, trimiterile, încercările și feedbackul elevului. */
export async function getStudentAssignment(
  studentId: string,
  assignmentId: string,
) {
  if (!isUuid(assignmentId)) return undefined;
  const supabase = await db();
  const { data: a } = await supabase
    .from("homework_assignments")
    .select(
      `id, class_id, deadline, assigned_at, max_bonus_xp,
       homework:homeworks!homework_assignments_homework_id_fkey(id, title, description, required,
         problems:homework_problems(${PROBLEM_FIELDS}))`,
    )
    .eq("id", assignmentId)
    .maybeSingle();
  if (!a?.homework) return undefined;
  const cls = (await getVisibleClasses()).find(
    (c) => c.id === a.class_id && c.studentIds.includes(studentId),
  );
  if (!cls) return undefined;

  const [subs, review] = await Promise.all([
    supabase
      .from("problem_submissions")
      .select(
        "id, assignment_id, problem_id, status, feedback, feedback_at, problem_attempts(id, at, code, late)",
      )
      .eq("assignment_id", a.id)
      .eq("student_id", studentId),
    supabase
      .from("homework_reviews")
      .select("bonus_xp, note, reviewed_at")
      .eq("assignment_id", a.id)
      .eq("student_id", studentId)
      .maybeSingle(),
  ]);
  const subOf = new Map(
    must("Trimiterile", subs).map((s) => [s.problem_id, s]),
  );
  const problems: ProblemWork[] = [...a.homework.problems]
    .sort(byPosition)
    .map((p) => {
      const s = subOf.get(p.id);
      return {
        ...p,
        state: s?.status ?? "not_started",
        submissionId: s?.id,
        feedback:
          s?.feedback && s.feedback_at
            ? { text: s.feedback, at: s.feedback_at }
            : undefined,
        attempts: [...(s?.problem_attempts ?? [])].sort((x, y) =>
          y.at.localeCompare(x.at),
        ),
      };
    });
  const progress = progressOf(problems);
  return {
    id: a.id,
    homeworkId: a.homework.id,
    title: a.homework.title,
    description: a.homework.description,
    required: a.homework.required,
    classId: cls.id,
    className: cls.name,
    classArchived: cls.status === "archived",
    mentor: cls.mentor,
    deadline: a.deadline,
    assignedAt: a.assigned_at,
    maxBonusXp: a.max_bonus_xp,
    problems,
    progress,
    complete: progress.done === progress.total,
    overdue: !!a.deadline && Date.parse(a.deadline) < Date.now(),
    review: review.data
      ? {
          bonusXp: review.data.bonus_xp,
          note: review.data.note,
          at: review.data.reviewed_at,
        }
      : null,
  };
}

export type StudentAssignmentDetail = NonNullable<
  Awaited<ReturnType<typeof getStudentAssignment>>
>;

/* ---------- Mentor ---------- */

export type MentorHomework = {
  id: string;
  title: string;
  description: string;
  required: boolean;
  archived: boolean;
  createdAt: string;
  problems: HomeworkProblem[];
  assignments: {
    id: string;
    classId: string;
    className: string;
    deadline: string | null;
    students: number;
    /** Elevi care au trimis toate problemele obligatorii. */
    complete: number;
    /** Probleme trimise care așteaptă evaluare. */
    waiting: number;
  }[];
};

const MENTOR_HOMEWORK_FIELDS = `id, title, description, required, archived, created_at,
  problems:homework_problems(${PROBLEM_FIELDS}),
  homework_assignments(id, class_id, deadline,
    problem_submissions(student_id, problem_id, status))`;

type MentorHomeworkRow = {
  id: string;
  title: string;
  description: string;
  required: boolean;
  archived: boolean;
  created_at: string;
  problems: HomeworkProblem[];
  homework_assignments: {
    id: string;
    class_id: string;
    deadline: string | null;
    problem_submissions: {
      student_id: string;
      problem_id: string;
      status: ProblemStatus;
    }[];
  }[];
};

async function toMentorHomework(r: MentorHomeworkRow): Promise<MentorHomework> {
  const classes = await getVisibleClasses();
  const problems = [...r.problems].sort(byPosition);
  const counted = problems.some((p) => p.required)
    ? problems.filter((p) => p.required)
    : problems;
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    required: r.required,
    archived: r.archived,
    createdAt: r.created_at,
    problems,
    assignments: r.homework_assignments
      .map((a) => {
        const cls = classes.find((c) => c.id === a.class_id);
        const byStudent = new Map<string, Set<string>>();
        for (const s of a.problem_submissions) {
          const set = byStudent.get(s.student_id) ?? new Set();
          set.add(s.problem_id);
          byStudent.set(s.student_id, set);
        }
        return {
          id: a.id,
          classId: a.class_id,
          className: cls?.name ?? "Clasă",
          deadline: a.deadline,
          students: cls?.studentIds.length ?? 0,
          complete: [...byStudent.values()].filter((set) =>
            counted.every((p) => set.has(p.id)),
          ).length,
          waiting: a.problem_submissions.filter((s) => s.status === "submitted")
            .length,
        };
      })
      .sort((x, y) => x.className.localeCompare(y.className, "ro")),
  };
}

/** Temele scrise de mentor (refolosibile), cele mai noi primele. */
export async function getMentorHomeworks(
  mentorId: string,
): Promise<MentorHomework[]> {
  const supabase = await db();
  const rows = must(
    "Temele",
    await supabase
      .from("homeworks")
      .select(MENTOR_HOMEWORK_FIELDS)
      .eq("author_id", mentorId)
      .order("created_at", { ascending: false }),
  ) as MentorHomeworkRow[];
  return Promise.all(rows.map(toMentorHomework));
}

export async function getHomeworkForMentor(mentorId: string, id: string) {
  if (!isUuid(id)) return undefined;
  const supabase = await db();
  const { data } = await supabase
    .from("homeworks")
    .select(MENTOR_HOMEWORK_FIELDS)
    .eq("id", id)
    .eq("author_id", mentorId)
    .maybeSingle();
  return data ? toMentorHomework(data as MentorHomeworkRow) : undefined;
}

export type StudentProgressRow = {
  student: Person;
  problems: Record<string, ProblemState>;
  done: number;
  total: number;
  lastAt: string | null;
  late: boolean;
  bonusXp: number | null;
};

/** O temă dată unei clase: fiecare elev, cu starea fiecărei probleme. */
export async function getAssignmentProgress(
  mentorId: string,
  assignmentId: string,
) {
  if (!isUuid(assignmentId)) return undefined;
  const supabase = await db();
  const { data: a } = await supabase
    .from("homework_assignments")
    .select(
      `id, class_id, deadline, max_bonus_xp, homework_id,
       homework:homeworks!homework_assignments_homework_id_fkey(author_id, title, problems:homework_problems(${PROBLEM_FIELDS}))`,
    )
    .eq("id", assignmentId)
    .maybeSingle();
  const cls = (await getVisibleClasses()).find((c) => c.id === a?.class_id);
  if (!a?.homework || !cls || cls.mentorId !== mentorId) return undefined;

  const [subs, reviews] = await Promise.all([
    supabase
      .from("problem_submissions")
      .select(
        "student_id, problem_id, status, updated_at, problem_attempts(late)",
      )
      .eq("assignment_id", a.id),
    supabase
      .from("homework_reviews")
      .select("student_id, bonus_xp")
      .eq("assignment_id", a.id),
  ]);
  const problems = [...a.homework.problems].sort(byPosition);
  const counted = problems.some((p) => p.required)
    ? problems.filter((p) => p.required)
    : problems;
  const bonus = new Map(
    must("Evaluările", reviews).map((r) => [r.student_id, r.bonus_xp]),
  );
  const subRows = must("Trimiterile", subs);
  const rows: StudentProgressRow[] = cls.students.map((student) => {
    const own = subRows.filter((s) => s.student_id === student.id);
    const states: Record<string, ProblemState> = {};
    for (const p of problems)
      states[p.id] =
        own.find((s) => s.problem_id === p.id)?.status ?? "not_started";
    return {
      student,
      problems: states,
      done: counted.filter((p) => states[p.id] !== "not_started").length,
      total: counted.length,
      lastAt:
        own
          .map((s) => s.updated_at)
          .sort()
          .at(-1) ?? null,
      late: own.some((s) => s.problem_attempts.some((t) => t.late)),
      bonusXp: bonus.get(student.id) ?? null,
    };
  });
  return {
    id: a.id,
    homeworkId: a.homework_id,
    title: a.homework.title,
    classId: cls.id,
    className: cls.name,
    deadline: a.deadline,
    maxBonusXp: a.max_bonus_xp,
    problems,
    rows,
  };
}

/** Lucrarea unui elev la o temă, pentru evaluare: probleme, încercări, feedback, bonus. */
export async function getStudentWorkForMentor(
  mentorId: string,
  assignmentId: string,
  studentId: string,
) {
  if (!isUuid(assignmentId) || !isUuid(studentId)) return undefined;
  const progress = await getAssignmentProgress(mentorId, assignmentId);
  const row = progress?.rows.find((r) => r.student.id === studentId);
  if (!progress || !row) return undefined;
  const supabase = await db();
  const [subs, review] = await Promise.all([
    supabase
      .from("problem_submissions")
      .select(
        "id, problem_id, status, feedback, feedback_at, problem_attempts(id, at, code, late)",
      )
      .eq("assignment_id", assignmentId)
      .eq("student_id", studentId),
    supabase
      .from("homework_reviews")
      .select("bonus_xp, note, reviewed_at")
      .eq("assignment_id", assignmentId)
      .eq("student_id", studentId)
      .maybeSingle(),
  ]);
  const subOf = new Map(
    must("Trimiterile", subs).map((s) => [s.problem_id, s]),
  );
  const problems: ProblemWork[] = progress.problems.map((p) => {
    const s = subOf.get(p.id);
    return {
      ...p,
      state: s?.status ?? "not_started",
      submissionId: s?.id,
      feedback:
        s?.feedback && s.feedback_at
          ? { text: s.feedback, at: s.feedback_at }
          : undefined,
      attempts: [...(s?.problem_attempts ?? [])].sort((x, y) =>
        y.at.localeCompare(x.at),
      ),
    };
  });
  return {
    assignment: progress,
    student: row.student,
    problems,
    review: review.data
      ? {
          bonusXp: review.data.bonus_xp,
          note: review.data.note,
          at: review.data.reviewed_at,
        }
      : null,
  };
}

export type ReviewQueueItem = {
  submissionId: string;
  assignmentId: string;
  homeworkId: string;
  title: string;
  problemTitle: string;
  className: string;
  student: Person;
  at: string;
  isResubmission: boolean;
};

/** Problemele trimise care așteaptă evaluare în clasele mentorului, cele mai vechi primele. */
export async function getReviewQueue(
  mentorId: string,
): Promise<ReviewQueueItem[]> {
  const supabase = await db();
  const [classes, subs] = await Promise.all([
    getVisibleClasses(),
    supabase
      .from("problem_submissions")
      .select(
        `id, updated_at, assignment_id,
         student:profiles!problem_submissions_student_id_fkey(${PERSON_FIELDS}),
         problem:homework_problems!problem_submissions_problem_id_fkey(title),
         assignment:homework_assignments!problem_submissions_assignment_id_fkey(class_id, homework_id,
           homework:homeworks!homework_assignments_homework_id_fkey(title, archived)),
         problem_attempts(id)`,
      )
      .eq("status", "submitted")
      .order("updated_at"),
  ]);
  const mine = new Map(
    classes.filter((c) => c.mentorId === mentorId).map((c) => [c.id, c.name]),
  );
  return must("Trimiterile", subs).flatMap((s) => {
    const className = s.assignment
      ? mine.get(s.assignment.class_id)
      : undefined;
    // O temă arhivată nu mai apare în panoul mentorului.
    if (
      !className ||
      !s.assignment ||
      !s.student ||
      s.assignment.homework?.archived
    )
      return [];
    return [
      {
        submissionId: s.id,
        assignmentId: s.assignment_id,
        homeworkId: s.assignment.homework_id,
        title: s.assignment.homework?.title ?? "Temă",
        problemTitle: s.problem?.title ?? "",
        className,
        student: toPerson(s.student),
        at: s.updated_at,
        isResubmission: s.problem_attempts.length > 1,
      },
    ];
  });
}
