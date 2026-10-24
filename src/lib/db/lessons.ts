import "server-only";
import { type ItemKind, type LessonItem, parseItem } from "@/lib/content/items";
import type { Database } from "@/lib/supabase/database.types";
import { db, isUuid, must } from "./core";

export type LessonDisplay = Database["public"]["Enums"]["lesson_display"];

/** Un material, cu linkul de descărcare pentru PDF-uri (valabil o oră). */
export type LessonItemView = LessonItem & {
  position: number;
  fileUrl?: string;
};

/** O lecție așa cum apare într-o clasă: cu numărul ei din clasă și materialele. */
export type ClassLesson = {
  id: string;
  title: string;
  summary: string;
  authorId: string;
  number: number;
  display: LessonDisplay;
  published: boolean;
  items: LessonItemView[];
};

export type LessonPlacement = {
  classId: string;
  number: number;
  display: LessonDisplay;
  published: boolean;
};

/** O lecție din biblioteca mentorului, cu toate clasele în care e folosită. */
export type LibraryLesson = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  items: LessonItemView[];
  classes: LessonPlacement[];
};

type ItemRow = {
  id: string;
  kind: ItemKind;
  title: string;
  position: number;
  published: boolean;
  content: unknown;
};

const ITEM_FIELDS = "id, kind, title, position, published, content";

/** Rândurile devin materiale validate, în ordine; PDF-urile primesc link semnat. */
async function toItems(rows: ItemRow[]): Promise<LessonItemView[]> {
  const items = rows
    .flatMap((r) => {
      const item = parseItem(r);
      return item ? [{ ...item, position: r.position }] : [];
    })
    .sort((a, b) => a.position - b.position);
  const pdfs = items.filter((i) => i.kind === "pdf");
  if (pdfs.length === 0) return items;
  const supabase = await db();
  const { data } = await supabase.storage.from("materials").createSignedUrls(
    pdfs.map((p) => (p.kind === "pdf" ? p.content.path : "")),
    3600,
  );
  const urls = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
  return items.map((i) =>
    i.kind === "pdf" ? { ...i, fileUrl: urls.get(i.content.path) } : i,
  ) as LessonItemView[];
}

/** Titlul lecției în clasă, după cum a ales mentorul: „Lecția 3”, titlul sau amândouă. */
export function lessonLabel(l: {
  number: number;
  title: string;
  display: LessonDisplay;
}) {
  if (l.display === "number") return `Lecția ${l.number}`;
  if (l.display === "title") return l.title;
  return `Lecția ${l.number}: ${l.title}`;
}

/**
 * Lecțiile unei clase, în ordinea numerelor. Elevii primesc doar lecțiile și
 * materialele publicate (filtrate și de regulile RLS).
 */
export async function getClassLessons(
  classId: string,
  opts: { includeHidden?: boolean } = {},
): Promise<ClassLesson[]> {
  if (!isUuid(classId)) return [];
  const supabase = await db();
  const rows = must(
    "Lecțiile clasei",
    await supabase
      .from("lesson_classes")
      .select(
        `number, display, published,
         lesson:lessons!lesson_classes_lesson_id_fkey(id, title, summary, author_id, lesson_items(${ITEM_FIELDS}))`,
      )
      .eq("class_id", classId)
      .order("number"),
  );
  const out: ClassLesson[] = [];
  for (const r of rows) {
    if (!r.lesson || (!r.published && !opts.includeHidden)) continue;
    const items = await toItems(r.lesson.lesson_items as ItemRow[]);
    out.push({
      id: r.lesson.id,
      title: r.lesson.title,
      summary: r.lesson.summary,
      authorId: r.lesson.author_id,
      number: r.number,
      display: r.display,
      published: r.published,
      items: opts.includeHidden ? items : items.filter((i) => i.published),
    });
  }
  return out;
}

const LIBRARY_FIELDS = `id, title, summary, created_at, lesson_items(${ITEM_FIELDS}),
  lesson_classes(class_id, number, display, published)`;

type LibraryRow = {
  id: string;
  title: string;
  summary: string;
  created_at: string;
  lesson_items: ItemRow[];
  lesson_classes: {
    class_id: string;
    number: number;
    display: LessonDisplay;
    published: boolean;
  }[];
};

async function toLibrary(r: LibraryRow): Promise<LibraryLesson> {
  return {
    id: r.id,
    title: r.title,
    summary: r.summary,
    createdAt: r.created_at,
    items: await toItems(r.lesson_items),
    classes: r.lesson_classes.map((c) => ({
      classId: c.class_id,
      number: c.number,
      display: c.display,
      published: c.published,
    })),
  };
}

/** Lecțiile scrise de mentor (fără cele din cursurile globale), cele mai noi primele. */
export async function getMentorLessons(
  mentorId: string,
): Promise<LibraryLesson[]> {
  const supabase = await db();
  const rows = must(
    "Lecțiile",
    await supabase
      .from("lessons")
      .select(LIBRARY_FIELDS)
      .eq("author_id", mentorId)
      .is("course_id", null)
      .order("created_at", { ascending: false }),
  ) as LibraryRow[];
  return Promise.all(rows.map(toLibrary));
}

/** O lecție pentru editor, doar dacă mentorul e autorul ei. */
export async function getLessonForEditor(mentorId: string, id: string) {
  if (!isUuid(id)) return undefined;
  const supabase = await db();
  const { data } = await supabase
    .from("lessons")
    .select(LIBRARY_FIELDS)
    .eq("id", id)
    .eq("author_id", mentorId)
    .is("course_id", null)
    .maybeSingle();
  return data ? toLibrary(data as LibraryRow) : undefined;
}

/** Următorul număr liber într-o clasă (pentru o lecție nouă adăugată la final). */
export async function nextLessonNumber(classId: string) {
  const supabase = await db();
  const { data } = await supabase
    .from("lesson_classes")
    .select("number")
    .eq("class_id", classId)
    .order("number", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.number ?? 0) + 1;
}
