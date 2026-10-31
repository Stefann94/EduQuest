import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ClassProblemView } from "@/components/lessons/class-folder-view";
import { DetailSkeleton } from "@/components/student-class/skeletons";
import { placeholderParams } from "@/lib/db/core";
import { getClassFolder } from "@/lib/db/lessons";
import { loadStudentClass } from "../../../../load-class";

type Props = PageProps<"/clase/[id]/lectii/[lectie]/probleme/[problema]">;

export const metadata: Metadata = { title: "Problemă rezolvată" };

export function generateStaticParams() {
  return placeholderParams("problema");
}

export default function ClassProblemPage({ params }: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { lectie, problema } = await params;
  const { classRoom: c } = await loadStudentClass(params);
  const data = await getClassFolder(c.id, lectie);
  if (!data) notFound();
  const view = ClassProblemView({
    data,
    problemId: problema,
    base: `/clase/${c.id}/lectii`,
  });
  if (!view) notFound();
  return view;
}
