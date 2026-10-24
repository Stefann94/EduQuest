import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { type ItemKind, type LessonItem, parseItem } from "@/lib/content/items";
import type { Accent } from "@/lib/content/schema";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Cursurile globale, citite din Supabase. Conținutul e același pentru toți elevii, deci
// se păstrează în cache și paginile se încarcă instant; o modificare apare în cel mult o oră.
// Citim DOAR cursuri globale și publicate (cheia de server ocolește RLS, vezi supabase/admin.ts).
// Încercările fiecărui elev la quiz-uri se citesc separat, cu sesiunea lui.

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

export type CourseLesson = {
  id: string;
  slug: string;
  position: number;
  title: string;
  summary: string;
  durationMin: number | null;
  items: (LessonItem & { position: number })[];
  quiz: { id: string; title: string; questions: number; xp: number } | null;
};

type CourseRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  topic: string;
  level: string;
  accent: string;
  lessons: { duration_min: number | null }[];
};

function summarize(row: CourseRow): CourseSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    topic: row.topic,
    level: row.level,
    accent: row.accent as Accent,
    lessonCount: row.lessons.length,
    durationMin: row.lessons.reduce((s, l) => s + (l.duration_min ?? 0), 0),
  };
}

const COURSE_FIELDS =
  "id, slug, title, subtitle, description, topic, level, accent, lessons(duration_min)";

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

/** Un curs, cu lecțiile lui: materialele (lecția scrisă și problemele) și quiz-ul fiecăreia. */
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
    .select(
      `id, slug, position, title, summary, duration_min,
       lesson_items(id, kind, title, position, published, content),
       quiz_lessons(quiz:quizzes!quiz_lessons_quiz_id_fkey(id, title, xp, course_id, quiz_questions(count)))`,
    )
    .eq("course_id", data.id)
    .order("position");
  if (lessonsError)
    throw new Error(`Lecțiile nu s-au putut încărca: ${lessonsError.message}`);

  return {
    ...summarize(data as CourseRow),
    lessons: lessons.map((l): CourseLesson => {
      const quiz = l.quiz_lessons
        .map((q) => q.quiz)
        .find((q) => q?.course_id === data.id);
      return {
        id: l.id,
        slug: l.slug ?? l.id,
        position: l.position,
        title: l.title,
        summary: l.summary,
        durationMin: l.duration_min,
        items: l.lesson_items
          .filter((i) => i.published)
          .flatMap((i) => {
            const item = parseItem({ ...i, kind: i.kind as ItemKind });
            return item ? [{ ...item, position: i.position }] : [];
          })
          .sort((a, b) => a.position - b.position),
        quiz: quiz
          ? {
              id: quiz.id,
              title: quiz.title,
              xp: quiz.xp,
              questions: quiz.quiz_questions[0]?.count ?? 0,
            }
          : null,
      };
    }),
  };
}

export type Course = NonNullable<Awaited<ReturnType<typeof getCourse>>>;

/** O lecție a cursului, plus vecinii ei (pentru „înainte” și „înapoi”). */
export async function getLesson(courseSlug: string, lessonSlug: string) {
  const course = await getCourse(courseSlug);
  if (!course) return undefined;
  const index = course.lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) return undefined;
  return {
    course,
    lesson: course.lessons[index],
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
