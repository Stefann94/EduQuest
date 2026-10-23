"use server";

import { z } from "zod";
import {
  type FormState,
  GLOBAL,
  invalid,
  isHttpUrl,
  json,
  LANGUAGE_VALUES,
  lines,
  text,
  toFieldErrors,
} from "@/components/mentor-content/form-state";
import { canEditContent } from "@/lib/data/mentor-content-queries";
import {
  getMaterial,
  getMentorClasses,
  getViewer,
  getWorkedProblem,
} from "@/lib/data/queries";
import type { User } from "@/lib/data/types";

// Acțiunile pentru materiale și probleme rezolvate.
// În demo validează datele și verifică accesul, fără să salveze nimic.

const MAX_PDF_BYTES = 10 * 1024 * 1024;

async function ownedClassIds(me: User) {
  const { active, archived } = await getMentorClasses(me.id);
  return [...active, ...archived].map((c) => c.id);
}

const classField = (allowed: string[]) =>
  z
    .string()
    .refine(
      (v) => v === GLOBAL || allowed.includes(v),
      "Alege una dintre clasele tale sau „Resursă globală”.",
    );

const statusField = z.enum(["draft", "published"], {
  error: "Alege dacă materialul rămâne ciornă sau se publică.",
});

/* ---------- Materiale ---------- */

export async function saveMaterial(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const me = await getViewer("mentor");
  const owned = await ownedClassIds(me);
  const id = text(formData, "id");

  if (id) {
    const existing = await getMaterial(me, id);
    if (!existing || !canEditContent(me.id, existing))
      return {
        status: "error",
        message: "Nu poți modifica acest material.",
        errors: {},
      };
  }

  const schema = z
    .object({
      title: z
        .string()
        .trim()
        .min(3, "Titlul are cel puțin 3 caractere.")
        .max(120, "Titlul are cel mult 120 de caractere."),
      description: z
        .string()
        .trim()
        .min(10, "Scrie o descriere scurtă, de cel puțin 10 caractere.")
        .max(300, "Descrierea are cel mult 300 de caractere."),
      topic: z
        .string()
        .trim()
        .min(2, "Scrie tema, de exemplu „Python · Bazele”.")
        .max(60, "Tema are cel mult 60 de caractere."),
      classId: classField(owned),
      kind: z.enum(["article", "pdf", "link", "video"], {
        error: "Alege tipul materialului.",
      }),
      content: z.string().trim(),
      code: z.string(),
      codeLanguage: z.enum(LANGUAGE_VALUES, {
        error: "Alege limbajul exemplului de cod.",
      }),
      url: z.string().trim(),
      fileName: z.string(),
      fileSize: z.number(),
      keepFile: z.boolean(),
      tags: z
        .array(z.string().max(30, "O etichetă are cel mult 30 de caractere."))
        .max(8, "Folosește cel mult 8 etichete."),
      status: statusField,
    })
    .superRefine((v, ctx) => {
      if (v.kind === "article" && v.content.length < 20)
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "Scrie conținutul lecției (cel puțin 20 de caractere).",
        });
      if (v.kind === "pdf" && !v.keepFile) {
        if (!v.fileName)
          ctx.addIssue({
            code: "custom",
            path: ["file"],
            message: "Alege fișierul PDF.",
          });
        else if (!v.fileName.toLowerCase().endsWith(".pdf"))
          ctx.addIssue({
            code: "custom",
            path: ["file"],
            message: "Fișierul trebuie să fie PDF.",
          });
        else if (v.fileSize <= 0 || v.fileSize > MAX_PDF_BYTES)
          ctx.addIssue({
            code: "custom",
            path: ["file"],
            message: "Fișierul are cel mult 10 MB.",
          });
      }
      if ((v.kind === "link" || v.kind === "video") && !isHttpUrl(v.url))
        ctx.addIssue({
          code: "custom",
          path: ["url"],
          message: "Introdu un link complet, care începe cu https://.",
        });
    });

  const parsed = schema.safeParse({
    title: text(formData, "title"),
    description: text(formData, "description"),
    topic: text(formData, "topic"),
    classId: text(formData, "classId"),
    kind: text(formData, "kind"),
    content: text(formData, "content"),
    code: text(formData, "code"),
    codeLanguage: text(formData, "codeLanguage") || "python",
    url: text(formData, "url"),
    fileName: text(formData, "fileName"),
    fileSize: Number(text(formData, "fileSize")) || 0,
    keepFile: text(formData, "keepFile") === "1",
    tags: text(formData, "tags")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean),
    status: text(formData, "status"),
  });
  if (!parsed.success) return invalid(toFieldErrors(parsed.error));

  const v = parsed.data;
  const published = v.status === "published";
  return {
    status: "success",
    message: id
      ? "Modificările au fost salvate."
      : published
        ? "Materialul a fost publicat."
        : "Materialul a fost salvat ca ciornă.",
    detail: published
      ? v.classId === GLOBAL
        ? "Resursa globală e vizibilă pentru toți elevii. Demo: salvarea reală vine cu baza de date."
        : "Elevii clasei primesc o notificare. Demo: salvarea reală vine cu baza de date."
      : undefined,
  };
}

/* ---------- Probleme rezolvate ---------- */

export async function saveProblem(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const me = await getViewer("mentor");
  const owned = await ownedClassIds(me);
  const id = text(formData, "id");

  if (id) {
    const existing = await getWorkedProblem(me, id);
    if (!existing || !canEditContent(me.id, existing))
      return {
        status: "error",
        message: "Nu poți modifica această problemă.",
        errors: {},
      };
  }

  const schema = z.object({
    title: z
      .string()
      .trim()
      .min(3, "Titlul are cel puțin 3 caractere.")
      .max(120, "Titlul are cel mult 120 de caractere."),
    topic: z
      .string()
      .trim()
      .min(2, "Scrie tema, de exemplu „Python · Bucle”.")
      .max(60, "Tema are cel mult 60 de caractere."),
    difficulty: z.enum(["1", "2", "3"], { error: "Alege dificultatea." }),
    classId: classField(owned),
    statement: z
      .string()
      .trim()
      .min(20, "Scrie enunțul problemei (cel puțin 20 de caractere)."),
    constraints: z
      .array(z.string().max(200, "O restricție are cel mult 200 de caractere."))
      .max(10, "Folosește cel mult 10 restricții."),
    examples: z
      .array(
        z.object({
          input: z.string().trim().min(1, "Scrie datele de intrare."),
          output: z.string().trim().min(1, "Scrie rezultatul așteptat."),
          note: z
            .string()
            .trim()
            .max(200, "Nota are cel mult 200 de caractere."),
        }),
        { error: "Exemplele nu au putut fi citite." },
      )
      .max(6, "Folosește cel mult 6 exemple."),
    solutionCode: z.string().trim().min(5, "Scrie codul soluției."),
    solutionLanguage: z.enum(LANGUAGE_VALUES, {
      error: "Alege limbajul soluției.",
    }),
    explanation: z
      .array(z.string().trim().min(3, "Completează pasul sau șterge-l."), {
        error: "Pașii nu au putut fi citiți.",
      })
      .max(10, "Folosește cel mult 10 pași."),
    status: statusField,
  });

  const parsed = schema.safeParse({
    title: text(formData, "title"),
    topic: text(formData, "topic"),
    difficulty: text(formData, "difficulty"),
    classId: text(formData, "classId"),
    statement: text(formData, "statement"),
    constraints: lines(text(formData, "constraints")),
    examples: json(formData, "examples"),
    solutionCode: text(formData, "solutionCode"),
    solutionLanguage: text(formData, "solutionLanguage"),
    explanation: json(formData, "explanation"),
    status: text(formData, "status"),
  });
  if (!parsed.success) return invalid(toFieldErrors(parsed.error));

  const published = parsed.data.status === "published";
  return {
    status: "success",
    message: id
      ? "Modificările au fost salvate."
      : published
        ? "Problema a fost publicată."
        : "Problema a fost salvată ca ciornă.",
  };
}

/* ---------- Publicare și ștergere ---------- */

export type ContentKind = "material" | "problem";

export type ContentActionResult =
  | { ok: true; message: string; detail: string }
  | { ok: false; message: string };

async function findEditable(kind: ContentKind, id: string) {
  const me = await getViewer("mentor");
  const item =
    kind === "material"
      ? await getMaterial(me, id)
      : await getWorkedProblem(me, id);
  if (!item || !canEditContent(me.id, item)) return undefined;
  return item;
}

const NOUN = {
  material: {
    one: "Materialul",
    done: "publicat",
    undone: "retras",
    deleted: "șters",
  },
  problem: {
    one: "Problema",
    done: "publicată",
    undone: "retrasă",
    deleted: "ștearsă",
  },
} as const;

export async function setContentStatus(
  kind: ContentKind,
  id: string,
  status: "draft" | "published",
): Promise<ContentActionResult> {
  const item = await findEditable(kind, id);
  if (!item) return { ok: false, message: "Nu poți modifica acest conținut." };
  const n = NOUN[kind];
  if (status === "published")
    return {
      ok: true,
      message: `${n.one} „${item.title}” a fost ${n.done}.`,
      detail:
        item.classId === null
          ? "Resursa globală e acum vizibilă pentru toți elevii. Demo: salvarea reală vine cu baza de date."
          : "Elevii clasei primesc o notificare. Demo: salvarea reală vine cu baza de date.",
    };
  return {
    ok: true,
    message: `${n.one} „${item.title}” a fost ${n.undone} de la publicare.`,
    detail:
      "Elevii nu mai pot deschide conținutul până la o nouă publicare; trimiterile și istoricul lor se păstrează. Demo: salvarea reală vine cu baza de date.",
  };
}

export async function deleteContent(
  kind: ContentKind,
  id: string,
): Promise<ContentActionResult> {
  const item = await findEditable(kind, id);
  if (!item) return { ok: false, message: "Nu poți șterge acest conținut." };
  return {
    ok: true,
    message: `${NOUN[kind].one} „${item.title}” a fost ${NOUN[kind].deleted}.`,
    detail:
      "Trimiterile elevilor și istoricul activității rămân neschimbate. Demo: ștergerea reală vine cu baza de date.",
  };
}
