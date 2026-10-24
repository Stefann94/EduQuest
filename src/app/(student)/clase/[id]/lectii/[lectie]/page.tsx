import { ArrowLeft, ArrowRight, FolderOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { LessonNumber, LessonTitle } from "@/components/lessons/lesson-card";
import { LessonItemSection } from "@/components/lessons/lesson-item-view";
import { DetailSkeleton } from "@/components/student-class/skeletons";
import { buttonVariants } from "@/components/ui/button";
import { placeholderParams } from "@/lib/db/core";
import { getClassLessons, lessonLabel } from "@/lib/db/lessons";
import { loadStudentClass } from "../../load-class";

type Props = PageProps<"/clase/[id]/lectii/[lectie]">;

export const metadata: Metadata = { title: "Lecție" };

export function generateStaticParams() {
  return placeholderParams("lectie");
}

export default function ClassLessonPage({ params }: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { lectie } = await params;
  const { classRoom: c } = await loadStudentClass(params);
  const lessons = await getClassLessons(c.id);
  const index = lessons.findIndex((l) => l.id === lectie);
  if (index < 0) notFound();
  const l = lessons[index];
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const base = `/clase/${c.id}/lectii`;

  return (
    <article className="grid gap-8">
      <header className="flex items-start gap-4">
        <LessonNumber lesson={l} className="size-16 text-2xl" />
        <div className="min-w-0">
          <h1 className="text-3xl leading-tight sm:text-4xl">
            <LessonTitle lesson={l} />
          </h1>
          {l.summary ? (
            <p className="mt-2 max-w-2xl text-muted-foreground">{l.summary}</p>
          ) : null}
        </div>
      </header>

      {l.items.length > 0 ? (
        <div className="grid gap-10">
          {l.items.map((item) => (
            <LessonItemSection key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="Lecția nu are încă materiale"
          description="Mentorul le adaugă în curând. Revino mai târziu."
        />
      )}

      <nav
        aria-label="Alte lecții"
        className="flex flex-wrap justify-between gap-3 border-t pt-6"
      >
        {prev ? (
          <Link
            href={`${base}/${prev.id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft /> {lessonLabel(prev)}
          </Link>
        ) : (
          <Link href={base} className={buttonVariants({ variant: "ghost" })}>
            <ArrowLeft /> Toate lecțiile
          </Link>
        )}
        {next ? (
          <Link href={`${base}/${next.id}`} className={buttonVariants()}>
            {lessonLabel(next)} <ArrowRight />
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
