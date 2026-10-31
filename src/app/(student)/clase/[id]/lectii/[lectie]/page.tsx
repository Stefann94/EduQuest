import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ClassFolderView } from "@/components/lessons/class-folder-view";
import { StudentLessonQuizzes } from "@/components/lessons/lesson-quizzes";
import { DetailSkeleton } from "@/components/student-class/skeletons";
import { placeholderParams } from "@/lib/db/core";
import { getClassFolder } from "@/lib/db/lessons";
import { getStudentQuizzes } from "@/lib/db/quizzes";
import { loadStudentClass } from "../../load-class";

type Props = PageProps<"/clase/[id]/lectii/[lectie]">;

export const metadata: Metadata = { title: "Materiale" };

export function generateStaticParams() {
  return placeholderParams("lectie");
}

export default function ClassFolderPage({ params }: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { lectie } = await params;
  const { viewer: me, classRoom: c } = await loadStudentClass(params);
  const [data, quizzes] = await Promise.all([
    getClassFolder(c.id, lectie),
    getStudentQuizzes(me.id),
  ]);
  if (!data) notFound();
  const folderId = data.folder.id;
  return (
    <div className="grid gap-10">
      <ClassFolderView data={data} base={`/clase/${c.id}/lectii`} />
      <StudentLessonQuizzes
        quizzes={quizzes.filter(
          (q) => q.classIds.includes(c.id) && q.lessonIds.includes(folderId),
        )}
      />
    </div>
  );
}
