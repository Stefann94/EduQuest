"use server";

import { z } from "zod";
import { rankLiveResults } from "@/components/mentor-content/live-ranking";
import { getLiveSessionForMentor } from "@/lib/data/mentor-content-queries";
import { getViewer } from "@/lib/data/queries";

// Încheierea unei sesiuni live: serverul recalculează clasamentul și XP-ul
// din punctaje (clientul nu decide XP-ul). În demo nu salvează nimic.

export type FinishLiveResult =
  | {
      ok: true;
      message: string;
      detail: string;
      results: { studentId: string; score: number; rank: number; xp: number }[];
    }
  | { ok: false; message: string };

const scoresSchema = z
  .array(
    z.object({
      studentId: z.string(),
      score: z.number().int().min(0).max(100_000),
    }),
  )
  .max(200);

export async function finishLiveSession(
  sessionId: string,
  scores: { studentId: string; score: number }[],
): Promise<FinishLiveResult> {
  const me = await getViewer("mentor");
  const data = await getLiveSessionForMentor(me.id, sessionId);
  if (!data) return { ok: false, message: "Nu ai acces la această sesiune." };
  if (data.session.status === "ended")
    return { ok: false, message: "Sesiunea a fost deja încheiată." };

  const parsed = scoresSchema.safeParse(scores);
  if (!parsed.success)
    return { ok: false, message: "Punctajele nu au putut fi citite." };

  const members = new Set(data.students.map((s) => s.id));
  const seen = new Set<string>();
  for (const s of parsed.data) {
    if (!members.has(s.studentId) || seen.has(s.studentId))
      return {
        ok: false,
        message: "Doar elevii clasei pot primi XP, o singură dată.",
      };
    seen.add(s.studentId);
  }

  const results = rankLiveResults(parsed.data);
  const totalXp = results.reduce((sum, r) => sum + r.xp, 0);
  return {
    ok: true,
    message: "Sesiunea s-a încheiat. Rezultatele au fost salvate.",
    detail: `${results.length} participanți primesc în total ${totalXp} XP. Demo: salvarea reală vine cu baza de date.`,
    results,
  };
}
