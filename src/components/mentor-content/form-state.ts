// Starea comună a formularelor din zona de conținut a mentorului.
// Folosită atât de Server Actions (pe server), cât și de formulare (în browser).

import type { z } from "zod";

/** Erorile pe câmpuri, după calea câmpului: „title”, „examples.1.output”, „questions.0.options”. */
export type FieldErrors = Record<string, string>;

export type FormState =
  | { status: "idle" }
  | { status: "error"; message: string; errors: FieldErrors }
  | { status: "success"; message: string; detail?: string };

export const IDLE: FormState = { status: "idle" };

/** Transformă erorile zod în mesaje pe câmpuri (primul mesaj pentru fiecare câmp). */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "form";
    if (!(key in errors)) errors[key] = issue.message;
  }
  return errors;
}

export function invalid(errors: FieldErrors): FormState {
  return {
    status: "error",
    message: "Verifică câmpurile marcate și încearcă din nou.",
    errors,
  };
}

/** Citește un câmp text din FormData. */
export function text(fd: FormData, name: string) {
  const v = fd.get(name);
  return typeof v === "string" ? v : "";
}

/** Citește un câmp JSON (listele dinamice ale formularelor). */
export function json(fd: FormData, name: string): unknown {
  try {
    return JSON.parse(text(fd, name) || "null");
  } catch {
    return null;
  }
}

/** Liniile nevide dintr-un text cu câte un element pe rând. */
export function lines(value: string) {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Acceptă linkuri externe (http/https) și pagini din platformă („/invatare/...”). */
export function isLink(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function isHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export const DEMO_NOTE =
  "Demo: salvarea reală se face după conectarea la baza de date.";

/** Limbajele pentru exemplele de cod (aceleași ca în CodeBlock). */
export const CODE_LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
  { value: "text", label: "Text simplu" },
] as const;

export type CodeLanguage = (typeof CODE_LANGUAGES)[number]["value"];

export const LANGUAGE_VALUES = CODE_LANGUAGES.map((l) => l.value) as [
  CodeLanguage,
  ...CodeLanguage[],
];

/** Valoarea din select pentru „Resursă globală” (fără clasă). */
export const GLOBAL = "global";
