import { BookOpen, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { LessonCard } from "@/components/lessons/lesson-card";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { buttonVariants } from "@/components/ui/button";
import { placeholderParams } from "@/lib/db/core";
import { getClassLessons } from "@/lib/db/lessons";
import { loadMentorClass } from "../load-class";

export const metadata: Metadata = { title: "Lecțiile clasei" };

type Props = PageProps<"/mentor/clase/[id]/lectii">;

export function generateStaticParams() {
  return placeholderParams("id");
}

export default function ClassLessonsPage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton rows={4} />}>
      <Lessons params={params} />
    </Suspense>
  );
}

async function Lessons({ params }: { params: Props["params"] }) {
  const { classRoom: c } = await loadMentorClass(params);
  const lessons = await getClassLessons(c.id, { includeHidden: true });
  const add = (
    <Link
      href={`/mentor/materiale/nou?clasa=${c.id}`}
      className={buttonVariants()}
    >
      <Plus aria-hidden="true" /> Lecție nouă în clasă
    </Link>
  );

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl">Lecții</h2>
          <p className="text-muted-foreground text-sm">
            Așa le văd elevii, în ordinea numerelor. Lecțiile ascunse le vezi
            doar tu. Deschide un folder ca să-l vezi ca elevul; numărul,
            afișarea și materialele le schimbi din „Editează folderul”.
          </p>
        </div>
        {add}
      </div>
      {lessons.length > 0 ? (
        <ul className="stagger grid gap-4">
          {lessons.map((l) => (
            <li key={l.id}>
              <LessonCard
                lesson={l}
                href={`/mentor/clase/${c.id}/lectii/${l.id}`}
                showVisibility
                problemPages
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Clasa nu are încă lecții"
          description="Creează o lecție nouă sau adaugă în clasă una din biblioteca ta."
          action={add}
        />
      )}
    </div>
  );
}
