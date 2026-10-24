import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getClass } from "@/lib/db/classes";

/**
 * Elevul logat și clasa cerută. Dacă elevul nu face parte din clasă,
 * pagina răspunde cu 404 (regulile RLS nu întorc clasa).
 */
export async function loadStudentClass(params: Promise<{ id: string }>) {
  const { id } = await params;
  const viewer = await requireUser("student");
  const classRoom = await getClass(id);
  if (!classRoom || !classRoom.studentIds.includes(viewer.id)) notFound();
  return { viewer, classRoom };
}
