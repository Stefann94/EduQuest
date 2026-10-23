// Validarea datelor unei clase (nume, descriere, program), folosită de Server Actions
// la creare și la editare.

import { z } from "zod";
import { type ClassFieldErrors, WEEKDAYS } from "./schedule";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export const classDetailsSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Numele clasei are cel puțin 3 caractere.")
      .max(60, "Numele clasei are cel mult 60 de caractere."),
    description: z
      .string()
      .trim()
      .max(300, "Descrierea are cel mult 300 de caractere."),
    day: z.enum(WEEKDAYS, { error: "Alege ziua întâlnirilor." }),
    start: z.string().regex(TIME, "Alege ora de început."),
    end: z.string().regex(TIME, "Alege ora de sfârșit."),
  })
  .refine((v) => v.end > v.start, {
    path: ["end"],
    error: "Ora de sfârșit trebuie să fie după ora de început.",
  });

/** Primul mesaj de eroare pentru fiecare câmp. */
export function fieldErrors(error: z.ZodError): ClassFieldErrors {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}

export function readClassDetails(formData: FormData) {
  return classDetailsSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    day: String(formData.get("day") ?? ""),
    start: String(formData.get("start") ?? ""),
    end: String(formData.get("end") ?? ""),
  });
}

// Fără caractere ușor de confundat (0/O, 1/I/L), ca elevii să copieze corect codul.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Un cod de invitație nou, de 6 caractere. Cu Supabase se verifică și unicitatea. */
export function generateInviteCode() {
  const bytes = new Uint32Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join(
    "",
  );
}

/** Valorile trimise, ca formularul să le păstreze când apare o eroare. */
export function submittedValues(formData: FormData) {
  const get = (k: string) => String(formData.get(k) ?? "");
  return {
    name: get("name"),
    description: get("description"),
    day: get("day"),
    start: get("start"),
    end: get("end"),
  };
}
