import type { Metadata } from "next";
import { Suspense } from "react";
import { CourseLesson } from "@/components/learning/course-lesson";
import { DetailSkeleton } from "@/components/student-class/skeletons";
import { getLessonParams } from "@/lib/data/course-queries";

type Props = PageProps<"/invatare/cursuri/[curs]/[lectie]">;

export const metadata: Metadata = { title: "Lecție" };

export async function generateStaticParams() {
  const params = await getLessonParams();
  return params.length > 0
    ? params
    : [{ curs: "fara-cursuri", lectie: "fara-lectii" }];
}

export default function LessonPage({ params }: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { curs, lectie } = await params;
  return <CourseLesson curs={curs} lectie={lectie} base="/invatare/cursuri" />;
}
