import "server-only";
import { getClassMeetings, MAX_ABSENCES } from "./attendance";
import { getClass } from "./classes";
import { db, must, type Person } from "./core";
import { getLeaderboard } from "./xp";

export type ClassMemberRow = {
  student: Person;
  xp: number;
  /** Prezent sau recuperat. */
  attended: number;
  absent: number;
  meetings: number;
  /** Procent 0–100 sau null dacă nu a existat nicio întâlnire. */
  attendanceRate: number | null;
  /** Mai mult de MAX_ABSENCES absențe: nu mai poate termina cursul. */
  blocked: boolean;
  /** Teme cu toate problemele obligatorii trimise / teme date clasei. */
  submitted: number;
  assignments: number;
};

/** Elevii unei clase, cu XP-ul din clasă, prezența și temele trimise. */
export async function getClassMembers(
  classId: string,
): Promise<ClassMemberRow[]> {
  const c = await getClass(classId);
  if (!c) return [];
  const supabase = await db();
  const [board, meetings, assignments] = await Promise.all([
    getLeaderboard(classId),
    getClassMeetings(classId),
    supabase
      .from("homework_assignments")
      .select(
        "id, homework:homeworks!homework_assignments_homework_id_fkey(problems:homework_problems(id, required)), problem_submissions(student_id, problem_id)",
      )
      .eq("class_id", classId),
  ]);
  const hw = must("Temele", assignments);
  const xp = new Map(board.map((r) => [r.student.id, r.xp]));

  return c.students.map((student) => {
    const marked = meetings.filter((m) => m.records[student.id]);
    const absent = marked.filter(
      (m) => m.records[student.id] === "absent",
    ).length;
    const attended = marked.length - absent;
    const submitted = hw.filter((a) => {
      const problems = a.homework?.problems ?? [];
      const counted = problems.some((p) => p.required)
        ? problems.filter((p) => p.required)
        : problems;
      const mine = new Set(
        a.problem_submissions
          .filter((s) => s.student_id === student.id)
          .map((s) => s.problem_id),
      );
      return counted.length > 0 && counted.every((p) => mine.has(p.id));
    }).length;
    return {
      student,
      xp: xp.get(student.id) ?? 0,
      attended,
      absent,
      meetings: marked.length,
      attendanceRate:
        marked.length > 0 ? Math.round((attended / marked.length) * 100) : null,
      blocked: absent > MAX_ABSENCES,
      submitted,
      assignments: hw.length,
    };
  });
}
