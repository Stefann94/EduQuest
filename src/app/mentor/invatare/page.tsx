import { ArrowRight, Clock, GraduationCap, ListOrdered } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { ACCENT } from "@/components/learning/accent";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { requireUser } from "@/lib/auth";
import { getCourses } from "@/lib/data/course-queries";
import { formatDuration, plural } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Învățare" };

export default function MentorLearningPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Învățare"
        description="Cursurile din platformă, cu lecțiile pe care le văd elevii. Aici vezi doar lecțiile: rezolvările exercițiilor și ale problemelor nu apar."
      />
      <Suspense fallback={<SectionSkeleton />}>
        <Courses />
      </Suspense>
    </div>
  );
}

async function Courses() {
  await requireUser("mentor");
  const courses = await getCourses();
  if (courses.length === 0)
    return (
      <EmptyState
        icon={GraduationCap}
        title="Niciun curs încă"
        description="Cursurile apar aici imediat ce sunt publicate."
      />
    );
  return (
    <ul className="grid gap-4">
      {courses.map((c) => {
        const a = ACCENT[c.accent];
        return (
          <li key={c.id}>
            <Link
              href={`/mentor/invatare/${c.slug}`}
              className={cn(
                "group relative flex cut flex-col gap-4 overflow-hidden p-6 text-white outline-none transition-[filter] hover:brightness-110 focus-visible:ring-3 focus-visible:ring-ring/70 sm:flex-row sm:items-center",
                a.gradient,
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block font-bold font-heading text-sm uppercase tracking-widest opacity-90">
                  Curs · {c.topic} · {c.level}
                </span>
                <span className="mt-1 block font-extrabold font-heading text-3xl uppercase leading-tight">
                  {c.title}
                </span>
                <span className="mt-1 block text-white/90">{c.subtitle}</span>
                <span className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-semibold text-sm">
                  <span className="flex items-center gap-1.5">
                    <ListOrdered className="size-4" aria-hidden="true" />
                    {plural(c.lessonCount, "lecție", "lecții")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4" aria-hidden="true" />
                    aproximativ {formatDuration(c.durationMin)}
                  </span>
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 font-bold font-heading uppercase tracking-wide">
                Vezi lecțiile
                <ArrowRight
                  className="size-5 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
