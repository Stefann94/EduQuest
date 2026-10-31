import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  Clock,
  ListChecks,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ACCENT } from "@/components/learning/accent";
import {
  ContentBlocks,
  tableOfContents,
} from "@/components/learning/content-blocks";
import { LessonItemSection } from "@/components/lessons/lesson-item-view";
import { buttonVariants } from "@/components/ui/button";
import { getLesson } from "@/lib/data/course-queries";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

export async function CourseLesson({
  curs,
  lectie,
  base,
  mentor = false,
}: {
  curs: string;
  lectie: string;
  /** Unde stau cursurile: /invatare/cursuri (elev) sau /mentor/invatare (mentor). */
  base: string;
  /** Mentorul doar citește lecția: fără soluții și fără quiz. */
  mentor?: boolean;
}) {
  const data = await getLesson(curs, lectie);
  if (!data) notFound();
  const { course, lesson, previous, next } = data;
  const article = lesson.items.find((i) => i.kind === "article");
  const blocks = article?.kind === "article" ? article.content.blocks : [];
  const problems = lesson.items.filter((i) => i.kind === "problem");
  const a = ACCENT[course.accent];
  const toc = tableOfContents(blocks);
  const courseHref = `${base}/${course.slug}`;

  return (
    <div className="grid gap-8">
      <header className="grid gap-3">
        <Link
          href={courseHref}
          className="flex w-fit items-center gap-0.5 text-muted-foreground text-sm hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {course.title}
        </Link>
        <p
          className={cn(
            "flex flex-wrap items-center gap-x-3 gap-y-1 font-bold font-heading text-sm uppercase tracking-widest",
            a.text,
          )}
        >
          <span>
            Lecția {lesson.position} din {course.lessonCount}
          </span>
          {lesson.durationMin ? (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-3.5" aria-hidden="true" />
              {formatDuration(lesson.durationMin)}
            </span>
          ) : null}
        </p>
        <h1 className="max-w-4xl text-balance font-extrabold text-5xl leading-[0.92] sm:text-6xl">
          {lesson.title}
        </h1>
        <p className="max-w-3xl text-lg text-muted-foreground">
          {lesson.summary}
        </p>
        {/* Bara de progres în curs, segmentată ca XP-ul din bara de sus. */}
        <div className="mt-1 flex max-w-md gap-[3px]" aria-hidden="true">
          {course.lessons.map((l) => (
            <span
              key={l.slug}
              className={cn(
                "h-2 flex-1 -skew-x-12",
                l.position <= lesson.position ? a.bar : "bg-muted",
              )}
            />
          ))}
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 max-w-[46rem]">
          {toc.length > 0 ? (
            <details className="cut-sm mb-6 bg-card px-4 py-3 lg:hidden">
              <summary className="font-bold font-heading text-sm uppercase tracking-widest">
                Cuprinsul lecției
              </summary>
              <TocList items={toc} />
            </details>
          ) : null}
          <article>
            <ContentBlocks blocks={blocks} hideSolutions={mentor} />
          </article>

          {problems.length > 0 ? (
            <section
              aria-labelledby="probleme-lectie"
              className="mt-12 grid gap-10 border-t pt-8"
            >
              <h2 id="probleme-lectie" className="text-3xl">
                {mentor ? "Probleme (fără rezolvări)" : "Probleme de exersat"}
              </h2>
              {problems.map((p) => (
                <LessonItemSection key={p.id} item={p} hideSolutions={mentor} />
              ))}
            </section>
          ) : null}

          {lesson.quiz && !mentor ? (
            <section
              id="quiz"
              className="mt-12 flex cut flex-wrap items-center gap-4 bg-foreground p-6 text-background"
            >
              <ListChecks
                className="size-8 shrink-0 text-xp"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1 basis-56">
                <h2 className="text-2xl">
                  Verifică-te: {lesson.quiz.questions} întrebări
                </h2>
                <p className="text-background/80 text-sm">
                  Prima rezolvare aduce până la {lesson.quiz.xp} XP, o refacere
                  încă 1 XP.
                </p>
              </div>
              <Link
                href={`/quiz/${lesson.quiz.id}`}
                className={buttonVariants({ variant: "cta", size: "lg" })}
              >
                Începe quiz-ul <ArrowRight />
              </Link>
            </section>
          ) : null}
        </div>

        <aside className="hidden lg:block" aria-label="Navigare în lecție">
          <div className="sticky top-24 grid gap-6">
            {toc.length > 0 ? (
              <nav aria-label="Cuprinsul lecției">
                <p className="font-bold font-heading text-muted-foreground text-sm uppercase tracking-widest">
                  Pe această pagină
                </p>
                <TocList items={toc} />
              </nav>
            ) : null}
            <nav aria-label="Lecțiile cursului" className="cut-sm bg-card p-4">
              <p className="font-bold font-heading text-muted-foreground text-sm uppercase tracking-widest">
                Lecțiile cursului
              </p>
              <ol className="mt-2 grid gap-0.5">
                {course.lessons.map((l) => {
                  const current = l.slug === lesson.slug;
                  return (
                    <li key={l.slug}>
                      <Link
                        href={`${courseHref}/${l.slug}`}
                        aria-current={current ? "page" : undefined}
                        className={cn(
                          "grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2 px-2 py-1.5 text-sm transition-colors",
                          current
                            ? cn("font-semibold", a.bar, a.fg)
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <span className="font-bold font-heading">
                          {l.position}
                        </span>
                        <span className="truncate">{l.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
        </aside>
      </div>

      <nav
        aria-label="Lecția anterioară și următoarea"
        className="grid gap-3 border-t pt-6 sm:grid-cols-2"
      >
        {previous ? (
          <Link
            href={`${courseHref}/${previous.slug}`}
            className="group cut-sm bg-card px-5 py-4 transition-colors hover:bg-muted"
          >
            <span className="flex items-center gap-1.5 font-bold font-heading text-muted-foreground text-sm uppercase tracking-widest">
              <ArrowLeft
                className="size-4 transition-transform group-hover:-translate-x-1"
                aria-hidden="true"
              />
              Lecția anterioară
            </span>
            <span className="mt-1 block font-bold font-heading text-xl uppercase leading-tight">
              {previous.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`${courseHref}/${next.slug}`}
            className={cn(
              "group cut-sm px-5 py-4 text-right text-white transition-[filter] hover:brightness-110",
              a.gradient,
            )}
          >
            <span className="flex items-center justify-end gap-1.5 font-bold font-heading text-sm uppercase tracking-widest opacity-90">
              Lecția următoare
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
            <span className="mt-1 block font-bold font-heading text-xl uppercase leading-tight">
              {next.title}
            </span>
          </Link>
        ) : (
          <Link
            href={courseHref}
            className="group cut-sm bg-card px-5 py-4 text-right transition-colors hover:bg-muted"
          >
            <span className="font-bold font-heading text-muted-foreground text-sm uppercase tracking-widest">
              Ai ajuns la final
            </span>
            <span className="mt-1 block font-bold font-heading text-xl uppercase leading-tight">
              Înapoi la curs
            </span>
          </Link>
        )}
      </nav>
    </div>
  );
}

function TocList({ items }: { items: { id: string; text: string }[] }) {
  return (
    <ul className="mt-2 grid gap-1 border-l-2">
      {items.map((t) => (
        <li key={t.id}>
          <a
            href={`#${t.id}`}
            className="-ml-0.5 block border-transparent border-l-2 py-1 pl-3 text-muted-foreground text-sm transition-colors hover:border-primary hover:text-foreground"
          >
            {t.text}
          </a>
        </li>
      ))}
    </ul>
  );
}
