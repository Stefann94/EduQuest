// Citiri pentru paginile unei clase văzute de elev. Se bazează pe funcțiile din
// queries.ts (care verifică accesul), deci la trecerea pe Supabase nu se schimbă nimic aici.

import { now } from "../format";
import {
  getLeaderboard,
  getLiveSessions,
  getStudentAttendance,
  getStudentQuizzes,
} from "./queries";
import type { ClassRoom, User } from "./types";

/** XP-ul și locul elevului în clasamentul unei clase. */
export async function getClassStanding(classId: string, studentId: string) {
  const board = await getLeaderboard(classId);
  const row = board.find((r) => r.student.id === studentId);
  return { xp: row?.xp ?? 0, rank: row?.rank, size: board.length };
}

/** Quiz-urile date în clasă și sesiunile live ale clasei, cu rezultatul elevului. */
export async function getClassQuizzesForStudent(viewer: User, classId: string) {
  const [quizzes, sessions] = await Promise.all([
    getStudentQuizzes(viewer.id),
    getLiveSessions(viewer),
  ]);
  const mine = sessions.filter((s) => s.classId === classId);
  return {
    assigned: quizzes.assigned
      .filter((q) => q.classId === classId)
      .sort((a, b) =>
        (a.assignment?.deadline ?? "").localeCompare(
          b.assignment?.deadline ?? "",
        ),
      ),
    upcoming: mine.filter((s) => s.status !== "ended").reverse(),
    past: mine
      .filter((s) => s.status === "ended")
      .map((s) => ({
        ...s,
        myResult: s.results?.find((r) => r.studentId === viewer.id),
        participants: s.results?.length ?? 0,
      })),
  };
}

/** Prezența elevului într-o singură clasă. */
export async function getClassAttendanceForStudent(
  studentId: string,
  classId: string,
) {
  const all = await getStudentAttendance(studentId);
  return (
    all.find((x) => x.classRoom.id === classId) ?? {
      meetings: [],
      attended: 0,
      total: 0,
    }
  );
}

/* ---------- Următoarea întâlnire ---------- */

const WEEKDAYS: Record<string, number> = {
  duminică: 0,
  luni: 1,
  marți: 2,
  miercuri: 3,
  joi: 4,
  vineri: 5,
  sâmbătă: 6,
};

const weekdayInRomania = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: "Europe/Bucharest",
});
const EN_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DAY = 24 * 60 * 60 * 1000;

/**
 * Data următoarei întâlniri, dedusă din programul clasei („Sâmbătă, 10:00–11:30”).
 * Întoarce o dată ISO (pentru formatare) și intervalul orar, sau nimic pentru
 * clasele arhivate ori programele pe care nu le putem interpreta.
 */
export function getNextMeeting(c: Pick<ClassRoom, "schedule" | "status">) {
  if (c.status !== "active") return undefined;
  const [dayPart, timePart] = c.schedule.split(",").map((s) => s.trim());
  const target = WEEKDAYS[dayPart?.toLowerCase() ?? ""];
  if (target === undefined) return undefined;
  const today = EN_DAYS.indexOf(weekdayInRomania.format(now()));
  const offset = (target - today + 7) % 7;
  return {
    iso: new Date(now().getTime() + offset * DAY).toISOString(),
    time: timePart,
    inDays: offset,
  };
}

export type ClassQuizzes = Awaited<
  ReturnType<typeof getClassQuizzesForStudent>
>;
export type AssignedQuiz = ClassQuizzes["assigned"][number];
export type UpcomingLiveSession = ClassQuizzes["upcoming"][number];
export type PastLiveSession = ClassQuizzes["past"][number];
