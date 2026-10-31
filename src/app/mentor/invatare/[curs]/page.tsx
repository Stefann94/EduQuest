import type { Metadata } from "next";
import { Suspense } from "react";
import { CourseOverview } from "@/components/learning/course-overview";
import { DetailSkeleton } from "@/components/student-class/skeletons";
import { getCourses } from "@/lib/data/course-queries";

type Props = PageProps<"/mentor/invatare/[curs]">;

export const metadata: Metadata = { title: "Curs" };

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.length > 0
    ? courses.map((c) => ({ curs: c.slug }))
    : [{ curs: "fara-cursuri" }];
}

export default function MentorCoursePage({ params }: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { curs } = await params;
  return (
    <CourseOverview
      curs={curs}
      base="/mentor/invatare"
      home="/mentor/invatare"
      homeLabel="Învățare"
    />
  );
}
