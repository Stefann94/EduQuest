import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { LessonCard } from "@/components/lessons/lesson-card";
import { SectionSkeleton } from "@/components/student-class/skeletons";
import { getClassLessons } from "@/lib/db/lessons";
import { loadStudentClass } from "../load-class";

type Props = PageProps<"/clase/[id]/lectii">;

export const metadata: Metadata = { title: "Materialele clasei" };

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
        title="Niciun material încă"
        description="Când mentorul publică un capitol pentru clasă (un folder cu PDF-uri, probleme rezolvate și subfoldere), îl găsești aici."
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
