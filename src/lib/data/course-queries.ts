import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import {
  type Accent,
  type ContentBlock,
  contentBlockSchema,
} from "@/lib/content/schema";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Cursurile globale, citite din Supabase. Conținutul e același pentru toți elevii, deci
// se păstrează în cache și paginile se încarcă instant; o modificare apare în cel mult o oră.
// Citim DOAR cursuri globale și publicate (cheia de server ocolește RLS, vezi supabase/admin.ts).

export type CourseSummary = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  topic: string;
  level: string;
  accent: Accent;
  lessonCount: number;
  durationMin: number;
};

export type LessonSummary = {
  slug: string;
  position: number;
  title: string;
  summary: string;
  durationMin: number | null;
};

type CourseRow = Omit<CourseSummary, "lessonCount" | "durationMin"> & {
  lessons: { duration_min: number | null; status: string }[];
};

function summarize(row: CourseRow): CourseSummary {
  const published = row.lessons.filter((l) => l.status === "published");
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    topic: row.topic,
    level: row.level,
    accent: row.accent,
    lessonCount: published.length,
    durationMin: published.reduce((s, l) => s + (l.duration_min ?? 0), 0),
  };
}

const COURSE_FIELDS =
  "id, slug, title, subtitle, description, topic, level, accent, lessons(duration_min, status)";

/** Cursurile globale publicate, în ordinea stabilită de mentor. */
export async function getCourses(): Promise<CourseSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("courses");
  const db = supabaseAdmin();
  if (!db) return [];
  const { data, error } = await db
    .from("courses")
    .select(COURSE_FIELDS)
    .eq("status", "published")
    .is("class_id", null)
    .order("position");
  if (error)
    throw new Error(`Cursurile nu s-au putut încărca: ${error.message}`);
  return (data as CourseRow[]).map(summarize);
}

/** Un curs, cu lista lecțiilor publicate (fără conținutul lor). */
export async function getCourse(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("courses", `course:${slug}`);
  const db = supabaseAdmin();
  if (!db) return undefined;
  const { data, error } = await db
    .from("courses")
    .select(COURSE_FIELDS)
    .eq("slug", slug)
    .eq("status", "published")
    .is("class_id", null)
    .maybeSingle();
  if (error) throw new Error(`Cursul nu s-a putut încărca: ${error.message}`);
  if (!data) return undefined;

  const { data: lessons, error: lessonsError } = await db
    .from("lessons")
    .select("slug, position, title, summary, duration_min")
    .eq("course_id", data.id)
    .eq("status", "published")
    .order("position");
  if (lessonsError)
    throw new Error(`Lecțiile nu s-au putut încărca: ${lessonsError.message}`);

  return {
    ...summarize(data as CourseRow),
    lessons: lessons.map(
      (l): LessonSummary => ({
        slug: l.slug,
        position: l.position,
        title: l.title,
        summary: l.summary,
        durationMin: l.duration_min,
      }),
    ),
  };
}

/** O lecție cu tot conținutul, plus vecinii ei (pentru „înainte” și „înapoi”). */
export async function getLesson(courseSlug: string, lessonSlug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("courses", `course:${courseSlug}`);
  const course = await getCourse(courseSlug);
  const db = supabaseAdmin();
  if (!course || !db) return undefined;
  const index = course.lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) return undefined;

  const { data, error } = await db
    .from("lessons")
    .select("blocks")
    .eq("course_id", course.id)
    .eq("slug", lessonSlug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(`Lecția nu s-a putut încărca: ${error.message}`);
  if (!data) return undefined;

  // Un bloc salvat greșit nu strică pagina: îl sărim.
  const blocks = (data.blocks as unknown[]).flatMap((b): ContentBlock[] => {
    const parsed = contentBlockSchema.safeParse(b);
    return parsed.success ? [parsed.data] : [];
  });

  return {
    course,
    lesson: course.lessons[index],
    blocks,
    previous: course.lessons[index - 1],
    next: course.lessons[index + 1],
  };
}

/** Perechile curs/lecție pentru pre-generare. */
export async function getLessonParams() {
  const courses = await getCourses();
  const all = await Promise.all(courses.map((c) => getCourse(c.slug)));
  return all.flatMap((c) =>
    c ? c.lessons.map((l) => ({ curs: c.slug, lectie: l.slug })) : [],
  );
}
