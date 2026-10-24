// Starea quiz-ului live, așa cum o întoarce live_state din baza de date. Fișier fără acces
// la date, folosit și de componentele din browser.

import { z } from "zod";

const player = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  score: z.number(),
  rank: z.number(),
});

export const liveStateSchema = z.object({
  status: z.enum(["scheduled", "lobby", "running", "ended"]),
  title: z.string(),
  code: z.string().nullable(),
  current: z.number(),
  total: z.number(),
  seconds: z.number(),
  startedAt: z.string().nullable(),
  now: z.string(),
  reveal: z.boolean(),
  question: z
    .object({
      prompt: z.string(),
      code: z.string().nullable(),
      options: z.array(z.string()),
      correct: z.number().optional(),
      explanation: z.string().nullable().optional(),
    })
    .nullable(),
  mine: z
    .object({
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

/** XP după locul final (la fel ca în baza de date). */
export const liveXpForRank = (rank: number) =>
  rank === 1 ? 5 : rank === 2 ? 4 : rank === 3 ? 3 : rank === 4 ? 2 : 1;

/** Secundele rămase din întrebarea curentă, după ceasul serverului (fără diferența de ceas). */
export function secondsLeft(state: LiveState, clockSkewMs: number) {
  if (!state.startedAt || state.status !== "running" || state.reveal) return 0;
  const elapsed =
    (Date.now() + clockSkewMs - Date.parse(state.startedAt)) / 1000;
  return Math.max(0, Math.ceil(state.seconds - elapsed));
}
