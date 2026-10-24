import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { NewLessonForm } from "@/components/lesson-editor/new-lesson-form";
import { FormSkeleton } from "@/components/mentor-content/skeletons";
import { requireUser } from "@/lib/auth";
import { getMentorClasses } from "@/lib/db/classes";
import { nextLessonNumber } from "@/lib/db/lessons";

export const metadata: Metadata = { title: "Lecție nouă" };

export default function NewLessonPage({
  searchParams,
}: PageProps<"/mentor/materiale/nou">) {
  return (
    <div className="grid gap-6">
      <PageHeader
        back={{ href: "/mentor/materiale", label: "Lecții și materiale" }}
        title="Lecție nouă"
        description="Pornești cu titlul; materialele (lecție scrisă, PDF, link, video, probleme) le adaugi în pasul următor."
      />
      <Suspense fallback={<FormSkeleton />}>
        <Form searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Form({
  searchParams,
}: {
  searchParams: PageProps<"/mentor/materiale/nou">["searchParams"];
}) {
  const { clasa } = await searchParams;
  const me = await requireUser("mentor");
  const { active } = await getMentorClasses(me.id);
  const classes = await Promise.all(
    active.map(async (c) => ({
      id: c.id,
      name: c.name,
      nextNumber: await nextLessonNumber(c.id),
    })),
  );
  return (
    <NewLessonForm
      classes={classes}
      preselected={typeof clasa === "string" ? clasa : undefined}
    />
  );
}
