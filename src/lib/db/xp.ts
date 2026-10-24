import "server-only";
import type { AvatarId, XpSource } from "@/lib/data/types";
import { db, isUuid, must } from "./core";

export type XpTransaction = {
  id: string;
  studentId: string;
  classId: string | null;
  source: XpSource;
  amount: number;
  label: string;
  at: string;
};

/** Istoricul de XP al elevului (tot sau dintr-o clasă), cele mai noi primele. */
export async function getXpHistory(
  studentId: string,
  classId?: string,
): Promise<XpTransaction[]> {
  const supabase = await db();
  let q = supabase
    .from("xp_transactions")
    .select("id, student_id, class_id, source, amount, label, at")
    .eq("student_id", studentId)
    .order("at", { ascending: false });
  if (classId) q = q.eq("class_id", classId);
  return must("XP", await q).map((t) => ({
    id: t.id,
    studentId: t.student_id,
    classId: t.class_id,
    source: t.source as XpSource,
    amount: t.amount,
    label: t.label,
    at: t.at,
  }));
}

export async function getXpTotal(studentId: string, classId?: string) {
  return (await getXpHistory(studentId, classId)).reduce(
    (s, t) => s + t.amount,
    0,
  );
}

export type LeaderboardRow = {
  student: { id: string; displayName: string; avatar: AvatarId };
  xp: number;
  rank: number;
};

/** Clasamentul unei clase. La XP egal, elevii împart locul (1, 2, 2, 4). */
export async function getLeaderboard(
  classId: string,
): Promise<LeaderboardRow[]> {
  if (!isUuid(classId)) return [];
  const supabase = await db();
  const rows = must(
    "Clasamentul",
    await supabase.rpc("class_leaderboard", { p_class: classId }),
  );
  return rows.map((r) => ({
    student: {
      id: r.student_id,
      displayName: r.display_name,
      avatar: (r.avatar ?? "fox") as AvatarId,
    },
    xp: Number(r.xp),
    rank: Number(r.rank),
  }));
}

/** XP-ul și locul elevului în clasamentul unei clase. */
export async function getClassStanding(classId: string, studentId: string) {
  const board = await getLeaderboard(classId);
  const row = board.find((r) => r.student.id === studentId);
  return { xp: row?.xp ?? 0, rank: row?.rank, size: board.length };
}
