// Citiri pentru zona de conținut a mentorului: trimiteri, sesiuni live.
// Completează queries.ts; la trecerea pe Supabase se schimbă doar implementarea.

import * as db from "./demo";
import type { User } from "./types";

function requireUser(id: string): User {
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new Error(`Utilizator inexistent: ${id}`);
  return user;
}

/** Pentru generateStaticParams: perechile (temă, trimitere). */
export function submissionParams() {
  return db.submissions.map((s) => ({
    id: s.assignmentId,
    submissionId: s.id,
  }));
}

/** Pentru generateStaticParams: toate sesiunile live. */
export function liveSessionParams() {
  return db.liveSessions.map((s) => ({ id: s.id }));
}

/** Limbajul în care se afișează codul trimis, după clasă. */
export function codeLanguageForClass(classId: string) {
  if (classId === "web-html-css") return "html";
  if (classId === "poo-java") return "java";
  if (classId === "python-incepatori") return "python";
  return "text";
}

/**
 * O sesiune live văzută de mentor, doar dacă sesiunea e într-o clasă a lui.
 * Include elevii clasei (pentru lobby) și rezultatele salvate (pentru sesiunile încheiate).
 */
export async function getLiveSessionForMentor(mentorId: string, id: string) {
  const session = db.liveSessions.find((s) => s.id === id);
  const cls = db.classes.find((c) => c.id === session?.classId);
  if (!session || !cls || cls.mentorId !== mentorId) return undefined;
  const quiz = db.quizzes.find((q) => q.id === session.quizId);
  if (!quiz) return undefined;
  return {
    session,
    quiz,
    className: cls.name,
    students: cls.studentIds.map(requireUser),
    results: (session.results ?? [])
      .map((r) => ({ ...r, student: requireUser(r.studentId) }))
      .sort((a, b) => a.rank - b.rank || b.score - a.score),
  };
}

/**
 * Doar autorul sau mentorul clasei poate modifica un material sau o problemă.
 * (Resursele globale ale altor mentori se pot vedea, dar nu și modifica.)
 */
export function canEditContent(
  mentorId: string,
  item: { authorId: string; classId: string | null },
) {
  return (
    item.authorId === mentorId ||
    db.classes.some((c) => c.id === item.classId && c.mentorId === mentorId)
  );
}
