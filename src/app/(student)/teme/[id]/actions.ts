"use server";

import { z } from "zod";
import { getAssignmentForStudent, getViewer } from "@/lib/data/queries";
import { formatDateTime, now } from "@/lib/format";

// Regulile pentru fișiere, verificate și în browser, dar decise aici, pe server.
const ALLOWED_EXTENSIONS = [
  ".py",
  ".html",
  ".css",
  ".js",
  ".java",
  ".txt",
  ".pdf",
  ".zip",
];
const MAX_FILES = 3;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const fileSchema = z.object({
  name: z.string().trim().min(1).max(200),
  size: z.number().int(),
});

const schema = z.object({
  text: z
    .string()
    .max(50_000, "Textul este prea lung (maximum 50.000 de caractere)."),
  link: z
    .string()
    .trim()
    .max(500, "Link-ul este prea lung.")
    .refine((v) => v === "" || isHttpUrl(v), {
      message: "Introdu un link valid, care începe cu http:// sau https://.",
    }),
  files: z
    .array(fileSchema)
    .max(MAX_FILES, `Poți atașa cel mult ${MAX_FILES} fișiere.`)
    .superRefine((files, ctx) => {
      for (const f of files) {
        const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext))
          ctx.addIssue({
            code: "custom",
            message: `${f.name}: tip de fișier nepermis.`,
          });
        else if (f.size <= 0)
          ctx.addIssue({
            code: "custom",
            message: `${f.name}: fișierul este gol.`,
          });
        else if (f.size > MAX_FILE_BYTES)
          ctx.addIssue({
            code: "custom",
            message: `${f.name}: depășește 5 MB.`,
          });
      }
    }),
});

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

export type SubmitFieldErrors = {
  text?: string[];
  link?: string[];
  files?: string[];
  form?: string[];
};

export type SubmitAssignmentState =
  | { status: "idle" }
  | { status: "error"; errors: SubmitFieldErrors }
  | {
      status: "success";
      at: string;
      atLabel: string;
      isResubmission: boolean;
      /** +2 XP doar la prima trimitere validă. */
      submissionXp: number;
      summary: { textChars: number; files: string[]; link?: string };
    };

/**
 * Trimite o temă. Fișierele ajung în demo doar ca nume și mărime: cu Supabase,
 * browserul le încarcă direct în Storage (link semnat), iar aici verificăm aceleași reguli.
 * În demo nu se salvează nimic.
 */
export async function submitAssignment(
  assignmentId: string,
  _prev: SubmitAssignmentState,
  formData: FormData,
): Promise<SubmitAssignmentState> {
  const me = await getViewer("student");
  const assignment = await getAssignmentForStudent(me.id, assignmentId);
  if (!assignment)
    return {
      status: "error",
      errors: { form: ["Tema nu există sau nu ai acces la ea."] },
    };

  const state = assignment.submissionState;
  if (state !== "not_started" && state !== "needs_changes") {
    if (!assignment.allowResubmit)
      return {
        status: "error",
        errors: { form: ["Mentorul nu a permis retrimiterea acestei teme."] },
      };
  }

  let files: unknown = [];
  try {
    files = JSON.parse(String(formData.get("files") ?? "[]"));
  } catch {
    return {
      status: "error",
      errors: { files: ["Lista de fișiere nu a putut fi citită."] },
    };
  }

  const parsed = schema.safeParse({
    text: String(formData.get("text") ?? ""),
    link: String(formData.get("link") ?? ""),
    files,
  });
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return { status: "error", errors: fieldErrors };
  }

  const { text, link, files: list } = parsed.data;
  // Spațiile goale nu contează: e nevoie de cel puțin un element cu conținut.
  if (text.trim() === "" && link === "" && list.length === 0)
    return {
      status: "error",
      errors: {
        form: [
          "Adaugă codul sau textul soluției, un fișier sau un link înainte de a trimite.",
        ],
      },
    };

  const at = now().toISOString();
  const isResubmission = !!assignment.submission;
  return {
    status: "success",
    at,
    atLabel: formatDateTime(at),
    isResubmission,
    submissionXp: isResubmission ? 0 : 2,
    summary: {
      textChars: text.trim().length,
      files: list.map((f) => f.name),
      link: link || undefined,
    },
  };
}
