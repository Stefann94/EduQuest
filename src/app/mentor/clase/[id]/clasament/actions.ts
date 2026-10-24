"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db/core";
import { formatXp } from "@/lib/format";
import { NO_ACCESS, ownedClass } from "../../access";

export type AdjustXpState =
  | { status: "idle" }
  | { status: "success"; message: string; note: string }
  | {
      status: "error";
      message?: string;
      errors: Partial<Record<"amount" | "reason", string>>;
    };

const schema = z.object({
  amount: z.coerce
    .number({ error: "Scrie un număr întreg." })
    .int("Scrie un număr întreg, fără zecimale.")
    .min(-10, "Ajustarea este între -10 și +10 XP.")
    .max(10, "Ajustarea este între -10 și +10 XP.")
    .refine((n) => n !== 0, { error: "Ajustarea nu poate fi 0." }),
  reason: z
    .string()
    .trim()
    .min(5, "Scrie motivul ajustării (cel puțin 5 caractere).")
    .max(200, "Motivul are cel mult 200 de caractere."),
});

/**
 * Ajustare manuală de XP, făcută de mentorul clasei. Se înregistrează în istoricul
 * de XP cu sursa „Corectare” și motivul scris (adjust_xp, în baza de date).
 */
export async function adjustXp(
  _prev: AdjustXpState,
  formData: FormData,
): Promise<AdjustXpState> {
  const owned = await ownedClass(String(formData.get("classId") ?? ""));
  if (!owned) return { status: "error", message: NO_ACCESS, errors: {} };
  const student = owned.classRoom.students.find(
    (s) => s.id === String(formData.get("studentId") ?? ""),
  );
  if (!student)
    return {
      status: "error",
      message: "Elevul nu face parte din această clasă.",
      errors: {},
    };

  const rawAmount = String(formData.get("amount") ?? "").trim();
  const parsed = schema.safeParse({
    amount: rawAmount === "" ? Number.NaN : rawAmount,
    reason: String(formData.get("reason") ?? ""),
  });
  if (!parsed.success) {
    const errors: Partial<Record<"amount" | "reason", string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as "amount" | "reason";
      errors[key] ??= issue.message;
    }
    return { status: "error", errors };
  }

  const supabase = await db();
  const { error } = await supabase.rpc("adjust_xp", {
    p_student: student.id,
    p_class: owned.classRoom.id,
    p_amount: parsed.data.amount,
    p_label: parsed.data.reason,
  });
  if (error)
    return {
      status: "error",
      message: "Ajustarea nu s-a putut salva. Încearcă din nou.",
      errors: {},
    };
  revalidatePath(`/mentor/clase/${owned.classRoom.id}`, "layout");
  return {
    status: "success",
    message: `${formatXp(parsed.data.amount)} pentru ${student.displayName}`,
    note: `Motiv: ${parsed.data.reason}. Apare în istoricul de XP al elevului.`,
  };
}
