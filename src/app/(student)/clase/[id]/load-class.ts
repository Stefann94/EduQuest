import { notFound } from "next/navigation";
import { getClass, getViewer } from "@/lib/data/queries";

/**
 * Elevul logat și clasa cerută. Dacă elevul nu face parte din clasă,
 * pagina răspunde cu 404 (accesul se verifică pe server, în getClass).
 */
export async function loadStudentClass(params: Promise<{ id: string }>) {
  const { id } = await params;
  const viewer = await getViewer("student");
  const classRoom = await getClass(viewer, id);
  if (!classRoom) notFound();
  return { viewer, classRoom };
}
