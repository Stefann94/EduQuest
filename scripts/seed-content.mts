// Încarcă (sau actualizează) cursurile din content/ în Supabase.
// Rulare: pnpm db:content
// Conținutul e validat înainte de încărcare; o lecție ștearsă din fișier dispare și din bază.
//
// Fiecare lecție devine: o lecție scrisă (blocurile, fără primele două exerciții), două
// probleme (din primele două exerciții, cu „încearcă singur” și rezolvarea ascunsă) și un
// quiz de recapitulare cu XP mic (2 la prima rezolvare, +1 la prima refacere).

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { course as python } from "../content/python-modulul-1";
import { quizzes as pythonQuizzes } from "../content/python-quizzes";
import { itemContentSchema } from "../src/lib/content/items";
import { type ContentBlock, courseSchema } from "../src/lib/content/schema";

const COURSES = [{ source: python, quizzes: pythonQuizzes }];
// Cursuri vechi, înlocuite (se șterg cu tot ce au).
const RETIRED = ["python-modulul-1"];
// Autorul cursurilor globale (mentorul care le poate edita din platformă).
const AUTHOR_EMAIL = "ana.ionescu@exemplu.ro";
const QUIZ_XP = 2;

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const read = (name: string) =>
  env.match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]?.trim() ?? "";
const db = createClient(
  read("NEXT_PUBLIC_SUPABASE_URL"),
  read("SUPABASE_SERVICE_ROLE_KEY"),
  {
    auth: { persistSession: false, autoRefreshToken: false },
  },
);

const uuid = (kind: string, id: string) => {
  const h = createHash("md5").update(`eduquest:${kind}:${id}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
};

async function must<T>(
  label: string,
  p: PromiseLike<{ data: T; error: { message: string } | null }>,
) {
  const { data, error } = await p;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data;
}

const { data: users, error: usersError } = await db.auth.admin.listUsers({
  perPage: 200,
});
if (usersError) throw usersError;
const authorId = users.users.find((u) => u.email === AUTHOR_EMAIL)?.id;
if (!authorId)
  throw new Error(
    `Nu există contul ${AUTHOR_EMAIL}. Rulează întâi pnpm db:seed.`,
  );

await must("Cursuri vechi", db.from("courses").delete().in("slug", RETIRED));

for (const [index, { source, quizzes }] of COURSES.entries()) {
  const c = courseSchema.parse(source);
  const courseId = uuid("course", c.slug);

  await must(
    `Curs ${c.slug}`,
    db.from("courses").upsert({
      id: courseId,
      slug: c.slug,
      title: c.title,
      subtitle: c.subtitle,
      description: c.description,
      topic: c.topic,
      level: c.level,
      accent: c.accent,
      class_id: null,
      author_id: authorId,
      status: "published",
      position: index + 1,
    }),
  );

  const lessonId = (slug: string) => uuid("course-lesson", `${c.slug}/${slug}`);
  await must(
    `Lecții ${c.slug}`,
    db.from("lessons").upsert(
      c.lessons.map((l, i) => ({
        id: lessonId(l.slug),
        author_id: authorId,
        course_id: courseId,
        slug: l.slug,
        position: i + 1,
        title: l.title,
        summary: l.summary,
        duration_min: l.durationMin,
      })),
    ),
  );
  // Lecțiile care nu mai sunt în fișier se șterg (cu materialele și quiz-urile lor).
  const keep = c.lessons.map((l) => lessonId(l.slug));
  await must(
    `Curățare ${c.slug}`,
    db
      .from("lessons")
      .delete()
      .eq("course_id", courseId)
      .not("id", "in", `(${keep.join(",")})`),
  );

  let problems = 0;
  let questions = 0;
  for (const l of c.lessons) {
    const lid = lessonId(l.slug);
    const exercises = l.blocks.filter(
      (b): b is Extract<ContentBlock, { type: "exercise" }> =>
        b.type === "exercise",
    );
    const asProblems = exercises.slice(0, 2);
    const article = l.blocks.filter(
      (b) => !asProblems.includes(b as (typeof asProblems)[number]),
    );
    const items = [
      {
        id: uuid("course-item", `${lid}:article`),
        kind: "article",
        title: l.title,
        content: { blocks: article },
      },
      ...asProblems.map((e, i) => ({
        id: uuid("course-item", `${lid}:problem-${i}`),
        kind: "problem",
        title: e.title,
        content: {
          statement: e.text,
          examples: [],
          constraints: [],
          hint: e.hint,
          starter: e.starter,
          language: e.solution.language,
          solution: e.solution.code,
          output: e.output,
          explanation: e.explanation,
        },
      })),
    ];
    for (const it of items) {
      const ok = itemContentSchema[it.kind as "article" | "problem"].safeParse(
        it.content,
      );
      if (!ok.success)
        throw new Error(`${l.slug} · ${it.title}: ${ok.error.message}`);
    }
    await must(
      `Materiale ${l.slug}`,
      db.from("lesson_items").delete().eq("lesson_id", lid),
    );
    await must(
      `Materiale ${l.slug}`,
      db.from("lesson_items").insert(
        items.map((it, position) => ({
          ...it,
          lesson_id: lid,
          position,
          published: true,
        })),
      ),
    );
    problems += asProblems.length;

    const qs = quizzes[l.slug] ?? [];
    if (qs.length === 0) continue;
    const quizId = uuid("course-quiz", `${c.slug}/${l.slug}`);
    await must(
      `Quiz ${l.slug}`,
      db.from("quizzes").upsert({
        id: quizId,
        author_id: authorId,
        course_id: courseId,
        title: `Recapitulare: ${l.title}`,
        description: `${qs.length} întrebări despre lecția „${l.title}”.`,
        kind: "lesson",
        xp: QUIZ_XP,
      }),
    );
    await must(
      `Quiz ${l.slug}`,
      db.from("quiz_lessons").upsert({ quiz_id: quizId, lesson_id: lid }),
    );
    await must(
      `Întrebări ${l.slug}`,
      db.from("quiz_questions").delete().eq("quiz_id", quizId),
    );
    const inserted = await must(
      `Întrebări ${l.slug}`,
      db
        .from("quiz_questions")
        .insert(
          qs.map((q, i) => ({
            quiz_id: quizId,
            lesson_id: lid,
            position: i + 1,
            prompt: q.prompt,
            code: q.code ?? null,
            options: q.options,
          })),
        )
        .select("id, position"),
    );
    const byPos = new Map((inserted ?? []).map((r) => [r.position, r.id]));
    await must(
      `Răspunsuri ${l.slug}`,
      db.from("quiz_answer_keys").insert(
        qs.map((q, i) => ({
          question_id: byPos.get(i + 1) as string,
          correct: q.correct,
          explanation: q.explanation,
        })),
      ),
    );
    questions += qs.length;
  }

  console.log(
    `✓ ${c.title}: ${c.lessons.length} lecții, ${problems} probleme, ${questions} întrebări de quiz.`,
  );
}
