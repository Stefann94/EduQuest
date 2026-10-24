import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { QuizForm } from "@/components/mentor-content/quiz-form";
import { FormSkeleton } from "@/components/mentor-content/skeletons";
import { requireUser } from "@/lib/auth";
import { getMentorClasses } from "@/lib/db/classes";
import { getMentorLessons } from "@/lib/db/lessons";

export const metadata: Metadata = { title: "Quiz nou" };

export default function NewQuizPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        back={{ href: "/mentor/quiz", label: "Quiz-uri" }}
        title="Quiz nou"
        description="Întrebări cu variante, fiecare etichetată pe lecția pe care o verifică."
      />
      <Suspense fallback={<FormSkeleton />}>
        <Form />
      </Suspense>
    </div>
  );
}

async function Form() {
  const me = await requireUser("mentor");
  const [lessons, classes] = await Promise.all([
    getMentorLessons(me.id),
    getMentorClasses(me.id),
  ]);
  return (
    <QuizForm
      draft={{
        title: "",
        description: "",
        lessonIds: [],
        xp: 3,
        timeLimitSec: null,
        classIds: [],
        questions: [],
      }}
      lessons={lessons.map((l) => ({ id: l.id, title: l.title }))}
      classes={classes.active.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
