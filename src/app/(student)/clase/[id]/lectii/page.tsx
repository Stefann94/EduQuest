import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { LessonCard } from "@/components/lessons/lesson-card";
import { SectionSkeleton } from "@/components/student-class/skeletons";
import { getClassLessons } from "@/lib/db/lessons";
import { loadStudentClass } from "../load-class";

type Props = PageProps<"/clase/[id]/lectii">;

export const metadata: Metadata = { title: "Lecțiile clasei" };

export default function ClassLessonsPage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton rows={4} />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { classRoom: c } = await loadStudentClass(params);
  const lessons = await getClassLessons(c.id);

  if (lessons.length === 0)
    return (
      <EmptyState
        icon={BookOpen}
        title="Nicio lecție încă"
        description="Când mentorul publică o lecție pentru clasă, o găsești aici, cu toate materialele ei."
      />
    );

  return (
    <ul className="stagger grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {lessons.map((l) => (
        <li key={l.id}>
          <LessonCard lesson={l} href={`/clase/${c.id}/lectii/${l.id}`} />
        </li>
      ))}
    </ul>
  );
}
