import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getClass } from "@/lib/db/classes";

/** Mentorul logat și clasa lui. O clasă a altui mentor răspunde cu 404. */
export async function loadMentorClass(params: Promise<{ id: string }>) {
  const { id } = await params;
  const me = await requireUser("mentor");
  const classRoom = await getClass(id);
  if (!classRoom || classRoom.mentorId !== me.id) notFound();
  return { me, classRoom };
}
