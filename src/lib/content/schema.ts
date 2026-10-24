// Blocurile de conținut ale lecțiilor și materialelor. Fiecare tip are propriul stil în
// interfață (vezi components/learning/content-blocks.tsx), deci autorul alege doar tipul,
// iar fonturile și culorile vin automat.
//
// În text se pot folosi: `cod` (font mono, colorat), **important** (îngroșat) și *termen* (cursiv).

import { z } from "zod";

const text = z.string().min(1);
const code = z.object({
  language: z.string().default("python"),
  code: text,
});

/** Tonul unui bloc evidențiat: fiecare are culoarea și iconița lui. */
export const CALLOUT_TONES = [
  "tip",
  "info",
  "warning",
  "analogy",
  "remember",
] as const;
/** Culorile cardurilor (aceleași accente ca restul platformei). */
export const ACCENTS = ["pink", "cyan", "yellow", "orange", "green"] as const;

export const contentBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), text }),
  z.object({ type: z.literal("paragraph"), text }),
  z.object({
    type: z.literal("code"),
    language: z.string().default("python"),
    code: text,
    /** Numele fișierului sau o etichetă scurtă deasupra codului. */
    title: z.string().optional(),
    /** Ce afișează programul, arătat ca un terminal sub cod. */
    output: z.string().optional(),
  }),
  z.object({
    type: z.literal("list"),
    items: z.array(text).min(1),
    ordered: z.boolean().optional(),
  }),
  // Păstrat pentru materialele existente; în lecții se folosește „callout”.
  z.object({ type: z.literal("note"), text }),
  z.object({
    type: z.literal("callout"),
    tone: z.enum(CALLOUT_TONES),
    title: z.string().optional(),
    text,
  }),
  z.object({
    type: z.literal("table"),
    columns: z.array(z.string()).min(1),
    rows: z.array(z.array(z.string())).min(1),
    caption: z.string().optional(),
  }),
  /** Greșit / corect, unul lângă altul. */
  z.object({
    type: z.literal("compare"),
    wrong: code.extend({ label: z.string().default("Greșit") }),
    right: code.extend({ label: z.string().default("Corect") }),
    note: z.string().optional(),
  }),
  /** Urmărirea pas cu pas a valorilor variabilelor (ca pe tablă). */
  z.object({
    type: z.literal("trace"),
    title: z.string().optional(),
    columns: z.array(z.string()).min(1),
    rows: z.array(z.array(z.string())).min(1),
    note: z.string().optional(),
  }),
  /** Variabile desenate ca niște cutii cu etichetă. */
  z.object({
    type: z.literal("boxes"),
    items: z
      .array(
        z.object({
          name: z.string(),
          value: z.string(),
          kind: z.string().optional(),
        }),
      )
      .min(1),
    caption: z.string().optional(),
  }),
  /** O funcție ca o mașinărie: intrare → funcție → ieșire. */
  z.object({
    type: z.literal("machine"),
    input: z.string(),
    name: z.string(),
    output: z.string(),
    caption: z.string().optional(),
  }),
  /** Literele unui șir, cu indicii (pozitivi și negativi) și o porțiune evidențiată. */
  z.object({
    type: z.literal("chars"),
    text,
    /** Indicii evidențiați (ex. rezultatul unei felieri). */
    highlight: z.array(z.number().int().nonnegative()).optional(),
    caption: z.string().optional(),
  }),
  /** Carduri colorate unul lângă altul (ex. operatori, moduri de fișier). */
  z.object({
    type: z.literal("cards"),
    items: z
      .array(
        z.object({
          title: z.string(),
          text,
          code: z.string().optional(),
          accent: z.enum(ACCENTS).optional(),
        }),
      )
      .min(1),
  }),
  /** Pași în ordine, pe o linie (ex. planul unui proiect). */
  z.object({
    type: z.literal("steps"),
    items: z.array(z.object({ title: z.string(), text })).min(2),
  }),
  /** Exercițiu: enunț, indiciu opțional și soluția ascunsă până o ceri. */
  z.object({
    type: z.literal("exercise"),
    title: z.string(),
    text,
    hint: z.string().optional(),
    starter: z.string().optional(),
    solution: code,
    output: z.string().optional(),
    explanation: z.string().optional(),
  }),
  /** Rezumatul lecției. */
  z.object({
    type: z.literal("keypoints"),
    title: z.string().optional(),
    items: z.array(text).min(1),
  }),
]);

export type ContentBlock = z.infer<typeof contentBlockSchema>;
export type CalloutTone = (typeof CALLOUT_TONES)[number];
export type Accent = (typeof ACCENTS)[number];

export const lessonSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{3,60}$/),
  title: z.string().min(3).max(120),
  summary: z.string(),
  durationMin: z.number().int().min(1).max(240),
  blocks: z.array(contentBlockSchema).min(1),
});

export const courseSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{3,60}$/),
  title: z.string().min(3).max(120),
  subtitle: z.string(),
  description: z.string(),
  topic: z.string(),
  level: z.string(),
  accent: z.enum(ACCENTS),
  lessons: z.array(lessonSchema).min(1),
});

export type CourseSource = z.input<typeof courseSchema>;
