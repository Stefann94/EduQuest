// Funcțiile de citire a datelor. Paginile folosesc doar aceste funcții, deci la
// trecerea pe Supabase se schimbă doar implementarea de aici.
// Fiecare funcție primește utilizatorul care cere datele și verifică accesul.

import { isPast } from "../format";
import * as db from "./demo";
import type {
  Assignment,
  ClassRoom,
  Material,
  Quiz,
  Role,
  Submission,
  SubmissionStatus,
  User,
  WorkedProblem,
} from "./types";

/* ---------- Utilizatori ---------- */

/** Utilizatorul „logat”. În demo, câte unul fix pentru fiecare rol. */
export async function getViewer(role: Role): Promise<User> {
  return requireUser(db.DEMO_VIEWERS[role]);
}

export async function getUser(id: string) {
  return db.users.find((u) => u.id === id);
}

function requireUser(id: string): User {
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new Error(`Utilizator inexistent: ${id}`);
  return user;
}

export async function getUsers() {
  return db.users;
}

/* ---------- Clase ---------- */

export type ClassSummary = ClassRoom & {
  mentor: User;
  pendingAssignments: number;
  nextMeeting?: string;
};

function summarize(c: ClassRoom, studentId?: string): ClassSummary {
  const pending = studentId
    ? db.assignments.filter(
        (a) =>
          a.classId === c.id &&
          a.status === "published" &&
          a.type === "required" &&
          submissionStatus(a.id, studentId) === "not_started",
      ).length
    : db.submissions.filter((s) => {
        const a = db.assignments.find((x) => x.id === s.assignmentId);
        return a?.classId === c.id && s.status === "submitted";
      }).length;
  return { ...c, mentor: requireUser(c.mentorId), pendingAssignments: pending };
}

/** Clasele unui elev, separate în active și arhivate. */
export async function getStudentClasses(studentId: string) {
  const mine = db.classes.filter((c) => c.studentIds.includes(studentId));
  return {
    active: mine
      .filter((c) => c.status === "active")
      .map((c) => summarize(c, studentId)),
    archived: mine
      .filter((c) => c.status === "archived")
      .map((c) => summarize(c, studentId)),
  };
}

/** Clasele unui mentor. `pendingAssignments` = trimiteri care așteaptă review. */
export async function getMentorClasses(mentorId: string) {
  const mine = db.classes.filter((c) => c.mentorId === mentorId);
  return {
    active: mine.filter((c) => c.status === "active").map((c) => summarize(c)),
    archived: mine
      .filter((c) => c.status === "archived")
      .map((c) => summarize(c)),
  };
}

export function canViewClass(viewer: User, c: ClassRoom) {
  if (viewer.role === "admin") return true;
  if (viewer.role === "mentor") return c.mentorId === viewer.id;
  return c.studentIds.includes(viewer.id);
}

/** O clasă, doar dacă utilizatorul are acces la ea. */
export async function getClass(viewer: User, classId: string) {
  const c = db.classes.find((x) => x.id === classId);
  if (!c || !canViewClass(viewer, c)) return undefined;
  return {
    ...c,
    mentor: requireUser(c.mentorId),
    students: c.studentIds.map(requireUser),
  };
}

export type JoinResult =
  | { ok: true; classRoom: ClassSummary }
  | {
      ok: false;
      reason: "format" | "invalid" | "expired" | "already" | "archived";
    };

/** Validează un cod de invitație (în demo nu modifică datele). */
export async function joinClassByCode(
  studentId: string,
  rawCode: string,
): Promise<JoinResult> {
  const code = rawCode.trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) return { ok: false, reason: "format" };
  if (db.expiredInviteCodes.includes(code))
    return { ok: false, reason: "expired" };
  const c = db.classes.find((x) => x.inviteCode === code);
  if (!c) return { ok: false, reason: "invalid" };
  if (!c.inviteCodeActive) return { ok: false, reason: "expired" };
  if (c.status === "archived") return { ok: false, reason: "archived" };
  if (c.studentIds.includes(studentId)) return { ok: false, reason: "already" };
  return { ok: true, classRoom: summarize(c, studentId) };
}

/* ---------- Materiale și probleme rezolvate ---------- */

/** Materialele publicate pe care le poate vedea un elev: globale + din clasele lui. */
export async function getStudentMaterials(studentId: string) {
  const classIds = studentClassIds(studentId);
  return db.materials
    .filter(
      (m) =>
        m.status === "published" &&
        (m.classId === null || classIds.includes(m.classId)),
    )
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map(withClassAndAuthor);
}

export async function getStudentWorkedProblems(studentId: string) {
  const classIds = studentClassIds(studentId);
  return db.workedProblems
    .filter(
      (p) =>
        p.status === "published" &&
        (p.classId === null || classIds.includes(p.classId)),
    )
    .map(withClassAndAuthor);
}

export async function getMaterial(viewer: User, id: string) {
  const m = db.materials.find((x) => x.id === id);
  if (!m || !canViewContent(viewer, m)) return undefined;
  return withClassAndAuthor(m);
}

export async function getWorkedProblem(viewer: User, id: string) {
  const p = db.workedProblems.find((x) => x.id === id);
  if (!p || !canViewContent(viewer, p)) return undefined;
  return withClassAndAuthor(p);
}

/** Tot conținutul unui mentor (inclusiv ciornele), pentru pagina de administrare. */
export async function getMentorContent(mentorId: string) {
  const classIds = db.classes
    .filter((c) => c.mentorId === mentorId)
    .map((c) => c.id);
  const own = <T extends Material | WorkedProblem>(x: T) =>
    x.authorId === mentorId ||
    (x.classId !== null && classIds.includes(x.classId));
  return {
    materials: db.materials.filter(own).map(withClassAndAuthor),
    problems: db.workedProblems.filter(own).map(withClassAndAuthor),
  };
}

export async function getClassMaterials(
  classId: string,
  includeDrafts = false,
) {
  return {
    materials: db.materials
      .filter(
        (m) =>
          m.classId === classId && (includeDrafts || m.status === "published"),
      )
      .map(withClassAndAuthor),
    problems: db.workedProblems
      .filter(
        (p) =>
          p.classId === classId && (includeDrafts || p.status === "published"),
      )
      .map(withClassAndAuthor),
  };
}

function canViewContent(viewer: User, item: Material | WorkedProblem) {
  if (viewer.role === "admin") return true;
  if (viewer.role === "mentor")
    return (
      item.authorId === viewer.id ||
      item.classId === null ||
      db.classes.some((c) => c.id === item.classId && c.mentorId === viewer.id)
    );
  if (item.status !== "published") return false;
  return (
    item.classId === null || studentClassIds(viewer.id).includes(item.classId)
  );
}

function withClassAndAuthor<T extends Material | WorkedProblem>(x: T) {
  return {
    ...x,
    className: x.classId
      ? db.classes.find((c) => c.id === x.classId)?.name
      : undefined,
    author: requireUser(x.authorId),
  };
}

/* ---------- Teme și trimiteri ---------- */

function submissionOf(assignmentId: string, studentId: string) {
  return db.submissions.find(
    (s) => s.assignmentId === assignmentId && s.studentId === studentId,
  );
}

function submissionStatus(
  assignmentId: string,
  studentId: string,
): SubmissionStatus {
  return submissionOf(assignmentId, studentId)?.status ?? "not_started";
}

export type StudentAssignment = Assignment & {
  className: string;
  submission?: Submission;
  submissionState: SubmissionStatus;
  overdue: boolean;
};

function forStudent(a: Assignment, studentId: string): StudentAssignment {
  const submission = submissionOf(a.id, studentId);
  const state = submission?.status ?? "not_started";
  return {
    ...a,
    className: db.classes.find((c) => c.id === a.classId)?.name ?? "",
    submission,
    submissionState: state,
    overdue: state === "not_started" && !!a.deadline && isPast(a.deadline),
  };
}

/** Temele publicate din clasele active ale elevului, cele mai urgente primele. */
export async function getStudentAssignments(studentId: string) {
  const classIds = studentClassIds(studentId, true);
  return db.assignments
    .filter((a) => a.status === "published" && classIds.includes(a.classId))
    .map((a) => forStudent(a, studentId))
    .sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999"));
}

export async function getClassAssignmentsForStudent(
  classId: string,
  studentId: string,
) {
  return db.assignments
    .filter((a) => a.classId === classId && a.status === "published")
    .map((a) => forStudent(a, studentId));
}

export async function getAssignmentForStudent(studentId: string, id: string) {
  const a = db.assignments.find((x) => x.id === id);
  if (!a || a.status !== "published") return undefined;
  if (!studentClassIds(studentId).includes(a.classId)) return undefined;
  const mentor = requireUser(
    db.classes.find((c) => c.id === a.classId)?.mentorId ?? "",
  );
  return { ...forStudent(a, studentId), mentor };
}

/** Temele unui mentor, cu numărul de trimiteri pe stări. */
export async function getMentorAssignments(mentorId: string) {
  const classMap = new Map(
    db.classes.filter((c) => c.mentorId === mentorId).map((c) => [c.id, c]),
  );
  return db.assignments
    .filter((a) => classMap.has(a.classId))
    .map((a) => {
      const cls = classMap.get(a.classId) as ClassRoom;
      const subs = db.submissions.filter((s) => s.assignmentId === a.id);
      return {
        ...a,
        className: cls.name,
        totalStudents: cls.studentIds.length,
        counts: {
          submitted: subs.filter((s) => s.status === "submitted").length,
          reviewed: subs.filter((s) => s.status === "reviewed").length,
          needsChanges: subs.filter((s) => s.status === "needs_changes").length,
          notStarted: cls.studentIds.length - subs.length,
        },
      };
    });
}

/** O temă văzută de mentor: fiecare elev din clasă cu trimiterea lui (sau lipsa ei). */
export async function getAssignmentForMentor(mentorId: string, id: string) {
  const a = db.assignments.find((x) => x.id === id);
  const cls = db.classes.find((c) => c.id === a?.classId);
  if (!a || !cls || cls.mentorId !== mentorId) return undefined;
  return {
    ...a,
    className: cls.name,
    rows: cls.studentIds.map((sid) => ({
      student: requireUser(sid),
      submission: submissionOf(a.id, sid),
      state: submissionStatus(a.id, sid),
    })),
  };
}

export async function getSubmissionForMentor(
  mentorId: string,
  submissionId: string,
) {
  const s = db.submissions.find((x) => x.id === submissionId);
  const a = db.assignments.find((x) => x.id === s?.assignmentId);
  const cls = db.classes.find((c) => c.id === a?.classId);
  if (!s || !a || !cls || cls.mentorId !== mentorId) return undefined;
  return {
    submission: s,
    assignment: a,
    className: cls.name,
    student: requireUser(s.studentId),
  };
}

/** Trimiterile care așteaptă review, cele mai vechi primele. */
export async function getReviewQueue(mentorId: string) {
  const classIds = db.classes
    .filter((c) => c.mentorId === mentorId)
    .map((c) => c.id);
  return db.submissions
    .filter((s) => s.status === "submitted")
    .map((s) => {
      const a = db.assignments.find(
        (x) => x.id === s.assignmentId,
      ) as Assignment;
      return {
        submission: s,
        assignment: a,
        className: db.classes.find((c) => c.id === a.classId)?.name ?? "",
        student: requireUser(s.studentId),
        isResubmission: s.attempts.length > 1,
      };
    })
    .filter((r) => classIds.includes(r.assignment.classId))
    .sort((x, y) =>
      (x.submission.attempts.at(-1)?.at ?? "").localeCompare(
        y.submission.attempts.at(-1)?.at ?? "",
      ),
    );
}

/* ---------- Prezență ---------- */

export async function getClassAttendance(classId: string) {
  return db.attendance
    .filter((m) => m.classId === classId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Prezența unui elev, pe clase. */
export async function getStudentAttendance(studentId: string) {
  return db.classes
    .filter((c) => c.studentIds.includes(studentId))
    .map((c) => {
      const meetings = db.attendance
        .filter((m) => m.classId === c.id && studentId in m.records)
        .sort((a, b) => b.date.localeCompare(a.date));
      const attended = meetings.filter((m) => m.records[studentId]).length;
      return {
        classRoom: c,
        meetings: meetings.map((m) => ({
          ...m,
          present: m.records[studentId],
        })),
        attended,
        total: meetings.length,
      };
    })
    .filter((x) => x.total > 0);
}

/* ---------- XP și clasamente ---------- */

export async function getXpHistory(studentId: string, classId?: string) {
  return db.xpTransactions.filter(
    (t) =>
      t.studentId === studentId &&
      (classId === undefined || t.classId === classId),
  );
}

export async function getXpTotal(studentId: string, classId?: string) {
  return (await getXpHistory(studentId, classId)).reduce(
    (s, t) => s + t.amount,
    0,
  );
}

export type LeaderboardRow = { student: User; xp: number; rank: number };

/** Clasamentul unei clase. La XP egal, elevii împart locul (1, 2, 2, 4). */
export async function getLeaderboard(
  classId: string,
): Promise<LeaderboardRow[]> {
  const cls = db.classes.find((c) => c.id === classId);
  if (!cls) return [];
  const rows = await Promise.all(
    cls.studentIds.map(async (sid) => ({
      student: requireUser(sid),
      xp: await getXpTotal(sid, classId),
    })),
  );
  rows.sort(
    (a, b) =>
      b.xp - a.xp || a.student.displayName.localeCompare(b.student.displayName),
  );
  let rank = 0;
  return rows.map((r, i) => {
    if (i === 0 || r.xp !== rows[i - 1].xp) rank = i + 1;
    return { ...r, rank };
  });
}

/* ---------- Quiz-uri ---------- */

export async function getStudentQuizzes(studentId: string) {
  const classIds = studentClassIds(studentId, true);
  const attempts = db.quizAttempts.filter((a) => a.studentId === studentId);
  const decorate = (q: Quiz) => ({
    ...q,
    className: q.classId
      ? db.classes.find((c) => c.id === q.classId)?.name
      : undefined,
    attempts: attempts.filter((a) => a.quizId === q.id),
  });
  return {
    assigned: db.quizzes
      .filter((q) => q.assignment && q.classId && classIds.includes(q.classId))
      .map(decorate),
    practice: db.quizzes.filter((q) => q.classId === null).map(decorate),
  };
}

export async function getQuiz(viewer: User, id: string) {
  const q = db.quizzes.find((x) => x.id === id);
  if (!q) return undefined;
  if (
    viewer.role === "student" &&
    q.classId &&
    !studentClassIds(viewer.id).includes(q.classId)
  )
    return undefined;
  if (
    viewer.role === "mentor" &&
    q.classId &&
    !mentorClassIds(viewer.id).includes(q.classId)
  )
    return undefined;
  return q;
}

export async function getMentorQuizzes(mentorId: string) {
  const classIds = mentorClassIds(mentorId);
  return db.quizzes
    .filter(
      (q) =>
        q.authorId === mentorId || (q.classId && classIds.includes(q.classId)),
    )
    .map((q) => ({
      ...q,
      className: q.classId
        ? db.classes.find((c) => c.id === q.classId)?.name
        : undefined,
    }));
}

/** Sesiunile live din clasele utilizatorului. */
export async function getLiveSessions(viewer: User) {
  const classIds =
    viewer.role === "mentor"
      ? mentorClassIds(viewer.id)
      : studentClassIds(viewer.id);
  return db.liveSessions
    .filter((s) => classIds.includes(s.classId))
    .map((s) => ({
      ...s,
      className: db.classes.find((c) => c.id === s.classId)?.name ?? "",
      quiz: db.quizzes.find((q) => q.id === s.quizId) as Quiz,
    }))
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
}

export async function getLiveSessionByCode(code: string) {
  return db.liveSessions.find((s) => s.code === code && s.status !== "ended");
}

/* ---------- Notificări ---------- */

export async function getNotifications(userId: string) {
  return db.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.at.localeCompare(a.at));
}

/* ---------- Administrare ---------- */

export async function getMentorApplications() {
  return [...db.mentorApplications].sort((a, b) =>
    b.submittedAt.localeCompare(a.submittedAt),
  );
}

export async function getMentorApplication(id: string) {
  return db.mentorApplications.find((a) => a.id === id);
}

/* ---------- Ajutătoare ---------- */

function studentClassIds(studentId: string, activeOnly = false) {
  return db.classes
    .filter(
      (c) =>
        c.studentIds.includes(studentId) &&
        (!activeOnly || c.status === "active"),
    )
    .map((c) => c.id);
}

function mentorClassIds(mentorId: string) {
  return db.classes.filter((c) => c.mentorId === mentorId).map((c) => c.id);
}

/** Pentru generateStaticParams: toate id-urile existente. */
export const demoIds = {
  classes: () => db.classes.map((c) => ({ id: c.id })),
  materials: () => db.materials.map((m) => ({ id: m.id })),
  problems: () => db.workedProblems.map((p) => ({ id: p.id })),
  assignments: () => db.assignments.map((a) => ({ id: a.id })),
  submissions: () => db.submissions.map((s) => ({ id: s.id })),
  quizzes: () => db.quizzes.map((q) => ({ id: q.id })),
  applications: () => db.mentorApplications.map((a) => ({ id: a.id })),
};
