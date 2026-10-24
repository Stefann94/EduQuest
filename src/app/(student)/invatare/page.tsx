import {
  ArrowRight,
  CheckCircle2,
  FileCode2,
  ListChecks,
  Newspaper,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge, XpBadge } from "@/components/common/status";
import { CourseCard } from "@/components/learning/course-card";
import { SectionSkeleton } from "@/components/student-class/skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUser } from "@/lib/auth";
import { type Course, getCourse, getCourses } from "@/lib/data/course-queries";
import { db, must } from "@/lib/db/core";
import { xpOutlook } from "@/lib/db/quiz-rules";
import { formatDuration, plural } from "@/lib/format";

export const metadata: Metadata = { title: "Învățare" };

const TABS = ["materiale", "probleme", "quiz"] as const;

export default function LearningPage({ searchParams }: PageProps<"/invatare">) {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Învățare"
        description="Cursul „Introducere în Python”, în ritmul tău: lecții explicate pas cu pas, probleme de exersat și câte un quiz de recapitulare pentru fiecare lecție."
      />
      <Suspense fallback={<SectionSkeleton rows={6} />}>
        <Content searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Content({
  searchParams,
}: {
  searchParams: PageProps<"/invatare">["searchParams"];
}) {
  const { tab } = await searchParams;
  const me = await requireUser("student");
  const summaries = await getCourses();
  const courses = (
    await Promise.all(summaries.map((c) => getCourse(c.slug)))
  ).filter((c): c is Course => c !== undefined);
  if (courses.length === 0)
    return (
      <EmptyState
        icon={Newspaper}
        title="Niciun curs încă"
        description="Cursurile apar aici imediat ce sunt publicate."
      />
    );

  const quizIds = courses.flatMap((c) =>
    c.lessons.flatMap((l) => (l.quiz ? [l.quiz.id] : [])),
  );
  const supabase = await db();
  const attempts = must(
    "Încercările",
    await supabase
      .from("quiz_attempts")
      .select("quiz_id, correct, total")
      .eq("student_id", me.id)
      .in(
        "quiz_id",
        quizIds.length ? quizIds : ["00000000-0000-0000-0000-000000000000"],
      ),
  );
  const initial = TABS.includes(tab as (typeof TABS)[number])
    ? (tab as string)
    : "materiale";

  return (
    <div className="grid gap-8">
      {courses.map((course) => {
        const base = `/invatare/cursuri/${course.slug}`;
        const problems = course.lessons.flatMap((l) =>
          l.items
            .filter((i) => i.kind === "problem")
            .map((p) => ({ ...p, lesson: l })),
        );
        return (
          <section key={course.id} className="grid gap-5">
            <CourseCard course={course} />
            <Tabs defaultValue={initial}>
              <TabsList>
                <TabsTrigger value="materiale">
                  Materiale ({course.lessons.length})
                </TabsTrigger>
                <TabsTrigger value="probleme">
                  Probleme ({problems.length})
                </TabsTrigger>
                <TabsTrigger value="quiz">
                  Quiz-uri ({quizIds.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="materiale" className="mt-4">
                <ol className="stagger grid gap-2 md:grid-cols-2">
                  {course.lessons.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`${base}/${l.slug}`}
                        className="group flex h-full cut-sm items-center gap-4 bg-card px-4 py-3 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70"
                      >
                        <span
                          aria-hidden="true"
                          className="grid size-11 shrink-0 hex place-items-center bg-cyan font-extrabold font-heading text-lg text-white"
                        >
                          {l.position}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-bold font-heading text-lg uppercase leading-tight tracking-wide">
                            {l.title}
                          </span>
                          <span className="line-clamp-1 text-muted-foreground text-sm">
                            {l.summary}
                          </span>
                        </span>
                        {l.durationMin ? (
                          <span className="hidden text-muted-foreground text-sm sm:inline">
                            {formatDuration(l.durationMin)}
                          </span>
                        ) : null}
                        <ArrowRight
                          className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ol>
              </TabsContent>

              <TabsContent value="probleme" className="mt-4">
                <ul className="stagger grid gap-2 md:grid-cols-2">
                  {problems.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`${base}/${p.lesson.slug}#m-${p.id}`}
                        className="group flex h-full cut-sm items-center gap-4 bg-card px-4 py-3 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70"
                      >
                        <span
                          aria-hidden="true"
                          className="grid size-10 shrink-0 cut-xs place-items-center bg-xp-soft text-xp-foreground"
                        >
                          <FileCode2 className="size-[18px]" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">
                            {p.title}
                          </span>
                          <span className="block truncate text-muted-foreground text-sm">
                            Lecția {p.lesson.position}: {p.lesson.title}
                          </span>
                        </span>
                        <ArrowRight
                          className="size-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="quiz" className="mt-4 grid gap-3">
                <p className="text-muted-foreground text-sm">
                  Câte un quiz pentru fiecare lecție. Prima rezolvare aduce XP
                  după scor, iar o refacere încă 1 XP; după aceea îl poți relua
                  oricând, doar pentru exersare.
                </p>
                <ul className="stagger grid gap-2 md:grid-cols-2">
                  {course.lessons.flatMap((l) => {
                    if (!l.quiz) return [];
                    const quiz = l.quiz;
                    const mine = attempts.filter((a) => a.quiz_id === quiz.id);
                    const best = mine.length
                      ? Math.max(...mine.map((a) => a.correct))
                      : null;
                    const outlook = xpOutlook(quiz.xp, mine.length);
                    return [
                      <li key={quiz.id}>
                        <Link
                          href={`/quiz/${quiz.id}`}
                          className="group flex h-full cut-sm items-center gap-4 bg-card px-4 py-3 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70"
                        >
                          <span
                            aria-hidden="true"
                            className="grid size-10 shrink-0 cut-xs place-items-center bg-primary-soft text-primary"
                          >
                            <ListChecks className="size-[18px]" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">
                              Lecția {l.position}: {l.title}
                            </span>
                            <span className="block text-muted-foreground text-sm">
                              {plural(quiz.questions, "întrebare", "întrebări")}
                              {best !== null
                                ? ` · cel mai bun: ${best}/${quiz.questions}`
                                : ""}
                            </span>
                          </span>
                          {best === quiz.questions ? (
                            <StatusBadge icon={CheckCircle2} tone="success">
                              Perfect
                            </StatusBadge>
                          ) : null}
                          {outlook.max > 0 ? (
                            <XpBadge amount={outlook.max} />
                          ) : null}
                        </Link>
                      </li>,
                    ];
                  })}
                </ul>
              </TabsContent>
            </Tabs>
          </section>
        );
      })}
    </div>
  );
}
