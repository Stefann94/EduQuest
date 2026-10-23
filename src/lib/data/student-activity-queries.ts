// Date pentru activitatea elevului: quiz-uri (cu notare pe server), sesiuni live
// și notificări grupate. Paginile citesc doar prin aceste funcții și prin queries.ts.
// IMPORTANT: răspunsurile corecte și explicațiile nu ies din acest fișier decât
// după ce elevul a trimis răspunsurile (vezi `gradeQuiz` și `scoreLiveSession`).

import { formatShortDate, isPast, now } from "../format";
import * as db from "./demo";
import { getLiveSessionByCode, getQuiz } from "./queries";
import type { AvatarId, Quiz, User } from "./types";

/* ---------- Quiz-uri ---------- */

/** O întrebare fără răspunsul corect și fără explicație, sigură pentru browser. */
export type PublicQuestion = {
  id: string;
  prompt: string;
  code?: string;
  options: string[];
};

export function toPublicQuestions(quiz: Quiz): PublicQuestion[] {
  return quiz.questions.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    code: q.code,
    options: q.options,
  }));
}

export type QuizMode = "assigned" | "practice";

/** Ce poate face elevul cu un quiz acum: deschis, câte încercări mai are etc. */
export function quizAvailability(quiz: Quiz, studentId: string) {
  const used = db.quizAttempts.filter(
    (a) => a.quizId === quiz.id && a.studentId === studentId,
  ).length;
  if (!quiz.assignment)
    return {
      mode: "practice" as QuizMode,
      used,
      maxAttempts: undefined,
      open: true,
      reason: undefined,
    };
  const { opensAt, deadline, maxAttempts } = quiz.assignment;
  const notYet = !isPast(opensAt);
  const closed = isPast(deadline);
  const noAttempts = used >= maxAttempts;
  return {
    mode: "assigned" as QuizMode,
    used,
    maxAttempts,
    open: !notYet && !closed && !noAttempts,
    reason: notYet
      ? ("not_open" as const)
      : closed
        ? ("closed" as const)
        : noAttempts
          ? ("no_attempts" as const)
          : undefined,
  };
}

/** Quiz-ul pentru player: întrebările fără răspunsuri, plus regulile de încercări. */
export async function getQuizForPlayer(viewer: User, id: string) {
  const quiz = await getQuiz(viewer, id);
  if (!quiz) return undefined;
  const cls = quiz.classId
    ? db.classes.find((c) => c.id === quiz.classId)
    : undefined;
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    topic: quiz.topic,
    difficulty: quiz.difficulty,
    className: cls?.name,
    classId: quiz.classId,
    timeLimitSec: quiz.timeLimitSec,
    assignment: quiz.assignment,
    isLiveQuiz: db.liveSessions.some((s) => s.quizId === quiz.id),
    questions: toPublicQuestions(quiz),
    availability: quizAvailability(quiz, viewer.id),
  };
}

export type QuestionResult = {
  questionId: string;
  your: number | null;
  correct: number;
  isCorrect: boolean;
  explanation?: string;
};

export type GradeResult =
  | {
      ok: true;
      correct: number;
      total: number;
      results: QuestionResult[];
      /** XP acordat pentru un quiz dat de mentor (0 la exersare). */
      xp: number;
    }
  | { ok: false; reason: "not_found" | "closed" | "invalid" };

/** Notează un quiz pe server. `answers[i]` = indexul ales sau null. */
export async function gradeQuiz(
  viewer: User,
  quizId: string,
  answers: (number | null)[],
): Promise<GradeResult> {
  const quiz = await getQuiz(viewer, quizId);
  if (!quiz) return { ok: false, reason: "not_found" };
  if (answers.length !== quiz.questions.length)
    return { ok: false, reason: "invalid" };
  const availability = quizAvailability(quiz, viewer.id);
  if (!availability.open) return { ok: false, reason: "closed" };

  const results = quiz.questions.map((q, i) => {
    const your = answers[i];
    const valid = your !== null && your >= 0 && your < q.options.length;
    return {
      questionId: q.id,
      your: valid ? your : null,
      correct: q.correct,
      isCorrect: valid && your === q.correct,
      explanation: q.explanation,
    };
  });
  const correct = results.filter((r) => r.isCorrect).length;
  // XP doar pentru quiz-urile date de mentor, la prima finalizare.
  const xp =
    quiz.assignment && availability.used === 0 ? quiz.assignment.xp : 0;
  return { ok: true, correct, total: quiz.questions.length, results, xp };
}

/* ---------- Sesiuni live ---------- */

/** Durata unei întrebări în sesiunea live. */
export const LIVE_QUESTION_MS = 20_000;

/** XP după locul final (PROJECT.md §10.2). Locurile egale primesc același XP. */
export function liveXpForRank(rank: number) {
  return rank === 1 ? 5 : rank === 2 ? 4 : rank === 3 ? 3 : rank === 4 ? 2 : 1;
}

/** Punctaj pentru un răspuns: 0 dacă e greșit, altfel 500 + până la 500 pentru viteză. */
function pointsFor(isCorrect: boolean, msLeft: number) {
  if (!isCorrect) return 0;
  const left = Math.max(0, Math.min(LIVE_QUESTION_MS, msLeft));
  return 500 + Math.round((500 * left) / LIVE_QUESTION_MS);
}

/** Număr pseudo-aleator, dar mereu același pentru aceeași intrare (demo). */
function seeded(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10_000) / 10_000;
}

export type LiveParticipant = {
  id: string;
  name: string;
  avatar: AvatarId;
};

export type LiveSessionInfo = {
  code: string;
  title: string;
  className: string;
  mentorName: string;
  questionCount: number;
  questions: PublicQuestion[];
  /** Ceilalți elevi din clasă care intră în sesiune (în demo, simulați). */
  others: LiveParticipant[];
};

export type LiveJoinResult =
  | { ok: true; session: LiveSessionInfo }
  | { ok: false; reason: "format" | "invalid" | "not_member" };

/** Verifică un cod de sesiune live. Elevul trebuie să fie în clasa sesiunii. */
export async function joinLiveSession(
  viewer: User,
  rawCode: string,
): Promise<LiveJoinResult> {
  const code = rawCode.replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { ok: false, reason: "format" };
  const session = await getLiveSessionByCode(code);
  if (!session) return { ok: false, reason: "invalid" };
  const cls = db.classes.find((c) => c.id === session.classId);
  if (!cls || !cls.studentIds.includes(viewer.id))
    return { ok: false, reason: "not_member" };
  const quiz = db.quizzes.find((q) => q.id === session.quizId);
  if (!quiz) return { ok: false, reason: "invalid" };
  const mentor = db.users.find((u) => u.id === cls.mentorId);
  return {
    ok: true,
    session: {
      code,
      title: session.title,
      className: cls.name,
      mentorName: mentor?.displayName ?? "",
      questionCount: quiz.questions.length,
      questions: toPublicQuestions(quiz),
      others: cls.studentIds
        .filter((id) => id !== viewer.id)
        .map((id) => db.users.find((u) => u.id === id))
        .filter((u): u is User => !!u && u.status === "active")
        .map((u) => ({ id: u.id, name: u.displayName, avatar: u.avatar })),
    },
  };
}

export type LiveAnswer = { answer: number | null; msLeft: number };

export type LiveStanding = {
  id: string;
  name: string;
  avatar: AvatarId;
  score: number;
  rank: number;
  xp: number;
  isMe: boolean;
};

export type LiveRoundResult =
  | {
      ok: true;
      questionIndex: number;
      correct: number;
      explanation?: string;
      yourAnswer: number | null;
      isCorrect: boolean;
      points: number;
      standings: LiveStanding[];
      finished: boolean;
    }
  | { ok: false };

/**
 * Notează sesiunea până la întrebarea curentă, inclusiv.
 * Serverul recalculează totul din răspunsuri, deci punctajul nu vine din browser.
 * În demo, timpul rămas vine din browser; în sesiunea reală îl măsoară serverul,
 * păstrează primul răspuns la fiecare întrebare și le refuză pe cele trimise după termen.
 * Punctajul sesiunii și XP-ul se păstrează separat (PROJECT.md §8.4).
 */
export async function scoreLiveSession(
  viewer: User,
  code: string,
  avatar: AvatarId,
  answers: LiveAnswer[],
): Promise<LiveRoundResult> {
  const joined = await joinLiveSession(viewer, code);
  if (!joined.ok) return { ok: false };
  const session = await getLiveSessionByCode(code);
  const quiz = db.quizzes.find((q) => q.id === session?.quizId);
  if (!quiz || answers.length < 1 || answers.length > quiz.questions.length)
    return { ok: false };

  const index = answers.length - 1;
  const myScores = answers.map((a, i) => {
    const q = quiz.questions[i];
    return pointsFor(a.answer === q.correct, a.msLeft);
  });
  const myTotal = myScores.reduce((s, p) => s + p, 0);

  // Ceilalți participanți: răspunsuri simulate, mereu aceleași pentru aceeași sesiune.
  const others = joined.session.others.map((p) => {
    let score = 0;
    for (let i = 0; i <= index; i++) {
      const r = seeded(`${code}:${p.id}:${i}`);
      const isCorrect = r < 0.72;
      const msLeft = 3000 + seeded(`${p.id}:${i}:t`) * 14_000;
      score += pointsFor(isCorrect, msLeft);
    }
    return { ...p, score, isMe: false };
  });

  const rows = [
    {
      id: viewer.id,
      name: viewer.displayName,
      avatar,
      score: myTotal,
      isMe: true,
    },
    ...others,
  ].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "ro"));

  // Locurile egale se împart (1, 2, 2, 4) și primesc același XP.
  let rank = 0;
  const standings: LiveStanding[] = rows.map((r, i) => {
    if (i === 0 || r.score !== rows[i - 1].score) rank = i + 1;
    return { ...r, rank, xp: liveXpForRank(rank) };
  });

  const current = quiz.questions[index];
  const yourAnswer = answers[index].answer;
  return {
    ok: true,
    questionIndex: index,
    correct: current.correct,
    explanation: current.explanation,
    yourAnswer,
    isCorrect: yourAnswer === current.correct,
    points: myScores[index],
    standings,
    finished: index === quiz.questions.length - 1,
  };
}

/* ---------- Notificări ---------- */

export type NotificationGroup = "today" | "yesterday" | "earlier";

/** Grupul unei notificări, după ziua calendaristică din România, față de `now()`. */
export function notificationGroup(iso: string): NotificationGroup {
  const today = formatShortDate(now().toISOString());
  const yesterday = formatShortDate(
    new Date(now().getTime() - 24 * 60 * 60 * 1000).toISOString(),
  );
  const day = formatShortDate(iso);
  if (day === today) return "today";
  if (day === yesterday) return "yesterday";
  return "earlier";
}
