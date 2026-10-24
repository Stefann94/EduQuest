import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { LessonEditor } from "@/components/lesson-editor/lesson-editor";
import { FormSkeleton } from "@/components/mentor-content/skeletons";
import { requireUser } from "@/lib/auth";
import { getMentorClasses } from "@/lib/db/classes";
import { placeholderParams } from "@/lib/db/core";
import { getLessonForEditor } from "@/lib/db/lessons";

export const metadata: Metadata = { title: "Editează lecția" };

type Props = PageProps<"/mentor/materiale/[id]">;

export function generateStaticParams() {
  return placeholderParams("id");
}

export default function EditLessonPage({ params }: Props) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const me = await requireUser("mentor");
  const [lesson, classes] = await Promise.all([
    getLessonForEditor(me.id, id),
    getMentorClasses(me.id),
  ]);
  if (!lesson) notFound();

  return (
    <div className="grid gap-6">
      <PageHeader
        back={{ href: "/mentor/materiale", label: "Lecții și materiale" }}
        title={lesson.title}
        description="Materialele lecției, ce văd elevii și în ce clase apare."
      />
      <LessonEditor
        lesson={lesson}
        classes={[...classes.active, ...classes.archived].map((c) => ({
          id: c.id,
          name: c.name,
          archived: c.status === "archived",
        }))}
      />
    </div>
  );
}
