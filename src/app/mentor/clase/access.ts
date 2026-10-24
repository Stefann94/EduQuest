// Verificarea accesului în Server Actions: mentorul poate modifica doar clasele lui.
// Ascunderea butoanelor în interfață nu e suficientă; regulile RLS verifică din nou.

import { requireUser } from "@/lib/auth";
import { getClass } from "@/lib/db/classes";

export async function ownedClass(classId: string) {
  const me = await requireUser("mentor");
  const c = await getClass(classId);
  return c && c.mentorId === me.id ? { me, classRoom: c } : undefined;
}

export const NO_ACCESS =
  "Nu ai acces la această clasă sau clasa nu mai există.";
