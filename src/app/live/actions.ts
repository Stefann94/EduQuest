"use server";

import { z } from "zod";
import { getViewer } from "@/lib/data/queries";
import {
  joinLiveSession,
  LIVE_QUESTION_MS,
  type LiveRoundResult,
  type LiveSessionInfo,
  scoreLiveSession,
} from "@/lib/data/student-activity-queries";

export type JoinLiveState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "joined"; session: LiveSessionInfo };

const MESSAGES = {
  format: "Codul sesiunii are 6 cifre.",
  invalid:
    "Nu am găsit nicio sesiune activă cu acest cod. Verifică cifrele sau întreabă-l pe mentor.",
  not_member:
    "Sesiunea aparține unei clase din care nu faci parte. Poți intra doar în sesiunile claselor tale.",
} as const;

/** Verifică codul sesiunii pe server și întoarce sesiunea, fără răspunsurile corecte. */
export async function joinLive(
  _prev: JoinLiveState,
  formData: FormData,
): Promise<JoinLiveState> {
  const me = await getViewer("student");
  const result = await joinLiveSession(me, String(formData.get("code") ?? ""));
  if (!result.ok) return { status: "error", message: MESSAGES[result.reason] };
  return { status: "joined", session: result.session };
}

const answersSchema = z
  .array(
    z.object({
      answer: z.number().int().min(0).max(3).nullable(),
      msLeft: z.number().min(0).max(LIVE_QUESTION_MS),
    }),
  )
  .min(1)
  .max(50);

const avatarSchema = z.enum([
  "fox",
  "panda",
  "owl",
  "cat",
  "robot",
  "rocket",
  "octopus",
  "penguin",
]);

/**
 * Înregistrează răspunsul la întrebarea curentă și întoarce răspunsul corect,
 * punctajul și clasamentul. Răspunsul corect ajunge în browser doar după ce
 * elevul a răspuns (sau a expirat timpul).
 */
export async function answerLive(
  code: string,
  avatar: string,
  answers: { answer: number | null; msLeft: number }[],
): Promise<LiveRoundResult> {
  const me = await getViewer("student");
  const parsedAnswers = answersSchema.safeParse(answers);
  const parsedAvatar = avatarSchema.safeParse(avatar);
  if (
    !parsedAnswers.success ||
    !parsedAvatar.success ||
    typeof code !== "string"
  )
    return { ok: false };
  return scoreLiveSession(me, code, parsedAvatar.data, parsedAnswers.data);
}
