"use server";

import { z } from "zod";
import {
  emailSchema,
  type FormState,
  firstErrors,
  readForm,
} from "../_lib/validation";

const FIELDS = [
  "fullName",
  "email",
  "phone",
  "background",
  "intendedUse",
  "evidence",
] as const;
type Field = (typeof FIELDS)[number] | "consent";

export type MentorApplicationState = FormState<
  Field,
  { fullName: string; email: string }
>;

const longText = (what: string, min: number) =>
  z
    .string()
    .trim()
    .min(1, { error: `Descrie ${what}.` })
    .min(min, {
      error: `Scrie cel puțin ${min} ${min >= 20 ? "de " : ""}caractere, ca să putem înțelege contextul.`,
    })
    .max(2000, { error: "Textul poate avea cel mult 2000 de caractere." });

const schema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, { error: "Scrie numele complet." })
    .max(80, { error: "Numele poate avea cel mult 80 de caractere." }),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .min(1, { error: "Scrie un număr de telefon." })
    .refine(
      (v) => /^\+?[\d\s().-]+$/.test(v) && v.replace(/\D/g, "").length >= 10,
      {
        error: "Numărul de telefon nu pare corect. Exemplu: 0722 123 456.",
      },
    ),
  background: longText("experiența ta educațională sau profesională", 30),
  intendedUse: longText("cum vrei să folosești platforma", 30),
  evidence: longText("informațiile care îți susțin aplicația", 10),
});

/** Trimite o aplicație de mentor. Nu creează un cont activ: aplicația intră la verificare. */
export async function applyAsMentor(
  _prev: MentorApplicationState,
  formData: FormData,
): Promise<MentorApplicationState> {
  const values = readForm(formData, FIELDS);
  const parsed = schema.safeParse(values);
  const errors: Partial<Record<Field, string>> = parsed.success
    ? {}
    : firstErrors(parsed.error);
  if (formData.get("consent") !== "on")
    errors.consent =
      "Ca să trimiți aplicația, confirmă că ești de acord cu folosirea datelor pentru verificare.";

  if (!parsed.success || Object.keys(errors).length > 0)
    return { status: "error", errors, values };

  // Demo: aici s-ar salva aplicația cu starea „În așteptare” și s-ar anunța administratorii.
  return {
    status: "success",
    fullName: parsed.data.fullName,
    email: parsed.data.email,
  };
}
