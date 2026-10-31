import type { Metadata } from "next";
import { Suspense } from "react";
import { CourseOverview } from "@/components/learning/course-overview";
import { DetailSkeleton } from "@/components/student-class/skeletons";
import { getCourses } from "@/lib/data/course-queries";

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
  return (
    <CourseOverview
      curs={curs}
      base="/invatare/cursuri"
      home="/invatare"
      homeLabel="Învățare"
    />
  );
}
