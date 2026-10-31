// Starea quiz-ului live, așa cum o întoarce live_state din baza de date. Fișier fără acces
// la date, folosit și de componentele din browser.

import { z } from "zod";

const player = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  /** Punctele din quiz (nu XP): 500 + bonus de viteză pentru fiecare răspuns corect. */
  score: z.number(),
  rank: z.number(),
  /** XP-ul primit pentru locul final; null până se încheie sesiunea. */
  xp: z.number().nullable().optional(),
});

export const liveStateSchema = z.object({
  status: z.enum(["scheduled", "lobby", "running", "ended"]),
  title: z.string(),
  code: z.string().nullable(),
  current: z.number(),
  total: z.number(),
  /** Timpul întrebării curente (fiecare întrebare are timpul ei). */
  seconds: z.number(),
  startedAt: z.string().nullable(),
  now: z.string(),
  reveal: z.boolean(),
  /** După dezvăluire, mentorul arată clasamentul de până acum. */
  showBoard: z.boolean().default(false),
  question: z
    .object({
      prompt: z.string(),
      code: z.string().nullable(),
      options: z.array(z.string()),
      /** Mai multe răspunsuri corecte: răspunsul și `correct` sunt măști peste variante. */
      multi: z.boolean().optional(),
      /** După dezvăluire: indexul variantei corecte sau, la `multi`, masca lor. */
      correct: z.number().optional(),
      explanation: z.string().nullable().optional(),
      /**
       * După dezvăluire: câți elevi au ales fiecare variantă (în ordinea variantelor; la
       * `multi`, câți au bifat-o).
       */
      counts: z.array(z.number()).optional(),
    })
    .nullable(),
  mine: z
    .object({
      /** Indexul ales sau, la `multi`, masca variantelor bifate. */
      answer: z.number(),
      correct: z.boolean().nullable(),
      points: z.number().nullable(),
    })
    .nullable(),
  players: z.number(),
  answered: z.number(),
  board: z.array(player),
  isMentor: z.boolean(),
});

export type LiveState = z.infer<typeof liveStateSchema>;
export type LivePlayer = z.infer<typeof player>;

/**
 * Etapa jocului: sala de așteptare → întrebare → răspunsul corect (cu câți au ales
 * fiecare variantă) → clasamentul de până acum → … → final.
 */
export type LivePhase = "lobby" | "question" | "reveal" | "board" | "ended";

export function livePhase(state: LiveState): LivePhase {
  if (state.status === "ended") return "ended";
  if (state.status !== "running" || !state.question) return "lobby";
  if (!state.reveal) return "question";
  return state.showBoard ? "board" : "reveal";
}

/** XP după locul final (la fel ca în baza de date). */
export const liveXpForRank = (rank: number) =>
  rank === 1 ? 5 : rank === 2 ? 4 : rank === 3 ? 3 : rank === 4 ? 2 : 1;

/** XP-ul primit de un jucător: cel din baza de date, altfel cel al locului lui. */
export const playerXp = (p: LivePlayer) => p.xp ?? liveXpForRank(p.rank);

/** Secundele rămase din întrebarea curentă, după ceasul serverului (fără diferența de ceas). */
export function secondsLeft(state: LiveState, clockSkewMs: number) {
  if (!state.startedAt || state.status !== "running" || state.reveal) return 0;
  const elapsed =
    (Date.now() + clockSkewMs - Date.parse(state.startedAt)) / 1000;
  return Math.max(0, Math.ceil(state.seconds - elapsed));
}
