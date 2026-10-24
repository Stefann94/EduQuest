import { ArrowRight, ChevronLeft, Clock, ListOrdered } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ACCENT } from "@/components/learning/accent";
import { DetailSkeleton } from "@/components/student-class/skeletons";
import { buttonVariants } from "@/components/ui/button";
import { getCourse, getCourses } from "@/lib/data/course-queries";
import { formatDuration, plural } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = PageProps<"/invatare/cursuri/[curs]">;

export const metadata: Metadata = { title: "Curs" };

// Cu Cache Components trebuie cel puțin un parametru; fără cursuri în bază (ex. un build
// fără cheile Supabase) folosim unul care duce la pagina „nu există”.
export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.length > 0
    ? courses.map((c) => ({ curs: c.slug }))
    : [{ curs: "fara-cursuri" }];
}

export default function CoursePage({ params }: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { curs } = await params;
  const course = await getCourse(curs);
  if (!course) notFound();
  const a = ACCENT[course.accent];
  const first = course.lessons[0];

  return (
    <div className="grid gap-8">
      <Link
        href="/invatare"
        className="-mb-4 flex w-fit items-center gap-0.5 text-muted-foreground text-sm hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Învățare
      </Link>

      <header
        className={cn(
          "relative cut overflow-hidden p-6 text-white sm:p-9",
          a.gradient,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-8 -right-8 size-56 bg-[repeating-linear-gradient(-45deg,rgb(255_255_255/0.07)_0_10px,transparent_10px_20px)]"
        />
        <p className="relative font-bold font-heading text-sm uppercase tracking-widest opacity-90">
          Curs · {course.topic} · {course.level}
        </p>
        <h1 className="relative mt-2 max-w-3xl font-extrabold text-5xl leading-[0.92] sm:text-6xl">
          {course.title}
        </h1>
        <p className="relative mt-3 max-w-2xl text-lg text-white/90">
          {course.subtitle}
        </p>
        <p className="relative mt-2 max-w-2xl text-white/80">
          {course.description}
        </p>
        <div className="relative mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          {first ? (
            <Link
              href={`/invatare/cursuri/${course.slug}/${first.slug}`}
              className={cn(
                buttonVariants({ variant: "cta", size: "lg" }),
                "h-12 text-lg",
              )}
            >
              Începe cu lecția 1 <ArrowRight />
            </Link>
          ) : null}
          <span className="flex items-center gap-2 font-semibold">
            <ListOrdered className="size-4" aria-hidden="true" />
            {plural(course.lessonCount, "lecție", "lecții")}
          </span>
          <span className="flex items-center gap-2 font-semibold">
            <Clock className="size-4" aria-hidden="true" />
            aproximativ {formatDuration(course.durationMin)}
          </span>
        </div>
      </header>

      <section aria-labelledby="traseu">
        <h2
          id="traseu"
          className="mb-4 flex items-center gap-3 font-extrabold text-[28px] leading-none"
        >
          <span aria-hidden="true" className="size-3.5 rotate-45 bg-primary" />
          Traseul cursului
        </h2>
        <ol className="stagger grid gap-2.5">
          {course.lessons.map((l, i) => (
            <li
              key={l.slug}
              className="relative grid grid-cols-[3rem_minmax(0,1fr)] gap-3 sm:gap-4"
            >
              {i < course.lessons.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute top-12 bottom-[-0.625rem] left-6 w-0.5 -translate-x-1/2 bg-border"
                />
              ) : null}
              <span
                aria-hidden="true"
                className={cn(
                  "hex relative mt-2 grid size-12 place-items-center font-extrabold font-heading text-xl",
                  a.bar,
                  a.fg,
                )}
              >
                {l.position}
              </span>
              <Link
                href={`/invatare/cursuri/${course.slug}/${l.slug}`}
                className="group cut-sm grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 bg-card px-5 py-4 outline-none transition-[translate,background-color] duration-300 ease-out hover:translate-x-1.5 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70 focus-visible:ring-inset"
              >
                <span className="min-w-0">
                  <span className="sr-only">Lecția {l.position}: </span>
                  <span className="block font-bold font-heading text-[22px] uppercase leading-tight tracking-wide">
                    {l.title}
                  </span>
                  <span className="mt-0.5 block text-muted-foreground text-sm">
                    {l.summary}
                  </span>
                </span>
                <span className="flex items-center gap-3 text-muted-foreground text-sm">
                  {l.durationMin ? (
                    <span className="hidden whitespace-nowrap sm:inline">
                      {formatDuration(l.durationMin)}
                    </span>
                  ) : null}
                  <ArrowRight
                    className={cn(
                      "size-5 transition-transform group-hover:translate-x-1",
                      a.text,
                    )}
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
