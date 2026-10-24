import "server-only";
import { cache } from "react";
import type { ClassStatus } from "@/lib/data/types";
import { db, isUuid, must, PERSON_FIELDS, type Person, toPerson } from "./core";

export type ClassRoom = {
  id: string;
  name: string;
  description: string;
  mentorId: string;
  status: ClassStatus;
  schedule: string;
  inviteCode: string;
  inviteCodeActive: boolean;
  studentIds: string[];
  createdAt: string;
};

export type ClassSummary = ClassRoom & {
  mentor: Person;
  /** Elev: teme obligatorii netrimise. Mentor: trimiteri care așteaptă evaluare. */
  pendingAssignments: number;
};

export type ClassDetail = ClassRoom & { mentor: Person; students: Person[] };

const CLASS_FIELDS = `id, name, description, mentor_id, status, schedule, invite_code,
  invite_code_active, created_at,
  mentor:profiles!classes_mentor_id_fkey(${PERSON_FIELDS}),
  class_members(student_id, profile:profiles!class_members_student_id_fkey(${PERSON_FIELDS}))`;

type ClassRow = {
  id: string;
  name: string;
  description: string;
  mentor_id: string;
  status: ClassStatus;
  schedule: string;
  invite_code: string;
  invite_code_active: boolean;
  created_at: string;
  mentor: Parameters<typeof toPerson>[0];
  class_members: {
    student_id: string;
    profile: Parameters<typeof toPerson>[0] | null;
  }[];
};

function toDetail(r: ClassRow): ClassDetail {
  const students = r.class_members
    .flatMap((m) => (m.profile ? [toPerson(m.profile)] : []))
    .sort((a, b) => a.displayName.localeCompare(b.displayName, "ro"));
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    mentorId: r.mentor_id,
    status: r.status,
    schedule: r.schedule,
    inviteCode: r.invite_code,
    inviteCodeActive: r.invite_code_active,
    studentIds: r.class_members.map((m) => m.student_id),
    createdAt: r.created_at,
    mentor: toPerson(r.mentor),
    students,
  };
}

/** Toate clasele pe care le vede contul logat (RLS: ale lui, ca elev sau mentor). */
export const getVisibleClasses = cache(async (): Promise<ClassDetail[]> => {
  const supabase = await db();
  const rows = must(
    "Clasele",
    await supabase.from("classes").select(CLASS_FIELDS).order("created_at"),
  ) as unknown as ClassRow[];
  return rows.map(toDetail);
});

/** O clasă, doar dacă utilizatorul are acces la ea. */
export const getClass = cache(async (id: string) => {
  if (!isUuid(id)) return undefined;
  return (await getVisibleClasses()).find((c) => c.id === id);
});

/** Clasele unui elev, cu numărul de teme obligatorii încă netrimise. */
export async function getStudentClasses(studentId: string) {
  const [classes, pending] = await Promise.all([
    getVisibleClasses(),
    pendingHomeworkByClass(studentId),
  ]);
  const mine = classes
    .filter((c) => c.studentIds.includes(studentId))
    .map((c) => ({ ...c, pendingAssignments: pending.get(c.id) ?? 0 }));
  return {
    active: mine.filter((c) => c.status === "active"),
    archived: mine.filter((c) => c.status === "archived"),
  };
}

/** Clasele unui mentor, cu trimiterile care așteaptă evaluare. */
export async function getMentorClasses(mentorId: string) {
  const supabase = await db();
  const [classes, waiting] = await Promise.all([
    getVisibleClasses(),
    supabase
      .from("problem_submissions")
      .select(
        "assignment:homework_assignments!problem_submissions_assignment_id_fkey(class_id)",
      )
      .eq("status", "submitted"),
  ]);
  const counts = new Map<string, number>();
  for (const s of must("Trimiterile", waiting))
    if (s.assignment)
      counts.set(
        s.assignment.class_id,
        (counts.get(s.assignment.class_id) ?? 0) + 1,
      );
  const mine = classes
    .filter((c) => c.mentorId === mentorId)
    .map((c) => ({ ...c, pendingAssignments: counts.get(c.id) ?? 0 }));
  return {
    active: mine.filter((c) => c.status === "active"),
    archived: mine.filter((c) => c.status === "archived"),
  };
}

/** Câte teme cu probleme obligatorii netrimise are elevul, pe clase (termenul încă nu a trecut). */
async function pendingHomeworkByClass(studentId: string) {
  const supabase = await db();
  const [assignments, subs] = await Promise.all([
    supabase
      .from("homework_assignments")
      .select(
        "id, class_id, deadline, homework:homeworks!homework_assignments_homework_id_fkey(required, problems:homework_problems(id, required))",
      ),
    supabase
      .from("problem_submissions")
      .select("assignment_id, problem_id")
      .eq("student_id", studentId),
  ]);
  const done = new Set(
    must("Trimiterile", subs).map((s) => `${s.assignment_id}:${s.problem_id}`),
  );
  const counts = new Map<string, number>();
  for (const a of must("Temele", assignments)) {
    if (!a.homework?.required) continue;
    if (a.deadline && Date.parse(a.deadline) < Date.now()) continue;
    const missing = a.homework.problems.some(
      (p) => p.required && !done.has(`${a.id}:${p.id}`),
    );
    if (missing) counts.set(a.class_id, (counts.get(a.class_id) ?? 0) + 1);
  }
  return counts;
}

/** Id-urile claselor în care predă mentorul. */
export async function mentorClassIds(mentorId: string) {
  return (await getVisibleClasses())
    .filter((c) => c.mentorId === mentorId)
    .map((c) => c.id);
}

export type { Person };
