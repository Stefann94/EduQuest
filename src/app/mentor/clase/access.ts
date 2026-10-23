// Verificarea accesului în Server Actions: mentorul poate modifica doar clasele lui.
// Ascunderea butoanelor în interfață nu e suficientă (docs/PROJECT.md §12.3).

import { getClass, getViewer } from "@/lib/data/queries";

export async function ownedClass(classId: string) {
  const me = await getViewer("mentor");
  const c = await getClass(me, classId);
  return c ? { me, classRoom: c } : undefined;
}

export const NO_ACCESS =
  "Nu ai acces la această clasă sau clasa nu mai există.";

export const DEMO_NOTE =
  "Demo: modificarea se salvează după conectarea la baza de date.";
