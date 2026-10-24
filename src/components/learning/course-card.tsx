import { ArrowRight, Clock, ListOrdered } from "lucide-react";
import Link from "next/link";
import type { CourseSummary } from "@/lib/data/course-queries";
import { formatDuration, plural } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ACCENT } from "./accent";

/** Cardul unui curs: un panou colorat cu titlul, numărul de lecții și durata. */
export function CourseCard({ course: c }: { course: CourseSummary }) {
  const a = ACCENT[c.accent];
  return (
    <Link
      href={`/invatare/cursuri/${c.slug}`}
      className="group relative grid cut overflow-hidden bg-card outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70 focus-visible:ring-inset md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
    >
      <div className={cn("relative p-6 text-white sm:p-7", a.gradient)}>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-6 -right-6 size-40 bg-[repeating-linear-gradient(-45deg,rgb(255_255_255/0.13)_0_8px,transparent_8px_16px)]"
        />
        <p className="relative font-bold font-heading text-sm uppercase tracking-widest opacity-90">
          Curs · {c.topic} · {c.level}
        </p>
        <h3 className="relative mt-2 font-extrabold text-4xl leading-[0.95]">
          {c.title}
        </h3>
        <p className="relative mt-2 text-white/85">{c.subtitle}</p>
      </div>
      <div className="flex flex-col gap-4 p-6 sm:p-7">
        <p className="text-muted-foreground leading-relaxed">{c.description}</p>
        <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <ListOrdered className={cn("size-4", a.text)} aria-hidden="true" />
            <dt className="sr-only">Lecții</dt>
            <dd className="font-semibold">
              {plural(c.lessonCount, "lecție", "lecții")}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <Clock className={cn("size-4", a.text)} aria-hidden="true" />
            <dt className="sr-only">Durată</dt>
            <dd className="font-semibold">
              aproximativ {formatDuration(c.durationMin)}
            </dd>
          </div>
        </dl>
        <span
          className={cn(
            "mt-auto inline-flex items-center gap-2 font-bold font-heading text-lg uppercase tracking-wide",
            a.text,
          )}
        >
          Deschide cursul
          <ArrowRight
            className="size-5 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}
