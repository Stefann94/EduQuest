import type { Metadata } from "next";
import { Suspense } from "react";
import { CourseProblem } from "@/components/learning/course-problem";
import { DetailSkeleton } from "@/components/student-class/skeletons";
import { getLessonParams } from "@/lib/data/course-queries";

type Props = PageProps<"/mentor/invatare/[curs]/[lectie]/probleme/[problema]">;

export const metadata: Metadata = { title: "Problemă" };

export async function generateStaticParams() {
  const params = await getLessonParams();
  const problema = "00000000-0000-0000-0000-000000000000";
  return params.length > 0
    ? params.map((p) => ({ ...p, problema }))
    : [{ curs: "fara-cursuri", lectie: "fara-lectii", problema }];
}

export default function ProblemPage({ params }: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { curs, lectie, problema } = await params;
  return (
    <CourseProblem
      curs={curs}
      lectie={lectie}
      problema={problema}
      base="/mentor/invatare"
      mentor
    />
  );
}
