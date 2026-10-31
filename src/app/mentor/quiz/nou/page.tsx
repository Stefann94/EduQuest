import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { QuizForm } from "@/components/mentor-content/quiz-form";
import { FormSkeleton } from "@/components/mentor-content/skeletons";
import { requireUser } from "@/lib/auth";
import { getMentorClasses } from "@/lib/db/classes";
import { getMentorLessons } from "@/lib/db/lessons";

export const metadata: Metadata = { title: "Quiz nou" };

type Props = PageProps<"/mentor/quiz/nou">;

/** `?mod=live|clase` alege tipul dinainte; `?clasa=<id>` bifează clasa (quiz pentru clase). */
export default function NewQuizPage({ searchParams }: Props) {
  return (
    <div className="grid gap-6">
      <PageHeader
        back={{ href: "/mentor/quiz", label: "Quiz-uri" }}
        title="Quiz nou"
        description="Live, jucat împreună cu un cod, sau pentru clase, rezolvat oricând."
      />
      <Suspense fallback={<FormSkeleton />}>
        <Form searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Form({ searchParams }: { searchParams: Props["searchParams"] }) {
  const { mod, clasa } = await searchParams;
  const me = await requireUser("mentor");
  const [lessons, classes] = await Promise.all([
    getMentorLessons(me.id),
    getMentorClasses(me.id),
  ]);
  const preselected = classes.active.find((c) => c.id === clasa);
  return (
    <QuizForm
      draft={{
        live: mod === "live",
        title: "",
        description: "",
        lessonIds: [],
        xp: 3,
        timeLimitSec: null,
        classIds: preselected ? [preselected.id] : [],
        questions: [],
      }}
      lessons={lessons.map((l) => ({ id: l.id, title: l.title }))}
      classes={classes.active.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
