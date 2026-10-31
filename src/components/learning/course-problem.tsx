import { notFound } from "next/navigation";
import { ProblemView } from "@/components/lessons/problem-view";
import { getLesson } from "@/lib/data/course-queries";

/** O problemă dintr-o lecție a cursului, pe pagina ei. Mentorul o vede fără rezolvare. */
export async function CourseProblem({
  curs,
  lectie,
  problema,
  base,
  mentor = false,
}: {
  curs: string;
  lectie: string;
  problema: string;
  base: string;
  mentor?: boolean;
}) {
  const data = await getLesson(curs, lectie);
  if (!data) notFound();
  const { course, lesson } = data;
  const problems = lesson.items.filter((i) => i.kind === "problem");
  const index = problems.findIndex((i) => i.id === problema);
  const item = problems[index];
  if (!item || item.kind !== "problem") notFound();
  const lessonHref = `${base}/${course.slug}/${lesson.slug}`;
  const href = (id: string) => `${lessonHref}/probleme/${id}`;
  const prev = problems[index - 1];
  const next = problems[index + 1];
  return (
    <ProblemView
      itemId={item.id}
      title={item.title}
      problem={item.content}
      crumbs={[
        { href: `${base}/${course.slug}`, title: course.title },
        {
          href: lessonHref,
          title: `Lecția ${lesson.position}: ${lesson.title}`,
        },
      ]}
      folder={{ href: lessonHref, title: lesson.title }}
      prev={prev ? { href: href(prev.id), title: prev.title } : undefined}
      next={next ? { href: href(next.id), title: next.title } : undefined}
      index={index}
      count={problems.length}
      hideSolution={mentor}
    />
  );
}
