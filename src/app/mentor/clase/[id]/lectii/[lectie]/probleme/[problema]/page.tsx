import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ClassProblemView } from "@/components/lessons/class-folder-view";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { placeholderParams } from "@/lib/db/core";
import { getClassFolder } from "@/lib/db/lessons";
import { loadMentorClass } from "../../../../load-class";

type Props =
  PageProps<"/mentor/clase/[id]/lectii/[lectie]/probleme/[problema]">;

export const metadata: Metadata = { title: "Problemă" };

export function generateStaticParams() {
  return placeholderParams("problema");
}

export default function MentorClassProblemPage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton rows={4} />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { lectie, problema } = await params;
  const { me, classRoom: c } = await loadMentorClass(params);
  const data = await getClassFolder(c.id, lectie, { includeHidden: true });
  if (!data) notFound();
  const view = ClassProblemView({
    data,
    problemId: problema,
    base: `/mentor/clase/${c.id}/lectii`,
    editHref:
      data.root.authorId === me.id
        ? `/mentor/materiale/${data.folder.id}`
        : undefined,
  });
  if (!view) notFound();
  return view;
}
