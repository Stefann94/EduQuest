"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { ITEM_KINDS, itemContentSchema } from "@/lib/content/items";
import { mentorClassIds } from "@/lib/db/classes";
import { db, isUuid } from "@/lib/db/core";
import { getLessonForEditor, nextLessonNumber } from "@/lib/db/lessons";

// Lecțiile și materialele mentorului. Regulile RLS verifică din nou fiecare scriere:
// doar autorul lecției o poate modifica, și doar în clasele în care predă.

export type ActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; errors?: Record<string, string> };

const NOT_FOUND: ActionResult = {
  ok: false,
  message: "Lecția nu mai există sau nu ai acces la ea.",
};

function issues(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of error.issues) {
    const key = i.path.map(String).join(".") || "form";
    out[key] ??= i.message;
  }
  return out;
}

const refresh = (lessonId?: string) => {
  revalidatePath("/mentor", "layout");
  revalidatePath("/clase", "layout");
  if (lessonId) revalidatePath(`/mentor/materiale/${lessonId}`);
};

async function ownLesson(lessonId: string) {
  const me = await requireUser("mentor");
  const lesson = isUuid(lessonId)
    ? await getLessonForEditor(me.id, lessonId)
    : undefined;
  return lesson ? { me, lesson } : undefined;
}

/* ---------- Lecția ---------- */

const detailsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Titlul are cel puțin 2 caractere.")
    .max(120, "Titlul are cel mult 120 de caractere."),
  summary: z
    .string()
    .trim()
    .max(300, "Rezumatul are cel mult 300 de caractere."),
});

const displaySchema = z.enum(["number", "title", "both"]);

/** Lecție nouă, eventual pusă direct în mai multe clase (fiecare cu numărul următor). */
export async function createLesson(input: {
  title: string;
  summary: string;
  classIds: string[];
  display: string;
}): Promise<ActionResult> {
  const me = await requireUser("mentor");
  const parsed = detailsSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      message: "Verifică câmpurile marcate.",
      errors: issues(parsed.error),
    };
  const display = displaySchema.catch("both").parse(input.display);
  const mine = await mentorClassIds(me.id);
  const classIds = input.classIds.filter((c) => mine.includes(c));

  const supabase = await db();
  const { data, error } = await supabase
    .from("lessons")
    .insert({
      author_id: me.id,
      title: parsed.data.title,
      summary: parsed.data.summary,
    })
    .select("id")
    .single();
  if (error || !data)
    return {
      ok: false,
      message: "Lecția nu s-a putut crea. Încearcă din nou.",
    };

  for (const classId of classIds)
    await supabase.from("lesson_classes").insert({
      lesson_id: data.id,
      class_id: classId,
      number: await nextLessonNumber(classId),
      display,
      published: false,
    });
  refresh();
  redirect(`/mentor/materiale/${data.id}`);
}

export async function updateLessonDetails(
  lessonId: string,
  input: { title: string; summary: string },
): Promise<ActionResult> {
  const owned = await ownLesson(lessonId);
  if (!owned) return NOT_FOUND;
  const parsed = detailsSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      message: "Verifică câmpurile marcate.",
      errors: issues(parsed.error),
    };
  const supabase = await db();
  const { error } = await supabase
    .from("lessons")
    .update(parsed.data)
    .eq("id", lessonId);
  if (error) return { ok: false, message: "Modificările nu s-au putut salva." };
  refresh(lessonId);
  return { ok: true, message: "Lecția a fost salvată." };
}

/** Șterge lecția cu toate materialele ei (și fișierele PDF). */
export async function deleteLesson(lessonId: string): Promise<ActionResult> {
  const owned = await ownLesson(lessonId);
  if (!owned) return NOT_FOUND;
  const supabase = await db();
  const files = owned.lesson.items.flatMap((i) =>
    i.kind === "pdf" ? [i.content.path] : [],
  );
  if (files.length) await supabase.storage.from("materials").remove(files);
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
  if (error) return { ok: false, message: "Lecția nu s-a putut șterge." };
  refresh();
  redirect("/mentor/materiale");
}

/* ---------- Materialele ---------- */

const itemSchema = z.object({
  kind: z.enum(ITEM_KINDS),
  title: z
    .string()
    .trim()
    .min(2, "Titlul are cel puțin 2 caractere.")
    .max(160, "Titlul are cel mult 160 de caractere."),
  published: z.boolean(),
  content: z.unknown(),
});

/** Adaugă sau modifică un material. Conținutul se validează după tip (lib/content/items.ts). */
export async function saveItem(
  lessonId: string,
  itemId: string | null,
  input: { kind: string; title: string; published: boolean; content: unknown },
): Promise<ActionResult> {
  const owned = await ownLesson(lessonId);
  if (!owned) return NOT_FOUND;
  const base = itemSchema.safeParse(input);
  if (!base.success)
    return {
      ok: false,
      message: "Verifică câmpurile marcate.",
      errors: issues(base.error),
    };
  const content = itemContentSchema[base.data.kind].safeParse(
    base.data.content,
  );
  if (!content.success) {
    const errors = Object.fromEntries(
      Object.entries(issues(content.error)).map(([k, v]) => [
        `content.${k}`,
        v,
      ]),
    );
    return { ok: false, message: "Verifică câmpurile marcate.", errors };
  }
  const existing = itemId
    ? owned.lesson.items.find((i) => i.id === itemId)
    : undefined;
  if (itemId && !existing)
    return { ok: false, message: "Materialul nu mai există." };

  const supabase = await db();
  const row = {
    lesson_id: lessonId,
    kind: base.data.kind,
    title: base.data.title,
    published: base.data.published,
    content: content.data,
    updated_at: new Date().toISOString(),
  };
  const result = existing
    ? await supabase
        .from("lesson_items")
        .update(row)
        .eq("id", existing.id)
        .select("id")
        .single()
    : await supabase
        .from("lesson_items")
        .insert({
          ...row,
          position: (owned.lesson.items.at(-1)?.position ?? -1) + 1,
        })
        .select("id")
        .single();
  if (result.error || !result.data)
    return {
      ok: false,
      message: "Materialul nu s-a putut salva. Încearcă din nou.",
    };

  // Un PDF înlocuit: fișierul vechi nu mai e folosit.
  if (
    existing?.kind === "pdf" &&
    (content.data as { path?: string }).path !== existing.content.path
  )
    await supabase.storage.from("materials").remove([existing.content.path]);
  refresh(lessonId);
  return {
    ok: true,
    id: result.data.id,
    message: existing
      ? "Materialul a fost salvat."
      : "Materialul a fost adăugat.",
  };
}

export async function setItemPublished(
  lessonId: string,
  itemId: string,
  published: boolean,
): Promise<ActionResult> {
  const owned = await ownLesson(lessonId);
  if (!owned?.lesson.items.some((i) => i.id === itemId)) return NOT_FOUND;
  const supabase = await db();
  const { error } = await supabase
    .from("lesson_items")
    .update({ published })
    .eq("id", itemId);
  if (error) return { ok: false, message: "Modificarea nu s-a putut salva." };
  refresh(lessonId);
  return {
    ok: true,
    message: published
      ? "Elevii văd acum materialul."
      : "Materialul e ascuns elevilor.",
  };
}

export async function deleteItem(
  lessonId: string,
  itemId: string,
): Promise<ActionResult> {
  const owned = await ownLesson(lessonId);
  const item = owned?.lesson.items.find((i) => i.id === itemId);
  if (!item) return NOT_FOUND;
  const supabase = await db();
  const { error } = await supabase
    .from("lesson_items")
    .delete()
    .eq("id", itemId);
  if (error) return { ok: false, message: "Materialul nu s-a putut șterge." };
  if (item.kind === "pdf")
    await supabase.storage.from("materials").remove([item.content.path]);
  refresh(lessonId);
  return { ok: true, message: "Materialul a fost șters." };
}

/** Mută un material cu o poziție mai sus sau mai jos. */
export async function moveItem(
  lessonId: string,
  itemId: string,
  by: -1 | 1,
): Promise<ActionResult> {
  const owned = await ownLesson(lessonId);
  if (!owned) return NOT_FOUND;
  const list = owned.lesson.items;
  const i = list.findIndex((x) => x.id === itemId);
  const j = i + by;
  if (i < 0 || j < 0 || j >= list.length) return { ok: true, message: "" };
  const order = [...list];
  [order[i], order[j]] = [order[j], order[i]];
  const supabase = await db();
  for (const [position, item] of order.entries())
    if (item.position !== position)
      await supabase
        .from("lesson_items")
        .update({ position })
        .eq("id", item.id);
  refresh(lessonId);
  return { ok: true, message: "Ordinea a fost schimbată." };
}

/* ---------- Lecția în clase ---------- */

const placementSchema = z.object({
  classId: z.uuid(),
  number: z.coerce
    .number({ error: "Scrie numărul lecției." })
    .int("Numărul e întreg.")
    .min(1, "Numărul e cel puțin 1.")
    .max(999, "Numărul e cel mult 999."),
  display: displaySchema,
  published: z.boolean(),
});

/**
 * Locul lecției într-o clasă: numărul, ce se afișează (număr, titlu sau amândouă) și
 * dacă elevii o văd. O lecție poate fi în mai multe clase, cu numere diferite.
 */
export async function savePlacement(
  lessonId: string,
  input: {
    classId: string;
    number: number;
    display: string;
    published: boolean;
  },
): Promise<ActionResult> {
  const owned = await ownLesson(lessonId);
  if (!owned) return NOT_FOUND;
  const parsed = placementSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      message: "Verifică numărul lecției.",
      errors: issues(parsed.error),
    };
  if (!(await mentorClassIds(owned.me.id)).includes(parsed.data.classId))
    return { ok: false, message: "Poți pune lecții doar în clasele tale." };
  const supabase = await db();
  const { error } = await supabase.from("lesson_classes").upsert({
    lesson_id: lessonId,
    class_id: parsed.data.classId,
    number: parsed.data.number,
    display: parsed.data.display,
    published: parsed.data.published,
  });
  if (error) return { ok: false, message: "Modificarea nu s-a putut salva." };
  refresh(lessonId);
  return { ok: true, message: "Lecția a fost actualizată în clasă." };
}

/** Pune lecția în mai multe clase deodată, la finalul fiecăreia. */
export async function addToClasses(
  lessonId: string,
  classIds: string[],
  display: string,
): Promise<ActionResult> {
  const owned = await ownLesson(lessonId);
  if (!owned) return NOT_FOUND;
  const mine = await mentorClassIds(owned.me.id);
  const already = new Set(owned.lesson.classes.map((c) => c.classId));
  const targets = classIds.filter((c) => mine.includes(c) && !already.has(c));
  if (targets.length === 0)
    return { ok: false, message: "Alege cel puțin o clasă nouă." };
  const supabase = await db();
  for (const classId of targets) {
    const { error } = await supabase.from("lesson_classes").insert({
      lesson_id: lessonId,
      class_id: classId,
      number: await nextLessonNumber(classId),
      display: displaySchema.catch("both").parse(display),
      published: false,
    });
    if (error)
      return {
        ok: false,
        message: "Lecția nu s-a putut adăuga în toate clasele.",
      };
  }
  refresh(lessonId);
  return {
    ok: true,
    message:
      targets.length === 1
        ? "Lecția a fost adăugată în clasă (ascunsă până o faci vizibilă)."
        : `Lecția a fost adăugată în ${targets.length} clase (ascunsă până o faci vizibilă).`,
  };
}

export async function removeFromClass(
  lessonId: string,
  classId: string,
): Promise<ActionResult> {
  const owned = await ownLesson(lessonId);
  if (!owned) return NOT_FOUND;
  const supabase = await db();
  const { error } = await supabase
    .from("lesson_classes")
    .delete()
    .eq("lesson_id", lessonId)
    .eq("class_id", classId);
  if (error)
    return { ok: false, message: "Lecția nu s-a putut scoate din clasă." };
  refresh(lessonId);
  return {
    ok: true,
    message: "Lecția a fost scoasă din clasă. Materialele rămân în bibliotecă.",
  };
}
