// Citiri suplimentare pentru zona mentorului: membrii unei clase cu statistici,
// trimiterile recente și următoarele întâlniri. La trecerea pe Supabase se schimbă
// doar implementarea de aici; paginile rămân la fel.

import {
  dateKey,
  localToIso,
  weekdayIndex,
} from "@/components/mentor-classes/dates";
import * as db from "./demo";
import type { Assignment, Submission, User } from "./types";

/* ---------- Ajutătoare ---------- */

function requireUser(id: string): User {
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new Error(`Utilizator inexistent: ${id}`);
  return user;
}

/** Clasa, doar dacă aparține mentorului. */
function ownedClass(mentorId: string, classId: string) {
  const c = db.classes.find((x) => x.id === classId);
  return c && c.mentorId === mentorId ? c : undefined;
}

const lastAttemptAt = (s: Submission) => s.attempts.at(-1)?.at ?? "";

/* ---------- Membrii clasei ---------- */

export type ClassMemberRow = {
  student: User;
  xp: number;
  attended: number;
  meetings: number;
  /** Procent 0–100 sau null dacă nu a existat nicio întâlnire. */
  attendanceRate: number | null;
  submitted: number;
  assignments: number;
};

/** Elevii unei clase, cu XP-ul din clasă, prezența și temele trimise. */
export async function getClassMembers(
  mentorId: string,
  classId: string,
): Promise<ClassMemberRow[]> {
  const c = ownedClass(mentorId, classId);
  if (!c) return [];
  const meetings = db.attendance.filter((m) => m.classId === classId);
  const published = db.assignments.filter(
    (a) => a.classId === classId && a.status === "published",
  );
  return c.studentIds
    .map((sid) => {
      const own = meetings.filter((m) => sid in m.records);
      const attended = own.filter((m) => m.records[sid]).length;
      return {
        student: requireUser(sid),
        xp: db.xpTransactions
          .filter((t) => t.studentId === sid && t.classId === classId)
          .reduce((s, t) => s + t.amount, 0),
        attended,
        meetings: own.length,
        attendanceRate:
          own.length > 0 ? Math.round((attended / own.length) * 100) : null,
        submitted: published.filter((a) =>
          db.submissions.some(
            (s) => s.assignmentId === a.id && s.studentId === sid,
          ),
        ).length,
        assignments: published.length,
      };
    })
    .sort((a, b) => a.student.displayName.localeCompare(b.student.displayName));
}

/* ---------- Trimiteri ---------- */

export type ClassSubmissionRow = {
  submission: Submission;
  assignment: Assignment;
  student: User;
  isResubmission: boolean;
  lastAt: string;
};

/** Cele mai recente trimiteri dintr-o clasă (orice stare). */
export async function getClassRecentSubmissions(
  mentorId: string,
  classId: string,
  limit = 5,
): Promise<ClassSubmissionRow[]> {
  if (!ownedClass(mentorId, classId)) return [];
  return db.submissions
    .map((s) => ({
      submission: s,
      assignment: db.assignments.find((a) => a.id === s.assignmentId),
    }))
    .filter(
      (r): r is { submission: Submission; assignment: Assignment } =>
        r.assignment?.classId === classId,
    )
    .map((r) => ({
      ...r,
      student: requireUser(r.submission.studentId),
      isResubmission: r.submission.attempts.length > 1,
      lastAt: lastAttemptAt(r.submission),
    }))
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt))
    .slice(0, limit);
}

/* ---------- Întâlniri ---------- */

const WEEKDAYS: Record<string, number> = {
  duminică: 0,
  luni: 1,
  marți: 2,
  miercuri: 3,
  joi: 4,
  vineri: 5,
  sâmbătă: 6,
};

/**
 * Următoarea întâlnire după `from`, calculată din programul clasei
 * („Sâmbătă, 10:00–11:30”). Întoarce ISO sau undefined dacă programul nu se poate citi.
 */
export function nextMeetingFromSchedule(
  schedule: string,
  from: Date,
): string | undefined {
  const m = /^\s*([^\s,]+)\s*,\s*(\d{1,2}):(\d{2})/u.exec(schedule);
  if (!m) return undefined;
  const weekday = WEEKDAYS[m[1].toLocaleLowerCase("ro-RO")];
  if (weekday === undefined) return undefined;
  const time = `${m[2].padStart(2, "0")}:${m[3]}`;

  const today = dateKey(from);
  const wd = weekdayIndex(from);
  for (let add = 0; add <= 7; add++) {
    if ((wd + add) % 7 !== weekday) continue;
    const day = new Date(Date.parse(`${today}T12:00:00Z`) + add * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const at = localToIso(day, time);
    if (Date.parse(at) > from.getTime()) return at;
  }
  return undefined;
}

/** Următoarele întâlniri din clasele active ale mentorului, cele mai apropiate primele. */
export async function getUpcomingMeetings(mentorId: string, from: Date) {
  return db.classes
    .filter((c) => c.mentorId === mentorId && c.status === "active")
    .map((c) => ({
      classId: c.id,
      className: c.name,
      schedule: c.schedule,
      at: nextMeetingFromSchedule(c.schedule, from),
    }))
    .filter((x): x is typeof x & { at: string } => x.at !== undefined)
    .sort((a, b) => a.at.localeCompare(b.at));
}
