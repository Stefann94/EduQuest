// Materialele unei lecții. Tabelul lesson_items are un câmp `content` (jsonb) al cărui
// conținut depinde de tip; aici e validarea lui, folosită la salvare și la citire.

import { z } from "zod";
import { contentBlockSchema } from "./schema";

export const ITEM_KINDS = [
  "article",
  "pdf",
  "link",
  "video",
  "problem",
] as const;
export type ItemKind = (typeof ITEM_KINDS)[number];

export const articleContent = z.object({
  blocks: z.array(contentBlockSchema).min(1),
});

export const pdfContent = z.object({
  /** Calea în bucket-ul „materials”: <lesson_id>/<fișier>.pdf */
  path: z.string().min(1),
  name: z.string().min(1),
  sizeKb: z.number().int().nonnegative(),
});

export const linkContent = z.object({
  url: z.url({ protocol: /^https?$/ }),
  note: z.string().max(500).optional(),
});

/** Problemă cu enunț, „încearcă singur” și rezolvarea ascunsă până o ceri. */
export const problemContent = z.object({
  /** Enunțul: paragrafe separate prin rând gol; în text merg `cod` și **important**. */
  statement: z.string().min(1),
  examples: z
    .array(
      z.object({
        input: z.string(),
        output: z.string(),
        note: z.string().optional(),
      }),
    )
    .default([]),
  constraints: z.array(z.string()).default([]),
  hint: z.string().optional(),
  starter: z.string().optional(),
  language: z.string().default("python"),
  solution: z.string().min(1),
  /** Ce afișează rezolvarea (opțional), arătat ca un terminal. */
  output: z.string().optional(),
  explanation: z.string().optional(),
});

export const itemContentSchema = {
  article: articleContent,
  pdf: pdfContent,
  link: linkContent,
  video: linkContent,
  problem: problemContent,
} as const;

export type ArticleContent = z.infer<typeof articleContent>;
export type PdfContent = z.infer<typeof pdfContent>;
export type LinkContent = z.infer<typeof linkContent>;
export type ProblemContent = z.infer<typeof problemContent>;

export type LessonItem =
  | {
      id: string;
      kind: "article";
      title: string;
      published: boolean;
      content: ArticleContent;
    }
  | {
      id: string;
      kind: "pdf";
      title: string;
      published: boolean;
      content: PdfContent;
    }
  | {
      id: string;
      kind: "link" | "video";
      title: string;
      published: boolean;
      content: LinkContent;
    }
  | {
      id: string;
      kind: "problem";
      title: string;
      published: boolean;
      content: ProblemContent;
    };

/** Un rând din baza de date devine un material validat (sau null dacă e stricat). */
export function parseItem(row: {
  id: string;
  kind: ItemKind;
  title: string;
  published: boolean;
  content: unknown;
}): LessonItem | null {
  const parsed = itemContentSchema[row.kind].safeParse(row.content);
  if (!parsed.success) return null;
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    published: row.published,
    content: parsed.data,
  } as LessonItem;
}

export const ITEM_LABEL: Record<ItemKind, string> = {
  article: "Lecție scrisă",
  pdf: "PDF",
  link: "Link",
  video: "Video",
  problem: "Problemă",
};
