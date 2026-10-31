import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ClassFolderView } from "@/components/lessons/class-folder-view";
import { DetailSkeleton } from "@/components/student-class/skeletons";
import { placeholderParams } from "@/lib/db/core";
import { getClassFolder } from "@/lib/db/lessons";
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
  const { classRoom: c } = await loadStudentClass(params);
  const data = await getClassFolder(c.id, lectie);
  if (!data) notFound();
  return <ClassFolderView data={data} base={`/clase/${c.id}/lectii`} />;
}
