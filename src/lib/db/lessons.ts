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

/** Un subfolder, pe scurt: pentru listele din folderul părinte. */
export type SubfolderSummary = {
  id: string;
  title: string;
  summary: string;
  /** Locul în folderul părinte, în aceeași ordine cu materialele. */
  position: number;
  /** Materiale direct în subfolder (vizibile celui care citește). */
  itemCount: number;
  /** Subfoldere direct în subfolder. */
  folderCount: number;
};

/**
 * O lecție așa cum apare într-o clasă: un folder (capitol) cu numărul lui din clasă,
 * materialele lui și subfolderele.
 */
export type ClassLesson = {
  id: string;
  title: string;
  summary: string;
  authorId: string;
  number: number;
  display: LessonDisplay;
  published: boolean;
  items: LessonItemView[];
  subfolders: SubfolderSummary[];
};

export type LessonPlacement = {
  classId: string;
  number: number;
  display: LessonDisplay;
  published: boolean;
};

/** O lecție (folder) din biblioteca mentorului, cu toate clasele în care e folosită. */
export type LibraryLesson = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  /** null = folder de pe primul nivel (se pune în clase); altfel, subfolder. */
  parentId: string | null;
  position: number;
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

/** Subfolderele directe ale unor foldere, cu câte materiale și subfoldere au. */
async function subfoldersOf(parentIds: string[]) {
  const out = new Map<string, SubfolderSummary[]>();
  if (parentIds.length === 0) return out;
  const supabase = await db();
  const rows = must(
    "Subfolderele",
    await supabase
      .from("lessons")
      .select(
        "id, title, summary, position, parent_id, created_at, lesson_items(id)",
      )
      .in("parent_id", parentIds)
      .order("position")
      .order("created_at"),
  );
  const grand = rows.length
    ? must(
        "Subfolderele",
        await supabase
          .from("lessons")
          .select("parent_id")
          .in(
            "parent_id",
            rows.map((r) => r.id),
          ),
      )
    : [];
  for (const r of rows) {
    const list = out.get(r.parent_id as string) ?? [];
    list.push({
      id: r.id,
      title: r.title,
      summary: r.summary,
      position: r.position,
      itemCount: r.lesson_items.length,
      folderCount: grand.filter((g) => g.parent_id === r.id).length,
    });
    out.set(r.parent_id as string, list);
  }
  return out;
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
  const subs = await subfoldersOf(
    rows.flatMap((r) => (r.lesson ? [r.lesson.id] : [])),
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
      subfolders: subs.get(r.lesson.id) ?? [],
    });
  }
  return out;
}

const LIBRARY_FIELDS = `id, title, summary, created_at, parent_id, position, lesson_items(${ITEM_FIELDS}),
  lesson_classes(class_id, number, display, published)`;

type LibraryRow = {
  id: string;
  title: string;
  summary: string;
  created_at: string;
  parent_id: string | null;
  position: number;
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
    parentId: r.parent_id,
    position: r.position,
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

/** Folderele de deasupra unui folder, de la primul nivel în jos (pentru „firimituri”). */
async function ancestorsOf(parentId: string | null) {
  const supabase = await db();
  const path: { id: string; title: string }[] = [];
  let cur = parentId;
  // Cel mult trei niveluri (regula din baza de date).
  for (let i = 0; cur && i < 5; i++) {
    const { data } = await supabase
      .from("lessons")
      .select("id, title, parent_id")
      .eq("id", cur)
      .maybeSingle();
    if (!data) break;
    path.unshift({ id: data.id, title: data.title });
    cur = data.parent_id;
  }
  return path;
}

/** O lecție (folder) pentru editor, doar dacă mentorul e autorul ei. */
/** Un folder cu tot conținutul lui, pentru editorul pe o singură pagină. */
export type FolderNode = {
  id: string;
  title: string;
  summary: string;
  position: number;
  items: LessonItemView[];
  children: FolderNode[];
};

/** Subfolderele unui folder, pe toate nivelurile (cel mult 3), cu materialele lor. */
async function folderTree(rootId: string): Promise<FolderNode[]> {
  const supabase = await db();
  const nodes = new Map<string, FolderNode>();
  const childrenOf = new Map<string, FolderNode[]>();
  let level = [rootId];
  for (let depth = 0; depth < 3 && level.length; depth++) {
    const rows = must(
      "Subfolderele",
      await supabase
        .from("lessons")
        .select(
          `id, title, summary, position, parent_id, created_at, lesson_items(${ITEM_FIELDS})`,
        )
        .in("parent_id", level)
        .order("position")
        .order("created_at"),
    );
    for (const r of rows) {
      const node: FolderNode = {
        id: r.id,
        title: r.title,
        summary: r.summary,
        position: r.position,
        items: await toItems(r.lesson_items as ItemRow[]),
        children: [],
      };
      nodes.set(r.id, node);
      const list = childrenOf.get(r.parent_id as string) ?? [];
      list.push(node);
      childrenOf.set(r.parent_id as string, list);
    }
    level = rows.map((r) => r.id);
  }
  for (const [id, node] of nodes) node.children = childrenOf.get(id) ?? [];
  return childrenOf.get(rootId) ?? [];
}

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
  if (!data) return undefined;
  const lesson = await toLibrary(data as LibraryRow);
  const [subs, path, children] = await Promise.all([
    subfoldersOf([lesson.id]),
    ancestorsOf(lesson.parentId),
    folderTree(lesson.id),
  ]);
  return {
    ...lesson,
    subfolders: subs.get(lesson.id) ?? [],
    path,
    children,
  };
}

export type EditorLesson = NonNullable<
  Awaited<ReturnType<typeof getLessonForEditor>>
>;

/**
 * Un folder dintr-o clasă (lecția de pe primul nivel sau un subfolder al ei), cu calea
 * până la el. Undefined dacă folderul nu ține de o lecție pusă în clasă.
 */
export async function getClassFolder(
  classId: string,
  folderId: string,
  opts: { includeHidden?: boolean } = {},
) {
  if (!isUuid(folderId)) return undefined;
  const lessons = await getClassLessons(classId, opts);
  const supabase = await db();
  const { data } = await supabase
    .from("lessons")
    .select(`id, title, summary, parent_id, lesson_items(${ITEM_FIELDS})`)
    .eq("id", folderId)
    .maybeSingle();
  if (!data) return undefined;
  const path = await ancestorsOf(data.parent_id);
  const rootId = path[0]?.id ?? data.id;
  const root = lessons.find((l) => l.id === rootId);
  if (!root) return undefined;
  const items = await toItems(data.lesson_items as ItemRow[]);
  const subs = await subfoldersOf([data.id]);
  return {
    root,
    lessons,
    /** Folderele de deasupra, fără lecția de pe primul nivel. */
    path: path.slice(1),
    folder: {
      id: data.id,
      title: data.title,
      summary: data.summary,
      isRoot: data.id === root.id,
      items: opts.includeHidden ? items : items.filter((i) => i.published),
      subfolders: subs.get(data.id) ?? [],
    },
  };
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
