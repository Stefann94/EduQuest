// Încarcă (sau actualizează) cursurile din content/ în Supabase.
// Rulare: pnpm db:content
// Conținutul e validat înainte de încărcare; o lecție ștearsă din fișier dispare și din bază.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { course as pythonModul1 } from "../content/python-modulul-1";
import { courseSchema } from "../src/lib/content/schema";

const COURSES = [pythonModul1];
// Autorul cursurilor globale (mentorul care le poate edita din platformă).
const AUTHOR_EMAIL = "ana.ionescu@exemplu.ro";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const read = (name: string) =>
  env.match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]?.trim() ?? "";
const db = createClient(
  read("NEXT_PUBLIC_SUPABASE_URL"),
  read("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const uuid = (kind: string, id: string) => {
  const h = createHash("md5").update(`eduquest:${kind}:${id}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
};

const { data: users, error: usersError } = await db.auth.admin.listUsers({
  perPage: 200,
});
if (usersError) throw usersError;
const authorId = users.users.find((u) => u.email === AUTHOR_EMAIL)?.id;
if (!authorId)
  throw new Error(
    `Nu există contul ${AUTHOR_EMAIL}. Rulează întâi pnpm db:seed.`,
  );

for (const [index, source] of COURSES.entries()) {
  const c = courseSchema.parse(source);
  const courseId = uuid("course", c.slug);

  const { error: courseError } = await db.from("courses").upsert({
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
  });
  if (courseError) throw new Error(`Curs ${c.slug}: ${courseError.message}`);

  const lessons = c.lessons.map((l, i) => ({
    id: uuid("lesson", `${c.slug}/${l.slug}`),
    course_id: courseId,
    slug: l.slug,
    position: i + 1,
    title: l.title,
    summary: l.summary,
    duration_min: l.durationMin,
    blocks: l.blocks,
    status: "published",
  }));
  const { error: lessonsError } = await db.from("lessons").upsert(lessons);
  if (lessonsError)
    throw new Error(`Lecții ${c.slug}: ${lessonsError.message}`);

  // Lecțiile care nu mai sunt în fișier se șterg.
  const keep = lessons.map((l) => l.id);
  const { error: cleanupError } = await db
    .from("lessons")
    .delete()
    .eq("course_id", courseId)
    .not("id", "in", `(${keep.join(",")})`);
  if (cleanupError)
    throw new Error(`Curățare ${c.slug}: ${cleanupError.message}`);

  const blocks = c.lessons.reduce((n, l) => n + l.blocks.length, 0);
  console.log(`✓ ${c.title}: ${c.lessons.length} lecții, ${blocks} blocuri.`);
}
